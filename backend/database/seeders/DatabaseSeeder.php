<?php

namespace Database\Seeders;

use App\Models\User;
use App\Models\FuelStock;
use Illuminate\Database\Seeder;
use Illuminate\Support\Facades\Hash;
use Spatie\Permission\Models\Role;
use Spatie\Permission\Models\Permission;

class DatabaseSeeder extends Seeder
{
    /**
     * Seed the application's database.
     */
    public function run(): void
    {
        // Reset cached roles and permissions
        app()[\Spatie\Permission\PermissionRegistrar::class]->forgetCachedPermissions();

        // Création des rôles
        $adminRole = Role::create(['name' => 'Admin']);
        $sousAdminRole = Role::create(['name' => 'Sous-admin']);
        $chauffeurRole = Role::create(['name' => 'Chauffeur']);
        $fuelManagerRole = Role::create(['name' => 'Gestionnaire fuel']);

        // Création de l'admin principal
        $admin = User::create([
            'name' => 'Super Admin',
            'email' => 'admin@engin.com',
            'password' => Hash::make('password'),
        ]);
        $admin->assignRole($adminRole);

        // Création d'un sous-admin exemple
        $sousAdmin = User::create([
            'name' => 'Sous Admin 1',
            'email' => 'sousadmin@engin.com',
            'password' => Hash::make('password'),
        ]);
        $sousAdmin->assignRole($sousAdminRole);

        // Création d'un chauffeur exemple
        $chauffeur = User::create([
            'name' => 'Chauffeur 1',
            'email' => 'chauffeur@engin.com',
            'password' => Hash::make('password'),
        ]);
        $chauffeur->assignRole($chauffeurRole);

        // Initialisation du stock de fuel
        FuelStock::create([
            'quantite_totale' => 5000,
            'seuil_alerte' => 500,
        ]);

        // Création d'un camion par défaut pour les tests
        \App\Models\Camion::create([
            'matricule' => 'CAM-TEST-001',
            'modele' => 'Renault Kerax',
            'capacite' => 400,
            'consommation_moyenne' => 35.5,
            'statut' => 'en service'
        ]);
    }
}
