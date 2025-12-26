<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Models\Incident;
use App\Models\Camion;
use App\Models\Notification;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Storage;

class IncidentController extends Controller
{
    /**
     * Normalise le statut pour le frontend (en cours -> en_cours)
     */
    private function normalizeStatusForFrontend($statut)
    {
        return $statut === 'en cours' ? 'en_cours' : $statut;
    }
    
    /**
     * Normalise le statut pour la base de données (en_cours -> en cours)
     */
    private function normalizeStatusForDatabase($statut)
    {
        return $statut === 'en_cours' ? 'en cours' : $statut;
    }
    
    /**
     * Transforme un incident pour le frontend
     */
    private function transformIncidentForFrontend($incident)
    {
        $incidentArray = $incident->toArray();
        
        // Normaliser le statut
        if (isset($incidentArray['statut'])) {
            $incidentArray['statut'] = $this->normalizeStatusForFrontend($incidentArray['statut']);
        }
        
        // Ajouter camion ou engin selon le type
        if ($incident->incidentable) {
            if ($incident->incidentable_type === 'App\Models\Camion') {
                $incidentArray['camion'] = $incident->incidentable;
            } elseif ($incident->incidentable_type === 'App\Models\Engin') {
                $incidentArray['engin'] = $incident->incidentable;
            }
        } else {
            // S'assurer que camion et engin sont null si incidentable est null
            $incidentArray['camion'] = null;
            $incidentArray['engin'] = null;
        }
        
        // Ajouter signale_par comme alias de user (avec fallback)
        $incidentArray['signale_par'] = $incident->user ?: (object)['name' => 'Inconnu', 'id' => null];
        
        return $incidentArray;
    }
    
    public function index(Request $request)
    {
        $user = $request->user();
        
        // Si c'est un chauffeur, filtrer les incidents
        if ($user->hasRole('Chauffeur')) {
            // Récupérer l'affectation active du chauffeur
            $assignment = $user->assignments()->where('is_active', true)->first();
            
            $query = Incident::with(['incidentable', 'user'])
                ->where(function ($q) use ($user, $assignment) {
                    // Incidents créés par le chauffeur
                    $q->where('user_id', $user->id);
                    
                    // Incidents du camion assigné au chauffeur (si assigné)
                    if ($assignment && $assignment->camion_id) {
                        $q->orWhere(function ($subQ) use ($assignment) {
                            $subQ->where('incidentable_type', 'App\Models\Camion')
                                 ->where('incidentable_id', $assignment->camion_id);
                        });
                    }
                    
                    // Incidents de l'engin assigné au chauffeur (si assigné)
                    if ($assignment && $assignment->engin_id) {
                        $q->orWhere(function ($subQ) use ($assignment) {
                            $subQ->where('incidentable_type', 'App\Models\Engin')
                                 ->where('incidentable_id', $assignment->engin_id);
                        });
                    }
                });
            
            $incidents = $query->latest()->get();
        } else {
            // Pour les admins et autres rôles, retourner tous les incidents
            $incidents = Incident::with(['incidentable', 'user'])->latest()->get();
        }
        
        // Transformer les données pour faciliter l'accès côté frontend
        $incidents = $incidents->map(function ($incident) {
            return $this->transformIncidentForFrontend($incident);
        });
        
        return response()->json($incidents);
    }

    public function store(Request $request)
    {
        $user = $request->user();
        
        $request->validate([
            'titre' => 'required|string|max:255',
            'description' => 'required|string',
            'gravite' => 'required|in:faible,moyenne,elevee',
            'incidentable_id' => 'required|integer',
            'incidentable_type' => 'required|string',
            'date_incident' => 'required|date',
            'causes' => 'nullable|string',
            'actions_effectuees' => 'nullable|string',
            'temps_estime' => 'nullable|string',
            'image' => 'nullable|image|max:5120', // 5MB max
        ]);

        $data = $request->all();
        $data['statut'] = 'ouvert';
        $data['user_id'] = $user->id; // Enregistrer qui a fait le rapport

        if ($request->hasFile('image')) {
            $path = $request->file('image')->store('incidents', 'public');
            $data['image_path'] = $path;
        }

        // Si c'est un chauffeur, on vérifie qu'il déclare pour son camion assigné
        if ($user->hasRole('Chauffeur') && $request->incidentable_type === 'App\Models\Camion') {
            $assignment = $user->assignments()->where('is_active', true)->first();
            if (!$assignment || $assignment->camion_id != $request->incidentable_id) {
                return response()->json(['message' => 'Vous ne pouvez déclarer un incident que pour votre camion assigné.'], 403);
            }
        }

        $incident = Incident::create($data);
        
        // Créer une notification pour les admins si c'est un chauffeur qui a créé l'incident
        if ($user->hasRole('Chauffeur')) {
            $vehicule = $incident->incidentable;
            $vehiculeName = $vehicule ? ($vehicule->matricule ?? 'N/A') : 'N/A';
            
            Notification::create([
                'type' => 'incident',
                'title' => 'Nouvel incident signalé',
                'message' => "{$user->name} a signalé un incident ({$incident->titre}) pour le véhicule {$vehiculeName}",
                'user_id' => $user->id,
                'related_id' => $incident->id,
                'related_type' => 'App\Models\Incident',
            ]);
        }
        
        // Transformer la réponse pour le frontend
        $incident->load(['incidentable', 'user']);
        $incidentArray = $this->transformIncidentForFrontend($incident);
        
        return response()->json($incidentArray, 201);
    }

    public function update(Request $request, Incident $incident)
    {
        if (!$request->user()->hasAnyRole(['Admin', 'Sous-admin'])) {
            return response()->json(['message' => 'Action réservée aux administrateurs.'], 403);
        }

        $request->validate([
            'statut' => 'in:ouvert,en_cours,en cours,resolu',
            'gravite' => 'in:faible,moyenne,elevee',
        ]);

        // Normaliser le statut (en_cours -> en cours pour la base de données)
        $data = $request->only(['statut', 'gravite', 'description']);
        if (isset($data['statut'])) {
            $data['statut'] = $this->normalizeStatusForDatabase($data['statut']);
        }
        
        $incident->update($data);
        
        // Transformer la réponse pour le frontend
        $incident->load(['incidentable', 'user']);
        $incidentArray = $this->transformIncidentForFrontend($incident);
        
        return response()->json($incidentArray);
    }

    public function destroy(Incident $incident)
    {
        if (!request()->user()->hasAnyRole(['Admin', 'Sous-admin'])) {
            return response()->json(['message' => 'Action réservée aux administrateurs.'], 403);
        }

        if ($incident->image_path) {
            Storage::disk('public')->delete($incident->image_path);
        }
        $incident->delete();
        return response()->json(null, 204);
    }
}
