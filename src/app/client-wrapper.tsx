'use client';

import { AppProvider, useAppContext } from '@/contexts/app-context';
import { AppShell } from '@/components/layout/app-shell';
import { FirebaseClientProvider, useFirebase } from '@/firebase';
import { useEffect } from 'react';
import { initializeFcm } from '@/firebase/fcm';
import { useToast } from '@/hooks/use-toast';
import { format } from 'date-fns';

function NotificationInitializer() {
  const { toast } = useToast();
  const { auth, firestore, isUserLoading, user } = useFirebase();
  const { settings } = useAppContext();

  // Effect for setting up PUSH notifications (FCM)
  useEffect(() => {
    if (typeof window === 'undefined' || !('Notification' in window) || isUserLoading || !settings.remindersEnabled) {
      return;
    }

    const setupPushNotifications = async () => {
      if (!auth || !firestore || !user) {
        return;
      }
      try {
        // We only request permission if it hasn't been granted or denied yet
        if (Notification.permission === 'default') {
            const permission = await Notification.requestPermission();
            if (permission === 'granted') {
              console.log('Notification permission granted.');
              const token = await initializeFcm(auth, firestore);
              if (token) {
                console.log("FCM Token:", token);
                toast({
                  title: "Push Notifications Enabled",
                  description: "You will now receive reminders.",
                });
              }
            } else {
              console.log('Notification permission denied.');
            }
        } else if (Notification.permission === 'granted') {
            // If already granted, just ensure the token is up-to-date
            await initializeFcm(auth, firestore);
        }
      } catch (error) {
        console.error('Error setting up push notifications:', error);
        toast({
          title: "Push Notification Error",
          description: "Could not enable push notifications.",
          variant: "destructive"
        });
      }
    };

    setupPushNotifications();
  }, [toast, auth, firestore, isUserLoading, user, settings.remindersEnabled]);
  
  // Effect for IN-APP reminders
  useEffect(() => {
    if (!settings.remindersEnabled || !settings.reminderTime) {
      return;
    }

    const intervalId = setInterval(() => {
      const now = new Date();
      const currentTime = format(now, 'HH:mm');
      
      // Check if the current time matches the reminder time
      if (currentTime === settings.reminderTime) {
        // To avoid spamming, we can check if we've already notified today.
        // We use localStorage for this simple check.
        const lastNotificationDate = localStorage.getItem('lastNotificationDate');
        const todayStr = format(now, 'yyyy-MM-dd');
        
        if (lastNotificationDate !== todayStr) {
            toast({
                title: "Attendance Reminder",
                description: "Don't forget to mark your attendance for today!",
            });
            localStorage.setItem('lastNotificationDate', todayStr);
        }
      }
    }, 60000); // Check every 60 seconds

    return () => clearInterval(intervalId); // Cleanup on unmount

  }, [settings.remindersEnabled, settings.reminderTime, toast]);


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
