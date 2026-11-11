<?php

namespace Tests\Unit\Services;

use App\Features\Ai\Services\OpenAiPostGeneratorService;
use Illuminate\Support\Facades\Http;
use RuntimeException;
use Tests\TestCase;

class OpenAiPostGeneratorServiceTest extends TestCase
{
    public function test_empty_prompt_throws_exception(): void
    {
        $service = new OpenAiPostGeneratorService('https://api.openai.com/v1', 'mock-key', 'gpt-4o-mini');

        $this->expectException(RuntimeException::class);
        $this->expectExceptionMessage('Prompt tidak boleh kosong.');
        $service->generatePosts('   ');
    }

    public function test_successful_generation(): void
    {
        Http::fake([
            'https://api.openai.com/v1/chat/completions' => Http::response([
                'choices' => [[
                    'message' => [
                        'content' => json_encode([
                            'posts' => [
                                ['title' => 'Artikel 1', 'category' => 'Teknologi', 'excerpt' => 'Ringkas', 'content' => '## Isi 1'],
                                ['title' => 'Artikel 2', 'category' => 'KategoriAsing', 'excerpt' => '', 'content' => '## Isi 2'],
                            ],
                        ]),
                    ],
                ]],
            ], 200),
        ]);

        $service = new OpenAiPostGeneratorService('https://api.openai.com/v1', 'mock-key', 'gpt-4o-mini');
        $results = $service->generatePosts('Buatkan 2 artikel', 2);

        $this->assertCount(2, $results);
        $this->assertEquals('Artikel 1', $results[0]->title);
        $this->assertEquals('Teknologi', $results[0]->category);
        $this->assertEquals('Ringkas', $results[0]->excerpt);

        $this->assertEquals('Artikel 2', $results[1]->title);
        $this->assertEquals('Umum', $results[1]->category);
        $this->assertNull($results[1]->excerpt);
    }

    public function test_api_failure_throws_exception(): void
    {
        Http::fake([
            'https://api.openai.com/v1/chat/completions' => Http::response([
                'error' => ['message' => 'Invalid API Key provided'],
            ], 401),
        ]);

        $service = new OpenAiPostGeneratorService('https://api.openai.com/v1', 'mock-key', 'gpt-4o-mini');

        $this->expectException(RuntimeException::class);
        $this->expectExceptionMessage('OpenAI API Error: Invalid API Key provided');
        $service->generatePosts('Topik artikel');
    }

    public function test_parse_content_variants_and_errors(): void
    {
        $service = new OpenAiPostGeneratorService('https://api.openai.com/v1', 'mock-key', 'gpt-4o-mini');

        $fenced = "```json\n[{\"title\": \"Fence\", \"content\": \"Isi\"}]\n```";
        $results = $service->parseContent($fenced);
        $this->assertCount(1, $results);
        $this->assertEquals('Fence', $results[0]->title);

        try {
            $service->parseContent('not-json');
            $this->fail('Expected exception');
        } catch (RuntimeException $e) {
            $this->assertStringContainsString('tidak valid', $e->getMessage());
        }

        try {
            $service->parseContent('{"posts": []}');
            $this->fail('Expected exception');
        } catch (RuntimeException $e) {
            $this->assertStringContainsString('Tidak ada artikel', $e->getMessage());
        }

        try {
            $service->parseContent('{"posts": [{"bad": "item"}]}');
            $this->fail('Expected exception');
        } catch (RuntimeException $e) {
            $this->assertStringContainsString('tidak sesuai spesifikasi', $e->getMessage());
        }
    }

    public function test_constructor_normalizes_endpoint_and_key(): void
    {
        Http::fake([
            'https://ai.example.com/v1/chat/completions' => Http::response([
                'choices' => [['message' => ['content' => '{"posts":[{"title":"A","content":"B"}]}']]],
            ]),
            'https://api.openai.com/v1/chat/completions' => Http::response([
                'choices' => [['message' => ['content' => '{"posts":[{"title":"A","content":"B"}]}']]],
            ]),
        ]);

        $swapped = new OpenAiPostGeneratorService('sk-secret-key', 'https://ai.example.com/v1');
        $this->assertCount(1, $swapped->generatePosts('Topik'));

        $noScheme = new OpenAiPostGeneratorService('api.openai.com/v1', 'mock-key');
        $this->assertCount(1, $noScheme->generatePosts('Topik'));
    }

    public function test_generate_fallback_posts_and_category_detection(): void
    {
        $service = new OpenAiPostGeneratorService();

        $tech = $service->generateFallbackPosts('keamanan cybersecurity dan pemrograman web', 2);
        $this->assertCount(2, $tech);
        $this->assertEquals('Teknologi', $tech[0]->category);
        $this->assertStringContainsString('## Pendahuluan', $tech[0]->content);
        $this->assertStringContainsString('## Kesimpulan', $tech[0]->content);

        $edu = $service->generateFallbackPosts('tips belajar efektif di kampus', 1);
        $this->assertEquals('Pendidikan', $edu[0]->category);

        $biz = $service->generateFallbackPosts('strategi bisnis dan investasi', 1);
        $this->assertEquals('Bisnis', $biz[0]->category);

        $life = $service->generateFallbackPosts('menjaga kesehatan dan olahraga', 1);
        $this->assertEquals('Gaya Hidup', $life[0]->category);

        $opini = $service->generateFallbackPosts('opini budaya modern', 1);
        $this->assertEquals('Opini', $opini[0]->category);

        $umum = $service->generateFallbackPosts('catatan ringan sore hari', 1);
        $this->assertEquals('Umum', $umum[0]->category);
    }
}
