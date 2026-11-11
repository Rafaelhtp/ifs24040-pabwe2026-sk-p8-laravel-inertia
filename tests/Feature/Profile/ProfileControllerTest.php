<?php

namespace Tests\Feature\Profile;

use App\Models\User;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Illuminate\Http\UploadedFile;
use Illuminate\Support\Facades\Hash;
use Illuminate\Support\Facades\Storage;
use Inertia\Testing\AssertableInertia as Assert;
use Tests\TestCase;

class ProfileControllerTest extends TestCase
{
    use RefreshDatabase;

    protected function setUp(): void
    {
        parent::setUp();
        Storage::fake('public');
    }

    public function test_profile_edit_and_update(): void
    {
        $this->get('/profile')->assertRedirect(route('login'));

        $user = User::factory()->create(['name' => 'Budi', 'username' => 'budi', 'email' => 'budi@test.com']);
        User::factory()->create(['username' => 'taken', 'email' => 'taken@test.com']);

        $this->actingAs($user)
            ->get('/profile')
            ->assertStatus(200)
            ->assertInertia(fn (Assert $page) => $page->component('Profile/Edit')->where('user.name', 'Budi'));

        $this->actingAs($user)
            ->patch('/profile', ['name' => '', 'username' => 'taken', 'email' => 'taken@test.com'])
            ->assertSessionHasErrors(['name', 'username', 'email']);

        $this->actingAs($user)
            ->patch('/profile', ['name' => 'Baru', 'username' => 'baru', 'email' => 'baru@test.com'])
            ->assertSessionHas('success');

        $this->assertEquals('Baru', $user->fresh()->name);
    }

    public function test_update_password_and_photo(): void
    {
        $user = User::factory()->create(['password' => Hash::make('old-password')]);

        $this->actingAs($user)
            ->put('/profile/password', [
                'current_password' => 'wrong',
                'password' => 'new-password-123',
                'password_confirmation' => 'new-password-123',
            ])
            ->assertSessionHasErrors(['current_password']);

        $this->actingAs($user)
            ->put('/profile/password', [
                'current_password' => 'old-password',
                'password' => 'new-strong-password',
                'password_confirmation' => 'new-strong-password',
            ])
            ->assertSessionHas('success');

        $file = UploadedFile::fake()->image('avatar.jpg', 300, 300);
        $this->actingAs($user)->post('/profile/photo', ['photo' => $file])->assertSessionHas('success');

        $img = imagecreatetruecolor(100, 100);
        ob_start();
        imagepng($img);
        $base64 = 'data:image/png;base64,'.base64_encode(ob_get_clean());
        imagedestroy($img);

        $this->actingAs($user)->post('/profile/photo', ['photo' => $base64])->assertSessionHas('success');
        $this->actingAs($user)->delete('/profile/photo')->assertSessionHas('success');
        $this->assertNull($user->fresh()->profile_photo_path);
    }
}
