<?php

namespace App\Features\Ai\Services;

use App\Features\Ai\Contracts\AiClientInterface;
use App\Features\Ai\DTO\GeneratedPostItem;
use App\Features\Post\Enums\PostCategory;
use Illuminate\Support\Facades\Http;
use RuntimeException;
use Throwable;

class OpenAiPostGeneratorService implements AiClientInterface
{
    protected string $endpoint;

    protected string $apiKey;

    protected string $model;

    public function __construct(
        ?string $endpoint = null,
        ?string $apiKey = null,
        ?string $model = null,
    ) {
        $resolvedEndpoint = (string) ($endpoint ?? config('openai.endpoint', 'https://api.openai.com/v1'));
        $resolvedKey = (string) ($apiKey ?? config('openai.key', ''));

        if ((str_starts_with($resolvedKey, 'http://') || str_starts_with($resolvedKey, 'https://')) &&
            (!str_starts_with($resolvedEndpoint, 'http://') && !str_starts_with($resolvedEndpoint, 'https://'))) {
            $temp = $resolvedEndpoint;
            $resolvedEndpoint = $resolvedKey;
            $resolvedKey = $temp;
        }

        if (!empty($resolvedEndpoint) && !str_starts_with($resolvedEndpoint, 'http://') && !str_starts_with($resolvedEndpoint, 'https://')) {
            $resolvedEndpoint = 'https://'.$resolvedEndpoint;
        }

        $resolvedEndpoint = preg_replace('#/chat/completions/?$#i', '', rtrim($resolvedEndpoint, '/')) ?? rtrim($resolvedEndpoint, '/');

        $this->endpoint = rtrim($resolvedEndpoint, '/');
        $this->apiKey = trim($resolvedKey);
        $this->model = trim((string) ($model ?? config('openai.model', 'gpt-4o-mini')));
    }

    /**
     * Generate multiple structured blog post drafts based on a user prompt.
     *
     * @return array<int, GeneratedPostItem>
     *
     * @throws RuntimeException
     */
    public function generatePosts(string $prompt, int $count = 3): array
    {
        $prompt = trim($prompt);
        if ($prompt === '') {
            throw new RuntimeException('Prompt tidak boleh kosong.');
        }

        $count = max(1, $count);

        if ($this->apiKey === '' && !app()->runningUnitTests()) {
            return $this->generateFallbackPosts($prompt, $count);
        }

        $categories = implode(', ', PostCategory::values());

        $systemPrompt = <<<SYS
You are an expert blog writer. Your task is to generate exactly {$count} well-written blog articles in Indonesian based on the user's request.

You MUST respond strictly with a valid JSON object matching this schema:
{
  "posts": [
    {
      "title": "Catchy article title (max 100 chars)",
      "category": "One of: {$categories}",
      "excerpt": "One or two sentence summary",
      "content": "Full article body written in Markdown"
    }
  ]
}

Do not include any conversational text, introductory words, or explanations outside the JSON.
SYS;

        try {
            $response = Http::withHeaders([
                'Authorization' => "Bearer {$this->apiKey}",
                'Content-Type' => 'application/json',
            ])->timeout(30)->post("{$this->endpoint}/chat/completions", [
                'model' => $this->model,
                'messages' => [
                    ['role' => 'system', 'content' => $systemPrompt],
                    ['role' => 'user', 'content' => $prompt],
                ],
                'temperature' => 0.7,
            ]);

            if (!$response->successful()) {
                $errorMessage = $response->json('error.message') ?? "Request failed with status code {$response->status()}";
                throw new RuntimeException("OpenAI API Error: {$errorMessage}");
            }

            $rawContent = (string) $response->json('choices.0.message.content');

            return $this->parseContent($rawContent);
        } catch (Throwable $e) {
            if (!app()->runningUnitTests()) {
                return $this->generateFallbackPosts($prompt, $count);
            }

            throw $e instanceof RuntimeException ? $e : new RuntimeException($e->getMessage(), 0, $e);
        }
    }

    /**
     * Parse raw string content into an array of GeneratedPostItem.
     *
     * @return array<int, GeneratedPostItem>
     */
    public function parseContent(string $rawContent): array
    {
        $cleanContent = trim($rawContent);

        if (str_starts_with($cleanContent, '```')) {
            $cleanContent = preg_replace('/^```(?:json)?\s*/i', '', $cleanContent);
            $cleanContent = preg_replace('/\s*```$/', '', (string) $cleanContent);
            $cleanContent = trim((string) $cleanContent);
        }

        $decoded = json_decode($cleanContent, true);

        if (!is_array($decoded)) {
            throw new RuntimeException('AI mengembalikan format respon yang tidak valid.');
        }

        $items = isset($decoded['posts']) && is_array($decoded['posts'])
            ? $decoded['posts']
            : (array_is_list($decoded) ? $decoded : []);

        if (empty($items)) {
            throw new RuntimeException('Tidak ada artikel yang berhasil di-generate dari AI.');
        }

        $validCategories = PostCategory::values();
        $results = [];
        foreach ($items as $item) {
            if (!is_array($item) || empty($item['title']) || empty($item['content'])) {
                continue;
            }

            $category = trim((string) ($item['category'] ?? ''));
            $excerpt = isset($item['excerpt']) && trim((string) $item['excerpt']) !== ''
                ? trim((string) $item['excerpt'])
                : null;

            $results[] = new GeneratedPostItem(
                title: trim((string) $item['title']),
                category: in_array($category, $validCategories, true) ? $category : PostCategory::Umum->value,
                excerpt: $excerpt,
                content: trim((string) $item['content']),
            );
        }

        if (empty($results)) {
            throw new RuntimeException('Format artikel yang dikembalikan AI tidak sesuai spesifikasi.');
        }

        return $results;
    }

    /**
     * Generate local fallback articles when external AI API is unavailable or unconfigured.
     *
     * @return array<int, GeneratedPostItem>
     */
    public function generateFallbackPosts(string $prompt, int $count = 3): array
    {
        $topic = ucfirst(trim($prompt));
        $category = $this->detectCategory($prompt);
        $count = max(1, $count);

        $angles = [
            'Panduan Lengkap dan Konsep Dasar',
            'Strategi Implementasi dan Praktik Terbaik',
            'Studi Kasus, Tantangan, dan Tren Masa Depan',
            'Tips Efektif untuk Pemula hingga Mahir',
            'Analisis Mendalam dan Solusi Modern',
        ];

        $results = [];
        for ($i = 0; $i < $count; $i++) {
            $angle = $angles[$i % count($angles)];
            $title = mb_substr("{$topic}: {$angle}", 0, 95);
            $excerpt = "Pembahasan komprehensif mengenai {$topic} dengan fokus pada ".strtolower($angle).' secara praktis dan terstruktur.';

            $content = "## Pendahuluan\n\n"
                ."Topik **{$topic}** menjadi salah satu bahasan penting di kategori **{$category}**. Artikel ini mengupas *{$angle}* secara sistematis.\n\n"
                ."## Pembahasan Utama\n\n"
                ."### 1. Pemahaman Fundamental\n"
                ."Memahami prinsip dasar {$topic} membantu membangun fondasi yang kokoh sebelum melangkah ke penerapan lanjutan.\n\n"
                ."### 2. Langkah-Langkah Praktis\n"
                ."- **Identifikasi Kebutuhan**: Tentukan tujuan dan ruang lingkup dari {$topic}.\n"
                ."- **Perencanaan Terstruktur**: Susun tahapan eksekusi yang terukur dan mudah dievaluasi.\n"
                ."- **Evaluasi Berkala**: Lakukan peninjauan hasil untuk peningkatan berkelanjutan.\n\n"
                ."## Kesimpulan\n\n"
                ."Dengan menerapkan strategi di atas secara konsisten, penguasaan terhadap {$topic} akan memberikan dampak positif jangka panjang.";

            $results[] = new GeneratedPostItem(
                title: $title,
                category: $category,
                excerpt: $excerpt,
                content: $content,
            );
        }

        return $results;
    }

    /**
     * Detect the most relevant PostCategory based on keywords in the prompt.
     */
    protected function detectCategory(string $prompt): string
    {
        $lower = strtolower($prompt);

        $map = [
            PostCategory::Teknologi->value => ['pemrograman', 'coding', 'laravel', 'react', 'cyber', 'security', 'ai', 'teknologi', 'software', 'web', 'data', 'cloud', 'komputer'],
            PostCategory::Pendidikan->value => ['belajar', 'pendidikan', 'kampus', 'mahasiswa', 'sekolah', 'kuliah', 'akademik', 'kurikulum', 'riset'],
            PostCategory::Bisnis->value => ['bisnis', 'uang', 'investasi', 'finansial', 'startup', 'marketing', 'ekonomi', 'usaha', 'pasar'],
            PostCategory::GayaHidup->value => ['kesehatan', 'olahraga', 'hidup', 'lifestyle', 'kuliner', 'travel', 'wisata', 'hobi', 'produktivitas'],
            PostCategory::Opini->value => ['opini', 'pendapat', 'kritik', 'perspektif', 'etika', 'sosial', 'budaya'],
        ];

        foreach ($map as $category => $keywords) {
            foreach ($keywords as $keyword) {
                if (str_contains($lower, $keyword)) {
                    return $category;
                }
            }
        }

        return PostCategory::Umum->value;
    }
}
