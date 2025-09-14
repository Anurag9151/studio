
'use client';

import { Suspense, useState } from 'react';
import SubjectWiseAttendance from "./components/subject-wise-attendance";
import { Skeleton } from '@/components/ui/skeleton';
import AttendanceSummary from './components/attendance-summary';
import TodaySchedule from './components/today-schedule';
import { Calendar } from '@/components/ui/calendar';
import { Card, CardContent } from '@/components/ui/card';

export default function DashboardPage() {
  const [date, setDate] = useState<Date | undefined>(new Date());

  return (
    <div className="space-y-6">
      <Suspense fallback={<Skeleton className="h-24 w-full rounded-lg" />}>
        <AttendanceSummary />
      </Suspense>
      
      <Card>
        <CardContent className="p-2 flex justify-center">
            <Calendar
                mode="single"
                selected={date}
                onSelect={setDate}
                className="rounded-md"
            />
        </CardContent>
      </Card>

       <h2 className="text-xl font-semibold tracking-tight">Schedule for {date ? date.toLocaleDateString('en-US', { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric'}) : '...'}</h2>
       <Suspense fallback={<Skeleton className="h-64 w-full" />}>
        <TodaySchedule selectedDate={date || new Date()} />
      </Suspense>
       <Suspense fallback={<Skeleton className="h-40 w-full rounded-lg" />}>
        <SubjectWiseAttendance />
      </Suspense>
    </div>
  );
}
