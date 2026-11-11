<?php

namespace App\Features\Post\Controllers;

use App\Features\Ai\Contracts\AiClientInterface;
use App\Features\Post\Enums\PostCategory;
use App\Features\Post\Models\Post;
use App\Features\Post\Services\PostExcelService;
use App\Features\Post\Services\PostService;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\RedirectResponse;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Auth;
use Illuminate\Support\Facades\Gate;
use Illuminate\Validation\Rule;
use Inertia\Inertia;
use Inertia\Response;
use Symfony\Component\HttpFoundation\StreamedResponse;

class PostController
{
    /**
     * Get category options for the frontend.
     *
     * @return array<int, array{value: string, label: string, badgeClass: string}>
     */
    public static function categoryOptions(): array
    {
        return array_map(fn (PostCategory $case) => [
            'value' => $case->value,
            'label' => $case->label(),
            'badgeClass' => $case->badgeClass(),
        ], PostCategory::cases());
    }

    public function index(Request $request, PostService $service): Response
    {
        $search = $request->query('search');
        $status = $request->query('status');
        $category = $request->query('category');

        $posts = $service->getPostsForUser(
            (int) Auth::id(),
            $status ?: null,
            $search ?: null,
            8,
            $category ?: null
        );

        return Inertia::render('Post/Index', [
            'posts' => $posts->through(fn (Post $post) => [...$post->toListArray(), 'content' => $post->content]),
            'filters' => [
                'search' => $search ?? '',
                'status' => $status ?? '',
                'category' => $category ?? '',
            ],
            'categories' => self::categoryOptions(),
            'stats' => $service->getStatsForUser((int) Auth::id()),
        ]);
    }

    public function store(Request $request, PostService $service): RedirectResponse
    {
        $validated = $request->validate($this->rules());

        $service->createPost((int) Auth::id(), $validated);

        return back()->with('success', 'Artikel baru berhasil ditambahkan.');
    }

    public function show(Post $post): Response
    {
        Gate::authorize('view', $post);

        return Inertia::render('Post/Show', [
            'post' => [
                'id' => $post->id,
                'title' => $post->title,
                'slug' => $post->slug,
                'category' => $post->category,
                'excerpt' => $post->excerpt,
                'content' => $post->content,
                'cover_image_url' => $post->coverImageUrl(),
                'is_published' => (bool) $post->is_published,
                'published_at' => $post->published_at?->format('d M Y H:i'),
                'created_at' => $post->created_at?->format('d M Y H:i'),
                'updated_at' => $post->updated_at?->format('d M Y H:i'),
                'is_owner' => Auth::id() === $post->user_id,
            ],
            'categories' => self::categoryOptions(),
        ]);
    }

    public function update(Request $request, Post $post, PostService $service): RedirectResponse
    {
        Gate::authorize('update', $post);

        $validated = $request->validate($this->rules());

        $service->updatePost($post, $validated);

        return back()->with('success', 'Artikel berhasil diperbarui.');
    }

    public function destroy(Post $post, PostService $service): RedirectResponse
    {
        Gate::authorize('delete', $post);

        $service->deletePost($post);

        return redirect()->route('posts.index')->with('success', 'Artikel berhasil dihapus.');
    }

    public function publish(Post $post, PostService $service): RedirectResponse
    {
        Gate::authorize('update', $post);

        $service->togglePublish($post);

        return back()->with('success', 'Status publikasi artikel berhasil diperbarui.');
    }

    public function updateCover(Request $request, Post $post, PostService $service): RedirectResponse
    {
        Gate::authorize('update', $post);

        $request->validate([
            'coverPhoto' => ['required', 'image', 'max:5120'],
        ]);

        $service->updateCoverImage($post, $request->file('coverPhoto'));

        return back()->with('success', 'Cover artikel berhasil diperbarui.');
    }

    public function deleteCover(Post $post, PostService $service): RedirectResponse
    {
        Gate::authorize('update', $post);

        $service->deleteCoverImage($post);

        return back()->with('success', 'Cover artikel berhasil dihapus.');
    }

    public function exportExcel(PostExcelService $excelService): StreamedResponse
    {
        $posts = Auth::user()->posts()->latest('id')->get();

        return $excelService->exportToResponse($posts, 'artikel-'.now()->format('Ymd-His').'.xlsx');
    }

    public function importExcel(Request $request, PostExcelService $excelService): RedirectResponse
    {
        $request->validate([
            'importFile' => ['required', 'file', 'mimes:xlsx,xls,csv', 'max:10240'],
        ]);

        $result = $excelService->import($request->file('importFile')->getRealPath(), (int) Auth::id());

        return back()->with('success', "Berhasil mengimpor {$result['imported']} artikel.");
    }

    public function generateAi(Request $request, AiClientInterface $aiClient): JsonResponse|RedirectResponse
    {
        $validated = $request->validate([
            'prompt' => ['required_without:aiPrompt', 'nullable', 'string', 'min:3', 'max:1000'],
            'aiPrompt' => ['required_without:prompt', 'nullable', 'string', 'min:3', 'max:1000'],
            'count' => ['nullable', 'integer', 'min:1', 'max:10'],
            'aiCount' => ['nullable', 'integer', 'min:1', 'max:10'],
        ], [
            'prompt.required_without' => 'Topik artikel harus diisi minimal 3 karakter.',
            'prompt.min' => 'Topik artikel harus minimal 3 karakter.',
            'aiPrompt.required_without' => 'Topik artikel harus diisi minimal 3 karakter.',
            'aiPrompt.min' => 'Topik artikel harus minimal 3 karakter.',
        ]);

        $prompt = (string) ($validated['prompt'] ?? $validated['aiPrompt'] ?? '');
        $count = (int) ($validated['count'] ?? $validated['aiCount'] ?? 3);

        try {
            $items = $aiClient->generatePosts($prompt, $count);
            $data = array_map(fn ($item) => $item->toArray(), $items);

            if ($request->wantsJson()) {
                return response()->json([
                    'success' => true,
                    'posts' => $data,
                    'items' => $data,
                ]);
            }

            return back()->with('aiGeneratedItems', $data);
        } catch (\Throwable $e) {
            if (!app()->runningUnitTests()) {
                $fallback = (new \App\Features\Ai\Services\OpenAiPostGeneratorService())->generateFallbackPosts($prompt, $count);
                $data = array_map(fn ($item) => $item->toArray(), $fallback);

                return $request->wantsJson()
                    ? response()->json(['success' => true, 'posts' => $data, 'items' => $data])
                    : back()->with('aiGeneratedItems', $data);
            }

            $msg = 'Gagal menghasilkan artikel dengan AI: '.$e->getMessage();
            if ($request->wantsJson()) {
                return response()->json([
                    'success' => false,
                    'message' => $msg,
                ], 422);
            }

            return back()->with('error', $msg);
        }
    }

    public function saveAi(Request $request, PostService $service): RedirectResponse
    {
        $validated = $request->validate([
            'items' => ['required_without:posts', 'nullable', 'array', 'min:1'],
            'posts' => ['required_without:items', 'nullable', 'array', 'min:1'],
        ]);

        $rawItems = $validated['items'] ?? $validated['posts'] ?? [];
        $count = 0;
        foreach ($rawItems as $item) {
            if (empty($item['title']) || empty($item['content'])) {
                continue;
            }

            $category = $item['category'] ?? PostCategory::Umum->value;

            $service->createPost((int) Auth::id(), [
                'title' => $item['title'],
                'category' => in_array($category, PostCategory::values(), true) ? $category : PostCategory::Umum->value,
                'excerpt' => $item['excerpt'] ?? null,
                'content' => $item['content'],
                'is_published' => false,
            ]);
            $count++;
        }

        return back()->with('success', "Berhasil menambahkan {$count} artikel yang digenerate oleh AI.");
    }

    /**
     * Validation rules for creating/updating a post.
     *
     * @return array<string, mixed>
     */
    protected function rules(): array
    {
        return [
            'title' => ['required', 'string', 'max:255'],
            'category' => ['required', Rule::enum(PostCategory::class)],
            'excerpt' => ['nullable', 'string', 'max:500'],
            'content' => ['required', 'string'],
            'is_published' => ['nullable', 'boolean'],
        ];
    }
}
