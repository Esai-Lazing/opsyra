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
        Schema::create('notifications', function (Blueprint $table) {
            $table->id();
            $table->string('type'); // 'incident' ou 'fuel_report'
            $table->string('title');
            $table->text('message');
            $table->foreignId('user_id')->nullable()->constrained('users')->onDelete('cascade'); // Utilisateur qui a créé l'action
            $table->foreignId('related_id')->nullable(); // ID de l'incident ou du rapport fuel
            $table->string('related_type')->nullable(); // 'App\Models\Incident' ou 'App\Models\FuelConsommation'
            $table->boolean('is_read')->default(false);
            $table->timestamp('read_at')->nullable();
            $table->timestamps();
            
            $table->index(['user_id', 'is_read']);
            $table->index('created_at');
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('notifications');
    }
};

