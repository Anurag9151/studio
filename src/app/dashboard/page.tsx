import { Suspense } from 'react';
import SubjectWiseAttendance from "./components/subject-wise-attendance";
import { Skeleton } from '@/components/ui/skeleton';
import AttendanceSummary from './components/attendance-summary';
import TodaySchedule from './components/today-schedule';

export default function DashboardPage() {
  return (
    <div className="space-y-6">
      <Suspense fallback={<Skeleton className="h-24 w-full rounded-lg" />}>
        <AttendanceSummary />
      </Suspense>
       <h2 className="text-xl font-semibold tracking-tight">Today's Schedule</h2>
       <Suspense fallback={<Skeleton className="h-64 w-full" />}>
        <TodaySchedule />
      </Suspense>
       <Suspense fallback={<Skeleton className="h-40 w-full rounded-lg" />}>
        <SubjectWiseAttendance />
      </Suspense>
    </div>
  );
}
