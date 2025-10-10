'use client';

import { getMessaging, getToken } from 'firebase/messaging';
import { getApp } from 'firebase/app';

export const initializeFcm = async () => {
  if (typeof window === 'undefined') {
    return null;
  }

  const app = getApp();
  const messaging = getMessaging(app);
  
  // Public VAPID key from Firebase console
  // It's safe to expose this key
  const vapidKey = 'YOUR_PUBLIC_VAPID_KEY_FROM_FIREBASE_CONSOLE';

  try {
    const currentToken = await getToken(messaging, { vapidKey });
    if (currentToken) {
      console.log('FCM token:', currentToken);
      // You would typically send this token to your backend to store it.
      return currentToken;
    } else {
      console.log('No registration token available. Request permission to generate one.');
      return null;
    }
  } catch (err) {
    console.error('An error occurred while retrieving token. ', err);
    return null;
  }
};
