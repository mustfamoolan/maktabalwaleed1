import React from 'react';
import { Head } from '@inertiajs/react';
import RepresentativeLayout from '@/Layouts/RepresentativeLayout';

export default function Orders({ representative_user }) {
    return (
        <RepresentativeLayout>
            <Head title="الطلبات - المندوبين" />

            <div className="space-y-6">
                <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
                    <h1 className="text-2xl font-bold text-gray-900 mb-2">الطلبات</h1>
                    <p className="text-gray-600">إدارة طلبات العملاء ومتابعة حالتها</p>
                </div>

                <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-12">
                    <div className="text-center">
                        <div className="mx-auto w-16 h-16 bg-orange-100 rounded-full flex items-center justify-center mb-4">
                            <svg className="w-8 h-8 text-orange-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                            </svg>
                        </div>
                        <h3 className="text-lg font-medium text-gray-900 mb-2">إدارة الطلبات</h3>
                        <p className="text-gray-500">سيتم إضافة إدارة الطلبات هنا قريباً</p>
                    </div>
                </div>
            </div>
        </RepresentativeLayout>
    );
}
