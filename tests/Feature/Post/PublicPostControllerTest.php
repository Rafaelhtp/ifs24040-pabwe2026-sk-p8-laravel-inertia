<?php

namespace Tests\Feature\Post;

use App\Features\Post\Models\Post;
use App\Models\User;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Inertia\Testing\AssertableInertia as Assert;
use Tests\TestCase;

class PublicPostControllerTest extends TestCase
{
    use RefreshDatabase;

    public function test_guest_can_view_and_filter_public_articles(): void
    {
        $author = User::factory()->create();
        $pub = Post::factory()->published()->create([
            'user_id' => $author->id,
            'title' => 'Panduan Laravel',
            'slug' => 'panduan-laravel',
            'category' => 'Teknologi',
        ]);
        Post::factory()->draft()->create([
            'user_id' => $author->id,
            'title' => 'Rahasia Draf',
            'slug' => 'rahasia-draf',
        ]);

        $this->get('/articles?search=Panduan&category=Teknologi')
            ->assertStatus(200)
            ->assertInertia(fn (Assert $page) => $page
                ->component('Public/PostIndex')
                ->has('posts.data', 1)
                ->where('posts.data.0.title', 'Panduan Laravel')
            );

        $this->get("/articles/{$pub->slug}")
            ->assertStatus(200)
            ->assertInertia(fn (Assert $page) => $page
                ->component('Public/PostShow')
                ->where('post.slug', $pub->slug)
            );

        $this->get('/articles/rahasia-draf')->assertNotFound();
    }
}
