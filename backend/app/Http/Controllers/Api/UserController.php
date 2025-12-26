<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Models\User;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Hash;
use Illuminate\Support\Facades\Storage;
use Illuminate\Validation\Rule;
use Spatie\Permission\Models\Role;

class UserController extends Controller
{
    public function index()
    {
        $users = User::with('roles')->get();
        // Ajouter l'URL complète de la photo de profil
        $users->transform(function ($user) {
            if ($user->photo_profil) {
                // Utiliser Storage::url() qui génère l'URL correcte basée sur la config
                $user->photo_profil = Storage::disk('public')->url($user->photo_profil);
            }
            return $user;
        });
        return response()->json($users);
    }

    public function store(Request $request)
    {
        $request->validate([
            'name' => 'required|string|max:255',
            'email' => 'required|string|email|max:255|unique:users',
            'password' => 'required|string|min:8',
            'role' => ['required', Rule::in(['Sous-admin', 'Chauffeur', 'Gestionnaire fuel'])],
            'telephone' => 'nullable|string|max:30',
            'adresse' => 'nullable|string|max:255',
            'date_embauche' => 'nullable|date',
        ]);

        $user = User::create([
            'name' => $request->name,
            'email' => $request->email,
            'password' => Hash::make($request->password),
            'telephone' => $request->telephone,
            'adresse' => $request->adresse,
            'date_embauche' => $request->date_embauche,
        ]);

        $user->assignRole($request->role);

        $user = $user->load('roles');
        if ($user->photo_profil) {
            $user->photo_profil = Storage::disk('public')->url($user->photo_profil);
        }
        return response()->json($user, 201);
    }

    public function update(Request $request, User $user)
    {
        // Seul l'Admin peut modifier un autre Admin (non applicable ici car on restreint les rôles créables)
        // Mais l'Admin peut bloquer un Sous-admin
        
        $request->validate([
            'name' => 'string|max:255',
            'email' => ['email', Rule::unique('users')->ignore($user->id)],
            'is_blocked' => 'boolean',
            'role' => [Rule::in(['Sous-admin', 'Chauffeur', 'Gestionnaire fuel'])],
            'telephone' => 'nullable|string|max:30',
            'adresse' => 'nullable|string|max:255',
            'date_embauche' => 'nullable|date',
        ]);

        if ($request->has('name')) $user->name = $request->name;
        if ($request->has('email')) $user->email = $request->email;
        if ($request->has('is_blocked')) $user->is_blocked = $request->is_blocked;
        if ($request->has('telephone')) $user->telephone = $request->telephone;
        if ($request->has('adresse')) $user->adresse = $request->adresse;
        if ($request->has('date_embauche')) $user->date_embauche = $request->date_embauche;

        if ($request->has('role')) {
            $user->syncRoles([$request->role]);
        }

        $user->save();

        $user = $user->load('roles');
        if ($user->photo_profil) {
            $user->photo_profil = Storage::disk('public')->url($user->photo_profil);
        }
        return response()->json($user);
    }

    public function destroy(User $user)
    {
        // Empêcher la suppression du Super Admin (ID 1 par exemple)
        if ($user->id === 1 || $user->hasRole('Admin')) {
            return response()->json(['message' => 'Impossible de supprimer un administrateur principal.'], 403);
        }

        $user->delete();
        return response()->json(null, 204);
    }
}
