import { FirebaseOptions, getApp, getApps, initializeApp } from 'firebase/app';
import { getMessaging, getToken, isSupported } from 'firebase/messaging';

let firebaseConfig: FirebaseOptions;

try {
  firebaseConfig = JSON.parse(process.env.NEXT_PUBLIC_FIREBASE_CONFIG!);
} catch {
  firebaseConfig = {
    apiKey: 'AIzaSyBavib8ewQwONd7_PuQgSoJ1Yc7LBx7xWQ',
    authDomain: 'expo-manager-demo-notification.firebaseapp.com',
    projectId: 'expo-manager-demo-notification',
    storageBucket: 'expo-manager-demo-notification.appspot.com',
    messagingSenderId: '682417176673',
    appId: '1:682417176673:web:017069a78c6b96f24bea20',
    measurementId: 'G-MZMT9H3M22',
  };
}

const app = getApps().length === 0 ? initializeApp(firebaseConfig) : getApp();

const messaging = async () => {
  const supported = await isSupported();
  return supported ? getMessaging(app) : null;
};

export const fetchToken = async () => {
  try {
    const firebaseMessaging = await messaging();

    if (firebaseMessaging) {
      const token = await getToken(firebaseMessaging, {
        vapidKey: process.env.NEXT_PUBLIC_FIREBASE_VAPID_KEY,
      });

      return token;
    }
  } catch (err) {
    console.error('Un error ocurrió al obtener el token:', err);
    return null;
  }
};

export { app, messaging };
