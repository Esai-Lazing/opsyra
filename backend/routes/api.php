<?php

use App\Http\Controllers\Api\AuthController;
use App\Http\Controllers\Api\CamionController;
use App\Http\Controllers\Api\ContactController;
use App\Http\Controllers\Api\NewsletterController;
use App\Http\Controllers\Api\DashboardController;
use App\Http\Controllers\Api\EnginController;
use App\Http\Controllers\Api\FuelController;
use App\Http\Controllers\Api\IncidentController;
use App\Http\Controllers\Api\NotificationController;
use App\Http\Controllers\Api\PersonnelController;
use App\Http\Controllers\Api\UserController;
use App\Http\Controllers\Api\TruckAssignmentController;
use App\Http\Controllers\Api\FuelReplenishmentController;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Route;

// Public routes
Route::post('/login', [AuthController::class, 'login']);
Route::post('/contact', [ContactController::class, 'send']);
Route::post('/newsletter/subscribe', [NewsletterController::class, 'subscribe']);
Route::post('/newsletter/unsubscribe', [NewsletterController::class, 'unsubscribe']);

Route::middleware('auth:sanctum')->group(function () {
    Route::post('/logout', [AuthController::class, 'logout']);
    Route::get('/me', [AuthController::class, 'me']);
    Route::put('/profile', [AuthController::class, 'updateProfile']);
    Route::post('/profile/photo', [AuthController::class, 'uploadPhoto']);

    // Dashboard (Accessible à tous, filtrage dans le controller)
    Route::get('/dashboard', [DashboardController::class, 'index']);

    // Gestion des utilisateurs
    Route::get('/users', [UserController::class, 'index'])->middleware('role:Admin|Sous-admin|Gestionnaire fuel');
    Route::apiResource('users', UserController::class)->except(['index'])->middleware('role:Admin|Sous-admin');
    
    // Camions & Engins
    Route::get('/engins', [EnginController::class, 'index'])->middleware('role:Admin|Sous-admin|Gestionnaire fuel');
    Route::get('/camions', [CamionController::class, 'index'])->middleware('role:Admin|Sous-admin|Gestionnaire fuel');
    Route::apiResource('engins', EnginController::class)->except(['index'])->middleware('role:Admin|Sous-admin');
    Route::apiResource('camions', CamionController::class)->except(['index'])->middleware('role:Admin|Sous-admin');

    // Affectations
    Route::get('/assignments/my', [TruckAssignmentController::class, 'myAssignment']);
    Route::get('/assignments', [TruckAssignmentController::class, 'index'])->middleware('role:Admin|Sous-admin|Gestionnaire fuel');
    Route::apiResource('assignments', TruckAssignmentController::class)->only(['store', 'update', 'destroy'])->middleware('role:Admin|Sous-admin');
    Route::post('/assignments/{assignment}/deactivate', [TruckAssignmentController::class, 'deactivate'])->middleware('role:Admin|Sous-admin');

    // Incidents
    Route::get('/incidents', [IncidentController::class, 'index']);
    Route::post('/incidents', [IncidentController::class, 'store']);
    Route::middleware('role:Admin|Sous-admin')->group(function () {
        Route::put('/incidents/{incident}', [IncidentController::class, 'update']);
        Route::delete('/incidents/{incident}', [IncidentController::class, 'destroy']);
    });

    // Fuel management
    Route::get('/fuel/stock', [FuelController::class, 'getStock']);
    Route::post('/fuel/stock', [FuelController::class, 'updateStock'])->middleware('role:Admin|Sous-admin|Gestionnaire fuel');
    
    // Approvisionnements
    Route::get('/fuel/replenishments', [FuelReplenishmentController::class, 'index'])->middleware('role:Admin|Sous-admin|Gestionnaire fuel');
    Route::post('/fuel/replenishments', [FuelReplenishmentController::class, 'store'])->middleware('role:Admin|Sous-admin|Gestionnaire fuel');

    Route::get('/fuel/consommations', [FuelController::class, 'getConsommations']);
    Route::post('/fuel/consommations', [FuelController::class, 'storeConsommation'])->middleware('role:Admin|Sous-admin|Gestionnaire fuel');
    Route::delete('/fuel/consommations/{id}', [FuelController::class, 'destroy'])->middleware('role:Admin|Sous-admin');
    
    // Rapport journalier chauffeur
    Route::get('/fuel/daily-report/check', [FuelController::class, 'checkTodayReport'])->middleware('role:Chauffeur|Admin|Sous-admin');
    Route::post('/fuel/daily-report', [FuelController::class, 'dailyReport'])->middleware('role:Chauffeur|Admin|Sous-admin');

    // Notifications
    Route::get('/notifications', [NotificationController::class, 'index'])->middleware('role:Admin|Sous-admin');
    Route::get('/notifications/unread-count', [NotificationController::class, 'unreadCount'])->middleware('role:Admin|Sous-admin');
    Route::put('/notifications/{notification}/read', [NotificationController::class, 'markAsRead'])->middleware('role:Admin|Sous-admin');
    Route::put('/notifications/read-all', [NotificationController::class, 'markAllAsRead'])->middleware('role:Admin|Sous-admin');
});
