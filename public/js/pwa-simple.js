// PWA Manager مبسط
class SimplePWAManager {
    constructor() {
        this.init();
    }

    async init() {
        await this.registerServiceWorker();
        this.setupInstallPrompt();
        this.checkOnlineStatus();
    }

    // تسجيل Service Worker
    async registerServiceWorker() {
        if ('serviceWorker' in navigator) {
            try {
                const registration = await navigator.serviceWorker.register('/sw.js');
                console.log('PWA: Service Worker registered successfully');

                // التحقق من التحديثات
                registration.addEventListener('updatefound', () => {
                    console.log('PWA: Update found');
                });

            } catch (error) {
                console.error('PWA: Service Worker registration failed:', error);
            }
        }
    }

    // إعداد دعوة التثبيت
    setupInstallPrompt() {
        let deferredPrompt = null;

        window.addEventListener('beforeinstallprompt', (e) => {
            e.preventDefault();
            deferredPrompt = e;
            this.showInstallButton(deferredPrompt);
        });

        // التحقق من التثبيت
        window.addEventListener('appinstalled', () => {
            console.log('PWA: App installed successfully');
            this.hideInstallButton();
        });
    }

    // عرض زر التثبيت
    showInstallButton(deferredPrompt) {
        // إنشاء زر التثبيت إذا لم يكن موجوداً
        if (!document.getElementById('pwa-install-btn')) {
            const installBtn = document.createElement('button');
            installBtn.id = 'pwa-install-btn';
            installBtn.innerHTML = '📱 تثبيت التطبيق';
            installBtn.style.cssText = `
                position: fixed;
                bottom: 20px;
                right: 20px;
                background: #2196F3;
                color: white;
                border: none;
                padding: 12px 20px;
                border-radius: 8px;
                cursor: pointer;
                z-index: 9999;
                font-family: inherit;
                box-shadow: 0 4px 12px rgba(0,0,0,0.3);
            `;

            installBtn.addEventListener('click', async () => {
                if (deferredPrompt) {
                    deferredPrompt.prompt();
                    const result = await deferredPrompt.userChoice;
                    if (result.outcome === 'accepted') {
                        console.log('PWA: User accepted install');
                    }
                    deferredPrompt = null;
                    this.hideInstallButton();
                }
            });

            document.body.appendChild(installBtn);
        }
    }

    // إخفاء زر التثبيت
    hideInstallButton() {
        const installBtn = document.getElementById('pwa-install-btn');
        if (installBtn) {
            installBtn.remove();
        }
    }

    // مراقبة حالة الاتصال
    checkOnlineStatus() {
        const updateOnlineStatus = () => {
            const status = navigator.onLine ? 'متصل' : 'غير متصل';
            console.log('PWA: Connection status:', status);
        };

        window.addEventListener('online', updateOnlineStatus);
        window.addEventListener('offline', updateOnlineStatus);
        updateOnlineStatus();
    }
}

// تشغيل PWA Manager عند تحميل الصفحة
if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', () => {
        new SimplePWAManager();
    });
} else {
    new SimplePWAManager();
}

console.log('PWA: Simple PWA Manager loaded');
