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
        Schema::create('truck_assignments', function (Blueprint $table) {
            $table->id();
            $table->foreignId('camion_id')->nullable()->constrained('camions')->onDelete('cascade');
            $table->foreignId('engin_id')->nullable()->constrained('engins')->onDelete('cascade');
            $table->foreignId('user_id')->constrained('users')->onDelete('cascade'); // Le chauffeur / opérateur
            $table->string('site_projet')->nullable();
            $table->date('date_debut');
            $table->date('date_fin')->nullable();
            $table->boolean('is_active')->default(true);
            $table->timestamps();
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('truck_assignments');
    }
};
