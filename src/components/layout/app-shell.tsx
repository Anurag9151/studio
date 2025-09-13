'use client';

import { usePathname, useRouter } from 'next/navigation';
import Link from 'next/link';
import { Calendar, BarChart2, User, Home, Plus, MoreVertical, ChevronLeft, Menu } from 'lucide-react';
import { cn } from '@/lib/utils';
import { AddSubjectSheet } from '@/app/timetable/components/add-subject-sheet';
import { Button } from '@/components/ui/button';

const navItems = [
  { href: '/dashboard', label: 'Home', icon: Home },
  { href: '/timetable', label: 'Timetable', icon: Calendar },
  { href: '/bunk-suggester', label: 'Analytics', icon: BarChart2 },
  { href: '/settings', label: 'Profile', icon: User },
];

export function AppShell({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();
  const router = useRouter();

  const getPageTitle = () => {
    if (pathname.includes('/dashboard')) return 'My Attendance Tracker';
    if (pathname.includes('/timetable')) return 'Timetable';
    if (pathname.includes('/bunk-suggester')) return 'Analytics';
    if (pathname.includes('/settings')) return 'Settings';
    return 'My Attendance Tracker';
  };

  const isSubPage = pathname !== '/dashboard' && pathname !== '/';
  const title = getPageTitle();

  return (
    <div className="md:max-w-sm md:mx-auto bg-background min-h-screen flex flex-col">
      <header className="p-4 md:p-6">
        <h1 className="text-3xl font-bold tracking-tight">{title}</h1>
      </header>
      <main className="flex-1 p-4 md:p-6 pt-0">
        {children}
      </main>
      <footer className="sticky bottom-0 left-0 right-0 md:max-w-sm md:mx-auto md:left-auto">
        {pathname.includes('/timetable') ? (
           <div className="absolute -top-20 right-6">
             <AddSubjectSheet>
                <Button size="icon" className="rounded-full w-14 h-14 shadow-lg">
                    <Plus size={28} />
                </Button>
            </AddSubjectSheet>
           </div>
        ) : null}
        <BottomNavBar pathname={pathname} />
      </footer>
    </div>
  );
}

function BottomNavBar({ pathname }: { pathname: string }) {
    return (
      <nav className="bg-card shadow-t-lg rounded-t-2xl">
          <div className="flex justify-around items-center h-16">
              {navItems.map((item) => {
              const isActive = pathname === item.href;
              return (
                  <Link key={item.href} href={item.href} className={cn(
                      "flex flex-col items-center gap-1 p-2 rounded-md transition-colors",
                      isActive ? 'text-primary' : 'text-muted-foreground hover:text-primary/80'
                  )}>
                      <item.icon className="w-6 h-6" fill={isActive ? 'currentColor' : 'none'} />
                  </Link>
              );
              })}
          </div>
      </nav>
    )
}

import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
