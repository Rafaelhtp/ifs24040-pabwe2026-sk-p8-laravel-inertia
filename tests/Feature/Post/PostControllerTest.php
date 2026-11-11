<?php

namespace Tests\Feature\Post;

use App\Features\Ai\Contracts\AiClientInterface;
use App\Features\Ai\DTO\GeneratedPostItem;
use App\Features\Post\Models\Post;
use App\Models\User;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Illuminate\Http\UploadedFile;
use Illuminate\Support\Facades\Storage;
use Inertia\Testing\AssertableInertia as Assert;
use PhpOffice\PhpSpreadsheet\Spreadsheet;
use PhpOffice\PhpSpreadsheet\Writer\Xlsx;
use RuntimeException;
use Symfony\Component\HttpFoundation\StreamedResponse;
use Tests\TestCase;

class PostControllerTest extends TestCase
{
    use RefreshDatabase;

    protected function setUp(): void
    {
        parent::setUp();
        Storage::fake('public');
    }

    public function test_guest_cannot_access_dashboard_posts(): void
    {
        $this->get('/dashboard/posts')->assertRedirect(route('login'));
    }

    public function test_member_crud_publish_and_cover(): void
    {
        $user = User::factory()->member()->create();
        $other = User::factory()->member()->create();
        $otherPost = Post::factory()->create(['user_id' => $other->id]);

        $this->actingAs($user)
            ->post('/dashboard/posts', ['title' => '', 'category' => 'Invalid'])
            ->assertSessionHasErrors(['title', 'category', 'content']);

        $this->actingAs($user)
            ->post('/dashboard/posts', [
                'title' => 'Artikel Baru',
                'category' => 'Teknologi',
                'excerpt' => 'Ringkasan',
                'content' => '## Isi Artikel',
                'is_published' => false,
            ])
            ->assertSessionHasNoErrors()
            ->assertSessionHas('success');

        $post = Post::where('user_id', $user->id)->firstOrFail();

        $this->actingAs($user)
            ->get('/dashboard/posts?search=Artikel&status=draft&category=Teknologi')
            ->assertStatus(200)
            ->assertInertia(fn (Assert $page) => $page
                ->component('Post/Index')
                ->has('posts.data', 1)
                ->where('stats.total', 1)
            );

        $this->actingAs($user)
            ->get("/dashboard/posts/{$post->id}")
            ->assertStatus(200)
            ->assertInertia(fn (Assert $page) => $page
                ->component('Post/Show')
                ->where('post.title', 'Artikel Baru')
            );

        $this->actingAs($user)
            ->put("/dashboard/posts/{$post->id}", [
                'title' => 'Artikel Diperbarui',
                'category' => 'Pendidikan',
                'excerpt' => 'Ringkasan baru',
                'content' => '## Isi Baru',
                'is_published' => true,
            ])
            ->assertSessionHas('success');

        $this->assertTrue($post->fresh()->is_published);

        $this->actingAs($user)
            ->patch("/dashboard/posts/{$post->id}/publish")
            ->assertSessionHas('success');
        $this->assertFalse($post->fresh()->is_published);

        $file = UploadedFile::fake()->image('cover.jpg', 600, 400);
        $this->actingAs($user)
            ->post("/dashboard/posts/{$post->id}/cover", ['coverPhoto' => $file])
            ->assertSessionHas('success');
        $this->assertNotNull($post->fresh()->cover_image_path);

        $this->actingAs($user)
            ->delete("/dashboard/posts/{$post->id}/cover")
            ->assertSessionHas('success');
        $this->assertNull($post->fresh()->cover_image_path);

        // Ownership checks against another user's post
        $this->actingAs($user)->get("/dashboard/posts/{$otherPost->id}")->assertStatus(403);
        $this->actingAs($user)->put("/dashboard/posts/{$otherPost->id}", [])->assertStatus(403);
        $this->actingAs($user)->delete("/dashboard/posts/{$otherPost->id}")->assertStatus(403);

        $this->actingAs($user)
            ->delete("/dashboard/posts/{$post->id}")
            ->assertRedirect(route('posts.index'));
        $this->assertDatabaseMissing('posts', ['id' => $post->id]);
    }

    public function test_export_import_and_ai_endpoints(): void
    {
        $user = User::factory()->member()->create();
        Post::factory()->count(2)->create(['user_id' => $user->id]);

        $export = $this->actingAs($user)->get('/dashboard/posts/export');
        $this->assertInstanceOf(StreamedResponse::class, $export->baseResponse);

        $spreadsheet = new Spreadsheet();
        $spreadsheet->getActiveSheet()->fromArray([
            ['No', 'Judul', 'Kategori', 'Ringkasan', 'Konten', 'Status'],
            [1, 'Impor Artikel 1', 'Teknologi', 'Ringkas', '## Konten', 'Published'],
        ]);
        $tempFile = tempnam(sys_get_temp_dir(), 'import_post_').'.xlsx';
        (new Xlsx($spreadsheet))->save($tempFile);

        $uploaded = new UploadedFile($tempFile, 'import.xlsx', 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet', null, true);
        $this->actingAs($user)
            ->post('/dashboard/posts/import', ['importFile' => $uploaded])
            ->assertSessionHas('success');
        @unlink($tempFile);

        $this->assertDatabaseHas('posts', ['title' => 'Impor Artikel 1']);

        // AI success (JSON + Redirect)
        $stubAi = $this->createStub(AiClientInterface::class);
        $stubAi->method('generatePosts')->willReturn([
            new GeneratedPostItem('AI Artikel', 'Teknologi', 'Ringkas AI', '## Isi AI'),
        ]);
        $this->app->instance(AiClientInterface::class, $stubAi);

        $this->actingAs($user)
            ->postJson('/dashboard/posts/ai-generate', ['prompt' => 'Topik teknologi', 'count' => 1])
            ->assertStatus(200)
            ->assertJsonPath('items.0.title', 'AI Artikel');

        $this->actingAs($user)
            ->post('/dashboard/posts/ai-generate', ['aiPrompt' => 'Topik teknologi', 'aiCount' => 1])
            ->assertSessionHas('aiGeneratedItems');

        // AI failure (JSON + Redirect)
        $failAi = $this->createStub(AiClientInterface::class);
        $failAi->method('generatePosts')->willThrowException(new RuntimeException('Quota habis'));
        $this->app->instance(AiClientInterface::class, $failAi);

        $this->actingAs($user)
            ->postJson('/dashboard/posts/ai-generate', ['prompt' => 'Topik teknologi'])
            ->assertStatus(422);

        $this->actingAs($user)
            ->post('/dashboard/posts/ai-generate', ['prompt' => 'Topik teknologi'])
            ->assertSessionHas('error');

        // AI fallback in browser mode (!app()->runningUnitTests()) for both JSON and redirect
        $previousEnv = $this->app['env'];
        try {
            $this->app['env'] = 'local';
            $controller = new \App\Features\Post\Controllers\PostController();

            $jsonReq = \Illuminate\Http\Request::create('/dashboard/posts/ai-generate', 'POST', ['prompt' => 'Topik teknologi', 'count' => 2]);
            $jsonReq->headers->set('Accept', 'application/json');
            $jsonRes = $controller->generateAi($jsonReq, $failAi);
            $this->assertInstanceOf(\Illuminate\Http\JsonResponse::class, $jsonRes);
            $this->assertEquals(200, $jsonRes->getStatusCode());

            $webReq = \Illuminate\Http\Request::create('/dashboard/posts/ai-generate', 'POST', ['prompt' => 'Topik teknologi', 'count' => 2]);
            $redirectRes = $controller->generateAi($webReq, $failAi);
            $this->assertInstanceOf(\Illuminate\Http\RedirectResponse::class, $redirectRes);
        } finally {
            $this->app['env'] = $previousEnv;
        }

        // Save AI items (including skipping invalid item)
        $this->actingAs($user)
            ->post('/dashboard/posts/ai-save', [
                'items' => [
                    ['title' => 'Disimpan dari AI', 'category' => 'Bisnis', 'excerpt' => 'Ringkas', 'content' => '## Konten AI'],
                    ['title' => ''],
                ],
            ])
            ->assertSessionHas('success');

        $this->assertDatabaseHas('posts', ['title' => 'Disimpan dari AI', 'category' => 'Bisnis']);
    }
}
