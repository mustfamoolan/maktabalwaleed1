@extends('layouts.desktop')

@section('title', 'إضافة خطة بيع جديدة - نظام إدارة المبيعات')

@section('page-title', 'إضافة خطة بيع جديدة')

@section('toolbar')
    <div class="toolbar-group">
        <button onclick="savePlan()" class="win-button primary">
            <i class="fas fa-save"></i> حفظ الخطة
        </button>
        <button onclick="window.location.href='{{ route('admin.sales-plans.index') }}'" class="win-button">
            <i class="fas fa-arrow-left"></i> العودة للقائمة
        </button>
    </div>
@endsection

@section('content')
    <div class="main-split-container">
        <!-- القسم الرئيسي 80% -->
        <div class="plan-main-section">
            <form id="planForm" action="{{ route('admin.sales-plans.store') }}" method="POST">
                @csrf

                <!-- بيانات الخطة الأساسية -->
                <div class="plan-form-section">
                    <div class="section-header">
                        <h3><i class="fas fa-chart-line"></i> بيانات الخطة الأساسية</h3>
                    </div>

                    <div class="form-grid">
                        <div class="form-group full-width">
                            <label class="win-label required">اسم الخطة *</label>
                            <input type="text" name="name" id="name" class="win-input" value="{{ old('name') }}" required>
                            @error('name')
                                <div class="error-message">{{ $message }}</div>
                            @enderror
                            <small class="field-hint">اسم واضح ومميز لخطة البيع</small>
                        </div>
                    </div>

                    <div class="form-grid">
                        <div class="form-group">
                            <label class="win-label required">نوع الهدف *</label>
                            <select name="plan_type" id="plan_type" class="win-input" required onchange="updateTargetOptions()">
                                <option value="">اختر نوع الهدف</option>
                                <option value="product" {{ old('plan_type') == 'product' ? 'selected' : '' }}>منتج</option>
                                <option value="category" {{ old('plan_type') == 'category' ? 'selected' : '' }}>فئة</option>
                                <option value="supplier" {{ old('plan_type') == 'supplier' ? 'selected' : '' }}>مورد</option>
                            </select>
                            @error('plan_type')
                                <div class="error-message">{{ $message }}</div>
                            @enderror
                        </div>

                        <div class="form-group">
                            <label class="win-label required">الهدف *</label>
                            <select name="target_id" id="target_id" class="win-input" required>
                                <option value="">اختر الهدف أولاً نوع الهدف</option>
                            </select>
                            @error('target_id')
                                <div class="error-message">{{ $message }}</div>
                            @enderror
                        </div>
                    </div>
                </div>

                <!-- أهداف الخطة -->
                <div class="plan-form-section">
                    <div class="section-header">
                        <h3><i class="fas fa-target"></i> أهداف الخطة</h3>
                    </div>

                    <div class="form-grid">
                        <div class="form-group">
                            <label class="win-label required">الكمية المطلوبة *</label>
                            <input type="number" name="target_quantity" id="target_quantity" class="win-input" value="{{ old('target_quantity') }}" min="1" step="1" required>
                            @error('target_quantity')
                                <div class="error-message">{{ $message }}</div>
                            @enderror
                            <small class="field-hint">الكمية المستهدفة للبيع</small>
                        </div>

                        <div class="form-group">
                            <label class="win-label required">نسبة الإنجاز المطلوبة (%) *</label>
                            <input type="number" name="required_achievement_rate" id="required_achievement_rate" class="win-input" value="{{ old('required_achievement_rate', 70) }}" min="1" max="100" step="1" required>
                            @error('required_achievement_rate')
                                <div class="error-message">{{ $message }}</div>
                            @enderror
                            <small class="field-hint">النسبة المئوية المطلوبة لاستحقاق الراتب كاملاً</small>
                        </div>
                    </div>

                    <div class="form-grid">
                        <div class="form-group">
                            <label class="win-label">مكافأة الوحدة الإضافية (د.ع)</label>
                            <input type="number" name="bonus_per_extra_unit" id="bonus_per_extra_unit" class="win-input" value="{{ old('bonus_per_extra_unit', 0) }}" min="0" step="1000">
                            @error('bonus_per_extra_unit')
                                <div class="error-message">{{ $message }}</div>
                            @enderror
                            <small class="field-hint">مكافأة إضافية لكل وحدة تزيد عن المطلوب</small>
                        </div>
                    </div>
                </div>

                <!-- فترة الخطة -->
                <div class="plan-form-section">
                    <div class="section-header">
                        <h3><i class="fas fa-calendar"></i> فترة الخطة</h3>
                    </div>

                    <div class="form-grid">
                        <div class="form-group">
                            <label class="win-label required">تاريخ البداية *</label>
                            <input type="date" name="start_date" id="start_date" class="win-input" value="{{ old('start_date', date('Y-m-d')) }}" required>
                            @error('start_date')
                                <div class="error-message">{{ $message }}</div>
                            @enderror
                        </div>

                        <div class="form-group">
                            <label class="win-label required">تاريخ النهاية *</label>
                            <input type="date" name="end_date" id="end_date" class="win-input" value="{{ old('end_date') }}" required>
                            @error('end_date')
                                <div class="error-message">{{ $message }}</div>
                            @enderror
                        </div>
                    </div>

                    <div class="form-grid">
                        <div class="form-group">
                            <div class="checkbox-group">
                                <label class="checkbox-label">
                                    <input type="checkbox" name="is_active" id="is_active" value="1" checked>
                                    <span class="checkmark"></span>
                                    تفعيل الخطة مباشرة
                                </label>
                                <small class="field-hint">يمكن استخدام الخطة في حساب الرواتب</small>
                            </div>
                        </div>
                    </div>
                </div>
            </form>
        </div>

        <!-- القسم الجانبي 20% -->
        <div class="plan-sidebar-section">
            <div class="sidebar-header">
                معاينة البيانات
            </div>
            <div class="sidebar-content">
                <div class="preview-section">
                    <h4><i class="fas fa-eye"></i> معاينة سريعة</h4>

                    <div class="preview-item">
                        <label>اسم الخطة:</label>
                        <span id="preview-name">-</span>
                    </div>

                    <div class="preview-item">
                        <label>نوع الهدف:</label>
                        <span id="preview-type">-</span>
                    </div>

                    <div class="preview-item">
                        <label>الهدف:</label>
                        <span id="preview-target">-</span>
                    </div>

                    <div class="preview-item">
                        <label>الكمية المطلوبة:</label>
                        <span id="preview-quantity">-</span>
                    </div>

                    <div class="preview-item">
                        <label>نسبة الإنجاز المطلوبة:</label>
                        <span id="preview-achievement">-</span>
                    </div>

                    <div class="preview-item">
                        <label>مكافأة الوحدة الإضافية:</label>
                        <span id="preview-bonus">-</span>
                    </div>

                    <div class="preview-item">
                        <label>فترة الخطة:</label>
                        <span id="preview-period">-</span>
                    </div>

                    <div class="preview-item">
                        <label>الحالة:</label>
                        <span id="preview-status">نشط</span>
                    </div>
                </div>

                <div class="tips-section">
                    <h4><i class="fas fa-lightbulb"></i> نصائح</h4>
                    <ul class="tips-list">
                        <li>اختر اسماً واضحاً للخطة</li>
                        <li>حدد نوع الهدف بدقة</li>
                        <li>اختر كمية مناسبة ومنطقية</li>
                        <li>نسبة الإنجاز 70% تعني استحقاق 70% من الراتب</li>
                        <li>المكافأة الإضافية اختيارية</li>
                        <li>تأكد من صحة تواريخ الخطة</li>
                    </ul>
                </div>

                <div class="validation-section">
                    <h4><i class="fas fa-check-circle"></i> التحقق من البيانات</h4>
                    <div class="validation-items">
                        <div class="validation-item" id="validation-name">
                            <i class="fas fa-times text-danger"></i>
                            <span>اسم الخطة مطلوب</span>
                        </div>
                        <div class="validation-item" id="validation-type">
                            <i class="fas fa-times text-danger"></i>
                            <span>نوع الهدف مطلوب</span>
                        </div>
                        <div class="validation-item" id="validation-target">
                            <i class="fas fa-times text-danger"></i>
                            <span>الهدف مطلوب</span>
                        </div>
                        <div class="validation-item" id="validation-quantity">
                            <i class="fas fa-times text-danger"></i>
                            <span>الكمية المطلوبة</span>
                        </div>
                        <div class="validation-item" id="validation-dates">
                            <i class="fas fa-times text-danger"></i>
                            <span>تواريخ الخطة</span>
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

.plan-main-section {
    width: 80%;
    background: white;
    overflow-y: auto;
    padding: 20px;
}

.plan-sidebar-section {
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
    overflow-y: auto;
}

/* أقسام النموذج */
.plan-form-section {
    background: #f8f9fa;
    border: 1px solid #ddd;
    margin-bottom: 20px;
    border-radius: 4px;
}

.section-header {
    background: linear-gradient(to bottom, #0078d4, #106ebe);
    color: white;
    padding: 12px 15px;
    border-bottom: 1px solid #ddd;
}

.section-header h3 {
    margin: 0;
    font-size: 16px;
    font-weight: bold;
}

.section-header i {
    margin-left: 8px;
}

/* الشبكة والحقول */
.form-grid {
    display: grid;
    grid-template-columns: repeat(2, 1fr);
    gap: 20px;
    padding: 20px;
}

.form-group {
    display: flex;
    flex-direction: column;
}

.form-group.full-width {
    grid-column: 1 / -1;
}

.win-label.required::after {
    content: ' *';
    color: #dc3545;
}

.field-hint {
    color: #6c757d;
    font-size: 11px;
    margin-top: 4px;
}

.error-message {
    color: #dc3545;
    font-size: 11px;
    margin-top: 4px;
    font-weight: bold;
}

/* مربع الاختيار */
.checkbox-group {
    display: flex;
    flex-direction: column;
    gap: 8px;
}

.checkbox-label {
    display: flex;
    align-items: center;
    cursor: pointer;
    font-size: 14px;
}

.checkbox-label input[type="checkbox"] {
    margin-left: 8px;
}

/* الشريط الجانبي */
.preview-section, .tips-section, .validation-section {
    margin-bottom: 20px;
    padding: 10px;
    background: #f8f9fa;
    border-radius: 4px;
}

.preview-section h4, .tips-section h4, .validation-section h4 {
    margin: 0 0 10px 0;
    font-size: 12px;
    color: #495057;
    display: flex;
    align-items: center;
    gap: 5px;
}

.preview-item {
    display: flex;
    justify-content: space-between;
    margin-bottom: 8px;
    font-size: 12px;
}

.preview-item label {
    font-weight: bold;
    color: #495057;
}

.preview-item span {
    color: #212529;
}

.tips-list {
    margin: 0;
    padding-right: 15px;
    font-size: 11px;
    color: #6c757d;
}

.tips-list li {
    margin-bottom: 4px;
}

.validation-items {
    display: flex;
    flex-direction: column;
    gap: 5px;
}

.validation-item {
    display: flex;
    align-items: center;
    gap: 8px;
    font-size: 11px;
}

.text-danger {
    color: #dc3545;
}

.text-success {
    color: #28a745;
}

/* استجابة */
@media (max-width: 768px) {
    .main-split-container {
        flex-direction: column;
        height: auto;
    }

    .plan-main-section, .plan-sidebar-section {
        width: 100%;
    }

    .form-grid {
        grid-template-columns: 1fr;
    }
}
</style>
@endsection

@section('scripts')
<script>
// بيانات الأهداف
const targetData = {
    products: @json($products),
    categories: @json($categories),
    suppliers: @json($suppliers)
};

// معاينة البيانات في الوقت الفعلي
document.getElementById('name').addEventListener('input', function() {
    const value = this.value || '-';
    document.getElementById('preview-name').textContent = value;
    validateField('name', this.value.length >= 2);
});

document.getElementById('plan_type').addEventListener('change', function() {
    const value = this.value;
    let typeText = '-';
    switch(value) {
        case 'product': typeText = 'منتج'; break;
        case 'category': typeText = 'فئة'; break;
        case 'supplier': typeText = 'مورد'; break;
    }
    document.getElementById('preview-type').textContent = typeText;
    validateField('type', value !== '');
    updateTargetPreview();
});

document.getElementById('target_id').addEventListener('change', function() {
    updateTargetPreview();
    validateField('target', this.value !== '');
});

document.getElementById('target_quantity').addEventListener('input', function() {
    const value = this.value;
    const formattedValue = value ? parseInt(value).toLocaleString() : '-';
    document.getElementById('preview-quantity').textContent = formattedValue;
    validateField('quantity', parseInt(value) > 0);
});

document.getElementById('required_achievement_rate').addEventListener('input', function() {
    const value = this.value || '-';
    document.getElementById('preview-achievement').textContent = value + '%';
});

document.getElementById('bonus_per_extra_unit').addEventListener('input', function() {
    const value = this.value;
    const formattedValue = value ? parseInt(value).toLocaleString() + ' د.ع' : 'لا توجد';
    document.getElementById('preview-bonus').textContent = formattedValue;
});

document.getElementById('start_date').addEventListener('change', function() {
    updatePeriodPreview();
    validateDates();
});

document.getElementById('end_date').addEventListener('change', function() {
    updatePeriodPreview();
    validateDates();
});

document.getElementById('is_active').addEventListener('change', function() {
    const status = this.checked ? 'نشط' : 'غير نشط';
    document.getElementById('preview-status').textContent = status;
});

function updateTargetOptions() {
    const planType = document.getElementById('plan_type').value;
    const targetSelect = document.getElementById('target_id');

    // مسح الخيارات الحالية
    targetSelect.innerHTML = '<option value="">اختر الهدف</option>';

    if (planType) {
        let options = [];
        switch(planType) {
            case 'product': options = targetData.products; break;
            case 'category': options = targetData.categories; break;
            case 'supplier': options = targetData.suppliers; break;
        }

        options.forEach(option => {
            const optionElement = document.createElement('option');
            optionElement.value = option.id;
            // استخدام name_ar للفئات أو name للمنتجات والموردين
            optionElement.textContent = option.name_ar || option.name;
            targetSelect.appendChild(optionElement);
        });
    }
}

function updateTargetPreview() {
    const planType = document.getElementById('plan_type').value;
    const targetId = document.getElementById('target_id').value;

    if (planType && targetId) {
        const targetSelect = document.getElementById('target_id');
        const selectedOption = targetSelect.options[targetSelect.selectedIndex];
        document.getElementById('preview-target').textContent = selectedOption.text;
    } else {
        document.getElementById('preview-target').textContent = '-';
    }
}

function updatePeriodPreview() {
    const startDate = document.getElementById('start_date').value;
    const endDate = document.getElementById('end_date').value;

    if (startDate && endDate) {
        document.getElementById('preview-period').textContent = startDate + ' إلى ' + endDate;
    } else {
        document.getElementById('preview-period').textContent = '-';
    }
}

function validateField(fieldName, isValid) {
    const validationItem = document.getElementById('validation-' + fieldName);
    const icon = validationItem.querySelector('i');

    if (isValid) {
        icon.classList.remove('fa-times', 'text-danger');
        icon.classList.add('fa-check', 'text-success');
    } else {
        icon.classList.remove('fa-check', 'text-success');
        icon.classList.add('fa-times', 'text-danger');
    }
}

function validateDates() {
    const startDate = document.getElementById('start_date').value;
    const endDate = document.getElementById('end_date').value;

    const isValid = startDate && endDate && new Date(endDate) > new Date(startDate);
    validateField('dates', isValid);
}

function savePlan() {
    // التحقق من صحة البيانات
    const name = document.getElementById('name').value;
    const planType = document.getElementById('plan_type').value;
    const targetId = document.getElementById('target_id').value;
    const targetQuantity = document.getElementById('target_quantity').value;
    const startDate = document.getElementById('start_date').value;
    const endDate = document.getElementById('end_date').value;

    if (!name || name.length < 2) {
        alert('يرجى إدخال اسم الخطة (حرفين على الأقل)');
        document.getElementById('name').focus();
        return;
    }

    if (!planType) {
        alert('يرجى اختيار نوع الهدف');
        document.getElementById('plan_type').focus();
        return;
    }

    if (!targetId) {
        alert('يرجى اختيار الهدف');
        document.getElementById('target_id').focus();
        return;
    }

    if (!targetQuantity || parseInt(targetQuantity) <= 0) {
        alert('يرجى إدخال كمية مطلوبة صحيحة (أكبر من صفر)');
        document.getElementById('target_quantity').focus();
        return;
    }

    if (!startDate) {
        alert('يرجى تحديد تاريخ بداية الخطة');
        document.getElementById('start_date').focus();
        return;
    }

    if (!endDate) {
        alert('يرجى تحديد تاريخ نهاية الخطة');
        document.getElementById('end_date').focus();
        return;
    }

    if (new Date(endDate) <= new Date(startDate)) {
        alert('تاريخ النهاية يجب أن يكون بعد تاريخ البداية');
        document.getElementById('end_date').focus();
        return;
    }

    // إرسال النموذج
    document.getElementById('planForm').submit();
}

// التحقق الأولي عند تحميل الصفحة
document.addEventListener('DOMContentLoaded', function() {
    // تعيين القيم الافتراضية للمعاينة
    const name = document.getElementById('name').value;
    const planType = document.getElementById('plan_type').value;
    const targetQuantity = document.getElementById('target_quantity').value;
    const achievementRate = document.getElementById('required_achievement_rate').value;
    const bonusPerUnit = document.getElementById('bonus_per_extra_unit').value;
    const startDate = document.getElementById('start_date').value;
    const endDate = document.getElementById('end_date').value;

    if (name) document.getElementById('preview-name').textContent = name;
    if (targetQuantity) document.getElementById('preview-quantity').textContent = parseInt(targetQuantity).toLocaleString();
    if (achievementRate) document.getElementById('preview-achievement').textContent = achievementRate + '%';
    if (bonusPerUnit) document.getElementById('preview-bonus').textContent = parseInt(bonusPerUnit).toLocaleString() + ' د.ع';
    if (startDate) document.getElementById('preview-period').textContent = startDate + (endDate ? ' إلى ' + endDate : '');

    if (planType) {
        updateTargetOptions();
        let typeText = '';
        switch(planType) {
            case 'product': typeText = 'منتج'; break;
            case 'category': typeText = 'فئة'; break;
            case 'supplier': typeText = 'مورد'; break;
        }
        document.getElementById('preview-type').textContent = typeText;
    }
});
</script>
@endsection
