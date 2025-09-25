@extends('layouts.desktop')

@section('title', 'إضافة مندوب جديد - نظام إدارة المبيعات')

@section('page-title', 'إضافة مندوب جديد')

@section('toolbar')
    <div class="toolbar-group">
        <button onclick="saveRepresentative()" class="win-button primary">
            <i class="fas fa-save"></i> حفظ المندوب
        </button>
        <button onclick="window.location.href='{{ route('admin.representatives.index') }}'" class="win-button">
            <i class="fas fa-arrow-left"></i> العودة للقائمة
        </button>
    </div>
@endsection

@section('content')
    <div class="main-split-container">
        <!-- القسم الرئيسي 80% -->
        <div class="representative-main-section">
            <form id="representativeForm" action="{{ route('admin.representatives.store') }}" method="POST">
                @csrf

                <!-- بيانات المندوب الأساسية -->
                <div class="representative-form-section">
                    <div class="section-header">
                        <h3><i class="fas fa-user"></i> بيانات المندوب الأساسية</h3>
                    </div>

                    <div class="form-grid">
                        <div class="form-group">
                            <label class="win-label required">اسم المندوب *</label>
                            <input type="text" name="name" id="name" class="win-input" value="{{ old('name') }}" required>
                            @error('name')
                                <div class="error-message">{{ $message }}</div>
                            @enderror
                        </div>

                        <div class="form-group">
                            <label class="win-label required">رقم الهاتف *</label>
                            <input type="text" name="phone" id="phone" class="win-input" value="{{ old('phone') }}" required>
                            @error('phone')
                                <div class="error-message">{{ $message }}</div>
                            @enderror
                            <small class="field-hint">يستخدم رقم الهاتف لتسجيل الدخول</small>
                        </div>
                    </div>

                    <div class="form-grid">
                        <div class="form-group">
                            <label class="win-label required">كلمة المرور *</label>
                            <div class="password-field">
                                <input type="password" name="password" id="password" class="win-input" required>
                                <button type="button" class="password-toggle" onclick="togglePassword('password')">
                                    <i class="fas fa-eye" id="password-eye"></i>
                                </button>
                            </div>
                            @error('password')
                                <div class="error-message">{{ $message }}</div>
                            @enderror
                            <small class="field-hint">يجب أن تكون 6 أحرف على الأقل</small>
                        </div>

                        <div class="form-group">
                            <label class="win-label required">تأكيد كلمة المرور *</label>
                            <div class="password-field">
                                <input type="password" name="password_confirmation" id="password_confirmation" class="win-input" required>
                                <button type="button" class="password-toggle" onclick="togglePassword('password_confirmation')">
                                    <i class="fas fa-eye" id="password_confirmation-eye"></i>
                                </button>
                            </div>
                            <small class="field-hint">أعد كتابة كلمة المرور للتأكيد</small>
                        </div>
                    </div>
                </div>

                <!-- معلومات إضافية -->
                <div class="representative-form-section">
                    <div class="section-header">
                        <h3><i class="fas fa-info-circle"></i> معلومات إضافية</h3>
                    </div>

                    <div class="form-grid">
                        <div class="form-group">
                            <label class="win-label">ملاحظات</label>
                            <textarea name="notes" id="notes" class="win-input" rows="3" placeholder="أي ملاحظات إضافية عن المندوب...">{{ old('notes') }}</textarea>
                        </div>

                        <div class="form-group">
                            <div class="checkbox-group">
                                <label class="checkbox-label">
                                    <input type="checkbox" name="is_active" id="is_active" value="1" checked>
                                    <span class="checkmark"></span>
                                    تفعيل المندوب مباشرة
                                </label>
                                <small class="field-hint">يمكن للمندوب تسجيل الدخول واستخدام النظام</small>
                            </div>
                        </div>
                    </div>
                </div>
            </form>
        </div>

        <!-- القسم الجانبي 20% -->
        <div class="representative-sidebar-section">
            <div class="sidebar-header">
                معاينة البيانات
            </div>
            <div class="sidebar-content">
                <div class="preview-section">
                    <h4><i class="fas fa-eye"></i> معاينة سريعة</h4>

                    <div class="preview-item">
                        <label>اسم المندوب:</label>
                        <span id="preview-name">-</span>
                    </div>

                    <div class="preview-item">
                        <label>رقم الهاتف:</label>
                        <span id="preview-phone">-</span>
                    </div>

                    <div class="preview-item">
                        <label>كلمة المرور:</label>
                        <span id="preview-password">••••••</span>
                    </div>

                    <div class="preview-item">
                        <label>الحالة:</label>
                        <span id="preview-status">نشط</span>
                    </div>
                </div>

                <div class="tips-section">
                    <h4><i class="fas fa-lightbulb"></i> نصائح</h4>
                    <ul class="tips-list">
                        <li>استخدم اسم واضح ومفهوم للمندوب</li>
                        <li>تأكد من صحة رقم الهاتف</li>
                        <li>اختر كلمة مرور قوية</li>
                        <li>يمكن تعديل البيانات لاحقاً</li>
                    </ul>
                </div>

                <div class="validation-section">
                    <h4><i class="fas fa-check-circle"></i> التحقق من البيانات</h4>
                    <div class="validation-items">
                        <div class="validation-item" id="validation-name">
                            <i class="fas fa-times text-danger"></i>
                            <span>اسم المندوب مطلوب</span>
                        </div>
                        <div class="validation-item" id="validation-phone">
                            <i class="fas fa-times text-danger"></i>
                            <span>رقم الهاتف مطلوب</span>
                        </div>
                        <div class="validation-item" id="validation-password">
                            <i class="fas fa-times text-danger"></i>
                            <span>كلمة المرور مطلوبة</span>
                        </div>
                        <div class="validation-item" id="validation-password-match">
                            <i class="fas fa-times text-danger"></i>
                            <span>تطابق كلمة المرور</span>
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

.representative-main-section {
    width: 80%;
    background: white;
    overflow-y: auto;
    padding: 20px;
}

.representative-sidebar-section {
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
.representative-form-section {
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

/* حقول كلمة المرور */
.password-field {
    position: relative;
    display: flex;
    align-items: center;
}

.password-toggle {
    position: absolute;
    right: 8px;
    background: none;
    border: none;
    cursor: pointer;
    color: #6c757d;
    padding: 4px;
}

.password-toggle:hover {
    color: #495057;
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

    .representative-main-section, .representative-sidebar-section {
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
document.getElementById('name').addEventListener('input', function() {
    const value = this.value || '-';
    document.getElementById('preview-name').textContent = value;
    validateField('name', this.value.length >= 2);
});

document.getElementById('phone').addEventListener('input', function() {
    const value = this.value || '-';
    document.getElementById('preview-phone').textContent = value;
    validateField('phone', this.value.length >= 8);
});

document.getElementById('password').addEventListener('input', function() {
    const isValid = this.value.length >= 6;
    document.getElementById('preview-password').textContent = isValid ? '••••••' : '-';
    validateField('password', isValid);
    checkPasswordMatch();
});

document.getElementById('password_confirmation').addEventListener('input', function() {
    checkPasswordMatch();
});

document.getElementById('is_active').addEventListener('change', function() {
    const status = this.checked ? 'نشط' : 'غير نشط';
    document.getElementById('preview-status').textContent = status;
});

function togglePassword(fieldId) {
    const field = document.getElementById(fieldId);
    const eye = document.getElementById(fieldId + '-eye');

    if (field.type === 'password') {
        field.type = 'text';
        eye.classList.remove('fa-eye');
        eye.classList.add('fa-eye-slash');
    } else {
        field.type = 'password';
        eye.classList.remove('fa-eye-slash');
        eye.classList.add('fa-eye');
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

function checkPasswordMatch() {
    const password = document.getElementById('password').value;
    const confirmation = document.getElementById('password_confirmation').value;
    const isMatch = password === confirmation && password.length >= 6;

    validateField('password-match', isMatch);
}

function saveRepresentative() {
    // التحقق من صحة البيانات
    const name = document.getElementById('name').value;
    const phone = document.getElementById('phone').value;
    const password = document.getElementById('password').value;
    const confirmation = document.getElementById('password_confirmation').value;

    if (!name || name.length < 2) {
        alert('يرجى إدخال اسم المندوب (حرفين على الأقل)');
        document.getElementById('name').focus();
        return;
    }

    if (!phone || phone.length < 8) {
        alert('يرجى إدخال رقم هاتف صحيح (8 أرقام على الأقل)');
        document.getElementById('phone').focus();
        return;
    }

    if (!password || password.length < 6) {
        alert('يرجى إدخال كلمة مرور (6 أحرف على الأقل)');
        document.getElementById('password').focus();
        return;
    }

    if (password !== confirmation) {
        alert('كلمة المرور وتأكيد كلمة المرور غير متطابقين');
        document.getElementById('password_confirmation').focus();
        return;
    }

    // إرسال النموذج
    document.getElementById('representativeForm').submit();
}

// التحقق الأولي عند تحميل الصفحة
document.addEventListener('DOMContentLoaded', function() {
    // تعيين القيم الافتراضية للمعاينة
    const name = document.getElementById('name').value;
    const phone = document.getElementById('phone').value;

    if (name) document.getElementById('preview-name').textContent = name;
    if (phone) document.getElementById('preview-phone').textContent = phone;
});
</script>
@endsection
