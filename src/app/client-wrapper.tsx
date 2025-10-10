'use client';

import { AppProvider } from '@/contexts/app-context';
import { AppShell } from '@/components/layout/app-shell';
import { FirebaseClientProvider } from '@/firebase';
import { useEffect } from 'react';
import { initializeFcm } from '@/firebase/fcm';
import { useToast } from '@/hooks/use-toast';

export default function ClientWrapper({ children }: { children: React.ReactNode }) {
  const { toast } = useToast();

  useEffect(() => {
    const setupNotifications = async () => {
      try {
        const permission = await Notification.requestPermission();
        if (permission === 'granted') {
          console.log('Notification permission granted.');
          const token = await initializeFcm();
          if(token) {
            console.log("FCM Token:", token);
            // Here you would typically send the token to your server
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

    if (typeof window !== 'undefined' && 'Notification' in window) {
      // Only run on client and if notifications are supported
      setupNotifications();
    }
  }, [toast]);

  return (
    <AppProvider>
      <FirebaseClientProvider>
        <AppShell>
          {children}
        </AppShell>
      </FirebaseClientProvider>
    </AppProvider>
  );
}
