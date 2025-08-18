<?php

namespace App\Http\Controllers;

use Illuminate\Http\Request;
use App\Models\Representative;
use App\Models\RepresentativeCustomer;
use Illuminate\Support\Facades\Validator;
use Inertia\Inertia;

class RepresentativeCustomerController extends Controller
{
    /**
     * عرض عملاء المندوب
     */
    public function index(Representative $representative, Request $request)
    {
        $query = $representative->customers();

        // البحث
        if ($request->filled('search')) {
            $search = $request->search;
            $query->where(function($q) use ($search) {
                $q->where('customer_name', 'like', "%{$search}%")
                  ->orWhere('phone', 'like', "%{$search}%")
                  ->orWhere('city', 'like', "%{$search}%")
                  ->orWhere('governorate', 'like', "%{$search}%");
            });
        }

        // فلترة حسب المحافظة
        if ($request->filled('governorate')) {
            $query->where('governorate', $request->governorate);
        }

        // فلترة حسب الحالة
        if ($request->filled('status')) {
            $query->where('status', $request->status);
        }

        // فلترة المدينين
        if ($request->filled('has_debt') && $request->has_debt == '1') {
            $query->withDebt();
        }

        // فلترة المتأخرين
        if ($request->filled('overdue') && $request->overdue == '1') {
            $query->overdue();
        }

        $customers = $query->latest()->paginate(20);

        // إحصائيات سريعة
        $stats = [
            'total_customers' => $representative->customers()->count(),
            'active_customers' => $representative->customers()->active()->count(),
            'customers_with_debt' => $representative->customers()->withDebt()->count(),
            'overdue_customers' => $representative->customers()->overdue()->count(),
            'total_debt' => $representative->customers()->sum('total_debt'),
            'total_paid' => $representative->customers()->sum('total_paid'),
        ];

        // المحافظات للفلترة
        $governorates = $representative->customers()
                                     ->select('governorate')
                                     ->distinct()
                                     ->pluck('governorate')
                                     ->filter()
                                     ->values();

        return inertia('Admin/Representatives/Customers', [
            'representative' => $representative,
            'customers' => $customers,
            'stats' => $stats,
            'governorates' => $governorates,
            'filters' => $request->only(['search', 'governorate', 'status', 'has_debt', 'overdue'])
        ]);
    }

    /**
     * حفظ عميل جديد
     */
    public function store(Representative $representative, Request $request)
    {
        $validator = Validator::make($request->all(), [
            'customer_name' => 'required|string|max:255',
            'phone' => 'nullable|string|max:20',
            'address' => 'required|string',
            'governorate' => 'required|string|max:100',
            'city' => 'required|string|max:100',
            'nearest_landmark' => 'nullable|string|max:255',
            'notes' => 'nullable|string'
        ], [
            'customer_name.required' => 'اسم العميل مطلوب',
            'address.required' => 'عنوان العميل مطلوب',
            'governorate.required' => 'المحافظة مطلوبة',
            'city.required' => 'المدينة مطلوبة'
        ]);

        if ($validator->fails()) {
            return back()->withErrors($validator)->withInput();
        }

        $representative->customers()->create([
            'customer_name' => $request->customer_name,
            'phone' => $request->phone,
            'address' => $request->address,
            'governorate' => $request->governorate,
            'city' => $request->city,
            'nearest_landmark' => $request->nearest_landmark,
            'notes' => $request->notes,
            'status' => 'active'
        ]);

        return back()->with('success', 'تم إضافة العميل بنجاح');
    }

    /**
     * تحديث بيانات العميل
     */
    public function update(Representative $representative, RepresentativeCustomer $customer, Request $request)
    {
        // التأكد أن العميل يخص هذا المندوب
        if ($customer->representative_id !== $representative->id) {
            return back()->withErrors(['error' => 'غير مسموح بتعديل هذا العميل']);
        }

        $validator = Validator::make($request->all(), [
            'customer_name' => 'required|string|max:255',
            'phone' => 'nullable|string|max:20',
            'address' => 'required|string',
            'governorate' => 'required|string|max:100',
            'city' => 'required|string|max:100',
            'nearest_landmark' => 'nullable|string|max:255',
            'status' => 'required|in:active,inactive,suspended',
            'notes' => 'nullable|string'
        ], [
            'customer_name.required' => 'اسم العميل مطلوب',
            'address.required' => 'عنوان العميل مطلوب',
            'governorate.required' => 'المحافظة مطلوبة',
            'city.required' => 'المدينة مطلوبة',
            'status.required' => 'حالة العميل مطلوبة'
        ]);

        if ($validator->fails()) {
            return back()->withErrors($validator)->withInput();
        }

        $customer->update([
            'customer_name' => $request->customer_name,
            'phone' => $request->phone,
            'address' => $request->address,
            'governorate' => $request->governorate,
            'city' => $request->city,
            'nearest_landmark' => $request->nearest_landmark,
            'status' => $request->status,
            'notes' => $request->notes
        ]);

        return back()->with('success', 'تم تحديث بيانات العميل بنجاح');
    }

    /**
     * حذف العميل
     */
    public function destroy(Representative $representative, RepresentativeCustomer $customer)
    {
        // التأكد أن العميل يخص هذا المندوب
        if ($customer->representative_id !== $representative->id) {
            return back()->withErrors(['error' => 'غير مسموح بحذف هذا العميل']);
        }

        // التحقق من عدم وجود فواتير أو معاملات
        if ($customer->total_purchases > 0 || $customer->total_debt > 0) {
            return back()->withErrors(['error' => 'لا يمكن حذف عميل له معاملات مالية. يرجى تغيير حالته إلى غير نشط بدلاً من الحذف']);
        }

        $customer->delete();

        return back()->with('success', 'تم حذف العميل بنجاح');
    }

    /**
     * تفاصيل العميل مع إحصائياته
     */
    public function show(Representative $representative, RepresentativeCustomer $customer)
    {
        // التأكد أن العميل يخص هذا المندوب
        if ($customer->representative_id !== $representative->id) {
            return back()->withErrors(['error' => 'غير مسموح بعرض هذا العميل']);
        }

        // إحصائيات مفصلة للعميل
        $customerStats = [
            'total_invoices' => $customer->completed_invoices + $customer->cancelled_invoices + $customer->returned_invoices,
            'success_rate' => $customer->success_rate,
            'remaining_debt' => $customer->remaining_debt,
            'is_overdue' => $customer->is_overdue,
            'last_purchase_date' => null, // سيتم تحديثه لاحقاً عند إضافة الفواتير
        ];

        return inertia('Admin/Representatives/CustomerDetails', [
            'representative' => $representative,
            'customer' => $customer,
            'customer_stats' => $customerStats
        ]);
    }
}
