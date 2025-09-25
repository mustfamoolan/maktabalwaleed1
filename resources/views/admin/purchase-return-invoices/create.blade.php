@extends('layouts.desktop')

@section('title', 'فاتورة مرتجع شراء جديدة - نظام إدارة المبيعات')

@section('page-title', 'فاتورة مرتجع شراء جديدة')

@section('toolbar')
    <div class="toolbar-group">
        <button onclick="saveInvoice()" class="win-button primary">
            <i class="fas fa-save"></i> حفظ فاتورة المرتجع
        </button>
        <button onclick="window.history.back()" class="win-button">
            <i class="fas fa-arrow-left"></i> العودة
        </button>
    </div>
@endsection

@section('content')
    <div class="main-split-container">
        <!-- القسم الرئيسي للفاتورة 80% -->
        <div class="invoice-main-section">
            <form id="invoiceForm" action="{{ route('admin.purchase-return-invoices.store') }}" method="POST">
                @csrf

                <!-- معلومات أساسية للفاتورة -->
                <div class="invoice-header">
                    <div class="header-row">
                        <div class="form-group">
                            <label class="win-label">رقم فاتورة المرتجع</label>
                            <input type="text" name="invoice_number" value="{{ $invoiceNumber }}" class="win-input" readonly style="background: #f0f0f0;">
                        </div>
                        <div class="form-group">
                            <label class="win-label">تاريخ المرتجع *</label>
                            <input type="date" name="invoice_date" value="{{ date('Y-m-d') }}" class="win-input" required>
                        </div>
                        <div class="form-group">
                            <label class="win-label">كروة السائق</label>
                            <input type="number" name="driver_cost" id="driver_cost" class="win-input cost-input" step="0.01" min="0" value="0">
                        </div>
                        <div class="form-group">
                            <label class="win-label">كروة العمال</label>
                            <input type="number" name="workers_cost" id="workers_cost" class="win-input cost-input" step="0.01" min="0" value="0">
                        </div>
                    </div>
                </div>

                <!-- قسم اختيار فاتورة الشراء -->
                <div class="win-section">
                    <div class="win-section-header">
                        <h4>اختيار فاتورة الشراء للمرتجع</h4>
                        <div class="d-flex gap-2">
                            <button type="button" id="showAllInvoicesBtn" class="win-btn win-btn-info">
                                <i class="fas fa-list"></i> عرض جميع الفواتير
                            </button>
                            <button type="button" id="searchModeBtn" class="win-btn win-btn-secondary" style="display: none;">
                                <i class="fas fa-search"></i> البحث
                            </button>
                        </div>
                    </div>
                    <div class="win-section-content">
                        <!-- وضع البحث -->
                        <div id="searchMode" class="row g-3 align-items-end" style="display: none;">
                            <div class="col-md-8">
                                <label for="purchaseInvoiceSearch" class="form-label">البحث عن فاتورة الشراء</label>
                                <input type="text" id="purchaseInvoiceSearch" class="win-input" placeholder="ابحث برقم الفاتورة أو اسم المورد...">
                                <div id="invoiceSearchResults" class="search-results-dropdown"></div>
                            </div>
                            <div class="col-md-4">
                                <button type="button" id="loadInvoiceBtn" class="win-btn win-btn-primary w-100" disabled>
                                    <i class="fas fa-download"></i> تحميل الفاتورة
                                </button>
                            </div>
                        </div>

                        <!-- وضع عرض جميع الفواتير -->
                        <div id="allInvoicesMode">
                            <!-- تصفية حسب المورد -->
                            <div class="row g-3 mb-3">
                                <div class="col-md-6">
                                    <label for="supplierFilter" class="form-label">تصفية حسب المورد</label>
                                    <select id="supplierFilter" class="win-select">
                                        <option value="">جميع الموردين</option>
                                        <!-- سيتم ملء الموردين عبر JavaScript -->
                                    </select>
                                </div>
                                <div class="col-md-6 d-flex align-items-end">
                                    <button type="button" id="clearFilterBtn" class="win-btn win-btn-secondary">
                                        <i class="fas fa-times"></i> مسح التصفية
                                    </button>
                                </div>
                            </div>

                            <div class="table-responsive">
                                <table class="table win-table" id="allInvoicesTable">
                                    <thead>
                                        <tr>
                                            <th style="width: 50px;">#</th>
                                            <th style="width: 150px;">رقم الفاتورة</th>
                                            <th style="width: 200px;">المورد</th>
                                            <th style="width: 120px;">التاريخ</th>
                                            <th style="width: 100px;">عدد المنتجات</th>
                                            <th style="width: 120px;">الإجمالي</th>
                                            <th style="width: 100px;">اختيار</th>
                                        </tr>
                                    </thead>
                                    <tbody id="allInvoicesTableBody">
                                        <tr>
                                            <td colspan="7" class="text-center">
                                                <i class="fas fa-spinner fa-spin"></i> جاري تحميل الفواتير...
                                            </td>
                                        </tr>
                                    </tbody>
                                </table>
                            </div>

                            <!-- Pagination -->
                            <div class="d-flex justify-content-between align-items-center mt-3">
                                <div>
                                    <button type="button" id="prevPageBtn" class="win-btn win-btn-secondary" disabled>
                                        <i class="fas fa-chevron-right"></i> السابق
                                    </button>
                                    <button type="button" id="nextPageBtn" class="win-btn win-btn-secondary">
                                        التالي <i class="fas fa-chevron-left"></i>
                                    </button>
                                </div>
                                <div>
                                    <span id="pageInfo">الصفحة 1</span>
                                </div>
                            </div>
                        </div>

                        <!-- معلومات الفاتورة المحددة -->
                        <div id="selectedInvoiceInfo" class="mt-3" style="display: none;">
                            <div class="alert alert-success">
                                <i class="fas fa-check-circle"></i> <strong>الفاتورة المحددة للمرتجع:</strong>
                                <span id="selectedInvoiceNumber"></span>
                                <br>
                                <i class="fas fa-calendar"></i> <strong>التاريخ:</strong> <span id="selectedInvoiceDate"></span>
                                <br>
                                <i class="fas fa-money-bill"></i> <strong>الإجمالي:</strong> <span id="selectedInvoiceTotal"></span> ر.س
                            </div>
                        </div>
                    </div>
                </div>                <!-- جدول المنتجات -->
                <div class="products-table-container">
                    <table class="win-table" id="productsTable">
                        <thead>
                            <tr>
                                <th style="width: 30px;">#</th>
                                <th style="width: 200px;">اسم المنتج</th>
                                <th style="width: 120px;">المورد</th>
                                <th style="width: 100px;">الصنف</th>
                                <th style="width: 80px;">الكمية الأصلية</th>
                                <th style="width: 80px;">سعر الشراء</th>
                                <th style="width: 80px;">الكمية المرتجعة</th>
                                <th style="width: 80px;">المجموع</th>
                            </tr>
                        </thead>
                        <tbody id="productsTableBody">
                            <!-- سيتم إضافة المنتجات هنا عبر JavaScript -->
                        </tbody>
                        <tfoot>
                            <tr class="totals-row">
                                <td colspan="6" style="text-align: center; font-weight: bold;">إجمالي فاتورة المرتجع</td>
                                <td style="font-weight: bold;" id="grandTotal">0.00</td>
                                <td></td>
                            </tr>
                        </tfoot>
                    </table>
                </div>

                <div class="alert alert-info text-center" id="emptyTableMessage">
                    اختر فاتورة الشراء أولاً لعرض منتجاتها هنا.
                </div>

                <!-- الحفظ والإرسال -->
                <div class="form-actions">
                    <button type="submit" class="win-button primary">
                        <i class="fas fa-save"></i> حفظ فاتورة المرتجع
                    </button>
                    <button type="button" onclick="saveAndConfirm()" class="win-button success">
                        <i class="fas fa-check"></i> حفظ وتأكيد المرتجع
                    </button>
                </div>
            </form>
        </div>

        <!-- الشريط الجانبي للمعلومات 20% -->
        <div class="invoice-sidebar">
            <div class="sidebar-content">
                <h4>معلومات فاتورة المرتجع</h4>

                <!-- اختيار المورد -->
                <div class="form-group">
                    <label class="win-label">المورد *</label>
                    <select name="supplier_id" id="supplierId" class="win-select" required>
                        <option value="">اختر المورد</option>
                        @foreach($suppliers as $supplier)
                            <option value="{{ $supplier->id }}" data-name="{{ $supplier->name }}">{{ $supplier->name }}</option>
                        @endforeach
                    </select>
                    <input type="hidden" name="supplier_name" id="supplierName">
                </div>

                <!-- ملخص الفاتورة -->
                <div class="invoice-summary">
                    <div class="summary-item">
                        <label>المجموع الفرعي:</label>
                        <span id="subtotal">0.00 ريال</span>
                    </div>

                    <div class="form-group">
                        <label class="win-label">خصم</label>
                        <input type="number" name="discount_amount" id="discountAmount" class="win-input" step="0.01" min="0" value="0">
                    </div>

                    <div class="form-group">
                        <label class="win-label">ضريبة</label>
                        <input type="number" name="tax_amount" id="taxAmount" class="win-input" step="0.01" min="0" value="0">
                    </div>

                    <div class="form-group">
                        <label class="win-label">تكاليف إضافية</label>
                        <input type="number" name="additional_costs" id="additionalCosts" class="win-input" step="0.01" min="0" value="0">
                    </div>

                    <div class="summary-item total">
                        <label>المجموع النهائي:</label>
                        <span id="finalTotal">0.00 ريال</span>
                    </div>
                </div>

                <!-- ملاحظات -->
                <div class="form-group">
                    <label class="win-label">ملاحظات المرتجع</label>
                    <textarea name="notes" class="win-textarea" rows="4" placeholder="أدخل ملاحظات حول سبب المرتجع..."></textarea>
                </div>

                <!-- إحصائيات سريعة -->
                <div class="quick-stats">
                    <div class="stat-item">
                        <label>عدد المنتجات:</label>
                        <span id="itemCount">0</span>
                    </div>
                    <div class="stat-item">
                        <label>إجمالي الكميات:</label>
                        <span id="totalQuantity">0</span>
                    </div>
                </div>
            </div>
        </div>
    </div>

    <!-- Modal لإضافة منتج جديد -->
    <div id="addProductModal" class="modal">
        <div class="modal-content">
            <div class="modal-header">
                <h3>إضافة منتج جديد</h3>
                <button type="button" class="modal-close" onclick="closeAddProductModal()">&times;</button>
            </div>
            <div class="modal-body">
                <form id="addProductForm">
                    <div class="form-group">
                        <label class="win-label">اسم المنتج *</label>
                        <input type="text" id="newProductName" class="win-input" required>
                    </div>
                    <div class="form-group">
                        <label class="win-label">كود المنتج</label>
                        <input type="text" id="newProductCode" class="win-input">
                    </div>
                    <div class="form-group">
                        <label class="win-label">الصنف</label>
                        <select id="newProductCategory" class="win-select">
                            <option value="">اختر الصنف</option>
                        </select>
                    </div>
                    <div class="form-group">
                        <label class="win-label">سعر الشراء *</label>
                        <input type="number" id="newProductPurchasePrice" class="win-input" step="0.01" min="0" required>
                    </div>
                    <div class="form-group">
                        <label class="win-label">سعر البيع</label>
                        <input type="number" id="newProductSalePrice" class="win-input" step="0.01" min="0">
                    </div>
                    <div class="form-group">
                        <label class="win-label">سعر الجملة</label>
                        <input type="number" id="newProductWholesalePrice" class="win-input" step="0.01" min="0">
                    </div>
                </form>
            </div>
            <div class="modal-footer">
                <button type="button" onclick="saveNewProduct()" class="win-button primary">إضافة المنتج</button>
                <button type="button" onclick="closeAddProductModal()" class="win-button">إلغاء</button>
            </div>
        </div>
    </div>
@endsection

@section('styles')
<style>
/* تقسيم الشاشة */
.main-split-container {
    display: flex;
    height: calc(100vh - 120px);
    gap: 10px;
}

.invoice-main-section {
    flex: 0 0 80%;
    background: white;
    border: 1px solid #ccc;
    border-radius: 4px;
    padding: 15px;
    overflow-y: auto;
}

.invoice-sidebar {
    flex: 0 0 20%;
    background: white;
    border: 1px solid #ccc;
    border-radius: 4px;
    padding: 15px;
    overflow-y: auto;
}

/* تنسيق رأس الفاتورة */
.invoice-header {
    background: #f8f9fa;
    padding: 15px;
    border-radius: 4px;
    margin-bottom: 20px;
    border: 1px solid #dee2e6;
}

.header-row {
    display: grid;
    grid-template-columns: repeat(4, 1fr);
    gap: 15px;
}

.form-group {
    margin-bottom: 15px;
}

.win-label {
    display: block;
    margin-bottom: 5px;
    font-weight: 500;
    color: #333;
    font-size: 12px;
}

/* قسم البحث */
.product-search-section {
    margin-bottom: 20px;
    position: relative;
}

.search-container {
    position: relative;
}

.search-results {
    position: absolute;
    top: 100%;
    left: 0;
    right: 0;
    background: white;
    border: 1px solid #ccc;
    border-top: none;
    border-radius: 0 0 4px 4px;
    max-height: 200px;
    overflow-y: auto;
    z-index: 1000;
    display: none;
}

.search-result-item {
    padding: 10px;
    cursor: pointer;
    border-bottom: 1px solid #eee;
    font-size: 12px;
}

.search-result-item:hover {
    background: #f0f0f0;
}

.search-result-item:last-child {
    border-bottom: none;
}

.add-new-product-item {
    background: #e3f2fd;
    color: #1976d2;
    font-weight: bold;
    text-align: center;
}

.add-new-product-item:hover {
    background: #bbdefb;
}

/* جدول المنتجات */
.products-table-container {
    margin-bottom: 20px;
    border: 1px solid #ccc;
    border-radius: 4px;
    overflow: hidden;
}

.win-table {
    width: 100%;
    border-collapse: collapse;
    font-size: 11px;
}

.win-table th {
    background: #f0f0f0;
    padding: 8px 5px;
    text-align: center;
    border: 1px solid #ccc;
    font-weight: bold;
}

.win-table td {
    padding: 5px;
    text-align: center;
    border: 1px solid #ddd;
    vertical-align: middle;
}

.win-table input {
    width: 100%;
    border: none;
    background: transparent;
    text-align: center;
    font-size: 11px;
    padding: 2px;
}

.win-table input:focus {
    background: #fff3cd;
    outline: 1px solid #ffc107;
}

.totals-row {
    background: #f8f9fa;
    font-weight: bold;
}

.totals-row td {
    padding: 10px 5px;
    border-top: 2px solid #007bff;
}

/* أزرار الحذف */
.delete-btn {
    background: #dc3545;
    color: white;
    border: none;
    padding: 4px 8px;
    border-radius: 3px;
    cursor: pointer;
    font-size: 10px;
}

.delete-btn:hover {
    background: #c82333;
}

/* الشريط الجانبي */
.sidebar-content h4 {
    margin: 0 0 20px 0;
    padding-bottom: 10px;
    border-bottom: 1px solid #dee2e6;
    color: #495057;
    font-size: 14px;
}

.invoice-summary {
    background: #f8f9fa;
    padding: 15px;
    border-radius: 4px;
    margin: 20px 0;
    border: 1px solid #dee2e6;
}

.summary-item {
    display: flex;
    justify-content: space-between;
    margin-bottom: 10px;
    font-size: 12px;
}

.summary-item.total {
    font-weight: bold;
    font-size: 14px;
    color: #007bff;
    border-top: 1px solid #dee2e6;
    padding-top: 10px;
    margin-top: 10px;
}

.quick-stats {
    background: #e9ecef;
    padding: 10px;
    border-radius: 4px;
    margin-top: 20px;
}

.stat-item {
    display: flex;
    justify-content: space-between;
    margin-bottom: 5px;
    font-size: 11px;
}

.stat-item:last-child {
    margin-bottom: 0;
}

/* أزرار الحفظ */
.form-actions {
    text-align: center;
    margin-top: 20px;
    padding-top: 20px;
    border-top: 1px solid #dee2e6;
}

.form-actions .win-button {
    margin: 0 10px;
}

/* Modal */
.modal {
    display: none;
    position: fixed;
    z-index: 2000;
    left: 0;
    top: 0;
    width: 100%;
    height: 100%;
    background-color: rgba(0,0,0,0.5);
}

.modal-content {
    background-color: #fefefe;
    margin: 5% auto;
    padding: 0;
    border: 1px solid #888;
    border-radius: 4px;
    width: 500px;
    max-width: 90%;
}

.modal-header {
    background: #f8f9fa;
    padding: 15px 20px;
    border-bottom: 1px solid #dee2e6;
    display: flex;
    justify-content: space-between;
    align-items: center;
    border-radius: 4px 4px 0 0;
}

.modal-header h3 {
    margin: 0;
    font-size: 16px;
    color: #495057;
}

.modal-close {
    background: none;
    border: none;
    font-size: 24px;
    cursor: pointer;
    color: #aaa;
}

.modal-close:hover {
    color: #000;
}

.modal-body {
    padding: 20px;
}

.modal-footer {
    background: #f8f9fa;
    padding: 15px 20px;
    border-top: 1px solid #dee2e6;
    text-align: left;
    border-radius: 0 0 4px 4px;
}

/* تنسيق جدول جميع الفواتير */
#allInvoicesTable {
    font-size: 13px;
}

#allInvoicesTable th {
    background: #f8f9fa;
    font-weight: bold;
    text-align: center;
    padding: 12px 8px;
    border-bottom: 2px solid #007bff;
}

#allInvoicesTable td {
    text-align: center;
    padding: 10px 8px;
    vertical-align: middle;
}

#allInvoicesTable tbody tr:hover {
    background-color: #f5f5f5;
}

.btn-sm {
    padding: 4px 8px;
    font-size: 11px;
}

/* تنسيق تصفية الموردين */
#supplierFilter {
    font-size: 13px;
    padding: 8px;
}

#clearFilterBtn {
    height: 40px;
}

.mb-3 {
    margin-bottom: 1rem !important;
}

/* تحسينات إضافية */
.cost-input {
    width: 100px;
}

.win-textarea {
    width: 100%;
    min-height: 80px;
    padding: 8px;
    border: 1px solid #ccc;
    border-radius: 3px;
    font-family: inherit;
    font-size: 12px;
    resize: vertical;
}

.win-select {
    width: 100%;
    padding: 6px;
    border: 1px solid #ccc;
    border-radius: 3px;
    font-size: 12px;
    background: white;
}

/* تنسيق responsive */
@media (max-width: 1200px) {
    .main-split-container {
        flex-direction: column;
        height: auto;
    }

    .invoice-main-section,
    .invoice-sidebar {
        flex: none;
        width: 100%;
    }

    .invoice-sidebar {
        margin-top: 20px;
    }

    .header-row {
        grid-template-columns: repeat(2, 1fr);
    }
}

@media (max-width: 768px) {
    .header-row {
        grid-template-columns: 1fr;
    }

    .win-table {
        font-size: 10px;
    }

    .win-table th,
    .win-table td {
        padding: 4px 2px;
    }
}
</style>
@endsection

@section('scripts')
<script>
let productCounter = 0;
let selectedProducts = [];

// تهيئة الصفحة
document.addEventListener('DOMContentLoaded', function() {
    setupInvoiceSelection();
    setupSupplierSelection();
    setupCalculations();
    loadSuppliers(); // تحميل قائمة الموردين
    loadAllInvoices(); // تحميل جميع الفواتير عند تحميل الصفحة
});

// إعداد اختيار الفواتير (البحث أو عرض الكل)
function setupInvoiceSelection() {
    setupAllInvoicesMode();
    setupSearchMode();
}

// إعداد وضع عرض جميع الفواتير
function setupAllInvoicesMode() {
    const showAllBtn = document.getElementById('showAllInvoicesBtn');
    const searchModeBtn = document.getElementById('searchModeBtn');
    const allInvoicesMode = document.getElementById('allInvoicesMode');
    const searchMode = document.getElementById('searchMode');
    const prevPageBtn = document.getElementById('prevPageBtn');
    const nextPageBtn = document.getElementById('nextPageBtn');
    const supplierFilter = document.getElementById('supplierFilter');
    const clearFilterBtn = document.getElementById('clearFilterBtn');

    let currentPage = 1;
    let lastPage = 1;

    // عرض جميع الفواتير
    showAllBtn.addEventListener('click', function() {
        allInvoicesMode.style.display = 'block';
        searchMode.style.display = 'none';
        showAllBtn.style.display = 'none';
        searchModeBtn.style.display = 'inline-block';
        loadAllInvoices(1);
    });

    // الانتقال لوضع البحث
    searchModeBtn.addEventListener('click', function() {
        allInvoicesMode.style.display = 'none';
        searchMode.style.display = 'block';
        showAllBtn.style.display = 'inline-block';
        searchModeBtn.style.display = 'none';
    });

    // Pagination
    prevPageBtn.addEventListener('click', function() {
        if (currentPage > 1) {
            currentPage--;
            loadAllInvoices(currentPage);
        }
    });

    nextPageBtn.addEventListener('click', function() {
        if (currentPage < lastPage) {
            currentPage++;
            loadAllInvoices(currentPage);
        }
    });

    // تصفية حسب المورد
    supplierFilter.addEventListener('change', function() {
        currentPage = 1;
        loadAllInvoices(currentPage);
    });

    // مسح التصفية
    clearFilterBtn.addEventListener('click', function() {
        supplierFilter.value = '';
        currentPage = 1;
        loadAllInvoices(currentPage);
    });

    // اختيار فاتورة من الجدول باستخدام event delegation
    document.addEventListener('click', function(e) {
        if (e.target.closest('.select-invoice-btn')) {
            const btn = e.target.closest('.select-invoice-btn');
            const invoice = {
                id: btn.dataset.invoiceId,
                invoice_number: btn.dataset.invoiceNumber,
                invoice_date: btn.dataset.invoiceDate,
                final_total: btn.dataset.invoiceTotal,
                supplier_name: btn.dataset.supplierName
            };

            // عرض معلومات الفاتورة المحددة
            document.getElementById('selectedInvoiceNumber').textContent = `${invoice.invoice_number} - المورد: ${invoice.supplier_name}`;
            document.getElementById('selectedInvoiceDate').textContent = invoice.invoice_date;
            document.getElementById('selectedInvoiceTotal').textContent = invoice.final_total;
            document.getElementById('selectedInvoiceInfo').style.display = 'block';

            // تحميل منتجات الفاتورة
            loadPurchaseInvoice(invoice.id);
        }
    });

    // تحديث معلومات الصفحة
    window.updatePagination = function(current, last) {
        currentPage = current;
        lastPage = last;
        prevPageBtn.disabled = currentPage <= 1;
        nextPageBtn.disabled = currentPage >= lastPage;
        document.getElementById('pageInfo').textContent = `الصفحة ${currentPage} من ${lastPage}`;
    };
}

// إعداد وضع البحث
function setupSearchMode() {
    const searchInput = document.getElementById('purchaseInvoiceSearch');
    const searchResults = document.getElementById('invoiceSearchResults');
    const loadBtn = document.getElementById('loadInvoiceBtn');
    let searchTimeout;
    let selectedInvoiceId = null;

    searchInput.addEventListener('input', function() {
        clearTimeout(searchTimeout);
        const query = this.value.trim();

        if (query.length < 2) {
            searchResults.style.display = 'none';
            loadBtn.disabled = true;
            selectedInvoiceId = null;
            return;
        }

        searchTimeout = setTimeout(() => {
            searchPurchaseInvoices(query);
        }, 300);
    });

    // تحميل الفاتورة المحددة
    loadBtn.addEventListener('click', function() {
        if (selectedInvoiceId) {
            loadPurchaseInvoice(selectedInvoiceId);
        }
    });

    // إخفاء النتائج عند النقر خارجها
    document.addEventListener('click', function(e) {
        if (!searchInput.contains(e.target) && !searchResults.contains(e.target)) {
            searchResults.style.display = 'none';
        }
    });

    // وظيفة اختيار الفاتورة
    window.selectPurchaseInvoice = function(invoice) {
        selectedInvoiceId = invoice.id;
        searchInput.value = invoice.invoice_number;
        searchResults.style.display = 'none';
        loadBtn.disabled = false;

        // عرض معلومات الفاتورة
        document.getElementById('selectedInvoiceNumber').textContent = invoice.invoice_number;
        document.getElementById('selectedInvoiceDate').textContent = invoice.invoice_date;
        document.getElementById('selectedInvoiceTotal').textContent = invoice.final_total;

        // إضافة اسم المورد إذا كان متوفراً
        const supplierInfo = invoice.supplier_name ? ` - المورد: ${invoice.supplier_name}` : '';
        document.getElementById('selectedInvoiceNumber').textContent = `${invoice.invoice_number}${supplierInfo}`;

        document.getElementById('selectedInvoiceInfo').style.display = 'block';
    };

    // إضافة event listener لعناصر البحث
    document.addEventListener('click', function(e) {
        if (e.target.closest('.search-invoice-item')) {
            const item = e.target.closest('.search-invoice-item');
            const index = parseInt(item.dataset.invoiceIndex);
            const invoice = searchInvoicesData[index];

            if (invoice) {
                selectedInvoiceId = invoice.id;
                searchInput.value = invoice.invoice_number;
                searchResults.style.display = 'none';
                loadBtn.disabled = false;

                // عرض معلومات الفاتورة
                document.getElementById('selectedInvoiceNumber').textContent = `${invoice.invoice_number} - المورد: ${invoice.supplier_name}`;
                document.getElementById('selectedInvoiceDate').textContent = invoice.invoice_date;
                document.getElementById('selectedInvoiceTotal').textContent = invoice.final_total;
                document.getElementById('selectedInvoiceInfo').style.display = 'block';
            }
        }
    });
}

// تحميل جميع فواتير الشراء
function loadAllInvoices(page = 1) {
    const tableBody = document.getElementById('allInvoicesTableBody');
    const supplierFilter = document.getElementById('supplierFilter');

    // عرض مؤشر التحميل
    tableBody.innerHTML = `
        <tr>
            <td colspan="7" class="text-center">
                <i class="fas fa-spinner fa-spin"></i> جاري تحميل الفواتير...
            </td>
        </tr>
    `;

    // بناء URL مع التصفية
    let url = `{{ route('admin.purchase-invoices.all') }}?page=${page}`;
    if (supplierFilter && supplierFilter.value) {
        url += `&supplier=${encodeURIComponent(supplierFilter.value)}`;
    }

    fetch(url)
        .then(response => response.json())
        .then(data => {
            let html = '';

            if (data.data.length > 0) {
                data.data.forEach((invoice, index) => {
                    const rowNumber = ((page - 1) * data.per_page) + index + 1;
                    html += `
                        <tr>
                            <td>${rowNumber}</td>
                            <td><strong>${invoice.invoice_number}</strong></td>
                            <td>${invoice.supplier_name}</td>
                            <td>${invoice.invoice_date}</td>
                            <td>${invoice.items_count} منتج</td>
                            <td>${invoice.final_total} ريال</td>
                            <td>
                                <button type="button" class="win-btn win-btn-success btn-sm select-invoice-btn"
                                        data-invoice-id="${invoice.id}"
                                        data-invoice-number="${invoice.invoice_number}"
                                        data-invoice-date="${invoice.invoice_date}"
                                        data-invoice-total="${invoice.final_total}"
                                        data-supplier-name="${invoice.supplier_name}">
                                    <i class="fas fa-check"></i> اختيار
                                </button>
                            </td>
                        </tr>
                    `;
                });
            } else {
                const filterMessage = supplierFilter && supplierFilter.value
                    ? `لا توجد فواتير شراء للمورد: ${supplierFilter.value}`
                    : 'لا توجد فواتير شراء مؤكدة';

                html = `
                    <tr>
                        <td colspan="7" class="text-center">
                            <i class="fas fa-info-circle"></i> ${filterMessage}
                        </td>
                    </tr>
                `;
            }

            tableBody.innerHTML = html;
            updatePagination(data.current_page, data.last_page);
        })
        .catch(error => {
            console.error('خطأ في تحميل الفواتير:', error);
            tableBody.innerHTML = `
                <tr>
                    <td colspan="7" class="text-center text-danger">
                        <i class="fas fa-exclamation-triangle"></i> حدث خطأ في تحميل الفواتير
                    </td>
                </tr>
            `;
        });
}

// تحميل قائمة الموردين
function loadSuppliers() {
    fetch(`{{ route('admin.suppliers.with-invoices') }}`)
        .then(response => response.json())
        .then(suppliers => {
            const supplierSelect = document.getElementById('supplierFilter');

            // مسح الخيارات الحالية عدا "جميع الموردين"
            supplierSelect.innerHTML = '<option value="">جميع الموردين</option>';

            // إضافة الموردين
            suppliers.forEach(supplier => {
                const option = document.createElement('option');
                option.value = supplier;
                option.textContent = supplier;
                supplierSelect.appendChild(option);
            });
        })
        .catch(error => {
            console.error('خطأ في تحميل الموردين:', error);
        });
}

// البحث عن فواتير الشراء
let searchInvoicesData = []; // متغير مؤقت لحفظ بيانات البحث

function searchPurchaseInvoices(query) {
    const searchResults = document.getElementById('invoiceSearchResults');

    fetch(`{{ route('admin.purchase-invoices.search') }}?q=${encodeURIComponent(query)}`)
        .then(response => response.json())
        .then(data => {
            searchInvoicesData = data; // حفظ البيانات
            let html = '';

            if (data.length > 0) {
                data.forEach((invoice, index) => {
                    html += `
                        <div class="search-result-item search-invoice-item" data-invoice-index="${index}">
                            <strong>فاتورة رقم: ${invoice.invoice_number}</strong><br>
                            <small><i class="fas fa-user"></i> المورد: ${invoice.supplier_name}</small><br>
                            <small><i class="fas fa-calendar"></i> تاريخ: ${invoice.invoice_date} | <i class="fas fa-box"></i> عدد المنتجات: ${invoice.items_count}</small><br>
                            <small><i class="fas fa-money-bill"></i> الإجمالي: ${invoice.final_total} ريال</small>
                        </div>
                    `;
                });
            } else {
                html = '<div class="search-result-item">لا توجد فواتير شراء تطابق البحث</div>';
            }

            searchResults.innerHTML = html;
            searchResults.style.display = 'block';
        })
        .catch(error => {
            console.error('خطأ في البحث:', error);
            searchResults.innerHTML = '<div class="search-result-item">حدث خطأ في البحث</div>';
            searchResults.style.display = 'block';
        });
}

// تحميل فاتورة الشراء وعرض منتجاتها
function loadPurchaseInvoice(invoiceId) {
    fetch(`{{ url('admin/purchase-invoices') }}/${invoiceId}/details`)
        .then(response => response.json())
        .then(data => {
            // مسح الجدول الحالي
            selectedProducts = [];
            const tableBody = document.getElementById('productsTableBody');
            tableBody.innerHTML = '';

            // تحديث معلومات المورد
            if (data.items.length > 0) {
                const supplierSelect = document.getElementById('supplier_id');
                supplierSelect.value = ''; // سيتم تحديثه لاحقاً إذا أردنا
                document.getElementById('supplier_name').value = data.items[0].supplier_name;
            }

            // إضافة المنتجات للجدول
            data.items.forEach((item, index) => {
                addInvoiceItemToTable(item, index + 1);
            });

            calculateTotals();

            // إخفاء رسالة الجدول الفارغ
            document.getElementById('emptyTableMessage').style.display = 'none';
        })
        .catch(error => {
            console.error('خطأ في تحميل الفاتورة:', error);
            alert('حدث خطأ في تحميل الفاتورة');
        });
}

// إضافة منتج من فاتورة الشراء للجدول
function addInvoiceItemToTable(item, rowNumber) {
    selectedProducts.push(item);

    const tbody = document.getElementById('productsTableBody');
    const row = tbody.insertRow();
    row.id = `product-row-${rowNumber}`;

    const purchasePrice = parseFloat(item.purchase_price_after_cost || item.purchase_price) || 0;

    row.innerHTML = `
        <td>${rowNumber}</td>
        <td>
            <input type="text" value="${item.product_name}" class="win-input" readonly style="background: #f9f9f9;">
            <input type="hidden" name="items[${rowNumber}][product_id]" value="${item.product_id}">
            <input type="hidden" name="items[${rowNumber}][original_invoice_item_id]" value="${item.id}">
        </td>
        <td>
            <input type="text" value="${item.supplier_name || ''}" class="win-input" readonly style="background: #f9f9f9;">
        </td>
        <td>
            <input type="text" value="${item.category_name || 'غير محدد'}" class="win-input" readonly style="background: #f9f9f9;">
        </td>
        <td>
            <input type="number" value="${item.original_quantity}" class="win-input" readonly style="background: #f9f9f9;">
        </td>
        <td>
            <input type="number" name="items[${rowNumber}][purchase_price]" value="${purchasePrice.toFixed(2)}"
                   class="win-input price-input" step="0.01" min="0" readonly style="background: #f9f9f9;">
        </td>
        <td>
            <input type="number" name="items[${rowNumber}][quantity]" value="0"
                   class="win-input quantity-input" step="0.01" min="0" max="${item.original_quantity}"
                   onchange="calculateRowTotal(${rowNumber})" required>
        </td>
        <td>
            <span class="row-total" id="total-${rowNumber}">0.00</span>
        </td>
    `;

    // حساب المجموع للصف
    calculateRowTotal(rowNumber);
}

// حساب مجموع الصف
function calculateRowTotal(rowId) {
    const quantityInput = document.querySelector(`#product-row-${rowId} input[name*="[quantity]"]`);
    const priceInput = document.querySelector(`#product-row-${rowId} input[name*="[purchase_price]"]`);
    const totalElement = document.getElementById(`total-${rowId}`);

    if (quantityInput && priceInput && totalElement) {
        const quantity = parseFloat(quantityInput.value) || 0;
        const price = parseFloat(priceInput.value) || 0;
        const total = quantity * price;

        totalElement.textContent = total.toFixed(2);
        calculateTotals();
    }
}

    // إضافة الحقول المخفية
    row.innerHTML += `
        <input type="hidden" name="items[${productCounter}][purchase_price_after_cost]" value="${purchasePrice.toFixed(2)}">
        <input type="hidden" name="items[${productCounter}][sale_price]" value="${product.sale_price || 0}">
        <input type="hidden" name="items[${productCounter}][wholesale_price]" value="${product.wholesale_price || 0}">
    `;

    calculateTotals();

    // إخفاء نتائج البحث وتنظيف البحث
    document.getElementById('searchResults').style.display = 'none';
    document.getElementById('productSearch').value = '';
}

// حساب مجموع الصف
function calculateRowTotal(counter) {
    const row = document.getElementById(`product-row-${counter}`);
    const price = parseFloat(row.querySelector(`input[name="items[${counter}][purchase_price]"]`).value) || 0;
    const quantity = parseFloat(row.querySelector(`input[name="items[${counter}][quantity]"]`).value) || 0;
    const total = price * quantity;

    document.getElementById(`total-${counter}`).textContent = total.toFixed(2);
    calculateTotals();
}

// حساب المجاميع الإجمالية
function calculateTotals() {
    let subtotal = 0;
    let itemCount = 0;
    let totalQuantity = 0;

    // حساب إجمالي المنتجات
    document.querySelectorAll('.row-total').forEach(cell => {
        subtotal += parseFloat(cell.textContent) || 0;
    });

    // عدد المنتجات المرتجعة
    document.querySelectorAll('#productsTableBody tr').forEach(row => {
        const quantityInput = row.querySelector('.quantity-input');
        if (quantityInput && parseFloat(quantityInput.value) > 0) {
            itemCount++;
            totalQuantity += parseFloat(quantityInput.value) || 0;
        }
    });

    // التكاليف الإضافية
    const discount = parseFloat(document.getElementById('discount_amount')?.value) || 0;
    const tax = parseFloat(document.getElementById('tax_amount')?.value) || 0;
    const additionalCosts = parseFloat(document.getElementById('additional_costs')?.value) || 0;

    const finalTotal = subtotal - discount + tax + additionalCosts;

    // تحديث العرض في الشريط الجانبي
    const subtotalElement = document.getElementById('subtotal');
    const finalTotalElement = document.getElementById('finalTotal');
    const grandTotalElement = document.getElementById('grandTotal');
    const itemCountElement = document.getElementById('itemCount');
    const totalQuantityElement = document.getElementById('totalQuantity');

    if (subtotalElement) subtotalElement.textContent = subtotal.toFixed(2) + ' ريال';
    if (finalTotalElement) finalTotalElement.textContent = finalTotal.toFixed(2) + ' ريال';
    if (grandTotalElement) grandTotalElement.textContent = finalTotal.toFixed(2);
    if (itemCountElement) itemCountElement.textContent = itemCount;
    if (totalQuantityElement) totalQuantityElement.textContent = totalQuantity.toFixed(2);
}

// حذف منتج
function removeProduct(counter, productId) {
    document.getElementById(`product-row-${counter}`).remove();
    selectedProducts = selectedProducts.filter(p => p.id !== productId);
    calculateTotals();
}

// إعداد اختيار المورد
function setupSupplierSelection() {
    const supplierSelect = document.getElementById('supplierId');
    const supplierNameInput = document.getElementById('supplierName');

    supplierSelect.addEventListener('change', function() {
        const selectedOption = this.options[this.selectedIndex];
        supplierNameInput.value = selectedOption.dataset.name || '';
    });
}

// إعداد الحسابات
function setupCalculations() {
    ['discountAmount', 'taxAmount', 'additionalCosts'].forEach(id => {
        const element = document.getElementById(id);
        if (element) {
            element.addEventListener('input', calculateTotals);
        }
    });
}

// فتح نافذة إضافة منتج جديد
function openAddProductModal(searchQuery = '') {
    document.getElementById('addProductModal').style.display = 'block';
    document.getElementById('newProductName').value = searchQuery;

    // تحميل الأصناف
    loadCategories();
}

// إغلاق نافذة إضافة منتج
function closeAddProductModal() {
    document.getElementById('addProductModal').style.display = 'none';
    document.getElementById('addProductForm').reset();
}

// تحميل الأصناف
function loadCategories() {
    fetch('{{ route("admin.categories.list") }}')
        .then(response => response.json())
        .then(categories => {
            const select = document.getElementById('newProductCategory');
            select.innerHTML = '<option value="">اختر الصنف</option>';

            categories.forEach(category => {
                select.innerHTML += `<option value="${category.id}">${category.name}</option>`;
            });
        })
        .catch(error => console.error('خطأ في تحميل الأصناف:', error));
}

// حفظ منتج جديد
function saveNewProduct() {
    const formData = {
        name: document.getElementById('newProductName').value,
        code: document.getElementById('newProductCode').value,
        category_id: document.getElementById('newProductCategory').value,
        purchase_price: document.getElementById('newProductPurchasePrice').value,
        sale_price: document.getElementById('newProductSalePrice').value,
        wholesale_price: document.getElementById('newProductWholesalePrice').value
    };

    if (!formData.name || !formData.purchase_price) {
        alert('يرجى إدخال اسم المنتج وسعر الشراء على الأقل');
        return;
    }

    fetch('{{ route("admin.products.store-ajax") }}', {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json',
            'X-CSRF-TOKEN': document.querySelector('meta[name="csrf-token"]').getAttribute('content')
        },
        body: JSON.stringify(formData)
    })
    .then(response => response.json())
    .then(data => {
        if (data.success) {
            addProductToTable(data.product);
            closeAddProductModal();
        } else {
            alert('خطأ في إضافة المنتج: ' + (data.message || 'خطأ غير معروف'));
        }
    })
    .catch(error => {
        console.error('خطأ:', error);
        alert('حدث خطأ في إضافة المنتج');
    });
}

// حفظ الفاتورة
function saveInvoice() {
    document.getElementById('invoiceForm').submit();
}

// حفظ وتأكيد الفاتورة
function saveAndConfirm() {
    // إضافة حقل مخفي للتأكيد
    const confirmInput = document.createElement('input');
    confirmInput.type = 'hidden';
    confirmInput.name = 'confirm_invoice';
    confirmInput.value = '1';
    document.getElementById('invoiceForm').appendChild(confirmInput);

    document.getElementById('invoiceForm').submit();
}

// إغلاق النافذة المنبثقة عند النقر خارجها
window.onclick = function(event) {
    const modal = document.getElementById('addProductModal');
    if (event.target === modal) {
        closeAddProductModal();
    }
}
</script>
@endsection
