import { Suspense } from 'react';
import SubjectWiseAttendance from "./components/subject-wise-attendance";
import { Skeleton } from '@/components/ui/skeleton';
import AttendanceSummary from './components/attendance-summary';

export default function DashboardPage() {
  return (
    <div className="space-y-6">
      <Suspense fallback={<Skeleton className="h-24 w-full rounded-lg" />}>
        <AttendanceSummary />
      </Suspense>
      <Suspense fallback={<Skeleton className="h-40 w-full rounded-lg" />}>
        <SubjectWiseAttendance />
      </Suspense>
    </div>
  );
}
