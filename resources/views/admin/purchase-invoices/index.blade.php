@extends('layouts.desktop')

@section('title', 'فواتير الشراء - نظام إدارة المبيعات')

@section('page-title', 'فواتير الشراء')

@section('toolbar')
    <div class="toolbar-group">
        <button onclick="window.location.href='{{ route('admin.purchase-invoices.create') }}'" class="win-button primary">
            <i class="fas fa-plus"></i> فاتورة شراء جديدة
        </button>
        <button onclick="window.location.href='{{ route('admin.dashboard') }}'" class="win-button">
            <i class="fas fa-home"></i> الرئيسية
        </button>
    </div>
@endsection

@section('content')
    <div class="main-container">
        <!-- فلترة وبحث -->
        <div class="filter-section">
            <div class="filter-row">
                <div class="form-group">
                    <input type="text" id="searchInput" placeholder="ابحث برقم الفاتورة..." class="win-input" style="width: 300px;">
                </div>
                <div class="form-group">
                    <select id="statusFilter" class="win-input">
                        <option value="">جميع الحالات</option>
                        <option value="draft">مسودة</option>
                        <option value="confirmed">مؤكدة</option>
                        <option value="cancelled">ملغية</option>
                    </select>
                </div>
                <div class="form-group">
                    <input type="date" id="dateFrom" class="win-input">
                    <span style="margin: 0 10px;">إلى</span>
                    <input type="date" id="dateTo" class="win-input">
                </div>
            </div>
        </div>

        <!-- جدول الفواتير -->
        <div class="excel-container">
            <table class="excel-table">
                <thead>
                    <tr>
                        <th style="width: 8%;">رقم الفاتورة</th>
                        <th style="width: 10%;">التاريخ</th>
                        <th style="width: 12%;">المورد</th>
                        <th style="width: 12%;">المجموع الفرعي</th>
                        <th style="width: 8%;">كروة السائق</th>
                        <th style="width: 8%;">كروة العمال</th>
                        <th style="width: 12%;">المجموع النهائي</th>
                        <th style="width: 6%;">عدد المنتجات</th>
                        <th style="width: 8%;">الحالة</th>
                        <th style="width: 16%;">الإجراءات</th>
                    </tr>
                </thead>
                <tbody>
                    @forelse($invoices as $invoice)
                    <tr>
                        <td>{{ $invoice->invoice_number }}</td>
                        <td>{{ $invoice->invoice_date->format('Y-m-d') }}</td>
                        <td>{{ $invoice->supplier->name ?? 'غير محدد' }}</td>
                        <td>{{ number_format($invoice->total_amount, 2) }} د.ع</td>
                        <td>{{ number_format($invoice->driver_cost, 2) }} د.ع</td>
                        <td>{{ number_format($invoice->workers_cost, 2) }} د.ع</td>
                        <td style="font-weight: bold; color: #007bff;">
                            {{ number_format($invoice->final_total, 2) }} د.ع
                        </td>
                        <td>{{ $invoice->items->count() }}</td>
                        <td>
                            @switch($invoice->status)
                                @case('draft')
                                    <span class="status-badge draft">مسودة</span>
                                    @break
                                @case('confirmed')
                                    <span class="status-badge confirmed">مؤكدة</span>
                                    @break
                                @case('cancelled')
                                    <span class="status-badge cancelled">ملغية</span>
                                    @break
                            @endswitch
                        </td>
                        <td>
                            <div class="action-buttons">
                                <button onclick="viewInvoice({{ $invoice->id }})" class="action-btn view" title="عرض">
                                    <i class="fas fa-eye"></i>
                                </button>
                                @if($invoice->status === 'draft')
                                <button onclick="editInvoice({{ $invoice->id }})" class="action-btn edit" title="تعديل">
                                    <i class="fas fa-edit"></i>
                                </button>
                                @endif
                                <button onclick="printInvoice({{ $invoice->id }})" class="action-btn print" title="طباعة">
                                    <i class="fas fa-print"></i>
                                </button>
                                @if($invoice->status === 'draft')
                                <button onclick="deleteInvoice({{ $invoice->id }})" class="action-btn delete" title="حذف">
                                    <i class="fas fa-trash"></i>
                                </button>
                                @endif
                            </div>
                        </td>
                    </tr>
                    @empty
                    <tr>
                        <td colspan="10" class="empty-state">
                            <div class="empty-content">
                                <i class="fas fa-shopping-cart" style="font-size: 48px; color: #ccc; margin-bottom: 16px;"></i>
                                <h3>لا توجد فواتير شراء</h3>
                                <p>قم بإنشاء فاتورة شراء جديدة للبدء</p>
                                <button onclick="window.location.href='{{ route('admin.purchase-invoices.create') }}'" class="win-button primary" style="margin-top: 16px;">
                                    <i class="fas fa-plus"></i> إنشاء فاتورة جديدة
                                </button>
                            </div>
                        </td>
                    </tr>
                    @endforelse
                </tbody>
            </table>
        </div>

        <!-- التصفح -->
        @if($invoices->hasPages())
        <div class="pagination-container">
            {{ $invoices->links() }}
        </div>
        @endif
    </div>
@endsection

@section('styles')
<style>
.main-container {
    padding: 15px;
    height: calc(100vh - 120px);
    display: flex;
    flex-direction: column;
}

.filter-section {
    background: #f8f9fa;
    border: 1px solid #ddd;
    padding: 15px;
    margin-bottom: 15px;
}

.filter-row {
    display: flex;
    align-items: center;
    gap: 15px;
    flex-wrap: wrap;
}

.excel-container {
    flex: 1;
    overflow: auto;
}

.status-badge {
    padding: 4px 8px;
    border-radius: 12px;
    font-size: 11px;
    font-weight: bold;
}

.status-badge.draft {
    background: #fff3cd;
    color: #856404;
    border: 1px solid #ffeaa7;
}

.status-badge.confirmed {
    background: #d4edda;
    color: #155724;
    border: 1px solid #b7d4c4;
}

.status-badge.cancelled {
    background: #f8d7da;
    color: #721c24;
    border: 1px solid #f1b0b7;
}

.action-buttons {
    display: flex;
    gap: 4px;
}

.action-btn {
    background: none;
    border: 1px solid #ddd;
    padding: 4px 6px;
    border-radius: 3px;
    cursor: pointer;
    font-size: 11px;
    transition: all 0.2s;
}

.action-btn:hover {
    background: #f5f5f5;
}

.action-btn.view {
    color: #007bff;
}

.action-btn.edit {
    color: #28a745;
}

.action-btn.print {
    color: #6c757d;
}

.action-btn.delete {
    color: #dc3545;
}

.empty-state {
    padding: 50px;
    text-align: center;
}

.empty-content h3 {
    color: #666;
    margin-bottom: 8px;
}

.empty-content p {
    color: #999;
    font-size: 14px;
}

.pagination-container {
    padding: 15px 0;
    text-align: center;
}
</style>
@endsection

@section('scripts')
<script>
function viewInvoice(id) {
    window.location.href = `/admin/purchase-invoices/${id}`;
}

function editInvoice(id) {
    window.location.href = `/admin/purchase-invoices/${id}/edit`;
}

function printInvoice(id) {
    const printWindow = window.open(`/admin/purchase-invoices/${id}/print`, '_blank');
    printWindow.focus();
}

function deleteInvoice(id) {
    if (confirm('هل أنت متأكد من حذف هذه الفاتورة؟\nسيتم تعديل المخزون تبعاً لذلك.')) {
        const form = document.createElement('form');
        form.method = 'POST';
        form.action = `/admin/purchase-invoices/${id}`;

        const methodInput = document.createElement('input');
        methodInput.type = 'hidden';
        methodInput.name = '_method';
        methodInput.value = 'DELETE';

        const tokenInput = document.createElement('input');
        tokenInput.type = 'hidden';
        tokenInput.name = '_token';
        tokenInput.value = '{{ csrf_token() }}';

        form.appendChild(methodInput);
        form.appendChild(tokenInput);
        document.body.appendChild(form);
        form.submit();
    }
}

// البحث والفلترة
document.getElementById('searchInput').addEventListener('input', function() {
    // تنفيذ البحث
});

document.getElementById('statusFilter').addEventListener('change', function() {
    // تنفيذ الفلترة
});
</script>
@endsection
