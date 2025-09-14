import { Suspense } from 'react';
import { Skeleton } from '@/components/ui/skeleton';
import OverallAttendance from './components/overall-attendance';
import SubjectWiseAttendance from "./components/subject-wise-attendance";
import SubjectDistribution from './components/subject-distribution';

export default function AnalyticsPage() {
  return (
    <div className="space-y-6">
       <Suspense fallback={<Skeleton className="h-48 w-full rounded-lg" />}>
        <OverallAttendance />
      </Suspense>
      <Suspense fallback={<Skeleton className="h-64 w-full rounded-lg" />}>
        <SubjectWiseAttendance />
      </Suspense>
      <Suspense fallback={<Skeleton className="h-64 w-full" />}>
        <SubjectDistribution />
      </Suspense>
    </div>
  );
}
