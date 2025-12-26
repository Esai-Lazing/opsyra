<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\HasMany;
use Illuminate\Database\Eloquent\Relations\MorphMany;

class Personnel extends Model
{
    protected $fillable = ['nom', 'prenom', 'role', 'statut', 'date_embauche'];

    public function fuelConsommations(): HasMany
    {
        return $this->hasMany(FuelConsommation::class);
    }

    public function incidents(): MorphMany
    {
        return $this->morphMany(Incident::class, 'incidentable');
    }
}
