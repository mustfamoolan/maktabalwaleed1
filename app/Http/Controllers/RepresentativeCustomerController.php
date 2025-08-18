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
     * عرض عملاء المندوب الحالي
     */
    public function index(Request $request)
    {
        $representative_user = session('representative_user');
        if (!$representative_user) {
            return redirect()->route('representatives.login.form');
        }

        $representative = Representative::find($representative_user['id']);
        if (!$representative) {
            return redirect()->route('representatives.login.form');
        }

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

        $customers = $query->orderBy('created_at', 'desc')->get();

        return Inertia::render('RepresentativesPanel/Customers', [
            'representative_user' => $representative_user,
            'customers' => $customers,
            'total' => $customers->count(),
            'filters' => $request->only(['search', 'governorate', 'status'])
        ]);
    }

    /**
     * عرض صفحة إضافة عميل جديد
     */
    public function create()
    {
        $representative_user = session('representative_user');
        if (!$representative_user) {
            return redirect()->route('representatives.login.form');
        }

        return Inertia::render('RepresentativesPanel/CustomerCreate', [
            'representative_user' => $representative_user
        ]);
    }

    /**
     * حفظ عميل جديد
     */
    public function store(Request $request)
    {
        $representative_user = session('representative_user');
        if (!$representative_user) {
            return redirect()->route('representatives.login.form');
        }

        $validated = $request->validate([
            'customer_name' => 'required|string|max:255',
            'phone' => 'nullable|string|max:20',
            'address' => 'required|string',
            'governorate' => 'required|string|max:100',
            'city' => 'required|string|max:100',
            'nearest_landmark' => 'nullable|string|max:255',
            'total_debt' => 'nullable|numeric|min:0',
            'notes' => 'nullable|string'
        ]);

        $validated['representative_id'] = $representative_user['id'];
        $validated['total_debt'] = $validated['total_debt'] ?? 0;
        $validated['status'] = 'active';

        RepresentativeCustomer::create($validated);

        return redirect()->route('representatives.customers.index')
            ->with('success', 'تم إضافة العميل بنجاح');
    }

    /**
     * عرض عملاء المندوب - للإدارة
     */
    public function adminIndex(Representative $representative, Request $request)
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

        $customers = $query->orderBy('created_at', 'desc')->paginate(20);

        return Inertia::render('Admin/Representatives/Customers', [
            'representative' => $representative,
            'customers' => $customers,
            'filters' => $request->only(['search', 'governorate', 'status'])
        ]);
    }

    /**
     * حفظ عميل جديد - للإدارة
     */
    public function adminStore(Representative $representative, Request $request)
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

        // التحقق من عدم وجود فواتير مع هذا العميل
        $invoicesCount = \App\Models\Invoice::where('customer_id', $customer->id)->count();
        if ($invoicesCount > 0) {
            return back()->withErrors(['error' => 'لا يمكن حذف عميل له فواتير. يرجى تغيير حالته إلى غير نشط بدلاً من الحذف']);
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
        $invoices = \App\Models\Invoice::where('customer_id', $customer->id)->get();
        $customerStats = [
            'total_invoices' => $invoices->count(),
            'total_amount' => $invoices->sum('total_amount'),
            'paid_amount' => $invoices->sum('paid_amount'),
            'remaining_amount' => $invoices->sum('remaining_amount'),
            'last_purchase_date' => $invoices->max('created_at'),
        ];

        return inertia('Admin/Representatives/CustomerDetails', [
            'representative' => $representative,
            'customer' => $customer,
            'customer_stats' => $customerStats
        ]);
    }
}
