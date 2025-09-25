@extends('layouts.desktop')

@section('title', 'رواتب المندوبين - نظام إدارة المبيعات')

@section('page-title', 'إدارة رواتب المندوبين')

@section('toolbar')
    <div class="toolbar-group">
        <button onclick="window.location.href='{{ route('admin.salaries.create') }}'" class="win-button primary">
            <i class="fas fa-plus"></i> راتب جديد
        </button>
        <button onclick="window.location.href='{{ route('admin.dashboard') }}'" class="win-button">
            <i class="fas fa-home"></i> الرئيسية
        </button>
    </div>
@endsection

@section('content')
    <div class="main-split-container">
        <!-- القسم الرئيسي 80% -->
        <div class="salaries-main-section">
            <!-- فلترة وبحث -->
            <div class="filter-section">
                <div class="filter-row">
                    <div class="form-group">
                        <input type="text" id="searchInput" placeholder="ابحث باسم المندوب..." class="win-input" style="width: 300px;">
                    </div>
                    <div class="form-group">
                        <select id="statusFilter" class="win-input">
                            <option value="">جميع الحالات</option>
                            <option value="1">نشط</option>
                            <option value="0">غير نشط</option>
                        </select>
                    </div>
                </div>
            </div>

            <!-- جدول الرواتب -->
            <div class="excel-container">
                <table class="excel-table">
                    <thead>
                        <tr>
                            <th style="width: 5%;">#</th>
                            <th style="width: 25%;">اسم المندوب</th>
                            <th style="width: 15%;">الراتب الأساسي</th>
                            <th style="width: 15%;">تاريخ البداية</th>
                            <th style="width: 15%;">تاريخ النهاية</th>
                            <th style="width: 10%;">الحالة</th>
                            <th style="width: 15%;">الإجراءات</th>
                        </tr>
                    </thead>
                    <tbody>
                        @forelse($salaries as $salary)
                        <tr onclick="showSalaryDetails({{ $salary->id }}, '{{ addslashes($salary->representative->name) }}', '{{ number_format($salary->basic_salary, 0) }}', '{{ $salary->effective_from }}', '{{ $salary->effective_to }}', {{ $salary->is_active ? 'true' : 'false' }})" style="cursor: pointer;">
                            <td>{{ $salary->id }}</td>
                            <td>{{ $salary->representative->name }}</td>
                            <td>{{ number_format($salary->basic_salary, 0) }} د.ع</td>
                            <td>{{ $salary->effective_from }}</td>
                            <td>{{ $salary->effective_to ?? 'مفتوح' }}</td>
                            <td>
                                @if($salary->is_active)
                                    <span class="status-badge active">نشط</span>
                                @else
                                    <span class="status-badge inactive">غير نشط</span>
                                @endif
                            </td>
                            <td>
                                <div class="action-buttons">
                                    <button onclick="event.stopPropagation(); editSalary({{ $salary->id }})" class="action-btn edit" title="تعديل">
                                        <i class="fas fa-edit"></i>
                                    </button>
                                    <button onclick="event.stopPropagation(); deleteSalary({{ $salary->id }})" class="action-btn delete" title="حذف">
                                        <i class="fas fa-trash"></i>
                                    </button>
                                </div>
                            </td>
                        </tr>
                        @empty
                        <tr>
                            <td colspan="7" class="empty-state">
                                <div class="empty-content">
                                    <i class="fas fa-coins" style="font-size: 48px; color: #ccc; margin-bottom: 16px;"></i>
                                    <h3>لا يوجد رواتب</h3>
                                    <p>قم بإضافة راتب جديد للبدء</p>
                                    <button onclick="window.location.href='{{ route('admin.salaries.create') }}'" class="win-button primary" style="margin-top: 16px;">
                                        <i class="fas fa-plus"></i> إضافة راتب جديد
                                    </button>
                                </div>
                            </td>
                        </tr>
                        @endforelse
                    </tbody>
                </table>
            </div>

            <!-- التصفح -->
            @if($salaries->hasPages())
            <div class="pagination-container">
                {{ $salaries->links() }}
            </div>
            @endif
        </div>

        <!-- القسم الجانبي 20% -->
        <div class="salaries-sidebar-section">
            <div class="sidebar-header">
                تفاصيل الراتب
            </div>
            <div class="sidebar-content">
                <!-- المحتوى الافتراضي -->
                <div id="default-info" class="sidebar-info">
                    <div class="info-hint">
                        <i class="fas fa-info-circle"></i>
                        انقر على أي راتب في الجدول لعرض تفاصيله هنا
                    </div>
                </div>

                <!-- تفاصيل الراتب -->
                <div id="salary-details" class="sidebar-info" style="display: none;">
                    <div class="salary-header">
                        <button class="back-btn" onclick="hideSalaryDetails()">
                            <i class="fas fa-arrow-right"></i>
                        </button>
                        <h4 id="salary-representative-name">اسم المندوب</h4>
                    </div>

                    <div class="salary-info">
                        <div class="info-item">
                            <label>رقم الراتب:</label>
                            <span id="detail-salary-id">#0001</span>
                        </div>

                        <div class="info-item">
                            <label>اسم المندوب:</label>
                            <span id="detail-representative-name">-</span>
                        </div>

                        <div class="info-item">
                            <label>الراتب الأساسي:</label>
                            <span id="detail-basic-salary">-</span>
                        </div>

                        <div class="info-item">
                            <label>تاريخ البداية:</label>
                            <span id="detail-effective-from">-</span>
                        </div>

                        <div class="info-item">
                            <label>تاريخ النهاية:</label>
                            <span id="detail-effective-to">-</span>
                        </div>

                        <div class="info-item">
                            <label>الحالة:</label>
                            <span id="detail-salary-status">-</span>
                        </div>
                    </div>

                    <div class="salary-actions">
                        <h5><i class="fas fa-cogs"></i> الإجراءات السريعة</h5>
                        <button class="action-button edit-btn" onclick="editSalaryFromSidebar()">
                            <i class="fas fa-edit"></i> تعديل الراتب
                        </button>
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

.salaries-main-section {
    width: 80%;
    background: white;
    overflow-y: auto;
    padding: 15px;
    display: flex;
    flex-direction: column;
}

.salaries-sidebar-section {
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

/* فلترة وبحث */
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

/* جدول الرواتب */
.excel-container {
    flex: 1;
    overflow: auto;
}

.excel-table tbody tr:hover {
    background-color: #f8f9fa !important;
}

.excel-table tbody tr.selected {
    background-color: #e3f2fd !important;
}

/* حالة الراتب */
.status-badge {
    padding: 4px 8px;
    border-radius: 12px;
    font-size: 11px;
    font-weight: bold;
}

.status-badge.active {
    background: #d4edda;
    color: #155724;
    border: 1px solid #b7d4c4;
}

.status-badge.inactive {
    background: #f8d7da;
    color: #721c24;
    border: 1px solid #f1b0b7;
}

/* أزرار الإجراءات */
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

.action-btn.edit {
    color: #28a745;
}

.action-btn.delete {
    color: #dc3545;
}

/* حالة الفراغ */
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

/* تفاصيل الراتب في الشريط الجانبي */
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

.info-hint {
    margin-top: 50px;
    padding: 15px;
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

.salary-header {
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

.salary-header h4 {
    margin: 0;
    font-size: 14px;
    color: #495057;
    flex: 1;
}

.salary-actions {
    margin-top: 20px;
    padding: 10px;
    background: #f8f9fa;
    border-radius: 4px;
}

.salary-actions h5 {
    margin: 0 0 10px 0;
    font-size: 12px;
    color: #495057;
    display: flex;
    align-items: center;
    gap: 5px;
}

.action-button {
    display: block;
    width: 100%;
    padding: 8px 12px;
    margin-bottom: 5px;
    background: white;
    border: 1px solid #dee2e6;
    border-radius: 3px;
    text-align: right;
    cursor: pointer;
    font-size: 12px;
    color: #495057;
    transition: all 0.2s;
}

.action-button:hover {
    background: #e9ecef;
}

.action-button.edit-btn {
    color: #28a745;
    border-color: #28a745;
}

/* استجابة */
@media (max-width: 768px) {
    .main-split-container {
        flex-direction: column;
        height: auto;
    }

    .salaries-main-section, .salaries-sidebar-section {
        width: 100%;
    }

    .filter-row {
        flex-direction: column;
        align-items: stretch;
    }

    .filter-row .form-group {
        width: 100%;
    }
}
</style>
@endsection

@section('scripts')
<script>
let selectedSalaryId = null;

function showSalaryDetails(id, representativeName, basicSalary, effectiveFrom, effectiveTo, isActive) {
    selectedSalaryId = id;

    // إخفاء المحتوى الافتراضي
    document.getElementById('default-info').style.display = 'none';
    document.getElementById('salary-details').style.display = 'block';

    // تحديث البيانات
    document.getElementById('salary-representative-name').textContent = representativeName;
    document.getElementById('detail-salary-id').textContent = '#' + String(id).padStart(4, '0');
    document.getElementById('detail-representative-name').textContent = representativeName;
    document.getElementById('detail-basic-salary').textContent = basicSalary + ' د.ع';
    document.getElementById('detail-effective-from').textContent = effectiveFrom;
    document.getElementById('detail-effective-to').textContent = effectiveTo || 'مفتوح';

    // تحديث الحالة
    const statusElement = document.getElementById('detail-salary-status');

    if (isActive) {
        statusElement.innerHTML = '<span class="status-badge active">نشط</span>';
    } else {
        statusElement.innerHTML = '<span class="status-badge inactive">غير نشط</span>';
    }

    // إضافة تحديد للصف
    document.querySelectorAll('.excel-table tbody tr').forEach(row => {
        row.classList.remove('selected');
    });
    event.target.closest('tr').classList.add('selected');
}

function hideSalaryDetails() {
    document.getElementById('default-info').style.display = 'block';
    document.getElementById('salary-details').style.display = 'none';
    selectedSalaryId = null;

    // إزالة التحديد من جميع الصفوف
    document.querySelectorAll('.excel-table tbody tr').forEach(row => {
        row.classList.remove('selected');
    });
}

function editSalary(id) {
    window.location.href = `/admin/salaries/${id}/edit`;
}

function editSalaryFromSidebar() {
    if (selectedSalaryId) {
        editSalary(selectedSalaryId);
    }
}

function deleteSalary(id) {
    if (confirm('هل أنت متأكد من حذف هذا الراتب؟\nسيتم حذف جميع البيانات المرتبطة به.')) {
        const form = document.createElement('form');
        form.method = 'POST';
        form.action = `/admin/salaries/${id}`;

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
    // تنفيذ البحث - سيتم تطويره لاحقاً
});

document.getElementById('statusFilter').addEventListener('change', function() {
    // تنفيذ الفلترة - سيتم تطويره لاحقاً
});
</script>
@endsection
