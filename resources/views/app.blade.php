<!DOCTYPE html>
<html lang="id" class="h-full bg-slate-50">
<head>
    <meta charset="utf-8">
    <meta name="viewport" content="width=device-width, initial-scale=1">
    <meta name="csrf-token" content="{{ csrf_token() }}">
    <meta name="description" content="BlogVerse Pro - Platform publikasi artikel multi-tier modern dengan Laravel, Inertia.js, dan React.">

    <title inertia>{{ config('app.name', 'BlogVerse Pro') }}</title>

    <link rel="icon" type="image/svg+xml" href="/favicon.svg">

    @viteReactRefresh
    @vite(['resources/css/app.css', 'resources/js/app.jsx'])
    @inertiaHead
</head>
<body class="font-sans antialiased bg-slate-50 text-slate-900">
    <div aria-hidden="true" style="position:fixed;inset:0;z-index:0;pointer-events:none;display:flex;align-items:center;justify-content:center;color:rgba(15,23,42,0.015);font-size:4.5rem;font-weight:900;line-height:1.1;text-align:center;padding:2rem;user-select:none;">
        BlogVerse Pro Platform Publikasi Artikel Modern Indonesia
    </div>
    <div style="position:relative;z-index:1;">
        @inertia
    </div>
</body>
</html>
