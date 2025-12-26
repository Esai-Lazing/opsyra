<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Mail\ContactMail;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Mail;
use Illuminate\Support\Facades\Validator;

class ContactController extends Controller
{
    public function send(Request $request)
    {
        $validator = Validator::make($request->all(), [
            'name' => 'required|string|max:255',
            'email' => 'required|email|max:255',
            'company' => 'nullable|string|max:255',
            'message' => 'required|string|max:5000',
        ]);

        if ($validator->fails()) {
            return response()->json([
                'message' => 'Les données du formulaire sont invalides.',
                'errors' => $validator->errors()
            ], 422);
        }

        try {
            $data = $validator->validated();
            
            // Envoyer l'email avec le template professionnel
            $toEmail = env('CONTACT_EMAIL', 'contact@opsyra.com');
            
            Mail::to($toEmail)->send(new ContactMail(
                $data['name'],
                $data['email'],
                $data['company'] ?? null,
                $data['message']
            ));

            return response()->json([
                'message' => 'Votre message a été envoyé avec succès. Nous vous répondrons dans les plus brefs délais.'
            ], 200);

        } catch (\Exception $e) {
            \Log::error('Erreur lors de l\'envoi de l\'email de contact: ' . $e->getMessage());
            \Log::error('Stack trace: ' . $e->getTraceAsString());
            
            return response()->json([
                'message' => 'Une erreur est survenue lors de l\'envoi de votre message. Veuillez réessayer plus tard.',
                'error' => config('app.debug') ? $e->getMessage() : null
            ], 500);
        }
    }
}

