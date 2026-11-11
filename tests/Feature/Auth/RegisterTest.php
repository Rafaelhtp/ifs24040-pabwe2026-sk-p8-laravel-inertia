<?php

namespace Tests\Feature\Auth;

use App\Models\User;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Inertia\Testing\AssertableInertia as Assert;
use Tests\TestCase;

class RegisterTest extends TestCase
{
    use RefreshDatabase;

    public function test_can_render_register_page(): void
    {
        $this->get('/register')
            ->assertStatus(200)
            ->assertInertia(fn (Assert $page) => $page->component('Auth/Register'));
    }

    public function test_register_validation_and_duplicate(): void
    {
        $this->post('/register', [
            'name' => '',
            'username' => '',
            'email' => 'not-an-email',
            'password' => 'short',
            'password_confirmation' => 'mismatch',
        ])->assertSessionHasErrors(['name', 'username', 'email', 'password']);

        User::factory()->create(['username' => 'existing_user', 'email' => 'duplicate@test.com']);

        $this->post('/register', [
            'name' => 'John Doe',
            'username' => 'existing_user',
            'email' => 'duplicate@test.com',
            'password' => 'password123',
            'password_confirmation' => 'password123',
        ])->assertSessionHasErrors(['username', 'email']);
    }

    public function test_successful_registration(): void
    {
        $this->post('/register', [
            'name' => 'New Member',
            'username' => 'new_member',
            'email' => 'newmember@test.com',
            'password' => 'password123',
            'password_confirmation' => 'password123',
        ])->assertRedirect(route('posts.index'));

        $this->assertAuthenticated();
        $this->assertDatabaseHas('users', ['username' => 'new_member', 'role' => 'member']);
    }
}
