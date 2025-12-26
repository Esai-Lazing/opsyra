<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Models\NewsletterSubscriber;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Validator;

class NewsletterController extends Controller
{
    public function subscribe(Request $request)
    {
        $validator = Validator::make($request->all(), [
            'email' => 'required|email|max:255',
        ]);

        if ($validator->fails()) {
            return response()->json([
                'message' => 'Veuillez fournir une adresse email valide.',
                'errors' => $validator->errors()
            ], 422);
        }

        try {
            $email = $validator->validated()['email'];

            // Vérifier si l'email existe déjà
            $subscriber = NewsletterSubscriber::where('email', $email)->first();

            if ($subscriber) {
                // Si déjà inscrit mais désactivé, le réactiver
                if (!$subscriber->is_active) {
                    $subscriber->update([
                        'is_active' => true,
                        'subscribed_at' => now(),
                        'unsubscribed_at' => null,
                    ]);

                    return response()->json([
                        'message' => 'Votre inscription à la newsletter a été réactivée avec succès.'
                    ], 200);
                }

                // Si déjà inscrit et actif
                return response()->json([
                    'message' => 'Cet email est déjà inscrit à la newsletter.'
                ], 200);
            }

            // Créer un nouvel abonné
            NewsletterSubscriber::create([
                'email' => $email,
                'is_active' => true,
                'subscribed_at' => now(),
            ]);

            return response()->json([
                'message' => 'Vous avez été inscrit à la newsletter avec succès. Merci !'
            ], 201);

        } catch (\Exception $e) {
            \Log::error('Erreur lors de l\'inscription à la newsletter: ' . $e->getMessage());

            return response()->json([
                'message' => 'Une erreur est survenue lors de votre inscription. Veuillez réessayer plus tard.'
            ], 500);
        }
    }

    public function unsubscribe(Request $request)
    {
        $validator = Validator::make($request->all(), [
            'email' => 'required|email|max:255',
        ]);

        if ($validator->fails()) {
            return response()->json([
                'message' => 'Veuillez fournir une adresse email valide.',
                'errors' => $validator->errors()
            ], 422);
        }

        try {
            $email = $validator->validated()['email'];

            $subscriber = NewsletterSubscriber::where('email', $email)->first();

            if ($subscriber && $subscriber->is_active) {
                $subscriber->update([
                    'is_active' => false,
                    'unsubscribed_at' => now(),
                ]);

                return response()->json([
                    'message' => 'Vous avez été désinscrit de la newsletter avec succès.'
                ], 200);
            }

            return response()->json([
                'message' => 'Cet email n\'est pas inscrit à la newsletter.'
            ], 404);

        } catch (\Exception $e) {
            \Log::error('Erreur lors de la désinscription de la newsletter: ' . $e->getMessage());

            return response()->json([
                'message' => 'Une erreur est survenue lors de votre désinscription. Veuillez réessayer plus tard.'
            ], 500);
        }
    }
}
