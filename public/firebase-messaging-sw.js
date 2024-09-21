importScripts('https://www.gstatic.com/firebasejs/8.10.1/firebase-app.js');
importScripts(
  'https://www.gstatic.com/firebasejs/8.10.1/firebase-messaging.js'
);

let firebaseConfig;

// check if url contains localhost, if it does, use local firebase config

if (location.hostname.includes('localhost')) {
  firebaseConfig = {
    apiKey: 'AIzaSyBavib8ewQwONd7_PuQgSoJ1Yc7LBx7xWQ',
    authDomain: 'expo-manager-demo-notification.firebaseapp.com',
    projectId: 'expo-manager-demo-notification',
    storageBucket: 'expo-manager-demo-notification.appspot.com',
    messagingSenderId: '682417176673',
    appId: '1:682417176673:web:017069a78c6b96f24bea20',
    measurementId: 'G-MZMT9H3M22',
  };
} else {
  firebaseConfig = {
    apiKey: 'AIzaSyDiG5bpAJDQZLSBstilyMR8lNDpe9gm3bk',
    authDomain: 'expo-manager-notifications.firebaseapp.com',
    projectId: 'expo-manager-notifications',
    storageBucket: 'expo-manager-notifications.appspot.com',
    messagingSenderId: '262951829137',
    appId: '1:262951829137:web:7395591213fa12b15f4930',
    measurementId: 'G-56MHRQT1J9',
  };
}

// try {
//   firebaseConfig = JSON.parse(process.env.NEXT_PUBLIC_FIREBASE_CONFIG);
// } catch {
//   firebaseConfig = {
//     apiKey: 'AIzaSyBavib8ewQwONd7_PuQgSoJ1Yc7LBx7xWQ',
//     authDomain: 'expo-manager-demo-notification.firebaseapp.com',
//     projectId: 'expo-manager-demo-notification',
//     storageBucket: 'expo-manager-demo-notification.appspot.com',
//     messagingSenderId: '682417176673',
//     appId: '1:682417176673:web:017069a78c6b96f24bea20',
//     measurementId: 'G-MZMT9H3M22',
//   };
// }

//Insert to firebase-messaging-sw.js

firebase.initializeApp(firebaseConfig);

class CustomPushEvent extends Event {
  constructor(data) {
    super('push');

    Object.assign(this, data);
    this.custom = true;
  }
}

/*
 * Overrides push notification data, to avoid having 'notification' key and firebase blocking
 * the message handler from being called
 */
self.addEventListener('push', (e) => {
  // Skip if event is our own custom event
  if (e.custom) return;

  // Kep old event data to override
  const oldData = e.data;

  // Create a new event to dispatch, pull values from notification key and put it in data key,
  // and then remove notification key
  const newEvent = new CustomPushEvent({
    data: {
      ehheh: oldData.json(),
      json() {
        const newData = oldData.json();
        newData.data = {
          ...newData.data,
          ...newData.notification,
        };
        delete newData.notification;
        return newData;
      },
    },
    waitUntil: e.waitUntil.bind(e),
  });

  // Stop event propagation
  e.stopImmediatePropagation();

  // Dispatch the new wrapped event
  dispatchEvent(newEvent);
});

const messaging = firebase.messaging();

messaging.onBackgroundMessage((payload) => {
  // payload.fcmOptions?.link comes from our backend API route handle
  // payload.data.link comes from the Firebase Console where link is the 'key'
  const link =
    payload.fcmOptions?.link ||
    payload.data?.link ||
    payload.data?.click_action ||
    '/';

  const notificationTitle = payload.data.title;
  const notificationOptions = {
    body: payload.data.body,
    icon: './vercel.svg',
    data: { url: link },
  };
  self.registration.showNotification(notificationTitle, notificationOptions);
});

self.addEventListener('notificationclick', function (event) {
  // console.log('[firebase-messaging-sw.js] Notificación click recivida.');

  event.notification.close();

  // This checks if the client is already open and if it is, it focuses on the tab. If it is not open, it opens a new tab with the URL passed in the notification payload
  event.waitUntil(
    clients
      // https://developer.mozilla.org/en-US/docs/Web/API/Clients/matchAll
      .matchAll({ type: 'window', includeUncontrolled: true })
      .then(function (clientList) {
        const url = event.notification.data.url;

        if (!url) return;

        // If relative URL is passed in firebase console or API route handler, it may open a new window as the client.url is the full URL i.e. https://example.com/ and the url is /about whereas if we passed in the full URL, it will focus on the existing tab i.e. https://example.com/about
        for (const client of clientList) {
          if (client.url === url && 'focus' in client) {
            return client.focus();
          }
        }

        if (clients.openWindow) {
          // console.log('OPENWINDOW ON CLIENT');
          return clients.openWindow(url);
        }
      })
  );
});
