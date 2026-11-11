<?php

namespace Tests\Feature\Admin;

use App\Features\Post\Models\Post;
use App\Models\User;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Inertia\Testing\AssertableInertia as Assert;
use Symfony\Component\HttpFoundation\StreamedResponse;
use Tests\TestCase;

class AdminUserControllerTest extends TestCase
{
    use RefreshDatabase;

    public function test_member_forbidden_from_admin_pages(): void
    {
        $member = User::factory()->member()->create();
        $targetUser = User::factory()->member()->create();

        $this->actingAs($member)->get('/admin/users')->assertStatus(403);
        $this->actingAs($member)->get("/admin/users/{$targetUser->id}/posts")->assertStatus(403);
        $this->actingAs($member)->get("/admin/users/{$targetUser->id}/posts/export")->assertStatus(403);
        $this->actingAs($member)->get('/admin/posts')->assertStatus(403);
        $this->actingAs($member)->get('/admin/posts/export')->assertStatus(403);
    }

    public function test_admin_can_view_user_list_and_user_posts_and_all_posts(): void
    {
        $admin = User::factory()->admin()->create();
        $targetUser = User::factory()->member()->create(['name' => 'Doni Target']);
        Post::factory()->published()->create(['user_id' => $targetUser->id, 'title' => 'Artikel Doni', 'category' => 'Teknologi']);

        $this->actingAs($admin)
            ->get('/admin/users?search=Doni')
            ->assertStatus(200)
            ->assertInertia(fn (Assert $page) => $page
                ->component('Admin/UserList')
                ->where('users.data.0.name', 'Doni Target')
                ->where('users.data.0.posts_count', 1)
            );

        $this->actingAs($admin)
            ->get("/admin/users/{$targetUser->id}/posts?search=Artikel&status=published&category=Teknologi")
            ->assertStatus(200)
            ->assertInertia(fn (Assert $page) => $page
                ->component('Admin/UserPostList')
                ->where('targetUser.name', 'Doni Target')
                ->has('posts.data', 1)
            );

        $this->actingAs($admin)
            ->get('/admin/posts?search=Artikel')
            ->assertStatus(200)
            ->assertInertia(fn (Assert $page) => $page
                ->component('Admin/PostList')
                ->has('posts.data', 1)
            );

        $export1 = $this->actingAs($admin)->get("/admin/users/{$targetUser->id}/posts/export");
        $this->assertInstanceOf(StreamedResponse::class, $export1->baseResponse);

        $export2 = $this->actingAs($admin)->get('/admin/posts/export');
        $this->assertInstanceOf(StreamedResponse::class, $export2->baseResponse);
    }
}
