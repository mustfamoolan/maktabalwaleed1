import React, { useState } from 'react';
import BarcodeGenerator from './BarcodeGenerator';
import BarcodeScanner from './BarcodeScanner';

const BarcodeManager = ({
    value,
    onChange,
    showGenerator = true,
    showScanner = true,
    generateAutomatic = true,
    className = '',
    label = 'الباركود'
}) => {
    const [activeTab, setActiveTab] = useState('generate');
    const [scannerActive, setScannerActive] = useState(false);
    const [barcodeInput, setBarcodeInput] = useState(value || '');

    // توليد باركود تلقائي
    const generateRandomBarcode = () => {
        const timestamp = Date.now().toString();
        const random = Math.floor(Math.random() * 1000).toString().padStart(3, '0');
        const newBarcode = `${timestamp.slice(-8)}${random}`;
        setBarcodeInput(newBarcode);
        if (onChange) onChange(newBarcode);
    };

    // عند تغيير الباركود يدوياً
    const handleInputChange = (e) => {
        const newValue = e.target.value;
        setBarcodeInput(newValue);
        if (onChange) onChange(newValue);
    };

    // عند قراءة باركود من الماسح
    const handleBarcodeDetected = (detectedCode) => {
        setBarcodeInput(detectedCode);
        if (onChange) onChange(detectedCode);
        setScannerActive(false);
        setActiveTab('generate');

        // إظهار رسالة نجاح
        const notification = document.createElement('div');
        notification.className = 'fixed top-4 right-4 bg-green-500 text-white px-6 py-3 rounded-lg shadow-lg z-50';
        notification.textContent = `تم قراءة الباركود: ${detectedCode}`;
        document.body.appendChild(notification);

        setTimeout(() => {
            document.body.removeChild(notification);
        }, 3000);
    };

    const tabs = [
        {
            id: 'generate',
            label: 'توليد',
            icon: (
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2}
                          d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                </svg>
            ),
            show: showGenerator
        },
        {
            id: 'scan',
            label: 'مسح',
            icon: (
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2}
                          d="M3 9a2 2 0 012-2h.93a2 2 0 001.664-.89l.812-1.22A2 2 0 0110.07 4h3.86a2 2 0 011.664.89l.812 1.22A2 2 0 0018.07 7H19a2 2 0 012 2v9a2 2 0 01-2 2H5a2 2 0 01-2-2V9z" />
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2}
                          d="M15 13a3 3 0 11-6 0 3 3 0 016 0z" />
                </svg>
            ),
            show: showScanner
        }
    ];

    const visibleTabs = tabs.filter(tab => tab.show);

    return (
        <div className={`bg-white border border-gray-200 rounded-lg ${className}`}>
            {/* Header */}
            <div className="p-4 border-b border-gray-200">
                <div className="flex items-center justify-between mb-4">
                    <h3 className="text-lg font-semibold text-gray-900">{label}</h3>
                    {generateAutomatic && (
                        <button
                            onClick={generateRandomBarcode}
                            className="px-3 py-1 bg-indigo-600 text-white text-sm rounded-md hover:bg-indigo-700 flex items-center gap-1"
                        >
                            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2}
                                      d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
                            </svg>
                            توليد تلقائي
                        </button>
                    )}
                </div>

                {/* Input للباركود */}
                <div className="mb-4">
                    <input
                        type="text"
                        value={barcodeInput}
                        onChange={handleInputChange}
                        placeholder="أدخل رقم الباركود أو استخدم المسح"
                        className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
                    />
                </div>

                {/* Tabs */}
                {visibleTabs.length > 1 && (
                    <div className="flex space-x-1 space-x-reverse bg-gray-100 p-1 rounded-lg">
                        {visibleTabs.map((tab) => (
                            <button
                                key={tab.id}
                                onClick={() => {
                                    setActiveTab(tab.id);
                                    if (tab.id === 'scan') {
                                        setScannerActive(true);
                                    } else {
                                        setScannerActive(false);
                                    }
                                }}
                                className={`flex-1 flex items-center justify-center gap-2 px-3 py-2 text-sm font-medium rounded-md transition-colors ${
                                    activeTab === tab.id
                                        ? 'bg-white text-indigo-700 shadow-sm'
                                        : 'text-gray-500 hover:text-gray-700'
                                }`}
                            >
                                {tab.icon}
                                {tab.label}
                            </button>
                        ))}
                    </div>
                )}
            </div>

            {/* Content */}
            <div className="p-4">
                {activeTab === 'generate' && showGenerator && (
                    <BarcodeGenerator
                        value={barcodeInput}
                        className="w-full"
                    />
                )}

                {activeTab === 'scan' && showScanner && (
                    <BarcodeScanner
                        isActive={scannerActive}
                        onDetected={handleBarcodeDetected}
                        onError={(error) => {
                            console.error('خطأ في قراءة الباركود:', error);
                        }}
                        className="w-full"
                    />
                )}
            </div>
        </div>
    );
};

export default BarcodeManager;
