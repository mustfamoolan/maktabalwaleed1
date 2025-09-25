@extends('layouts.desktop')

@section('title', 'عرض فاتورة الشراء - نظام إدارة المبيعات')

@section('page-title', 'عرض فاتورة الشراء رقم: {{ $purchaseInvoice->invoice_number }}')

@section('toolbar')
    <div class="toolbar-group">
        @if($purchaseInvoice->status === 'draft')
        <button onclick="window.location.href='{{ route('admin.purchase-invoices.edit', $purchaseInvoice->id) }}'" class="win-button primary">
            <i class="fas fa-edit"></i> تعديل الفاتورة
        </button>
        @endif
        <button onclick="printInvoice()" class="win-button">
            <i class="fas fa-print"></i> طباعة
        </button>
        <button onclick="window.location.href='{{ route('admin.purchase-invoices.index') }}'" class="win-button">
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
                        <label class="win-label">رقم الفاتورة</label>
                        <input type="text" value="{{ $purchaseInvoice->invoice_number }}" class="win-input" readonly style="background: #f0f0f0;">
                    </div>
                    <div class="form-group">
                        <label class="win-label">تاريخ الفاتورة</label>
                        <input type="date" value="{{ $purchaseInvoice->invoice_date->format('Y-m-d') }}" class="win-input" readonly style="background: #f0f0f0;">
                    </div>
                    <div class="form-group">
                        <label class="win-label">كروة السائق</label>
                        <input type="number" value="{{ $purchaseInvoice->driver_cost }}" class="win-input cost-input" readonly style="background: #f0f0f0;">
                    </div>
                    <div class="form-group">
                        <label class="win-label">كروة العمال</label>
                        <input type="number" value="{{ $purchaseInvoice->workers_cost }}" class="win-input cost-input" readonly style="background: #f0f0f0;">
                    </div>
                </div>
                <div class="header-row" style="margin-top: 10px;">
                    <div class="form-group">
                        <label class="win-label">الحالة</label>
                        <div style="padding: 8px 0;">
                            @switch($purchaseInvoice->status)
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
                        </div>
                    </div>
                    <div class="form-group">
                        <label class="win-label">تاريخ الإنشاء</label>
                        <input type="text" value="{{ $purchaseInvoice->created_at->format('Y-m-d H:i') }}" class="win-input" readonly style="background: #f0f0f0;">
                    </div>
                    <div class="form-group">
                        <label class="win-label">عدد المنتجات</label>
                        <input type="text" value="{{ $purchaseInvoice->items->count() }} منتج" class="win-input" readonly style="background: #f0f0f0;">
                    </div>
                    <div class="form-group">
                        <label class="win-label">إجمالي الكميات</label>
                        <input type="text" value="{{ $purchaseInvoice->items->sum('quantity') }} قطعة" class="win-input" readonly style="background: #f0f0f0;">
                    </div>
                </div>
            </div>

            <!-- جدول المنتجات -->
            <div class="invoice-items-container">
                <div class="excel-container">
                    <table class="excel-table">
                        <thead>
                            <tr>
                                <th style="width: 5%;">#</th>
                                <th style="width: 20%;">اسم المنتج</th>
                                <th style="width: 12%;">المورد</th>
                                <th style="width: 10%;">الصنف</th>
                                <th style="width: 10%;">سعر الشراء</th>
                                <th style="width: 10%;">سعر الشراء بعد التكلفة</th>
                                <th style="width: 10%;">سعر البيع</th>
                                <th style="width: 10%;">سعر البيع جملة</th>
                                <th style="width: 8%;">العدد</th>
                                <th style="width: 10%;">المجموع</th>
                            </tr>
                        </thead>
                        <tbody>
                            @foreach($purchaseInvoice->items as $index => $item)
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
                                    <input type="number" value="{{ $item->purchase_price }}" class="win-input" style="width: 100%; font-size: 11px; cursor: pointer;" readonly>
                                </td>
                                <td>
                                    <input type="number" value="{{ $item->purchase_price_after_cost }}" class="win-input" style="width: 100%; font-size: 11px; background: #fff3cd; cursor: pointer;" readonly>
                                </td>
                                <td>
                                    <input type="number" value="{{ $item->sale_price }}" class="win-input" style="width: 100%; font-size: 11px; cursor: pointer;" readonly>
                                </td>
                                <td>
                                    <input type="number" value="{{ $item->wholesale_price }}" class="win-input" style="width: 100%; font-size: 11px; cursor: pointer;" readonly>
                                </td>
                                <td>
                                    <input type="number" value="{{ $item->quantity }}" class="win-input" style="width: 100%; font-size: 11px; cursor: pointer;" readonly>
                                </td>
                                <td>
                                    <span style="font-weight: bold; color: #007bff;">{{ number_format($item->purchase_price * $item->quantity, 2) }}</span> د.ع
                                </td>
                            </tr>
                            @endforeach
                        </tbody>
                    </table>
                </div>
            </div>

            <!-- إجماليات الفاتورة -->
            <div class="invoice-totals">
                <div class="totals-container">
                    <div class="total-row">
                        <label>المجموع الفرعي:</label>
                        <span>{{ number_format($purchaseInvoice->total_amount, 2) }}</span> د.ع
                    </div>
                    <div class="total-row">
                        <label>إجمالي التكلفة الإضافية:</label>
                        <span>{{ number_format($purchaseInvoice->driver_cost + $purchaseInvoice->workers_cost, 2) }}</span> د.ع
                    </div>
                    <div class="total-row final-total">
                        <label>المجموع النهائي:</label>
                        <span>{{ number_format($purchaseInvoice->final_total, 2) }}</span> د.ع
                    </div>
                </div>
            </div>

            <!-- الملاحظات -->
            <div class="notes-section">
                <label class="win-label">الملاحظات:</label>
                <textarea class="win-input" rows="3" readonly style="background: #f0f0f0;">{{ $purchaseInvoice->notes }}</textarea>
            </div>
        </div>

        <!-- القسم الجانبي 20% -->
        <div class="invoice-sidebar-section">
            <div class="sidebar-header" id="sidebar-header">
                معلومات الفاتورة
            </div>
            <div class="sidebar-content" id="sidebar-content">
                <!-- المحتوى الافتراضي -->
                <div id="default-info" class="sidebar-info">
                    <div class="info-item">
                        <label>الحالة:</label>
                        <div style="margin-top: 5px;">
                            @switch($purchaseInvoice->status)
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
                        </div>
                    </div>

                    <div class="info-item">
                        <label>عدد المنتجات:</label>
                        <span>{{ $purchaseInvoice->items->count() }} منتج</span>
                    </div>

                    <div class="info-item">
                        <label>إجمالي الكميات:</label>
                        <span>{{ $purchaseInvoice->items->sum('quantity') }} قطعة</span>
                    </div>

                    <div class="info-item">
                        <label>تاريخ الإنشاء:</label>
                        <span>{{ $purchaseInvoice->created_at->format('Y-m-d') }}</span>
                    </div>

                    <div class="info-item">
                        <label>وقت الإنشاء:</label>
                        <span>{{ $purchaseInvoice->created_at->format('H:i') }}</span>
                    </div>

                    @if($purchaseInvoice->creator)
                    <div class="info-item">
                        <label>تم الإنشاء بواسطة:</label>
                        <span>{{ $purchaseInvoice->creator->name }}</span>
                    </div>
                    @endif

                    @if($purchaseInvoice->updated_at != $purchaseInvoice->created_at)
                    <div class="info-item">
                        <label>آخر تحديث:</label>
                        <span>{{ $purchaseInvoice->updated_at->format('Y-m-d H:i') }}</span>
                    </div>
                    @endif

                    <div class="info-hint">
                        <i class="fas fa-info-circle"></i>
                        <span>انقر على أي منتج لعرض تفاصيله</span>
                    </div>
                </div>

                <!-- تفاصيل المنتج -->
                <div id="product-details" class="sidebar-info" style="display: none;">
                    <div class="product-header">
                        <button onclick="hideProductDetails()" class="back-btn" title="العودة">
                            <i class="fas fa-arrow-right"></i>
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
                            <h5><i class="fas fa-boxes"></i> الكمية</h5>
                            <div class="info-item">
                                <label>الكمية المشتراة:</label>
                                <span id="detail-quantity" class="quantity-value"></span>
                            </div>

                            <div class="info-item total">
                                <label>إجمالي المبلغ:</label>
                                <span id="detail-total" class="total-value"></span>
                            </div>
                        </div>

                        <div class="profit-section">
                            <h5><i class="fas fa-chart-line"></i> هامش الربح</h5>
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
    gap: 1px;
    background: #c0c0c0;
}

.invoice-main-section {
    width: 80%;
    background: white;
    overflow-y: auto;
    padding: 15px;
}

.invoice-sidebar-section {
    width: 20%;
    background: white;
    border-left: 1px solid #c0c0c0;
    display: flex;
    flex-direction: column;
}

.sidebar-header {
    background: linear-gradient(to bottom, #f0f0f0, #e0e0e0);
    border-bottom: 1px solid #c0c0c0;
    padding: 8px 12px;
    font-weight: bold;
    font-size: 13px;
    color: #333;
    text-align: center;
}

.sidebar-content {
    flex: 1;
    padding: 15px;
}

.sidebar-info {
    display: flex;
    flex-direction: column;
    gap: 15px;
}

.info-item {
    display: flex;
    flex-direction: column;
    gap: 5px;
}

.info-item label {
    font-weight: bold;
    color: #495057;
    font-size: 12px;
}

.info-item span {
    color: #212529;
    font-size: 13px;
}

/* معلومات الفاتورة */
.invoice-header {
    background: #f8f9fa;
    border: 1px solid #ddd;
    padding: 15px;
    margin-bottom: 20px;
}

.header-row {
    display: grid;
    grid-template-columns: repeat(4, 1fr);
    gap: 15px;
}

/* جدول المنتجات */
.invoice-items-container {
    margin-bottom: 20px;
    min-height: 300px;
}

.invoice-items-container .excel-container {
    max-height: 400px;
    overflow-y: auto;
}

/* الإجماليات */
.invoice-totals {
    background: #f8f9fa;
    border: 1px solid #ddd;
    padding: 15px;
    margin-bottom: 20px;
}

.totals-container {
    max-width: 300px;
    margin-left: auto;
}

.total-row {
    display: flex;
    justify-content: space-between;
    margin-bottom: 8px;
    font-size: 14px;
}

.total-row.final-total {
    border-top: 2px solid #333;
    padding-top: 8px;
    font-weight: bold;
    font-size: 16px;
    color: #007bff;
}

/* ملاحظات */
.notes-section {
    margin-bottom: 20px;
}

/* حالة الفاتورة */
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
    color: #28a745;
}

.percent-value {
    color: #fd7e14;
}



/* طباعة */
@media print {
    .toolbar-section {
        display: none !important;
    }

    .invoice-container {
        padding: 0;
        max-width: none;
    }

    .header-card {
        background: white !important;
        border: 2px solid #000 !important;
    }

    .section-header, .costs-header, .totals-header, .notes-header {
        background: #000 !important;
        color: white !important;
    }
}

/* استجابة */
@media (max-width: 768px) {
    .header-row {
        grid-template-columns: 1fr;
    }

    .totals-section {
        grid-template-columns: 1fr;
    }

    .info-row {
        flex-direction: column;
    }
}

/* طباعة */
@media print {
    .toolbar-section {
        display: none !important;
    }

    .main-split-container {
        height: auto !important;
    }

    .invoice-sidebar-section {
        display: none !important;
    }

    .invoice-main-section {
        width: 100% !important;
    }

    .invoice-header {
        background: white !important;
        border: 2px solid #000 !important;
    }
}

/* استجابة */
@media (max-width: 768px) {
    .main-split-container {
        flex-direction: column;
        height: auto;
    }

    .invoice-main-section, .invoice-sidebar-section {
        width: 100%;
    }

    .header-row {
        grid-template-columns: 1fr;
    }
}
</style>
@endsection

@section('scripts')
<script>
function printInvoice() {
    window.print();
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
    }    // تحديث بيانات الأسعار
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
}// تحديث معلومات الكمية
function updateQuantityInfo(product) {
    const quantity = parseFloat(product.quantity) || 0;
    const totalPrice = parseFloat(product.total_price) || 0;

    // الكمية المشتراة
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

// تحديث معلومات الربح
function updateProfitInfo(product) {
    const quantity = parseFloat(product.quantity) || 0;
    const purchasePrice = parseFloat(product.purchase_price) || 0;
    const salePrice = parseFloat(product.sale_price) || 0;
    const wholesalePrice = parseFloat(product.wholesale_price) || 0;

    // حساب الأرباح للتجزئة
    const retailProfitPerUnit = salePrice - purchasePrice;
    const retailTotalProfit = retailProfitPerUnit * quantity;
    const retailProfitPercentage = purchasePrice > 0 ? (retailProfitPerUnit / purchasePrice) * 100 : 0;

    // حساب الأرباح للجملة
    const wholesaleProfitPerUnit = wholesalePrice - purchasePrice;
    const wholesaleTotalProfit = wholesaleProfitPerUnit * quantity;
    const wholesaleProfitPercentage = purchasePrice > 0 ? (wholesaleProfitPerUnit / purchasePrice) * 100 : 0;

    // ربح القطعة (تجزئة)
    const retailUnitProfitElement = document.getElementById('detail-profit-retail');
    if (retailUnitProfitElement) {
        retailUnitProfitElement.textContent = retailProfitPerUnit.toFixed(2) + ' ريال';
        retailUnitProfitElement.style.color = retailProfitPerUnit >= 0 ? '#28a745' : '#dc3545';
    }

    // نسبة الربح (تجزئة)
    const retailProfitPercentElement = document.getElementById('detail-profit-percent-retail');
    if (retailProfitPercentElement) {
        retailProfitPercentElement.textContent = retailProfitPercentage.toFixed(1) + '%';
        retailProfitPercentElement.style.color = retailProfitPercentage >= 0 ? '#28a745' : '#dc3545';
    }

    // ربح القطعة (جملة)
    const wholesaleUnitProfitElement = document.getElementById('detail-profit-wholesale');
    if (wholesaleUnitProfitElement) {
        wholesaleUnitProfitElement.textContent = wholesaleProfitPerUnit.toFixed(2) + ' ريال';
        wholesaleUnitProfitElement.style.color = wholesaleProfitPerUnit >= 0 ? '#28a745' : '#dc3545';
    }

    // نسبة الربح (جملة)
    const wholesaleProfitPercentElement = document.getElementById('detail-profit-percent-wholesale');
    if (wholesaleProfitPercentElement) {
        wholesaleProfitPercentElement.textContent = wholesaleProfitPercentage.toFixed(1) + '%';
        wholesaleProfitPercentElement.style.color = wholesaleProfitPercentage >= 0 ? '#28a745' : '#dc3545';
    }
}
</script>
@endsection
