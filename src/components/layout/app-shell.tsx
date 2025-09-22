
'use client';

import { usePathname, useRouter } from 'next/navigation';
import Link from 'next/link';
import { Calendar, BarChart2, User, Home, Share2, ChevronLeft } from 'lucide-react';
import { cn } from '@/lib/utils';
import { AddSubjectSheet } from '@/app/timetable/components/add-subject-sheet';
import { Button } from '@/components/ui/button';
import { useToast } from '@/hooks/use-toast';

const navItems = [
  { href: '/dashboard', label: 'Home', icon: Home },
  { href: '/timetable', label: 'Timetable', icon: Calendar },
  { href: '/bunk-suggester', label: 'Analytics', icon: BarChart2 },
  { href: '/settings', label: 'Profile', icon: User },
];

export function AppShell({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();
  const router = useRouter();
  const { toast } = useToast();

  const getPageTitle = () => {
    if (pathname.includes('/dashboard')) return 'MarkIt';
    if (pathname.includes('/timetable')) return 'Timetable';
    if (pathname.includes('/bunk-suggester')) return 'Analytics';
    if (pathname.includes('/settings')) return 'Settings';
    return 'MarkIt';
  };

  const isSubPage = !['/dashboard', '/'].includes(pathname);
  const title = getPageTitle();

  const handleShare = async () => {
    const shareData = {
      title: 'MarkIt',
      text: 'Check out MarkIt, the smart attendance tracker!',
      url: window.location.origin,
    };

    if (navigator.share) {
      try {
        await navigator.share(shareData);
      } catch (error) {
        const err = error as Error;
        // If the user cancels the share dialog, do nothing.
        if (err.name === 'AbortError') {
          return;
        }
        // If sharing fails for other reasons, fall back to copying the link.
        copyLinkToClipboard();
      }
    } else {
      // Fallback for browsers that don't support navigator.share.
      copyLinkToClipboard();
    }
  };

  const copyLinkToClipboard = async () => {
     try {
        await navigator.clipboard.writeText(window.location.origin);
        toast({
          title: "Link Copied!",
          description: "App link copied to your clipboard."
        });
      } catch (err) {
         toast({
          title: "Error",
          description: "Could not copy link to clipboard.",
          variant: "destructive"
        });
      }
  }

  return (
    <div className="md:max-w-sm md:mx-auto bg-background min-h-screen flex flex-col relative">
      <header className="p-4 md:p-6 flex items-center justify-between sticky top-0 bg-background/80 backdrop-blur-sm z-10">
        <div className="flex items-center gap-2">
            {isSubPage && (
                <Button variant="ghost" size="icon" onClick={() => router.back()} className="h-10 w-10">
                    <ChevronLeft size={24} />
                </Button>
            )}
            <h1 className={cn(
                "font-bold tracking-tight",
                isSubPage ? "text-2xl" : "text-3xl"
            )}>{title}</h1>
        </div>
        
        <div className="flex items-center gap-2">
            {pathname.includes('/timetable') && (
                <AddSubjectSheet />
            )}
             <Button variant="ghost" size="icon" onClick={handleShare}>
                <Share2 size={20} />
            </Button>
        </div>
      </header>
      <main className="flex-1 overflow-y-auto pb-20">
        <div className="p-4 md:p-6 pt-0">
         {children}
        </div>
      </main>
      <footer className="fixed bottom-0 left-0 right-0 md:max-w-sm md:mx-auto md:left-auto z-10">
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
                      "flex flex-col items-center justify-center h-full w-full p-2 rounded-md transition-colors",
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
