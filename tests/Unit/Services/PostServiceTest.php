<?php

namespace Tests\Unit\Services;

use App\Features\Post\Models\Post;
use App\Features\Post\Repositories\PostRepository;
use App\Features\Post\Services\PostService;
use App\Models\User;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Illuminate\Http\UploadedFile;
use Illuminate\Support\Facades\Storage;
use Symfony\Component\HttpKernel\Exception\HttpException;
use Tests\TestCase;

class PostServiceTest extends TestCase
{
    use RefreshDatabase;

    protected PostService $service;

    protected function setUp(): void
    {
        parent::setUp();
        $this->service = new PostService(new PostRepository());
    }

    public function test_create_update_toggle_and_unique_slug(): void
    {
        $user = User::factory()->create();

        $p1 = $this->service->createPost($user->id, [
            'title' => 'Judul Sama',
            'category' => 'Teknologi',
            'excerpt' => 'Ringkasan',
            'content' => 'Isi 1',
            'is_published' => true,
        ]);
        $p2 = $this->service->createPost($user->id, [
            'title' => 'Judul Sama',
            'category' => 'Teknologi',
            'content' => 'Isi 2',
            'is_published' => false,
        ]);
        $p3 = $this->service->createPost($user->id, [
            'title' => '!!!',
            'category' => 'Umum',
            'content' => 'Simbol saja',
        ]);

        $this->assertEquals('judul-sama', $p1->slug);
        $this->assertEquals('judul-sama-2', $p2->slug);
        $this->assertEquals('artikel', $p3->slug);
        $this->assertTrue($p1->is_published);
        $this->assertNotNull($p1->published_at);

        $this->service->updatePost($p2, ['title' => 'Judul Baru', 'is_published' => true]);
        $this->assertEquals('judul-baru', $p2->fresh()->slug);
        $this->assertTrue($p2->fresh()->is_published);

        $this->service->togglePublish($p1);
        $this->assertFalse($p1->fresh()->is_published);
        $this->service->togglePublish($p1->fresh());
        $this->assertTrue($p1->fresh()->is_published);
    }

    public function test_listing_queries_and_published_lookup(): void
    {
        $user = User::factory()->create();
        $pub = Post::factory()->published()->create(['user_id' => $user->id, 'slug' => 'publik-1']);
        Post::factory()->draft()->create(['user_id' => $user->id]);

        $this->assertCount(2, $this->service->getPostsForUser($user->id));
        $this->assertCount(2, $this->service->getAllPosts());
        $this->assertCount(1, $this->service->getPublicPosts());
        $this->assertEquals($pub->id, $this->service->getPublishedPost('publik-1')->id);
        $this->assertCount(0, $this->service->getLatestPublished(3, $pub->id));
        $this->assertEquals(2, $this->service->getStatsForUser($user->id)['total']);

        $this->expectException(HttpException::class);
        $this->service->getPublishedPost('tidak-ada');
    }

    public function test_cover_image_and_delete_cleanup(): void
    {
        Storage::fake('public');
        $user = User::factory()->create();
        $post = Post::factory()->create(['user_id' => $user->id]);

        $path1 = $this->service->updateCoverImage($post, UploadedFile::fake()->image('a.jpg'));
        Storage::disk('public')->assertExists($path1);

        $path2 = $this->service->updateCoverImage($post->fresh(), UploadedFile::fake()->image('b.jpg'));
        Storage::disk('public')->assertMissing($path1);
        Storage::disk('public')->assertExists($path2);

        $this->service->deleteCoverImage($post->fresh());
        Storage::disk('public')->assertMissing($path2);

        $path3 = $this->service->updateCoverImage($post->fresh(), UploadedFile::fake()->image('c.jpg'));
        $this->service->deletePost($post->fresh());
        Storage::disk('public')->assertMissing($path3);
    }
}
