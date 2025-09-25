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
            <tr>
                <td>
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
                    <canvas id="barcode_{{ $product->id }}" style="max-width: 80px; height: 30px;"></canvas>
                    <script>
                        JsBarcode('#barcode_{{ $product->id }}', '{{ $product->code }}', {
                            format: "CODE128",
                            width: 1,
                            height: 30,
                            displayValue: false,
                            fontSize: 10
                        });
                    </script>
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
                <td>
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
                            <label for="create_carton_weight" class="win-label">وزن الكارتون (كغ) *</label>
                            <input type="number" id="create_carton_weight" name="carton_weight" class="win-input" step="0.001" min="0" required>
                            <div id="create_carton_weight_error" class="error-message"></div>
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

                    <div style="display: grid; grid-template-columns: 1fr 1fr; gap: 16px;">
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
                            <div id="edit_barcode_preview" style="margin-top: 8px; text-align: center;"></div>
                            <div id="edit_code_error" class="error-message"></div>
                        </div>ss="fas fa-plus"></i>
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
            <tr>
                <td>
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
                    <canvas id="barcode_{{ $product->id }}" style="max-width: 80px; height: 30px;"></canvas>
                    <script>
                        JsBarcode('#barcode_{{ $product->id }}', '{{ $product->code }}', {
                            format: "CODE128",
                            width: 1,
                            height: 30,
                            displayValue: false,
                            fontSize: 10
                        });
                    </script>
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
                <td>
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
                            <label for="create_carton_weight" class="win-label">وزن الكارتون (كغ) *</label>
                            <input type="number" id="create_carton_weight" name="carton_weight" class="win-input" step="0.001" min="0" required>
                            <div id="create_carton_weight_error" class="error-message"></div>
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

                    <div style="display: grid; grid-template-columns: 1fr 1fr; gap: 16px;">
                        <div class="form-group">
                            <label for="edit_name" class="win-label">اسم المنتج *</label>
                            <input type="text" id="edit_name" name="name" class="win-input" placeholder="أدخل اسم المنتج" required>
                            <div id="edit_name_error" class="error-message"></div>
                        </div>

                        <div class="form-group">
                            <label for="edit_code" class="win-label">كود المنتج *</label>
                            <input type="text" id="edit_code" name="code" class="win-input" placeholder="أدخل كود المنتج" required>
                            <div id="edit_code_error" class="error-message"></div>
                        </div>

                        <div class="form-group">
                            <label for="edit_image" class="win-label">صورة المنتج</label>
                            <input type="file" id="edit_image" name="image" class="win-input" accept="image/*">
                            <div id="current_image" style="margin-top: 5px;"></div>
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
                            <label for="edit_carton_weight" class="win-label">وزن الكارتون (كغ) *</label>
                            <input type="number" id="edit_carton_weight" name="carton_weight" class="win-input" step="0.001" min="0" required>
                            <div id="edit_carton_weight_error" class="error-message"></div>
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
                <button type="button" class="win-button primary" onclick="submitEditForm()">حفظ التغييرات</button>
                <button type="button" class="win-button" onclick="closeEditModal()">إلغاء</button>
            </div>
        </div>
    </div>

    <!-- Show Modal -->
    <div id="showModal" class="modal" style="display: none;">
        <div class="modal-content" style="max-width: 600px;">
            <div class="modal-header">
                <h3>عرض تفاصيل المادة</h3>
                <button class="modal-close" onclick="closeShowModal()">&times;</button>
            </div>
            <div class="modal-body">
                <div style="display: grid; grid-template-columns: 1fr 1fr; gap: 16px;">
                    <div class="form-group">
                        <label class="win-label">اسم المنتج</label>
                        <div id="show_name" class="win-input" style="background: #f5f5f5; border: 1px solid #ddd; cursor: not-allowed;"></div>
                    </div>

                    <div class="form-group">
                        <label class="win-label">كود المادة</label>
                        <div id="show_code" class="win-input" style="background: #f5f5f5; border: 1px solid #ddd; cursor: not-allowed;"></div>
                    </div>

                    <div class="form-group">
                        <label class="win-label">الباركود</label>
                        <div style="text-align: center; padding: 10px; background: #f5f5f5; border: 1px solid #ddd;">
                            <canvas id="show_barcode_canvas"></canvas>
                        </div>
                    </div>

                    <div class="form-group" style="grid-column: span 2;">
                        <label class="win-label">صورة المادة</label>
                        <div id="show_image_container" style="text-align: center; margin-top: 8px;"></div>
                    </div>

                    <div class="form-group">
                        <label class="win-label">العدد المتوفر</label>
                        <div id="show_stock_quantity" class="win-input" style="background: #f5f5f5; border: 1px solid #ddd; cursor: not-allowed;"></div>
                    </div>

                    <div class="form-group">
                        <label class="win-label">قطع/كارتون</label>
                        <div id="show_pieces_per_carton" class="win-input" style="background: #f5f5f5; border: 1px solid #ddd; cursor: not-allowed;"></div>
                    </div>

                    <div class="form-group">
                        <label class="win-label">وزن القطعة</label>
                        <div id="show_piece_weight" class="win-input" style="background: #f5f5f5; border: 1px solid #ddd; cursor: not-allowed;"></div>
                    </div>

                    <div class="form-group">
                        <label class="win-label">وزن الكارتون</label>
                        <div id="show_carton_weight" class="win-input" style="background: #f5f5f5; border: 1px solid #ddd; cursor: not-allowed;"></div>
                    </div>

                    <div class="form-group">
                        <label class="win-label">المورد</label>
                        <div id="show_supplier" class="win-input" style="background: #f5f5f5; border: 1px solid #ddd; cursor: not-allowed;"></div>
                    </div>

                    <div class="form-group">
                        <label class="win-label">الفئة</label>
                        <div id="show_category" class="win-input" style="background: #f5f5f5; border: 1px solid #ddd; cursor: not-allowed;"></div>
                    </div>

                    <div class="form-group">
                        <label class="win-label">سعر الشراء</label>
                        <div id="show_purchase_price" class="win-input" style="background: #f5f5f5; border: 1px solid #ddd; cursor: not-allowed;"></div>
                    </div>

                    <div class="form-group">
                        <label class="win-label">سعر البيع</label>
                        <div id="show_sale_price" class="win-input" style="background: #f5f5f5; border: 1px solid #ddd; cursor: not-allowed;"></div>
                    </div>

                    <div class="form-group">
                        <label class="win-label">تاريخ آخر شراء</label>
                        <div id="show_last_purchase_date" class="win-input" style="background: #f5f5f5; border: 1px solid #ddd; cursor: not-allowed;"></div>
                    </div>

                    <div class="form-group">
                        <label class="win-label">تاريخ آخر بيع</label>
                        <div id="show_last_sale_date" class="win-input" style="background: #f5f5f5; border: 1px solid #ddd; cursor: not-allowed;"></div>
                    </div>

                    <div class="form-group">
                        <label class="win-label">تاريخ الإنشاء</label>
                        <div id="show_created_at" class="win-input" style="background: #f5f5f5; border: 1px solid #ddd; cursor: not-allowed;"></div>
                    </div>
                </div>
            </div>
            <div class="modal-footer">
                <button type="button" class="win-button primary" onclick="printBarcode()">طباعة الباركود</button>
                <button type="button" class="win-button" onclick="closeShowModal()">إغلاق</button>
            </div>
        </div>
    </div>

    <!-- Barcode Scanner Modal -->
    <div id="scannerModal" class="modal" style="display: none;">
        <div class="modal-content" style="max-width: 500px;">
            <div class="modal-header">
                <h3>مسح الباركود</h3>
                <button class="modal-close" onclick="closeScannerModal()">&times;</button>
            </div>
            <div class="modal-body">
                <div style="text-align: center;">
                    <div id="scanner-container" style="width: 100%; height: 300px; border: 2px solid #ddd; margin-bottom: 16px; position: relative; background: #f5f5f5;">
                        <video id="scanner-video" style="width: 100%; height: 100%; object-fit: cover;"></video>
                        <div id="scanner-loading" style="position: absolute; top: 50%; left: 50%; transform: translate(-50%, -50%); color: #666;">
                            <i class="fas fa-spinner fa-spin"></i> جاري تحضير الكاميرا...
                        </div>
                    </div>
                    <div style="margin-bottom: 16px;">
                        <input type="file" id="barcode-file" accept="image/*" style="display: none;" onchange="scanBarcodeFromFile(this)">
                        <button type="button" onclick="document.getElementById('barcode-file').click()" class="win-button">
                            <i class="fas fa-upload"></i> أو ارفع صورة باركود
                        </button>
                    </div>
                    <div id="scanner-result" style="padding: 8px; background: #f8f9fa; border: 1px solid #ddd; border-radius: 4px; display: none;">
                        <strong>الكود المقروء:</strong> <span id="scanned-code"></span>
                    </div>
                </div>
            </div>
            <div class="modal-footer">
                <button type="button" class="win-button primary" onclick="useScanResult()" id="use-scan-btn" style="display: none;">استخدام هذا الكود</button>
                <button type="button" class="win-button" onclick="closeScannerModal()">إغلاق</button>
            </div>
        </div>
    </div>
@endsection

@section('statusbar')
    <div class="status-item">
        <i class="fas fa-box"></i>
        إجمالي المواد: {{ $products->total() }}
    </div>
    @if(request('search'))
    <div class="status-item">
        نتائج البحث في الصفحة: {{ $products->count() }}
    </div>
    @endif
    <div class="status-item">
        الصفحة {{ $products->currentPage() }} من {{ $products->lastPage() }}
    </div>
@endsection

@section('scripts')
<!-- Barcode Libraries -->
<script src="https://cdn.jsdelivr.net/npm/jsbarcode@3.12.1/dist/JsBarcode.all.min.js"></script>
<script src="https://cdn.jsdelivr.net/npm/quagga@0.12.1/dist/quagga.min.js"></script>

<style>
/* Modal Styles */
.modal {
    position: fixed;
    top: 0;
    left: 0;
    width: 100%;
    height: 100%;
    background: rgba(0, 0, 0, 0.5);
    z-index: 1000;
    display: flex;
    align-items: center;
    justify-content: center;
}

.modal-content {
    background: white;
    border: 2px solid #0078d4;
    width: 90%;
    max-width: 500px;
    max-height: 90vh;
    overflow: hidden;
    display: flex;
    flex-direction: column;
}

.modal-header {
    background: linear-gradient(to bottom, #0078d4 0%, #106ebe 100%);
    color: white;
    padding: 12px 16px;
    display: flex;
    justify-content: space-between;
    align-items: center;
    font-size: 14px;
    font-weight: 600;
}

.modal-close {
    background: none;
    border: none;
    color: white;
    font-size: 20px;
    cursor: pointer;
    width: 24px;
    height: 24px;
    display: flex;
    align-items: center;
    justify-content: center;
}

.modal-close:hover {
    background: rgba(255, 255, 255, 0.2);
}

.modal-body {
    padding: 20px;
    overflow-y: auto;
    flex: 1;
}

.modal-footer {
    padding: 12px 20px;
    border-top: 1px solid #dee2e6;
    display: flex;
    gap: 8px;
    justify-content: flex-end;
}

.form-group {
    margin-bottom: 16px;
}

.error-message {
    color: #dc3545;
    font-size: 12px;
    margin-top: 4px;
    display: none;
}

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
</style>

<script>
let currentEditId = null;

function updateSelection() {
    // Function for checkbox selection handling
}

function toggleAll(checkbox) {
    const checkboxes = document.querySelectorAll('input[name="selected_products[]"]');
    checkboxes.forEach(cb => {
        cb.checked = checkbox.checked;
    });
}

function openCreateModal() {
    document.getElementById('createModal').style.display = 'flex';
    document.getElementById('create_name').focus();
}

function closeCreateModal() {
    document.getElementById('createModal').style.display = 'none';
    document.getElementById('createForm').reset();
    clearErrors('create');
}

function openEditModal(productId) {
    // Fetch product data
    fetch(`/admin/products-data/${productId}`, {
        headers: {
            'X-Requested-With': 'XMLHttpRequest'
        }
    })
        .then(response => response.json())
        .then(data => {
            currentEditId = productId;
            document.getElementById('edit_name').value = data.name;
            document.getElementById('edit_code').value = data.code;
            document.getElementById('edit_stock_quantity').value = data.stock_quantity;
            document.getElementById('edit_pieces_per_carton').value = data.pieces_per_carton;
            document.getElementById('edit_piece_weight').value = data.piece_weight;
            document.getElementById('edit_carton_weight').value = data.carton_weight;
            document.getElementById('edit_supplier_id').value = data.supplier_id;
            document.getElementById('edit_category_id').value = data.category_id;
            document.getElementById('edit_purchase_price').value = data.purchase_price;
            document.getElementById('edit_sale_price').value = data.sale_price;
            document.getElementById('edit_last_purchase_date').value = data.last_purchase_date || '';
            document.getElementById('edit_last_sale_date').value = data.last_sale_date || '';

            // Show current image
            const currentImageDiv = document.getElementById('current_image');
            if (data.image) {
                currentImageDiv.innerHTML = `<img src="/storage/${data.image}" style="width: 60px; height: 60px; object-fit: cover; border: 1px solid #ddd;" alt="الصورة الحالية">`;
            } else {
                currentImageDiv.innerHTML = '<span style="color: #666; font-size: 12px;">لا توجد صورة حالية</span>';
            }

            document.getElementById('editForm').action = `/admin/products/${productId}`;
            document.getElementById('editModal').style.display = 'flex';
            document.getElementById('edit_name').focus();
        })
        .catch(error => {
            console.error('Error:', error);
            alert('حدث خطأ أثناء جلب البيانات');
        });
}

function closeEditModal() {
    document.getElementById('editModal').style.display = 'none';
    document.getElementById('editForm').reset();
    clearErrors('edit');
    currentEditId = null;
}

function showProduct(productId) {
    // Fetch product data
    fetch(`/admin/products-data/${productId}`, {
        headers: {
            'X-Requested-With': 'XMLHttpRequest'
        }
    })
        .then(response => response.json())
        .then(data => {
            document.getElementById('show_name').textContent = data.name;
            document.getElementById('show_code').textContent = data.code;

            // Show barcode
            JsBarcode('#show_barcode_canvas', data.code, {
                format: "CODE128",
                width: 2,
                height: 60,
                displayValue: true,
                fontSize: 14
            });
            document.getElementById('show_stock_quantity').textContent = data.stock_quantity;
            document.getElementById('show_pieces_per_carton').textContent = data.pieces_per_carton;
            document.getElementById('show_piece_weight').textContent = data.piece_weight + ' جم';
            document.getElementById('show_carton_weight').textContent = data.carton_weight + ' كغ';
            document.getElementById('show_supplier').textContent = data.supplier_name;
            document.getElementById('show_category').textContent = data.category_name;
            document.getElementById('show_purchase_price').textContent = data.purchase_price + ' د.ع';
            document.getElementById('show_sale_price').textContent = data.sale_price + ' د.ع';
            document.getElementById('show_last_purchase_date').textContent = data.last_purchase_date || '-';
            document.getElementById('show_last_sale_date').textContent = data.last_sale_date || '-';
            document.getElementById('show_created_at').textContent = data.created_at;

            // Show image
            const imageContainer = document.getElementById('show_image_container');
            if (data.image) {
                imageContainer.innerHTML = `<img src="/storage/${data.image}" style="max-width: 200px; max-height: 200px; border: 1px solid #ddd;" alt="${data.name}">`;
            } else {
                imageContainer.innerHTML = '<div style="color: #666; font-style: italic;">لا توجد صورة</div>';
            }

            document.getElementById('showModal').style.display = 'flex';
        })
        .catch(error => {
            console.error('Error:', error);
            alert('حدث خطأ أثناء جلب البيانات');
        });
}

function closeShowModal() {
    document.getElementById('showModal').style.display = 'none';
}

function editSelected() {
    const selected = document.querySelectorAll('input[name="selected_products[]"]:checked');
    if (selected.length === 1) {
        openEditModal(selected[0].value);
    } else if (selected.length === 0) {
        alert('يرجى تحديد مادة للتعديل');
    } else {
        alert('يرجى تحديد مادة واحدة فقط للتعديل');
    }
}

function submitCreateForm() {
    const form = document.getElementById('createForm');
    const formData = new FormData(form);

    clearErrors('create');

    fetch(form.action, {
        method: 'POST',
        body: formData,
        headers: {
            'X-CSRF-TOKEN': document.querySelector('meta[name="csrf-token"]').getAttribute('content'),
            'X-Requested-With': 'XMLHttpRequest'
        }
    })
    .then(response => response.json())
    .then(data => {
        if (data.success) {
            closeCreateModal();
            location.reload();
        } else {
            showErrors('create', data.errors);
        }
    })
    .catch(error => {
        console.error('Error:', error);
        alert('حدث خطأ أثناء الحفظ');
    });
}

function submitEditForm() {
    const form = document.getElementById('editForm');
    const formData = new FormData(form);

    clearErrors('edit');

    fetch(form.action, {
        method: 'POST',
        body: formData,
        headers: {
            'X-CSRF-TOKEN': document.querySelector('meta[name="csrf-token"]').getAttribute('content'),
            'X-Requested-With': 'XMLHttpRequest'
        }
    })
    .then(response => response.json())
    .then(data => {
        if (data.success) {
            closeEditModal();
            location.reload();
        } else {
            showErrors('edit', data.errors);
        }
    })
    .catch(error => {
        console.error('Error:', error);
        alert('حدث خطأ أثناء الحفظ');
    });
}

function showErrors(prefix, errors) {
    for (const [field, messages] of Object.entries(errors)) {
        const errorElement = document.getElementById(`${prefix}_${field}_error`);
        if (errorElement) {
            errorElement.textContent = messages[0];
            errorElement.style.display = 'block';
        }
    }
}

function clearErrors(prefix) {
    const errorElements = document.querySelectorAll(`[id^="${prefix}_"][id$="_error"]`);
    errorElements.forEach(element => {
        element.style.display = 'none';
        element.textContent = '';
    });
}

function deleteSelected() {
    const selected = document.querySelectorAll('input[name="selected_products[]"]:checked');
    if (selected.length === 0) {
        alert('يرجى تحديد مواد للحذف');
        return;
    }

    if (confirm(`هل أنت متأكد من حذف ${selected.length} مادة؟`)) {
        // يمكن تنفيذ الحذف المتعدد هنا
        alert('تم تنفيذ الحذف');
    }
}

function clearSearch() {
    document.getElementById('searchInput').value = '';
    document.getElementById('clearBtn').style.display = 'none';
    window.location.href = '{{ route("admin.products.index") }}';
}

function liveSearch() {
    const searchTerm = document.getElementById('searchInput').value;
    const clearBtn = document.getElementById('clearBtn');

    if (searchTerm.length > 0) {
        clearBtn.style.display = 'inline-block';

        // Local search
        const rows = document.querySelectorAll('tbody tr');
        rows.forEach(row => {
            const text = row.textContent.toLowerCase();
            if (text.includes(searchTerm.toLowerCase())) {
                row.style.display = '';
            } else {
                row.style.display = 'none';
            }
        });
    } else {
        clearBtn.style.display = 'none';
        // Show all rows
        const rows = document.querySelectorAll('tbody tr');
        rows.forEach(row => {
            row.style.display = '';
        });
    }
}

// Close modal when clicking outside
document.addEventListener('click', function(e) {
    const createModal = document.getElementById('createModal');
    const editModal = document.getElementById('editModal');
    const showModal = document.getElementById('showModal');

    if (e.target === createModal) {
        closeCreateModal();
    }
    if (e.target === editModal) {
        closeEditModal();
    }
    if (e.target === showModal) {
        closeShowModal();
    }
});

// Close modal with Escape key
document.addEventListener('keydown', function(e) {
    if (e.key === 'Escape') {
        closeCreateModal();
        closeEditModal();
        closeShowModal();
    }
});

// Barcode functions
let currentScanTarget = null;
let scannerStream = null;

function generateBarcode(prefix) {
    // Generate random barcode (13 digits)
    const timestamp = Date.now().toString();
    const random = Math.floor(Math.random() * 1000).toString().padStart(3, '0');
    const barcode = (timestamp.slice(-10) + random).slice(0, 13);

    document.getElementById(`${prefix}_code`).value = barcode;

    // Show barcode preview
    const previewDiv = document.getElementById(`${prefix}_barcode_preview`);
    previewDiv.innerHTML = '<canvas id="' + prefix + '_barcode_canvas"></canvas>';

    JsBarcode('#' + prefix + '_barcode_canvas', barcode, {
        format: "EAN13",
        width: 1,
        height: 50,
        displayValue: true,
        fontSize: 12
    });
}

function scanBarcode(prefix) {
    currentScanTarget = prefix;
    const scannerModal = document.getElementById('scannerModal');
    if (!scannerModal) {
        alert('خطأ: لا يمكن العثور على نافذة الماسح الضوئي');
        return;
    }
    scannerModal.style.display = 'flex';
    startCamera();
}

function startCamera() {
    const video = document.getElementById('scanner-video');
    const loadingDiv = document.getElementById('scanner-loading');

    if (!video || !loadingDiv) {
        alert('خطأ: لا يمكن العثور على عناصر الماسح الضوئي');
        return;
    }

    if (!navigator.mediaDevices || !navigator.mediaDevices.getUserMedia) {
        alert('عذراً، متصفحك لا يدعم استخدام الكاميرا. يرجى استخدام خاصية رفع الصورة بدلاً من ذلك.');
        loadingDiv.innerHTML = '<i class="fas fa-exclamation-triangle"></i> المتصفح لا يدعم الكاميرا';
        return;
    }

    navigator.mediaDevices.getUserMedia({ video: { facingMode: 'environment' } })
        .then(function(stream) {
            scannerStream = stream;
            video.srcObject = stream;
            video.play();
            loadingDiv.style.display = 'none';

            // Start Quagga scanner
            Quagga.init({
                inputStream: {
                    name: "Live",
                    type: "LiveStream",
                    target: video
                },
                decoder: {
                    readers: ["code_128_reader", "ean_reader", "ean_8_reader", "code_39_reader"]
                }
            }, function(err) {
                if (err) {
                    console.error('Quagga initialization failed:', err);
                    alert('فشل في تشغيل الماسح الضوئي');
                    return;
                }
                Quagga.start();
            });

            // Handle scan results
            Quagga.onDetected(function(data) {
                const code = data.codeResult.code;
                document.getElementById('scanned-code').textContent = code;
                document.getElementById('scanner-result').style.display = 'block';
                document.getElementById('use-scan-btn').style.display = 'inline-block';
            });
        })
        .catch(function(err) {
            console.error('Camera access failed:', err);
            loadingDiv.innerHTML = '<i class="fas fa-exclamation-triangle"></i> فشل في الوصول للكاميرا';
        });
}

function scanBarcodeFromFile(input) {
    const file = input.files[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = function(e) {
        const img = new Image();
        img.onload = function() {
            const canvas = document.createElement('canvas');
            const ctx = canvas.getContext('2d');
            canvas.width = img.width;
            canvas.height = img.height;
            ctx.drawImage(img, 0, 0);

            Quagga.decodeSingle({
                src: canvas.toDataURL(),
                numOfWorkers: 0,
                decoder: {
                    readers: ["code_128_reader", "ean_reader", "ean_8_reader", "code_39_reader"]
                }
            }, function(result) {
                if (result && result.codeResult) {
                    const code = result.codeResult.code;
                    document.getElementById('scanned-code').textContent = code;
                    document.getElementById('scanner-result').style.display = 'block';
                    document.getElementById('use-scan-btn').style.display = 'inline-block';
                } else {
                    alert('لم يتم العثور على باركود في الصورة');
                }
            });
        };
        img.src = e.target.result;
    };
    reader.readAsDataURL(file);
}

function useScanResult() {
    const scannedCode = document.getElementById('scanned-code').textContent;
    if (scannedCode && currentScanTarget) {
        document.getElementById(`${currentScanTarget}_code`).value = scannedCode;

        // Show barcode preview
        const previewDiv = document.getElementById(`${currentScanTarget}_barcode_preview`);
        previewDiv.innerHTML = '<canvas id="' + currentScanTarget + '_barcode_canvas_scanned"></canvas>';

        JsBarcode('#' + currentScanTarget + '_barcode_canvas_scanned', scannedCode, {
            format: "CODE128",
            width: 1,
            height: 50,
            displayValue: true,
            fontSize: 12
        });
    }
    closeScannerModal();
}

function closeScannerModal() {
    const scannerModal = document.getElementById('scannerModal');
    const scannerResult = document.getElementById('scanner-result');
    const useScanBtn = document.getElementById('use-scan-btn');
    const scannedCode = document.getElementById('scanned-code');

    if (scannerModal) scannerModal.style.display = 'none';
    if (scannerResult) scannerResult.style.display = 'none';
    if (useScanBtn) useScanBtn.style.display = 'none';
    if (scannedCode) scannedCode.textContent = '';

    // Stop camera
    if (scannerStream) {
        scannerStream.getTracks().forEach(track => track.stop());
        scannerStream = null;
    }

    // Stop Quagga
    Quagga.stop();

    currentScanTarget = null;
}

// Update barcode preview when code is typed manually
document.addEventListener('input', function(e) {
    if (e.target.id === 'create_code' || e.target.id === 'edit_code') {
        const prefix = e.target.id.replace('_code', '');
        const code = e.target.value;

        if (code.length >= 8) {
            const previewDiv = document.getElementById(`${prefix}_barcode_preview`);
            previewDiv.innerHTML = '<canvas id="' + prefix + '_barcode_canvas_manual"></canvas>';

            try {
                JsBarcode('#' + prefix + '_barcode_canvas_manual', code, {
                    format: "CODE128",
                    width: 1,
                    height: 50,
                    displayValue: true,
                    fontSize: 12
                });
            } catch (error) {
                previewDiv.innerHTML = '<small style="color: #dc3545;">كود غير صالح للباركود</small>';
            }
        }
    }
});

function printBarcode() {
    const canvas = document.getElementById('show_barcode_canvas');
    const productName = document.getElementById('show_name').textContent;
    const productCode = document.getElementById('show_code').textContent;

    // Create print window
    const printWindow = window.open('', '', 'width=400,height=600');
    printWindow.document.write(`
        <html>
        <head>
            <title>طباعة الباركود</title>
            <style>
                body {
                    font-family: Arial, sans-serif;
                    text-align: center;
                    padding: 20px;
                    margin: 0;
                }
                .barcode-label {
                    border: 1px solid #000;
                    padding: 15px;
                    margin: 10px auto;
                    width: 300px;
                }
                .product-name {
                    font-weight: bold;
                    margin-bottom: 10px;
                    font-size: 14px;
                }
                .product-code {
                    font-size: 12px;
                    margin-top: 5px;
                }
                @media print {
                    button { display: none; }
                }
            </style>
        </head>
        <body>
            <div class="barcode-label">
                <div class="product-name">${productName}</div>
                <img src="${canvas.toDataURL()}" style="max-width: 100%;">
                <div class="product-code">${productCode}</div>
            </div>
            <button onclick="window.print()">طباعة</button>
            <button onclick="window.close()">إغلاق</button>
        </body>
        </html>
    `);
    printWindow.document.close();
}
</script>
@endsection
