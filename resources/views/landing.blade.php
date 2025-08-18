<!DOCTYPE html>
<html lang="ar" dir="rtl">
<head>
    <meta charset="utf-8">
    <meta name="viewport" content="width=device-width, initial-scale=1">
    <title>نظام إدارة المبيعات</title>

    <!-- Fonts -->
    <link rel="preconnect" href="https://fonts.bunny.net">
    <link href="https://fonts.bunny.net/css?family=figtree:400,500,600&display=swap" rel="stylesheet" />

    <!-- Tailwind CSS -->
    <script src="https://cdn.tailwindcss.com"></script>
</head>
<body class="antialiased bg-gradient-to-br from-gray-50 to-gray-100">
    <div class="min-h-screen">
        <!-- Header -->
        <div class="bg-white shadow-sm">
            <div class="container mx-auto px-4 py-6">
                <div class="text-center">
                    <h1 class="text-3xl md:text-4xl font-bold text-gray-800 mb-2">
                        نظام إدارة المبيعات المتكامل
                    </h1>
                    <p class="text-gray-600">
                        اختر نوع حسابك للوصول إلى النظام
                    </p>
                </div>
            </div>
        </div>

        <!-- Main Content -->
        <div class="container mx-auto px-4 py-8">
            <div class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-5 gap-6">

                <!-- إدارة المبيعات -->
                <a href="/sales-management" class="group cursor-pointer transform transition-all duration-300 hover:scale-105">
                    <div class="bg-white rounded-xl shadow-lg hover:shadow-xl transition-shadow duration-300 overflow-hidden">
                        <div class="h-24 bg-gradient-to-r from-blue-500 to-blue-600 flex items-center justify-center">
                            <span class="text-4xl">📊</span>
                        </div>
                        <div class="p-6">
                            <h3 class="text-xl font-bold text-gray-800 mb-2 text-center">
                                إدارة المبيعات
                            </h3>
                            <p class="text-gray-600 text-sm text-center leading-relaxed">
                                إدارة وتتبع المبيعات والتقارير
                            </p>
                            <div class="mt-4 text-center">
                                <span class="inline-block px-4 py-2 bg-gradient-to-r from-blue-500 to-blue-600 text-white text-sm font-medium rounded-lg group-hover:shadow-md transition-shadow duration-300">
                                    دخول النظام
                                </span>
                            </div>
                        </div>
                    </div>
                </a>

                <!-- المندوبين -->
                <a href="/representatives" class="group cursor-pointer transform transition-all duration-300 hover:scale-105">
                    <div class="bg-white rounded-xl shadow-lg hover:shadow-xl transition-shadow duration-300 overflow-hidden">
                        <div class="h-24 bg-gradient-to-r from-green-500 to-green-600 flex items-center justify-center">
                            <span class="text-4xl">👥</span>
                        </div>
                        <div class="p-6">
                            <h3 class="text-xl font-bold text-gray-800 mb-2 text-center">
                                المندوبين
                            </h3>
                            <p class="text-gray-600 text-sm text-center leading-relaxed">
                                إدارة مندوبي المبيعات والعملاء
                            </p>
                            <div class="mt-4 text-center">
                                <span class="inline-block px-4 py-2 bg-gradient-to-r from-green-500 to-green-600 text-white text-sm font-medium rounded-lg group-hover:shadow-md transition-shadow duration-300">
                                    دخول النظام
                                </span>
                            </div>
                        </div>
                    </div>
                </a>

                <!-- المجهزين -->
                <a href="/suppliers" class="group cursor-pointer transform transition-all duration-300 hover:scale-105">
                    <div class="bg-white rounded-xl shadow-lg hover:shadow-xl transition-shadow duration-300 overflow-hidden">
                        <div class="h-24 bg-gradient-to-r from-purple-500 to-purple-600 flex items-center justify-center">
                            <span class="text-4xl">📦</span>
                        </div>
                        <div class="p-6">
                            <h3 class="text-xl font-bold text-gray-800 mb-2 text-center">
                                المجهزين
                            </h3>
                            <p class="text-gray-600 text-sm text-center leading-relaxed">
                                إدارة الموردين والمخزون
                            </p>
                            <div class="mt-4 text-center">
                                <span class="inline-block px-4 py-2 bg-gradient-to-r from-purple-500 to-purple-600 text-white text-sm font-medium rounded-lg group-hover:shadow-md transition-shadow duration-300">
                                    دخول النظام
                                </span>
                            </div>
                        </div>
                    </div>
                </a>

                <!-- السائقين -->
                <a href="/drivers" class="group cursor-pointer transform transition-all duration-300 hover:scale-105">
                    <div class="bg-white rounded-xl shadow-lg hover:shadow-xl transition-shadow duration-300 overflow-hidden">
                        <div class="h-24 bg-gradient-to-r from-orange-500 to-orange-600 flex items-center justify-center">
                            <span class="text-4xl">🚚</span>
                        </div>
                        <div class="p-6">
                            <h3 class="text-xl font-bold text-gray-800 mb-2 text-center">
                                السائقين
                            </h3>
                            <p class="text-gray-600 text-sm text-center leading-relaxed">
                                إدارة عمليات التوصيل والشحن
                            </p>
                            <div class="mt-4 text-center">
                                <span class="inline-block px-4 py-2 bg-gradient-to-r from-orange-500 to-orange-600 text-white text-sm font-medium rounded-lg group-hover:shadow-md transition-shadow duration-300">
                                    دخول النظام
                                </span>
                            </div>
                        </div>
                    </div>
                </a>

                <!-- العملاء -->
                <a href="/customers" class="group cursor-pointer transform transition-all duration-300 hover:scale-105">
                    <div class="bg-white rounded-xl shadow-lg hover:shadow-xl transition-shadow duration-300 overflow-hidden">
                        <div class="h-24 bg-gradient-to-r from-pink-500 to-pink-600 flex items-center justify-center">
                            <span class="text-4xl">🛒</span>
                        </div>
                        <div class="p-6">
                            <h3 class="text-xl font-bold text-gray-800 mb-2 text-center">
                                العملاء
                            </h3>
                            <p class="text-gray-600 text-sm text-center leading-relaxed">
                                منطقة العملاء وإدارة الطلبات
                            </p>
                            <div class="mt-4 text-center">
                                <span class="inline-block px-4 py-2 bg-gradient-to-r from-pink-500 to-pink-600 text-white text-sm font-medium rounded-lg group-hover:shadow-md transition-shadow duration-300">
                                    دخول النظام
                                </span>
                            </div>
                        </div>
                    </div>
                </a>

            </div>
        </div>

        <!-- Footer -->
        <div class="mt-16 text-center text-gray-500 text-sm">
            <p>© 2025 نظام إدارة المبيعات. جميع الحقوق محفوظة.</p>
        </div>
    </div>
</body>
</html>
