<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Models\Engin;
use App\Models\Camion;
use App\Models\FuelStock;
use App\Models\FuelConsommation;
use App\Models\Incident;
use App\Models\TruckAssignment;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\DB;

class DashboardController extends Controller
{
    public function index(Request $request)
    {
        $user = $request->user();

        // Si c'est un admin, sous-admin ou gestionnaire fuel, vue globale (partielle pour le gestionnaire)
        if ($user->hasAnyRole(['Admin', 'Sous-admin', 'Gestionnaire fuel'])) {
            $kpis = [
                'total_engins' => Engin::count(),
                'total_camions' => Camion::count(),
                'total_personnel' => \App\Models\User::count(),
                'fuel_stock' => FuelStock::first()->quantite_totale ?? 0,
                'incidents_ouverts' => Incident::where('statut', '!=', 'resolu')->count(),
            ];

            $fuel_stats = FuelConsommation::select(
                DB::raw('DATE(date_consommation) as date'),
                DB::raw('SUM(quantite) as total')
            )
                ->groupBy('date')
                ->orderBy('date', 'desc')
                ->limit(7)
                ->get();

            $incident_stats = Incident::select('gravite', DB::raw('count(*) as total'))
                ->groupBy('gravite')
                ->get();

            return response()->json([
                'role' => $user->hasRole('Gestionnaire fuel') ? 'fuel_manager' : 'admin',
                'kpis' => $kpis,
                'fuel_stats' => $fuel_stats,
                'incident_stats' => $incident_stats,
            ]);
        }

        // Si c'est un chauffeur, vue limitée à ses activités
        if ($user->hasRole('Chauffeur')) {
            $assignment = TruckAssignment::where('user_id', $user->id)
                ->where('is_active', true)
                ->first();

            $kpis = [
                'ma_consommation' => FuelConsommation::where('personnel_id', $user->id)->sum('quantite'),
                'mes_incidents' => $assignment ? Incident::where('incidentable_id', $assignment->camion_id ?? $assignment->engin_id)->count() : 0,
                'camion_assigne' => $assignment ? ($assignment->camion->matricule ?? $assignment->engin->matricule) : 'Aucun',
                'site_actuel' => $assignment->site_projet ?? 'Non affecté',
            ];

            return response()->json([
                'role' => 'chauffeur',
                'kpis' => $kpis,
                'fuel_stats' => [],
                'incident_stats' => [],
            ]);
        }

        return response()->json(['message' => 'Rôle non géré'], 403);
    }
}
