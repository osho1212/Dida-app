/* eslint-disable no-undef */
// Firebase Messaging service worker for background notifications.
// Uses compat libraries because service workers cannot leverage imports yet.

importScripts("https://www.gstatic.com/firebasejs/12.4.0/firebase-app-compat.js");
importScripts("https://www.gstatic.com/firebasejs/12.4.0/firebase-messaging-compat.js");

firebase.initializeApp({
  apiKey: "AIzaSyDQHt3hOvtRioTfylntnbY2ud6OagiOCXM",
  authDomain: "dida-app-f5216.firebaseapp.com",
  projectId: "dida-app-f5216",
  storageBucket: "dida-app-f5216.firebasestorage.app",
  messagingSenderId: "1074070474603",
  appId: "1:1074070474603:web:cd370bd891c51642ce062e",
  measurementId: "G-VWF1S955C1"
});

const messaging = firebase.messaging();

messaging.onBackgroundMessage((payload) => {
  const notificationTitle = payload.notification?.title ?? "Dida Reminder";
  const notificationOptions = {
    body: payload.notification?.body ?? "Time to glow up your day!",
    icon: "/favicon.svg",
    tag: payload.notification?.tag ?? "dida-reminder"
  };

  self.registration.showNotification(notificationTitle, notificationOptions);
});
