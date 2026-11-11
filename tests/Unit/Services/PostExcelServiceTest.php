<?php

namespace Tests\Unit\Services;

use App\Features\Post\Models\Post;
use App\Features\Post\Repositories\PostRepository;
use App\Features\Post\Services\PostExcelService;
use App\Features\Post\Services\PostService;
use App\Models\User;
use Illuminate\Foundation\Testing\RefreshDatabase;
use PhpOffice\PhpSpreadsheet\Spreadsheet;
use PhpOffice\PhpSpreadsheet\Writer\Xlsx;
use Symfony\Component\HttpFoundation\StreamedResponse;
use Tests\TestCase;

class PostExcelServiceTest extends TestCase
{
    use RefreshDatabase;

    protected PostExcelService $service;

    protected function setUp(): void
    {
        parent::setUp();
        $repo = new PostRepository();
        $this->service = new PostExcelService($repo, new PostService($repo));
    }

    public function test_build_spreadsheet_and_export_response(): void
    {
        $user = User::factory()->create();
        Post::factory()->published()->create(['user_id' => $user->id]);
        Post::factory()->draft()->create(['user_id' => $user->id]);
        $posts = $user->posts()->get();

        $spreadsheet = $this->service->buildSpreadsheet($posts, 'Artikel Test');
        $this->assertInstanceOf(Spreadsheet::class, $spreadsheet);
        $this->assertEquals('Artikel Test', $spreadsheet->getActiveSheet()->getTitle());

        $response = $this->service->exportToResponse($posts, 'artikel.xlsx');
        $this->assertInstanceOf(StreamedResponse::class, $response);

        ob_start();
        $response->sendContent();
        $this->assertNotEmpty(ob_get_clean());
    }

    public function test_import_spreadsheet(): void
    {
        $user = User::factory()->create();

        $spreadsheet = new Spreadsheet();
        $sheet = $spreadsheet->getActiveSheet();
        $sheet->fromArray([
            ['No', 'Judul', 'Kategori', 'Ringkasan', 'Konten', 'Status'],
            [1, 'Artikel Impor', 'Teknologi', 'Ringkas', '## Isi 1', 'Published'],
            [2, 'Artikel Impor', 'KategoriTidakValid', '-', '## Isi 2', 'Draft'],
            [3, '', 'Umum', '', 'Tanpa judul', 'Draft'],
            [4, 'Tanpa Konten', 'Umum', '', '', 'Draft'],
        ]);

        $tempPath = tempnam(sys_get_temp_dir(), 'post_excel_').'.xlsx';
        (new Xlsx($spreadsheet))->save($tempPath);

        $result = $this->service->import($tempPath, $user->id);
        @unlink($tempPath);

        $this->assertEquals(2, $result['imported']);
        $this->assertCount(2, $result['errors']);
        $this->assertDatabaseHas('posts', ['slug' => 'artikel-impor', 'is_published' => true]);
        $this->assertDatabaseHas('posts', ['slug' => 'artikel-impor-2', 'category' => 'Umum', 'is_published' => false]);
    }
}
