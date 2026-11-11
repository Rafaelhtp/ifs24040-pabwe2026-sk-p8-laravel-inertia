<?php

namespace Tests\Unit\DTO;

use App\Features\Ai\DTO\GeneratedPostItem;
use PHPUnit\Framework\TestCase;

class GeneratedPostItemTest extends TestCase
{
    public function test_dto_properties_and_to_array(): void
    {
        $dto = new GeneratedPostItem(
            title: 'Belajar Laravel 13',
            category: 'Teknologi',
            excerpt: 'Ringkasan singkat artikel',
            content: '## Pendahuluan'
        );

        $this->assertEquals('Belajar Laravel 13', $dto->title);
        $this->assertEquals('Teknologi', $dto->category);
        $this->assertEquals('Ringkasan singkat artikel', $dto->excerpt);
        $this->assertEquals('## Pendahuluan', $dto->content);

        $this->assertEquals([
            'title' => 'Belajar Laravel 13',
            'category' => 'Teknologi',
            'excerpt' => 'Ringkasan singkat artikel',
            'content' => '## Pendahuluan',
        ], $dto->toArray());
    }
}
