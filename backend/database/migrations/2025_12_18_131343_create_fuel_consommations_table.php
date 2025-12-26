<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    /**
     * Run the migrations.
     */
    public function up(): void
    {
        Schema::create('fuel_consommations', function (Blueprint $table) {
            $table->id();
            $table->foreignId('engin_id')->nullable()->constrained()->onDelete('set null');
            $table->foreignId('camion_id')->nullable()->constrained()->onDelete('set null');
            $table->foreignId('personnel_id')->constrained('users')->onDelete('cascade');
            $table->float('quantite');
            $table->date('date_consommation');
            $table->timestamps();
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('fuel_consommations');
    }
};
