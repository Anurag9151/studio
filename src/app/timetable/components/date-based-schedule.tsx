
'use client';

import { Suspense, useState, useEffect } from 'react';
import { Skeleton } from '@/components/ui/skeleton';
import { Calendar } from '@/components/ui/calendar';
import { Card, CardContent } from '@/components/ui/card';
import { useAppContext } from '@/contexts/app-context';
import { Button } from '@/components/ui/button';
import { useToast } from '@/hooks/use-toast';
import { format } from 'date-fns';
import { PartyPopper, Trash2 } from 'lucide-react';
import TodaySchedule from '@/app/dashboard/components/today-schedule';

export default function DateBasedSchedule() {
  const { holidays, setHolidays } = useAppContext();
  const { toast } = useToast();
  const [date, setDate] = useState<Date | undefined>(new Date());
  const [isClient, setIsClient] = useState(false);

  useEffect(() => {
    setIsClient(true);
  }, []);

  const holidayDates = holidays.map(h => {
    const [year, month, day] = h.date.split('-').map(Number);
    return new Date(year, month - 1, day);
  });

  const selectedDateStr = date ? format(date, 'yyyy-MM-dd') : '';
  const isHoliday = holidays.some(h => h.date === selectedDateStr);

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
      // Mark as holiday
      setHolidays(prev => [...prev, { id: crypto.randomUUID(), date: selectedDateStr }]);
      toast({
        title: "Holiday Marked!",
        description: `${format(date, 'do MMMM')} has been marked as a holiday.`,
      });
    }
  };

  return (
    <div className="space-y-6">
      <Card>
        <CardContent className="p-2 flex justify-center">
          {isClient ? (
              <Calendar
                  mode="single"
                  selected={date}
                  onSelect={setDate}
                  className="rounded-md"
                  modifiers={{ holidays: holidayDates }}
                  modifiersStyles={{ 
                    holidays: {
                      border: '2px solid hsl(var(--primary))',
                      borderRadius: 'var(--radius)',
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
      
       <Suspense fallback={<Skeleton className="h-40 w-full rounded-lg" />}>
        {date && (isHoliday ? (
          <div className="text-center text-muted-foreground py-10 bg-card rounded-lg shadow-sm">
              <p className="font-semibold text-lg">It's a Holiday! 🎉</p>
              <p>No classes scheduled.</p>
          </div>
        ) : (
          <TodaySchedule selectedDate={date} />
        ))}
      </Suspense>
    </div>
  );
}
