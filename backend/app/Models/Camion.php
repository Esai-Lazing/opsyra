<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\HasMany;
use Illuminate\Database\Eloquent\Relations\MorphMany;

class Camion extends Model
{
    protected $fillable = [
        'matricule', 
        'modele', 
        'capacite', 
        'consommation_moyenne', 
        'statut',
        'affectation_site'
    ];

    public function fuelConsommations(): HasMany
    {
        return $this->hasMany(FuelConsommation::class);
    }

    public function incidents(): MorphMany
    {
        return $this->morphMany(Incident::class, 'incidentable');
    }

    public function assignments(): HasMany
    {
        return $this->hasMany(TruckAssignment::class);
    }
}
