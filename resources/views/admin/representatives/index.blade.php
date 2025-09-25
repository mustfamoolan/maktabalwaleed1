@extends('layouts.desktop')

@section('title', 'المندوبين - نظام إدارة المبيعات')

@section('page-title', 'إدارة المندوبين')

@section('toolbar')
    <div class="toolbar-group">
        <button onclick="window.location.href='{{ route('admin.representatives.create') }}'" class="win-button primary">
            <i class="fas fa-plus"></i> مندوب جديد
        </button>
        <button onclick="window.location.href='{{ route('admin.dashboard') }}'" class="win-button">
            <i class="fas fa-home"></i> الرئيسية
        </button>
    </div>
@endsection

@section('content')
    <div class="main-split-container">
        <!-- القسم الرئيسي 80% -->
        <div class="representatives-main-section">
            <!-- فلترة وبحث -->
            <div class="filter-section">
                <div class="filter-row">
                    <div class="form-group">
                        <input type="text" id="searchInput" placeholder="ابحث باسم المندوب أو رقم الهاتف..." class="win-input" style="width: 300px;">
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

            <!-- جدول المندوبين -->
            <div class="excel-container">
                <table class="excel-table">
                    <thead>
                        <tr>
                            <th style="width: 5%;">#</th>
                            <th style="width: 25%;">اسم المندوب</th>
                            <th style="width: 20%;">رقم الهاتف</th>
                            <th style="width: 15%;">تاريخ الإنشاء</th>
                            <th style="width: 10%;">الحالة</th>
                            <th style="width: 25%;">الإجراءات</th>
                        </tr>
                    </thead>
                    <tbody>
                        @forelse($representatives as $representative)
                        <tr onclick="showRepresentativeDetails({{ $representative->id }}, '{{ addslashes($representative->name) }}', '{{ $representative->phone }}', '{{ $representative->created_at->format('Y-m-d H:i') }}', {{ $representative->is_active ? 'true' : 'false' }})" style="cursor: pointer;">
                            <td>{{ $representative->id }}</td>
                            <td>{{ $representative->name }}</td>
                            <td>{{ $representative->phone }}</td>
                            <td>{{ $representative->created_at->format('Y-m-d H:i') }}</td>
                            <td>
                                @if($representative->is_active)
                                    <span class="status-badge active">نشط</span>
                                @else
                                    <span class="status-badge inactive">غير نشط</span>
                                @endif
                            </td>
                            <td>
                                <div class="action-buttons">
                                    <button onclick="event.stopPropagation(); editRepresentative({{ $representative->id }})" class="action-btn edit" title="تعديل">
                                        <i class="fas fa-edit"></i>
                                    </button>
                                    <button onclick="event.stopPropagation(); manageSalaries({{ $representative->id }}, '{{ addslashes($representative->name) }}')" class="action-btn salary" title="إدارة الرواتب">
                                        <i class="fas fa-coins"></i>
                                    </button>
                                    <button onclick="event.stopPropagation(); managePlans({{ $representative->id }}, '{{ addslashes($representative->name) }}')" class="action-btn plans" title="إدارة الخطط">
                                        <i class="fas fa-chart-line"></i>
                                    </button>
                                    @if($representative->is_active)
                                    <button onclick="event.stopPropagation(); toggleStatus({{ $representative->id }}, false)" class="action-btn deactivate" title="إلغاء التفعيل">
                                        <i class="fas fa-user-slash"></i>
                                    </button>
                                    @else
                                    <button onclick="event.stopPropagation(); toggleStatus({{ $representative->id }}, true)" class="action-btn activate" title="تفعيل">
                                        <i class="fas fa-user-check"></i>
                                    </button>
                                    @endif
                                    <button onclick="event.stopPropagation(); deleteRepresentative({{ $representative->id }})" class="action-btn delete" title="حذف">
                                        <i class="fas fa-trash"></i>
                                    </button>
                                </div>
                            </td>
                        </tr>
                        @empty
                        <tr>
                            <td colspan="6" class="empty-state">
                                <div class="empty-content">
                                    <i class="fas fa-users" style="font-size: 48px; color: #ccc; margin-bottom: 16px;"></i>
                                    <h3>لا يوجد مندوبين</h3>
                                    <p>قم بإضافة مندوب جديد للبدء</p>
                                    <button onclick="window.location.href='{{ route('admin.representatives.create') }}'" class="win-button primary" style="margin-top: 16px;">
                                        <i class="fas fa-plus"></i> إضافة مندوب جديد
                                    </button>
                                </div>
                            </td>
                        </tr>
                        @endforelse
                    </tbody>
                </table>
            </div>

            <!-- التصفح -->
            @if($representatives->hasPages())
            <div class="pagination-container">
                {{ $representatives->links() }}
            </div>
            @endif
        </div>

        <!-- القسم الجانبي 20% -->
        <div class="representatives-sidebar-section">
            <div class="sidebar-header">
                تفاصيل المندوب
            </div>
            <div class="sidebar-content">
                <!-- المحتوى الافتراضي -->
                <div id="default-info" class="sidebar-info">
                    <div class="info-hint">
                        <i class="fas fa-info-circle"></i>
                        انقر على أي مندوب في الجدول لعرض تفاصيله هنا
                    </div>
                </div>

                <!-- تفاصيل المندوب -->
                <div id="representative-details" class="sidebar-info" style="display: none;">
                    <div class="representative-header">
                        <button class="back-btn" onclick="hideRepresentativeDetails()">
                            <i class="fas fa-arrow-right"></i>
                        </button>
                        <h4 id="representative-name">اسم المندوب</h4>
                    </div>

                    <div class="representative-info">
                        <div class="info-item">
                            <label>رقم المندوب:</label>
                            <span id="detail-representative-id">#0001</span>
                        </div>

                        <div class="info-item">
                            <label>اسم المندوب:</label>
                            <span id="detail-representative-name">-</span>
                        </div>

                        <div class="info-item">
                            <label>رقم الهاتف:</label>
                            <span id="detail-representative-phone">-</span>
                        </div>

                        <div class="info-item">
                            <label>تاريخ الإنشاء:</label>
                            <span id="detail-representative-date">-</span>
                        </div>

                        <div class="info-item">
                            <label>الحالة:</label>
                            <span id="detail-representative-status">-</span>
                        </div>
                    </div>

                    <div class="representative-actions">
                        <h5><i class="fas fa-cogs"></i> الإجراءات السريعة</h5>
                        <button class="action-button edit-btn" onclick="editRepresentativeFromSidebar()">
                            <i class="fas fa-edit"></i> تعديل البيانات
                        </button>
                        <button class="action-button status-btn" id="toggle-status-btn" onclick="toggleStatusFromSidebar()">
                            <i class="fas fa-user-check"></i> تغيير الحالة
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

.representatives-main-section {
    width: 80%;
    background: white;
    overflow-y: auto;
    padding: 15px;
    display: flex;
    flex-direction: column;
}

.representatives-sidebar-section {
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

/* جدول المندوبين */
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

/* حالة المندوب */
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

.action-btn.activate {
    color: #007bff;
}

.action-btn.deactivate {
    color: #ffc107;
}

.action-btn.salary {
    color: #28a745;
}

.action-btn.plans {
    color: #17a2b8;
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

/* تفاصيل المندوب في الشريط الجانبي */
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

.representative-header {
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

.representative-header h4 {
    margin: 0;
    font-size: 14px;
    color: #495057;
    flex: 1;
}

.representative-actions {
    margin-top: 20px;
    padding: 10px;
    background: #f8f9fa;
    border-radius: 4px;
}

.representative-actions h5 {
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

.action-button.status-btn {
    color: #007bff;
    border-color: #007bff;
}

/* استجابة */
@media (max-width: 768px) {
    .main-split-container {
        flex-direction: column;
        height: auto;
    }

    .representatives-main-section, .representatives-sidebar-section {
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
let selectedRepresentativeId = null;

function showRepresentativeDetails(id, name, phone, createdAt, isActive) {
    selectedRepresentativeId = id;

    // إخفاء المحتوى الافتراضي
    document.getElementById('default-info').style.display = 'none';
    document.getElementById('representative-details').style.display = 'block';

    // تحديث البيانات
    document.getElementById('representative-name').textContent = name;
    document.getElementById('detail-representative-id').textContent = '#' + String(id).padStart(4, '0');
    document.getElementById('detail-representative-name').textContent = name;
    document.getElementById('detail-representative-phone').textContent = phone;
    document.getElementById('detail-representative-date').textContent = createdAt;

    // تحديث الحالة
    const statusElement = document.getElementById('detail-representative-status');
    const toggleBtn = document.getElementById('toggle-status-btn');

    if (isActive) {
        statusElement.innerHTML = '<span class="status-badge active">نشط</span>';
        toggleBtn.innerHTML = '<i class="fas fa-user-slash"></i> إلغاء التفعيل';
    } else {
        statusElement.innerHTML = '<span class="status-badge inactive">غير نشط</span>';
        toggleBtn.innerHTML = '<i class="fas fa-user-check"></i> تفعيل';
    }

    // إضافة تحديد للصف
    document.querySelectorAll('.excel-table tbody tr').forEach(row => {
        row.classList.remove('selected');
    });
    event.target.closest('tr').classList.add('selected');
}

function hideRepresentativeDetails() {
    document.getElementById('default-info').style.display = 'block';
    document.getElementById('representative-details').style.display = 'none';
    selectedRepresentativeId = null;

    // إزالة التحديد من جميع الصفوف
    document.querySelectorAll('.excel-table tbody tr').forEach(row => {
        row.classList.remove('selected');
    });
}

function editRepresentative(id) {
    window.location.href = `/admin/representatives/${id}/edit`;
}

function editRepresentativeFromSidebar() {
    if (selectedRepresentativeId) {
        editRepresentative(selectedRepresentativeId);
    }
}

function toggleStatus(id, newStatus) {
    const action = newStatus ? 'تفعيل' : 'إلغاء تفعيل';
    if (confirm(`هل أنت متأكد من ${action} هذا المندوب؟`)) {
        // يمكن إضافة AJAX request هنا لاحقاً
        alert('سيتم تطوير هذه الوظيفة لاحقاً');
    }
}

function toggleStatusFromSidebar() {
    if (selectedRepresentativeId) {
        // تحديد الحالة الحالية من النص المعروض
        const currentStatus = document.getElementById('detail-representative-status').textContent.includes('نشط');
        toggleStatus(selectedRepresentativeId, !currentStatus);
    }
}

function deleteRepresentative(id) {
    if (confirm('هل أنت متأكد من حذف هذا المندوب؟\nسيتم حذف جميع البيانات المرتبطة به.')) {
        const form = document.createElement('form');
        form.method = 'POST';
        form.action = `/admin/representatives/${id}`;

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
document.addEventListener('DOMContentLoaded', function() {
    const searchInput = document.getElementById('searchInput');
    const statusFilter = document.getElementById('statusFilter');

    if (searchInput) {
        searchInput.addEventListener('input', function() {
            // تنفيذ البحث - سيتم تطويره لاحقاً
        });
    }

    if (statusFilter) {
        statusFilter.addEventListener('change', function() {
            // تنفيذ الفلترة - سيتم تطويره لاحقاً
        });
    }

    // إضافة event listeners للنماذج داخل DOMContentLoaded
    const salaryForm = document.getElementById('salary-form');
    if (salaryForm) {
        salaryForm.addEventListener('submit', function(e) {
            e.preventDefault();

            const formData = new FormData(this);
            formData.append('representative_id', currentRepresentativeId);

            fetch('/admin/salaries', {
                method: 'POST',
                body: formData,
                headers: {
                    'X-CSRF-TOKEN': document.querySelector('meta[name="csrf-token"]').getAttribute('content')
                }
            })
            .then(response => response.json())
            .then(data => {
                if(data.success) {
                    hideAddSalaryForm();
                    loadSalaries(currentRepresentativeId);
                    alert('تم حفظ الراتب بنجاح');
                } else {
                    alert(data.message || 'حدث خطأ في حفظ الراتب');
                }
            })
            .catch(error => {
                console.error('خطأ:', error);
                alert('حدث خطأ في حفظ الراتب');
            });
        });
    }

    const planForm = document.getElementById('plan-form');
    if (planForm) {
        planForm.addEventListener('submit', function(e) {
            e.preventDefault();

            const formData = new FormData(this);
            formData.append('representative_id', currentRepresentativeId);

            fetch('/admin/sales-plans', {
                method: 'POST',
                body: formData,
                headers: {
                    'X-CSRF-TOKEN': document.querySelector('meta[name="csrf-token"]').getAttribute('content')
                }
            })
            .then(response => response.json())
            .then(data => {
                if(data.success) {
                    hideAddPlanForm();
                    loadPlans(currentRepresentativeId);
                    alert('تم حفظ الخطة بنجاح');
                } else {
                    alert(data.message || 'حدث خطأ في حفظ الخطة');
                }
            })
            .catch(error => {
                console.error('خطأ:', error);
                alert('حدث خطأ في حفظ الخطة');
            });
        });
    }
});

// إدارة الرواتب
function manageSalaries(representativeId, representativeName) {
    document.getElementById('salary-rep-name').textContent = representativeName;
    currentRepresentativeId = representativeId;
    openModal('salary-modal');
    loadSalaries(representativeId);
}

// إدارة الخطط
function managePlans(representativeId, representativeName) {
    document.getElementById('plans-rep-name').textContent = representativeName;
    currentRepresentativeId = representativeId;
    openModal('plans-modal');
    loadPlans(representativeId);
}

// متغير لحفظ معرف المندوب الحالي
let currentRepresentativeId = null;

// فتح وإغلاق النماذج
function openModal(modalId) {
    document.getElementById(modalId).style.display = 'block';
}

function closeModal(modalId) {
    document.getElementById(modalId).style.display = 'none';
    // إخفاء النماذج المتداخلة
    if(modalId === 'salary-modal') hideAddSalaryForm();
    if(modalId === 'plans-modal') hideAddPlanForm();
}

// إدارة نموذج الراتب
function showAddSalaryForm() {
    document.getElementById('add-salary-form').style.display = 'block';
    // تعيين الشهر الحالي كافتراضي
    document.getElementById('salary_month').value = new Date().getMonth() + 1;
}

function hideAddSalaryForm() {
    document.getElementById('add-salary-form').style.display = 'none';
    document.getElementById('salary-form').reset();
}

// إدارة نموذج الخطة
function showAddPlanForm() {
    document.getElementById('add-plan-form').style.display = 'block';
}

function hideAddPlanForm() {
    document.getElementById('add-plan-form').style.display = 'none';
    document.getElementById('plan-form').reset();
}

// تحميل رواتب المندوب
function loadSalaries(representativeId) {
    fetch(`/admin/representatives/${representativeId}/salaries`)
        .then(response => {
            if (!response.ok) {
                throw new Error(`HTTP error! status: ${response.status}`);
            }
            const contentType = response.headers.get("content-type");
            if (contentType && contentType.indexOf("application/json") !== -1) {
                return response.json();
            } else {
                throw new Error("Received HTML instead of JSON");
            }
        })
        .then(data => {
            const tbody = document.querySelector('#salaries-table tbody');
            tbody.innerHTML = '';

            if(data.salaries && data.salaries.length > 0) {
                data.salaries.forEach(salary => {
                    tbody.innerHTML += `
                        <tr>
                            <td>${salary.year}/${salary.month.toString().padStart(2, '0')}</td>
                            <td>${parseFloat(salary.base_salary).toLocaleString('ar-SA')} ر.س</td>
                            <td>${parseFloat(salary.total_commission).toLocaleString('ar-SA')} ر.س</td>
                            <td>${parseFloat(salary.bonus).toLocaleString('ar-SA')} ر.س</td>
                            <td>${parseFloat(salary.deductions).toLocaleString('ar-SA')} ر.س</td>
                            <td><strong>${parseFloat(salary.net_salary).toLocaleString('ar-SA')} ر.س</strong></td>
                            <td>
                                <button onclick="editSalary(${salary.id})" class="btn btn-sm btn-warning">تعديل</button>
                                <button onclick="deleteSalary(${salary.id})" class="btn btn-sm btn-danger">حذف</button>
                            </td>
                        </tr>
                    `;
                });
            } else {
                tbody.innerHTML = '<tr><td colspan="7" class="text-center">لا توجد رواتب مسجلة</td></tr>';
            }
        })
        .catch(error => {
            console.error('خطأ في تحميل الرواتب:', error);
            const tbody = document.querySelector('#salaries-table tbody');
            tbody.innerHTML = '<tr><td colspan="7" class="text-center">خطأ في تحميل البيانات</td></tr>';
        });
}

// تحميل خطط المندوب
function loadPlans(representativeId) {
    fetch(`/admin/representatives/${representativeId}/plans`)
        .then(response => {
            if (!response.ok) {
                throw new Error(`HTTP error! status: ${response.status}`);
            }
            const contentType = response.headers.get("content-type");
            if (contentType && contentType.indexOf("application/json") !== -1) {
                return response.json();
            } else {
                throw new Error("Received HTML instead of JSON");
            }
        })
        .then(data => {
            const tbody = document.querySelector('#plans-table tbody');
            tbody.innerHTML = '';

            if(data.plans && data.plans.length > 0) {
                data.plans.forEach(plan => {
                    tbody.innerHTML += `
                        <tr>
                            <td>${plan.category_name}</td>
                            <td>${parseFloat(plan.target_quantity || 0).toLocaleString('ar-SA')}</td>
                            <td>${parseFloat(plan.required_achievement_rate || 0).toFixed(2)}%</td>
                            <td>${parseFloat(plan.bonus_per_extra_unit || 0).toLocaleString('ar-SA')} ر.س</td>
                            <td>${plan.start_date} - ${plan.end_date}</td>
                            <td>
                                <span class="status-badge ${plan.is_active ? 'active' : 'inactive'}">
                                    ${plan.is_active ? 'فعالة' : 'غير فعالة'}
                                </span>
                            </td>
                            <td>
                                <button onclick="editPlan(${plan.id})" class="btn btn-sm btn-warning">تعديل</button>
                                <button onclick="togglePlanStatus(${plan.id}, ${!plan.is_active})" class="btn btn-sm ${plan.is_active ? 'btn-secondary' : 'btn-success'}">
                                    ${plan.is_active ? 'إلغاء تفعيل' : 'تفعيل'}
                                </button>
                                <button onclick="deletePlan(${plan.id})" class="btn btn-sm btn-danger">حذف</button>
                            </td>
                        </tr>
                    `;
                });
            } else {
                tbody.innerHTML = '<tr><td colspan="7" class="text-center">لا توجد خطط مسجلة</td></tr>';
            }
        })
        .catch(error => {
            console.error('خطأ في تحميل الخطط:', error);
            const tbody = document.querySelector('#plans-table tbody');
            tbody.innerHTML = '<tr><td colspan="7" class="text-center">خطأ في تحميل البيانات</td></tr>';
        });
}

// تم نقل جميع event listeners إلى داخل DOMContentLoaded أعلاه

// حذف راتب
function deleteSalary(salaryId) {
    if(confirm('هل أنت متأكد من حذف هذا الراتب؟')) {
        fetch(`/admin/salaries/${salaryId}`, {
            method: 'DELETE',
            headers: {
                'X-CSRF-TOKEN': document.querySelector('meta[name="csrf-token"]').getAttribute('content')
            }
        })
        .then(response => response.json())
        .then(data => {
            if(data.success) {
                loadSalaries(currentRepresentativeId);
                alert('تم حذف الراتب بنجاح');
            } else {
                alert(data.message || 'حدث خطأ في حذف الراتب');
            }
        })
        .catch(error => {
            console.error('خطأ:', error);
            alert('حدث خطأ في حذف الراتب');
        });
    }
}

// حذف خطة
function deletePlan(planId) {
    if(confirm('هل أنت متأكد من حذف هذه الخطة؟')) {
        fetch(`/admin/sales-plans/${planId}`, {
            method: 'DELETE',
            headers: {
                'X-CSRF-TOKEN': document.querySelector('meta[name="csrf-token"]').getAttribute('content')
            }
        })
        .then(response => response.json())
        .then(data => {
            if(data.success) {
                loadPlans(currentRepresentativeId);
                alert('تم حذف الخطة بنجاح');
            } else {
                alert(data.message || 'حدث خطأ في حذف الخطة');
            }
        })
        .catch(error => {
            console.error('خطأ:', error);
            alert('حدث خطأ في حذف الخطة');
        });
    }
}

// تفعيل/إلغاء تفعيل خطة
function togglePlanStatus(planId, status) {
    fetch(`/admin/sales-plans/${planId}/toggle`, {
        method: 'POST',
        body: JSON.stringify({ is_active: status }),
        headers: {
            'Content-Type': 'application/json',
            'X-CSRF-TOKEN': document.querySelector('meta[name="csrf-token"]').getAttribute('content')
        }
    })
    .then(response => response.json())
    .then(data => {
        if(data.success) {
            loadPlans(currentRepresentativeId);
        } else {
            alert(data.message || 'حدث خطأ في تحديث حالة الخطة');
        }
    })
    .catch(error => {
        console.error('خطأ:', error);
        alert('حدث خطأ في تحديث حالة الخطة');
    });
}
</script>

<!-- Modal إدارة الرواتب -->
<div id="salary-modal" class="modal large-modal">
    <div class="modal-content">
        <div class="modal-header">
            <h2>إدارة رواتب المندوب: <span id="salary-rep-name"></span></h2>
            <button onclick="closeModal('salary-modal')" class="close-btn">&times;</button>
        </div>
        <div class="modal-body">
            <div class="salary-actions">
                <button onclick="showAddSalaryForm()" class="btn btn-primary">
                    <i class="fas fa-plus"></i> إضافة راتب جديد
                </button>
            </div>

            <!-- نموذج إضافة راتب -->
            <div id="add-salary-form" class="form-section" style="display: none;">
                <h3>إضافة راتب جديد</h3>
                <form id="salary-form">
                    <div class="form-row">
                        <div class="form-group">
                            <label for="salary_year">السنة:</label>
                            <input type="number" id="salary_year" name="year" value="{{ date('Y') }}" min="2020" max="2050" required>
                        </div>
                        <div class="form-group">
                            <label for="salary_month">الشهر:</label>
                            <select id="salary_month" name="month" required>
                                <option value="">اختر الشهر</option>
                                <option value="1">يناير</option>
                                <option value="2">فبراير</option>
                                <option value="3">مارس</option>
                                <option value="4">أبريل</option>
                                <option value="5">مايو</option>
                                <option value="6">يونيو</option>
                                <option value="7">يوليو</option>
                                <option value="8">أغسطس</option>
                                <option value="9">سبتمبر</option>
                                <option value="10">أكتوبر</option>
                                <option value="11">نوفمبر</option>
                                <option value="12">ديسمبر</option>
                            </select>
                        </div>
                    </div>
                    <div class="form-row">
                        <div class="form-group">
                            <label for="base_salary">الراتب الأساسي:</label>
                            <input type="number" id="base_salary" name="base_salary" step="0.01" min="0" required>
                        </div>
                        <div class="form-group">
                            <label for="total_commission">إجمالي العمولة:</label>
                            <input type="number" id="total_commission" name="total_commission" step="0.01" min="0" value="0">
                        </div>
                    </div>
                    <div class="form-row">
                        <div class="form-group">
                            <label for="bonus">المكافآت:</label>
                            <input type="number" id="bonus" name="bonus" step="0.01" min="0" value="0">
                        </div>
                        <div class="form-group">
                            <label for="deductions">الخصميات:</label>
                            <input type="number" id="deductions" name="deductions" step="0.01" min="0" value="0">
                        </div>
                    </div>
                    <div class="form-row">
                        <div class="form-group full-width">
                            <label for="notes">ملاحظات:</label>
                            <textarea id="notes" name="notes" rows="3"></textarea>
                        </div>
                    </div>
                    <div class="form-actions">
                        <button type="submit" class="btn btn-primary">حفظ الراتب</button>
                        <button type="button" onclick="hideAddSalaryForm()" class="btn btn-secondary">إلغاء</button>
                    </div>
                </form>
            </div>

            <!-- جدول الرواتب -->
            <div class="salaries-table">
                <h3>سجل الرواتب</h3>
                <div class="table-container">
                    <table class="data-table" id="salaries-table">
                        <thead>
                            <tr>
                                <th>التاريخ</th>
                                <th>الراتب الأساسي</th>
                                <th>العمولة</th>
                                <th>المكافآت</th>
                                <th>الخصميات</th>
                                <th>الصافي</th>
                                <th>الإجراءات</th>
                            </tr>
                        </thead>
                        <tbody>
                            <!-- سيتم تحميل البيانات ديناميكياً -->
                        </tbody>
                    </table>
                </div>
            </div>
        </div>
    </div>
</div>

<!-- Modal إدارة الخطط -->
<div id="plans-modal" class="modal large-modal">
    <div class="modal-content">
        <div class="modal-header">
            <h2>إدارة خطط المندوب: <span id="plans-rep-name"></span></h2>
            <button onclick="closeModal('plans-modal')" class="close-btn">&times;</button>
        </div>
        <div class="modal-body">
            <div class="plans-actions">
                <button onclick="showAddPlanForm()" class="btn btn-primary">
                    <i class="fas fa-plus"></i> إضافة خطة جديدة
                </button>
            </div>

            <!-- نموذج إضافة خطة -->
            <div id="add-plan-form" class="form-section" style="display: none;">
                <h3>إضافة خطة جديدة</h3>
                <form id="plan-form">
                    <div class="form-row">
                        <div class="form-group">
                            <label for="category_id">الصنف:</label>
                            <select id="category_id" name="category_id" required>
                                <option value="">اختر الصنف</option>
                                @foreach($categories as $category)
                                    <option value="{{ $category->id }}">{{ $category->name }}</option>
                                @endforeach
                            </select>
                        </div>
                        <div class="form-group">
                            <label for="period_type">نوع الفترة:</label>
                            <select id="period_type" name="period_type" required>
                                <option value="monthly">شهرية</option>
                                <option value="annual">سنوية</option>
                            </select>
                        </div>
                    </div>
                    <div class="form-row">
                        <div class="form-group">
                            <label for="target_amount">الهدف المالي:</label>
                            <input type="number" id="target_amount" name="target_amount" step="0.01" min="0" required>
                        </div>
                        <div class="form-group">
                            <label for="target_quantity">الكمية المستهدفة:</label>
                            <input type="number" id="target_quantity" name="target_quantity" min="0">
                        </div>
                    </div>
                    <div class="form-row">
                        <div class="form-group">
                            <label for="commission_rate">معدل العمولة (%):</label>
                            <input type="number" id="commission_rate" name="commission_rate" step="0.01" min="0" max="100" required>
                        </div>
                        <div class="form-group">
                            <label for="achievement_bonus">مكافأة تحقيق الهدف:</label>
                            <input type="number" id="achievement_bonus" name="achievement_bonus" step="0.01" min="0" value="0">
                        </div>
                    </div>
                    <div class="form-actions">
                        <button type="submit" class="btn btn-primary">حفظ الخطة</button>
                        <button type="button" onclick="hideAddPlanForm()" class="btn btn-secondary">إلغاء</button>
                    </div>
                </form>
            </div>

            <!-- جدول الخطط -->
            <div class="plans-table">
                <h3>خطط البيع</h3>
                <div class="table-container">
                    <table class="data-table" id="plans-table">
                        <thead>
                            <tr>
                                <th>الهدف</th>
                                <th>الكمية المستهدفة</th>
                                <th>نسبة الإنجاز المطلوبة</th>
                                <th>مكافأة الوحدة الإضافية</th>
                                <th>فترة الخطة</th>
                                <th>الحالة</th>
                                <th>الإجراءات</th>
                            </tr>
                        </thead>
                        <tbody>
                            <!-- سيتم تحميل البيانات ديناميكياً -->
                        </tbody>
                    </table>
                </div>
            </div>
        </div>
    </div>
</div>

<style>
/* تنسيق Modals الكبيرة */
.large-modal .modal-content {
    max-width: 1000px;
    width: 95%;
    max-height: 90vh;
    overflow-y: auto;
}

.modal-header {
    display: flex;
    justify-content: space-between;
    align-items: center;
    padding: 20px 30px;
    border-bottom: 1px solid #ddd;
    margin-bottom: 20px;
}

.close-btn {
    background: none;
    border: none;
    font-size: 24px;
    cursor: pointer;
    color: #999;
    padding: 0;
    width: 30px;
    height: 30px;
    display: flex;
    align-items: center;
    justify-content: center;
}

.close-btn:hover {
    color: #333;
}

.modal-body {
    padding: 0 30px 30px;
}

.form-section {
    background: #f8f9fa;
    padding: 20px;
    border-radius: 8px;
    margin: 20px 0;
}

.form-row {
    display: flex;
    gap: 20px;
    margin-bottom: 15px;
}

.form-group {
    flex: 1;
}

.form-group.full-width {
    flex: 100%;
}

.form-group label {
    display: block;
    margin-bottom: 5px;
    font-weight: bold;
    color: #333;
}

.form-group input,
.form-group select,
.form-group textarea {
    width: 100%;
    padding: 8px 12px;
    border: 1px solid #ddd;
    border-radius: 4px;
    font-size: 14px;
    transition: border-color 0.3s;
}

.form-group input:focus,
.form-group select:focus,
.form-group textarea:focus {
    outline: none;
    border-color: var(--primary-color);
}

.form-actions {
    display: flex;
    gap: 10px;
    justify-content: flex-end;
    margin-top: 20px;
    padding-top: 20px;
    border-top: 1px solid #ddd;
}

.salary-actions,
.plans-actions {
    margin-bottom: 20px;
}

.salaries-table h3,
.plans-table h3 {
    margin: 30px 0 15px 0;
    color: #333;
}

.table-container {
    overflow-x: auto;
}

.status-badge {
    padding: 4px 8px;
    border-radius: 12px;
    font-size: 12px;
    font-weight: bold;
}

.status-badge.active {
    background: #d4edda;
    color: #155724;
}

.status-badge.inactive {
    background: #f8d7da;
    color: #721c24;
}

.btn-sm {
    padding: 4px 8px;
    font-size: 12px;
    margin: 0 2px;
}

.btn-warning {
    background: #ffc107;
    color: #212529;
    border: none;
}

.btn-success {
    background: #28a745;
    color: white;
    border: none;
}

.btn-danger {
    background: #dc3545;
    color: white;
    border: none;
}

.btn-secondary {
    background: #6c757d;
    color: white;
    border: none;
}

.btn-sm:hover {
    opacity: 0.8;
}
</style>

@endsection
