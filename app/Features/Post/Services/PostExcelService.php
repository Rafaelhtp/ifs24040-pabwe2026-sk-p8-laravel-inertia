<?php

namespace App\Features\Post\Services;

use App\Features\Post\Contracts\PostRepositoryInterface;
use App\Features\Post\Enums\PostCategory;
use App\Features\Post\Models\Post;
use Carbon\Carbon;
use Illuminate\Database\Eloquent\Collection;
use PhpOffice\PhpSpreadsheet\IOFactory;
use PhpOffice\PhpSpreadsheet\Spreadsheet;
use PhpOffice\PhpSpreadsheet\Style\Alignment;
use PhpOffice\PhpSpreadsheet\Style\Border;
use PhpOffice\PhpSpreadsheet\Style\Fill;
use PhpOffice\PhpSpreadsheet\Writer\Xlsx;
use Symfony\Component\HttpFoundation\StreamedResponse;

class PostExcelService
{
    public function __construct(
        protected PostRepositoryInterface $postRepository,
        protected PostService $postService,
    ) {}

    /**
     * Build a Spreadsheet instance containing posts data.
     *
     * @param Collection<int, Post> $posts
     */
    public function buildSpreadsheet(Collection $posts, string $sheetTitle = 'Artikel'): Spreadsheet
    {
        $spreadsheet = new Spreadsheet();
        $sheet = $spreadsheet->getActiveSheet();
        $sheet->setTitle(substr($sheetTitle, 0, 31));

        $headers = ['No', 'Judul', 'Kategori', 'Ringkasan', 'Konten', 'Status', 'Tanggal Publikasi', 'Dibuat'];
        $columns = ['A', 'B', 'C', 'D', 'E', 'F', 'G', 'H'];

        foreach ($headers as $index => $header) {
            $sheet->setCellValue("{$columns[$index]}1", $header);
        }

        $headerRange = 'A1:H1';
        $sheet->getStyle($headerRange)->getFont()->setBold(true)->getColor()->setRGB('FFFFFF');
        $sheet->getStyle($headerRange)->getFill()->setFillType(Fill::FILL_SOLID)->getStartColor()->setRGB('4F46E5');
        $sheet->getStyle($headerRange)->getAlignment()->setHorizontal(Alignment::HORIZONTAL_CENTER);

        $rowNumber = 2;
        foreach ($posts as $idx => $post) {
            $sheet->setCellValue("A{$rowNumber}", $idx + 1);
            $sheet->setCellValue("B{$rowNumber}", $post->title);
            $sheet->setCellValue("C{$rowNumber}", $post->category);
            $sheet->setCellValue("D{$rowNumber}", $post->excerpt ?? '-');
            $sheet->setCellValue("E{$rowNumber}", $post->content);
            $sheet->setCellValue("F{$rowNumber}", $post->is_published ? 'Published' : 'Draft');
            $sheet->setCellValue("G{$rowNumber}", $post->published_at ? $post->published_at->format('Y-m-d H:i') : '-');
            $sheet->setCellValue("H{$rowNumber}", $post->created_at ? $post->created_at->format('Y-m-d H:i') : '-');
            $rowNumber++;
        }

        $lastRow = max(2, $rowNumber - 1);
        $sheet->getStyle("A1:H{$lastRow}")->getBorders()->getAllBorders()->setBorderStyle(Border::BORDER_THIN);

        foreach ($columns as $column) {
            $sheet->getColumnDimension($column)->setAutoSize(true);
        }

        return $spreadsheet;
    }

    /**
     * Export posts as a downloadable streamed response.
     *
     * @param Collection<int, Post> $posts
     */
    public function exportToResponse(Collection $posts, string $filename = 'artikel.xlsx'): StreamedResponse
    {
        $spreadsheet = $this->buildSpreadsheet($posts);

        return response()->streamDownload(function () use ($spreadsheet) {
            $writer = new Xlsx($spreadsheet);
            $writer->save('php://output');
        }, $filename, [
            'Content-Type' => 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
            'Cache-Control' => 'max-age=0',
        ]);
    }

    /**
     * Import posts from an uploaded spreadsheet file path.
     *
     * @return array{imported: int, errors: array<int, string>}
     */
    public function import(string $filePath, int $userId): array
    {
        $spreadsheet = IOFactory::load($filePath);
        $rows = $spreadsheet->getActiveSheet()->toArray(null, true, true, true);

        $errors = [];
        $records = [];
        $reservedSlugs = [];
        $now = Carbon::now();
        $validCategories = PostCategory::values();

        foreach ($rows as $rowIndex => $row) {
            // Skip header row
            if ($rowIndex === 1) {
                continue;
            }

            $title = trim((string) ($row['B'] ?? ''));
            $content = trim((string) ($row['E'] ?? ''));

            if ($title === '') {
                $errors[] = "Baris {$rowIndex}: judul kosong, dilewati.";

                continue;
            }

            if ($content === '') {
                $errors[] = "Baris {$rowIndex}: konten kosong, dilewati.";

                continue;
            }

            $category = trim((string) ($row['C'] ?? ''));
            $category = in_array($category, $validCategories, true) ? $category : PostCategory::Umum->value;

            $excerpt = trim((string) ($row['D'] ?? ''));
            $excerpt = ($excerpt === '' || $excerpt === '-') ? null : $excerpt;

            $isPublished = strtolower(trim((string) ($row['F'] ?? ''))) === 'published';

            $slug = $this->postService->generateUniqueSlug($title, null, $reservedSlugs);
            $reservedSlugs[] = $slug;

            $records[] = [
                'user_id' => $userId,
                'title' => substr($title, 0, 255),
                'slug' => $slug,
                'category' => $category,
                'excerpt' => $excerpt,
                'content' => $content,
                'is_published' => $isPublished,
                'published_at' => $isPublished ? $now : null,
                'created_at' => $now,
                'updated_at' => $now,
            ];
        }

        $this->postRepository->insertMany($records);

        return [
            'imported' => count($records),
            'errors' => $errors,
        ];
    }
}
