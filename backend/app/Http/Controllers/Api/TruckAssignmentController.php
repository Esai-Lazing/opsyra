<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Models\TruckAssignment;
use App\Models\Camion;
use App\Models\Engin;
use App\Models\User;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Storage;

class TruckAssignmentController extends Controller
{
    public function index()
    {
        $assignments = TruckAssignment::with(['camion', 'user', 'engin'])->latest()->get();
        // Ajouter l'URL complète de la photo de profil pour chaque utilisateur
        $assignments->transform(function ($assignment) {
            if ($assignment->user && $assignment->user->photo_profil) {
                $assignment->user->photo_profil = Storage::disk('public')->url($assignment->user->photo_profil);
            }
            return $assignment;
        });
        return response()->json($assignments);
    }

    public function store(Request $request)
    {
        $request->validate([
            'camion_id' => 'nullable|exists:camions,id',
            'engin_id' => 'nullable|exists:engins,id',
            'user_id' => 'required|exists:users,id',
            'site_projet' => 'required|string',
            'date_debut' => 'required|date',
        ]);

        if (!$request->camion_id && !$request->engin_id) {
            return response()->json(['message' => 'Veuillez sélectionner un camion ou un engin.'], 422);
        }

        // Vérifier si l'utilisateur est déjà affecté à QUELQUE CHOSE d'actif
        $existingUserAssignment = TruckAssignment::where('user_id', $request->user_id)
            ->where('is_active', true)
            ->with(['camion', 'engin'])
            ->first();

        if ($existingUserAssignment) {
            $entity = $existingUserAssignment->camion ? "le camion " . $existingUserAssignment->camion->matricule : "l'engin " . $existingUserAssignment->engin->matricule;
            return response()->json([
                'message' => "Cet utilisateur est déjà affecté à {$entity}. Veuillez d'abord terminer son affectation actuelle."
            ], 422);
        }

        // Vérifier si le camion est déjà affecté
        if ($request->camion_id) {
            $existingCamionAssignment = TruckAssignment::where('camion_id', $request->camion_id)
                ->where('is_active', true)
                ->with('user')
                ->first();

            if ($existingCamionAssignment) {
                return response()->json([
                    'message' => "Ce camion est déjà affecté à {$existingCamionAssignment->user->name}. Veuillez d'abord terminer l'affectation en cours."
                ], 422);
            }
        }

        // Vérifier si l'engin est déjà affecté
        if ($request->engin_id) {
            $existingEnginAssignment = TruckAssignment::where('engin_id', $request->engin_id)
                ->where('is_active', true)
                ->with('user')
                ->first();

            if ($existingEnginAssignment) {
                return response()->json([
                    'message' => "Cet engin est déjà affecté à {$existingEnginAssignment->user->name}. Veuillez d'abord terminer l'affectation en cours."
                ], 422);
            }
        }

        return DB::transaction(function () use ($request) {
            $assignment = TruckAssignment::create($request->all() + ['is_active' => true]);

            if ($request->camion_id) {
                Camion::where('id', $request->camion_id)->update(['affectation_site' => $request->site_projet]);
            }

            $assignment = $assignment->load(['camion', 'user', 'engin']);
            if ($assignment->user && $assignment->user->photo_profil) {
                $assignment->user->photo_profil = Storage::disk('public')->url($assignment->user->photo_profil);
            }
            return response()->json($assignment, 201);
        });
    }

    public function update(Request $request, TruckAssignment $assignment)
    {
        $request->validate([
            'camion_id' => 'nullable|exists:camions,id',
            'engin_id' => 'nullable|exists:engins,id',
            'user_id' => 'required|exists:users,id',
            'site_projet' => 'required|string',
            'date_debut' => 'required|date',
        ]);

        if (!$request->camion_id && !$request->engin_id) {
            return response()->json(['message' => 'Veuillez sélectionner un camion ou un engin.'], 422);
        }

        // Vérifier si le NOUVEL utilisateur est déjà affecté ailleurs (si on change d'user)
        if ($request->user_id != $assignment->user_id) {
            $existingUserAssignment = TruckAssignment::where('user_id', $request->user_id)
                ->where('is_active', true)
                ->where('id', '!=', $assignment->id)
                ->first();

            if ($existingUserAssignment) {
                return response()->json(['message' => "Ce chauffeur est déjà affecté ailleurs."], 422);
            }
        }

        // Vérifier si le NOUVEAU camion est déjà affecté (si on change de camion)
        if ($request->camion_id && $request->camion_id != $assignment->camion_id) {
            $existingCamionAssignment = TruckAssignment::where('camion_id', $request->camion_id)
                ->where('is_active', true)
                ->where('id', '!=', $assignment->id)
                ->first();

            if ($existingCamionAssignment) {
                return response()->json(['message' => "Ce camion est déjà affecté à un autre chauffeur."], 422);
            }
        }

        // Idem pour engin
        if ($request->engin_id && $request->engin_id != $assignment->engin_id) {
            $existingEnginAssignment = TruckAssignment::where('engin_id', $request->engin_id)
                ->where('is_active', true)
                ->where('id', '!=', $assignment->id)
                ->first();

            if ($existingEnginAssignment) {
                return response()->json(['message' => "Cet engin est déjà affecté à un autre chauffeur."], 422);
            }
        }

        return DB::transaction(function () use ($request, $assignment) {
            $assignment->update($request->all());

            if ($request->camion_id) {
                Camion::where('id', $request->camion_id)->update(['affectation_site' => $request->site_projet]);
            }

            $assignment = $assignment->load(['camion', 'user', 'engin']);
            if ($assignment->user && $assignment->user->photo_profil) {
                $assignment->user->photo_profil = Storage::disk('public')->url($assignment->user->photo_profil);
            }
            return response()->json($assignment);
        });
    }

    public function deactivate(TruckAssignment $assignment)
    {
        $assignment->update([
            'is_active' => false,
            'date_fin' => now(),
        ]);

        return response()->json($assignment);
    }

    public function myAssignment(Request $request)
    {
        $assignment = TruckAssignment::where('user_id', $request->user()->id)
            ->where('is_active', true)
            ->with(['camion', 'engin'])
            ->first();

        return response()->json($assignment);
    }

    public function destroy(TruckAssignment $assignment)
    {
        $assignment->delete();
        return response()->json(null, 204);
    }
}
