<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;

class TruckAssignment extends Model
{
    protected $fillable = [
        'camion_id',
        'engin_id',
        'user_id',
        'site_projet',
        'date_debut',
        'date_fin',
        'is_active'
    ];

    protected $casts = [
        'date_debut' => 'date',
        'date_fin' => 'date',
        'is_active' => 'boolean',
    ];

    public function camion(): BelongsTo
    {
        return $this->belongsTo(Camion::class);
    }

    public function engin(): BelongsTo
    {
        return $this->belongsTo(Engin::class);
    }

    public function user(): BelongsTo
    {
        return $this->belongsTo(User::class);
    }
}
