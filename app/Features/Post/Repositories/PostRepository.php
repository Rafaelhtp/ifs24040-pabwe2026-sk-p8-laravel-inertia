<?php

namespace App\Features\Post\Repositories;

use App\Features\Post\Contracts\PostRepositoryInterface;
use App\Features\Post\Models\Post;
use Illuminate\Contracts\Pagination\LengthAwarePaginator;
use Illuminate\Database\Eloquent\Builder;
use Illuminate\Database\Eloquent\Collection;

class PostRepository implements PostRepositoryInterface
{
    /**
     * Get paginated posts of a user. $status may be "published" or "draft".
     */
    public function forUser(int $userId, ?string $status = null, ?string $search = null, int $perPage = 10, ?string $category = null): LengthAwarePaginator
    {
        $query = Post::query()->where('user_id', $userId)->with('user');

        return $this->applyFilters($query, $status, $search, $category)->latest('id')->paginate($perPage);
    }

    /**
     * Get paginated posts of every author (admin view).
     */
    public function paginateAll(?string $status = null, ?string $search = null, int $perPage = 10, ?string $category = null): LengthAwarePaginator
    {
        $query = Post::query()->with('user');

        return $this->applyFilters($query, $status, $search, $category)->latest('id')->paginate($perPage);
    }

    /**
     * Get paginated published posts for the public pages.
     */
    public function paginatePublished(?string $search = null, ?string $category = null, int $perPage = 9): LengthAwarePaginator
    {
        $query = Post::query()->where('is_published', true)->with('user');

        return $this->applyFilters($query, null, $search, $category)
            ->orderByDesc('published_at')
            ->orderByDesc('id')
            ->paginate($perPage);
    }

    /**
     * Find a published post by slug.
     */
    public function findPublishedBySlug(string $slug): ?Post
    {
        return Post::query()
            ->where('slug', $slug)
            ->where('is_published', true)
            ->with('user')
            ->first();
    }

    /**
     * Get the latest published posts, optionally excluding one post.
     *
     * @return Collection<int, Post>
     */
    public function latestPublished(int $limit = 3, ?int $exceptId = null): Collection
    {
        return Post::query()
            ->where('is_published', true)
            ->when($exceptId, fn (Builder $q) => $q->where('id', '!=', $exceptId))
            ->with('user')
            ->orderByDesc('published_at')
            ->orderByDesc('id')
            ->limit($limit)
            ->get();
    }

    /**
     * Get all posts for a user without pagination.
     *
     * @return Collection<int, Post>
     */
    public function allForUser(int $userId): Collection
    {
        return Post::query()->where('user_id', $userId)->latest('id')->get();
    }

    /**
     * Get all posts of every author without pagination.
     *
     * @return Collection<int, Post>
     */
    public function all(): Collection
    {
        return Post::query()->with('user')->latest('id')->get();
    }

    /**
     * Find a post by id.
     */
    public function find(int $id): ?Post
    {
        return Post::find($id);
    }

    /**
     * Find a post by id or throw an exception.
     */
    public function findOrFail(int $id): Post
    {
        return Post::findOrFail($id);
    }

    /**
     * Determine whether a slug is already used by another post.
     */
    public function slugExists(string $slug, ?int $ignoreId = null): bool
    {
        return Post::query()
            ->where('slug', $slug)
            ->when($ignoreId, fn (Builder $q) => $q->where('id', '!=', $ignoreId))
            ->exists();
    }

    /**
     * Create a new post.
     *
     * @param array<string, mixed> $attributes
     */
    public function create(array $attributes): Post
    {
        return Post::create($attributes);
    }

    /**
     * Update an existing post.
     *
     * @param array<string, mixed> $attributes
     */
    public function update(Post $post, array $attributes): bool
    {
        return $post->update($attributes);
    }

    /**
     * Delete an existing post.
     */
    public function delete(Post $post): bool
    {
        return (bool) $post->delete();
    }

    /**
     * Insert multiple posts at once.
     *
     * @param array<int, array<string, mixed>> $records
     */
    public function insertMany(array $records): bool
    {
        if (empty($records)) {
            return true;
        }

        return Post::insert($records);
    }

    /**
     * Get statistics summary for a given user.
     *
     * @return array{total: int, published: int, draft: int}
     */
    public function getStatsForUser(int $userId): array
    {
        $total = Post::where('user_id', $userId)->count();
        $published = Post::where('user_id', $userId)->where('is_published', true)->count();

        return [
            'total' => $total,
            'published' => $published,
            'draft' => $total - $published,
        ];
    }

    /**
     * Apply status, search, and category filters to a query.
     *
     * @param Builder<Post> $query
     * @return Builder<Post>
     */
    protected function applyFilters(Builder $query, ?string $status, ?string $search, ?string $category): Builder
    {
        if ($status === 'published') {
            $query->where('is_published', true);
        } elseif ($status === 'draft') {
            $query->where('is_published', false);
        }

        if (!empty($category)) {
            $query->where('category', $category);
        }

        if (!empty($search)) {
            $query->where(function (Builder $q) use ($search) {
                $q->where('title', 'like', "%{$search}%")
                    ->orWhere('excerpt', 'like', "%{$search}%")
                    ->orWhere('content', 'like', "%{$search}%");
            });
        }

        return $query;
    }
}
