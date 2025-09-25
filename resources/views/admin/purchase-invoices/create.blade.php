@extends('layouts.desktop')

@section('title', 'فاتورة شراء جديدة - نظام إدارة المبيعات')

@section('page-title', 'فاتورة شراء جديدة')

@section('toolbar')
    <div class="toolbar-group">
        <button onclick="saveInvoice()" class="win-button primary">
            <i class="fas fa-save"></i> حفظ الفاتورة
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
            <form id="invoiceForm" action="{{ route('admin.purchase-invoices.store') }}" method="POST">
                @csrf

                <!-- معلومات أساسية للفاتورة -->
                <div class="invoice-header">
                    <div class="header-row">
                        <div class="form-group">
                            <label class="win-label">رقم الفاتورة</label>
                            <input type="text" name="invoice_number" value="{{ $invoiceNumber }}" class="win-input" readonly style="background: #f0f0f0;">
                        </div>
                        <div class="form-group">
                            <label class="win-label">تاريخ الفاتورة *</label>
                            <input type="date" name="invoice_date" value="{{ date('Y-m-d') }}" class="win-input" required>
                        </div>
                        <div class="form-group">
                            <label class="win-label">المورد *</label>
                            <select name="supplier_id" id="supplier_id" class="win-input" required>
                                <option value="">اختر المورد</option>
                                @foreach($suppliers as $supplier)
                                    <option value="{{ $supplier->id }}">{{ $supplier->name }}</option>
                                @endforeach
                            </select>
                        </div>
                        <div class="form-group">
                            <!-- فراغ لتنسيق الشبكة -->
                        </div>
                    </div>
                    <div class="header-row" style="margin-top: 10px;">
                        <div class="form-group">
                            <label class="win-label">كروة السائق</label>
                            <input type="number" name="driver_cost" id="driver_cost" class="win-input cost-input" step="0.01" min="0" value="0">
                        </div>
                        <div class="form-group">
                            <label class="win-label">كروة العمال</label>
                            <input type="number" name="workers_cost" id="workers_cost" class="win-input cost-input" step="0.01" min="0" value="0">
                        </div>
                        <div class="form-group">
                            <!-- فراغ لتنسيق الشبكة -->
                        </div>
                        <div class="form-group">
                            <!-- فراغ لتنسيق الشبكة -->
                        </div>
                    </div>
                </div>

                <!-- البحث عن المنتجات -->
                <div class="product-search-section">
                    <div class="supplier-notice" id="supplierNotice" style="padding: 10px; background: #fff3cd; border: 1px solid #ffeaa7; margin-bottom: 10px; text-align: center; color: #856404;">
                        <i class="fas fa-info-circle"></i> يرجى اختيار المورد أولاً للبحث عن منتجاته
                    </div>
                    <div class="search-container">
                        <input type="text" id="productSearch" placeholder="ابحث عن المنتج (اسم أو كود)" class="win-input" style="width: 100%;" disabled>
                    </div>
                    <div id="searchResults" class="search-results"></div>
                </div>

                <!-- جدول المنتجات -->
                <div class="invoice-items-container">
                    <div class="excel-container">
                        <table class="excel-table" id="invoiceItemsTable">
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
                                    <th style="width: 5%;">إجراء</th>
                                </tr>
                            </thead>
                            <tbody id="invoiceItemsBody">
                                <!-- المنتجات ستضاف هنا ديناميكياً -->
                            </tbody>
                        </table>
                    </div>
                </div>

                <!-- إجماليات الفاتورة -->
                <div class="invoice-totals">
                    <div class="totals-container">
                        <div class="total-row">
                            <label>المجموع الفرعي:</label>
                            <span id="subtotal">0.00</span> د.ع
                        </div>
                        <div class="total-row">
                            <label>إجمالي التكلفة الإضافية:</label>
                            <span id="totalCost">0.00</span> د.ع
                        </div>
                        <div class="total-row final-total">
                            <label>المجموع النهائي:</label>
                            <span id="finalTotal">0.00</span> د.ع
                        </div>
                    </div>
                </div>

                <!-- ملاحظات -->
                <div class="notes-section">
                    <label class="win-label">ملاحظات:</label>
                    <textarea name="notes" class="win-input" rows="3" placeholder="أدخل أي ملاحظات إضافية..."></textarea>
                </div>
            </form>
        </div>

        <!-- القسم الجانبي 20% (فارغ حالياً) -->
        <div class="invoice-sidebar-section">
            <div class="sidebar-header">
                معاينة سريعة
            </div>
            <div class="sidebar-content">
                <div class="sidebar-placeholder">
                    سيتم تطوير هذا القسم لاحقاً
                </div>
            </div>
        </div>
    </div>

    <!-- Modal لإضافة منتج جديد للمخزن -->
    <div id="createProductModal" class="modal" style="display: none;">
        <div class="modal-content" style="max-width: 800px;">
            <div class="modal-header">
                <h3>إضافة منتج جديد للمخزن</h3>
                <button class="modal-close" onclick="closeProductCreationModal()">&times;</button>
            </div>
            <div class="modal-body">
                <form id="createProductForm" action="{{ route('admin.products.store') }}" method="POST" enctype="multipart/form-data">
                    @csrf
                    <div style="display: grid; grid-template-columns: 1fr 1fr; gap: 16px;">
                        <div class="form-group">
                            <label for="create_name" class="win-label">اسم المادة *</label>
                            <input type="text" id="create_name" name="name" class="win-input" placeholder="أدخل اسم المادة" required>
                            <div id="create_name_error" class="error-message"></div>
                        </div>
                        <div class="form-group">
                            <label for="create_code" class="win-label">كود المادة *</label>
                            <div style="display: flex; gap: 8px; align-items: center;">
                                <input type="text" id="create_code" name="code" class="win-input" placeholder="أدخل كود المادة" required style="flex: 1;">
                                <button type="button" onclick="generateBarcode('create')" class="win-button" style="padding: 6px 10px; font-size: 11px;" title="توليد كود تلقائي">
                                    <i class="fas fa-magic"></i>
                                </button>
                            </div>
                            <div id="create_barcode_preview" style="margin-top: 8px; text-align: center;"></div>
                            <div id="create_code_error" class="error-message"></div>
                        </div>
                        <div class="form-group">
                            <label for="create_image" class="win-label">صورة المادة</label>
                            <input type="file" id="create_image" name="image" class="win-input" accept="image/*">
                            <div id="create_image_error" class="error-message"></div>
                        </div>
                        <div class="form-group">
                            <label for="create_stock_quantity" class="win-label">العدد المتوفر *</label>
                            <input type="number" id="create_stock_quantity" name="stock_quantity" class="win-input" min="0" required>
                            <div id="create_stock_quantity_error" class="error-message"></div>
                        </div>
                        <div class="form-group">
                            <label for="create_pieces_per_carton" class="win-label">قطع/كارتون *</label>
                            <input type="number" id="create_pieces_per_carton" name="pieces_per_carton" class="win-input" min="1" required>
                            <div id="create_pieces_per_carton_error" class="error-message"></div>
                        </div>
                        <div class="form-group">
                            <label for="create_piece_weight" class="win-label">وزن القطعة (جرام) *</label>
                            <input type="number" id="create_piece_weight" name="piece_weight" class="win-input" step="0.01" min="0" required>
                            <div id="create_piece_weight_error" class="error-message"></div>
                        </div>
                        <div class="form-group">
                            <label for="create_carton_weight" class="win-label">وزن الكارتون (كغ) - تلقائي</label>
                            <input type="number" id="create_carton_weight" name="carton_weight" class="win-input" step="0.001" min="0" required readonly style="background-color: #f8f9fa;">
                            <div id="create_carton_weight_error" class="error-message"></div>
                            <small style="color: #666; font-size: 11px;">يتم حساب وزن الكارتون تلقائياً من (وزن القطعة × عدد القطع ÷ 1000)</small>
                        </div>
                        <div class="form-group">
                            <label for="create_supplier_id" class="win-label">المورد *</label>
                            <select id="create_supplier_id" name="supplier_id" class="win-input" required>
                                <option value="">اختر المورد</option>
                                @foreach($suppliers as $supplier)
                                <option value="{{ $supplier->id }}">{{ $supplier->name }}</option>
                                @endforeach
                            </select>
                            <div id="create_supplier_id_error" class="error-message"></div>
                        </div>
                        <div class="form-group">
                            <label for="create_category_id" class="win-label">الفئة *</label>
                            <select id="create_category_id" name="category_id" class="win-input" required>
                                <option value="">اختر الفئة</option>
                                @foreach($categories as $category)
                                <option value="{{ $category->id }}">{{ $category->name }}</option>
                                @endforeach
                            </select>
                            <div id="create_category_id_error" class="error-message"></div>
                        </div>
                        <div class="form-group">
                            <label for="create_purchase_price" class="win-label">سعر الشراء *</label>
                            <input type="number" id="create_purchase_price" name="purchase_price" class="win-input" step="0.01" min="0" required>
                            <div id="create_purchase_price_error" class="error-message"></div>
                        </div>
                        <div class="form-group">
                            <label for="create_sale_price" class="win-label">سعر البيع *</label>
                            <input type="number" id="create_sale_price" name="sale_price" class="win-input" step="0.01" min="0" required>
                            <div id="create_sale_price_error" class="error-message"></div>
                        </div>
                        <div class="form-group">
                            <label for="create_wholesale_price" class="win-label">سعر البيع جملة</label>
                            <input type="number" id="create_wholesale_price" name="wholesale_price" class="win-input" step="0.01" min="0">
                            <div id="create_wholesale_price_error" class="error-message"></div>
                        </div>
                    </div>
                </form>
            </div>
            <div class="modal-footer">
                <button type="button" class="win-button primary" onclick="saveNewProductAndAddToInvoice()">حفظ وإضافة للفاتورة</button>
                <button type="button" class="win-button" onclick="closeProductCreationModal()">إلغاء</button>
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

.sidebar-placeholder {
    text-align: center;
    color: #999;
    font-style: italic;
    margin-top: 50px;
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

/* البحث */
.product-search-section {
    margin-bottom: 20px;
}

.search-container {
    display: flex;
    align-items: center;
    margin-bottom: 10px;
}

.search-results {
    max-height: 200px;
    overflow-y: auto;
    border: 1px solid #ddd;
    background: white;
    display: none;
}

.search-result-item {
    padding: 10px;
    border-bottom: 1px solid #eee;
    cursor: pointer;
    display: flex;
    justify-content: space-between;
}

.search-result-item:hover {
    background: #f5f5f5;
}

.search-result-item.no-results {
    background: #f8f9fa;
    cursor: default;
}

.search-result-item.no-results:hover {
    background: #f8f9fa;
}

.search-result-item.add-new-product {
    background: #f0fff0;
    border: 2px dashed #28a745;
    cursor: pointer;
}

.search-result-item.add-new-product:hover {
    background: #e6ffe6;
    border-color: #1e7e34;
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

/* النموذج المنبثق */
.modal {
    display: none;
    position: fixed;
    z-index: 1000;
    left: 0;
    top: 0;
    width: 100%;
    height: 100%;
    background-color: rgba(0,0,0,0.5);
    overflow: auto;
}

.modal-content {
    background-color: #fefefe;
    margin: 2% auto;
    padding: 0;
    border: 2px solid #c0c0c0;
    width: 90%;
    max-width: 800px;
    max-height: 90vh;
    overflow-y: auto;
    box-shadow: 0 4px 8px rgba(0,0,0,0.2);
    border-radius: 0;
}

.modal-header {
    background: linear-gradient(to bottom, #0078d4, #106ebe);
    color: white;
    padding: 12px 20px;
    display: flex;
    justify-content: space-between;
    align-items: center;
    border-bottom: 1px solid #c0c0c0;
}

.modal-header h3 {
    margin: 0;
    font-size: 16px;
    font-weight: bold;
}

.modal-close {
    background: none;
    border: none;
    color: white;
    font-size: 24px;
    font-weight: bold;
    cursor: pointer;
    padding: 0;
    width: 30px;
    height: 30px;
    display: flex;
    align-items: center;
    justify-content: center;
}

.modal-close:hover {
    background: rgba(255,255,255,0.2);
}

.modal-body {
    padding: 20px;
    max-height: 60vh;
    overflow-y: auto;
}

.modal-footer {
    background: #f8f9fa;
    padding: 15px 20px;
    border-top: 1px solid #c0c0c0;
    display: flex;
    justify-content: flex-end;
    gap: 10px;
}

.form-grid {
    display: grid;
    grid-template-columns: repeat(2, 1fr);
    gap: 15px;
}

/* تحسينات إضافية */
.cost-input {
    background: #fff3cd !important;
}

.btn-remove-item {
    background: #dc3545;
    color: white;
    border: none;
    padding: 4px 8px;
    border-radius: 3px;
    cursor: pointer;
    font-size: 11px;
}

.btn-remove-item:hover {
    background: #c82333;
}

.empty-invoice {
    text-align: center;
    color: #999;
    font-style: italic;
    padding: 50px;
}

.error-message {
    display: none;
    color: #dc3545;
    font-size: 11px;
    margin-top: 4px;
    font-weight: bold;
}
</style>
@endsection

@section('scripts')
<script>
let invoiceItems = [];
let itemCounter = 0;
let selectedSupplierId = null;

// معالج تغيير المورد
document.getElementById('supplier_id').addEventListener('change', function() {
    selectedSupplierId = this.value;
    const productSearch = document.getElementById('productSearch');
    const supplierNotice = document.getElementById('supplierNotice');
    const searchResults = document.getElementById('searchResults');

    if (selectedSupplierId) {
        productSearch.disabled = false;
        productSearch.placeholder = 'ابحث عن منتجات هذا المورد (اسم أو كود)';
        supplierNotice.style.display = 'none';

        // تنظيف البحث والنتائج
        productSearch.value = '';
        searchResults.style.display = 'none';

        // تنظيف المنتجات المضافة من موردين آخرين (إذا وُجدت)
        invoiceItems = [];
        renderInvoiceItems();
        calculateTotals();
    } else {
        productSearch.disabled = true;
        productSearch.placeholder = 'ابحث عن المنتج (اسم أو كود)';
        supplierNotice.style.display = 'block';
        searchResults.style.display = 'none';

        // تنظيف كل شيء
        productSearch.value = '';
        invoiceItems = [];
        renderInvoiceItems();
        calculateTotals();
    }
});

// البحث عن المنتجات
document.getElementById('productSearch').addEventListener('input', function() {
    const search = this.value.trim();
    const resultsDiv = document.getElementById('searchResults');

    if (!selectedSupplierId) {
        alert('يرجى اختيار المورد أولاً');
        this.value = '';
        return;
    }

    if (search.length < 2) {
        resultsDiv.style.display = 'none';
        return;
    }

    fetch(`{{ route('admin.purchase-invoices.search-products') }}?search=${encodeURIComponent(search)}&supplier_id=${selectedSupplierId}`)
        .then(response => response.json())
        .then(products => {
            if (products.length > 0) {
                resultsDiv.innerHTML = products.map(product => `
                    <div class="search-result-item" onclick="addProductToInvoice(${JSON.stringify(product).replace(/"/g, '&quot;')})">
                        <div>
                            <strong>${product.name}</strong><br>
                            <small>كود: ${product.code} | مورد: ${product.supplier_name} | متوفر: ${product.stock_quantity}</small>
                        </div>
                        <div style="text-align: left;">
                            <small>شراء: ${Number(product.current_purchase_price).toLocaleString()}</small><br>
                            <small>بيع: ${Number(product.current_sale_price).toLocaleString()}</small>
                        </div>
                    </div>
                `).join('');
                resultsDiv.style.display = 'block';
            } else {
                resultsDiv.innerHTML = `
                    <div class="search-result-item no-results">
                        <div style="text-align: center; color: #666;">
                            <i class="fas fa-search" style="font-size: 18px; margin-bottom: 8px;"></i><br>
                            لم يتم العثور على منتج بالاسم: <strong>"${search}"</strong>
                        </div>
                    </div>
                    <div class="search-result-item add-new-product" onclick="openProductCreationModal('${search}')">
                        <div style="text-align: center; color: #28a745;">
                            <i class="fas fa-plus-circle" style="font-size: 18px; margin-bottom: 5px;"></i><br>
                            <strong>إضافة منتج جديد: "${search}"</strong>
                            <small style="display: block; margin-top: 4px;">انقر لإضافة هذا المنتج للمخزن</small>
                        </div>
                    </div>
                `;
                resultsDiv.style.display = 'block';
            }
        })
        .catch(error => {
            console.error('Error searching products:', error);
        });
});

// إضافة منتج موجود للفاتورة
function addProductToInvoice(product) {
    const item = {
        id: itemCounter++,
        product_id: product.id,
        product_name: product.name,
        supplier_name: product.supplier_name,
        category_name: product.category_name,
        purchase_price: product.current_purchase_price,
        purchase_price_after_cost: product.current_purchase_price,
        sale_price: product.current_sale_price,
        wholesale_price: product.current_sale_price * 0.9, // افتراض أن سعر الجملة 90% من سعر البيع
        quantity: 1
    };

    invoiceItems.push(item);
    renderInvoiceItems();
    calculateTotals();

    // إخفاء نتائج البحث وتنظيف حقل البحث
    document.getElementById('searchResults').style.display = 'none';
    document.getElementById('productSearch').value = '';
}

// فتح نافذة إنشاء منتج جديد من البحث
function openProductCreationModal(searchTerm = '') {
    document.getElementById('createProductModal').style.display = 'block';
    document.getElementById('create_name').value = searchTerm;

    // إخفاء نتائج البحث
    document.getElementById('searchResults').style.display = 'none';
    document.getElementById('productSearch').value = '';

    // تنظيف رسائل الخطأ
    clearFormErrors();

    // حساب وزن الكارتون عند تغيير القيم
    document.getElementById('create_piece_weight').addEventListener('input', calculateNewProductCartonWeight);
    document.getElementById('create_pieces_per_carton').addEventListener('input', calculateNewProductCartonWeight);
}

function closeProductCreationModal() {
    document.getElementById('createProductModal').style.display = 'none';
    // تنظيف النموذج
    document.getElementById('createProductForm').reset();
    // تنظيف رسائل الخطأ
    clearFormErrors();
}

function clearFormErrors() {
    const errorDivs = document.querySelectorAll('[id$="_error"]');
    errorDivs.forEach(div => {
        div.textContent = '';
        div.style.display = 'none';
    });
}

// حفظ المنتج الجديد وإضافته للفاتورة
function saveNewProductAndAddToInvoice() {
    const form = document.getElementById('createProductForm');

    // التحقق من الحقول المطلوبة
    const requiredFields = [
        'name', 'code', 'stock_quantity', 'pieces_per_carton',
        'piece_weight', 'carton_weight', 'supplier_id', 'category_id',
        'purchase_price', 'sale_price'
    ];

    let hasErrors = false;
    let errorMessage = 'يرجى ملء الحقول المطلوبة:\n';

    requiredFields.forEach(field => {
        const input = document.getElementById(`create_${field}`);
        if (!input || !input.value.trim()) {
            hasErrors = true;
            errorMessage += `- ${getFieldLabel(field)}\n`;
        }
    });

    if (hasErrors) {
        alert(errorMessage);
        return;
    }

    const formData = new FormData(form);

    // إرسال البيانات لحفظ المنتج
    fetch('{{ route("admin.products.store") }}', {
        method: 'POST',
        body: formData,
        headers: {
            'X-CSRF-TOKEN': document.querySelector('meta[name="csrf-token"]').getAttribute('content'),
            'X-Requested-With': 'XMLHttpRequest'
        }
    })
    .then(response => {
        // التحقق من نوع المحتوى
        const contentType = response.headers.get('content-type');
        if (contentType && contentType.includes('application/json')) {
            return response.json();
        } else {
            // إذا كان الرد HTML (صفحة خطأ)، عرض رسالة خطأ عامة
            throw new Error('تم إرجاع صفحة HTML بدلاً من JSON - يرجى التحقق من البيانات المدخلة');
        }
    })
    .then(data => {
        if (data.success) {
            // إضافة المنتج الجديد للفاتورة
            const item = {
                id: itemCounter++,
                product_id: data.product.id,
                product_name: data.product.name,
                supplier_name: data.product.supplier_name,
                category_name: data.product.category_name,
                purchase_price: data.product.purchase_price,
                purchase_price_after_cost: data.product.purchase_price,
                sale_price: data.product.sale_price,
                wholesale_price: data.product.wholesale_price || data.product.sale_price,
                quantity: 1
            };

            invoiceItems.push(item);
            renderInvoiceItems();
            calculateTotals();
            closeProductCreationModal();

            alert('تم إضافة المنتج للمخزن والفاتورة بنجاح!');
        } else {
            // عرض أخطاء التحقق إن وجدت
            if (data.errors) {
                // عرض الأخطاء في الحقول المناسبة
                Object.keys(data.errors).forEach(field => {
                    const errorDiv = document.getElementById(`create_${field}_error`);
                    if (errorDiv) {
                        errorDiv.textContent = data.errors[field].join(', ');
                        errorDiv.style.display = 'block';
                    }
                });

                // عرض رسالة عامة أيضاً
                let errorMessage = 'يرجى تصحيح الأخطاء التالية:\n';
                Object.keys(data.errors).forEach(field => {
                    errorMessage += `- ${getFieldLabel(field)}: ${data.errors[field].join(', ')}\n`;
                });
                alert(errorMessage);
            } else {
                alert('حدث خطأ أثناء حفظ المنتج: ' + (data.message || 'خطأ غير معروف'));
            }
        }
    })
    .catch(error => {
        console.error('Error:', error);
        alert('حدث خطأ أثناء حفظ المنتج: ' + error.message);
    });
}

// إضافة منتج سريع للفاتورة فقط - تم حذف هذه الوظيفة واستبدالها بالبحث المتقدم

// الحصول على تسمية الحقل بالعربية
function getFieldLabel(field) {
    const labels = {
        'name': 'اسم المادة',
        'code': 'كود المادة',
        'stock_quantity': 'العدد المتوفر',
        'pieces_per_carton': 'قطع/كارتون',
        'piece_weight': 'وزن القطعة',
        'carton_weight': 'وزن الكارتون',
        'supplier_id': 'المورد',
        'category_id': 'الفئة',
        'purchase_price': 'سعر الشراء',
        'sale_price': 'سعر البيع'
    };
    return labels[field] || field;
}

// حساب وزن الكارتون للمنتج الجديد
function calculateNewProductCartonWeight() {
    const pieceWeight = parseFloat(document.getElementById('create_piece_weight').value) || 0;
    const piecesPerCarton = parseFloat(document.getElementById('create_pieces_per_carton').value) || 0;
    const cartonWeight = (pieceWeight * piecesPerCarton) / 1000;
    document.getElementById('create_carton_weight').value = cartonWeight.toFixed(3);
}

// توليد باركود تلقائي
function generateBarcode(prefix) {
    const timestamp = Date.now();
    const randomNum = Math.floor(Math.random() * 1000);
    const barcode = `${timestamp}${randomNum}`.slice(-10);
    document.getElementById(`${prefix}_code`).value = barcode;
}

// عرض المنتجات في الجدول
function renderInvoiceItems() {
    const tbody = document.getElementById('invoiceItemsBody');

    if (invoiceItems.length === 0) {
        tbody.innerHTML = '<tr><td colspan="11" class="empty-invoice">لم يتم إضافة أي منتجات بعد</td></tr>';
        return;
    }

    tbody.innerHTML = invoiceItems.map((item, index) => `
        <tr>
            <td>${index + 1}</td>
            <td>
                <input type="text" name="items[${index}][product_name]" value="${item.product_name}" class="win-input" style="width: 100%; font-size: 11px;" readonly>
                <input type="hidden" name="items[${index}][product_id]" value="${item.product_id || ''}">
            </td>
            <td>
                <input type="text" name="items[${index}][supplier_name]" value="${item.supplier_name}" class="win-input" style="width: 100%; font-size: 11px;">
            </td>
            <td>
                <input type="text" name="items[${index}][category_name]" value="${item.category_name}" class="win-input" style="width: 100%; font-size: 11px;">
            </td>
            <td>
                <input type="number" name="items[${index}][purchase_price]" value="${item.purchase_price}" class="win-input item-price" style="width: 100%; font-size: 11px;" step="0.01" min="0" onchange="updateItemCalculations(${index})">
            </td>
            <td>
                <input type="number" name="items[${index}][purchase_price_after_cost]" value="${item.purchase_price_after_cost}" class="win-input" style="width: 100%; font-size: 11px; background: #f0f0f0;" readonly>
            </td>
            <td>
                <input type="number" name="items[${index}][sale_price]" value="${item.sale_price}" class="win-input" style="width: 100%; font-size: 11px;" step="0.01" min="0">
            </td>
            <td>
                <input type="number" name="items[${index}][wholesale_price]" value="${item.wholesale_price}" class="win-input" style="width: 100%; font-size: 11px;" step="0.01" min="0">
            </td>
            <td>
                <input type="number" name="items[${index}][quantity]" value="${item.quantity}" class="win-input item-quantity" style="width: 100%; font-size: 11px;" min="1" onchange="updateItemCalculations(${index})">
            </td>
            <td>
                <span class="item-total">${(item.purchase_price * item.quantity).toLocaleString()}</span> د.ع
            </td>
            <td>
                <button type="button" class="btn-remove-item" onclick="removeItem(${item.id})">
                    <i class="fas fa-trash"></i>
                </button>
            </td>
        </tr>
    `).join('');
}

// تحديث حسابات المنتج
function updateItemCalculations(index) {
    const priceInput = document.querySelector(`input[name="items[${index}][purchase_price]"]`);
    const quantityInput = document.querySelector(`input[name="items[${index}][quantity]"]`);
    const totalSpan = document.querySelectorAll('.item-total')[index];

    const price = parseFloat(priceInput.value) || 0;
    const quantity = parseInt(quantityInput.value) || 1;
    const total = price * quantity;

    totalSpan.textContent = total.toLocaleString();

    // تحديث البيانات في المصفوفة
    invoiceItems[index].purchase_price = price;
    invoiceItems[index].quantity = quantity;

    calculateTotals();
}

// حذف منتج من الفاتورة
function removeItem(itemId) {
    invoiceItems = invoiceItems.filter(item => item.id !== itemId);
    renderInvoiceItems();
    calculateTotals();
}

// حساب الإجماليات
function calculateTotals() {
    const subtotal = invoiceItems.reduce((sum, item) => sum + (item.purchase_price * item.quantity), 0);
    const driverCost = parseFloat(document.getElementById('driver_cost').value) || 0;
    const workersCost = parseFloat(document.getElementById('workers_cost').value) || 0;
    const totalCost = driverCost + workersCost;
    const finalTotal = subtotal + totalCost;

    document.getElementById('subtotal').textContent = subtotal.toLocaleString();
    document.getElementById('totalCost').textContent = totalCost.toLocaleString();
    document.getElementById('finalTotal').textContent = finalTotal.toLocaleString();

    // تحديث سعر الشراء بعد التكلفة لكل منتج
    if (subtotal > 0 && totalCost > 0) {
        invoiceItems.forEach((item, index) => {
            const itemTotal = item.purchase_price * item.quantity;
            const itemRatio = itemTotal / subtotal;
            const allocatedCost = totalCost * itemRatio;
            const costPerUnit = allocatedCost / item.quantity;
            const priceAfterCost = item.purchase_price + costPerUnit;

            item.purchase_price_after_cost = priceAfterCost;

            // تحديث القيمة في الحقل
            const input = document.querySelector(`input[name="items[${index}][purchase_price_after_cost]"]`);
            if (input) {
                input.value = priceAfterCost.toFixed(2);
            }
        });
    }
}

// حفظ الفاتورة
function saveInvoice() {
    if (!selectedSupplierId) {
        alert('يجب اختيار المورد أولاً');
        return;
    }

    if (invoiceItems.length === 0) {
        alert('يجب إضافة منتج واحد على الأقل');
        return;
    }

    document.getElementById('invoiceForm').submit();
}

// مراقبة تغيير التكلفة
document.getElementById('driver_cost').addEventListener('input', calculateTotals);
document.getElementById('workers_cost').addEventListener('input', calculateTotals);

// إخفاء نتائج البحث عند النقر خارجها
document.addEventListener('click', function(e) {
    if (!e.target.closest('.product-search-section')) {
        document.getElementById('searchResults').style.display = 'none';
    }
});

// إغلاق النوافذ المنبثقة عند الضغط خارجها
document.addEventListener('click', function(e) {
    if (e.target.classList.contains('modal')) {
        e.target.style.display = 'none';
    }
});

// تحديث الإجماليات عند تحميل الصفحة
document.addEventListener('DOMContentLoaded', function() {
    calculateTotals();
});
</script>
@endsection
