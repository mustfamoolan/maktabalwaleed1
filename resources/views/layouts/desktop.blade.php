<!DOCTYPE html>
<html lang="ar" dir="rtl">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <meta name="csrf-token" content="{{ csrf_token() }}">
    <title>@yield('title', 'نظام إدارة المبيعات')</title>

    <!-- Font Awesome -->
    <link rel="stylesheet" href="https://cdnjs.cloudflare.com/ajax/libs/font-awesome/6.4.0/css/all.min.css">

    <!-- Vite Assets -->
    @vite(['resources/css/app.css', 'resources/js/app.js'])

    @yield('styles')

    <style>
        * {
            box-sizing: border-box;
            margin: 0;
            padding: 0;
        }

        body {
            font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif;
            background: #f0f0f0;
            direction: rtl;
            overflow: hidden;
            font-size: 13px;
        }

        /* Windows Form Container */
        .windows-form {
            height: 100vh;
            display: flex;
            flex-direction: column;
            border: 2px solid #0078d4;
            background: #ffffff;
            box-shadow: 0 4px 10px rgba(0,0,0,0.3);
        }

        /* Title Bar */
        .title-bar {
            background: linear-gradient(to bottom, #0078d4 0%, #106ebe 100%);
            color: white;
            padding: 8px 12px;
            font-size: 14px;
            font-weight: bold;
            display: flex;
            justify-content: space-between;
            align-items: center;
            border-bottom: 1px solid #106ebe;
        }

        .window-title {
            display: flex;
            align-items: center;
            gap: 8px;
        }

        /* Menu Bar */
        .menu-bar {
            background: #f8f9fa;
            border-bottom: 1px solid #dee2e6;
            padding: 0;
            font-size: 13px;
            display: flex;
        }

        .menu-item {
            padding: 8px 16px;
            cursor: pointer;
            border: none;
            background: transparent;
            color: #495057;
            text-decoration: none;
            border-right: 1px solid #dee2e6;
            transition: background-color 0.2s;
        }

        .menu-item:hover {
            background: #e9ecef;
        }

        .menu-item.active {
            background: #0078d4;
            color: white;
        }

        .menu-item:last-child {
            margin-right: auto;
        }

        /* Toolbar */
        .toolbar {
            background: #f8f9fa;
            border-bottom: 1px solid #dee2e6;
            padding: 6px 8px;
            display: flex;
            align-items: center;
            gap: 4px;
            flex-wrap: wrap;
            min-height: 40px;
        }

        .toolbar-group {
            display: flex;
            align-items: center;
            gap: 2px;
            padding: 0 6px;
            border-left: 1px solid #dee2e6;
            margin-left: 6px;
        }

        .toolbar-group:first-child {
            border-left: none;
            margin-left: 0;
        }

        .toolbar-btn {
            width: 28px;
            height: 28px;
            border: 1px solid #ced4da;
            background: #ffffff;
            cursor: pointer;
            display: flex;
            align-items: center;
            justify-content: center;
            font-size: 12px;
            color: #495057;
            text-decoration: none;
            transition: all 0.2s;
        }

        .toolbar-btn:hover {
            border-color: #0078d4;
            background: #e3f2fd;
            color: #0078d4;
        }

        .toolbar-btn:active {
            background: #bbdefb;
        }

        .toolbar-btn.primary {
            background: #0078d4;
            color: white;
            border-color: #0066cc;
        }

        .toolbar-btn.primary:hover {
            background: #106ebe;
        }

        .toolbar-input {
            height: 26px;
            padding: 2px 8px;
            border: 1px solid #ced4da;
            background: white;
            font-size: 13px;
            min-width: 200px;
            font-family: inherit;
        }

        .toolbar-input:focus {
            outline: none;
            border-color: #0078d4;
            box-shadow: 0 0 0 2px rgba(0, 120, 212, 0.2);
        }

        /* Content Area */
        .content-area {
            flex: 1;
            background: white;
            overflow: auto;
            padding: 0;
        }

        /* Excel-style table */
        .excel-table {
            width: 100%;
            border-collapse: collapse;
            font-size: 13px;
            background: white;
            border: 1px solid #dee2e6;
        }

        .excel-table th {
            background: #f8f9fa;
            border: 1px solid #dee2e6;
            padding: 8px 12px;
            font-weight: 600;
            text-align: right;
            color: #495057;
            position: sticky;
            top: 0;
            z-index: 10;
        }

        .excel-table td {
            border: 1px solid #dee2e6;
            padding: 6px 12px;
            text-align: right;
            vertical-align: middle;
        }

        .excel-table tbody tr:nth-child(even) {
            background: #f8f9fa;
        }

        .excel-table tbody tr:hover {
            background: #e3f2fd;
        }

        .excel-table tbody tr.selected {
            background: #bbdefb;
        }

        /* Status bar */
        .status-bar {
            background: #f8f9fa;
            border-top: 1px solid #dee2e6;
            padding: 4px 12px;
            font-size: 12px;
            display: flex;
            align-items: center;
            gap: 20px;
            height: 26px;
        }

        .status-item {
            display: flex;
            align-items: center;
            gap: 4px;
            color: #6c757d;
        }

        /* Button styles */
        .win-button {
            padding: 4px 12px;
            border: 1px solid #ced4da;
            background: #ffffff;
            font-size: 12px;
            cursor: pointer;
            color: #495057;
            text-decoration: none;
            display: inline-flex;
            align-items: center;
            gap: 4px;
            transition: all 0.2s;
        }

        .win-button:hover {
            background: #e9ecef;
            border-color: #adb5bd;
        }

        .win-button:active {
            background: #dee2e6;
        }

        .win-button.primary {
            background: #0078d4;
            color: white;
            border-color: #0066cc;
        }

        .win-button.primary:hover {
            background: #106ebe;
        }

        .win-button.success {
            background: #198754;
            color: white;
            border-color: #157347;
        }

        .win-button.success:hover {
            background: #157347;
        }

        .win-button.danger {
            background: #dc3545;
            color: white;
            border-color: #bb2d3b;
        }

        .win-button.danger:hover {
            background: #bb2d3b;
        }

        /* Panel styles */
        .win-panel {
            border: 1px solid #dee2e6;
            background: white;
            margin: 12px;
        }

        .win-panel-header {
            background: #f8f9fa;
            border-bottom: 1px solid #dee2e6;
            padding: 8px 12px;
            font-weight: 600;
            font-size: 14px;
            color: #495057;
        }

        .win-panel-content {
            padding: 16px;
        }

        /* Dashboard grid */
        .dashboard-grid {
            display: grid;
            grid-template-columns: repeat(auto-fill, minmax(140px, 1fr));
            gap: 12px;
            padding: 16px;
        }

        .dashboard-card {
            border: 1px solid #dee2e6;
            background: white;
            padding: 16px;
            text-align: center;
            cursor: pointer;
            transition: all 0.2s;
        }

        .dashboard-card:hover {
            background: #f8f9fa;
            border-color: #0078d4;
            box-shadow: 0 2px 4px rgba(0,0,0,0.1);
        }

        .dashboard-card-icon {
            font-size: 24px;
            margin-bottom: 8px;
            color: #0078d4;
        }

        .dashboard-card-title {
            font-weight: 600;
            font-size: 12px;
            margin-bottom: 4px;
            color: #495057;
        }

        .dashboard-card-desc {
            font-size: 11px;
            color: #6c757d;
        }

        /* Form inputs */
        .win-input {
            padding: 6px 8px;
            border: 1px solid #ced4da;
            background: white;
            font-size: 13px;
            width: 100%;
        }

        .win-input:focus {
            outline: none;
            border-color: #0078d4;
            box-shadow: 0 0 0 2px rgba(0, 120, 212, 0.2);
        }

        .win-label {
            font-size: 13px;
            font-weight: 600;
            margin-bottom: 4px;
            display: block;
            color: #495057;
        }

        /* Checkbox styling */
        input[type="checkbox"] {
            width: 14px;
            height: 14px;
            cursor: pointer;
        }

        /* Responsive */
        @media (max-width: 768px) {
            .toolbar {
                flex-wrap: wrap;
            }

            .toolbar-group {
                margin: 2px 0;
            }

            .dashboard-grid {
                grid-template-columns: repeat(auto-fill, minmax(120px, 1fr));
                gap: 8px;
                padding: 12px;
            }
        }
    </style>
</head>
<body>
<div class="windows-form">
    <!-- Title Bar -->
    <div class="title-bar">
        <div class="window-title">
            <i class="fas fa-chart-line"></i>
            نظام إدارة المبيعات - @yield('page-title', 'الرئيسية')
        </div>
    </div>

    <!-- Menu Bar -->
    <div class="menu-bar">
        <a href="{{ route('admin.dashboard') }}" class="menu-item {{ request()->routeIs('admin.dashboard') ? 'active' : '' }}">
            الرئيسية
        </a>
        <a href="{{ route('admin.suppliers.index') }}" class="menu-item {{ request()->routeIs('admin.suppliers.*') ? 'active' : '' }}">
            الموردين
        </a>
        <a href="#" class="menu-item">العملاء</a>
        <a href="#" class="menu-item">المنتجات</a>
        <a href="#" class="menu-item">الفواتير</a>
        <a href="{{ route('admin.salaries.index') }}" class="menu-item {{ request()->routeIs('admin.salaries.*') ? 'active' : '' }}">
            رواتب المندوبين
        </a>
        <a href="{{ route('admin.sales-plans.index') }}" class="menu-item {{ request()->routeIs('admin.sales-plans.*') ? 'active' : '' }}">
            خطط المبيعات
        </a>
        <a href="#" class="menu-item">التقارير</a>

        <form method="POST" action="{{ route('admin.logout') }}" style="display: inline;">
            @csrf
            <button type="submit" class="menu-item" onclick="return confirm('هل أنت متأكد من تسجيل الخروج؟')" style="border: none; background: transparent;">
                {{ auth('admin')->user()->name ?? 'المشرف' }} - خروج
            </button>
        </form>
    </div>

    <!-- Toolbar -->
    <div class="toolbar">
        @yield('toolbar')
    </div>

    <!-- Content Area -->
    <div class="content-area">
        @yield('content')
    </div>

    <!-- Status Bar -->
    <div class="status-bar">
        <div class="status-item">
            <i class="fas fa-clock"></i>
            {{ now()->format('Y-m-d H:i:s') }}
        </div>
        <div class="status-item">
            <i class="fas fa-user"></i>
            المستخدم: {{ auth('admin')->user()->name ?? 'المشرف' }}
        </div>
        @yield('statusbar')
        <div style="flex: 1;"></div>
        <div class="status-item">جاهز</div>
    </div>
</div>

<script>
document.addEventListener('DOMContentLoaded', function() {
    // Table row selection like Excel
    const tableRows = document.querySelectorAll('.excel-table tbody tr');
    tableRows.forEach(row => {
        row.addEventListener('click', function() {
            // Clear previous selections
            tableRows.forEach(r => r.classList.remove('selected'));
            // Select current row
            this.classList.add('selected');
        });
    });

    // Local search functionality
    const searchInput = document.getElementById('searchInput');
    if (searchInput) {
        searchInput.addEventListener('input', function() {
            const searchTerm = this.value.toLowerCase();
            const rows = document.querySelectorAll('tbody tr');

            rows.forEach(row => {
                const text = row.textContent.toLowerCase();
                if (text.includes(searchTerm)) {
                    row.style.display = '';
                } else {
                    row.style.display = 'none';
                }
            });
        });
    }

    // Confirm delete actions
    const deleteButtons = document.querySelectorAll('[data-confirm-delete]');
    deleteButtons.forEach(button => {
        button.addEventListener('click', function(e) {
            if (!confirm('هل أنت متأكد من الحذف؟')) {
                e.preventDefault();
                return false;
            }
        });
    });

    // Dashboard card clicks
    window.handleModuleClick = function(route, title) {
        if (route && route !== '#') {
            window.location.href = route;
        } else {
            alert('الوحدة "' + title + '" قيد التطوير');
        }
    };
});
</script>

@yield('scripts')
</body>
</html>
