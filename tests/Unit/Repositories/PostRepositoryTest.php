<?php

namespace Tests\Unit\Repositories;

use App\Features\Post\Models\Post;
use App\Features\Post\Repositories\PostRepository;
use App\Models\User;
use Illuminate\Database\Eloquent\ModelNotFoundException;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Tests\TestCase;

class PostRepositoryTest extends TestCase
{
    use RefreshDatabase;

    protected PostRepository $repository;

    protected function setUp(): void
    {
        parent::setUp();
        $this->repository = new PostRepository();
    }

    public function test_create_find_update_delete_and_slug_exists(): void
    {
        $user = User::factory()->create();
        $post = $this->repository->create([
            'user_id' => $user->id,
            'title' => 'Artikel Satu',
            'slug' => 'artikel-satu',
            'category' => 'Teknologi',
            'content' => 'Isi artikel',
        ]);

        $this->assertInstanceOf(Post::class, $post);
        $this->assertEquals($post->id, $this->repository->find($post->id)->id);
        $this->assertEquals($post->id, $this->repository->findOrFail($post->id)->id);

        $this->assertTrue($this->repository->slugExists('artikel-satu'));
        $this->assertFalse($this->repository->slugExists('artikel-satu', $post->id));

        $this->assertTrue($this->repository->update($post, ['title' => 'Judul Baru']));
        $this->assertEquals('Judul Baru', $post->fresh()->title);

        $this->assertTrue($this->repository->delete($post));
        $this->assertDatabaseMissing('posts', ['id' => $post->id]);
    }

    public function test_find_or_fail_throws_exception(): void
    {
        $this->expectException(ModelNotFoundException::class);
        $this->repository->findOrFail(99999);
    }

    public function test_queries_and_filters(): void
    {
        $user = User::factory()->create();
        $other = User::factory()->create();

        $p1 = Post::factory()->published()->create([
            'user_id' => $user->id,
            'title' => 'Belajar Laravel',
            'slug' => 'belajar-laravel',
            'category' => 'Teknologi',
            'excerpt' => 'Ringkasan',
            'content' => 'Isi lengkap',
        ]);
        Post::factory()->draft()->create([
            'user_id' => $user->id,
            'title' => 'Catatan Pribadi',
            'category' => 'Opini',
        ]);
        Post::factory()->published()->create([
            'user_id' => $other->id,
            'title' => 'Bisnis Online',
            'category' => 'Bisnis',
        ]);

        $this->assertCount(2, $this->repository->forUser($user->id));
        $this->assertCount(1, $this->repository->forUser($user->id, status: 'published'));
        $this->assertCount(1, $this->repository->forUser($user->id, status: 'draft'));
        $this->assertCount(1, $this->repository->forUser($user->id, category: 'Teknologi'));
        $this->assertCount(1, $this->repository->forUser($user->id, search: 'Laravel'));

        $this->assertCount(3, $this->repository->paginateAll());
        $this->assertCount(2, $this->repository->paginatePublished());
        $this->assertNotNull($this->repository->findPublishedBySlug('belajar-laravel'));
        $this->assertCount(1, $this->repository->latestPublished(3, $p1->id));
        $this->assertCount(2, $this->repository->allForUser($user->id));
        $this->assertCount(3, $this->repository->all());
    }

    public function test_insert_many_and_stats(): void
    {
        $user = User::factory()->create();

        $this->assertTrue($this->repository->insertMany([]));

        $now = now();
        $this->assertTrue($this->repository->insertMany([
            ['user_id' => $user->id, 'title' => 'A', 'slug' => 'a', 'category' => 'Umum', 'content' => 'x', 'is_published' => true, 'created_at' => $now, 'updated_at' => $now],
            ['user_id' => $user->id, 'title' => 'B', 'slug' => 'b', 'category' => 'Umum', 'content' => 'y', 'is_published' => false, 'created_at' => $now, 'updated_at' => $now],
        ]));

        $stats = $this->repository->getStatsForUser($user->id);
        $this->assertEquals(['total' => 2, 'published' => 1, 'draft' => 1], $stats);
    }
}
