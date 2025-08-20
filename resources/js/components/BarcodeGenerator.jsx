import React, { useEffect, useRef, useState } from 'react';
import JsBarcode from 'jsbarcode';

const BarcodeGenerator = ({
    value,
    format = 'CODE128',
    width = 2,
    height = 100,
    displayValue = true,
    onGenerate = null,
    className = ''
}) => {
    const canvasRef = useRef(null);
    const [isGenerated, setIsGenerated] = useState(false);
    const [error, setError] = useState(null);

    useEffect(() => {
        if (value && canvasRef.current) {
            try {
                JsBarcode(canvasRef.current, value, {
                    format: format,
                    width: width,
                    height: height,
                    displayValue: displayValue,
                    fontSize: 14,
                    textAlign: 'center',
                    textPosition: 'bottom',
                    textMargin: 2,
                    background: '#ffffff',
                    lineColor: '#000000',
                    margin: 10
                });
                setIsGenerated(true);
                setError(null);

                if (onGenerate) {
                    onGenerate(canvasRef.current.toDataURL());
                }
            } catch (err) {
                setError('خطأ في توليد الباركود: ' + err.message);
                setIsGenerated(false);
            }
        }
    }, [value, format, width, height, displayValue]);

    const downloadBarcode = () => {
        if (canvasRef.current && isGenerated) {
            const link = document.createElement('a');
            link.download = `barcode-${value}.png`;
            link.href = canvasRef.current.toDataURL();
            link.click();
        }
    };

    const printBarcode = () => {
        if (canvasRef.current && isGenerated) {
            const printWindow = window.open('', '_blank');
            const canvas = canvasRef.current;

            printWindow.document.write(`
                <html>
                    <head>
                        <title>طباعة باركود - ${value}</title>
                        <style>
                            body {
                                margin: 0;
                                padding: 20px;
                                display: flex;
                                justify-content: center;
                                align-items: center;
                                min-height: 100vh;
                                font-family: Arial, sans-serif;
                            }
                            .barcode-container {
                                text-align: center;
                                border: 2px solid #000;
                                padding: 20px;
                                background: white;
                            }
                            h3 { margin: 0 0 15px 0; }
                            @media print {
                                body { margin: 0; }
                                .barcode-container { border: none; }
                            }
                        </style>
                    </head>
                    <body>
                        <div class="barcode-container">
                            <h3>الباركود: ${value}</h3>
                            <img src="${canvas.toDataURL()}" alt="Barcode" />
                        </div>
                    </body>
                </html>
            `);

            printWindow.document.close();
            printWindow.focus();

            setTimeout(() => {
                printWindow.print();
                printWindow.close();
            }, 250);
        }
    };

    if (!value) {
        return (
            <div className={`bg-gray-50 border-2 border-dashed border-gray-300 rounded-lg p-8 text-center ${className}`}>
                <div className="text-gray-400">
                    <svg className="mx-auto h-12 w-12 mb-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1}
                              d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                    </svg>
                    <p className="text-sm">أدخل رقم الباركود لمعاينة الباركود</p>
                </div>
            </div>
        );
    }

    return (
        <div className={`bg-white border border-gray-200 rounded-lg p-4 ${className}`}>
            {error ? (
                <div className="text-red-600 text-center p-4">
                    <div className="text-sm">{error}</div>
                </div>
            ) : (
                <>
                    <div className="text-center mb-4">
                        <canvas ref={canvasRef} className="max-w-full h-auto" />
                    </div>

                    {isGenerated && (
                        <div className="flex justify-center gap-2 mt-4">
                            <button
                                onClick={downloadBarcode}
                                className="px-3 py-1 bg-blue-600 text-white text-sm rounded-md hover:bg-blue-700 flex items-center gap-1"
                            >
                                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2}
                                          d="M12 10v6m0 0l-3-3m3 3l3-3m2 8H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                                </svg>
                                تحميل
                            </button>
                            <button
                                onClick={printBarcode}
                                className="px-3 py-1 bg-green-600 text-white text-sm rounded-md hover:bg-green-700 flex items-center gap-1"
                            >
                                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2}
                                          d="M17 17h2a2 2 0 002-2v-4a2 2 0 00-2-2H5a2 2 0 00-2 2v4a2 2 0 002 2h2m2 4h6a2 2 0 002-2v-4a2 2 0 00-2-2H9a2 2 0 00-2 2v4a2 2 0 002 2zm8-12V5a2 2 0 00-2-2H9a2 2 0 00-2 2v4h10z" />
                                </svg>
                                طباعة
                            </button>
                        </div>
                    )}
                </>
            )}
        </div>
    );
};

export default BarcodeGenerator;
