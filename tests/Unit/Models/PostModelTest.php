<?php

namespace Tests\Unit\Models;

use App\Features\Post\Models\Post;
use App\Models\User;
use Carbon\Carbon;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Illuminate\Support\Facades\Storage;
use Tests\TestCase;

class PostModelTest extends TestCase
{
    use RefreshDatabase;

    public function test_post_belongs_to_user(): void
    {
        $user = User::factory()->create();
        $post = Post::factory()->create(['user_id' => $user->id]);

        $this->assertInstanceOf(User::class, $post->user);
        $this->assertEquals($user->id, $post->user->id);
    }

    public function test_post_casts_and_factory_states(): void
    {
        $published = Post::factory()->published()->create();
        $this->assertTrue($published->is_published);
        $this->assertInstanceOf(Carbon::class, $published->published_at);

        $draft = Post::factory()->draft()->create();
        $this->assertFalse($draft->is_published);
        $this->assertNull($draft->published_at);
    }

    public function test_cover_image_url_and_to_list_array(): void
    {
        $postWithoutCover = Post::factory()->create(['cover_image_path' => null]);
        $this->assertNull($postWithoutCover->coverImageUrl());

        Storage::fake('public');
        Storage::disk('public')->put('post-covers/sample.png', 'content');

        $postWithCover = Post::factory()->published()->create(['cover_image_path' => 'post-covers/sample.png']);
        $this->assertNotNull($postWithCover->coverImageUrl());
        $this->assertStringContainsString('post-covers/sample.png', $postWithCover->coverImageUrl());

        $list = $postWithCover->load('user')->toListArray();
        $this->assertEquals($postWithCover->id, $list['id']);
        $this->assertEquals($postWithCover->user->name, $list['author']['name']);
    }
}
