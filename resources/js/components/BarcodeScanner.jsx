import React, { useRef, useState, useEffect } from 'react';
import Quagga from 'quagga';

const BarcodeScanner = ({ onDetected, onError, isActive = false, className = '' }) => {
    const scannerRef = useRef(null);
    const [isScanning, setIsScanning] = useState(false);
    const [error, setError] = useState(null);
    const [hasCamera, setHasCamera] = useState(true);

    useEffect(() => {
        if (isActive && hasCamera) {
            startScanner();
        } else {
            stopScanner();
        }

        return () => {
            stopScanner();
        };
    }, [isActive, hasCamera]);

    const startScanner = async () => {
        try {
            // التحقق من وجود كاميرا
            const devices = await navigator.mediaDevices.enumerateDevices();
            const videoDevices = devices.filter(device => device.kind === 'videoinput');

            if (videoDevices.length === 0) {
                setHasCamera(false);
                setError('لا توجد كاميرا متاحة على هذا الجهاز');
                return;
            }

            setError(null);
            setIsScanning(true);

            Quagga.init({
                inputStream: {
                    name: "Live",
                    type: "LiveStream",
                    target: scannerRef.current,
                    constraints: {
                        width: 640,
                        height: 480,
                        facingMode: "environment" // الكاميرا الخلفية للجوال
                    }
                },
                locator: {
                    patchSize: "medium",
                    halfSample: true
                },
                numOfWorkers: 2,
                frequency: 10,
                decoder: {
                    readers: [
                        "code_128_reader",
                        "ean_reader",
                        "ean_8_reader",
                        "code_39_reader",
                        "code_39_vin_reader",
                        "codabar_reader",
                        "upc_reader",
                        "upc_e_reader",
                        "i2of5_reader"
                    ]
                },
                locate: true
            }, (err) => {
                if (err) {
                    console.error('خطأ في تشغيل الماسح:', err);
                    setError('فشل في تشغيل الماسح: ' + err.message);
                    setIsScanning(false);
                    if (onError) onError(err);
                    return;
                }

                console.log('تم تشغيل ماسح الباركود بنجاح');
                Quagga.start();
            });

            // الاستماع لأحداث قراءة الباركود
            Quagga.onDetected((result) => {
                const code = result.codeResult.code;
                console.log('تم اكتشاف باركود:', code);

                if (onDetected) {
                    onDetected(code);
                }

                // إيقاف المسح بعد القراءة الناجحة
                stopScanner();
            });

        } catch (err) {
            console.error('خطأ في الوصول للكاميرا:', err);
            setError('فشل في الوصول للكاميرا: ' + err.message);
            setIsScanning(false);
            if (onError) onError(err);
        }
    };

    const stopScanner = () => {
        if (isScanning) {
            Quagga.stop();
            setIsScanning(false);
        }
    };

    const handleFileUpload = (event) => {
        const file = event.target.files[0];
        if (!file) return;

        const reader = new FileReader();
        reader.onload = (e) => {
            const img = new Image();
            img.onload = () => {
                // إنشاء canvas لمعالجة الصورة
                const canvas = document.createElement('canvas');
                const ctx = canvas.getContext('2d');
                canvas.width = img.width;
                canvas.height = img.height;
                ctx.drawImage(img, 0, 0);

                // محاولة قراءة الباركود من الصورة
                Quagga.decodeSingle({
                    decoder: {
                        readers: [
                            "code_128_reader",
                            "ean_reader",
                            "ean_8_reader",
                            "code_39_reader",
                            "upc_reader"
                        ]
                    },
                    locate: true,
                    src: e.target.result
                }, (result) => {
                    if (result && result.codeResult) {
                        console.log('تم قراءة الباركود من الصورة:', result.codeResult.code);
                        if (onDetected) {
                            onDetected(result.codeResult.code);
                        }
                    } else {
                        setError('لم يتم العثور على باركود في الصورة');
                    }
                });
            };
            img.src = e.target.result;
        };
        reader.readAsDataURL(file);

        // إعادة تعيين قيمة input لتمكين رفع نفس الملف مرة أخرى
        event.target.value = '';
    };

    if (!hasCamera) {
        return (
            <div className={`bg-yellow-50 border border-yellow-200 rounded-lg p-4 ${className}`}>
                <div className="text-center">
                    <svg className="mx-auto h-12 w-12 text-yellow-500 mb-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2}
                              d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-2.5L13.732 4c-.77-.833-1.964-.833-2.732 0L4.082 15.5c-.77.833.192 2.5 1.732 2.5z" />
                    </svg>
                    <h3 className="text-lg font-medium text-yellow-900 mb-2">لا توجد كاميرا متاحة</h3>
                    <p className="text-yellow-700 text-sm mb-4">يمكنك رفع صورة تحتوي على باركود بدلاً من ذلك</p>

                    <label className="inline-flex items-center px-4 py-2 bg-yellow-600 text-white rounded-md hover:bg-yellow-700 cursor-pointer">
                        <svg className="w-5 h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2}
                                  d="M7 16a4 4 0 01-.88-7.903A5 5 0 1115.9 6L16 6a5 5 0 011 9.9M15 13l-3-3m0 0l-3 3m3-3v12" />
                        </svg>
                        رفع صورة باركود
                        <input
                            type="file"
                            accept="image/*"
                            onChange={handleFileUpload}
                            className="hidden"
                        />
                    </label>
                </div>
            </div>
        );
    }

    return (
        <div className={`bg-white border border-gray-200 rounded-lg p-4 ${className}`}>
            {error && (
                <div className="mb-4 p-3 bg-red-50 border border-red-200 rounded-lg">
                    <div className="text-red-700 text-sm">{error}</div>
                </div>
            )}

            <div className="text-center">
                {!isActive ? (
                    <div className="py-8">
                        <svg className="mx-auto h-16 w-16 text-gray-400 mb-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1}
                                  d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z" />
                        </svg>
                        <p className="text-gray-500 text-sm">اضغط على زر المسح لبدء قراءة الباركود</p>
                    </div>
                ) : (
                    <>
                        <div ref={scannerRef} className="relative bg-black rounded-lg overflow-hidden mb-4" style={{minHeight: '300px'}}>
                            {isScanning && (
                                <div className="absolute inset-0 flex items-center justify-center">
                                    <div className="bg-black bg-opacity-50 text-white p-2 rounded">
                                        جاري البحث عن باركود...
                                    </div>
                                </div>
                            )}
                        </div>

                        <div className="text-sm text-gray-600 mb-4">
                            وجه الكاميرا نحو الباركود واتركها ثابتة
                        </div>
                    </>
                )}

                <div className="flex justify-center gap-2">
                    <label className="inline-flex items-center px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 cursor-pointer">
                        <svg className="w-5 h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2}
                                  d="M7 16a4 4 0 01-.88-7.903A5 5 0 1115.9 6L16 6a5 5 0 011 9.9M15 13l-3-3m0 0l-3 3m3-3v12" />
                        </svg>
                        رفع صورة
                        <input
                            type="file"
                            accept="image/*"
                            onChange={handleFileUpload}
                            className="hidden"
                        />
                    </label>
                </div>
            </div>
        </div>
    );
};

export default BarcodeScanner;
