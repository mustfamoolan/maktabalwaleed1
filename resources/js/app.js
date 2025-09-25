// Simple JavaScript for desktop-style interactions
document.addEventListener('DOMContentLoaded', function() {
    // Table row selection functionality
    const tableRows = document.querySelectorAll('.desktop-table tbody tr');
    tableRows.forEach(row => {
        row.addEventListener('click', function() {
            // Remove selected class from all rows
            tableRows.forEach(r => r.classList.remove('selected'));
            // Add selected class to clicked row
            this.classList.add('selected');
        });
    });

    // Confirm delete actions
    const deleteButtons = document.querySelectorAll('[data-confirm-delete]');
    deleteButtons.forEach(button => {
        button.addEventListener('click', function(e) {
            const message = this.getAttribute('data-confirm-delete') || 'هل أنت متأكد من الحذف؟';
            if (!confirm(message)) {
                e.preventDefault();
                return false;
            }
        });
    });

    // Form validation
    const forms = document.querySelectorAll('form');
    forms.forEach(form => {
        form.addEventListener('submit', function(e) {
            const requiredFields = this.querySelectorAll('[required]');
            let isValid = true;

            requiredFields.forEach(field => {
                if (!field.value.trim()) {
                    field.style.borderColor = '#dc2626';
                    isValid = false;
                } else {
                    field.style.borderColor = '#999';
                }
            });

            if (!isValid) {
                e.preventDefault();
                alert('يرجى ملء جميع الحقول المطلوبة');
            }
        });
    });

    // Auto-hide success messages
    const successMessages = document.querySelectorAll('.success-message');
    successMessages.forEach(message => {
        setTimeout(() => {
            message.style.opacity = '0';
            setTimeout(() => message.remove(), 500);
        }, 3000);
    });
});

// Global utility functions
window.toggleAll = function(source) {
    const checkboxes = document.querySelectorAll('.supplier-checkbox');
    checkboxes.forEach(checkbox => {
        checkbox.checked = source.checked;
    });
};

window.deleteSelected = function() {
    const selected = document.querySelectorAll('.supplier-checkbox:checked');
    if (selected.length === 0) {
        alert('يرجى اختيار عنصر واحد على الأقل للحذف');
        return;
    }

    if (confirm(`هل أنت متأكد من حذف ${selected.length} عنصر؟`)) {
        // This can be implemented later for bulk delete
        alert('سيتم تطوير الحذف المتعدد قريباً');
    }
};

window.searchSuppliers = function() {
    const searchInput = document.getElementById('searchInput');
    if (searchInput) {
        const searchTerm = searchInput.value;
        const url = new URL(window.location);
        if (searchTerm) {
            url.searchParams.set('search', searchTerm);
        } else {
            url.searchParams.delete('search');
        }
        window.location.href = url.toString();
    }
};
