@extends('app')

@section('content')
<div class="min-h-screen bg-gradient-to-br from-gray-100 to-gray-200 flex items-center justify-center">
    <div class="max-w-md w-full mx-4">
        <div class="bg-white rounded-lg shadow-xl overflow-hidden">
            <!-- Header -->
            <div class="bg-gradient-to-r from-blue-500 to-blue-600 px-6 py-8 text-center">
                <div class="text-white">
                    <div class="text-4xl mb-3">👨‍💼</div>
                    <h2 class="text-xl font-bold">تسجيل دخول الإدارة</h2>
                    <p class="text-blue-100 text-sm mt-2">أدخل بياناتك للوصول إلى لوحة التحكم</p>
                </div>
            </div>

            <!-- Form -->
            <div class="px-6 py-6">
                <form method="POST" action="{{ route('admin.login') }}" class="space-y-4">
                    @csrf

                    <!-- Phone -->
                    <div>
                        <label for="phone" class="block text-sm font-medium text-gray-700 mb-2">
                            رقم الهاتف
                        </label>
                        <input type="text"
                               name="phone"
                               id="phone"
                               value="{{ old('phone') }}"
                               class="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent @error('phone') border-red-500 @enderror"
                               placeholder="07xxxxxxxxx"
                               required>
                        @error('phone')
                            <p class="mt-1 text-sm text-red-600">{{ $message }}</p>
                        @enderror
                    </div>

                    <!-- Password -->
                    <div>
                        <label for="password" class="block text-sm font-medium text-gray-700 mb-2">
                            كلمة المرور
                        </label>
                        <input type="password"
                               name="password"
                               id="password"
                               class="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent @error('password') border-red-500 @enderror"
                               placeholder="أدخل كلمة المرور"
                               required>
                        @error('password')
                            <p class="mt-1 text-sm text-red-600">{{ $message }}</p>
                        @enderror
                    </div>

                    <!-- Submit Button -->
                    <div class="pt-4">
                        <button type="submit"
                                class="w-full bg-blue-500 hover:bg-blue-600 text-white font-medium py-2 px-4 rounded-md transition-colors duration-200">
                            تسجيل الدخول
                        </button>
                    </div>
                </form>

                <!-- Success Message -->
                @if(session('success'))
                    <div class="mt-4 bg-green-100 border border-green-400 text-green-700 px-4 py-3 rounded">
                        {{ session('success') }}
                    </div>
                @endif

                <!-- Back to Landing -->
                <div class="text-center mt-6">
                    <a href="{{ url('/') }}"
                       class="text-blue-500 hover:text-blue-600 text-sm font-medium">
                        العودة إلى الصفحة الرئيسية
                    </a>
                </div>
            </div>
        </div>

        <!-- Footer Info -->
        <div class="text-center mt-6">
            <p class="text-gray-500 text-sm">نظام إدارة المبيعات © 2025</p>
        </div>
    </div>
</div>
@endsection
