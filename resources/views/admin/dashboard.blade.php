@extends('layouts.desktop')

@section('title', 'لوحة التحكم - نظام إدارة المبيعات')

@section('page-title', 'لوحة التحكم')

@section('toolbar')
    <div class="toolbar-group">
        <div style="font-size: 13px; color: #666;">آخر دخول: {{ now()->format('Y-m-d H:i') }}</div>
    </div>
@endsection

@section('content')
    <!-- Modules Grid -->
    <div class="dashboard-grid">
        @php
        $modules = [
            ['title' => 'بيع على أرض المكتب', 'icon' => 'fas fa-desktop', 'color' => 'primary', 'route' => '#'],
            ['title' => 'فاتورة شراء', 'icon' => 'fas fa-shopping-cart', 'color' => 'success', 'route' => route('admin.purchase-invoices.index')],
            ['title' => 'فاتورة مرتجع شراء', 'icon' => 'fas fa-undo', 'color' => 'warning', 'route' => route('admin.purchase-return-invoices.index')],
            ['title' => 'فاتورة بيع', 'icon' => 'fas fa-file-invoice-dollar', 'color' => 'info', 'route' => '#'],
            ['title' => 'فاتورة مرتجع بيع', 'icon' => 'fas fa-redo', 'color' => 'secondary', 'route' => '#'],

            ['title' => 'الزبائن', 'icon' => 'fas fa-users', 'color' => 'primary', 'route' => '#'],
            ['title' => 'وصل قبض', 'icon' => 'fas fa-money-bill-wave', 'color' => 'success', 'route' => '#'],
            ['title' => 'وصل دفع', 'icon' => 'fas fa-receipt', 'color' => 'danger', 'route' => '#'],
            ['title' => 'قيد مركب', 'icon' => 'fas fa-clipboard-list', 'color' => 'warning', 'route' => '#'],
            ['title' => 'كشف حركة مادة', 'icon' => 'fas fa-sync-alt', 'color' => 'info', 'route' => '#'],

            ['title' => 'كشف حساب زبون', 'icon' => 'fas fa-user-check', 'color' => 'primary', 'route' => '#'],
            ['title' => 'كشف مشتريات من الموردين', 'icon' => 'fas fa-industry', 'color' => 'success', 'route' => '#'],
            ['title' => 'كشف مشتريات الزبائن', 'icon' => 'fas fa-chart-bar', 'color' => 'info', 'route' => '#'],
            ['title' => 'كشف مشتريات الموظفين', 'icon' => 'fas fa-user-tie', 'color' => 'warning', 'route' => '#'],
            ['title' => 'كشف حساب ديون عامة', 'icon' => 'fas fa-chart-line', 'color' => 'danger', 'route' => '#'],

            ['title' => 'كشف أرباح عامة', 'icon' => 'fas fa-chart-area', 'color' => 'success', 'route' => '#'],
            ['title' => 'الموردين', 'icon' => 'fas fa-building', 'color' => 'primary', 'route' => route('admin.suppliers.index')],
            ['title' => 'المندوبين', 'icon' => 'fas fa-rocket', 'color' => 'info', 'route' => route('admin.representatives.index')],
            ['title' => 'الموظفين', 'icon' => 'fas fa-user-friends', 'color' => 'secondary', 'route' => '#'],
            ['title' => 'المخزن', 'icon' => 'fas fa-warehouse', 'color' => 'warning', 'route' => route('admin.products.index')],

            ['title' => 'طلبات المندوب', 'icon' => 'fas fa-clipboard-check', 'color' => 'info', 'route' => '#'],
            ['title' => 'كشف حركات الصندوق', 'icon' => 'fas fa-cash-register', 'color' => 'success', 'route' => '#'],
            ['title' => 'رأس المال', 'icon' => 'fas fa-gem', 'color' => 'primary', 'route' => '#'],
            ['title' => 'التنبيهات', 'icon' => 'fas fa-bell', 'color' => 'danger', 'route' => '#'],
        ];
        @endphp

        @foreach($modules as $module)
        <div class="dashboard-card" onclick="handleModuleClick('{{ $module['route'] }}', '{{ $module['title'] }}')">
            <div class="dashboard-card-icon">
                <i class="{{ $module['icon'] }}"></i>
            </div>
            <div class="dashboard-card-title">{{ $module['title'] }}</div>
            <div class="dashboard-card-desc">انقر للوصول</div>
        </div>
        @endforeach
    </div>
@endsection

@section('statusbar')
    <div class="status-item">
        إجمالي الوحدات: {{ count($modules ?? []) }}
    </div>
@endsection

@section('scripts')
<script>
function handleModuleClick(route, title) {
    if (route === '#') {
        alert('سيتم تطوير وحدة "' + title + '" قريباً');
    } else {
        window.location.href = route;
    }
}
</script>
@endsection
