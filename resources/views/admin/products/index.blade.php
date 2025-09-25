@extends('layouts.desktop')

@section('title', 'المخزن - نظام إدارة المبيعات')

@section('page-title', 'المخزن')

@section('toolbar')
    <div class="toolbar-group">
        <button class="toolbar-btn" title="إضافة" onclick="openCreateModal()">
            <i class="fas fa-plus"></i>
        </button>
        <button class="toolbar-btn" title="تعديل" onclick="editSelected()">
            <i class="fas fa-edit"></i>
        </button>
        <button class="toolbar-btn" title="حذف" onclick="deleteSelected()">
            <i class="fas fa-trash"></i>
        </button>
    </div>

    <div class="toolbar-separator"></div>

    <div class="toolbar-group">
        <div class="search-container">
            <input type="text" id="searchInput" placeholder="بحث في المخزن..."
                   value="{{ request('search') }}" oninput="liveSearch()" class="win-input"
                   style="width: 250px; height: 24px; font-size: 12px;">
            <button id="clearBtn" onclick="clearSearch()" class="clear-btn"
                    style="display: {{ request('search') ? 'inline-block' : 'none' }};">&times;</button>
        </div>
    </div>
@endsection

@section('content')
    <div class="main-split-container">
        <!-- قسم قائمة المنتجات (80%) -->
        <div class="products-list-section">
            <div class="excel-container">
                <table class="excel-table">
                    <thead>
                        <tr>
                            <th style="width: 40px;">
                                <input type="checkbox" id="selectAll" onchange="toggleAll(this)">
                            </th>
                            <th style="width: 60px;">الصورة</th>
                            <th>اسم المادة</th>
                            <th style="width: 120px;">كود المادة</th>
                            <th style="width: 100px;">الباركود</th>
                            <th style="width: 80px;">المتوفر</th>
                            <th style="width: 100px;">قطع/كارتون</th>
                            <th style="width: 90px;">وزن القطعة</th>
                            <th style="width: 100px;">وزن الكارتون</th>
                            <th style="width: 120px;">المورد</th>
                            <th style="width: 100px;">الفئة</th>
                            <th style="width: 100px;">سعر الشراء</th>
                            <th style="width: 100px;">سعر البيع</th>
                            <th style="width: 100px;">آخر شراء</th>
                            <th style="width: 100px;">آخر بيع</th>
                            <th style="width: 120px;">العمليات</th>
                        </tr>
                    </thead>
                    <tbody>
                    @forelse($products as $product)
                    <tr onclick="showProductDetails({{ $product->id }})" data-product-id="{{ $product->id }}" class="product-row">
                        <td onclick="event.stopPropagation();">
                            <input type="checkbox" name="selected_products[]" value="{{ $product->id }}" onchange="updateSelection()">
                        </td>
                        <td style="text-align: center; padding: 4px;">
                            @if($product->image)
                                <img src="{{ asset('storage/' . $product->image) }}"
                                     alt="{{ $product->name }}"
                                     style="width: 40px; height: 40px; object-fit: cover; border: 1px solid #ddd;">
                            @else
                                <img src="{{ asset('images/default-product.svg') }}"
                                     alt="لا توجد صورة"
                                     style="width: 40px; height: 40px; object-fit: cover; border: 1px solid #ddd;">
                            @endif
                        </td>
                        <td>{{ $product->name }}</td>
                        <td>{{ $product->code }}</td>
                        <td style="text-align: center;">
                            <canvas id="barcode_{{ $product->id }}" data-code="{{ $product->code }}" style="max-width: 80px; height: 30px;"></canvas>
                        </td>
                        <td style="text-align: center;">{{ number_format($product->stock_quantity) }}</td>
                        <td style="text-align: center;">{{ number_format($product->pieces_per_carton) }}</td>
                        <td style="text-align: center;">{{ number_format($product->piece_weight, 2) }} جم</td>
                        <td style="text-align: center;">{{ number_format($product->carton_weight, 3) }} كغ</td>
                        <td>{{ $product->supplier->name ?? 'غير محدد' }}</td>
                        <td>{{ $product->category->name ?? 'غير محدد' }}</td>
                        <td style="text-align: right;">{{ number_format($product->purchase_price, 2) }} د.ع</td>
                        <td style="text-align: right;">{{ number_format($product->sale_price, 2) }} د.ع</td>
                        <td style="text-align: center;">{{ $product->last_purchase_date?->format('Y-m-d') ?? '-' }}</td>
                        <td style="text-align: center;">{{ $product->last_sale_date?->format('Y-m-d') ?? '-' }}</td>
                        <td onclick="event.stopPropagation();">
                            <div style="display: flex; gap: 2px;">
                                <button onclick="openEditModal({{ $product->id }})" class="win-button" style="padding: 2px 6px; font-size: 11px;" title="تعديل">
                                    <i class="fas fa-edit"></i>
                                </button>
                                <button onclick="showProduct({{ $product->id }})" class="win-button" style="padding: 2px 6px; font-size: 11px;" title="عرض">
                                    <i class="fas fa-eye"></i>
                                </button>
                                <form method="POST" action="{{ route('admin.products.destroy', $product) }}" style="display: inline;">
                                    @csrf
                                    @method('DELETE')
                                    <button type="submit" class="win-button danger" style="padding: 2px 6px; font-size: 11px;" onclick="return confirm('هل أنت متأكد من حذف هذا المنتج؟')" title="حذف">
                                        <i class="fas fa-trash"></i>
                                    </button>
                                </form>
                            </div>
                        </td>
                    </tr>
                    @empty
                    <tr>
                        <td colspan="16" style="text-align: center; padding: 40px; color: #666; font-style: italic;">
                            لا توجد مواد في المخزن
                        </td>
                    </tr>
                    @endforelse
                    </tbody>
                </table>
            </div>

            <!-- Pagination -->
            @if($products->hasPages())
            <div class="pagination-container">
                {{ $products->appends(request()->query())->links('pagination::simple-bootstrap-4') }}
            </div>
            @endif
        </div>

        <!-- قسم تفاصيل المنتج السريعة (20%) -->
        <div class="product-details-section">
            <div class="product-details-header">
                <i class="fas fa-info-circle"></i> تفاصيل المنتج
            </div>
            <div class="product-details-content" id="productDetailsContent">
                <div class="no-product-selected">
                    <i class="fas fa-mouse-pointer" style="font-size: 24px; color: #ccc; margin-bottom: 8px;"></i>
                    <div>اضغط على أي منتج لعرض تفاصيله</div>
                </div>
            </div>
        </div>
    </div>

    <!-- Create Modal -->
    <div id="createModal" class="modal" style="display: none;">
        <div class="modal-content" style="max-width: 600px;">
            <div class="modal-header">
                <h3>إضافة مادة جديدة</h3>
                <button class="modal-close" onclick="closeCreateModal()">&times;</button>
            </div>
            <div class="modal-body">
                <form id="createForm" action="{{ route('admin.products.store') }}" method="POST" enctype="multipart/form-data">
                    @csrf
                    <div class="form-grid">
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
                                <button type="button" onclick="scanBarcode('create')" class="win-button" style="padding: 6px 10px; font-size: 11px;" title="مسح باركود">
                                    <i class="fas fa-camera"></i>
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
                            <label for="create_purchase_price" class="win-label">سعر الشراء (د.ع) *</label>
                            <input type="number" id="create_purchase_price" name="purchase_price" class="win-input" step="0.01" min="0" required>
                            <div id="create_purchase_price_error" class="error-message"></div>
                        </div>
                        <div class="form-group">
                            <label for="create_sale_price" class="win-label">سعر البيع (د.ع) *</label>
                            <input type="number" id="create_sale_price" name="sale_price" class="win-input" step="0.01" min="0" required>
                            <div id="create_sale_price_error" class="error-message"></div>
                        </div>
                        <div class="form-group">
                            <label for="create_last_purchase_date" class="win-label">تاريخ آخر شراء</label>
                            <input type="date" id="create_last_purchase_date" name="last_purchase_date" class="win-input">
                            <div id="create_last_purchase_date_error" class="error-message"></div>
                        </div>
                        <div class="form-group">
                            <label for="create_last_sale_date" class="win-label">تاريخ آخر بيع</label>
                            <input type="date" id="create_last_sale_date" name="last_sale_date" class="win-input">
                            <div id="create_last_sale_date_error" class="error-message"></div>
                        </div>
                    </div>
                </form>
            </div>
            <div class="modal-footer">
                <button type="button" class="win-button primary" onclick="submitCreateForm()">حفظ المادة</button>
                <button type="button" class="win-button" onclick="closeCreateModal()">إلغاء</button>
            </div>
        </div>
    </div>

    <!-- Edit Modal -->
    <div id="editModal" class="modal" style="display: none;">
        <div class="modal-content" style="max-width: 600px;">
            <div class="modal-header">
                <h3>تعديل المادة</h3>
                <button class="modal-close" onclick="closeEditModal()">&times;</button>
            </div>
            <div class="modal-body">
                <form id="editForm" method="POST" enctype="multipart/form-data">
                    @csrf
                    @method('PUT')
                    <div class="form-grid">
                        <div class="form-group">
                            <label for="edit_name" class="win-label">اسم المادة *</label>
                            <input type="text" id="edit_name" name="name" class="win-input" placeholder="أدخل اسم المادة" required>
                            <div id="edit_name_error" class="error-message"></div>
                        </div>
                        <div class="form-group">
                            <label for="edit_code" class="win-label">كود المادة *</label>
                            <div style="display: flex; gap: 8px; align-items: center;">
                                <input type="text" id="edit_code" name="code" class="win-input" placeholder="أدخل كود المادة" required style="flex: 1;">
                                <button type="button" onclick="generateBarcode('edit')" class="win-button" style="padding: 6px 10px; font-size: 11px;" title="توليد كود تلقائي">
                                    <i class="fas fa-magic"></i>
                                </button>
                                <button type="button" onclick="scanBarcode('edit')" class="win-button" style="padding: 6px 10px; font-size: 11px;" title="مسح باركود">
                                    <i class="fas fa-camera"></i>
                                </button>
                            </div>
                            <div id="edit_barcode_preview" style="margin-top: 8px; text-align: center;"></div>
                            <div id="edit_code_error" class="error-message"></div>
                        </div>
                        <div class="form-group">
                            <label for="edit_image" class="win-label">صورة المادة</label>
                            <input type="file" id="edit_image" name="image" class="win-input" accept="image/*">
                            <div id="edit_image_error" class="error-message"></div>
                        </div>
                        <div class="form-group">
                            <label for="edit_stock_quantity" class="win-label">العدد المتوفر *</label>
                            <input type="number" id="edit_stock_quantity" name="stock_quantity" class="win-input" min="0" required>
                            <div id="edit_stock_quantity_error" class="error-message"></div>
                        </div>
                        <div class="form-group">
                            <label for="edit_pieces_per_carton" class="win-label">قطع/كارتون *</label>
                            <input type="number" id="edit_pieces_per_carton" name="pieces_per_carton" class="win-input" min="1" required>
                            <div id="edit_pieces_per_carton_error" class="error-message"></div>
                        </div>
                        <div class="form-group">
                            <label for="edit_piece_weight" class="win-label">وزن القطعة (جرام) *</label>
                            <input type="number" id="edit_piece_weight" name="piece_weight" class="win-input" step="0.01" min="0" required>
                            <div id="edit_piece_weight_error" class="error-message"></div>
                        </div>
                        <div class="form-group">
                            <label for="edit_carton_weight" class="win-label">وزن الكارتون (كغ) - تلقائي</label>
                            <input type="number" id="edit_carton_weight" name="carton_weight" class="win-input" step="0.001" min="0" required readonly style="background-color: #f8f9fa;">
                            <div id="edit_carton_weight_error" class="error-message"></div>
                            <small style="color: #666; font-size: 11px;">يتم حساب وزن الكارتون تلقائياً من (وزن القطعة × عدد القطع ÷ 1000)</small>
                        </div>
                        <div class="form-group">
                            <label for="edit_supplier_id" class="win-label">المورد *</label>
                            <select id="edit_supplier_id" name="supplier_id" class="win-input" required>
                                <option value="">اختر المورد</option>
                                @foreach($suppliers as $supplier)
                                <option value="{{ $supplier->id }}">{{ $supplier->name }}</option>
                                @endforeach
                            </select>
                            <div id="edit_supplier_id_error" class="error-message"></div>
                        </div>
                        <div class="form-group">
                            <label for="edit_category_id" class="win-label">الفئة *</label>
                            <select id="edit_category_id" name="category_id" class="win-input" required>
                                <option value="">اختر الفئة</option>
                                @foreach($categories as $category)
                                <option value="{{ $category->id }}">{{ $category->name }}</option>
                                @endforeach
                            </select>
                            <div id="edit_category_id_error" class="error-message"></div>
                        </div>
                        <div class="form-group">
                            <label for="edit_purchase_price" class="win-label">سعر الشراء (د.ع) *</label>
                            <input type="number" id="edit_purchase_price" name="purchase_price" class="win-input" step="0.01" min="0" required>
                            <div id="edit_purchase_price_error" class="error-message"></div>
                        </div>
                        <div class="form-group">
                            <label for="edit_sale_price" class="win-label">سعر البيع (د.ع) *</label>
                            <input type="number" id="edit_sale_price" name="sale_price" class="win-input" step="0.01" min="0" required>
                            <div id="edit_sale_price_error" class="error-message"></div>
                        </div>
                        <div class="form-group">
                            <label for="edit_last_purchase_date" class="win-label">تاريخ آخر شراء</label>
                            <input type="date" id="edit_last_purchase_date" name="last_purchase_date" class="win-input">
                            <div id="edit_last_purchase_date_error" class="error-message"></div>
                        </div>
                        <div class="form-group">
                            <label for="edit_last_sale_date" class="win-label">تاريخ آخر بيع</label>
                            <input type="date" id="edit_last_sale_date" name="last_sale_date" class="win-input">
                            <div id="edit_last_sale_date_error" class="error-message"></div>
                        </div>
                    </div>
                </form>
            </div>
            <div class="modal-footer">
                <button type="button" class="win-button primary" onclick="submitEditForm()">حفظ التعديلات</button>
                <button type="button" class="win-button" onclick="closeEditModal()">إلغاء</button>
            </div>
        </div>
    </div>

    <!-- Scanner Modal -->
    <div id="scannerModal" class="modal" style="display: none;">
        <div class="modal-content" style="max-width: 500px;">
            <div class="modal-header">
                <h3>مسح الباركود</h3>
                <button class="modal-close" onclick="closeScannerModal()">&times;</button>
            </div>
            <div class="modal-body" style="text-align: center;">
                <div id="scanner-loading" style="margin: 20px 0;">
                    <i class="fas fa-camera" style="font-size: 48px; color: #007bff;"></i>
                    <div style="margin-top: 10px;">جاري تشغيل الكاميرا...</div>
                </div>
                <video id="scanner-video" width="400" height="300" style="display: none; border: 2px solid #007bff;"></video>
                <div id="scanner-result" style="display: none; margin-top: 15px;">
                    <h4>تم اكتشاف الكود:</h4>
                    <div id="scanned-code" style="font-size: 18px; font-weight: bold; color: #28a745; margin: 10px 0;"></div>
                    <button id="use-scan-btn" onclick="useScanResult()" class="win-button primary" style="display: none;">استخدام هذا الكود</button>
                </div>
            </div>
        </div>
    </div>

<style>
/* تقسيم الشاشة إلى قسمين */
.main-split-container {
    display: flex;
    height: calc(100vh - 120px);
    gap: 1px;
    background: #c0c0c0;
}

.products-list-section {
    width: 80%;
    background: white;
    overflow: hidden;
    display: flex;
    flex-direction: column;
}

.product-details-section {
    width: 20%;
    background: white;
    border-left: 1px solid #c0c0c0;
    display: flex;
    flex-direction: column;
}

.product-details-header {
    background: linear-gradient(to bottom, #f0f0f0, #e0e0e0);
    border-bottom: 1px solid #c0c0c0;
    padding: 8px 12px;
    font-weight: bold;
    font-size: 13px;
    color: #333;
    text-align: center;
}

.product-details-content {
    flex: 1;
    overflow-y: auto;
    padding: 12px;
    font-size: 12px;
}

.detail-row {
    display: flex;
    margin-bottom: 8px;
    align-items: flex-start;
}

.detail-label {
    font-weight: bold;
    color: #666;
    min-width: 90px;
    font-size: 11px;
    padding-left: 5px;
}

.detail-value {
    color: #333;
    flex: 1;
    font-size: 12px;
    word-wrap: break-word;
}

.product-image-preview {
    text-align: center;
    margin-bottom: 12px;
    padding: 8px;
    border: 1px solid #ddd;
    background: #f9f9f9;
}

.product-image-preview img {
    max-width: 100%;
    max-height: 100px;
    object-fit: cover;
    border: 1px solid #ddd;
}

.no-product-selected {
    text-align: center;
    color: #999;
    font-style: italic;
    margin-top: 50px;
}

/* تعديل excel-container للقسم الجديد */
.products-list-section .excel-container {
    flex: 1;
    overflow: auto;
}

/* تحسين شكل الصفوف عند التحديد */
.excel-table tbody tr.selected {
    background-color: #e3f2fd !important;
}

.excel-table tbody tr:hover {
    background-color: #f5f5f5;
    cursor: pointer;
}

.excel-table tbody tr.product-row {
    cursor: pointer;
}

/* تصميم النوافذ المنبثقة */
.modal {
    display: none;
    position: fixed;
    z-index: 999999;
    left: 0;
    top: 0;
    width: 100%;
    height: 100%;
    background-color: rgba(0, 0, 0, 0.6);
    backdrop-filter: blur(3px);
    animation: fadeIn 0.2s ease-in-out;
    justify-content: center;
    align-items: flex-start;
    padding-top: 20px;
    box-sizing: border-box;
}

.modal-content {
    position: relative;
    background-color: #f0f0f0;
    margin: 0;
    padding: 0;
    border: 2px outset #c0c0c0;
    border-radius: 0;
    max-width: 90vw;
    max-height: 85vh;
    overflow: hidden;
    box-shadow: 8px 8px 16px rgba(0, 0, 0, 0.4);
    animation: slideDown 0.3s ease-out;
    display: flex;
    flex-direction: column;
}

.modal-header {
    background: linear-gradient(to bottom, #f0f0f0, #e0e0e0);
    border-bottom: 1px solid #c0c0c0;
    padding: 8px 16px;
    position: relative;
    font-weight: bold;
    color: #333;
}

.modal-header h3 {
    margin: 0;
    font-size: 14px;
    font-weight: bold;
}

.modal-close {
    position: absolute;
    right: 8px;
    top: 50%;
    transform: translateY(-50%);
    background: #c0c0c0;
    border: 1px outset #c0c0c0;
    width: 20px;
    height: 20px;
    font-size: 14px;
    font-weight: bold;
    color: #000;
    cursor: pointer;
    display: flex;
    align-items: center;
    justify-content: center;
    line-height: 1;
}

.modal-close:hover {
    background: #d0d0d0;
    border: 1px inset #c0c0c0;
}

.modal-close:active {
    border: 1px inset #c0c0c0;
    transform: translateY(-50%) translate(1px, 1px);
}

.modal-body {
    padding: 16px;
    overflow-y: auto;
    background: #f0f0f0;
    flex: 1;
    min-height: 0;
}

.modal-footer {
    background: linear-gradient(to bottom, #f0f0f0, #e0e0e0);
    border-top: 1px solid #c0c0c0;
    padding: 12px 16px;
    text-align: right;
    display: flex;
    gap: 8px;
    justify-content: flex-end;
}

/* رسائل الخطأ */
.error-message {
    color: #dc3545;
    font-size: 11px;
    margin-top: 4px;
    display: block;
    min-height: 14px;
}

/* تحسين النماذج داخل النوافذ المنبثقة */
.modal .form-group {
    margin-bottom: 12px;
}

.modal .win-label {
    display: block;
    margin-bottom: 4px;
    font-weight: bold;
    font-size: 12px;
    color: #333;
}

.modal .win-input, .modal .win-button {
    font-size: 12px;
}

.modal .win-input {
    width: 100%;
    box-sizing: border-box;
}

/* تأثيرات الحركة */
@keyframes fadeIn {
    from { opacity: 0; }
    to { opacity: 1; }
}

@keyframes slideDown {
    from {
        opacity: 0;
        transform: translateY(-50px);
    }
    to {
        opacity: 1;
        transform: translateY(0);
    }
}

/* عند الإغلاق */
.modal.closing {
    animation: fadeOut 0.2s ease-in-out;
}

.modal.closing .modal-content {
    animation: slideUp 0.2s ease-in;
}

@keyframes fadeOut {
    from { opacity: 1; }
    to { opacity: 0; }
}

@keyframes slideUp {
    from {
        opacity: 1;
        transform: translateY(0);
    }
    to {
        opacity: 0;
        transform: translateY(-30px);
    }
}

/* تجاوب مع الشاشات الصغيرة */
@media (max-width: 768px) {
    .modal {
        padding-top: 10px;
    }

    .modal-content {
        max-width: 95vw;
        max-height: 90vh;
    }

    .modal .form-group {
        margin-bottom: 8px;
    }

    .modal-body {
        padding: 12px;
    }

    .modal-header {
        padding: 6px 12px;
    }

    .modal-footer {
        padding: 8px 12px;
    }
}

/* تحسين الشبكة في النماذج */
.modal .form-grid {
    display: grid;
    grid-template-columns: 1fr 1fr;
    gap: 16px;
}

@media (max-width: 768px) {
    .modal .form-grid {
        grid-template-columns: 1fr;
        gap: 8px;
    }
}
</style>

<!-- Barcode Libraries -->
<script src="https://cdnjs.cloudflare.com/ajax/libs/jsbarcode/3.12.1/JsBarcode.all.min.js" onload="window.jsBarcodeLoaded = true;"></script>
<script src="https://cdnjs.cloudflare.com/ajax/libs/quagga/0.12.1/quagga.min.js"></script>

<script>
// عرض تفاصيل المنتج في القسم الجانبي
function showProductDetails(productId) {
    // إزالة التحديد من الصفوف الأخرى
    document.querySelectorAll('.product-row').forEach(row => {
        row.classList.remove('selected');
    });

    // تحديد الصف الحالي
    const currentRow = document.querySelector(`[data-product-id="${productId}"]`);
    if (currentRow) {
        currentRow.classList.add('selected');
    }

    // جلب بيانات المنتج
    fetch(`/admin/products-data/${productId}`, {
        headers: {
            'X-Requested-With': 'XMLHttpRequest'
        }
    })
    .then(response => response.json())
    .then(data => {
        displayProductDetails(data);
    })
    .catch(error => {
        console.error('Error fetching product details:', error);
        document.getElementById('productDetailsContent').innerHTML = `
            <div style="color: #dc3545; text-align: center; margin-top: 50px;">
                <i class="fas fa-exclamation-triangle"></i>
                <div>خطأ في تحميل تفاصيل المنتج</div>
            </div>
        `;
    });
}

// عرض تفاصيل المنتج
function displayProductDetails(data) {
    const content = document.getElementById('productDetailsContent');

    const imageHtml = data.image
        ? `<img src="/storage/${data.image}" alt="${data.name}">`
        : `<div style="color: #999; font-style: italic; padding: 20px;">لا توجد صورة</div>`;

    content.innerHTML = `
        <div class="product-image-preview">
            ${imageHtml}
        </div>

        <div class="detail-row">
            <div class="detail-label">اسم المادة:</div>
            <div class="detail-value" title="${data.name}">${data.name}</div>
        </div>

        <div class="detail-row">
            <div class="detail-label">الكود:</div>
            <div class="detail-value">${data.code}</div>
        </div>

        <div class="detail-row">
            <div class="detail-label">المتوفر:</div>
            <div class="detail-value" style="font-weight: bold; color: ${data.stock_quantity > 0 ? '#28a745' : '#dc3545'};">
                ${Number(data.stock_quantity).toLocaleString()} قطعة
            </div>
        </div>

        <div class="detail-row">
            <div class="detail-label">سعر الشراء:</div>
            <div class="detail-value" style="color: #007bff; font-weight: bold;">
                ${Number(data.purchase_price).toLocaleString()} د.ع
            </div>
        </div>

        <div class="detail-row">
            <div class="detail-label">سعر البيع:</div>
            <div class="detail-value" style="color: #28a745; font-weight: bold;">
                ${Number(data.sale_price).toLocaleString()} د.ع
            </div>
        </div>

        <div class="detail-row">
            <div class="detail-label">آخر شراء:</div>
            <div class="detail-value">${data.last_purchase_date || 'لم يتم تسجيل شراء'}</div>
        </div>

        <div class="detail-row">
            <div class="detail-label">آخر بيع:</div>
            <div class="detail-value">${data.last_sale_date || 'لم يتم تسجيل بيع'}</div>
        </div>

        <div class="detail-row">
            <div class="detail-label">قطع/كارتون:</div>
            <div class="detail-value">${Number(data.pieces_per_carton).toLocaleString()}</div>
        </div>

        <div class="detail-row">
            <div class="detail-label">وزن القطعة:</div>
            <div class="detail-value">${Number(data.piece_weight).toFixed(2)} جم</div>
        </div>

        <div class="detail-row">
            <div class="detail-label">وزن الكارتون:</div>
            <div class="detail-value">${Number(data.carton_weight).toFixed(3)} كغ</div>
        </div>

        <div class="detail-row">
            <div class="detail-label">المورد:</div>
            <div class="detail-value">${data.supplier_name || 'غير محدد'}</div>
        </div>

        <div class="detail-row">
            <div class="detail-label">الفئة:</div>
            <div class="detail-value">${data.category_name || 'غير محدد'}</div>
        </div>

        <div style="margin-top: 16px; padding-top: 12px; border-top: 1px solid #eee;">
            <div class="detail-row">
                <div class="detail-label">تم الإنشاء:</div>
                <div class="detail-value" style="font-size: 11px; color: #666;">
                    ${new Date(data.created_at).toLocaleDateString('ar-EG')}
                </div>
            </div>
        </div>

        <div style="margin-top: 16px; text-align: center; gap: 8px; display: flex;">
            <button onclick="openEditModal(${data.id})" class="win-button" style="flex: 1; font-size: 11px;">
                <i class="fas fa-edit"></i> تعديل
            </button>
            <button onclick="printBarcode(${data.id})" class="win-button" style="flex: 1; font-size: 11px;">
                <i class="fas fa-print"></i> طباعة
            </button>
        </div>
    `;
}

// وظائف أساسية للمنتجات
function openCreateModal() {
    // تنظيف النموذج
    document.getElementById('createForm').reset();
    document.querySelectorAll('#createModal .error-message').forEach(error => error.textContent = '');
    document.getElementById('create_barcode_preview').innerHTML = '';

    // عرض النموذج بتأثير انتقالي
    const modal = document.getElementById('createModal');
    modal.style.display = 'flex';
    modal.classList.remove('closing');

    // منع التمرير في الخلفية
    document.body.style.overflow = 'hidden';
}

function closeCreateModal() {
    const modal = document.getElementById('createModal');

    // إضافة تأثير الإغلاق
    modal.classList.add('closing');

    setTimeout(() => {
        // تنظيف النموذج
        document.getElementById('createForm').reset();
        document.querySelectorAll('#createModal .error-message').forEach(error => error.textContent = '');
        document.getElementById('create_barcode_preview').innerHTML = '';

        // إغلاق النموذج
        modal.style.display = 'none';
        modal.classList.remove('closing');

        // إعادة تفعيل التمرير
        document.body.style.overflow = 'auto';
    }, 200);
}

function openEditModal(productId) {
    // عرض النموذج بتأثير انتقالي
    const modal = document.getElementById('editModal');
    modal.style.display = 'flex';
    modal.classList.remove('closing');

    // منع التمرير في الخلفية
    document.body.style.overflow = 'hidden';

    // جلب بيانات المنتج
    fetch(`/admin/products-data/${productId}`, {
        headers: {
            'X-Requested-With': 'XMLHttpRequest'
        }
    })
    .then(response => response.json())
    .then(data => {
        // ملء النموذج بالبيانات
        document.getElementById('edit_name').value = data.name || '';
        document.getElementById('edit_code').value = data.code || '';
        document.getElementById('edit_stock_quantity').value = data.stock_quantity || '';
        document.getElementById('edit_pieces_per_carton').value = data.pieces_per_carton || '';
        document.getElementById('edit_piece_weight').value = data.piece_weight || '';
        document.getElementById('edit_carton_weight').value = data.carton_weight || '';
        document.getElementById('edit_supplier_id').value = data.supplier_id || '';
        document.getElementById('edit_category_id').value = data.category_id || '';
        document.getElementById('edit_purchase_price').value = data.purchase_price || '';
        document.getElementById('edit_sale_price').value = data.sale_price || '';
        document.getElementById('edit_last_purchase_date').value = data.last_purchase_date || '';
        document.getElementById('edit_last_sale_date').value = data.last_sale_date || '';

        // تحديث action الخاص بالنموذج
        document.getElementById('editForm').action = `/admin/products/${productId}`;

        // إنشاء معاينة الباركود
        if (data.code) {
            const barcodeContainer = document.getElementById('edit_barcode_preview');
            barcodeContainer.innerHTML = '<canvas id="edit_barcode_canvas"></canvas>';

            // تأكد من تحميل مكتبة JsBarcode
            if (typeof JsBarcode !== 'undefined') {
                try {
                    JsBarcode("#edit_barcode_canvas", data.code, {
                        format: "CODE128",
                        width: 1,
                        height: 40,
                        displayValue: true,
                        fontSize: 12
                    });
                } catch (e) {
                    barcodeContainer.innerHTML = '<span style="color: red;">خطأ في إنشاء الباركود</span>';
                }
            } else {
                barcodeContainer.innerHTML = '<span style="color: orange;">جاري تحميل مكتبة الباركود...</span>';
                setTimeout(() => {
                    if (typeof JsBarcode !== 'undefined') {
                        try {
                            JsBarcode("#edit_barcode_canvas", data.code, {
                                format: "CODE128",
                                width: 1,
                                height: 40,
                                displayValue: true,
                                fontSize: 12
                            });
                        } catch (e) {
                            barcodeContainer.innerHTML = '<span style="color: red;">خطأ في إنشاء الباركود</span>';
                        }
                    }
                }, 100);
            }
        }
    })
    .catch(error => {
        console.error('Error fetching product data:', error);
        alert('خطأ في تحميل بيانات المنتج');
        closeEditModal();
    });
}

function closeEditModal() {
    const modal = document.getElementById('editModal');

    // إضافة تأثير الإغلاق
    modal.classList.add('closing');

    setTimeout(() => {
        // تنظيف النموذج
        document.getElementById('editForm').reset();
        document.querySelectorAll('#editModal .error-message').forEach(error => error.textContent = '');
        document.getElementById('edit_barcode_preview').innerHTML = '';

        // إغلاق النموذج
        modal.style.display = 'none';
        modal.classList.remove('closing');

        // إعادة تفعيل التمرير
        document.body.style.overflow = 'auto';
    }, 200);
}

function openScannerModal() {
    const modal = document.getElementById('scannerModal');
    modal.style.display = 'flex';
    modal.classList.remove('closing');

    // منع التمرير في الخلفية
    document.body.style.overflow = 'hidden';
}

function closeScannerModal() {
    const modal = document.getElementById('scannerModal');

    // إضافة تأثير الإغلاق
    modal.classList.add('closing');

    setTimeout(() => {
        // إيقاف الكاميرا
        const video = document.getElementById('scanner-video');
        if (video.srcObject) {
            const tracks = video.srcObject.getTracks();
            tracks.forEach(track => track.stop());
            video.srcObject = null;
        }

        // إعادة تعيين العناصر
        document.getElementById('scanner-loading').style.display = 'block';
        document.getElementById('scanner-loading').innerHTML = `
            <i class="fas fa-camera" style="font-size: 48px; color: #007bff;"></i>
            <div style="margin-top: 10px;">جاري تشغيل الكاميرا...</div>
        `;
        video.style.display = 'none';
        document.getElementById('scanner-result').style.display = 'none';

        // إغلاق النموذج
        modal.style.display = 'none';
        modal.classList.remove('closing');

        // إعادة تفعيل التمرير
        document.body.style.overflow = 'auto';
    }, 200);
}

// وظيفة طباعة الباركود
function printBarcode(productId) {
    const canvas = document.getElementById(`barcode_${productId}`);
    if (canvas) {
        const printWindow = window.open('', '_blank');
        printWindow.document.write(`
            <html>
                <head><title>طباعة باركود</title></head>
                <body style="text-align: center; padding: 20px;">
                    <img src="${canvas.toDataURL()}" style="max-width: 300px;">
                </body>
            </html>
        `);
        printWindow.print();
        printWindow.close();
    }
}

// وظيفة لحساب وزن الكارتون تلقائياً
function calculateCartonWeight() {
    const pieceWeight = parseFloat(document.getElementById('create_piece_weight').value) || 0;
    const piecesPerCarton = parseFloat(document.getElementById('create_pieces_per_carton').value) || 0;
    const cartonWeight = (pieceWeight * piecesPerCarton) / 1000; // تحويل من جرام إلى كيلو
    document.getElementById('create_carton_weight').value = cartonWeight.toFixed(3);
}

// وظيفة لحساب وزن الكارتون للتعديل
function calculateEditCartonWeight() {
    const pieceWeight = parseFloat(document.getElementById('edit_piece_weight').value) || 0;
    const piecesPerCarton = parseFloat(document.getElementById('edit_pieces_per_carton').value) || 0;
    const cartonWeight = (pieceWeight * piecesPerCarton) / 1000; // تحويل من جرام إلى كيلو
    document.getElementById('edit_carton_weight').value = cartonWeight.toFixed(3);
}

// وظيفة إرسال نموذج إنشاء منتج جديد
function submitCreateForm() {
    const form = document.getElementById('createForm');
    const formData = new FormData(form);

    // تنظيف رسائل الخطأ السابقة
    document.querySelectorAll('.error-message').forEach(error => error.textContent = '');

    fetch(form.action, {
        method: 'POST',
        body: formData,
        headers: {
            'X-Requested-With': 'XMLHttpRequest'
        }
    })
    .then(response => response.json())
    .then(data => {
        if (data.success) {
            closeCreateModal();
            // إعادة تحميل الصفحة أو تحديث القائمة
            window.location.reload();
        } else if (data.errors) {
            // عرض رسائل الخطأ
            Object.keys(data.errors).forEach(field => {
                const errorElement = document.getElementById(`create_${field}_error`);
                if (errorElement) {
                    errorElement.textContent = data.errors[field][0];
                }
            });
        }
    })
    .catch(error => {
        console.error('Error:', error);
        alert('حدث خطأ أثناء إضافة المنتج');
    });
}

// وظيفة إرسال نموذج تعديل المنتج
function submitEditForm() {
    const form = document.getElementById('editForm');
    const formData = new FormData(form);

    // تنظيف رسائل الخطأ السابقة
    document.querySelectorAll('.error-message').forEach(error => error.textContent = '');

    fetch(form.action, {
        method: 'POST',
        body: formData,
        headers: {
            'X-Requested-With': 'XMLHttpRequest'
        }
    })
    .then(response => response.json())
    .then(data => {
        if (data.success) {
            closeEditModal();
            // إعادة تحميل الصفحة أو تحديث القائمة
            window.location.reload();
        } else if (data.errors) {
            // عرض رسائل الخطأ
            Object.keys(data.errors).forEach(field => {
                const errorElement = document.getElementById(`edit_${field}_error`);
                if (errorElement) {
                    errorElement.textContent = data.errors[field][0];
                }
            });
        }
    })
    .catch(error => {
        console.error('Error:', error);
        alert('حدث خطأ أثناء تحديث المنتج');
    });
}

// وظائف البحث والتصفية
function liveSearch() {
    const searchValue = document.getElementById('searchInput').value;
    const clearBtn = document.getElementById('clearBtn');

    if (searchValue.length > 0) {
        clearBtn.style.display = 'inline-block';
    } else {
        clearBtn.style.display = 'none';
    }

    // تنفيذ البحث بعد توقف لمدة 500ms
    clearTimeout(window.searchTimeout);
    window.searchTimeout = setTimeout(() => {
        if (searchValue.length > 2 || searchValue.length === 0) {
            window.location.href = `{{ route('admin.products.index') }}?search=${encodeURIComponent(searchValue)}`;
        }
    }, 500);
}

function clearSearch() {
    document.getElementById('searchInput').value = '';
    document.getElementById('clearBtn').style.display = 'none';
    window.location.href = '{{ route('admin.products.index') }}';
}

// وظائف التحديد المتعدد
function updateSelection() {
    const selected = document.querySelectorAll('input[name="selected_products[]"]:checked');
    // يمكن إضافة منطق إضافي هنا لإدارة التحديد المتعدد
}

function editSelected() {
    const selected = document.querySelectorAll('input[name="selected_products[]"]:checked');
    if (selected.length === 1) {
        const productId = selected[0].value;
        openEditModal(productId);
    } else if (selected.length === 0) {
        alert('يرجى تحديد منتج للتعديل');
    } else {
        alert('يمكن تعديل منتج واحد فقط في المرة الواحدة');
    }
}

function deleteSelected() {
    const selected = document.querySelectorAll('input[name="selected_products[]"]:checked');
    if (selected.length === 0) {
        alert('يرجى تحديد منتج أو أكثر للحذف');
        return;
    }

    if (confirm(`هل أنت متأكد من حذف ${selected.length} منتج؟`)) {
        // يمكن إضافة منطق الحذف المتعدد هنا
        console.log('حذف المنتجات المحددة:', Array.from(selected).map(cb => cb.value));
    }
}

// وظائف إنشاء الباركود
function generateCreateBarcode() {
    const code = document.getElementById('create_code').value;
    const previewContainer = document.getElementById('create_barcode_preview');

    if (code && code.length > 0) {
        previewContainer.innerHTML = '<canvas id="create_barcode_canvas"></canvas>';

        // تأكد من تحميل مكتبة JsBarcode
        if (typeof JsBarcode !== 'undefined') {
            try {
                JsBarcode("#create_barcode_canvas", code, {
                    format: "CODE128",
                    width: 1,
                    height: 40,
                    displayValue: true,
                    fontSize: 12
                });
            } catch (e) {
                previewContainer.innerHTML = '<span style="color: red;">خطأ في إنشاء الباركود</span>';
            }
        } else {
            previewContainer.innerHTML = '<span style="color: orange;">جاري تحميل مكتبة الباركود...</span>';
            setTimeout(generateCreateBarcode, 100);
        }
    } else {
        previewContainer.innerHTML = '';
    }
}

function generateEditBarcode() {
    const code = document.getElementById('edit_code').value;
    const previewContainer = document.getElementById('edit_barcode_preview');

    if (code && code.length > 0) {
        previewContainer.innerHTML = '<canvas id="edit_barcode_canvas"></canvas>';

        // تأكد من تحميل مكتبة JsBarcode
        if (typeof JsBarcode !== 'undefined') {
            try {
                JsBarcode("#edit_barcode_canvas", code, {
                    format: "CODE128",
                    width: 1,
                    height: 40,
                    displayValue: true,
                    fontSize: 12
                });
            } catch (e) {
                previewContainer.innerHTML = '<span style="color: red;">خطأ في إنشاء الباركود</span>';
            }
        } else {
            previewContainer.innerHTML = '<span style="color: orange;">جاري تحميل مكتبة الباركود...</span>';
            setTimeout(generateEditBarcode, 100);
        }
    } else {
        previewContainer.innerHTML = '';
    }
}

function generateRandomCode() {
    const randomCode = 'P' + Date.now().toString().slice(-8);
    document.getElementById('create_code').value = randomCode;
    generateCreateBarcode();
}

// وظائف معالجة الأزرار في النماذج
function generateBarcode(modalType) {
    if (modalType === 'create') {
        const randomCode = 'P' + Date.now().toString().slice(-8);
        document.getElementById('create_code').value = randomCode;
        generateCreateBarcode();
    } else if (modalType === 'edit') {
        const randomCode = 'P' + Date.now().toString().slice(-8);
        document.getElementById('edit_code').value = randomCode;
        generateEditBarcode();
    }
}

function scanBarcode(modalType) {
    // فتح نموذج المسح الضوئي
    openScannerModal();
    window.currentScanTarget = modalType; // تخزين النموذج الحالي للمسح

    // محاولة تشغيل الكاميرا
    const video = document.getElementById('scanner-video');
    const loadingDiv = document.getElementById('scanner-loading');

    if (navigator.mediaDevices && navigator.mediaDevices.getUserMedia) {
        navigator.mediaDevices.getUserMedia({
            video: {
                facingMode: { ideal: "environment" } // استخدام الكاميرا الخلفية إن أمكن
            }
        })
        .then(function(stream) {
            video.srcObject = stream;
            video.style.display = 'block';
            loadingDiv.style.display = 'none';
            video.play();

            // بدء عملية اكتشاف الباركود
            startBarcodeDetection(video);
        })
        .catch(function(err) {
            console.error('Error accessing camera:', err);
            loadingDiv.innerHTML = '<div style="color: red;">خطأ في الوصول للكاميرا</div>';
        });
    } else {
        loadingDiv.innerHTML = '<div style="color: red;">المتصفح لا يدعم الكاميرا</div>';
    }
}

function startBarcodeDetection(video) {
    // هذه وظيفة بسيطة - يمكن تحسينها باستخدام مكتبة QuaggaJS
    const canvas = document.createElement('canvas');
    const ctx = canvas.getContext('2d');

    function detectBarcode() {
        if (video.readyState === video.HAVE_ENOUGH_DATA) {
            canvas.width = video.videoWidth;
            canvas.height = video.videoHeight;
            ctx.drawImage(video, 0, 0);

            // هنا يمكن إضافة منطق اكتشاف الباركود
            // للتبسيط، سنعرض رسالة للمستخدم لإدخال الكود يدوياً
        }

        requestAnimationFrame(detectBarcode);
    }

    detectBarcode();
}

function useScanResult() {
    const scannedCode = document.getElementById('scanned-code').textContent;
    const targetModal = window.currentScanTarget;

    if (targetModal === 'create') {
        document.getElementById('create_code').value = scannedCode;
        generateCreateBarcode();
    } else if (targetModal === 'edit') {
        document.getElementById('edit_code').value = scannedCode;
        generateEditBarcode();
    }

    closeScannerModal();
}

// إضافة مراقبة للحقول لحساب وزن الكارتون وإنشاء الباركود
document.addEventListener('DOMContentLoaded', function() {
    const pieceWeightInput = document.getElementById('create_piece_weight');
    const piecesPerCartonInput = document.getElementById('create_pieces_per_carton');
    const editPieceWeightInput = document.getElementById('edit_piece_weight');
    const editPiecesPerCartonInput = document.getElementById('edit_pieces_per_carton');
    const createCodeInput = document.getElementById('create_code');
    const editCodeInput = document.getElementById('edit_code');

    if (pieceWeightInput) pieceWeightInput.addEventListener('input', calculateCartonWeight);
    if (piecesPerCartonInput) piecesPerCartonInput.addEventListener('input', calculateCartonWeight);
    if (editPieceWeightInput) editPieceWeightInput.addEventListener('input', calculateEditCartonWeight);
    if (editPiecesPerCartonInput) editPiecesPerCartonInput.addEventListener('input', calculateEditCartonWeight);
    if (createCodeInput) createCodeInput.addEventListener('input', generateCreateBarcode);
    if (editCodeInput) editCodeInput.addEventListener('input', generateEditBarcode);

    // إنشاء الباركودات للمنتجات الموجودة
    generateAllBarcodes();

    // إضافة وظيفة إغلاق النوافذ عند النقر خارجها
    setupModalClickHandlers();
});

// إعداد وظائف النقر للنوافذ المنبثقة
function setupModalClickHandlers() {
    const modals = ['createModal', 'editModal', 'scannerModal'];

    modals.forEach(modalId => {
        const modal = document.getElementById(modalId);
        if (modal) {
            modal.addEventListener('click', function(event) {
                if (event.target === modal) {
                    // النقر خارج محتوى النافذة
                    if (modalId === 'createModal') closeCreateModal();
                    else if (modalId === 'editModal') closeEditModal();
                    else if (modalId === 'scannerModal') closeScannerModal();
                }
            });
        }
    });

    // إضافة إغلاق بمفتاح ESC
    document.addEventListener('keydown', function(event) {
        if (event.key === 'Escape') {
            // البحث عن النافذة المفتوحة وإغلاقها
            const openModal = document.querySelector('.modal[style*="flex"]');
            if (openModal) {
                const modalId = openModal.id;
                if (modalId === 'createModal') closeCreateModal();
                else if (modalId === 'editModal') closeEditModal();
                else if (modalId === 'scannerModal') closeScannerModal();
            }
        }
    });
}

// دالة إنشاء جميع الباركودات في الجدول
function generateAllBarcodes() {
    // تأكد من تحميل مكتبة JsBarcode
    if (typeof JsBarcode === 'undefined' && !window.jsBarcodeLoaded) {
        setTimeout(generateAllBarcodes, 100); // إعادة المحاولة بعد 100ms
        return;
    }

    document.querySelectorAll('canvas[data-code]').forEach(canvas => {
        const code = canvas.getAttribute('data-code');
        if (code && code.trim() !== '') {
            try {
                JsBarcode(canvas, code, {
                    format: "CODE128",
                    width: 1,
                    height: 30,
                    displayValue: false,
                    fontSize: 10
                });
            } catch (e) {
                console.warn('خطأ في إنشاء باركود للكود:', code, e);
                // إذا فشل، اعرض الكود كنص
                const ctx = canvas.getContext('2d');
                ctx.font = '10px Arial';
                ctx.fillText(code, 5, 20);
            }
        }
    });
}
</script>
@endsection
