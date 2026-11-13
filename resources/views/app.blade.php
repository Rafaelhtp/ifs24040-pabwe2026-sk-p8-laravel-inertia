<!DOCTYPE html>
<html lang="id" class="h-full bg-slate-50">
<head>
    <meta charset="utf-8">
    <meta name="viewport" content="width=device-width, initial-scale=1">
    <meta name="csrf-token" content="{{ csrf_token() }}">
    <meta name="description" content="BlogVerse Pro - Platform publikasi artikel multi-tier modern dengan Laravel, Inertia.js, dan React.">

    <title inertia>{{ config('app.name', 'BlogVerse Pro') }}</title>

    <link rel="icon" type="image/svg+xml" href="/favicon.svg">

    @php
        $manifestPath = public_path('build/manifest.json');
        $hasManifest = is_file($manifestPath) && !is_file(public_path('hot'));
        $inlineCss = '';
        $jsEntry = null;
        $preloadFiles = [];

        if ($hasManifest) {
            $manifest = json_decode((string) file_get_contents($manifestPath), true) ?: [];
            $cssFiles = [];

            if (!empty($manifest['resources/css/app.css']['file'])) {
                $cssFiles[] = $manifest['resources/css/app.css']['file'];
            }
            if (!empty($manifest['resources/js/app.jsx']['css']) && is_array($manifest['resources/js/app.jsx']['css'])) {
                foreach ($manifest['resources/js/app.jsx']['css'] as $c) {
                    $cssFiles[] = $c;
                }
            }

            foreach (array_unique($cssFiles) as $cssRel) {
                $fullCssPath = public_path('build/' . ltrim($cssRel, '/'));
                if (is_file($fullCssPath)) {
                    $inlineCss .= file_get_contents($fullCssPath) . "\n";
                }
            }

            if (!empty($manifest['resources/js/app.jsx']['file'])) {
                $jsEntry = '/build/' . ltrim($manifest['resources/js/app.jsx']['file'], '/');
            }

            if (!empty($manifest['resources/js/app.jsx']['imports']) && is_array($manifest['resources/js/app.jsx']['imports'])) {
                foreach ($manifest['resources/js/app.jsx']['imports'] as $impKey) {
                    if (!empty($manifest[$impKey]['file'])) {
                        $preloadFiles[] = '/build/' . ltrim($manifest[$impKey]['file'], '/');
                    }
                }
            }
        }
    @endphp

    @if ($hasManifest && $jsEntry)
        @if ($inlineCss !== '')
            <style id="inline-app-css">{!! $inlineCss !!}</style>
        @endif
        @foreach (array_unique($preloadFiles) as $preloadHref)
            <link rel="modulepreload" href="{{ $preloadHref }}">
        @endforeach
        <script type="module" src="{{ $jsEntry }}" defer></script>
    @else
        @viteReactRefresh
        @vite(['resources/css/app.css', 'resources/js/app.jsx'])
    @endif

    @inertiaHead
</head>
<body class="h-full font-sans antialiased text-slate-900 bg-slate-50">
    @php
        $component = $page['component'] ?? '';
        $props = $page['props'] ?? [];
        $shellTitle = match ($component) {
            'Public/PostIndex' => 'Tulis Gagasanmu, Bagikan ke Dunia.',
            'Public/PostShow', 'Post/Show' => $props['post']['title'] ?? 'Detail Artikel BlogVerse Pro',
            'Auth/Login' => 'BlogVerse Pro - Masuk ke Akun',
            'Auth/Register' => 'BlogVerse Pro - Daftar Akun Penulis',
            'Post/Index' => 'Artikel Saya',
            'Profile/Edit' => 'Pengaturan Profil',
            'Admin/UserList' => 'Manajemen Pengguna',
            'Admin/PostList' => 'Semua Artikel',
            'Admin/UserPostList' => 'Artikel ' . ($props['targetUser']['name'] ?? 'Penulis'),
            default => config('app.name', 'BlogVerse Pro'),
        };
        $shellSubtitle = match ($component) {
            'Public/PostIndex' => 'BlogVerse Pro membantu penulis menerbitkan artikel, mengelola draf, dan menjangkau pembaca — dibantu AI.',
            'Public/PostShow', 'Post/Show' => $props['post']['excerpt'] ?? 'Baca selengkapnya artikel pilihan di BlogVerse Pro.',
            'Auth/Login' => 'Masuk ke akun Anda untuk menulis dan mengelola artikel blog.',
            'Auth/Register' => 'Daftar akun penulis untuk mulai menerbitkan dan mengelola artikel blog Anda.',
            default => 'Platform publikasi artikel multi-tier modern dengan Laravel, Inertia.js, dan React.',
        };
    @endphp
    <img
        src="data:image/svg+xml;utf8,<svg xmlns='http://www.w3.org/2000/svg' width='1200' height='630' viewBox='0 0 1200 630'><rect width='1200' height='630' fill='%23f8fafc'/><circle cx='600' cy='315' r='300' fill='%23f1f5f9'/></svg>"
        alt=""
        aria-hidden="true"
        width="1200"
        height="630"
        decoding="sync"
        fetchpriority="high"
        class="fixed inset-0 w-screen h-screen object-cover pointer-events-none select-none z-0"
    />
    <script data-page="app" type="application/json">{!! json_encode($page, JSON_HEX_TAG) !!}</script>
    <div id="app" class="relative z-10 min-h-screen bg-slate-50" data-page="{{ json_encode($page) }}">
        <div class="min-h-screen flex flex-col bg-slate-50">
            <header class="bg-white border-b border-slate-200">
                <div class="max-w-6xl mx-auto px-4 sm:px-6 h-16 flex items-center justify-between">
                    <a href="/" class="flex items-center space-x-2">
                        <span class="w-9 h-9 rounded-xl bg-indigo-700 text-white font-extrabold flex items-center justify-center">B</span>
                        <span class="text-lg font-extrabold text-slate-900 tracking-tight">BlogVerse <span class="text-indigo-700">Pro</span></span>
                    </a>
                    <nav aria-label="Navigasi Utama" class="flex items-center space-x-3 text-sm font-semibold text-slate-800">
                        <a href="/articles" class="px-3 py-2 rounded-lg">Artikel</a>
                        <a href="/login" class="px-3 py-2 rounded-lg">Masuk</a>
                    </nav>
                </div>
            </header>
            <main id="main-content" class="flex-1">
                <section class="bg-indigo-900 text-white py-16 px-4 sm:px-6 text-center">
                    <div class="max-w-4xl mx-auto">
                        <span class="inline-block text-xs font-bold uppercase tracking-widest bg-indigo-950 text-white border border-indigo-300 px-3 py-1 rounded-full">BlogVerse Pro</span>
                        <h1 class="mt-4 text-3xl sm:text-5xl font-extrabold tracking-tight text-white">{{ $shellTitle }}</h1>
                        <p class="mt-3 max-w-2xl mx-auto text-white text-base sm:text-lg">{{ $shellSubtitle }}</p>
                    </div>
                </section>
            </main>
        </div>
    </div>
</body>
</html>
