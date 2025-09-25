<!DOCTYPE html>
<html lang="ar" dir="rtl">
<head>
    <meta charset="utf-8">
    <meta name="viewport" content="width=device-width, initial-scale=1, user-scalable=no">
    <meta name="csrf-token" content="{{ csrf_token() }}">

    <title>{{ config('app.name', 'نظام إدارة المبيعات') }}</title>

    <!-- PWA Meta Tags -->
    <meta name="theme-color" content="#2196F3">
    <meta name="apple-mobile-web-app-capable" content="yes">
    <meta name="apple-mobile-web-app-status-bar-style" content="default">
    <meta name="apple-mobile-web-app-title" content="Sales System">
    <meta name="mobile-web-app-capable" content="yes">
    <meta name="application-name" content="نظام إدارة المبيعات">
    <meta name="msapplication-TileColor" content="#2196F3">
    <meta name="msapplication-tap-highlight" content="no">

    <!-- PWA Icons -->
    <link rel="manifest" href="{{ asset('manifest.json') }}">
    <link rel="icon" type="image/png" sizes="32x32" href="{{ asset('images/icon-32x32.png') }}">
    <link rel="icon" type="image/png" sizes="16x16" href="{{ asset('images/icon-16x16.png') }}">
    <link rel="apple-touch-icon" href="{{ asset('images/icon-192x192.png') }}">
    <link rel="apple-touch-icon" sizes="152x152" href="{{ asset('images/icon-152x152.png') }}">
    <link rel="apple-touch-icon" sizes="180x180" href="{{ asset('images/icon-180x180.png') }}">

    <!-- Fonts -->
    <link rel="preconnect" href="https://fonts.bunny.net">
    <link href="https://fonts.bunny.net/css?family=figtree:400,500,600&display=swap" rel="stylesheet" />

    <!-- Scripts -->
    @vite(['resources/css/app.css', 'resources/js/app.js'])

    <!-- PWA Styles -->
    <link rel="stylesheet" href="{{ asset('css/pwa.css') }}">

    <!-- إصلاح النصوص البيضاء -->
    <link rel="stylesheet" href="{{ asset('css/text-fix.css') }}">

    <!-- إصلاح فوري للنصوص البيضاء -->
    <style>
        /* حماية النصوص من تأثيرات PWA */
        body:not(.pwa-splash-screen) * {
            color: inherit !important;
        }

        /* استثناءات لعناصر PWA فقط */
        .pwa-banner,
        .pwa-banner *,
        .pwa-splash-screen,
        .pwa-splash-screen *,
        .pwa-update-banner,
        .pwa-update-banner *,
        .pwa-welcome-message,
        .pwa-welcome-message * {
            color: white !important;
        }

        /* تأكيد أن النصوص العادية تحتفظ بلونها الأصلي */
        .sidebar-nav a,
        .main-content,
        .main-content *,
        .data-table,
        .data-table *,
        .form-group label,
        .form-group input,
        .btn {
            color: inherit !important;
        }
    </style>

    <!-- PWA Scripts -->
    <script src="{{ asset('js/pwa-simple.js') }}" defer></script>
</head>
<body class="antialiased">
    <div id="app">
        @yield('content')
    </div>
</body>
</html>
