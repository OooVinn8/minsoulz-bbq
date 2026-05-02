importScripts("https://www.gstatic.com/firebasejs/10.12.2/firebase-app-compat.js");
importScripts("https://www.gstatic.com/firebasejs/10.12.2/firebase-messaging-compat.js");

firebase.initializeApp({
  apiKey: "AIzaSyCsfOGvVR7FtihQ51Iqaw1h5iJf0WFkU3Y",
  authDomain: "bbq-minsoulz.firebaseapp.com",
  databaseURL: "https://bbq-minsoulz-default-rtdb.asia-southeast1.firebasedatabase.app",
  projectId: "bbq-minsoulz",
  storageBucket: "bbq-minsoulz.firebasestorage.app",
  messagingSenderId: "788013415717",
  appId: "1:788013415717:web:21cf137065741bbe95aecc",
});

const messaging = firebase.messaging();

messaging.onBackgroundMessage((payload) => {
  const { title, body } = payload.notification;
  self.registration.showNotification(title, {
    body,
    icon: "/favicon.png",
    badge: "/favicon.png",
    vibrate: [200, 100, 200],
    tag: "bbq-notif",
  });
});