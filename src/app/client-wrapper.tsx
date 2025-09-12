'use client';

import { AppProvider } from '@/contexts/app-context';
import { AppShell } from '@/components/layout/app-shell';

export default function ClientWrapper({ children }: { children: React.ReactNode }) {
  return (
    <AppProvider>
      <AppShell>
        {children}
      </AppShell>
    </AppProvider>
  );
}
