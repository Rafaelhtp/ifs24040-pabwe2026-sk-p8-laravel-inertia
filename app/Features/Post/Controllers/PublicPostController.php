<?php

namespace App\Features\Post\Controllers;

use App\Features\Post\Models\Post;
use App\Features\Post\Services\PostService;
use Illuminate\Http\Request;
use Inertia\Inertia;
use Inertia\Response;

class PublicPostController
{
    /**
     * Display the landing page / listing of published articles.
     */
    public function index(Request $request, PostService $service): Response
    {
        $search = $request->query('search');
        $category = $request->query('category');

        $posts = $service->getPublicPosts($search ?: null, $category ?: null, 9);

        return Inertia::render('Public/PostIndex', [
            'posts' => $posts->through(fn (Post $post) => $post->toListArray()),
            'filters' => [
                'search' => $search ?? '',
                'category' => $category ?? '',
            ],
            'categories' => PostController::categoryOptions(),
        ]);
    }

    /**
     * Display a single published article.
     */
    public function show(string $slug, PostService $service): Response
    {
        $post = $service->getPublishedPost($slug);

        return Inertia::render('Public/PostShow', [
            'post' => [
                ...$post->toListArray(),
                'content' => $post->content,
            ],
            'related' => $service->getLatestPublished(3, $post->id)->map(fn (Post $p) => $p->toListArray())->values(),
        ]);
    }
}
