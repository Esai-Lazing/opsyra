<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;

class FuelStock extends Model
{
    protected $fillable = ['quantite_totale', 'seuil_alerte'];
}
