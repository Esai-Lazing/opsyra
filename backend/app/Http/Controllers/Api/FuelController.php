<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Models\FuelStock;
use App\Models\FuelConsommation;
use App\Models\TruckAssignment;
use App\Models\Notification;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Storage;

class FuelController extends Controller
{
    public function getStock()
    {
        return response()->json(FuelStock::first());
    }

    public function updateStock(Request $request)
    {
        $validated = $request->validate([
            'quantite_ajoutee' => 'required|numeric|min:0',
        ]);

        $stock = FuelStock::first();
        $stock->quantite_totale += $validated['quantite_ajoutee'];
        $stock->save();

        return response()->json($stock);
    }

    public function getConsommations()
    {
        return response()->json(FuelConsommation::with(['engin', 'camion', 'personnel'])->latest()->get());
    }

    public function checkTodayReport(Request $request)
    {
        $user = $request->user();
        
        // Pour les admins, on peut vérifier s'ils ont une affectation active
        // et vérifier le rapport pour cette affectation
        if ($user->hasRole('Admin') || $user->hasRole('Sous-admin')) {
            // Les admins peuvent voir s'ils ont soumis un rapport aujourd'hui
            // ou on peut retourner false car ils ne sont pas des chauffeurs
            $report = FuelConsommation::where('personnel_id', $user->id)
                ->where('quantite', 0)
                ->whereDate('date_consommation', now()->toDateString())
                ->first();
            
            return response()->json(['submitted' => !!$report, 'report' => $report]);
        }
        
        // Pour les chauffeurs, logique normale
        $report = FuelConsommation::where('personnel_id', $user->id)
            ->where('quantite', 0)
            ->whereDate('date_consommation', now()->toDateString())
            ->first();

        return response()->json(['submitted' => !!$report, 'report' => $report]);
    }

    /**
     * Rapport journalier du chauffeur (quantité restante + photo avec EXIF)
     */
    public function dailyReport(Request $request)
    {
        $user = $request->user();
        $isAdmin = $user->hasRole('Admin') || $user->hasRole('Sous-admin');
        $isChauffeur = $user->hasRole('Chauffeur');

        if (!$isChauffeur && !$isAdmin) {
            return response()->json(['message' => 'Réservé aux chauffeurs et administrateurs.'], 403);
        }

        // Vérifier si un rapport a déjà été soumis AUJOURD'HUI
        $alreadySubmitted = FuelConsommation::where('personnel_id', $user->id)
            ->where('quantite', 0) // C'est un rapport, pas une recharge
            ->whereDate('date_consommation', now()->toDateString())
            ->exists();

        if ($alreadySubmitted) {
            return response()->json([
                'message' => "Vous avez déjà soumis votre rapport pour aujourd'hui. Un seul rapport par jour est autorisé."
            ], 422);
        }

        $request->validate([
            'quantite_restante' => 'required|numeric|min:0',
            'image' => 'required|image|mimes:jpeg,png,jpg|max:15360',
            'camion_id' => 'nullable|exists:camions,id',
            'engin_id' => 'nullable|exists:engins,id',
        ], [
            'image.image' => "Le fichier doit être une image valide.",
            'image.max' => "L'image est trop lourde (max 15 Mo).",
            'image.mimes' => "Seuls les formats JPG, JPEG et PNG sont acceptés."
        ]);

        // Pour les admins, permettre la sélection d'un véhicule
        $assignment = null;
        $camionId = null;
        $enginId = null;

        if ($isAdmin) {
            // Si un véhicule est spécifié dans la requête, l'utiliser
            if ($request->camion_id) {
                $camionId = $request->camion_id;
            } elseif ($request->engin_id) {
                $enginId = $request->engin_id;
            } else {
                // Sinon, chercher une affectation active
                $assignment = $user->assignments()->where('is_active', true)->first();
                if ($assignment) {
                    $camionId = $assignment->camion_id;
                    $enginId = $assignment->engin_id;
                } else {
                    return response()->json(['message' => 'Veuillez sélectionner un véhicule ou avoir une affectation active.'], 403);
                }
            }
        } else {
            // Pour les chauffeurs, utiliser l'affectation active
            $assignment = $user->assignments()->where('is_active', true)->first();
            if (!$assignment) {
                return response()->json(['message' => 'Aucun camion assigné actuellement.'], 403);
            }
            $camionId = $assignment->camion_id;
            $enginId = $assignment->engin_id;
        }

        $file = $request->file('image');
        $filePath = $file->getRealPath();

        // Vérification de l'extension EXIF
        if (!function_exists('exif_read_data')) {
            return response()->json([
                'message' => "Le serveur n'est pas configuré pour lire les métadonnées d'images (EXIF). Veuillez contacter l'administrateur."
            ], 500);
        }

        // Extraction des données EXIF
        $exif = @exif_read_data($filePath);
        
        if (!$exif || !isset($exif['DateTimeOriginal'])) {
            return response()->json(['message' => 'L\'image doit contenir des metadata EXIF valides (date/heure de capture).'], 422);
        }

        $metadata = [
            'date_capture' => $exif['DateTimeOriginal'] ?? null,
            'modele_appareil' => ($exif['Make'] ?? '') . ' ' . ($exif['Model'] ?? ''),
            'exposition' => $exif['ExposureTime'] ?? null,
            'iso' => $exif['ISOSpeedRatings'] ?? null,
        ];

        $path = $file->store('fuel_reports', 'public');

        $consommation = FuelConsommation::create([
            'camion_id' => $camionId,
            'engin_id' => $enginId,
            'personnel_id' => $user->id,
            'quantite' => 0, // C'est un rapport de reste, pas une recharge
            'quantite_restante' => $request->quantite_restante,
            'date_consommation' => now(),
            'image_compteur_path' => $path,
            'image_metadata' => $metadata,
        ]);

        // Créer une notification pour les admins si c'est un chauffeur qui a créé le rapport
        if ($user->hasRole('Chauffeur')) {
            $vehicule = $consommation->camion ?? $consommation->engin;
            $vehiculeName = $vehicule ? ($vehicule->matricule ?? 'N/A') : 'N/A';
            
            Notification::create([
                'type' => 'fuel_report',
                'title' => 'Nouveau rapport de fuel',
                'message' => "{$user->name} a soumis un rapport journalier pour le véhicule {$vehiculeName} (Quantité restante: {$request->quantite_restante}L)",
                'user_id' => $user->id,
                'related_id' => $consommation->id,
                'related_type' => 'App\Models\FuelConsommation',
            ]);
        }

        return response()->json([
            'message' => 'Rapport journalier enregistré avec succès.',
            'report' => $consommation
        ], 201);
    }

    /**
     * Chargement de fuel (par Admin ou Gestionnaire fuel)
     */
    public function storeConsommation(Request $request)
    {
        $request->validate([
            'camion_id' => 'required|exists:camions,id',
            'personnel_id' => 'required|exists:users,id',
            'quantite' => 'required|numeric|min:0.1',
            'date_consommation' => 'required|date',
        ]);

        return DB::transaction(function () use ($request) {
            $stock = FuelStock::first();
            if ($stock->quantite_totale < $request->quantite) {
                return response()->json(['message' => 'Stock de fuel insuffisant'], 422);
            }

            $stock->quantite_totale -= $request->quantite;
            $stock->save();

            $consommation = FuelConsommation::create($request->all());
            return response()->json($consommation, 201);
        });
    }

    public function destroy($id)
    {
        $consommation = FuelConsommation::findOrFail($id);
        
        if ($consommation->image_compteur_path) {
            Storage::disk('public')->delete($consommation->image_compteur_path);
        }

        $consommation->delete();
        return response()->json(null, 204);
    }
}
