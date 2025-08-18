<?php

namespace App\Http\Controllers\RepresentativesPanel;

use App\Http\Controllers\Controller;
use App\Models\RepresentativeCustomer;
use Illuminate\Http\Request;
use Inertia\Inertia;

class CustomerController extends Controller
{
    /**
     * عرض قائمة العملاء
     */
    public function index(Request $request)
    {
        // تحقق من تسجيل الدخول
        $representative = session('representative_user');
        if (!$representative) {
            return redirect()->route('representatives.login.form');
        }

        $query = RepresentativeCustomer::where('representative_id', $representative['id']);

        // البحث
        if ($request->filled('search')) {
            $search = $request->search;
            $query->where(function ($q) use ($search) {
                $q->where('customer_name', 'like', "%{$search}%")
                  ->orWhere('phone', 'like', "%{$search}%")
                  ->orWhere('governorate', 'like', "%{$search}%")
                  ->orWhere('city', 'like', "%{$search}%");
            });
        }

        $customers = $query->orderBy('created_at', 'desc')->paginate(15);
        $total = RepresentativeCustomer::where('representative_id', $representative['id'])->count();

        return Inertia::render('RepresentativesPanel/Customers', [
            'representative_user' => $representative,
            'customers' => $customers->items(),
            'total' => $total,
            'filters' => $request->only(['search'])
        ]);
    }

    /**
     * عرض نموذج إضافة عميل جديد
     */
    public function create()
    {
        // تحقق من تسجيل الدخول
        $representative = session('representative_user');
        if (!$representative) {
            return redirect()->route('representatives.login.form');
        }

        return Inertia::render('RepresentativesPanel/CustomerCreate', [
            'representative_user' => $representative
        ]);
    }

    /**
     * حفظ عميل جديد
     */
    public function store(Request $request)
    {
        // تحقق من تسجيل الدخول
        $representative = session('representative_user');
        if (!$representative) {
            return redirect()->route('representatives.login.form');
        }

        $request->validate([
            'customer_name' => 'required|string|max:255',
            'phone' => 'nullable|string|max:20|regex:/^(\+964|0)?7[0-9]{9}$/',
            'address' => 'required|string',
            'governorate' => 'required|string|max:100',
            'city' => 'required|string|max:100',
            'nearest_landmark' => 'nullable|string|max:255',
            'total_debt' => 'nullable|numeric|min:0',
            'notes' => 'nullable|string'
        ]);

        RepresentativeCustomer::create([
            'representative_id' => $representative['id'],
            'customer_name' => $request->customer_name,
            'phone' => $request->phone,
            'address' => $request->address,
            'governorate' => $request->governorate,
            'city' => $request->city,
            'nearest_landmark' => $request->nearest_landmark,
            'total_debt' => $request->total_debt ?? 0,
            'notes' => $request->notes,
            'status' => 'active'
        ]);

        return redirect()->route('representatives.customers.index')
            ->with('success', 'تم إضافة العميل بنجاح');
    }

    /**
     * عرض تفاصيل عميل
     */
    public function show($id)
    {
        // تحقق من تسجيل الدخول
        $representative = session('representative_user');
        if (!$representative) {
            return redirect()->route('representatives.login.form');
        }

        $customer = RepresentativeCustomer::where('representative_id', $representative['id'])
            ->findOrFail($id);

        return Inertia::render('RepresentativesPanel/CustomerShow', [
            'representative_user' => $representative,
            'customer' => $customer
        ]);
    }

    /**
     * عرض نموذج تعديل عميل
     */
    public function edit($id)
    {
        // تحقق من تسجيل الدخول
        $representative = session('representative_user');
        if (!$representative) {
            return redirect()->route('representatives.login.form');
        }

        $customer = RepresentativeCustomer::where('representative_id', $representative['id'])
            ->findOrFail($id);

        return Inertia::render('RepresentativesPanel/CustomerEdit', [
            'representative_user' => $representative,
            'customer' => $customer
        ]);
    }

    /**
     * تحديث بيانات عميل
     */
    public function update(Request $request, $id)
    {
        // تحقق من تسجيل الدخول
        $representative = session('representative_user');
        if (!$representative) {
            return redirect()->route('representatives.login.form');
        }

        $customer = RepresentativeCustomer::where('representative_id', $representative['id'])
            ->findOrFail($id);

        $request->validate([
            'customer_name' => 'required|string|max:255',
            'phone' => 'nullable|string|max:20|regex:/^(\+964|0)?7[0-9]{9}$/',
            'address' => 'required|string',
            'governorate' => 'required|string|max:100',
            'city' => 'required|string|max:100',
            'nearest_landmark' => 'nullable|string|max:255',
            'total_debt' => 'nullable|numeric|min:0',
            'status' => 'required|in:active,inactive,suspended',
            'notes' => 'nullable|string'
        ]);

        $customer->update($request->only([
            'customer_name',
            'phone',
            'address',
            'governorate',
            'city',
            'nearest_landmark',
            'total_debt',
            'status',
            'notes'
        ]));

        return redirect()->route('representatives.customers.index')
            ->with('success', 'تم تحديث بيانات العميل بنجاح');
    }

    /**
     * حذف عميل
     */
    public function destroy($id)
    {
        // تحقق من تسجيل الدخول
        $representative = session('representative_user');
        if (!$representative) {
            return redirect()->route('representatives.login.form');
        }

        $customer = RepresentativeCustomer::where('representative_id', $representative['id'])
            ->findOrFail($id);

        $customer->delete();

        return redirect()->route('representatives.customers.index')
            ->with('success', 'تم حذف العميل بنجاح');
    }
}
