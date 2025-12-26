<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Models\Personnel;
use Illuminate\Http\Request;

class PersonnelController extends Controller
{
    public function index()
    {
        return response()->json(Personnel::all());
    }

    public function store(Request $request)
    {
        $validated = $request->validate([
            'nom' => 'required|string|max:255',
            'prenom' => 'required|string|max:255',
            'role' => 'required|in:Admin,Manager,Operateur',
            'statut' => 'required|in:actif,inactif',
            'date_embauche' => 'nullable|date',
        ]);

        $personnel = Personnel::create($validated);
        return response()->json($personnel, 201);
    }

    public function show(Personnel $personnel)
    {
        return response()->json($personnel->load(['fuelConsommations', 'incidents']));
    }

    public function update(Request $request, Personnel $personnel)
    {
        $validated = $request->validate([
            'nom' => 'string|max:255',
            'prenom' => 'string|max:255',
            'role' => 'in:Admin,Manager,Operateur',
            'statut' => 'in:actif,inactif',
            'date_embauche' => 'nullable|date',
        ]);

        $personnel->update($validated);
        return response()->json($personnel);
    }

    public function destroy(Personnel $personnel)
    {
        $personnel->delete();
        return response()->json(null, 204);
    }
}
