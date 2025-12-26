<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Models\Camion;
use Illuminate\Http\Request;

class CamionController extends Controller
{
    public function index()
    {
        return response()->json(Camion::all());
    }

    public function store(Request $request)
    {
        $validated = $request->validate([
            'matricule' => 'required|string|unique:camions',
            'modele' => 'required|string|max:255',
            'capacite' => 'required|integer',
            'consommation_moyenne' => 'required|numeric',
            'statut' => 'required|in:en service,panne,maintenance',
        ]);

        $camion = Camion::create($validated);
        return response()->json($camion, 201);
    }

    public function show(Camion $camion)
    {
        return response()->json($camion->load(['fuelConsommations', 'incidents']));
    }

    public function update(Request $request, Camion $camion)
    {
        $validated = $request->validate([
            'matricule' => 'string|unique:camions,matricule,' . $camion->id,
            'modele' => 'string|max:255',
            'capacite' => 'integer',
            'consommation_moyenne' => 'numeric',
            'statut' => 'in:en service,panne,maintenance',
        ]);

        $camion->update($validated);
        return response()->json($camion);
    }

    public function destroy(Camion $camion)
    {
        $camion->delete();
        return response()->json(null, 204);
    }
}
