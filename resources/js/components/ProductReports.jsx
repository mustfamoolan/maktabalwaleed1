import React, { useState, useEffect } from 'react';
import { router } from '@inertiajs/react';

const ProductReports = ({ products = [] }) => {
    const [reportType, setReportType] = useState('stock');
    const [reportData, setReportData] = useState({});

    useEffect(() => {
        generateReport();
    }, [reportType, products]);

    const generateReport = () => {
        switch (reportType) {
            case 'stock':
                generateStockReport();
                break;
            case 'expiry':
                generateExpiryReport();
                break;
            case 'profit':
                generateProfitReport();
                break;
            case 'supplier':
                generateSupplierReport();
                break;
            default:
                break;
        }
    };

    const generateStockReport = () => {
        const lowStock = products.filter(p => p.stock_quantity <= p.min_stock_level);
        const outOfStock = products.filter(p => p.stock_quantity === 0);
        const goodStock = products.filter(p => p.stock_quantity > p.min_stock_level);

        const totalValue = products.reduce((sum, p) => sum + (p.cost_price * p.stock_quantity), 0);
        const lowStockValue = lowStock.reduce((sum, p) => sum + (p.cost_price * p.stock_quantity), 0);

        setReportData({
            totalProducts: products.length,
            lowStock: lowStock.length,
            outOfStock: outOfStock.length,
            goodStock: goodStock.length,
            totalValue: totalValue,
            lowStockValue: lowStockValue,
            items: {
                lowStock,
                outOfStock,
                goodStock
            }
        });
    };

    const generateExpiryReport = () => {
        const today = new Date();
        const thirtyDaysFromNow = new Date();
        thirtyDaysFromNow.setDate(today.getDate() + 30);

        const expired = products.filter(p => {
            if (!p.expiry_date) return false;
            return new Date(p.expiry_date) < today;
        });

        const expiringSoon = products.filter(p => {
            if (!p.expiry_date) return false;
            const expiryDate = new Date(p.expiry_date);
            return expiryDate >= today && expiryDate <= thirtyDaysFromNow;
        });

        const fresh = products.filter(p => {
            if (!p.expiry_date) return true;
            return new Date(p.expiry_date) > thirtyDaysFromNow;
        });

        setReportData({
            expired: expired.length,
            expiringSoon: expiringSoon.length,
            fresh: fresh.length,
            items: {
                expired,
                expiringSoon,
                fresh
            }
        });
    };

    const generateProfitReport = () => {
        const profitableProducts = products.filter(p => p.profit_margin > 0);
        const unprofitableProducts = products.filter(p => p.profit_margin <= 0);

        const totalProfitMargin = products.reduce((sum, p) => sum + (p.profit_margin * p.stock_quantity), 0);
        const avgProfitMargin = products.length > 0 ?
            products.reduce((sum, p) => sum + p.profit_margin, 0) / products.length : 0;

        setReportData({
            profitableProducts: profitableProducts.length,
            unprofitableProducts: unprofitableProducts.length,
            totalProfitMargin: totalProfitMargin,
            avgProfitMargin: avgProfitMargin,
            items: {
                profitableProducts: profitableProducts.sort((a, b) => b.profit_margin - a.profit_margin),
                unprofitableProducts
            }
        });
    };

    const generateSupplierReport = () => {
        const supplierStats = {};

        products.forEach(product => {
            const supplierId = product.supplier_id;
            const supplierName = product.supplier?.name_ar || 'غير محدد';

            if (!supplierStats[supplierId]) {
                supplierStats[supplierId] = {
                    name: supplierName,
                    totalProducts: 0,
                    totalValue: 0,
                    totalProfit: 0,
                    lowStockProducts: 0,
                    products: []
                };
            }

            supplierStats[supplierId].totalProducts += 1;
            supplierStats[supplierId].totalValue += product.cost_price * product.stock_quantity;
            supplierStats[supplierId].totalProfit += product.profit_margin * product.stock_quantity;

            if (product.stock_quantity <= product.min_stock_level) {
                supplierStats[supplierId].lowStockProducts += 1;
            }

            supplierStats[supplierId].products.push(product);
        });

        const sortedSuppliers = Object.values(supplierStats)
            .sort((a, b) => b.totalValue - a.totalValue);

        setReportData({
            suppliersCount: Object.keys(supplierStats).length,
            suppliers: sortedSuppliers
        });
    };

    const formatPrice = (price) => {
        if (!price || isNaN(price)) return '0 د.ع';
        return new Intl.NumberFormat('ar-IQ', {
            style: 'currency',
            currency: 'IQD',
            minimumFractionDigits: 0,
            maximumFractionDigits: 0
        }).format(price);
    };

    const exportToExcel = () => {
        // هنا يمكن إضافة مكتبة لتصدير Excel
        alert('سيتم إضافة تصدير Excel قريباً');
    };

    const reportTypes = [
        { id: 'stock', name: 'تقرير المخزون', icon: '📦' },
        { id: 'expiry', name: 'تقرير الصلاحية', icon: '⏰' },
        { id: 'profit', name: 'تقرير الأرباح', icon: '💰' },
        { id: 'supplier', name: 'تقرير الموردين', icon: '🏢' }
    ];

    const renderStockReport = () => (
        <div className="space-y-6">
            {/* الإحصائيات */}
            <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                <div className="bg-blue-50 p-4 rounded-lg">
                    <div className="text-blue-600 text-sm font-medium">إجمالي المنتجات</div>
                    <div className="text-2xl font-bold text-blue-900">{reportData.totalProducts}</div>
                </div>
                <div className="bg-green-50 p-4 rounded-lg">
                    <div className="text-green-600 text-sm font-medium">مخزون جيد</div>
                    <div className="text-2xl font-bold text-green-900">{reportData.goodStock}</div>
                </div>
                <div className="bg-yellow-50 p-4 rounded-lg">
                    <div className="text-yellow-600 text-sm font-medium">مخزون منخفض</div>
                    <div className="text-2xl font-bold text-yellow-900">{reportData.lowStock}</div>
                </div>
                <div className="bg-red-50 p-4 rounded-lg">
                    <div className="text-red-600 text-sm font-medium">نفد المخزون</div>
                    <div className="text-2xl font-bold text-red-900">{reportData.outOfStock}</div>
                </div>
            </div>

            {/* قيمة المخزون */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="bg-indigo-50 p-4 rounded-lg">
                    <div className="text-indigo-600 text-sm font-medium">إجمالي قيمة المخزون</div>
                    <div className="text-xl font-bold text-indigo-900">{formatPrice(reportData.totalValue)}</div>
                </div>
                <div className="bg-orange-50 p-4 rounded-lg">
                    <div className="text-orange-600 text-sm font-medium">قيمة المخزون المنخفض</div>
                    <div className="text-xl font-bold text-orange-900">{formatPrice(reportData.lowStockValue)}</div>
                </div>
            </div>

            {/* المنتجات المنخفضة المخزون */}
            {reportData.items?.lowStock?.length > 0 && (
                <div className="bg-white border border-gray-200 rounded-lg">
                    <div className="px-4 py-3 border-b border-gray-200 bg-yellow-50">
                        <h3 className="text-lg font-semibold text-yellow-900">المنتجات ذات المخزون المنخفض</h3>
                    </div>
                    <div className="p-4">
                        <div className="space-y-2">
                            {reportData.items.lowStock.map(product => (
                                <div key={product.id} className="flex justify-between items-center p-2 bg-yellow-50 rounded">
                                    <div>
                                        <div className="font-medium">{product.name_ar}</div>
                                        <div className="text-sm text-gray-600">الباركود: {product.barcode}</div>
                                    </div>
                                    <div className="text-right">
                                        <div className="text-yellow-700 font-medium">{product.stock_quantity} قطعة</div>
                                        <div className="text-xs text-gray-500">الحد الأدنى: {product.min_stock_level}</div>
                                    </div>
                                </div>
                            ))}
                        </div>
                    </div>
                </div>
            )}
        </div>
    );

    const renderExpiryReport = () => (
        <div className="space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div className="bg-red-50 p-4 rounded-lg">
                    <div className="text-red-600 text-sm font-medium">منتهية الصلاحية</div>
                    <div className="text-2xl font-bold text-red-900">{reportData.expired}</div>
                </div>
                <div className="bg-yellow-50 p-4 rounded-lg">
                    <div className="text-yellow-600 text-sm font-medium">تنتهي خلال 30 يوم</div>
                    <div className="text-2xl font-bold text-yellow-900">{reportData.expiringSoon}</div>
                </div>
                <div className="bg-green-50 p-4 rounded-lg">
                    <div className="text-green-600 text-sm font-medium">صالحة</div>
                    <div className="text-2xl font-bold text-green-900">{reportData.fresh}</div>
                </div>
            </div>

            {/* المنتجات منتهية الصلاحية */}
            {reportData.items?.expired?.length > 0 && (
                <div className="bg-white border border-red-200 rounded-lg">
                    <div className="px-4 py-3 border-b border-red-200 bg-red-50">
                        <h3 className="text-lg font-semibold text-red-900">منتجات منتهية الصلاحية</h3>
                    </div>
                    <div className="p-4">
                        <div className="space-y-2">
                            {reportData.items.expired.map(product => (
                                <div key={product.id} className="flex justify-between items-center p-2 bg-red-50 rounded">
                                    <div>
                                        <div className="font-medium">{product.name_ar}</div>
                                        <div className="text-sm text-gray-600">الباركود: {product.barcode}</div>
                                    </div>
                                    <div className="text-right">
                                        <div className="text-red-700 font-medium">{product.expiry_date}</div>
                                        <div className="text-xs text-gray-500">{product.stock_quantity} قطعة</div>
                                    </div>
                                </div>
                            ))}
                        </div>
                    </div>
                </div>
            )}
        </div>
    );

    return (
        <div className="bg-white border border-gray-200 rounded-lg">
            {/* Header */}
            <div className="px-6 py-4 border-b border-gray-200">
                <div className="flex justify-between items-center">
                    <h2 className="text-xl font-bold text-gray-900">تقارير المنتجات</h2>
                    <button
                        onClick={exportToExcel}
                        className="px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 flex items-center gap-2"
                    >
                        <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2}
                                  d="M12 10v6m0 0l-3-3m3 3l3-3m2 8H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                        </svg>
                        تصدير Excel
                    </button>
                </div>
            </div>

            {/* Tabs */}
            <div className="px-6 py-4 border-b border-gray-200">
                <div className="flex space-x-1 space-x-reverse bg-gray-100 p-1 rounded-lg">
                    {reportTypes.map((type) => (
                        <button
                            key={type.id}
                            onClick={() => setReportType(type.id)}
                            className={`flex-1 flex items-center justify-center gap-2 px-3 py-2 text-sm font-medium rounded-md transition-colors ${
                                reportType === type.id
                                    ? 'bg-white text-blue-700 shadow-sm'
                                    : 'text-gray-500 hover:text-gray-700'
                            }`}
                        >
                            <span>{type.icon}</span>
                            {type.name}
                        </button>
                    ))}
                </div>
            </div>

            {/* Content */}
            <div className="p-6">
                {reportType === 'stock' && renderStockReport()}
                {reportType === 'expiry' && renderExpiryReport()}
                {reportType === 'profit' && (
                    <div className="text-center py-8 text-gray-500">
                        تقرير الأرباح قيد التطوير...
                    </div>
                )}
                {reportType === 'supplier' && (
                    <div className="text-center py-8 text-gray-500">
                        تقرير الموردين قيد التطوير...
                    </div>
                )}
            </div>
        </div>
    );
};

export default ProductReports;
