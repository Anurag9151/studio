
'use client';

import { Suspense, useState, useEffect } from 'react';
import SubjectWiseAttendance from "./components/subject-wise-attendance";
import { Skeleton } from '@/components/ui/skeleton';
import AttendanceSummary from './components/attendance-summary';
import { Calendar } from '@/components/ui/calendar';
import { Card, CardContent } from '@/components/ui/card';
import { useAppContext } from '@/contexts/app-context';
import { Button } from '@/components/ui/button';
import { useToast } from '@/hooks/use-toast';
import { format } from 'date-fns';
import { PartyPopper, Trash2 } from 'lucide-react';
import TodaySchedule from './components/today-schedule';
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "@/components/ui/alert-dialog";
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';

export default function DashboardPage() {
  const { holidays, setHolidays, attendanceRecords } = useAppContext();
  const { toast } = useToast();
  const [date, setDate] = useState<Date | undefined>(new Date());
  const [isClient, setIsClient] = useState(false);
  const [holidayReason, setHolidayReason] = useState('');
  const [isHolidayDialogOpen, setIsHolidayDialogOpen] = useState(false);

  useEffect(() => {
    setIsClient(true);
  }, []);

  const holidayDates = holidays.map(h => {
    const [year, month, day] = h.date.split('-').map(Number);
    return new Date(year, month - 1, day);
  });

  const attendedDates = attendanceRecords.map(r => {
    const [year, month, day] = r.date.split('-').map(Number);
    return new Date(year, month - 1, day);
  });


  const selectedDateStr = date ? format(date, 'yyyy-MM-dd') : '';
  const holidayDetails = holidays.find(h => h.date === selectedDateStr);
  const isHoliday = !!holidayDetails;

  const handleHolidayToggle = () => {
    if (!date) return;
    
    if (isHoliday) {
      // Unmark as holiday
      setHolidays(prev => prev.filter(h => h.date !== selectedDateStr));
      toast({
        title: "Holiday Removed",
        description: `${format(date, 'do MMMM')} is no longer a holiday.`,
      });
    } else {
      // Open dialog to mark as holiday
      setIsHolidayDialogOpen(true);
    }
  };

  const handleMarkHoliday = () => {
    if(!date) return;
    setHolidays(prev => [...prev, { id: crypto.randomUUID(), date: selectedDateStr, reason: holidayReason }]);
    toast({
        title: "Holiday Marked!",
        description: `${format(date, 'do MMMM')} has been marked as a holiday.`,
    });
    setHolidayReason('');
    setIsHolidayDialogOpen(false);
  }

  return (
    <div className="space-y-6">
      <Suspense fallback={<Skeleton className="h-24 w-full rounded-lg" />}>
        <AttendanceSummary />
      </Suspense>

      <Card>
        <CardContent className="p-2 flex justify-center">
          {isClient ? (
              <Calendar
                  mode="single"
                  selected={date}
                  onSelect={setDate}
                  className="rounded-md"
                  modifiers={{ holidays: holidayDates, attended: attendedDates }}
                  modifiersStyles={{ 
                    holidays: {
                      border: '2px solid hsl(var(--primary))',
                      borderRadius: 'var(--radius)',
                    },
                    attended: {
                        textDecoration: 'underline',
                        textDecorationColor: 'hsl(var(--primary))',
                        textDecorationThickness: '2px',
                        textUnderlineOffset: '3px'
                    }
                  }}
              />
          ) : (
            <Skeleton className="h-[280px] w-[280px]" />
          )}
        </CardContent>
      </Card>
      
      {date && (
        <div className="flex justify-center">
          <Button variant={isHoliday ? 'destructive' : 'outline'} onClick={handleHolidayToggle}>
            {isHoliday ? <Trash2 className="mr-2"/> : <PartyPopper className="mr-2" />}
            {isHoliday ? 'Unmark Holiday' : 'Mark as Holiday'}
          </Button>
        </div>
      )}

      {/* Dialog for adding holiday reason */}
      <AlertDialog open={isHolidayDialogOpen} onOpenChange={setIsHolidayDialogOpen}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Mark as Holiday</AlertDialogTitle>
            <AlertDialogDescription>
              Optionally, you can add a reason for the holiday on {date ? format(date, 'do MMMM') : ''}.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <div className="space-y-2">
            <Label htmlFor="holiday-reason">Reason for holiday (optional)</Label>
            <Input 
              id="holiday-reason"
              value={holidayReason}
              onChange={(e) => setHolidayReason(e.target.value)}
              placeholder="e.g. Festival, Family Function"
            />
          </div>
          <AlertDialogFooter>
            <AlertDialogCancel onClick={() => setHolidayReason('')}>Cancel</AlertDialogCancel>
            <AlertDialogAction onClick={handleMarkHoliday}>Mark Holiday</AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>


      <Suspense fallback={<Skeleton className="h-40 w-full rounded-lg" />}>
        {date && (isHoliday ? (
          <div className="text-center text-muted-foreground py-10 bg-card rounded-lg shadow-sm">
              <p className="font-semibold text-lg">It's a Holiday! 🎉</p>
              <p>{holidayDetails?.reason || 'No classes scheduled.'}</p>
          </div>
        ) : (
          <TodaySchedule selectedDate={date} />
        ))}
      </Suspense>

       <Suspense fallback={<Skeleton className="h-40 w-full rounded-lg" />}>
        <SubjectWiseAttendance />
      </Suspense>
    </div>
  );
}
