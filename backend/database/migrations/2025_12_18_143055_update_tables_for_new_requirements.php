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
        // Update Users: remove role column (using Spatie roles)
        Schema::table('users', function (Blueprint $table) {
            $table->dropColumn('role');
            $table->boolean('is_blocked')->default(false);
        });

        // Update Camions: add site/project assignment
        Schema::table('camions', function (Blueprint $table) {
            $table->string('affectation_site')->nullable();
        });

        // Update Incidents: add chauffeur specific fields
        Schema::table('incidents', function (Blueprint $table) {
            $table->text('causes')->nullable();
            $table->text('actions_effectuees')->nullable();
            $table->string('temps_estime')->nullable();
            $table->string('image_path')->nullable();
        });

        // Update Fuel Consommation: add mandatory image and metadata
        Schema::table('fuel_consommations', function (Blueprint $table) {
            $table->string('image_compteur_path')->nullable();
            $table->json('image_metadata')->nullable();
            $table->float('quantite_restante')->nullable();
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::table('users', function (Blueprint $table) {
            $table->string('role')->default('Operateur');
            $table->dropColumn('is_blocked');
        });

        Schema::table('camions', function (Blueprint $table) {
            $table->dropColumn('affectation_site');
        });

        Schema::table('incidents', function (Blueprint $table) {
            $table->dropColumn(['causes', 'actions_effectuees', 'temps_estime', 'image_path']);
        });

        Schema::table('fuel_consommations', function (Blueprint $table) {
            $table->dropColumn(['image_compteur_path', 'image_metadata', 'quantite_restante']);
        });
    }
};
