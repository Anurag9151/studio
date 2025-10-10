'use client';

import { AppProvider } from '@/contexts/app-context';
import { AppShell } from '@/components/layout/app-shell';
import { FirebaseClientProvider } from '@/firebase';

export default function ClientWrapper({ children }: { children: React.ReactNode }) {
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
