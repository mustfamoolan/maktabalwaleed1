@extends('layouts.desktop')

@section('title', 'خطط البيع - نظام إدارة المبيعات')

@section('page-title', 'إدارة خطط البيع')

@section('toolbar')
    <div class="toolbar-group">
        <button onclick="window.location.href='{{ route('admin.sales-plans.create') }}'" class="win-button primary">
            <i class="fas fa-plus"></i> خطة جديدة
        </button>
        <button onclick="window.location.href='{{ route('admin.dashboard') }}'" class="win-button">
            <i class="fas fa-home"></i> الرئيسية
        </button>
    </div>
@endsection

@section('content')
    <div class="main-split-container">
        <!-- القسم الرئيسي 80% -->
        <div class="plans-main-section">
            <!-- فلترة وبحث -->
            <div class="filter-section">
                <div class="filter-row">
                    <div class="form-group">
                        <input type="text" id="searchInput" placeholder="ابحث باسم الخطة..." class="win-input" style="width: 300px;">
                    </div>
                    <div class="form-group">
                        <select id="typeFilter" class="win-input">
                            <option value="">جميع الأنواع</option>
                            <option value="product">منتج</option>
                            <option value="category">فئة</option>
                            <option value="supplier">مورد</option>
                        </select>
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

            <!-- جدول خطط البيع -->
            <div class="excel-container">
                <table class="excel-table">
                    <thead>
                        <tr>
                            <th style="width: 5%;">#</th>
                            <th style="width: 20%;">اسم الخطة</th>
                            <th style="width: 10%;">النوع</th>
                            <th style="width: 15%;">الهدف</th>
                            <th style="width: 10%;">الكمية المطلوبة</th>
                            <th style="width: 10%;">نسبة الإنجاز %</th>
                            <th style="width: 10%;">فترة الخطة</th>
                            <th style="width: 8%;">الحالة</th>
                            <th style="width: 12%;">الإجراءات</th>
                        </tr>
                    </thead>
                    <tbody>
                        @forelse($salesPlans as $plan)
                        <tr onclick="showPlanDetails({{ $plan->id }}, '{{ addslashes($plan->name) }}', '{{ $plan->plan_type }}', '{{ $plan->targetable ? addslashes($plan->targetable->name) : 'غير محدد' }}', {{ $plan->target_quantity }}, {{ $plan->required_achievement_rate }}, '{{ $plan->start_date }}', '{{ $plan->end_date }}', {{ $plan->is_active ? 'true' : 'false' }})" style="cursor: pointer;">
                            <td>{{ $plan->id }}</td>
                            <td>{{ $plan->name }}</td>
                            <td>
                                @switch($plan->plan_type)
                                    @case('product')
                                        <span class="type-badge product">منتج</span>
                                        @break
                                    @case('category')
                                        <span class="type-badge category">فئة</span>
                                        @break
                                    @case('supplier')
                                        <span class="type-badge supplier">مورد</span>
                                        @break
                                @endswitch
                            </td>
                            <td>{{ $plan->targetable->name ?? 'غير محدد' }}</td>
                            <td>{{ number_format($plan->target_quantity, 0) }}</td>
                            <td>{{ $plan->required_achievement_rate }}%</td>
                            <td>{{ $plan->start_date }} إلى {{ $plan->end_date }}</td>
                            <td>
                                @if($plan->is_active)
                                    <span class="status-badge active">نشط</span>
                                @else
                                    <span class="status-badge inactive">غير نشط</span>
                                @endif
                            </td>
                            <td>
                                <div class="action-buttons">
                                    <button onclick="event.stopPropagation(); editPlan({{ $plan->id }})" class="action-btn edit" title="تعديل">
                                        <i class="fas fa-edit"></i>
                                    </button>
                                    <button onclick="event.stopPropagation(); deletePlan({{ $plan->id }})" class="action-btn delete" title="حذف">
                                        <i class="fas fa-trash"></i>
                                    </button>
                                </div>
                            </td>
                        </tr>
                        @empty
                        <tr>
                            <td colspan="9" class="empty-state">
                                <div class="empty-content">
                                    <i class="fas fa-chart-line" style="font-size: 48px; color: #ccc; margin-bottom: 16px;"></i>
                                    <h3>لا يوجد خطط بيع</h3>
                                    <p>قم بإضافة خطة بيع جديدة للبدء</p>
                                    <button onclick="window.location.href='{{ route('admin.sales-plans.create') }}'" class="win-button primary" style="margin-top: 16px;">
                                        <i class="fas fa-plus"></i> إضافة خطة جديدة
                                    </button>
                                </div>
                            </td>
                        </tr>
                        @endforelse
                    </tbody>
                </table>
            </div>

            <!-- التصفح -->
            @if($salesPlans->hasPages())
            <div class="pagination-container">
                {{ $salesPlans->links() }}
            </div>
            @endif
        </div>

        <!-- القسم الجانبي 20% -->
        <div class="plans-sidebar-section">
            <div class="sidebar-header">
                تفاصيل الخطة
            </div>
            <div class="sidebar-content">
                <!-- المحتوى الافتراضي -->
                <div id="default-info" class="sidebar-info">
                    <div class="info-hint">
                        <i class="fas fa-info-circle"></i>
                        انقر على أي خطة في الجدول لعرض تفاصيلها هنا
                    </div>
                </div>

                <!-- تفاصيل الخطة -->
                <div id="plan-details" class="sidebar-info" style="display: none;">
                    <div class="plan-header">
                        <button class="back-btn" onclick="hidePlanDetails()">
                            <i class="fas fa-arrow-right"></i>
                        </button>
                        <h4 id="plan-name">اسم الخطة</h4>
                    </div>

                    <div class="plan-info">
                        <div class="info-item">
                            <label>رقم الخطة:</label>
                            <span id="detail-plan-id">#0001</span>
                        </div>

                        <div class="info-item">
                            <label>اسم الخطة:</label>
                            <span id="detail-plan-name">-</span>
                        </div>

                        <div class="info-item">
                            <label>نوع الهدف:</label>
                            <span id="detail-plan-type">-</span>
                        </div>

                        <div class="info-item">
                            <label>الهدف:</label>
                            <span id="detail-target-name">-</span>
                        </div>

                        <div class="info-item">
                            <label>الكمية المطلوبة:</label>
                            <span id="detail-target-quantity">-</span>
                        </div>

                        <div class="info-item">
                            <label>نسبة الإنجاز المطلوبة:</label>
                            <span id="detail-achievement-rate">-</span>
                        </div>

                        <div class="info-item">
                            <label>فترة الخطة:</label>
                            <span id="detail-plan-period">-</span>
                        </div>

                        <div class="info-item">
                            <label>الحالة:</label>
                            <span id="detail-plan-status">-</span>
                        </div>
                    </div>

                    <div class="plan-actions">
                        <h5><i class="fas fa-cogs"></i> الإجراءات السريعة</h5>
                        <button class="action-button edit-btn" onclick="editPlanFromSidebar()">
                            <i class="fas fa-edit"></i> تعديل الخطة
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

.plans-main-section {
    width: 80%;
    background: white;
    overflow-y: auto;
    padding: 15px;
    display: flex;
    flex-direction: column;
}

.plans-sidebar-section {
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

/* جدول الخطط */
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

/* شارات النوع */
.type-badge {
    padding: 3px 6px;
    border-radius: 10px;
    font-size: 10px;
    font-weight: bold;
}

.type-badge.product {
    background: #e3f2fd;
    color: #1976d2;
    border: 1px solid #bbdefb;
}

.type-badge.category {
    background: #e8f5e8;
    color: #388e3c;
    border: 1px solid #c8e6c9;
}

.type-badge.supplier {
    background: #fff3e0;
    color: #f57c00;
    border: 1px solid #ffcc02;
}

/* حالة الخطة */
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

/* تفاصيل الخطة في الشريط الجانبي */
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

.plan-header {
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

.plan-header h4 {
    margin: 0;
    font-size: 14px;
    color: #495057;
    flex: 1;
}

.plan-actions {
    margin-top: 20px;
    padding: 10px;
    background: #f8f9fa;
    border-radius: 4px;
}

.plan-actions h5 {
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

    .plans-main-section, .plans-sidebar-section {
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
let selectedPlanId = null;

function showPlanDetails(id, name, type, targetName, targetQuantity, achievementRate, startDate, endDate, isActive) {
    selectedPlanId = id;

    // إخفاء المحتوى الافتراضي
    document.getElementById('default-info').style.display = 'none';
    document.getElementById('plan-details').style.display = 'block';

    // تحديث البيانات
    document.getElementById('plan-name').textContent = name;
    document.getElementById('detail-plan-id').textContent = '#' + String(id).padStart(4, '0');
    document.getElementById('detail-plan-name').textContent = name;

    // نوع الهدف
    let typeText = '';
    switch(type) {
        case 'product': typeText = 'منتج'; break;
        case 'category': typeText = 'فئة'; break;
        case 'supplier': typeText = 'مورد'; break;
    }
    document.getElementById('detail-plan-type').textContent = typeText;

    document.getElementById('detail-target-name').textContent = targetName;
    document.getElementById('detail-target-quantity').textContent = parseInt(targetQuantity).toLocaleString();
    document.getElementById('detail-achievement-rate').textContent = achievementRate + '%';
    document.getElementById('detail-plan-period').textContent = startDate + ' إلى ' + endDate;

    // تحديث الحالة
    const statusElement = document.getElementById('detail-plan-status');

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

function hidePlanDetails() {
    document.getElementById('default-info').style.display = 'block';
    document.getElementById('plan-details').style.display = 'none';
    selectedPlanId = null;

    // إزالة التحديد من جميع الصفوف
    document.querySelectorAll('.excel-table tbody tr').forEach(row => {
        row.classList.remove('selected');
    });
}

function editPlan(id) {
    window.location.href = `/admin/sales-plans/${id}/edit`;
}

function editPlanFromSidebar() {
    if (selectedPlanId) {
        editPlan(selectedPlanId);
    }
}

function deletePlan(id) {
    if (confirm('هل أنت متأكد من حذف هذه الخطة؟\nسيتم حذف جميع البيانات المرتبطة بها.')) {
        const form = document.createElement('form');
        form.method = 'POST';
        form.action = `/admin/sales-plans/${id}`;

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

document.getElementById('typeFilter').addEventListener('change', function() {
    // تنفيذ الفلترة - سيتم تطويره لاحقاً
});

document.getElementById('statusFilter').addEventListener('change', function() {
    // تنفيذ الفلترة - سيتم تطويره لاحقاً
});
</script>
@endsection
