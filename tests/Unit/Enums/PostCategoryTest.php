<?php

namespace Tests\Unit\Enums;

use App\Features\Post\Enums\PostCategory;
use PHPUnit\Framework\TestCase;

class PostCategoryTest extends TestCase
{
    public function test_labels_and_values(): void
    {
        $this->assertEquals('Teknologi', PostCategory::Teknologi->label());
        $this->assertEquals('Pendidikan', PostCategory::Pendidikan->label());
        $this->assertEquals('Gaya Hidup', PostCategory::GayaHidup->label());
        $this->assertEquals('Bisnis', PostCategory::Bisnis->label());
        $this->assertEquals('Opini', PostCategory::Opini->label());
        $this->assertEquals('Umum', PostCategory::Umum->label());

        $this->assertCount(6, PostCategory::values());
        $this->assertContains('Gaya Hidup', PostCategory::values());
    }

    public function test_badge_classes(): void
    {
        $this->assertStringContainsString('blue', PostCategory::Teknologi->badgeClass());
        $this->assertStringContainsString('emerald', PostCategory::Pendidikan->badgeClass());
        $this->assertStringContainsString('pink', PostCategory::GayaHidup->badgeClass());
        $this->assertStringContainsString('amber', PostCategory::Bisnis->badgeClass());
        $this->assertStringContainsString('purple', PostCategory::Opini->badgeClass());
        $this->assertStringContainsString('slate', PostCategory::Umum->badgeClass());
    }
}
