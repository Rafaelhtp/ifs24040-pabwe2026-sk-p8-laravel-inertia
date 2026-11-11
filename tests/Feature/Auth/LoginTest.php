<?php

namespace Tests\Feature\Auth;

use App\Models\User;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Illuminate\Support\Facades\Hash;
use Inertia\Testing\AssertableInertia as Assert;
use Tests\TestCase;

class LoginTest extends TestCase
{
    use RefreshDatabase;

    public function test_can_render_login_page(): void
    {
        $this->get('/login')
            ->assertStatus(200)
            ->assertInertia(fn (Assert $page) => $page->component('Auth/Login'));
    }

    public function test_login_validation_and_invalid_credentials(): void
    {
        $this->post('/login', ['login' => '', 'password' => ''])
            ->assertSessionHasErrors(['login', 'password']);

        User::factory()->create([
            'username' => 'existing_user',
            'email' => 'user@test.com',
            'password' => Hash::make('correct-password'),
        ]);

        $this->post('/login', ['login' => 'user@test.com', 'password' => 'wrong'])
            ->assertSessionHasErrors(['login']);

        $this->post('/login', ['login' => 'existing_user', 'password' => 'wrong'])
            ->assertSessionHasErrors(['login']);

        $this->assertGuest();
    }

    public function test_member_and_admin_login_redirects_and_logout(): void
    {
        $member = User::factory()->member()->create([
            'username' => 'member1',
            'email' => 'member@test.com',
            'password' => Hash::make('password123'),
        ]);

        $this->post('/login', ['login' => 'member@test.com', 'password' => 'password123', 'remember' => true])
            ->assertRedirect(route('posts.index'));
        $this->post('/logout')->assertRedirect(route('login'));

        $this->post('/login', ['login' => $member->username, 'password' => 'password123'])
            ->assertRedirect(route('posts.index'));
        $this->post('/logout');

        User::factory()->admin()->create([
            'username' => 'superadmin',
            'password' => Hash::make('password123'),
        ]);

        $this->post('/login', ['login' => 'superadmin', 'password' => 'password123'])
            ->assertRedirect(route('admin.users'));
    }
}
