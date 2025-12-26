<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\MorphTo;

class Incident extends Model
{
    protected $fillable = [
        'titre', 
        'description', 
        'gravite', 
        'statut', 
        'incidentable_id', 
        'incidentable_type', 
        'user_id',
        'date_incident',
        'causes',
        'actions_effectuees',
        'temps_estime',
        'image_path'
    ];

    public function incidentable(): MorphTo
    {
        return $this->morphTo()->withDefault([
            'matricule' => 'N/A'
        ]);
    }

    public function user(): \Illuminate\Database\Eloquent\Relations\BelongsTo
    {
        return $this->belongsTo(User::class, 'user_id')->withDefault([
            'name' => 'Inconnu'
        ]);
    }
}
