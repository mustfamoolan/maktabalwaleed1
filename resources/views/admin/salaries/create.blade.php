@extends('layouts.desktop')

@section('title', 'إضافة راتب جديد - نظام إدارة المبيعات')

@section('page-title', 'إضافة راتب جديد')

@section('toolbar')
    <div class="toolbar-group">
        <button onclick="saveSalary()" class="win-button primary">
            <i class="fas fa-save"></i> حفظ الراتب
        </button>
        <button onclick="window.location.href='{{ route('admin.salaries.index') }}'" class="win-button">
            <i class="fas fa-arrow-left"></i> العودة للقائمة
        </button>
    </div>
@endsection

@section('content')
    <div class="main-split-container">
        <!-- القسم الرئيسي 80% -->
        <div class="salary-main-section">
            <form id="salaryForm" action="{{ route('admin.salaries.store') }}" method="POST">
                @csrf

                <!-- بيانات الراتب الأساسية -->
                <div class="salary-form-section">
                    <div class="section-header">
                        <h3><i class="fas fa-coins"></i> بيانات الراتب الأساسية</h3>
                    </div>

                    <div class="form-grid">
                        <div class="form-group">
                            <label class="win-label required">المندوب *</label>
                            <select name="representative_id" id="representative_id" class="win-input" required>
                                <option value="">اختر المندوب</option>
                                @foreach($representatives as $representative)
                                    <option value="{{ $representative->id }}" {{ old('representative_id') == $representative->id ? 'selected' : '' }}>
                                        {{ $representative->name }}
                                    </option>
                                @endforeach
                            </select>
                            @error('representative_id')
                                <div class="error-message">{{ $message }}</div>
                            @enderror
                        </div>

                        <div class="form-group">
                            <label class="win-label required">الراتب الأساسي (د.ع) *</label>
                            <input type="number" name="basic_salary" id="basic_salary" class="win-input" value="{{ old('basic_salary') }}" min="0" step="1000" required>
                            @error('basic_salary')
                                <div class="error-message">{{ $message }}</div>
                            @enderror
                            <small class="field-hint">الراتب الشهري الأساسي بالدينار العراقي</small>
                        </div>
                    </div>

                    <div class="form-grid">
                        <div class="form-group">
                            <label class="win-label required">تاريخ بداية السريان *</label>
                            <input type="date" name="effective_from" id="effective_from" class="win-input" value="{{ old('effective_from', date('Y-m-d')) }}" required>
                            @error('effective_from')
                                <div class="error-message">{{ $message }}</div>
                            @enderror
                            <small class="field-hint">التاريخ الذي يبدأ فيه سريان هذا الراتب</small>
                        </div>

                        <div class="form-group">
                            <label class="win-label">تاريخ نهاية السريان</label>
                            <input type="date" name="effective_to" id="effective_to" class="win-input" value="{{ old('effective_to') }}">
                            @error('effective_to')
                                <div class="error-message">{{ $message }}</div>
                            @enderror
                            <small class="field-hint">اتركه فارغاً إذا كان الراتب مفتوح النهاية</small>
                        </div>
                    </div>
                </div>

                <!-- معلومات إضافية -->
                <div class="salary-form-section">
                    <div class="section-header">
                        <h3><i class="fas fa-info-circle"></i> معلومات إضافية</h3>
                    </div>

                    <div class="form-grid">
                        <div class="form-group">
                            <div class="checkbox-group">
                                <label class="checkbox-label">
                                    <input type="checkbox" name="is_active" id="is_active" value="1" checked>
                                    <span class="checkmark"></span>
                                    تفعيل الراتب مباشرة
                                </label>
                                <small class="field-hint">سيتم إنهاء أي راتب نشط سابق للمندوب</small>
                            </div>
                        </div>
                    </div>
                </div>
            </form>
        </div>

        <!-- القسم الجانبي 20% -->
        <div class="salary-sidebar-section">
            <div class="sidebar-header">
                معاينة البيانات
            </div>
            <div class="sidebar-content">
                <div class="preview-section">
                    <h4><i class="fas fa-eye"></i> معاينة سريعة</h4>

                    <div class="preview-item">
                        <label>المندوب:</label>
                        <span id="preview-representative">-</span>
                    </div>

                    <div class="preview-item">
                        <label>الراتب الأساسي:</label>
                        <span id="preview-basic-salary">-</span>
                    </div>

                    <div class="preview-item">
                        <label>تاريخ البداية:</label>
                        <span id="preview-effective-from">-</span>
                    </div>

                    <div class="preview-item">
                        <label>تاريخ النهاية:</label>
                        <span id="preview-effective-to">مفتوح</span>
                    </div>

                    <div class="preview-item">
                        <label>الحالة:</label>
                        <span id="preview-status">نشط</span>
                    </div>
                </div>

                <div class="tips-section">
                    <h4><i class="fas fa-lightbulb"></i> نصائح</h4>
                    <ul class="tips-list">
                        <li>اختر المندوب بعناية</li>
                        <li>تأكد من صحة مبلغ الراتب</li>
                        <li>حدد تاريخ البداية بدقة</li>
                        <li>يمكن ترك تاريخ النهاية فارغاً للراتب المفتوح</li>
                        <li>تفعيل الراتب سيلغي أي راتب نشط سابق</li>
                    </ul>
                </div>

                <div class="validation-section">
                    <h4><i class="fas fa-check-circle"></i> التحقق من البيانات</h4>
                    <div class="validation-items">
                        <div class="validation-item" id="validation-representative">
                            <i class="fas fa-times text-danger"></i>
                            <span>اختيار المندوب مطلوب</span>
                        </div>
                        <div class="validation-item" id="validation-salary">
                            <i class="fas fa-times text-danger"></i>
                            <span>مبلغ الراتب مطلوب</span>
                        </div>
                        <div class="validation-item" id="validation-date">
                            <i class="fas fa-times text-danger"></i>
                            <span>تاريخ البداية مطلوب</span>
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

.salary-main-section {
    width: 80%;
    background: white;
    overflow-y: auto;
    padding: 20px;
}

.salary-sidebar-section {
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
.salary-form-section {
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

    .salary-main-section, .salary-sidebar-section {
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
// معاينة البيانات في الوقت الفعلي
document.getElementById('representative_id').addEventListener('change', function() {
    const selectedOption = this.options[this.selectedIndex];
    const value = selectedOption.text || '-';
    document.getElementById('preview-representative').textContent = value;
    validateField('representative', this.value !== '');
});

document.getElementById('basic_salary').addEventListener('input', function() {
    const value = this.value;
    const formattedValue = value ? parseFloat(value).toLocaleString() + ' د.ع' : '-';
    document.getElementById('preview-basic-salary').textContent = formattedValue;
    validateField('salary', parseFloat(value) > 0);
});

document.getElementById('effective_from').addEventListener('change', function() {
    const value = this.value || '-';
    document.getElementById('preview-effective-from').textContent = value;
    validateField('date', this.value !== '');
});

document.getElementById('effective_to').addEventListener('change', function() {
    const value = this.value || 'مفتوح';
    document.getElementById('preview-effective-to').textContent = value;
});

document.getElementById('is_active').addEventListener('change', function() {
    const status = this.checked ? 'نشط' : 'غير نشط';
    document.getElementById('preview-status').textContent = status;
});

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

function saveSalary() {
    // التحقق من صحة البيانات
    const representativeId = document.getElementById('representative_id').value;
    const basicSalary = document.getElementById('basic_salary').value;
    const effectiveFrom = document.getElementById('effective_from').value;

    if (!representativeId) {
        alert('يرجى اختيار المندوب');
        document.getElementById('representative_id').focus();
        return;
    }

    if (!basicSalary || parseFloat(basicSalary) <= 0) {
        alert('يرجى إدخال مبلغ الراتب (أكبر من صفر)');
        document.getElementById('basic_salary').focus();
        return;
    }

    if (!effectiveFrom) {
        alert('يرجى تحديد تاريخ بداية السريان');
        document.getElementById('effective_from').focus();
        return;
    }

    // إرسال النموذج
    document.getElementById('salaryForm').submit();
}

// التحقق الأولي عند تحميل الصفحة
document.addEventListener('DOMContentLoaded', function() {
    // تعيين القيم الافتراضية للمعاينة
    const representativeId = document.getElementById('representative_id').value;
    const basicSalary = document.getElementById('basic_salary').value;
    const effectiveFrom = document.getElementById('effective_from').value;

    if (representativeId) {
        const selectedOption = document.getElementById('representative_id').options[document.getElementById('representative_id').selectedIndex];
        document.getElementById('preview-representative').textContent = selectedOption.text;
    }

    if (basicSalary) {
        const formattedValue = parseFloat(basicSalary).toLocaleString() + ' د.ع';
        document.getElementById('preview-basic-salary').textContent = formattedValue;
    }

    if (effectiveFrom) {
        document.getElementById('preview-effective-from').textContent = effectiveFrom;
    }
});
</script>
@endsection
