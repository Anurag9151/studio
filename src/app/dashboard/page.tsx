import { Suspense } from 'react';
import SubjectWiseAttendance from "./components/subject-wise-attendance";
import { Skeleton } from '@/components/ui/skeleton';
import AttendanceSummary from './components/attendance-summary';
import TodaySchedule from './components/today-schedule';
import AttendanceCharts from './components/attendance-charts';

export default function DashboardPage() {
  return (
    <div className="space-y-6">
      <Suspense fallback={<Skeleton className="h-24 w-full rounded-lg" />}>
        <AttendanceSummary />
      </Suspense>
      <Suspense fallback={<Skeleton className="h-40 w-full rounded-lg" />}>
        <SubjectWiseAttendance />
      </Suspense>
      <Suspense fallback={<Skeleton className="h-[400px] w-full" />}>
        <AttendanceCharts />
      </Suspense>
       <Suspense fallback={<Skeleton className="h-64 w-full" />}>
        <TodaySchedule />
      </Suspense>
    </div>
  );
}
