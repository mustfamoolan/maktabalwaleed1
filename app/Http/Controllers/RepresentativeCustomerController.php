<?php

namespace App\Http\Controllers;

use App\Http\Controllers\Controller;
use App\Models\RepresentativeCustomer;
use Illuminate\Http\Request;
use Inertia\Inertia;
use Illuminate\Validation\Rule;
use Illuminate\Support\Facades\Auth;

class RepresentativeCustomerController extends Controller
{
    /**
     * عرض قائمة العملاء للمندوب
     */
    public function index()
    {
        $representative = Auth::guard('representative')->user();

        if (!$representative) {
            return redirect()->route('representatives.login');
        }

        $customers = RepresentativeCustomer::where('representative_id', $representative['id'])
            ->orderBy('created_at', 'desc')
            ->get()
            ->map(function ($customer) {
                return [
                    'id' => $customer->id,
                    'name' => $customer->name,
                    'phone' => $customer->phone,
                    'location_text' => $customer->location_text,
                    'latitude' => $customer->latitude,
                    'longitude' => $customer->longitude,
                    'is_active' => $customer->is_active,
                    'notes' => $customer->notes,
                    'created_at' => $customer->created_at->format('Y-m-d'),
                    'location' => $customer->location
                ];
            });

        return Inertia::render('RepresentativesPanel/Customers/Index', [
            'representative_user' => $representative,
            'customers' => $customers
        ]);
    }

    /**
     * عرض صفحة إضافة عميل جديد
     */
    public function create()
    {
        $representative = Auth::guard('representative')->user();

        if (!$representative) {
            return redirect()->route('representatives.login');
        }

        return Inertia::render('RepresentativesPanel/Customers/Create', [
            'representative_user' => $representative
        ]);
    }

    /**
     * حفظ العميل الجديد
     */
    public function store(Request $request)
    {
        $representative = Auth::guard('representative')->user();

        if (!$representative) {
            return redirect()->route('representatives.login');
        }

        $validated = $request->validate([
            'name' => 'required|string|max:255',
            'phone' => 'nullable|string|max:20',
            'location_text' => 'nullable|string|max:1000',
            'latitude' => 'nullable|numeric|between:-90,90',
            'longitude' => 'nullable|numeric|between:-180,180',
            'notes' => 'nullable|string|max:1000'
        ], [
            'name.required' => 'اسم العميل مطلوب',
            'name.string' => 'اسم العميل يجب أن يكون نص',
            'name.max' => 'اسم العميل لا يمكن أن يزيد عن 255 حرف',
            'phone.string' => 'رقم الهاتف يجب أن يكون نص',
            'phone.max' => 'رقم الهاتف لا يمكن أن يزيد عن 20 رقم',
            'location_text.string' => 'وصف الموقع يجب أن يكون نص',
            'location_text.max' => 'وصف الموقع لا يمكن أن يزيد عن 1000 حرف',
            'latitude.numeric' => 'خط العرض يجب أن يكون رقم',
            'latitude.between' => 'خط العرض يجب أن يكون بين -90 و 90',
            'longitude.numeric' => 'خط الطول يجب أن يكون رقم',
            'longitude.between' => 'خط الطول يجب أن يكون بين -180 و 180',
            'notes.string' => 'الملاحظات يجب أن تكون نص',
            'notes.max' => 'الملاحظات لا يمكن أن تزيد عن 1000 حرف'
        ]);

        try {
            RepresentativeCustomer::create([
                'representative_id' => $representative['id'],
                'name' => $validated['name'],
                'phone' => $validated['phone'],
                'location_text' => $validated['location_text'],
                'latitude' => $validated['latitude'],
                'longitude' => $validated['longitude'],
                'notes' => $validated['notes'] ?? null,
                'is_active' => true
            ]);

            return redirect()->route('representatives.customers.index')
                ->with('success', 'تم إضافة العميل بنجاح');

        } catch (\Exception $e) {
            return redirect()->back()
                ->withInput()
                ->with('error', 'حدث خطأ أثناء إضافة العميل: ' . $e->getMessage());
        }
    }

    /**
     * عرض تفاصيل العميل
     */
    public function show($id)
    {
        $representative = Auth::guard('representative')->user();

        if (!$representative) {
            return redirect()->route('representatives.login');
        }

        $customer = RepresentativeCustomer::where('representative_id', $representative['id'])
            ->findOrFail($id);

        return Inertia::render('RepresentativesPanel/Customers/Show', [
            'representative_user' => $representative,
            'customer' => [
                'id' => $customer->id,
                'name' => $customer->name,
                'phone' => $customer->phone,
                'location_text' => $customer->location_text,
                'latitude' => $customer->latitude,
                'longitude' => $customer->longitude,
                'is_active' => $customer->is_active,
                'notes' => $customer->notes,
                'created_at' => $customer->created_at->format('Y-m-d H:i'),
                'updated_at' => $customer->updated_at->format('Y-m-d H:i'),
                'location' => $customer->location
            ]
        ]);
    }

    /**
     * عرض صفحة تعديل العميل
     */
    public function edit($id)
    {
        $representative = Auth::guard('representative')->user();

        if (!$representative) {
            return redirect()->route('representatives.login');
        }

        $customer = RepresentativeCustomer::where('representative_id', $representative['id'])
            ->findOrFail($id);

        return Inertia::render('RepresentativesPanel/Customers/Edit', [
            'representative_user' => $representative,
            'customer' => [
                'id' => $customer->id,
                'name' => $customer->name,
                'phone' => $customer->phone,
                'location_text' => $customer->location_text,
                'latitude' => $customer->latitude,
                'longitude' => $customer->longitude,
                'is_active' => $customer->is_active,
                'notes' => $customer->notes,
                'location' => $customer->location
            ]
        ]);
    }

    /**
     * تحديث بيانات العميل
     */
    public function update(Request $request, $id)
    {
        $representative = Auth::guard('representative')->user();

        if (!$representative) {
            return redirect()->route('representatives.login');
        }

        $customer = RepresentativeCustomer::where('representative_id', $representative['id'])
            ->findOrFail($id);

        $validated = $request->validate([
            'name' => 'required|string|max:255',
            'phone' => 'nullable|string|max:20',
            'location_text' => 'nullable|string|max:1000',
            'latitude' => 'nullable|numeric|between:-90,90',
            'longitude' => 'nullable|numeric|between:-180,180',
            'notes' => 'nullable|string|max:1000',
            'is_active' => 'required|boolean'
        ], [
            'name.required' => 'اسم العميل مطلوب',
            'name.string' => 'اسم العميل يجب أن يكون نص',
            'name.max' => 'اسم العميل لا يمكن أن يزيد عن 255 حرف',
            'phone.string' => 'رقم الهاتف يجب أن يكون نص',
            'phone.max' => 'رقم الهاتف لا يمكن أن يزيد عن 20 رقم',
            'location_text.string' => 'وصف الموقع يجب أن يكون نص',
            'location_text.max' => 'وصف الموقع لا يمكن أن يزيد عن 1000 حرف',
            'latitude.numeric' => 'خط العرض يجب أن يكون رقم',
            'latitude.between' => 'خط العرض يجب أن يكون بين -90 و 90',
            'longitude.numeric' => 'خط الطول يجب أن يكون رقم',
            'longitude.between' => 'خط الطول يجب أن يكون بين -180 و 180',
            'notes.string' => 'الملاحظات يجب أن تكون نص',
            'notes.max' => 'الملاحظات لا يمكن أن تزيد عن 1000 حرف',
            'is_active.required' => 'حالة العميل مطلوبة',
            'is_active.boolean' => 'حالة العميل يجب أن تكون نشط أو غير نشط'
        ]);

        try {
            $customer->update([
                'name' => $validated['name'],
                'phone' => $validated['phone'],
                'location_text' => $validated['location_text'],
                'latitude' => $validated['latitude'],
                'longitude' => $validated['longitude'],
                'notes' => $validated['notes'] ?? null,
                'is_active' => $validated['is_active']
            ]);

            return redirect()->route('representatives.customers.index')
                ->with('success', 'تم تحديث بيانات العميل بنجاح');

        } catch (\Exception $e) {
            return redirect()->back()
                ->withInput()
                ->with('error', 'حدث خطأ أثناء تحديث بيانات العميل: ' . $e->getMessage());
        }
    }

    /**
     * حذف العميل
     */
    public function destroy($id)
    {
        $representative = Auth::guard('representative')->user();

        if (!$representative) {
            return redirect()->route('representatives.login');
        }

        try {
            $customer = RepresentativeCustomer::where('representative_id', $representative['id'])
                ->findOrFail($id);

            $customer->delete();

            return redirect()->route('representatives.customers.index')
                ->with('success', 'تم حذف العميل بنجاح');

        } catch (\Exception $e) {
            return redirect()->back()
                ->with('error', 'حدث خطأ أثناء حذف العميل: ' . $e->getMessage());
        }
    }

    /**
     * تبديل حالة العميل (تفعيل/إلغاء تفعيل)
     */
    public function toggleStatus($id)
    {
        $representative = Auth::guard('representative')->user();

        if (!$representative) {
            return redirect()->route('representatives.login');
        }

        try {
            $customer = RepresentativeCustomer::where('representative_id', $representative['id'])
                ->findOrFail($id);

            $customer->update([
                'is_active' => !$customer->is_active
            ]);

            $message = $customer->is_active ? 'تم تفعيل العميل بنجاح' : 'تم إلغاء تفعيل العميل بنجاح';

            return redirect()->back()->with('success', $message);

        } catch (\Exception $e) {
            return redirect()->back()
                ->with('error', 'حدث خطأ أثناء تغيير حالة العميل: ' . $e->getMessage());
        }
    }
}
