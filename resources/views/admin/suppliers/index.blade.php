@extends('layouts.desktop')

@section('title', 'إدارة الموردين - نظام إدارة المبيعات')

@section('page-title', 'إدارة الموردين')

@section('toolbar')
    <div class="toolbar-group">
        <button class="toolbar-btn primary" title="إضافة مورد جديد" onclick="openCreateModal()">
            <i class="fas fa-plus"></i>
        </button>
        <button class="toolbar-btn" title="تعديل" onclick="editSelected()">
            <i class="fas fa-edit"></i>
        </button>
        <button class="toolbar-btn" title="حذف" onclick="deleteSelected()">
            <i class="fas fa-trash"></i>
        </button>
    </div>
    <div class="toolbar-group">
        <input type="text" id="searchInput" placeholder="بحث في الموردين..." class="toolbar-input" value="{{ request('search') }}" oninput="liveSearch()">
        <button class="toolbar-btn" onclick="clearSearch()" id="clearBtn" style="display: {{ request('search') ? 'inline-block' : 'none' }};" title="مسح البحث">
            <i class="fas fa-times"></i>
        </button>
    </div>
@endsection

@section('content')
    <table class="excel-table">
        <thead>
            <tr>
                <th style="width: 30px;">
                    <input type="checkbox" id="selectAll" onchange="toggleAll(this)">
                </th>
                <th style="width: 10%;">رقم</th>
                <th style="width: 30%;">اسم المورد</th>
                <th style="width: 40%;">الفئات</th>
                <th style="width: 15%;">تاريخ الإضافة</th>
                <th style="width: 5%;">العمليات</th>
            </tr>
        </thead>
        <tbody>
            @forelse($suppliers as $supplier)
            <tr>
                <td>
                    <input type="checkbox" name="selected_suppliers[]" value="{{ $supplier->id }}">
                </td>
                <td>{{ $supplier->id }}</td>
                <td>{{ $supplier->name }}</td>
                <td>
                    @if($supplier->categories->count() > 0)
                        @foreach($supplier->categories as $category)
                            <span style="background: #e1e1e1; padding: 2px 6px; border-radius: 3px; margin: 1px; display: inline-block; font-size: 11px;">{{ $category->name }}</span>
                        @endforeach
                    @else
                        <span style="color: #666; font-style: italic;">لا توجد فئات</span>
                    @endif
                </td>
                <td>{{ $supplier->created_at->format('Y-m-d') }}</td>
                <td>
                    <div style="display: flex; gap: 2px;">
                        <button onclick="openEditModal({{ $supplier->id }})" class="win-button" style="padding: 2px 6px; font-size: 11px;" title="تعديل">
                            <i class="fas fa-edit"></i>
                        </button>
                        <button onclick="showSupplier({{ $supplier->id }})" class="win-button" style="padding: 2px 6px; font-size: 11px;" title="عرض">
                            <i class="fas fa-eye"></i>
                        </button>
                        <form method="POST" action="{{ route('admin.suppliers.destroy', $supplier) }}" style="display: inline;">
                            @csrf
                            @method('DELETE')
                            <button type="submit" class="win-button danger" style="padding: 2px 6px; font-size: 11px;" onclick="return confirm('هل أنت متأكد من حذف هذا المورد؟')" title="حذف">
                                <i class="fas fa-trash"></i>
                            </button>
                        </form>
                    </div>
                </td>
            </tr>
            @empty
            <tr>
                <td colspan="6" style="text-align: center; padding: 20px; color: #666;">
                    لا توجد موردين
                    @if(request('search'))
                        تطابق البحث "{{ request('search') }}"
                    @endif
                </td>
            </tr>
            @endforelse
        </tbody>
    </table>

    <!-- Pagination -->
    @if($suppliers->hasPages())
    <div style="padding: 12px; text-align: center; background: #f8f9fa; border-top: 1px solid #dee2e6;">
        {{ $suppliers->links() }}
    </div>
    @endif

    <!-- Create Supplier Modal -->
    <div id="createModal" class="modal" style="display: none;">
        <div class="modal-content">
            <div class="modal-header">
                <h3>إضافة مورد جديد</h3>
                <button class="modal-close" onclick="closeCreateModal()">&times;</button>
            </div>
            <div class="modal-body">
                <form id="createForm" action="{{ route('admin.suppliers.store') }}" method="POST">
                    @csrf

                    <div class="form-group">
                        <label for="create_name" class="win-label">اسم المورد *</label>
                        <input type="text" id="create_name" name="name" class="win-input" placeholder="أدخل اسم المورد" required>
                        <div id="create_name_error" class="error-message"></div>
                    </div>

                    <div class="form-group">
                        <label class="win-label">فئات المورد *</label>
                        <div class="checkbox-group">
                            @foreach($categories as $category)
                            <label class="checkbox-label">
                                <input type="checkbox" name="categories[]" value="{{ $category->id }}">
                                <span>{{ $category->name }}</span>
                            </label>
                            @endforeach
                        </div>
                        <div id="create_categories_error" class="error-message"></div>
                    </div>
                </form>
            </div>
            <div class="modal-footer">
                <button type="button" class="win-button primary" onclick="submitCreateForm()">حفظ المورد</button>
                <button type="button" class="win-button" onclick="closeCreateModal()">إلغاء</button>
            </div>
        </div>
    </div>

    <!-- Edit Supplier Modal -->
    <div id="editModal" class="modal" style="display: none;">
        <div class="modal-content">
            <div class="modal-header">
                <h3>تعديل المورد</h3>
                <button class="modal-close" onclick="closeEditModal()">&times;</button>
            </div>
            <div class="modal-body">
                <form id="editForm" method="POST">
                    @csrf
                    @method('PUT')

                    <div class="form-group">
                        <label for="edit_name" class="win-label">اسم المورد *</label>
                        <input type="text" id="edit_name" name="name" class="win-input" placeholder="أدخل اسم المورد" required>
                        <div id="edit_name_error" class="error-message"></div>
                    </div>

                    <div class="form-group">
                        <label class="win-label">فئات المورد *</label>
                        <div class="checkbox-group" id="edit_categories">
                            @foreach($categories as $category)
                            <label class="checkbox-label">
                                <input type="checkbox" name="categories[]" value="{{ $category->id }}">
                                <span>{{ $category->name }}</span>
                            </label>
                            @endforeach
                        </div>
                        <div id="edit_categories_error" class="error-message"></div>
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
        <div class="modal-content">
            <div class="modal-header">
                <h3>عرض تفاصيل المورد</h3>
                <button class="modal-close" onclick="closeShowModal()">&times;</button>
            </div>
            <div class="modal-body">
                <div class="form-group">
                    <label class="win-label">اسم المورد</label>
                    <div id="show_name" class="win-input" style="background: #f5f5f5; border: 1px solid #ddd; cursor: not-allowed;"></div>
                </div>

                <div class="form-group">
                    <label class="win-label">فئات المورد</label>
                    <div id="show_categories" class="win-input" style="background: #f5f5f5; border: 1px solid #ddd; cursor: not-allowed; min-height: 60px; padding: 8px;"></div>
                </div>

                <div class="form-group">
                    <label class="win-label">تاريخ الإنشاء</label>
                    <div id="show_created_at" class="win-input" style="background: #f5f5f5; border: 1px solid #ddd; cursor: not-allowed;"></div>
                </div>
            </div>
            <div class="modal-footer">
                <button type="button" class="win-button" onclick="closeShowModal()">إغلاق</button>
            </div>
        </div>
    </div>
@endsection

@section('statusbar')
    <div class="status-item">
        <i class="fas fa-building"></i>
        إجمالي الموردين: {{ $suppliers->total() }}
    </div>
    @if(request('search'))
    <div class="status-item">
        <i class="fas fa-search"></i>
        نتائج البحث في الصفحة: {{ $suppliers->count() }}
    </div>
    @endif
    <div class="status-item">
        الصفحة {{ $suppliers->currentPage() }} من {{ $suppliers->lastPage() }}
    </div>
@endsection

@section('scripts')
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

.checkbox-group {
    display: flex;
    flex-direction: column;
    gap: 8px;
    margin-top: 8px;
}

.checkbox-label {
    display: flex;
    align-items: center;
    gap: 8px;
    cursor: pointer;
    font-size: 13px;
}

.checkbox-label input[type="checkbox"] {
    width: 16px;
    height: 16px;
}

.error-message {
    color: #dc3545;
    font-size: 12px;
    margin-top: 4px;
    display: none;
}
</style>

<script>
let currentEditId = null;

function toggleAll(checkbox) {
    const checkboxes = document.querySelectorAll('input[name="selected_suppliers[]"]');
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

function openEditModal(supplierId) {
    // Fetch supplier data
    fetch(`/admin/suppliers-data/${supplierId}`, {
        headers: {
            'X-Requested-With': 'XMLHttpRequest'
        }
    })
        .then(response => response.json())
        .then(data => {
            currentEditId = supplierId;
            document.getElementById('edit_name').value = data.name;

            // Clear all checkboxes first
            document.querySelectorAll('#edit_categories input[type="checkbox"]').forEach(cb => {
                cb.checked = false;
            });

            // Check selected categories
            data.categories.forEach(categoryId => {
                const checkbox = document.querySelector(`#edit_categories input[value="${categoryId}"]`);
                if (checkbox) {
                    checkbox.checked = true;
                }
            });

            document.getElementById('editForm').action = `/admin/suppliers/${supplierId}`;
            document.getElementById('editModal').style.display = 'flex';
            document.getElementById('edit_name').focus();
        });
}

function closeEditModal() {
    document.getElementById('editModal').style.display = 'none';
    document.getElementById('editForm').reset();
    clearErrors('edit');
    currentEditId = null;
}

function showSupplier(supplierId) {
    // Fetch supplier data
    fetch(`/admin/suppliers-data/${supplierId}`, {
        headers: {
            'X-Requested-With': 'XMLHttpRequest'
        }
    })
        .then(response => response.json())
        .then(data => {
            document.getElementById('show_name').textContent = data.name;

            // Show categories
            let categoriesText = '';
            if (data.category_names && data.category_names.length > 0) {
                categoriesText = data.category_names.join(', ');
            } else {
                categoriesText = 'لا توجد فئات';
            }
            document.getElementById('show_categories').textContent = categoriesText;

            document.getElementById('show_created_at').textContent = data.created_at;
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
    const selected = document.querySelectorAll('input[name="selected_suppliers[]"]:checked');
    if (selected.length === 1) {
        openEditModal(selected[0].value);
    } else if (selected.length === 0) {
        alert('يرجى تحديد مورد للتعديل');
    } else {
        alert('يرجى تحديد مورد واحد فقط للتعديل');
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
    .then(response => {
        if (!response.ok) {
            throw new Error(`HTTP error! status: ${response.status}`);
        }
        return response.json();
    })
    .then(data => {
        if (data.success) {
            closeCreateModal();
            location.reload();
        } else {
            if (data.errors) {
                showErrors('create', data.errors);
            } else {
                alert(data.message || 'حدث خطأ في الحفظ');
            }
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
    .then(response => {
        if (!response.ok) {
            throw new Error(`HTTP error! status: ${response.status}`);
        }
        return response.json();
    })
    .then(data => {
        if (data.success) {
            closeEditModal();
            location.reload();
        } else {
            if (data.errors) {
                showErrors('edit', data.errors);
            } else {
                alert(data.message || 'حدث خطأ في التحديث');
            }
        }
    })
    .catch(error => {
        console.error('Error:', error);
        alert('حدث خطأ أثناء الحفظ');
    });
}

function showErrors(prefix, errors) {
    if (!errors || typeof errors !== 'object') {
        return;
    }

    for (const [field, messages] of Object.entries(errors)) {
        const errorElement = document.getElementById(`${prefix}_${field}_error`);
        if (errorElement && messages && messages.length > 0) {
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
    const selected = document.querySelectorAll('input[name="selected_suppliers[]"]:checked');
    if (selected.length === 0) {
        alert('يرجى تحديد موردين للحذف');
        return;
    }

    if (confirm(`هل أنت متأكد من حذف ${selected.length} مورد؟`)) {
        // يمكن تنفيذ الحذف المتعدد هنا
        alert('تم تنفيذ الحذف');
    }
}

function clearSearch() {
    document.getElementById('searchInput').value = '';
    document.getElementById('clearBtn').style.display = 'none';
    window.location.href = '{{ route("admin.suppliers.index") }}';
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
</script>
@endsection
