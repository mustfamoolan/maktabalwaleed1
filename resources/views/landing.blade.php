@extends('app')

@section('content')
<div class="min-h-screen bg-gradient-to-br from-blue-100 to-indigo-200 flex items-center justify-center">
    <div class="max-w-4xl mx-auto p-8">
        <div class="text-center mb-12">
            <img src="{{ asset('images/logo.png') }}" alt="شعار الشركة" class="mx-auto mb-6 h-24">
            <h1 class="text-4xl font-bold text-gray-800 mb-4">نظام إدارة المبيعات</h1>
            <p class="text-xl text-gray-600 mb-8">اختر القسم المطلوب للدخول إلى النظام</p>
        </div>

        <div class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            <!-- إدارة النظام -->
            <div class="bg-white rounded-lg shadow-lg hover:shadow-xl transition-shadow duration-300 overflow-hidden">
                <div class="bg-gradient-to-r from-blue-500 to-blue-600 text-white p-6 text-center">
                    <div class="text-4xl mb-3">👨‍💼</div>
                    <h3 class="text-lg font-semibold">إدارة النظام</h3>
                </div>
                <div class="p-6 text-center">
                    <p class="text-gray-600 mb-4">إدارة شاملة للنظام والموظفين</p>
                    <a href="{{ route('admin.login') }}"
                       class="inline-block bg-blue-500 hover:bg-blue-600 text-white px-6 py-2 rounded-lg transition-colors duration-200">
                        تسجيل الدخول
                    </a>
                </div>
            </div>

            <!-- المندوب -->
            <div class="bg-white rounded-lg shadow-lg hover:shadow-xl transition-shadow duration-300 overflow-hidden">
                <div class="bg-gradient-to-r from-green-500 to-green-600 text-white p-6 text-center">
                    <div class="text-4xl mb-3">🚗</div>
                    <h3 class="text-lg font-semibold">المندوب</h3>
                </div>
                <div class="p-6 text-center">
                    <p class="text-gray-600 mb-4">إدارة المبيعات والعملاء</p>
                    <button class="inline-block bg-gray-400 text-white px-6 py-2 rounded-lg cursor-not-allowed">
                        قريباً
                    </button>
                </div>
            </div>

            <!-- المورد -->
            <div class="bg-white rounded-lg shadow-lg hover:shadow-xl transition-shadow duration-300 overflow-hidden">
                <div class="bg-gradient-to-r from-orange-500 to-orange-600 text-white p-6 text-center">
                    <div class="text-4xl mb-3">🏢</div>
                    <h3 class="text-lg font-semibold">المورد</h3>
                </div>
                <div class="p-6 text-center">
                    <p class="text-gray-600 mb-4">إدارة الطلبات والفواتير</p>
                    <button class="inline-block bg-gray-400 text-white px-6 py-2 rounded-lg cursor-not-allowed">
                        قريباً
                    </button>
                </div>
            </div>

            <!-- السائق -->
            <div class="bg-white rounded-lg shadow-lg hover:shadow-xl transition-shadow duration-300 overflow-hidden">
                <div class="bg-gradient-to-r from-purple-500 to-purple-600 text-white p-6 text-center">
                    <div class="text-4xl mb-3">🚛</div>
                    <h3 class="text-lg font-semibold">السائق</h3>
                </div>
                <div class="p-6 text-center">
                    <p class="text-gray-600 mb-4">إدارة التوصيل والشحن</p>
                    <button class="inline-block bg-gray-400 text-white px-6 py-2 rounded-lg cursor-not-allowed">
                        قريباً
                    </button>
                </div>
            </div>
        </div>

        <div class="text-center mt-12">
            <p class="text-gray-500">© 2025 نظام إدارة المبيعات - جميع الحقوق محفوظة</p>
        </div>
    </div>
</div>
@endsection
