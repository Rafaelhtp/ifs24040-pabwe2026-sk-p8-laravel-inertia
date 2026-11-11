<?php

namespace Database\Seeders;

use App\Features\Post\Models\Post;
use App\Models\User;
use Illuminate\Database\Console\Seeds\WithoutModelEvents;
use Illuminate\Database\Seeder;
use Illuminate\Support\Facades\Hash;

class DatabaseSeeder extends Seeder
{
    use WithoutModelEvents;

    /**
     * Seed the application's database.
     */
    public function run(): void
    {
        $admin = User::firstOrCreate(
            ['email' => 'admin@example.com'],
            [
                'name' => 'Administrator',
                'username' => 'admin',
                'password' => Hash::make('admin'),
                'role' => 'admin',
            ]
        );

        $member = User::firstOrCreate(
            ['email' => 'member@example.com'],
            [
                'name' => 'Member User',
                'username' => 'member',
                'password' => Hash::make('member'),
                'role' => 'member',
            ]
        );

        $samples = [
            [$admin, 'Selamat Datang di BlogVerse Pro', 'selamat-datang-di-blogverse-pro', 'Umum', 'Pengantar singkat tentang platform BlogVerse Pro.', "## Halo, Dunia!\n\nBlogVerse Pro adalah ruang menulis bagi siapa saja yang ingin berbagi **ide**, *pengalaman*, dan pengetahuan.", true, 5],
            [$member, 'Mengenal Arsitektur Laravel 13', 'mengenal-arsitektur-laravel-13', 'Teknologi', 'Memahami pendekatan feature-first pada Laravel 13.', "## Feature-First\n\nStruktur folder dikelompokkan berdasarkan fitur sehingga kode lebih mudah dirawat.\n\n- Controller\n- Service\n- Repository", true, 3],
            [$member, 'Tips Belajar Efektif untuk Mahasiswa', 'tips-belajar-efektif-untuk-mahasiswa', 'Pendidikan', 'Strategi sederhana agar belajar lebih fokus dan produktif.', "## Atur Waktu\n\nGunakan teknik **Pomodoro** untuk menjaga fokus belajar.", true, 1],
            [$member, 'Draf: Strategi Bisnis Digital 2026', 'draf-strategi-bisnis-digital-2026', 'Bisnis', 'Catatan awal tentang strategi bisnis digital.', "## Rencana\n\nTulisan ini masih dalam tahap penyusunan.", false, 0],
            [$member, 'Draf: Opini Tentang Kecerdasan Buatan', 'draf-opini-tentang-kecerdasan-buatan', 'Opini', 'Pandangan pribadi tentang dampak AI.', "## Pendapat Saya\n\nDraf opini yang belum dipublikasikan.", false, 0],
        ];

        foreach ($samples as [$author, $title, $slug, $category, $excerpt, $content, $published, $daysAgo]) {
            Post::firstOrCreate(
                ['slug' => $slug],
                [
                    'user_id' => $author->id,
                    'title' => $title,
                    'category' => $category,
                    'excerpt' => $excerpt,
                    'content' => $content,
                    'is_published' => $published,
                    'published_at' => $published ? now()->subDays($daysAgo) : null,
                ]
            );
        }
    }
}
