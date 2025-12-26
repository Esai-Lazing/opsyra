<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Models\Notification;
use Illuminate\Http\Request;

class NotificationController extends Controller
{
    /**
     * Récupère toutes les notifications pour les admins et sous-admins
     * Les notifications sont créées pour les admins lorsqu'un chauffeur crée un incident ou un rapport fuel
     */
    public function index(Request $request)
    {
        $user = $request->user();
        
        // Seuls les admins et sous-admins voient les notifications
        if (!$user->hasAnyRole(['Admin', 'Sous-admin'])) {
            return response()->json(['message' => 'Accès non autorisé'], 403);
        }

        $notifications = Notification::with(['user', 'related'])
            ->latest()
            ->paginate(20);

        return response()->json($notifications);
    }

    /**
     * Récupère le nombre de notifications non lues
     */
    public function unreadCount(Request $request)
    {
        $user = $request->user();
        
        if (!$user->hasAnyRole(['Admin', 'Sous-admin'])) {
            return response()->json(['count' => 0]);
        }

        $count = Notification::where('is_read', false)->count();

        return response()->json(['count' => $count]);
    }

    /**
     * Marque une notification comme lue
     */
    public function markAsRead(Request $request, Notification $notification)
    {
        $user = $request->user();
        
        if (!$user->hasAnyRole(['Admin', 'Sous-admin'])) {
            return response()->json(['message' => 'Accès non autorisé'], 403);
        }

        $notification->update([
            'is_read' => true,
            'read_at' => now(),
        ]);

        return response()->json($notification);
    }

    /**
     * Marque toutes les notifications comme lues
     */
    public function markAllAsRead(Request $request)
    {
        $user = $request->user();
        
        if (!$user->hasAnyRole(['Admin', 'Sous-admin'])) {
            return response()->json(['message' => 'Accès non autorisé'], 403);
        }

        Notification::where('is_read', false)
            ->update([
                'is_read' => true,
                'read_at' => now(),
            ]);

        return response()->json(['message' => 'Toutes les notifications ont été marquées comme lues']);
    }
}

