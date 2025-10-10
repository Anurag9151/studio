'use client';

import { getMessaging, getToken } from 'firebase/messaging';
import { getApp } from 'firebase/app';
import { Auth } from 'firebase/auth';
import { doc, Firestore, setDoc, serverTimestamp } from 'firebase/firestore';

export const initializeFcm = async (auth: Auth, firestore: Firestore) => {
  if (typeof window === 'undefined' || !auth.currentUser) {
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
      
      const userId = auth.currentUser.uid;
      const tokenRef = doc(firestore, 'fcmTokens', userId);
      
      // Save the token to Firestore
      await setDoc(tokenRef, {
        token: currentToken,
        createdAt: serverTimestamp(),
      });
      
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
