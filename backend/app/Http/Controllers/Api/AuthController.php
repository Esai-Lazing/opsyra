<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Models\User;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Hash;
use Illuminate\Support\Facades\Storage;
use Illuminate\Validation\ValidationException;
use Illuminate\Validation\Rule;

class AuthController extends Controller
{
    public function login(Request $request)
    {
        $request->validate([
            'email' => 'required|email',
            'password' => 'required',
        ]);

        $user = User::where('email', $request->email)->first();

        if (!$user || !Hash::check($request->password, $user->password)) {
            throw ValidationException::withMessages([
                'email' => ['Les identifiants sont incorrects.'],
            ]);
        }

        if ($user->is_blocked) {
            throw ValidationException::withMessages([
                'email' => ['Votre compte a été bloqué.'],
            ]);
        }

        $token = $user->createToken('auth_token')->plainTextToken;

        return response()->json([
            'access_token' => $token,
            'token_type' => 'Bearer',
            'user' => [
                'id' => $user->id,
                'name' => $user->name,
                'email' => $user->email,
                'roles' => $user->getRoleNames(),
                'permissions' => $user->getAllPermissions()->pluck('name'),
            ],
        ]);
    }

    public function logout(Request $request)
    {
        $request->user()->currentAccessToken()->delete();
        return response()->json(['message' => 'Déconnecté avec succès']);
    }

    public function me(Request $request)
    {
        $user = $request->user();
        return response()->json([
            'id' => $user->id,
            'name' => $user->name,
            'email' => $user->email,
            'telephone' => $user->telephone,
            'adresse' => $user->adresse,
            'date_embauche' => $user->date_embauche,
            'photo_profil' => $user->photo_profil ? Storage::disk('public')->url($user->photo_profil) : null,
            'roles' => $user->getRoleNames(),
            'permissions' => $user->getAllPermissions()->pluck('name'),
        ]);
    }

    public function updateProfile(Request $request)
    {
        $user = $request->user();
        
        $request->validate([
            'name' => 'nullable|string|max:255',
            'email' => ['nullable', 'email', Rule::unique('users')->ignore($user->id)],
            'telephone' => 'nullable|string|max:30',
            'adresse' => 'nullable|string|max:255',
            'date_embauche' => 'nullable|date',
        ]);

        if ($request->filled('name')) $user->name = $request->name;
        if ($request->filled('email')) $user->email = $request->email;
        if ($request->has('telephone')) $user->telephone = $request->telephone ?: null;
        if ($request->has('adresse')) $user->adresse = $request->adresse ?: null;
        if ($request->has('date_embauche')) {
            $user->date_embauche = $request->date_embauche ?: null;
        }

        $user->save();

        return response()->json([
            'id' => $user->id,
            'name' => $user->name,
            'email' => $user->email,
            'telephone' => $user->telephone,
            'adresse' => $user->adresse,
            'date_embauche' => $user->date_embauche,
            'photo_profil' => $user->photo_profil ? Storage::disk('public')->url($user->photo_profil) : null,
            'roles' => $user->getRoleNames(),
            'permissions' => $user->getAllPermissions()->pluck('name'),
        ]);
    }

    public function uploadPhoto(Request $request)
    {
        try {
            $user = $request->user();
            
            // Vérifier si un fichier a été envoyé
            if (!$request->hasFile('photo')) {
                return response()->json([
                    'message' => 'Aucun fichier n\'a été envoyé.',
                    'errors' => ['photo' => ['Veuillez sélectionner une image.']]
                ], 422);
            }
            
            $request->validate([
                'photo' => 'required|image|mimes:jpeg,png,jpg|max:5120', // 5MB max
            ], [
                'photo.required' => 'Veuillez sélectionner une image.',
                'photo.image' => 'Le fichier doit être une image valide.',
                'photo.mimes' => 'Seuls les formats JPG, JPEG et PNG sont acceptés.',
                'photo.max' => 'L\'image est trop lourde (max 5 Mo).',
            ]);

            // Supprimer l'ancienne photo si elle existe
            if ($user->photo_profil && Storage::disk('public')->exists($user->photo_profil)) {
                Storage::disk('public')->delete($user->photo_profil);
            }

            // Stocker la nouvelle photo
            $file = $request->file('photo');
            $path = $file->store('profile_photos', 'public');
            
            if (!$path) {
                return response()->json([
                    'message' => 'Erreur lors du stockage de l\'image.',
                ], 500);
            }
            
            $user->photo_profil = $path;
            $user->save();

        return response()->json([
            'message' => 'Photo de profil mise à jour avec succès.',
            'photo_profil' => Storage::disk('public')->url($path),
        ]);
        } catch (\Illuminate\Validation\ValidationException $e) {
            return response()->json([
                'message' => 'Erreur de validation.',
                'errors' => $e->errors(),
            ], 422);
        } catch (\Exception $e) {
            \Log::error('Erreur upload photo profil: ' . $e->getMessage());
            return response()->json([
                'message' => 'Erreur lors de l\'upload de la photo: ' . $e->getMessage(),
            ], 500);
        }
    }
}
