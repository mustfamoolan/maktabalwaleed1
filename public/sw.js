const CACHE_NAME = 'sales-system-v1.2.0';
const STATIC_CACHE = 'static-cache-v1.2.0';
const DYNAMIC_CACHE = 'dynamic-cache-v1.2.0';
const IMAGE_CACHE = 'image-cache-v1.2.0';

// الملفات الأساسية للتخزين المؤقت
const STATIC_ASSETS = [
  '/',
  '/admin/dashboard',
  '/admin/representatives',
  '/admin/products',
  '/admin/suppliers',
  '/css/app.css',
  '/css/sidebar.css',
  '/js/app.js',
  '/images/logo.png',
  '/images/default-product.svg',
  '/images/no-product-image.svg',
  '/manifest.json',
  '/offline.html'
];

// استراتيجيات التخزين المؤقت
const cacheStrategies = {
  // Network First - للبيانات الديناميكية
  networkFirst: [
    '/admin/representatives',
    '/admin/products',
    '/admin/suppliers',
    '/admin/categories',
    '/admin/sales-plans'
  ],

  // Cache First - للملفات الثابتة
  cacheFirst: [
    '/css/',
    '/js/',
    '/images/',
    '/build/'
  ],

  // Stale While Revalidate - للصفحات
  staleWhileRevalidate: [
    '/admin/dashboard',
    '/admin/'
  ]
};

// تثبيت Service Worker
self.addEventListener('install', event => {
  console.log('🔧 Service Worker: Installing...');

  event.waitUntil(
    Promise.all([
      // تخزين الملفات الثابتة
      caches.open(STATIC_CACHE).then(cache => {
        console.log('📦 Pre-caching static assets');
        return cache.addAll(STATIC_ASSETS.map(url => new Request(url, {
          cache: 'reload'
        })));
      }),

      // تخزين صفحة الأوف لاين
      caches.open(DYNAMIC_CACHE).then(cache => {
        return cache.add('/offline.html');
      })
    ]).then(() => {
      console.log('✅ Service Worker: Installation completed');
      return self.skipWaiting();
    }).catch(error => {
      console.error('❌ Service Worker: Installation failed', error);
    })
  );
});

// تفعيل Service Worker
self.addEventListener('activate', event => {
  console.log('🚀 Service Worker: Activating...');

  event.waitUntil(
    Promise.all([
      // تنظيف الكاش القديم
      caches.keys().then(cacheNames => {
        return Promise.all(
          cacheNames.filter(cacheName => {
            return cacheName !== STATIC_CACHE &&
                   cacheName !== DYNAMIC_CACHE &&
                   cacheName !== IMAGE_CACHE;
          }).map(cacheName => {
            console.log('🗑️ Deleting old cache:', cacheName);
            return caches.delete(cacheName);
          })
        );
      }),

      // تولي السيطرة على جميع العملاء
      self.clients.claim()
    ]).then(() => {
      console.log('✅ Service Worker: Activation completed');
    })
  );
});

// اعتراض الطلبات
self.addEventListener('fetch', event => {
  const request = event.request;
  const url = new URL(request.url);

  // تجاهل الطلبات غير HTTP/HTTPS
  if (!request.url.startsWith('http')) return;

  // تجاهل طلبات CSRF
  if (request.url.includes('csrf-token')) return;

  // تجاهل مسارات الإدارة المحمية لتجنب مشاكل المصادقة
  if (url.pathname.startsWith('/admin/') && request.method === 'GET') {
    // دع المتصفح يتعامل مع مسارات الإدارة مباشرة
    return;
  }

  // اختيار الاستراتيجية المناسبة
  event.respondWith(
    getResponseStrategy(request, url)
  );
});

// اختيار استراتيجية الاستجابة
async function getResponseStrategy(request, url) {
  const pathname = url.pathname;

  try {
    // Network First للبيانات الديناميكية
    if (shouldUseNetworkFirst(pathname)) {
      return await networkFirstStrategy(request);
    }

    // Cache First للملفات الثابتة
    if (shouldUseCacheFirst(pathname)) {
      return await cacheFirstStrategy(request);
    }

    // Stale While Revalidate للصفحات
    if (shouldUseStaleWhileRevalidate(pathname)) {
      return await staleWhileRevalidateStrategy(request);
    }

    // الافتراضي: Network First
    return await networkFirstStrategy(request);

  } catch (error) {
    console.error('❌ Fetch strategy failed:', error);
    return await fallbackResponse(request);
  }
}

// Network First Strategy
async function networkFirstStrategy(request) {
  try {
    const networkResponse = await fetch(request);

    if (networkResponse.ok) {
      const cache = await caches.open(DYNAMIC_CACHE);
      cache.put(request, networkResponse.clone());
    }

    return networkResponse;
  } catch (error) {
    const cachedResponse = await caches.match(request);
    return cachedResponse || await fallbackResponse(request);
  }
}

// Cache First Strategy
async function cacheFirstStrategy(request) {
  const cachedResponse = await caches.match(request);

  if (cachedResponse) {
    return cachedResponse;
  }

  try {
    const networkResponse = await fetch(request);

    if (networkResponse.ok) {
      const cacheName = request.url.includes('/images/') ? IMAGE_CACHE : STATIC_CACHE;
      const cache = await caches.open(cacheName);
      cache.put(request, networkResponse.clone());
    }

    return networkResponse;
  } catch (error) {
    return await fallbackResponse(request);
  }
}

// Stale While Revalidate Strategy
async function staleWhileRevalidateStrategy(request) {
  const cachedResponse = await caches.match(request);

  const networkResponsePromise = fetch(request).then(networkResponse => {
    if (networkResponse.ok) {
      const cache = caches.open(DYNAMIC_CACHE);
      cache.then(c => c.put(request, networkResponse.clone()));
    }
    return networkResponse;
  }).catch(() => null);

  return cachedResponse || await networkResponsePromise || await fallbackResponse(request);
}

// فحص الاستراتيجيات
function shouldUseNetworkFirst(pathname) {
  return cacheStrategies.networkFirst.some(pattern =>
    pathname.includes(pattern)
  );
}

function shouldUseCacheFirst(pathname) {
  return cacheStrategies.cacheFirst.some(pattern =>
    pathname.includes(pattern)
  );
}

function shouldUseStaleWhileRevalidate(pathname) {
  return cacheStrategies.staleWhileRevalidate.some(pattern =>
    pathname.includes(pattern)
  );
}

// الاستجابة الاحتياطية
async function fallbackResponse(request) {
  const url = new URL(request.url);

  // للصفحات HTML
  if (request.destination === 'document') {
    const offlinePage = await caches.match('/offline.html');
    return offlinePage || new Response('صفحة غير متاحة بدون اتصال', {
      status: 503,
      headers: { 'Content-Type': 'text/html; charset=utf-8' }
    });
  }

  // للصور
  if (request.destination === 'image') {
    const fallbackImage = await caches.match('/images/default-product.svg');
    return fallbackImage || new Response('', { status: 404 });
  }

  // للـ API
  if (url.pathname.includes('/api/')) {
    return new Response(JSON.stringify({
      error: 'غير متاح بدون اتصال',
      offline: true
    }), {
      status: 503,
      headers: { 'Content-Type': 'application/json; charset=utf-8' }
    });
  }

  return new Response('المورد غير متاح', { status: 503 });
}

// مزامنة البيانات في الخلفية
self.addEventListener('sync', event => {
  console.log('🔄 Background Sync:', event.tag);

  if (event.tag === 'sync-sales-data') {
    event.waitUntil(syncSalesData());
  }
});

// مزامنة بيانات المبيعات
async function syncSalesData() {
  try {
    // جلب البيانات المحفوظة محلياً
    const offlineData = await getOfflineData();

    if (offlineData.length > 0) {
      // إرسال البيانات للخادم
      const response = await fetch('/api/sync-offline-data', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'X-CSRF-TOKEN': await getCsrfToken()
        },
        body: JSON.stringify(offlineData)
      });

      if (response.ok) {
        // حذف البيانات المحلية بعد المزامنة
        await clearOfflineData();
        console.log('✅ Data synced successfully');
      }
    }
  } catch (error) {
    console.error('❌ Sync failed:', error);
  }
}

// إشعارات دفع
self.addEventListener('push', event => {
  console.log('📬 Push notification received');

  const options = {
    body: event.data ? event.data.text() : 'إشعار جديد من نظام المبيعات',
    icon: '/images/icon-192x192.png',
    badge: '/images/badge-icon.png',
    vibrate: [200, 100, 200],
    data: {
      url: '/'
    },
    actions: [
      {
        action: 'view',
        title: 'عرض',
        icon: '/images/view-icon.png'
      },
      {
        action: 'dismiss',
        title: 'إغلاق',
        icon: '/images/close-icon.png'
      }
    ]
  };

  event.waitUntil(
    self.registration.showNotification('نظام إدارة المبيعات', options)
  );
});

// التعامل مع نقرات الإشعارات
self.addEventListener('notificationclick', event => {
  event.notification.close();

  if (event.action === 'view') {
    event.waitUntil(
      clients.openWindow(event.notification.data.url || '/')
    );
  }
});

// وظائف مساعدة
async function getOfflineData() {
  // جلب البيانات المحفوظة محلياً من IndexedDB
  return [];
}

async function clearOfflineData() {
  // حذف البيانات المحلية
}

async function getCsrfToken() {
  try {
    const response = await fetch('/api/csrf-token');
    const data = await response.json();
    return data.token;
  } catch {
    return '';
  }
}

console.log('🎯 Sales System Service Worker loaded successfully!');
