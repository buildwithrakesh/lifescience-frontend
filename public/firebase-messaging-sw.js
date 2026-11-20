/* eslint-disable no-undef */
// Firebase Messaging Service Worker for background push notifications
// Project: lifesciencepharmaceutica-aed94
importScripts('https://www.gstatic.com/firebasejs/10.13.0/firebase-app-compat.js');
importScripts('https://www.gstatic.com/firebasejs/10.13.0/firebase-messaging-compat.js');

firebase.initializeApp({
  apiKey: "AIzaSyDejrkmgqYXLyImaQeYZYZ8evAAT-xRV3I",
  authDomain: "lifesciencepharmaceutica-aed94.firebaseapp.com",
  projectId: "lifesciencepharmaceutica-aed94",
  storageBucket: "lifesciencepharmaceutica-aed94.firebasestorage.app",
  messagingSenderId: "851638020273",
  appId: "1:851638020273:web:9b53dd7bbcec27de3f5a90"
});

const messaging = firebase.messaging();

messaging.onBackgroundMessage((payload) => {
  console.log('[Life Science FCM SW] Background message received:', payload);
  
  const title = payload.notification?.title || payload.data?.title || 'Life Science Pharmaceutical';
  const options = {
    body: payload.notification?.body || payload.data?.body || 'New clinical update and product offers available.',
    icon: payload.notification?.icon || '/favicon-32x32.png',
    badge: '/favicon-16x16.png',
    tag: payload.data?.tag || 'lifescience-notification',
    data: {
      url: payload.data?.url || '/',
      ...payload.data
    }
  };

  self.registration.showNotification(title, options);
});

self.addEventListener('notificationclick', (event) => {
  event.notification.close();
  const urlToOpen = event.notification.data?.url || '/';

  event.waitUntil(
    clients.matchAll({ type: 'window', includeUncontrolled: true }).then((windowClients) => {
      for (const client of windowClients) {
        if (client.url.includes(self.location.origin) && 'focus' in client) {
          return client.focus();
        }
      }
      if (clients.openWindow) {
        return clients.openWindow(urlToOpen);
      }
    })
  );
});
