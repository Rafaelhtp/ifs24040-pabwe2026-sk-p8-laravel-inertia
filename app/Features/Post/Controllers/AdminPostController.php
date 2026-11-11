<?php

namespace App\Features\Post\Controllers;

use App\Features\Post\Models\Post;
use App\Features\Post\Services\PostExcelService;
use App\Features\Post\Services\PostService;
use Illuminate\Http\Request;
use Inertia\Inertia;
use Inertia\Response;
use Symfony\Component\HttpFoundation\StreamedResponse;

class AdminPostController
{
    /**
     * Display all posts from every author (read-only).
     */
    public function index(Request $request, PostService $service): Response
    {
        $search = $request->query('search');
        $status = $request->query('status');
        $category = $request->query('category');

        $posts = $service->getAllPosts($status ?: null, $search ?: null, 10, $category ?: null);

        return Inertia::render('Admin/PostList', [
            'posts' => $posts->through(fn (Post $post) => $post->toListArray()),
            'filters' => [
                'search' => $search ?? '',
                'status' => $status ?? '',
                'category' => $category ?? '',
            ],
            'categories' => PostController::categoryOptions(),
        ]);
    }

    /**
     * Export all posts into an Excel file.
     */
    public function export(PostExcelService $excelService, \App\Features\Post\Contracts\PostRepositoryInterface $repository): StreamedResponse
    {
        return $excelService->exportToResponse($repository->all(), 'semua-artikel-'.now()->format('Ymd-His').'.xlsx');
    }
}
