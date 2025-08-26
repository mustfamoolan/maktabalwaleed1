<?php

namespace App\Http\Controllers\Admin;

use App\Http\Controllers\Controller;
use App\Models\RepresentativeCustomer;
use App\Models\Representative;
use Illuminate\Http\Request;
use Inertia\Inertia;

class CustomerController extends Controller
{
    public function index(Request $request)
    {
        $query = RepresentativeCustomer::with(['representative']);

        // فلترة حسب البحث
        if ($request->has('search') && $request->search) {
            $search = $request->search;
            $query->where(function ($q) use ($search) {
                $q->where('name', 'like', "%{$search}%")
                  ->orWhere('phone', 'like', "%{$search}%")
                  ->orWhere('location_text', 'like', "%{$search}%")
                  ->orWhereHas('representative', function ($rep) use ($search) {
                      $rep->where('name', 'like', "%{$search}%");
                  });
            });
        }

        // فلترة حسب المندوب
        if ($request->has('representative_id') && $request->representative_id) {
            $query->where('representative_id', $request->representative_id);
        }

        // فلترة حسب الحالة
        if ($request->has('status') && $request->status !== '') {
            $query->where('is_active', $request->status);
        }

        // فلترة حسب وجود الموقع
        if ($request->has('has_location') && $request->has_location !== '') {
            if ($request->has_location == 1) {
                $query->whereNotNull('latitude')->whereNotNull('longitude');
            } else {
                $query->where(function ($q) {
                    $q->whereNull('latitude')->orWhereNull('longitude');
                });
            }
        }

        $customers = $query->orderBy('created_at', 'desc')->paginate(20);

        // جلب جميع المندوبين للفلتر
        $representatives = Representative::select('id', 'name')->orderBy('name')->get();

        // إحصائيات
        $stats = [
            'total' => RepresentativeCustomer::count(),
            'active' => RepresentativeCustomer::where('is_active', true)->count(),
            'inactive' => RepresentativeCustomer::where('is_active', false)->count(),
            'with_location' => RepresentativeCustomer::whereNotNull('latitude')->whereNotNull('longitude')->count(),
        ];

        return Inertia::render('Admin/Customers/Index', [
            'customers' => $customers,
            'representatives' => $representatives,
            'filters' => $request->only(['search', 'representative_id', 'status', 'has_location']),
            'stats' => $stats
        ]);
    }

    public function show(RepresentativeCustomer $customer)
    {
        $customer->load(['representative']);

        return Inertia::render('Admin/Customers/Show', [
            'customer' => $customer
        ]);
    }

    public function toggleStatus(RepresentativeCustomer $customer)
    {
        $customer->update([
            'is_active' => !$customer->is_active
        ]);

        return back()->with('success', 'تم تحديث حالة العميل بنجاح');
    }

    public function destroy(RepresentativeCustomer $customer)
    {
        $customer->delete();

        return redirect()->route('admin.customers.index')
                        ->with('success', 'تم حذف العميل بنجاح');
    }
}
