<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;

class FuelConsommation extends Model
{
    protected $fillable = [
        'engin_id', 
        'camion_id', 
        'personnel_id', 
        'quantite', 
        'date_consommation',
        'image_compteur_path',
        'image_metadata',
        'quantite_restante'
    ];

    protected $casts = [
        'image_metadata' => 'json',
        'date_consommation' => 'date',
    ];

    public function engin(): BelongsTo
    {
        return $this->belongsTo(Engin::class);
    }

    public function camion(): BelongsTo
    {
        return $this->belongsTo(Camion::class);
    }

    public function personnel(): BelongsTo
    {
        return $this->belongsTo(User::class, 'personnel_id');
    }
}
