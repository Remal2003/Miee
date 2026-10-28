// Give the service worker access to Firebase Messaging.
// Using standard compat scripts for maximum compatibility in Service Worker scope
importScripts('https://www.gstatic.com/firebasejs/10.13.0/firebase-app-compat.js');
importScripts('https://www.gstatic.com/firebasejs/10.13.0/firebase-messaging-compat.js');

const firebaseConfig = {
  apiKey: "AIzaSyAKlfM8_e1DqRrwRn38xnKoxUPRjQ6erpM",
  authDomain: "miee-38afa.firebaseapp.com",
  projectId: "miee-38afa",
  storageBucket: "miee-38afa.firebasestorage.app",
  messagingSenderId: "223594445887",
  appId: "1:223594445887:web:5a19ddc7f5800ab18d8c8a"
};

try {
  firebase.initializeApp(firebaseConfig);
} catch (e) {
  console.warn('[SW] Firebase init notice:', e);
}

let messaging = null;
try {
  messaging = firebase.messaging();
} catch (err) {
  console.warn('[SW] Firebase messaging init notice:', err);
}

// Background message handler from Firebase Cloud Messaging
if (messaging) {
  messaging.onBackgroundMessage((payload) => {
    console.log('[SW] onBackgroundMessage received:', payload);
    const title = payload.notification?.title || payload.data?.title || '🛍️ طلبية جديدة في Miee!';
    const body = payload.notification?.body || payload.data?.body || 'وصلت طلبية جديدة إلى المتجر، انقر للاطلاع عليها.';
    const options = {
      body,
      icon: '/miee-logo.png',
      badge: '/miee-logo.png',
      vibrate: [300, 100, 300, 100, 300],
      tag: payload.data?.orderId || 'miee-order-' + Date.now(),
      renotify: true,
      data: {
        url: payload.data?.url || '/#admin/orders'
      }
    };
    return self.registration.showNotification(title, options);
  });
}

// Standard Web Push Event listener (Fallback & Direct pushes)
self.addEventListener('push', (event) => {
  console.log('[SW] Push event received');
  let title = '🛍️ طلبية جديدة في Miee!';
  let options = {
    body: 'وصلت طلبية جديدة إلى المتجر، انقر للاطلاع على تفاصيلها.',
    icon: '/miee-logo.png',
    badge: '/miee-logo.png',
    vibrate: [300, 100, 300, 100, 300],
    tag: 'miee-order-' + Date.now(),
    renotify: true,
    data: {
      url: '/#admin/orders'
    }
  };

  if (event.data) {
    try {
      const data = event.data.json();
      if (data.notification?.title || data.title) {
        title = data.notification?.title || data.title;
      }
      if (data.notification?.body || data.body) {
        options.body = data.notification?.body || data.body;
      }
      if (data.data?.orderId || data.orderId) {
        options.tag = data.data?.orderId || data.orderId;
      }
      if (data.data?.url || data.url) {
        options.data.url = data.data?.url || data.url;
      }
    } catch {
      const text = event.data.text();
      if (text) options.body = text;
    }
  }

  event.waitUntil(self.registration.showNotification(title, options));
});

// Click on notification -> Focus or Open Admin Orders page
self.addEventListener('notificationclick', (event) => {
  event.notification.close();
  const targetUrl = event.notification.data?.url || '/#admin/orders';

  event.waitUntil(
    clients.matchAll({ type: 'window', includeUncontrolled: true }).then((windowClients) => {
      for (const client of windowClients) {
        if (client.url.includes('#admin') && 'focus' in client) {
          return client.focus();
        }
      }
      if (clients.openWindow) {
        return clients.openWindow(targetUrl);
      }
    })
  );
});

// Self-install & activate immediately
self.addEventListener('install', () => {
  self.skipWaiting();
});

self.addEventListener('activate', (event) => {
  event.waitUntil(clients.claim());
});
