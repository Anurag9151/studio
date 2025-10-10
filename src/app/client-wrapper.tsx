'use client';

import { AppProvider } from '@/contexts/app-context';
import { AppShell } from '@/components/layout/app-shell';
import { FirebaseClientProvider, useFirebase } from '@/firebase';
import { useEffect } from 'react';
import { initializeFcm } from '@/firebase/fcm';
import { useToast } from '@/hooks/use-toast';

function NotificationInitializer() {
  const { toast } = useToast();
  const { auth, firestore, isUserLoading, user } = useFirebase();

  useEffect(() => {
    if (typeof window === 'undefined' || !('Notification' in window) || isUserLoading) {
      return;
    }

    const setupNotifications = async () => {
      if (!auth || !firestore || !user) {
        // Firebase services or user not ready
        return;
      }
      try {
        const permission = await Notification.requestPermission();
        if (permission === 'granted') {
          console.log('Notification permission granted.');
          const token = await initializeFcm(auth, firestore);
          if (token) {
            console.log("FCM Token:", token);
            toast({
              title: "Notifications Enabled",
              description: "You will now receive reminders.",
            });
          }
        } else {
          console.log('Notification permission denied.');
        }
      } catch (error) {
        console.error('Error setting up notifications:', error);
        toast({
          title: "Notification Error",
          description: "Could not enable notifications.",
          variant: "destructive"
        });
      }
    };

    setupNotifications();
  }, [toast, auth, firestore, isUserLoading, user]);

  return null; // This component does not render anything
}

export default function ClientWrapper({ children }: { children: React.ReactNode }) {
  return (
    <AppProvider>
      <FirebaseClientProvider>
        <AppShell>
          {children}
        </AppShell>
        <NotificationInitializer />
      </FirebaseClientProvider>
    </AppProvider>
  );
}
