<?php

namespace App\Http\Controllers\Preparer;

use App\Http\Controllers\Controller;
use Illuminate\Http\Request;
use Inertia\Inertia;
use App\Models\Sale;

class DashboardController extends Controller
{
    public function index()
    {
        $preparer = auth('preparer')->user();

        // احصائيات الفواتير للمجهز
        $invoiceStats = [
            'preparing_invoices' => Sale::where('status', 'preparing')->count(),
            'completed_invoices' => Sale::whereIn('status', ['ready_for_delivery', 'delivered', 'completed'])->count(),
            'today_preparing' => Sale::where('status', 'preparing')
                ->whereDate('created_at', today())
                ->count(),
            'total_pending' => Sale::where('status', 'pending')->count(),
        ];

        return Inertia::render('Preparers/Dashboard', [
            'preparer' => $preparer,
            'invoiceStats' => $invoiceStats
        ]);
    }

    public function preparingInvoices(Request $request)
    {
        $preparer = auth('preparer')->user();

        $query = Sale::with(['customer', 'sellerRepresentative', 'primarySupplier'])
            ->where('status', 'preparing');

        // البحث
        if ($request->search) {
            $query->where(function($q) use ($request) {
                $q->where('sale_number', 'like', '%' . $request->search . '%')
                  ->orWhere('customer_name', 'like', '%' . $request->search . '%')
                  ->orWhereHas('sellerRepresentative', function($rep) use ($request) {
                      $rep->where('name', 'like', '%' . $request->search . '%');
                  });
            });
        }

        $invoices = $query->orderBy('created_at', 'asc')->paginate(10);

        // احصائيات سريعة
        $stats = [
            'total_preparing' => Sale::where('status', 'preparing')->count(),
            'high_priority' => Sale::where('status', 'preparing')->whereDate('created_at', '<', now()->subHours(24))->count(),
            'average_time' => '35 دقيقة',
            'completed_today' => Sale::whereIn('status', ['ready_for_delivery', 'delivered'])
                ->whereDate('updated_at', today())
                ->count(),
        ];

        return Inertia::render('Preparers/Invoices/Preparing', [
            'preparer' => $preparer,
            'invoices' => $invoices,
            'stats' => $stats,
            'filters' => $request->only(['search'])
        ]);
    }

    public function completedInvoices(Request $request)
    {
        $preparer = auth('preparer')->user();

        $query = Sale::with(['customer', 'sellerRepresentative', 'primarySupplier'])
            ->whereIn('status', ['ready_for_delivery', 'delivered', 'completed']);

        // البحث
        if ($request->search) {
            $query->where(function($q) use ($request) {
                $q->where('sale_number', 'like', '%' . $request->search . '%')
                  ->orWhere('customer_name', 'like', '%' . $request->search . '%')
                  ->orWhereHas('sellerRepresentative', function($rep) use ($request) {
                      $rep->where('name', 'like', '%' . $request->search . '%');
                  });
            });
        }

        // فلترة التاريخ
        if ($request->date_from) {
            $query->whereDate('updated_at', '>=', $request->date_from);
        }
        if ($request->date_to) {
            $query->whereDate('updated_at', '<=', $request->date_to);
        }

        $invoices = $query->orderBy('updated_at', 'desc')->paginate(10);

        // احصائيات سريعة
        $stats = [
            'total_completed' => Sale::whereIn('status', ['ready_for_delivery', 'delivered', 'completed'])->count(),
            'delivered_today' => Sale::where('status', 'delivered')
                ->whereDate('updated_at', today())
                ->count(),
            'average_prep_time' => '30 دقيقة',
            'total_value' => Sale::whereIn('status', ['ready_for_delivery', 'delivered', 'completed'])
                ->sum('total_amount'),
        ];

        return Inertia::render('Preparers/Invoices/Completed', [
            'preparer' => $preparer,
            'invoices' => $invoices,
            'stats' => $stats,
            'filters' => $request->only(['search', 'date_from', 'date_to'])
        ]);
    }

    public function showInvoice($invoiceId)
    {
        $preparer = auth('preparer')->user();

        $invoice = Sale::with([
            'customer',
            'sellerRepresentative',
            'primarySupplier',
            'items.product'
        ])->findOrFail($invoiceId);

        return Inertia::render('Preparers/Invoices/Show', [
            'preparer' => $preparer,
            'invoice' => $invoice
        ]);
    }

    public function completeInvoice(Request $request, $invoiceId)
    {
        $preparer = auth('preparer')->user();

        $invoice = Sale::findOrFail($invoiceId);

        // تحديث حالة الفاتورة إلى جاهز للتسليم
        $invoice->update([
            'status' => 'ready_for_delivery',
            'prepared_by' => $preparer->id,
            'preparation_notes' => $request->preparation_notes,
            'preparation_completed_at' => now(),
        ]);

        return redirect()->route('preparer.invoices.preparing')
            ->with('success', 'تم إكمال تجهيز الفاتورة بنجاح');
    }

    public function showCompletedInvoice($invoiceId)
    {
        $preparer = auth('preparer')->user();

        $invoice = Sale::with([
            'customer',
            'sellerRepresentative',
            'primarySupplier',
            'items.product'
        ])->findOrFail($invoiceId);

        return Inertia::render('Preparers/Invoices/ShowCompleted', [
            'preparer' => $preparer,
            'invoice' => $invoice
        ]);
    }
}
