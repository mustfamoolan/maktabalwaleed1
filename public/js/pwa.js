// PWA Installation and Features Handler
class PWAManager {
    constructor() {
        this.deferredPrompt = null;
        this.isInstalled = false;
        this.init();
    }

    async init() {
        await this.registerServiceWorker();
        this.setupInstallPrompt();
        this.setupPushNotifications();
        this.setupOfflineHandling();
        this.setupBackgroundSync();
        this.checkInstallStatus();
        this.addInstallButton();
    }

    // تسجيل Service Worker
    async registerServiceWorker() {
        if ('serviceWorker' in navigator) {
            try {
                const registration = await navigator.serviceWorker.register('/sw.js', {
                    scope: '/'
                });

                console.log('✅ Service Worker registered:', registration.scope);

                // التحديث التلقائي
                registration.addEventListener('updatefound', () => {
                    const newWorker = registration.installing;
                    newWorker.addEventListener('statechange', () => {
                        if (newWorker.state === 'installed' && navigator.serviceWorker.controller) {
                            this.showUpdateNotification();
                        }
                    });
                });

                // التحقق من التحديثات كل ساعة
                setInterval(() => {
                    registration.update();
                }, 60 * 60 * 1000);

            } catch (error) {
                console.error('❌ Service Worker registration failed:', error);
            }
        }
    }

    // إعداد دعوة التثبيت
    setupInstallPrompt() {
        window.addEventListener('beforeinstallprompt', (e) => {
            e.preventDefault();
            this.deferredPrompt = e;
            this.showInstallBanner();
        });

        // التعامل مع التثبيت الناجح
        window.addEventListener('appinstalled', () => {
            console.log('✅ PWA installed successfully');
            this.hideInstallBanner();
            this.isInstalled = true;
            this.showWelcomeMessage();
        });
    }

    // عرض بانر التثبيت
    showInstallBanner() {
        if (this.isInstalled) return;

        const banner = document.createElement('div');
        banner.id = 'pwa-install-banner';
        banner.innerHTML = `
            <div class="pwa-banner">
                <div class="pwa-banner-content">
                    <div class="pwa-banner-icon">📱</div>
                    <div class="pwa-banner-text">
                        <h3>ثبت التطبيق</h3>
                        <p>للحصول على تجربة أفضل وسرعة أكبر</p>
                    </div>
                    <div class="pwa-banner-actions">
                        <button class="pwa-install-btn" onclick="pwaManager.installApp()">تثبيت</button>
                        <button class="pwa-dismiss-btn" onclick="pwaManager.dismissInstallBanner()">لاحقاً</button>
                    </div>
                </div>
            </div>
        `;

        // إضافة الستايل
        const style = document.createElement('style');
        style.textContent = `
            .pwa-banner {
                position: fixed;
                top: 0;
                left: 0;
                right: 0;
                background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
                color: white;
                padding: 15px;
                box-shadow: 0 4px 20px rgba(0,0,0,0.3);
                z-index: 9999;
                animation: slideDown 0.5s ease;
            }

            .pwa-banner-content {
                display: flex;
                align-items: center;
                max-width: 1200px;
                margin: 0 auto;
                gap: 15px;
            }

            .pwa-banner-icon {
                font-size: 32px;
            }

            .pwa-banner-text h3 {
                margin: 0 0 5px 0;
                font-size: 18px;
            }

            .pwa-banner-text p {
                margin: 0;
                opacity: 0.9;
                font-size: 14px;
            }

            .pwa-banner-actions {
                margin-right: auto;
                display: flex;
                gap: 10px;
            }

            .pwa-install-btn, .pwa-dismiss-btn {
                padding: 8px 20px;
                border: none;
                border-radius: 25px;
                cursor: pointer;
                font-weight: bold;
                transition: all 0.3s ease;
            }

            .pwa-install-btn {
                background: #4CAF50;
                color: white;
            }

            .pwa-install-btn:hover {
                background: #45a049;
                transform: translateY(-2px);
            }

            .pwa-dismiss-btn {
                background: rgba(255,255,255,0.2);
                color: white;
            }

            .pwa-dismiss-btn:hover {
                background: rgba(255,255,255,0.3);
            }

            @keyframes slideDown {
                from { transform: translateY(-100%); }
                to { transform: translateY(0); }
            }

            @media (max-width: 768px) {
                .pwa-banner-content {
                    flex-direction: column;
                    text-align: center;
                    gap: 10px;
                }

                .pwa-banner-actions {
                    margin-right: 0;
                }
            }
        `;

        document.head.appendChild(style);
        document.body.appendChild(banner);
    }

    // تثبيت التطبيق
    async installApp() {
        if (!this.deferredPrompt) return;

        try {
            this.deferredPrompt.prompt();
            const result = await this.deferredPrompt.userChoice;

            if (result.outcome === 'accepted') {
                console.log('✅ User accepted PWA install');
            } else {
                console.log('❌ User dismissed PWA install');
            }

            this.deferredPrompt = null;
            this.hideInstallBanner();
        } catch (error) {
            console.error('❌ Install failed:', error);
        }
    }

    // إخفاء بانر التثبيت
    dismissInstallBanner() {
        this.hideInstallBanner();
        localStorage.setItem('pwa-install-dismissed', Date.now());
    }

    hideInstallBanner() {
        const banner = document.getElementById('pwa-install-banner');
        if (banner) {
            banner.style.animation = 'slideUp 0.5s ease';
            setTimeout(() => banner.remove(), 500);
        }
    }

    // إضافة زر التثبيت في القائمة
    addInstallButton() {
        const installBtn = document.createElement('button');
        installBtn.id = 'pwa-install-menu-btn';
        installBtn.innerHTML = '📱 تثبيت التطبيق';
        installBtn.className = 'pwa-menu-install-btn';
        installBtn.onclick = () => this.installApp();

        // البحث عن مكان مناسب لإضافة الزر
        const sidebar = document.querySelector('.sidebar-nav');
        if (sidebar && !this.isInstalled) {
            const style = document.createElement('style');
            style.textContent = `
                .pwa-menu-install-btn {
                    width: 100%;
                    background: linear-gradient(135deg, #4CAF50 0%, #45a049 100%);
                    color: white;
                    border: none;
                    padding: 12px;
                    margin: 10px 0;
                    border-radius: 8px;
                    cursor: pointer;
                    font-weight: bold;
                    transition: all 0.3s ease;
                }

                .pwa-menu-install-btn:hover {
                    transform: translateY(-2px);
                    box-shadow: 0 5px 15px rgba(76, 175, 80, 0.3);
                }
            `;
            document.head.appendChild(style);
            sidebar.appendChild(installBtn);
        }
    }

    // إعداد الإشعارات الفورية
    async setupPushNotifications() {
        if ('Notification' in window && 'serviceWorker' in navigator) {
            try {
                const permission = await Notification.requestPermission();

                if (permission === 'granted') {
                    console.log('✅ Notification permission granted');
                    this.schedulePeriodicNotifications();
                }
            } catch (error) {
                console.error('❌ Notification setup failed:', error);
            }
        }
    }

    // جدولة الإشعارات الدورية
    schedulePeriodicNotifications() {
        // إشعار ترحيبي بعد 5 دقائق
        setTimeout(() => {
            this.showNotification('مرحباً بك!', 'نظام إدارة المبيعات جاهز للاستخدام');
        }, 5 * 60 * 1000);

        // إشعارات دورية للتذكير
        setInterval(() => {
            if (document.hidden) {
                this.showNotification('تحديث البيانات', 'لا تنس تحديث بيانات المبيعات');
            }
        }, 2 * 60 * 60 * 1000); // كل ساعتين
    }

    // عرض إشعار
    showNotification(title, body, options = {}) {
        if ('serviceWorker' in navigator && navigator.serviceWorker.controller) {
            navigator.serviceWorker.controller.postMessage({
                type: 'SHOW_NOTIFICATION',
                title,
                body,
                options: {
                    icon: '/images/icon-192x192.png',
                    badge: '/images/badge-icon.png',
                    vibrate: [200, 100, 200],
                    ...options
                }
            });
        }
    }

    // معالجة الوضع غير المتصل
    setupOfflineHandling() {
        window.addEventListener('online', () => {
            this.showOnlineNotification();
            this.syncOfflineData();
        });

        window.addEventListener('offline', () => {
            this.showOfflineNotification();
        });

        // فحص الحالة الحالية
        if (!navigator.onLine) {
            this.showOfflineIndicator();
        }
    }

    showOnlineNotification() {
        this.showStatusNotification('🌐 عاد الاتصال', 'online');
    }

    showOfflineNotification() {
        this.showStatusNotification('📡 لا يوجد اتصال', 'offline');
        this.showOfflineIndicator();
    }

    showStatusNotification(message, type) {
        const notification = document.createElement('div');
        notification.className = `status-notification ${type}`;
        notification.textContent = message;

        const style = document.createElement('style');
        style.textContent = `
            .status-notification {
                position: fixed;
                top: 20px;
                left: 50%;
                transform: translateX(-50%);
                padding: 12px 24px;
                border-radius: 25px;
                color: white;
                font-weight: bold;
                z-index: 10000;
                animation: statusSlide 0.5s ease;
            }

            .status-notification.online {
                background: #4CAF50;
            }

            .status-notification.offline {
                background: #f44336;
            }

            @keyframes statusSlide {
                from { transform: translateX(-50%) translateY(-100%); }
                to { transform: translateX(-50%) translateY(0); }
            }
        `;

        document.head.appendChild(style);
        document.body.appendChild(notification);

        setTimeout(() => {
            notification.style.animation = 'statusSlide 0.5s ease reverse';
            setTimeout(() => notification.remove(), 500);
        }, 3000);
    }

    showOfflineIndicator() {
        if (document.getElementById('offline-indicator')) return;

        const indicator = document.createElement('div');
        indicator.id = 'offline-indicator';
        indicator.innerHTML = '📡 وضع غير متصل';

        const style = document.createElement('style');
        style.textContent = `
            #offline-indicator {
                position: fixed;
                bottom: 20px;
                right: 20px;
                background: #f44336;
                color: white;
                padding: 8px 16px;
                border-radius: 20px;
                font-size: 12px;
                font-weight: bold;
                z-index: 10000;
                box-shadow: 0 4px 12px rgba(0,0,0,0.3);
                animation: pulse 2s infinite;
            }

            @keyframes pulse {
                0% { opacity: 1; }
                50% { opacity: 0.7; }
                100% { opacity: 1; }
            }
        `;

        document.head.appendChild(style);
        document.body.appendChild(indicator);
    }

    // إعداد المزامنة في الخلفية
    setupBackgroundSync() {
        if ('serviceWorker' in navigator && 'sync' in window.ServiceWorkerRegistration.prototype) {
            // تسجيل مزامنة البيانات
            this.registerBackgroundSync('sync-sales-data');
        }
    }

    async registerBackgroundSync(tag) {
        try {
            const registration = await navigator.serviceWorker.ready;
            await registration.sync.register(tag);
            console.log('✅ Background sync registered:', tag);
        } catch (error) {
            console.error('❌ Background sync failed:', error);
        }
    }

    // مزامنة البيانات غير المتصلة
    async syncOfflineData() {
        // جلب البيانات المحفوظة محلياً
        const offlineData = this.getOfflineData();

        if (offlineData.length > 0) {
            try {
                const response = await fetch('/api/sync-offline-data', {
                    method: 'POST',
                    headers: {
                        'Content-Type': 'application/json',
                        'X-CSRF-TOKEN': document.querySelector('meta[name="csrf-token"]')?.content
                    },
                    body: JSON.stringify(offlineData)
                });

                if (response.ok) {
                    this.clearOfflineData();
                    this.showNotification('تم المزامنة', 'تم رفع البيانات المحفوظة محلياً');
                }
            } catch (error) {
                console.error('❌ Sync failed:', error);
            }
        }
    }

    // فحص حالة التثبيت
    checkInstallStatus() {
        // فحص إذا كان التطبيق مثبت
        if (window.matchMedia('(display-mode: standalone)').matches ||
            window.navigator.standalone === true) {
            this.isInstalled = true;
            document.body.classList.add('pwa-installed');
        }
    }

    // عرض رسالة ترحيب
    showWelcomeMessage() {
        const welcome = document.createElement('div');
        welcome.innerHTML = `
            <div class="pwa-welcome-message">
                <h3>🎉 مرحباً بك!</h3>
                <p>تم تثبيت نظام إدارة المبيعات بنجاح</p>
            </div>
        `;

        const style = document.createElement('style');
        style.textContent = `
            .pwa-welcome-message {
                position: fixed;
                top: 50%;
                left: 50%;
                transform: translate(-50%, -50%);
                background: white;
                padding: 30px;
                border-radius: 15px;
                box-shadow: 0 10px 30px rgba(0,0,0,0.3);
                text-align: center;
                z-index: 10001;
                animation: welcomeFade 0.5s ease;
            }

            @keyframes welcomeFade {
                from { opacity: 0; transform: translate(-50%, -50%) scale(0.8); }
                to { opacity: 1; transform: translate(-50%, -50%) scale(1); }
            }
        `;

        document.head.appendChild(style);
        document.body.appendChild(welcome);

        setTimeout(() => welcome.remove(), 3000);
    }

    // إظهار تحديث متاح
    showUpdateNotification() {
        const updateBtn = document.createElement('button');
        updateBtn.innerHTML = '🔄 تحديث متاح';
        updateBtn.className = 'pwa-update-btn';
        updateBtn.onclick = () => window.location.reload();

        const style = document.createElement('style');
        style.textContent = `
            .pwa-update-btn {
                position: fixed;
                bottom: 20px;
                left: 20px;
                background: #2196F3;
                color: white;
                border: none;
                padding: 12px 20px;
                border-radius: 25px;
                cursor: pointer;
                font-weight: bold;
                z-index: 10000;
                box-shadow: 0 4px 12px rgba(33, 150, 243, 0.3);
                animation: bounce 2s infinite;
            }

            @keyframes bounce {
                0%, 20%, 50%, 80%, 100% { transform: translateY(0); }
                40% { transform: translateY(-10px); }
                60% { transform: translateY(-5px); }
            }
        `;

        document.head.appendChild(style);
        document.body.appendChild(updateBtn);
    }

    // وظائف البيانات المحلية
    getOfflineData() {
        try {
            return JSON.parse(localStorage.getItem('offline-data') || '[]');
        } catch {
            return [];
        }
    }

    clearOfflineData() {
        localStorage.removeItem('offline-data');
    }

    // حفظ البيانات محلياً
    saveOfflineData(data) {
        const offlineData = this.getOfflineData();
        offlineData.push({
            ...data,
            timestamp: Date.now(),
            id: 'offline-' + Date.now()
        });
        localStorage.setItem('offline-data', JSON.stringify(offlineData));
    }
}

// تهيئة PWA Manager
let pwaManager;

document.addEventListener('DOMContentLoaded', () => {
    pwaManager = new PWAManager();
});

// تصدير للاستخدام العام
window.pwaManager = pwaManager;
