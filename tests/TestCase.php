<?php

namespace Tests;

use Illuminate\Foundation\Testing\TestCase as BaseTestCase;

abstract class TestCase extends BaseTestCase
{
    protected function setUp(): void
    {
        parent::setUp();

        config()->set('inertia.testing.page_paths', [
            resource_path('js/Pages'),
            resource_path('js/pages'),
        ]);
        config()->set('inertia.pages.paths', [
            resource_path('js/Pages'),
            resource_path('js/pages'),
        ]);
    }
}
