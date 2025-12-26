<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;

class FuelReplenishment extends Model
{
    protected $fillable = [
        'user_id',
        'quantite',
        'date_approvisionnement',
        'notes'
    ];

    protected $casts = [
        'date_approvisionnement' => 'date',
    ];

    public function user(): BelongsTo
    {
        return $this->belongsTo(User::class);
    }
}
