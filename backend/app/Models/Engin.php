<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\HasMany;
use Illuminate\Database\Eloquent\Relations\MorphMany;

class Engin extends Model
{
    protected $fillable = ['nom', 'type', 'matricule', 'statut', 'date_achat'];

    public function fuelConsommations(): HasMany
    {
        return $this->hasMany(FuelConsommation::class);
    }

    public function incidents(): MorphMany
    {
        return $this->morphMany(Incident::class, 'incidentable');
    }
}
