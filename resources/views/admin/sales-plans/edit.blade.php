@extends('layouts.desktop')

@section('title', 'تعديل خطة المبيعات - نظام إدارة المبيعات')

@section('page-title', 'تعديل خطة المبيعات')

@section('toolbar')
    <div class="toolbar-group">
        <button onclick="saveSalesPlan()" class="win-button primary">
            <i class="fas fa-save"></i> حفظ التغييرات
        </button>
        <button onclick="window.location.href='{{ route('admin.sales-plans.index') }}'" class="win-button">
            <i class="fas fa-arrow-left"></i> العودة للقائمة
        </button>
    </div>
@endsection

@section('content')
    <div class="main-split-container">
        <!-- القسم الرئيسي 80% -->
        <div class="plans-main-section">
            <form id="planForm" action="{{ route('admin.sales-plans.update', $salesPlan->id) }}" method="POST">
                @csrf
                @method('PUT')

                <!-- بيانات الخطة الأساسية -->
                <div class="plan-form-section">
                    <div class="section-header">
                        <h3><i class="fas fa-target"></i> بيانات الخطة الأساسية</h3>
                    </div>

                    <div class="form-grid">
                        <div class="form-group">
                            <label class="win-label required">المندوب *</label>
                            <select name="representative_id" id="representative_id" class="win-input" required>
                                <option value="">اختر المندوب</option>
                                @foreach($representatives as $representative)
                                    <option value="{{ $representative->id }}" {{ ($salesPlan->representative_id == $representative->id) ? 'selected' : '' }}>
                                        {{ $representative->name }}
                                    </option>
                                @endforeach
                            </select>
                            @error('representative_id')
                                <div class="error-message">{{ $message }}</div>
                            @enderror
                        </div>

                        <div class="form-group">
                            <label class="win-label required">اسم الخطة *</label>
                            <input type="text" name="plan_name" id="plan_name" class="win-input" value="{{ $salesPlan->plan_name }}" required>
                            @error('plan_name')
                                <div class="error-message">{{ $message }}</div>
                            @enderror
                            <small class="field-hint">اسم واضح ومميز للخطة</small>
                        </div>
                    </div>

                    <div class="form-grid">
                        <div class="form-group">
                            <label class="win-label required">تاريخ البداية *</label>
                            <input type="date" name="start_date" id="start_date" class="win-input" value="{{ $salesPlan->start_date->format('Y-m-d') }}" required>
                            @error('start_date')
                                <div class="error-message">{{ $message }}</div>
                            @enderror
                        </div>

                        <div class="form-group">
                            <label class="win-label required">تاريخ النهاية *</label>
                            <input type="date" name="end_date" id="end_date" class="win-input" value="{{ $salesPlan->end_date->format('Y-m-d') }}" required>
                            @error('end_date')
                                <div class="error-message">{{ $message }}</div>
                            @enderror
                        </div>
                    </div>
                </div>

                <!-- الهدف المطلوب تحقيقه -->
                <div class="plan-form-section">
                    <div class="section-header">
                        <h3><i class="fas fa-bullseye"></i> الهدف المطلوب تحقيقه</h3>
                    </div>

                    <div class="form-grid">
                        <div class="form-group">
                            <label class="win-label required">نوع الهدف *</label>
                            <select name="target_type" id="target_type" class="win-input" required>
                                <option value="">اختر نوع الهدف</option>
                                <option value="Product" {{ ($salesPlan->target_type == 'Product') ? 'selected' : '' }}>منتج محدد</option>
                                <option value="SupplierCategory" {{ ($salesPlan->target_type == 'SupplierCategory') ? 'selected' : '' }}>صنف محدد</option>
                                <option value="Supplier" {{ ($salesPlan->target_type == 'Supplier') ? 'selected' : '' }}>مورد محدد</option>
                            </select>
                            @error('target_type')
                                <div class="error-message">{{ $message }}</div>
                            @enderror
                        </div>

                        <div class="form-group">
                            <label class="win-label required">الهدف المحدد *</label>
                            <select name="target_id" id="target_id" class="win-input" required>
                                <option value="">اختر الهدف أولاً من النوع</option>
                                <!-- سيتم ملء الخيارات باستخدام JavaScript -->
                            </select>
                            @error('target_id')
                                <div class="error-message">{{ $message }}</div>
                            @enderror
                        </div>
                    </div>

                    <div class="form-grid">
                        <div class="form-group">
                            <label class="win-label required">الكمية المطلوبة *</label>
                            <input type="number" name="target_quantity" id="target_quantity" class="win-input" value="{{ $salesPlan->target_quantity }}" min="1" step="1" required>
                            @error('target_quantity')
                                <div class="error-message">{{ $message }}</div>
                            @enderror
                            <small class="field-hint">العدد أو الكمية المطلوب بيعها</small>
                        </div>

                        <div class="form-group">
                            <label class="win-label required">المبلغ المطلوب (د.ع) *</label>
                            <input type="number" name="target_amount" id="target_amount" class="win-input" value="{{ $salesPlan->target_amount }}" min="0" step="1000" required>
                            @error('target_amount')
                                <div class="error-message">{{ $message }}</div>
                            @enderror
                            <small class="field-hint">إجمالي المبلغ المطلوب تحقيقه بالدينار العراقي</small>
                        </div>
                    </div>
                </div>

                <!-- حساب العمولة -->
                <div class="plan-form-section">
                    <div class="section-header">
                        <h3><i class="fas fa-percentage"></i> حساب العمولة</h3>
                    </div>

                    <div class="form-grid">
                        <div class="form-group">
                            <label class="win-label required">نسبة تحقيق الهدف المطلوبة (%) *</label>
                            <input type="number" name="required_achievement_percentage" id="required_achievement_percentage" class="win-input" value="{{ $salesPlan->required_achievement_percentage }}" min="1" max="100" step="1" required>
                            @error('required_achievement_percentage')
                                <div class="error-message">{{ $message }}</div>
                            @enderror
                            <small class="field-hint">النسبة المئوية المطلوب تحقيقها لاستحقاق العمولة</small>
                        </div>

                        <div class="form-group">
                            <label class="win-label required">نسبة العمولة (%) *</label>
                            <input type="number" name="commission_percentage" id="commission_percentage" class="win-input" value="{{ $salesPlan->commission_percentage }}" min="0" max="100" step="0.1" required>
                            @error('commission_percentage')
                                <div class="error-message">{{ $message }}</div>
                            @enderror
                            <small class="field-hint">نسبة العمولة من المبلغ المحقق</small>
                        </div>
                    </div>
                </div>

                <!-- معلومات إضافية -->
                <div class="plan-form-section">
                    <div class="section-header">
                        <h3><i class="fas fa-info-circle"></i> معلومات إضافية</h3>
                    </div>

                    <div class="form-grid">
                        <div class="form-group full-width">
                            <label class="win-label">ملاحظات</label>
                            <textarea name="notes" id="notes" class="win-input" rows="3">{{ $salesPlan->notes }}</textarea>
                            @error('notes')
                                <div class="error-message">{{ $message }}</div>
                            @enderror
                            <small class="field-hint">ملاحظات أو تعليمات خاصة بالخطة</small>
                        </div>
                    </div>

                    <div class="form-grid">
                        <div class="form-group">
                            <div class="checkbox-group">
                                <label class="checkbox-label">
                                    <input type="checkbox" name="is_active" id="is_active" value="1" {{ $salesPlan->is_active ? 'checked' : '' }}>
                                    <span class="checkmark"></span>
                                    تفعيل الخطة
                                </label>
                                <small class="field-hint">هل هذه الخطة نشطة ويتم العمل بها؟</small>
                            </div>
                        </div>
                    </div>
                </div>
            </form>
        </div>

        <!-- القسم الجانبي 20% -->
        <div class="plans-sidebar-section">
            <div class="sidebar-header">
                معاينة البيانات
            </div>
            <div class="sidebar-content">
                <div class="preview-section">
                    <h4><i class="fas fa-eye"></i> معاينة سريعة</h4>

                    <div class="preview-item">
                        <label>المندوب:</label>
                        <span id="preview-representative">{{ $salesPlan->representative->name }}</span>
                    </div>

                    <div class="preview-item">
                        <label>اسم الخطة:</label>
                        <span id="preview-plan-name">{{ $salesPlan->plan_name }}</span>
                    </div>

                    <div class="preview-item">
                        <label>نوع الهدف:</label>
                        <span id="preview-target-type">
                            @if($salesPlan->target_type == 'Product')
                                منتج محدد
                            @elseif($salesPlan->target_type == 'SupplierCategory')
                                صنف محدد
                            @elseif($salesPlan->target_type == 'Supplier')
                                مورد محدد
                            @endif
                        </span>
                    </div>

                    <div class="preview-item">
                        <label>الكمية المطلوبة:</label>
                        <span id="preview-target-quantity">{{ number_format($salesPlan->target_quantity) }}</span>
                    </div>

                    <div class="preview-item">
                        <label>المبلغ المطلوب:</label>
                        <span id="preview-target-amount">{{ number_format($salesPlan->target_amount) }} د.ع</span>
                    </div>

                    <div class="preview-item">
                        <label>نسبة التحقيق:</label>
                        <span id="preview-required-percentage">{{ $salesPlan->required_achievement_percentage }}%</span>
                    </div>

                    <div class="preview-item">
                        <label>نسبة العمولة:</label>
                        <span id="preview-commission">{{ $salesPlan->commission_percentage }}%</span>
                    </div>

                    <div class="preview-item">
                        <label>الحالة:</label>
                        <span id="preview-status">{{ $salesPlan->is_active ? 'نشطة' : 'غير نشطة' }}</span>
                    </div>
                </div>

                <div class="calculation-section">
                    <h4><i class="fas fa-calculator"></i> حساب العمولة المتوقعة</h4>
                    <div class="calculation-result">
                        <div class="calculation-item">
                            <label>الحد الأدنى للتحقيق:</label>
                            <span id="calc-min-target">{{ number_format($salesPlan->target_amount * $salesPlan->required_achievement_percentage / 100) }} د.ع</span>
                        </div>
                        <div class="calculation-item">
                            <label>العمولة المتوقعة:</label>
                            <span id="calc-expected-commission">{{ number_format($salesPlan->target_amount * $salesPlan->commission_percentage / 100) }} د.ع</span>
                        </div>
                    </div>
                </div>

                <div class="tips-section">
                    <h4><i class="fas fa-lightbulb"></i> نصائح</h4>
                    <ul class="tips-list">
                        <li>اختر نوع الهدف أولاً لإظهار الخيارات المتاحة</li>
                        <li>تأكد من توافق الكمية مع المبلغ المطلوب</li>
                        <li>نسبة التحقيق تحدد متى يستحق المندوب العمولة</li>
                        <li>نسبة العمولة تطبق على المبلغ المحقق فعلياً</li>
                        <li>يمكن إضافة ملاحظات للتوضيح</li>
                    </ul>
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
    padding: 20px;
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
.preview-section, .calculation-section, .tips-section {
    margin-bottom: 20px;
    padding: 10px;
    background: #f8f9fa;
    border-radius: 4px;
}

.preview-section h4, .calculation-section h4, .tips-section h4 {
    margin: 0 0 10px 0;
    font-size: 12px;
    color: #495057;
    display: flex;
    align-items: center;
    gap: 5px;
}

.preview-item, .calculation-item {
    display: flex;
    justify-content: space-between;
    margin-bottom: 8px;
    font-size: 12px;
}

.preview-item label, .calculation-item label {
    font-weight: bold;
    color: #495057;
}

.preview-item span, .calculation-item span {
    color: #212529;
}

.calculation-result {
    background: #e3f2fd;
    padding: 8px;
    border-radius: 4px;
    border: 1px solid #bbdefb;
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

/* استجابة */
@media (max-width: 768px) {
    .main-split-container {
        flex-direction: column;
        height: auto;
    }

    .plans-main-section, .plans-sidebar-section {
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
// بيانات الخيارات
const targetOptions = {
    'Product': @json($products->map(function($item) { return ['id' => $item->id, 'name' => $item->name]; })),
    'SupplierCategory': @json($categories->map(function($item) { return ['id' => $item->id, 'name' => $item->name]; })),
    'Supplier': @json($suppliers->map(function($item) { return ['id' => $item->id, 'name' => $item->name_ar]; }))
};

// الهدف الحالي
const currentTarget = {
    type: '{{ $salesPlan->target_type }}',
    id: {{ $salesPlan->target_id }}
};

// تحديث خيارات الهدف عند تغيير النوع
document.getElementById('target_type').addEventListener('change', function() {
    const targetType = this.value;
    const targetSelect = document.getElementById('target_id');

    // مسح الخيارات الحالية
    targetSelect.innerHTML = '<option value="">اختر الهدف</option>';

    if (targetType && targetOptions[targetType]) {
        targetOptions[targetType].forEach(function(option) {
            const optionElement = document.createElement('option');
            optionElement.value = option.id;
            optionElement.textContent = option.name;
            targetSelect.appendChild(optionElement);
        });
    }

    updatePreview();
});

// تحميل الخيارات الأولية
document.addEventListener('DOMContentLoaded', function() {
    const targetType = document.getElementById('target_type').value;
    if (targetType) {
        // تحديث خيارات الهدف
        const targetSelect = document.getElementById('target_id');
        targetSelect.innerHTML = '<option value="">اختر الهدف</option>';

        if (targetOptions[targetType]) {
            targetOptions[targetType].forEach(function(option) {
                const optionElement = document.createElement('option');
                optionElement.value = option.id;
                optionElement.textContent = option.name;
                // تحديد الهدف الحالي
                if (option.id == currentTarget.id) {
                    optionElement.selected = true;
                }
                targetSelect.appendChild(optionElement);
            });
        }
    }
});

// معاينة البيانات في الوقت الفعلي
document.getElementById('representative_id').addEventListener('change', function() {
    const selectedOption = this.options[this.selectedIndex];
    const value = selectedOption.text || '-';
    document.getElementById('preview-representative').textContent = value;
});

document.getElementById('plan_name').addEventListener('input', function() {
    const value = this.value || '-';
    document.getElementById('preview-plan-name').textContent = value;
});

document.getElementById('target_type').addEventListener('change', function() {
    const typeMap = {
        'Product': 'منتج محدد',
        'SupplierCategory': 'صنف محدد',
        'Supplier': 'مورد محدد'
    };
    const value = typeMap[this.value] || '-';
    document.getElementById('preview-target-type').textContent = value;
});

document.getElementById('target_quantity').addEventListener('input', function() {
    const value = this.value;
    const formattedValue = value ? parseFloat(value).toLocaleString() : '-';
    document.getElementById('preview-target-quantity').textContent = formattedValue;
});

document.getElementById('target_amount').addEventListener('input', function() {
    const value = this.value;
    const formattedValue = value ? parseFloat(value).toLocaleString() + ' د.ع' : '-';
    document.getElementById('preview-target-amount').textContent = formattedValue;
    updateCalculations();
});

document.getElementById('required_achievement_percentage').addEventListener('input', function() {
    const value = this.value || '0';
    document.getElementById('preview-required-percentage').textContent = value + '%';
    updateCalculations();
});

document.getElementById('commission_percentage').addEventListener('input', function() {
    const value = this.value || '0';
    document.getElementById('preview-commission').textContent = value + '%';
    updateCalculations();
});

document.getElementById('is_active').addEventListener('change', function() {
    const status = this.checked ? 'نشطة' : 'غير نشطة';
    document.getElementById('preview-status').textContent = status;
});

function updateCalculations() {
    const targetAmount = parseFloat(document.getElementById('target_amount').value) || 0;
    const requiredPercentage = parseFloat(document.getElementById('required_achievement_percentage').value) || 0;
    const commissionPercentage = parseFloat(document.getElementById('commission_percentage').value) || 0;

    const minTarget = targetAmount * requiredPercentage / 100;
    const expectedCommission = targetAmount * commissionPercentage / 100;

    document.getElementById('calc-min-target').textContent = minTarget.toLocaleString() + ' د.ع';
    document.getElementById('calc-expected-commission').textContent = expectedCommission.toLocaleString() + ' د.ع';
}

function saveSalesPlan() {
    // التحقق من صحة البيانات
    const representativeId = document.getElementById('representative_id').value;
    const planName = document.getElementById('plan_name').value.trim();
    const startDate = document.getElementById('start_date').value;
    const endDate = document.getElementById('end_date').value;
    const targetType = document.getElementById('target_type').value;
    const targetId = document.getElementById('target_id').value;
    const targetQuantity = document.getElementById('target_quantity').value;
    const targetAmount = document.getElementById('target_amount').value;
    const requiredPercentage = document.getElementById('required_achievement_percentage').value;
    const commissionPercentage = document.getElementById('commission_percentage').value;

    if (!representativeId) {
        alert('يرجى اختيار المندوب');
        document.getElementById('representative_id').focus();
        return;
    }

    if (!planName) {
        alert('يرجى إدخال اسم الخطة');
        document.getElementById('plan_name').focus();
        return;
    }

    if (!startDate) {
        alert('يرجى تحديد تاريخ البداية');
        document.getElementById('start_date').focus();
        return;
    }

    if (!endDate) {
        alert('يرجى تحديد تاريخ النهاية');
        document.getElementById('end_date').focus();
        return;
    }

    if (new Date(endDate) <= new Date(startDate)) {
        alert('تاريخ النهاية يجب أن يكون بعد تاريخ البداية');
        document.getElementById('end_date').focus();
        return;
    }

    if (!targetType) {
        alert('يرجى اختيار نوع الهدف');
        document.getElementById('target_type').focus();
        return;
    }

    if (!targetId) {
        alert('يرجى اختيار الهدف المحدد');
        document.getElementById('target_id').focus();
        return;
    }

    if (!targetQuantity || parseFloat(targetQuantity) <= 0) {
        alert('يرجى إدخال الكمية المطلوبة (أكبر من صفر)');
        document.getElementById('target_quantity').focus();
        return;
    }

    if (!targetAmount || parseFloat(targetAmount) <= 0) {
        alert('يرجى إدخال المبلغ المطلوب (أكبر من صفر)');
        document.getElementById('target_amount').focus();
        return;
    }

    if (!requiredPercentage || parseFloat(requiredPercentage) <= 0 || parseFloat(requiredPercentage) > 100) {
        alert('يرجى إدخال نسبة تحقيق صحيحة (1-100%)');
        document.getElementById('required_achievement_percentage').focus();
        return;
    }

    if (!commissionPercentage || parseFloat(commissionPercentage) < 0 || parseFloat(commissionPercentage) > 100) {
        alert('يرجى إدخال نسبة عمولة صحيحة (0-100%)');
        document.getElementById('commission_percentage').focus();
        return;
    }

    // إرسال النموذج
    document.getElementById('planForm').submit();
}

// تحديث الحسابات عند تحميل الصفحة
document.addEventListener('DOMContentLoaded', function() {
    updateCalculations();
});
</script>
@endsection
