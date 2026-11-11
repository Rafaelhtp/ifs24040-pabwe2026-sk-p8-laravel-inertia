<?php

namespace App\Features\Post\Contracts;

use App\Features\Post\Models\Post;
use Illuminate\Contracts\Pagination\LengthAwarePaginator;
use Illuminate\Database\Eloquent\Collection;

interface PostRepositoryInterface
{
    /**
     * Get paginated posts of a user. $status may be "published" or "draft".
     */
    public function forUser(int $userId, ?string $status = null, ?string $search = null, int $perPage = 10, ?string $category = null): LengthAwarePaginator;

    /**
     * Get paginated posts of every author (admin view).
     */
    public function paginateAll(?string $status = null, ?string $search = null, int $perPage = 10, ?string $category = null): LengthAwarePaginator;

    /**
     * Get paginated published posts for the public pages.
     */
    public function paginatePublished(?string $search = null, ?string $category = null, int $perPage = 9): LengthAwarePaginator;

    /**
     * Find a published post by slug.
     */
    public function findPublishedBySlug(string $slug): ?Post;

    /**
     * Get the latest published posts, optionally excluding one post.
     *
     * @return Collection<int, Post>
     */
    public function latestPublished(int $limit = 3, ?int $exceptId = null): Collection;

    /**
     * Get all posts for a user without pagination.
     *
     * @return Collection<int, Post>
     */
    public function allForUser(int $userId): Collection;

    /**
     * Get all posts of every author without pagination.
     *
     * @return Collection<int, Post>
     */
    public function all(): Collection;

    /**
     * Find a post by id.
     */
    public function find(int $id): ?Post;

    /**
     * Find a post by id or throw an exception.
     */
    public function findOrFail(int $id): Post;

    /**
     * Determine whether a slug is already used by another post.
     */
    public function slugExists(string $slug, ?int $ignoreId = null): bool;

    /**
     * Create a new post.
     *
     * @param array<string, mixed> $attributes
     */
    public function create(array $attributes): Post;

    /**
     * Update an existing post.
     *
     * @param array<string, mixed> $attributes
     */
    public function update(Post $post, array $attributes): bool;

    /**
     * Delete an existing post.
     */
    public function delete(Post $post): bool;

    /**
     * Insert multiple posts at once.
     *
     * @param array<int, array<string, mixed>> $records
     */
    public function insertMany(array $records): bool;

    /**
     * Get statistics summary for a given user.
     *
     * @return array{total: int, published: int, draft: int}
     */
    public function getStatsForUser(int $userId): array;
}
