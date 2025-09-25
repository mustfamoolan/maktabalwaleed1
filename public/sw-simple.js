// Service Worker مبسط ومتوافق مع جميع المتصفحات
const CACHE_NAME = 'sales-system-v1.3.0';

// ملفات أساسية فقط
const ESSENTIAL_FILES = [
  '/',
  '/offline.html',
  '/manifest.json'
];

// تثبيت Service Worker
self.addEventListener('install', event => {
  console.log('PWA: Service Worker installing...');

  event.waitUntil(
    caches.open(CACHE_NAME)
      .then(cache => {
        console.log('PWA: Caching essential files');
        return cache.addAll(ESSENTIAL_FILES);
      })
      .then(() => {
        console.log('PWA: Service Worker installed successfully');
        return self.skipWaiting();
      })
      .catch(error => {
        console.error('PWA: Service Worker installation failed:', error);
      })
  );
});

// تفعيل Service Worker
self.addEventListener('activate', event => {
  console.log('PWA: Service Worker activating...');

  event.waitUntil(
    Promise.all([
      // تنظيف الكاش القديم
      caches.keys().then(cacheNames => {
        return Promise.all(
          cacheNames.filter(cacheName => cacheName !== CACHE_NAME)
            .map(cacheName => {
              console.log('PWA: Deleting old cache:', cacheName);
              return caches.delete(cacheName);
            })
        );
      }),
      // تولي السيطرة على جميع العملاء
      self.clients.claim()
    ]).then(() => {
      console.log('PWA: Service Worker activated successfully');
    })
  );
});

// اعتراض الطلبات (مبسط)
self.addEventListener('fetch', event => {
  const request = event.request;

  // تجاهل الطلبات غير HTTP/HTTPS
  if (!request.url.startsWith('http')) {
    return;
  }

  // تجاهل طلبات POST و PUT و DELETE
  if (request.method !== 'GET') {
    return;
  }

  // تجاهل مسارات الإدارة لتجنب مشاكل المصادقة
  if (request.url.includes('/admin/')) {
    return;
  }

  // استراتيجية بسيطة: Network First مع Fallback
  event.respondWith(
    fetch(request)
      .then(response => {
        // إذا كانت الاستجابة ناجحة، احفظها في الكاش
        if (response.ok) {
          const responseClone = response.clone();
          caches.open(CACHE_NAME)
            .then(cache => cache.put(request, responseClone))
            .catch(error => console.log('PWA: Cache put failed:', error));
        }
        return response;
      })
      .catch(() => {
        // إذا فشلت الشبكة، ابحث في الكاش
        return caches.match(request)
          .then(cachedResponse => {
            if (cachedResponse) {
              return cachedResponse;
            }

            // إذا كان طلب صفحة HTML، أعرض صفحة الأوف لاين
            if (request.destination === 'document') {
              return caches.match('/offline.html');
            }

            // للطلبات الأخرى، أرجع استجابة فارغة
            return new Response('', { status: 404 });
          });
      })
  );
});

console.log('PWA: Simple Service Worker loaded successfully!');
