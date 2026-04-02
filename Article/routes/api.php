<?php

use App\Http\Controllers\ArticleController;
use App\Http\Controllers\ReactionController;
use Illuminate\Support\Facades\Route;
use App\Http\Controllers\AuthController;

Route::post('/register', [AuthController::class, 'register']);
Route::post('/login', [AuthController::class, 'login']);
Route::get('/articles', [ArticleController::class, 'index']);
Route::get('/articles/{id}', [ArticleController::class, 'show']);

Route::middleware('auth:sanctum')->group(function () {
    Route::post('/logout', [AuthController::class, 'logout']);
    Route::get('/user', [AuthController::class, 'user']);

    Route::get('/admin-only', [AuthController::class, 'adminOnly']);

    // Articles
    Route::post('/articles', [ArticleController::class, 'store']);

    // Reactions
    Route::post('/articles/{id}/react', [ReactionController::class, 'react']);
    Route::delete('/articles/{id}/react', [ReactionController::class, 'remove']);
});
