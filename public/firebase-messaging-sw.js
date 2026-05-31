importScripts('https://www.gstatic.com/firebasejs/10.12.0/firebase-app-compat.js');
importScripts('https://www.gstatic.com/firebasejs/10.12.0/firebase-messaging-compat.js');

firebase.initializeApp({
  apiKey: "AIzaSyCyX2BfJq0LE6zx-KplMTjdGlyUsMAktcM",
  authDomain: "board-app-cc85f.firebaseapp.com",
  databaseURL: "https://board-app-cc85f-default-rtdb.europe-west1.firebasedatabase.app",
  projectId: "board-app-cc85f",
  storageBucket: "board-app-cc85f.firebasestorage.app",
  messagingSenderId: "903369317017",
  appId: "1:903369317017:web:70aefd28d9371d146b3608"
});

const messaging = firebase.messaging();

// Handle background notifications
messaging.onBackgroundMessage(function(payload) {
  const { title, body } = payload.notification;
  self.registration.showNotification(title, {
    body,
    icon: '/board_app/icon-192.png',
  });
});