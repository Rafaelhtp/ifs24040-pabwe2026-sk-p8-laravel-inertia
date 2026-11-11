<?php

namespace App\Features\Post\Services;

use App\Features\Post\Contracts\PostRepositoryInterface;
use App\Features\Post\Models\Post;
use Illuminate\Contracts\Pagination\LengthAwarePaginator;
use Illuminate\Database\Eloquent\Collection;
use Illuminate\Support\Facades\Storage;
use Illuminate\Support\Str;

class PostService
{
    public function __construct(
        protected PostRepositoryInterface $postRepository
    ) {}

    /**
     * Get paginated posts for the specified author.
     */
    public function getPostsForUser(int $userId, ?string $status = null, ?string $search = null, int $perPage = 10, ?string $category = null): LengthAwarePaginator
    {
        return $this->postRepository->forUser($userId, $status, $search, $perPage, $category);
    }

    /**
     * Get paginated posts of every author (admin).
     */
    public function getAllPosts(?string $status = null, ?string $search = null, int $perPage = 10, ?string $category = null): LengthAwarePaginator
    {
        return $this->postRepository->paginateAll($status, $search, $perPage, $category);
    }

    /**
     * Get published posts for the public pages.
     */
    public function getPublicPosts(?string $search = null, ?string $category = null, int $perPage = 9): LengthAwarePaginator
    {
        return $this->postRepository->paginatePublished($search, $category, $perPage);
    }

    /**
     * Get a published post by slug or fail with 404.
     */
    public function getPublishedPost(string $slug): Post
    {
        return $this->postRepository->findPublishedBySlug($slug) ?? abort(404, 'Artikel tidak ditemukan.');
    }

    /**
     * Get the latest published posts.
     *
     * @return Collection<int, Post>
     */
    public function getLatestPublished(int $limit = 3, ?int $exceptId = null): Collection
    {
        return $this->postRepository->latestPublished($limit, $exceptId);
    }

    /**
     * Generate a unique slug from a title.
     *
     * @param array<int, string> $reserved Slugs reserved in memory (e.g. during bulk import).
     */
    public function generateUniqueSlug(string $title, ?int $ignoreId = null, array $reserved = []): string
    {
        $base = Str::slug($title);
        if ($base === '') {
            $base = 'artikel';
        }

        $slug = $base;
        $counter = 2;
        while (in_array($slug, $reserved, true) || $this->postRepository->slugExists($slug, $ignoreId)) {
            $slug = "{$base}-{$counter}";
            $counter++;
        }

        return $slug;
    }

    /**
     * Create a new post for the author.
     *
     * @param array<string, mixed> $data
     */
    public function createPost(int $userId, array $data): Post
    {
        $isPublished = (bool) ($data['is_published'] ?? false);

        return $this->postRepository->create([
            'user_id' => $userId,
            'title' => $data['title'],
            'slug' => $this->generateUniqueSlug($data['title']),
            'category' => $data['category'],
            'excerpt' => $data['excerpt'] ?? null,
            'content' => $data['content'],
            'cover_image_path' => $data['cover_image_path'] ?? null,
            'is_published' => $isPublished,
            'published_at' => $isPublished ? now() : null,
        ]);
    }

    /**
     * Update an existing post.
     *
     * @param array<string, mixed> $data
     */
    public function updatePost(Post $post, array $data): bool
    {
        $attributes = [
            'title' => $data['title'] ?? $post->title,
            'category' => $data['category'] ?? $post->category,
            'excerpt' => array_key_exists('excerpt', $data) ? $data['excerpt'] : $post->excerpt,
            'content' => $data['content'] ?? $post->content,
            'cover_image_path' => array_key_exists('cover_image_path', $data) ? $data['cover_image_path'] : $post->cover_image_path,
        ];

        if (isset($data['title']) && $data['title'] !== $post->title) {
            $attributes['slug'] = $this->generateUniqueSlug($data['title'], $post->id);
        }

        if (array_key_exists('is_published', $data)) {
            $attributes = array_merge($attributes, $this->publishAttributes($post, (bool) $data['is_published']));
        }

        return $this->postRepository->update($post, $attributes);
    }

    /**
     * Update or upload a cover image for the post.
     */
    public function updateCoverImage(Post $post, mixed $file): string
    {
        $this->removeCoverFile($post);

        $path = $file->store('post-covers', 'public');
        $this->postRepository->update($post, ['cover_image_path' => $path]);

        return $path;
    }

    /**
     * Delete the cover image of the post.
     */
    public function deleteCoverImage(Post $post): bool
    {
        $this->removeCoverFile($post);

        return $this->postRepository->update($post, ['cover_image_path' => null]);
    }

    /**
     * Delete a post and its cover image if exists.
     */
    public function deletePost(Post $post): bool
    {
        $this->removeCoverFile($post);

        return $this->postRepository->delete($post);
    }

    /**
     * Toggle the post between published and draft.
     */
    public function togglePublish(Post $post): bool
    {
        return $this->postRepository->update($post, $this->publishAttributes($post, !$post->is_published));
    }

    /**
     * Get statistics summary for a given user.
     *
     * @return array{total: int, published: int, draft: int}
     */
    public function getStatsForUser(int $userId): array
    {
        return $this->postRepository->getStatsForUser($userId);
    }

    /**
     * Build publish related attributes for the target state.
     *
     * @return array<string, mixed>
     */
    protected function publishAttributes(Post $post, bool $publish): array
    {
        if (!$publish) {
            return ['is_published' => false, 'published_at' => null];
        }

        return [
            'is_published' => true,
            'published_at' => $post->published_at ?? now(),
        ];
    }

    /**
     * Remove the cover file from storage if it exists.
     */
    protected function removeCoverFile(Post $post): void
    {
        if ($post->cover_image_path && Storage::disk('public')->exists($post->cover_image_path)) {
            Storage::disk('public')->delete($post->cover_image_path);
        }
    }
}
