<?php

namespace Tests\Unit\Services;

use App\Features\Profile\Services\ProfileService;
use App\Models\User;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Illuminate\Support\Facades\Hash;
use Illuminate\Support\Facades\Storage;
use RuntimeException;
use Tests\TestCase;

class ProfileServiceTest extends TestCase
{
    use RefreshDatabase;

    protected ProfileService $service;

    protected function setUp(): void
    {
        parent::setUp();
        $this->service = new ProfileService();
        Storage::fake('public');
    }

    public function test_update_profile_and_password(): void
    {
        $user = User::factory()->create([
            'name' => 'Old Name',
            'username' => 'old_user',
            'email' => 'old@test.com',
            'password' => Hash::make('old_password'),
        ]);

        $this->assertTrue($this->service->updateProfile($user, [
            'name' => 'New Name',
            'username' => 'new_user',
            'email' => 'new@test.com',
        ]));

        $this->assertTrue($this->service->updatePassword($user, 'new_secret_123'));

        $user->refresh();
        $this->assertEquals('New Name', $user->name);
        $this->assertTrue(Hash::check('new_secret_123', $user->password));
    }

    public function test_update_and_delete_profile_photo(): void
    {
        $user = User::factory()->create();

        $img = imagecreatetruecolor(100, 50);
        imagefilledrectangle($img, 0, 0, 99, 49, imagecolorallocate($img, 255, 0, 0));
        ob_start();
        imagepng($img);
        $binary = ob_get_clean();
        imagedestroy($img);

        // 1. Base64 data URI
        $savedPath = $this->service->updateProfilePhoto($user, 'data:image/png;base64,'.base64_encode($binary));
        Storage::disk('public')->assertExists($savedPath);

        // 2. Raw binary (also exercises replacing existing photo)
        $savedPath2 = $this->service->updateProfilePhoto($user->fresh(), $binary);
        Storage::disk('public')->assertExists($savedPath2);

        $this->assertTrue($this->service->deleteProfilePhoto($user->fresh()));
        $this->assertNull($user->fresh()->profile_photo_path);
    }

    public function test_update_profile_photo_with_invalid_image_throws_exception(): void
    {
        $user = User::factory()->create();

        $this->expectException(RuntimeException::class);
        $this->expectExceptionMessage('Format gambar tidak valid atau tidak didukung.');
        $this->service->updateProfilePhoto($user, 'not_a_valid_image_string');
    }
}
