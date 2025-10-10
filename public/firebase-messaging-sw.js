// This file should be in the 'public' directory

importScripts('https://www.gstatic.com/firebasejs/11.9.1/firebase-app-compat.js');
importScripts('https://www.gstatic.com/firebasejs/11.9.1/firebase-messaging-compat.js');

// IMPORTANT: Replace this with your project's Firebase config
const firebaseConfig = {
  apiKey: "AIzaSyAhQapODZUBLoxDlL8GUpmt3HnDHUnCzQ4",
  authDomain: "studio-8290817659-98d2e.firebaseapp.com",
  projectId: "studio-8290817659-98d2e",
  storageBucket: "studio-8290817659-98d2e.appspot.com",
  messagingSenderId: "360528934098",
  appId: "1:360528934098:web:3527b73a259a512930290b",
  measurementId: ""
};

firebase.initializeApp(firebaseConfig);

const messaging = firebase.messaging();

messaging.onBackgroundMessage((payload) => {
  console.log('[firebase-messaging-sw.js] Received background message ', payload);
  
  const notificationTitle = payload.notification.title;
  const notificationOptions = {
    body: payload.notification.body,
    icon: '/icon-192x192.png' // Make sure you have an icon in your public folder
  };

  self.registration.showNotification(notificationTitle, notificationOptions);
});
