<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Models\Engin;
use Illuminate\Http\Request;

class EnginController extends Controller
{
    public function index()
    {
        return response()->json(Engin::all());
    }

    public function store(Request $request)
    {
        $validated = $request->validate([
            'nom' => 'required|string|max:255',
            'type' => 'required|string|max:255',
            'matricule' => 'required|string|unique:engins',
            'statut' => 'required|in:en service,panne,maintenance',
            'date_achat' => 'nullable|date',
        ]);

        $engin = Engin::create($validated);
        return response()->json($engin, 201);
    }

    public function show(Engin $engin)
    {
        return response()->json($engin->load(['fuelConsommations', 'incidents']));
    }

    public function update(Request $request, Engin $engin)
    {
        $validated = $request->validate([
            'nom' => 'string|max:255',
            'type' => 'string|max:255',
            'matricule' => 'string|unique:engins,matricule,' . $engin->id,
            'statut' => 'in:en service,panne,maintenance',
            'date_achat' => 'nullable|date',
        ]);

        $engin->update($validated);
        return response()->json($engin);
    }

    public function destroy(Engin $engin)
    {
        $engin->delete();
        return response()->json(null, 204);
    }
}
