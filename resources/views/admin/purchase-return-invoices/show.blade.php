@extends('layouts.desktop')

@section('title', 'عرض فاتورة مرتجع الشراء - نظام إدارة المبيعات')

@section('page-title', 'عرض فاتورة مرتجع الشراء رقم: {{ $purchaseReturnInvoice->invoice_number }}')

@section('toolbar')
    <div class="toolbar-group">
        @if($purchaseReturnInvoice->status === 'draft')
        <button onclick="window.location.href='{{ route('admin.purchase-return-invoices.edit', $purchaseReturnInvoice->id) }}'" class="win-button primary">
            <i class="fas fa-edit"></i> تعديل فاتورة المرتجع
        </button>
        <button onclick="confirmInvoice()" class="win-button success">
            <i class="fas fa-check"></i> تأكيد المرتجع
        </button>
        @endif
        @if($purchaseReturnInvoice->status === 'confirmed')
        <button onclick="cancelInvoice()" class="win-button warning">
            <i class="fas fa-times"></i> إلغاء المرتجع
        </button>
        @endif
        <button onclick="printInvoice()" class="win-button">
            <i class="fas fa-print"></i> طباعة
        </button>
        <button onclick="window.location.href='{{ route('admin.purchase-return-invoices.index') }}'" class="win-button">
            <i class="fas fa-arrow-left"></i> العودة للقائمة
        </button>
    </div>
@endsection

@section('content')
    <div class="main-split-container">
        <!-- القسم الرئيسي للفاتورة 80% -->
        <div class="invoice-main-section">
            <!-- معلومات أساسية للفاتورة -->
            <div class="invoice-header">
                <div class="header-row">
                    <div class="form-group">
                        <label class="win-label">رقم فاتورة المرتجع</label>
                        <input type="text" value="{{ $purchaseReturnInvoice->invoice_number }}" class="win-input" readonly style="background: #f0f0f0;">
                    </div>
                    <div class="form-group">
                        <label class="win-label">تاريخ المرتجع</label>
                        <input type="date" value="{{ $purchaseReturnInvoice->invoice_date->format('Y-m-d') }}" class="win-input" readonly style="background: #f0f0f0;">
                    </div>
                    <div class="form-group">
                        <label class="win-label">المورد</label>
                        <input type="text" value="{{ $purchaseReturnInvoice->supplier_name }}" class="win-input" readonly style="background: #f0f0f0;">
                    </div>
                    <div class="form-group">
                        <label class="win-label">الحالة</label>
                        <div style="padding: 8px 0;">
                            <span class="status-badge {{ $purchaseReturnInvoice->status }}">{{ $purchaseReturnInvoice->status_text }}</span>
                        </div>
                    </div>
                </div>
            </div>

            <!-- جدول المنتجات المرتجعة -->
            <div class="products-table-container">
                <table class="win-table" id="productsTable">
                    <thead>
                        <tr>
                            <th style="width: 30px;">#</th>
                            <th style="width: 200px;">اسم المنتج</th>
                            <th style="width: 120px;">المورد</th>
                            <th style="width: 100px;">الصنف</th>
                            <th style="width: 80px;">سعر الشراء</th>
                            <th style="width: 80px;">الكمية المرتجعة</th>
                            <th style="width: 80px;">المجموع</th>
                        </tr>
                    </thead>
                    <tbody id="productsTableBody">
                        @foreach($purchaseReturnInvoice->items as $index => $item)
                        <tr class="product-row" onclick="showProductDetails({{ json_encode($item) }})" style="cursor: pointer;">
                            <td>{{ $index + 1 }}</td>
                            <td>
                                <input type="text" value="{{ $item->product_name }}" class="win-input" style="width: 100%; font-size: 11px; cursor: pointer;" readonly>
                            </td>
                            <td>
                                <input type="text" value="{{ $item->supplier_name }}" class="win-input" style="width: 100%; font-size: 11px; cursor: pointer;" readonly>
                            </td>
                            <td>
                                <input type="text" value="{{ $item->category_name }}" class="win-input" style="width: 100%; font-size: 11px; cursor: pointer;" readonly>
                            </td>
                            <td>
                                <input type="text" value="{{ number_format($item->purchase_price, 2) }}" class="win-input" style="width: 100%; font-size: 11px; cursor: pointer;" readonly>
                            </td>
                            <td>
                                <input type="text" value="{{ $item->quantity }}" class="win-input" style="width: 100%; font-size: 11px; cursor: pointer;" readonly>
                            </td>
                            <td>
                                <input type="text" value="{{ number_format($item->total_price, 2) }}" class="win-input" style="width: 100%; font-size: 11px; cursor: pointer;" readonly>
                            </td>
                        </tr>
                        @endforeach
                    </tbody>
                    <tfoot>
                        <tr class="totals-row">
                            <td colspan="6" style="text-align: center; font-weight: bold;">إجمالي فاتورة المرتجع</td>
                            <td style="font-weight: bold;">{{ number_format($purchaseReturnInvoice->final_total, 2) }}</td>
                        </tr>
                    </tfoot>
                </table>
            </div>

            @if($purchaseReturnInvoice->notes)
            <!-- الملاحظات -->
            <div class="notes-section">
                <h4>ملاحظات المرتجع:</h4>
                <div class="notes-content">{{ $purchaseReturnInvoice->notes }}</div>
            </div>
            @endif
        </div>

        <!-- الشريط الجانبي للمعلومات 20% -->
        <div class="invoice-sidebar">
            <div class="sidebar-content">
                <!-- المحتوى الافتراضي -->
                <div id="default-content">
                    <h4>معلومات فاتورة المرتجع</h4>

                    <div class="info-item">
                        <label>رقم الفاتورة:</label>
                        <span>{{ $purchaseReturnInvoice->invoice_number }}</span>
                    </div>

                    <div class="info-item">
                        <label>تاريخ المرتجع:</label>
                        <span>{{ $purchaseReturnInvoice->invoice_date->format('Y-m-d') }}</span>
                    </div>

                    <div class="info-item">
                        <label>المورد:</label>
                        <span>{{ $purchaseReturnInvoice->supplier_name }}</span>
                    </div>

                    <div class="info-item">
                        <label>الحالة:</label>
                        <span class="status-badge {{ $purchaseReturnInvoice->status }}">{{ $purchaseReturnInvoice->status_text }}</span>
                    </div>

                    <div class="info-item">
                        <label>عدد المنتجات:</label>
                        <span>{{ $purchaseReturnInvoice->items->count() }} منتج</span>
                    </div>

                    <div class="info-item">
                        <label>إجمالي الكميات:</label>
                        <span>{{ $purchaseReturnInvoice->items->sum('quantity') }} قطعة</span>
                    </div>

                    <div class="info-item">
                        <label>تاريخ الإنشاء:</label>
                        <span>{{ $purchaseReturnInvoice->created_at->format('Y-m-d') }}</span>
                    </div>

                    <div class="info-item">
                        <label>وقت الإنشاء:</label>
                        <span>{{ $purchaseReturnInvoice->created_at->format('H:i') }}</span>
                    </div>

                    @if($purchaseReturnInvoice->creator)
                    <div class="info-item">
                        <label>تم الإنشاء بواسطة:</label>
                        <span>{{ $purchaseReturnInvoice->creator->name }}</span>
                    </div>
                    @endif

                    <!-- ملخص الفاتورة -->
                    <div class="invoice-summary">
                        <div class="summary-item">
                            <label>المجموع الفرعي:</label>
                            <span>{{ number_format($purchaseReturnInvoice->subtotal, 2) }} ريال</span>
                        </div>

                        @if($purchaseReturnInvoice->discount_amount > 0)
                        <div class="summary-item">
                            <label>الخصم:</label>
                            <span>{{ number_format($purchaseReturnInvoice->discount_amount, 2) }} ريال</span>
                        </div>
                        @endif

                        @if($purchaseReturnInvoice->tax_amount > 0)
                        <div class="summary-item">
                            <label>الضريبة:</label>
                            <span>{{ number_format($purchaseReturnInvoice->tax_amount, 2) }} ريال</span>
                        </div>
                        @endif

                        @if($purchaseReturnInvoice->additional_costs > 0)
                        <div class="summary-item">
                            <label>تكاليف إضافية:</label>
                            <span>{{ number_format($purchaseReturnInvoice->additional_costs, 2) }} ريال</span>
                        </div>
                        @endif

                        <div class="summary-item total">
                            <label>المجموع النهائي:</label>
                            <span>{{ number_format($purchaseReturnInvoice->final_total, 2) }} ريال</span>
                        </div>
                    </div>

                    <div class="info-hint">
                        <i class="fas fa-info-circle"></i>
                        اضغط على أي منتج لعرض تفاصيله الكاملة
                    </div>
                </div>

                <!-- تفاصيل المنتج -->
                <div id="product-details" style="display: none;">
                    <div class="product-header">
                        <button type="button" class="back-btn" onclick="hideProductDetails()">
                            <i class="fas fa-arrow-right"></i> عودة
                        </button>
                        <h4 id="product-name"></h4>
                    </div>

                    <div class="product-info">
                        <div class="info-item">
                            <label>اسم المنتج:</label>
                            <span id="detail-product-name"></span>
                        </div>

                        <div class="info-item">
                            <label>المورد:</label>
                            <span id="detail-supplier-name"></span>
                        </div>

                        <div class="info-item">
                            <label>الصنف:</label>
                            <span id="detail-category-name"></span>
                        </div>

                        <div class="price-section">
                            <h5><i class="fas fa-dollar-sign"></i> الأسعار</h5>
                            <div class="info-item">
                                <label>سعر الشراء:</label>
                                <span id="detail-purchase-price" class="price-value"></span>
                            </div>

                            <div class="info-item highlight">
                                <label>سعر الشراء بعد التكلفة:</label>
                                <span id="detail-purchase-price-after-cost" class="price-value"></span>
                            </div>

                            <div class="info-item">
                                <label>سعر البيع:</label>
                                <span id="detail-sale-price" class="price-value"></span>
                            </div>

                            <div class="info-item">
                                <label>سعر البيع جملة:</label>
                                <span id="detail-wholesale-price" class="price-value"></span>
                            </div>
                        </div>

                        <div class="quantity-section">
                            <h5><i class="fas fa-boxes"></i> الكمية المرتجعة</h5>
                            <div class="info-item">
                                <label>الكمية المرتجعة:</label>
                                <span id="detail-quantity" class="quantity-value"></span>
                            </div>

                            <div class="info-item total">
                                <label>إجمالي المبلغ:</label>
                                <span id="detail-total" class="total-value"></span>
                            </div>
                        </div>

                        <div class="profit-section">
                            <h5><i class="fas fa-chart-line"></i> هامش الربح (المفقود)</h5>
                            <div class="info-item">
                                <label>ربح القطعة (تجزئة):</label>
                                <span id="detail-profit-retail" class="profit-value"></span>
                            </div>

                            <div class="info-item">
                                <label>ربح القطعة (جملة):</label>
                                <span id="detail-profit-wholesale" class="profit-value"></span>
                            </div>

                            <div class="info-item">
                                <label>نسبة الربح (تجزئة):</label>
                                <span id="detail-profit-percent-retail" class="percent-value"></span>
                            </div>

                            <div class="info-item">
                                <label>نسبة الربح (جملة):</label>
                                <span id="detail-profit-percent-wholesale" class="percent-value"></span>
                            </div>
                        </div>
                    </div>
                </div>
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
    background: #fff3cd;
    padding: 15px;
    border-radius: 4px;
    margin-bottom: 20px;
    border: 1px solid #ffeaa7;
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

.totals-row {
    background: #f8f9fa;
    font-weight: bold;
}

.totals-row td {
    padding: 10px 5px;
    border-top: 2px solid #ffc107;
}

/* حالات الفاتورة */
.status-badge {
    padding: 4px 8px;
    border-radius: 3px;
    font-size: 11px;
    font-weight: bold;
    text-transform: uppercase;
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

/* تفاعلية الصفوف */
.product-row:hover {
    background-color: #f8f9fa !important;
}

.product-row.selected {
    background-color: #e3f2fd !important;
}

/* تفاصيل المنتج */
.info-hint {
    margin-top: 20px;
    padding: 10px;
    background: #e8f4fd;
    border: 1px solid #bee5eb;
    border-radius: 4px;
    text-align: center;
    color: #0c5460;
    font-size: 12px;
}

.info-hint i {
    margin-left: 5px;
    color: #17a2b8;
}

.product-header {
    display: flex;
    align-items: center;
    margin-bottom: 15px;
    padding-bottom: 10px;
    border-bottom: 1px solid #e9ecef;
}

.back-btn {
    background: #f8f9fa;
    border: 1px solid #dee2e6;
    padding: 4px 8px;
    margin-left: 10px;
    border-radius: 3px;
    cursor: pointer;
    font-size: 12px;
    color: #495057;
}

.back-btn:hover {
    background: #e9ecef;
}

.product-header h4 {
    margin: 0;
    font-size: 14px;
    color: #495057;
    flex: 1;
}

.price-section, .quantity-section, .profit-section {
    margin-top: 15px;
    padding: 10px;
    background: #f8f9fa;
    border-radius: 4px;
}

.price-section h5, .quantity-section h5, .profit-section h5 {
    margin: 0 0 10px 0;
    font-size: 12px;
    color: #495057;
    display: flex;
    align-items: center;
    gap: 5px;
}

.info-item.highlight {
    background: #fff3cd;
    padding: 5px;
    border-radius: 3px;
    margin: 5px 0;
}

.info-item.total {
    background: #d4edda;
    padding: 5px;
    border-radius: 3px;
    margin: 5px 0;
    font-weight: bold;
}

.price-value, .quantity-value, .total-value, .profit-value, .percent-value {
    font-family: 'Courier New', monospace;
    font-weight: bold;
}

.price-value {
    color: #007bff;
}

.quantity-value {
    color: #28a745;
}

.total-value {
    color: #155724;
}

.profit-value {
    color: #dc3545; /* أحمر للدلالة على الربح المفقود */
}

.percent-value {
    color: #fd7e14;
}

/* الشريط الجانبي */
.sidebar-content h4 {
    margin: 0 0 20px 0;
    padding-bottom: 10px;
    border-bottom: 1px solid #dee2e6;
    color: #495057;
    font-size: 14px;
}

.info-item {
    display: flex;
    justify-content: space-between;
    margin-bottom: 10px;
    font-size: 12px;
}

.info-item label {
    font-weight: 500;
    color: #495057;
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
    color: #dc3545; /* أحمر للدلالة على المرتجع */
    border-top: 1px solid #dee2e6;
    padding-top: 10px;
    margin-top: 10px;
}

/* الملاحظات */
.notes-section {
    background: #e9ecef;
    padding: 15px;
    border-radius: 4px;
    margin-top: 20px;
    border: 1px solid #dee2e6;
}

.notes-section h4 {
    margin: 0 0 10px 0;
    font-size: 14px;
    color: #495057;
}

.notes-content {
    font-size: 12px;
    color: #6c757d;
    line-height: 1.4;
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
function printInvoice() {
    window.print();
}

function confirmInvoice() {
    if (confirm('هل أنت متأكد من تأكيد فاتورة المرتجع؟ سيتم خصم الكميات من المخزون.')) {
        window.location.href = '{{ route("admin.purchase-return-invoices.confirm", $purchaseReturnInvoice->id) }}';
    }
}

function cancelInvoice() {
    if (confirm('هل أنت متأكد من إلغاء فاتورة المرتجع؟ سيتم إعادة الكميات للمخزون.')) {
        window.location.href = '{{ route("admin.purchase-return-invoices.cancel", $purchaseReturnInvoice->id) }}';
    }
}

// إظهار تفاصيل المنتج
function showProductDetails(product) {
    console.log('Product data:', product); // للتصحيح

    // إخفاء محتوى الفاتورة الافتراضي
    const defaultContent = document.getElementById('default-content');
    const productDetails = document.getElementById('product-details');

    if (defaultContent) defaultContent.style.display = 'none';
    if (productDetails) productDetails.style.display = 'block';

    // تحديث عنوان المنتج
    const productName = document.getElementById('product-name');
    if (productName) {
        productName.textContent = product.product_name || 'غير محدد';
    }

    // تحديث اسم المنتج في التفاصيل
    const detailProductName = document.getElementById('detail-product-name');
    if (detailProductName) {
        detailProductName.textContent = product.product_name || 'غير محدد';
    }

    // تحديث المورد
    const detailSupplierName = document.getElementById('detail-supplier-name');
    if (detailSupplierName) {
        detailSupplierName.textContent = product.supplier_name || 'غير محدد';
    }

    // تحديث الصنف
    const detailCategoryName = document.getElementById('detail-category-name');
    if (detailCategoryName) {
        detailCategoryName.textContent = product.category_name || 'غير محدد';
    }

    // تحديث بيانات الأسعار
    updatePriceInfo(product);

    // تحديث بيانات الكمية
    updateQuantityInfo(product);

    // تحديث بيانات الربح
    updateProfitInfo(product);

    // إضافة تحديد للصف
    document.querySelectorAll('.product-row').forEach(row => {
        row.classList.remove('selected');
    });
    event.target.closest('.product-row').classList.add('selected');
}

// إخفاء تفاصيل المنتج والعودة للعرض الافتراضي
function hideProductDetails() {
    const defaultContent = document.getElementById('default-content');
    const productDetails = document.getElementById('product-details');

    if (defaultContent) defaultContent.style.display = 'block';
    if (productDetails) productDetails.style.display = 'none';

    // إزالة التحديد من جميع الصفوف
    document.querySelectorAll('.product-row').forEach(row => {
        row.classList.remove('selected');
    });
}

// تحديث معلومات الأسعار
function updatePriceInfo(product) {
    const purchasePrice = parseFloat(product.purchase_price) || 0;
    const purchasePriceAfterCost = parseFloat(product.purchase_price_after_cost) || 0;
    const salePrice = parseFloat(product.sale_price) || 0;
    const wholesalePrice = parseFloat(product.wholesale_price) || 0;

    // سعر الشراء
    const purchasePriceElement = document.getElementById('detail-purchase-price');
    if (purchasePriceElement) {
        purchasePriceElement.textContent = purchasePrice.toFixed(2) + ' ريال';
    }

    // سعر الشراء بعد التكلفة
    const purchasePriceAfterCostElement = document.getElementById('detail-purchase-price-after-cost');
    if (purchasePriceAfterCostElement) {
        purchasePriceAfterCostElement.textContent = purchasePriceAfterCost.toFixed(2) + ' ريال';
    }

    // سعر البيع (التجزئة)
    const salePriceElement = document.getElementById('detail-sale-price');
    if (salePriceElement) {
        salePriceElement.textContent = salePrice.toFixed(2) + ' ريال';
    }

    // سعر البيع جملة
    const wholesalePriceElement = document.getElementById('detail-wholesale-price');
    if (wholesalePriceElement) {
        wholesalePriceElement.textContent = wholesalePrice.toFixed(2) + ' ريال';
    }
}

// تحديث معلومات الكمية
function updateQuantityInfo(product) {
    const quantity = parseFloat(product.quantity) || 0;
    const totalPrice = parseFloat(product.total_price) || 0;

    // الكمية المرتجعة
    const quantityElement = document.getElementById('detail-quantity');
    if (quantityElement) {
        quantityElement.textContent = quantity.toString() + ' قطعة';
    }

    // إجمالي المبلغ
    const totalElement = document.getElementById('detail-total');
    if (totalElement) {
        totalElement.textContent = totalPrice.toFixed(2) + ' ريال';
    }
}

// تحديث معلومات الربح المفقود
function updateProfitInfo(product) {
    const quantity = parseFloat(product.quantity) || 0;
    const purchasePrice = parseFloat(product.purchase_price) || 0;
    const salePrice = parseFloat(product.sale_price) || 0;
    const wholesalePrice = parseFloat(product.wholesale_price) || 0;

    // حساب الأرباح المفقودة للتجزئة
    const retailProfitPerUnit = salePrice - purchasePrice;
    const retailProfitPercentage = purchasePrice > 0 ? (retailProfitPerUnit / purchasePrice) * 100 : 0;

    // حساب الأرباح المفقودة للجملة
    const wholesaleProfitPerUnit = wholesalePrice - purchasePrice;
    const wholesaleProfitPercentage = purchasePrice > 0 ? (wholesaleProfitPerUnit / purchasePrice) * 100 : 0;

    // ربح القطعة (تجزئة) - مفقود
    const retailUnitProfitElement = document.getElementById('detail-profit-retail');
    if (retailUnitProfitElement) {
        retailUnitProfitElement.textContent = '-' + retailProfitPerUnit.toFixed(2) + ' ريال';
        retailUnitProfitElement.style.color = '#dc3545'; // أحمر للدلالة على الخسارة
    }

    // نسبة الربح (تجزئة) - مفقود
    const retailProfitPercentElement = document.getElementById('detail-profit-percent-retail');
    if (retailProfitPercentElement) {
        retailProfitPercentElement.textContent = '-' + retailProfitPercentage.toFixed(1) + '%';
        retailProfitPercentElement.style.color = '#dc3545'; // أحمر للدلالة على الخسارة
    }

    // ربح القطعة (جملة) - مفقود
    const wholesaleUnitProfitElement = document.getElementById('detail-profit-wholesale');
    if (wholesaleUnitProfitElement) {
        wholesaleUnitProfitElement.textContent = '-' + wholesaleProfitPerUnit.toFixed(2) + ' ريال';
        wholesaleUnitProfitElement.style.color = '#dc3545'; // أحمر للدلالة على الخسارة
    }

    // نسبة الربح (جملة) - مفقود
    const wholesaleProfitPercentElement = document.getElementById('detail-profit-percent-wholesale');
    if (wholesaleProfitPercentElement) {
        wholesaleProfitPercentElement.textContent = '-' + wholesaleProfitPercentage.toFixed(1) + '%';
        wholesaleProfitPercentElement.style.color = '#dc3545'; // أحمر للدلالة على الخسارة
    }
}
</script>
@endsection
