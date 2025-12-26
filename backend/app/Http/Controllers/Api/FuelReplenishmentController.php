<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Models\FuelReplenishment;
use App\Models\FuelStock;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\DB;
use Carbon\Carbon;

class FuelReplenishmentController extends Controller
{
    public function index(Request $request)
    {
        $query = FuelReplenishment::with('user')->latest();

        if ($request->has('period')) {
            switch ($request->period) {
                case 'day':
                    $query->whereDate('date_approvisionnement', Carbon::today());
                    break;
                case 'week':
                    $query->whereBetween('date_approvisionnement', [Carbon::now()->startOfWeek(), Carbon::now()->endOfWeek()]);
                    break;
                case 'month':
                    $query->whereMonth('date_approvisionnement', Carbon::now()->month)
                          ->whereYear('date_approvisionnement', Carbon::now()->year);
                    break;
                case 'year':
                    $query->whereYear('date_approvisionnement', Carbon::now()->year);
                    break;
            }
        }

        return response()->json($query->get());
    }

    public function store(Request $request)
    {
        $request->validate([
            'quantite' => 'required|numeric|min:0.1',
            'date_approvisionnement' => 'required|date',
            'notes' => 'nullable|string'
        ]);

        return DB::transaction(function () use ($request) {
            $replenishment = FuelReplenishment::create([
                'user_id' => $request->user()->id,
                'quantite' => $request->quantite,
                'date_approvisionnement' => $request->date_approvisionnement,
                'notes' => $request->notes
            ]);

            // Mettre à jour le stock global
            $stock = FuelStock::first();
            if (!$stock) {
                $stock = FuelStock::create(['quantite_totale' => 0, 'seuil_alerte' => 500]);
            }
            $stock->quantite_totale += $request->quantite;
            $stock->save();

            return response()->json($replenishment->load('user'), 201);
        });
    }
}
