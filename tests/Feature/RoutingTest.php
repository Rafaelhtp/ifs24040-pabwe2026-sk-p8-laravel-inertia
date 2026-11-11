<?php

namespace Tests\Feature;

use App\Models\User;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Inertia\Testing\AssertableInertia as Assert;
use Tests\TestCase;

class RoutingTest extends TestCase
{
    use RefreshDatabase;

    public function test_root_renders_public_posts_for_guest_and_member(): void
    {
        $this->get('/')
            ->assertStatus(200)
            ->assertInertia(fn (Assert $page) => $page
                ->component('Public/PostIndex')
                ->has('posts')
            );

        $member = User::factory()->member()->create();
        $this->actingAs($member)
            ->get('/')
            ->assertStatus(200)
            ->assertInertia(fn (Assert $page) => $page->component('Public/PostIndex'));
    }

    public function test_health_check_endpoint(): void
    {
        $this->get('/up')->assertStatus(200);
    }
}
