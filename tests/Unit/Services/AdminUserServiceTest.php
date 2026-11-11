<?php

namespace Tests\Unit\Services;

use App\Features\Admin\Services\AdminUserService;
use App\Features\Post\Models\Post;
use App\Features\Post\Repositories\PostRepository;
use App\Models\User;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Tests\TestCase;

class AdminUserServiceTest extends TestCase
{
    use RefreshDatabase;

    protected AdminUserService $service;

    protected function setUp(): void
    {
        parent::setUp();
        $this->service = new AdminUserService(new PostRepository());
    }

    public function test_get_users_list_and_search(): void
    {
        User::factory()->create(['name' => 'Alice Wonder', 'email' => 'alice@test.com']);
        User::factory()->create(['name' => 'Bob Marley', 'email' => 'bob@test.com']);
        User::factory()->create(['name' => 'Charlie Chaplin', 'username' => 'charlie_legend', 'email' => 'charlie@test.com']);

        $this->assertCount(3, $this->service->getUsersList());
        $this->assertCount(1, $this->service->getUsersList(search: 'Alice'));
        $this->assertCount(1, $this->service->getUsersList(search: 'bob@test.com'));
        $this->assertCount(1, $this->service->getUsersList(search: 'charlie_legend'));
    }

    public function test_get_user_posts(): void
    {
        $user = User::factory()->create();
        Post::factory()->count(4)->create(['user_id' => $user->id]);

        $this->assertCount(4, $this->service->getUserPosts($user->id));
    }
}
