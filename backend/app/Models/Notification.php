<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;
use Illuminate\Database\Eloquent\Relations\MorphTo;

class Notification extends Model
{
    protected $fillable = [
        'type',
        'title',
        'message',
        'user_id',
        'related_id',
        'related_type',
        'is_read',
        'read_at',
    ];

    protected $casts = [
        'is_read' => 'boolean',
        'read_at' => 'datetime',
    ];

    /**
     * Utilisateur qui a créé l'action (chauffeur qui a créé l'incident ou le rapport)
     */
    public function user(): BelongsTo
    {
        return $this->belongsTo(User::class);
    }

    /**
     * Relation polymorphique vers l'incident ou le rapport fuel
     */
    public function related(): MorphTo
    {
        return $this->morphTo('related');
    }
}

