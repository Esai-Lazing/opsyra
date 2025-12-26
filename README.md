# Application de Gestion de Flotte (Opsyra)

Cette application est une solution complète de gestion pour une entreprise de location d'engins et de camions, incluant le suivi du personnel, du fuel et des incidents.

## Architecture

- **Backend**: Laravel 12 (API REST)
- **Frontend**: React JS + Vite + Tailwind CSS
- **Base de données**: SQLite (par défaut pour simplicité, configurable en MySQL)
- **Authentification**: Laravel Sanctum

## Installation

### 1. Backend

```bash
cd backend
composer install
php artisan migrate:fresh --seed
php artisan serve
```

L'API sera disponible sur `http://localhost:8000`.

### 2. Frontend

```bash
cd frontend
npm install
npm run dev
```

L'application sera disponible sur `http://localhost:5173`.

## Identifiants de connexion (Admin)

- **Email**: `admin@engin.com`
- **Mot de passe**: `password`

## Fonctionnalités incluses

- [x] Authentification complète avec Sanctum
- [x] Dashboard moderne avec KPIs et graphiques (Recharts)
- [x] Gestion des Engins (CRUD)
- [x] Architecture API REST propre
- [x] Design inspiré de Linear.app (épuré et moderne)
- [x] Structure de base pour les modules Camions, Personnel, Fuel et Incidents
