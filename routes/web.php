<?php

use App\Features\Admin\Controllers\AdminUserController;
use App\Features\Auth\Controllers\AuthController;
use App\Features\Post\Controllers\AdminPostController;
use App\Features\Post\Controllers\PostController;
use App\Features\Post\Controllers\PublicPostController;
use App\Features\Profile\Controllers\ProfileController;
use Illuminate\Support\Facades\Route;

Route::middleware(['throttle:1000-per-second'])->group(function () {
    // Public Article Routes (Dapat diakses oleh umum tanpa perlu login)
    Route::get('/', [PublicPostController::class, 'index'])->name('home');
    Route::get('/articles', [PublicPostController::class, 'index'])->name('articles.index');
    Route::get('/articles/{slug}', [PublicPostController::class, 'show'])->name('articles.show');

    // Guest Authentication Routes
    Route::middleware('guest')->group(function () {
        Route::get('/login', [AuthController::class, 'createLogin'])->name('login');
        Route::post('/login', [AuthController::class, 'storeLogin']);
        Route::get('/register', [AuthController::class, 'createRegister'])->name('register');
        Route::post('/register', [AuthController::class, 'storeRegister']);
    });

    // Authenticated Routes
    Route::middleware('auth')->group(function () {
        Route::post('/logout', [AuthController::class, 'destroy'])->name('logout');

        // User Profile Routes
        Route::get('/profile', [ProfileController::class, 'edit'])->name('profile');
        Route::patch('/profile', [ProfileController::class, 'update'])->name('profile.update');
        Route::put('/profile/password', [ProfileController::class, 'updatePassword'])->name('profile.password');
        Route::post('/profile/photo', [ProfileController::class, 'updatePhoto'])->name('profile.photo.update');
        Route::delete('/profile/photo', [ProfileController::class, 'deletePhoto'])->name('profile.photo.delete');

        // Member Post Routes
        Route::prefix('dashboard/posts')->name('posts.')->group(function () {
            // Excel & AI (Placed before wildcard {post} routes)
            Route::get('/export', [PostController::class, 'exportExcel'])->name('export');
            Route::post('/import', [PostController::class, 'importExcel'])->name('import');
            Route::post('/ai-generate', [PostController::class, 'generateAi'])->name('ai.generate');
            Route::post('/ai-save', [PostController::class, 'saveAi'])->name('ai.save');

            Route::get('/', [PostController::class, 'index'])->middleware('owns.post')->name('index');
            Route::post('/', [PostController::class, 'store'])->name('store');

            Route::get('/{post}', [PostController::class, 'show'])->middleware('owns.post')->name('show');
            Route::put('/{post}', [PostController::class, 'update'])->middleware('owns.post')->name('update');
            Route::delete('/{post}', [PostController::class, 'destroy'])->middleware('owns.post')->name('destroy');
            Route::patch('/{post}/publish', [PostController::class, 'publish'])->middleware('owns.post')->name('publish');
            Route::post('/{post}/cover', [PostController::class, 'updateCover'])->middleware('owns.post')->name('cover.update');
            Route::delete('/{post}/cover', [PostController::class, 'deleteCover'])->middleware('owns.post')->name('cover.delete');
        });

        // Admin Routes protected by Role middleware
        Route::prefix('admin')->name('admin.')->middleware('role:admin')->group(function () {
            Route::get('/users', [AdminUserController::class, 'index'])->name('users');
            Route::get('/users/{user}/posts', [AdminUserController::class, 'posts'])->name('users.posts');
            Route::get('/users/{user}/posts/export', [AdminUserController::class, 'exportUserPosts'])->name('users.posts.export');
            Route::get('/posts', [AdminPostController::class, 'index'])->name('posts');
            Route::get('/posts/export', [AdminPostController::class, 'export'])->name('posts.export');
        });
    });
});
