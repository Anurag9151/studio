
import { Suspense } from 'react';
import { Skeleton } from '@/components/ui/skeleton';
import OverallAttendance from './components/overall-attendance';
import BunkSuggesterView from './components/bunk-suggester-view';
import SubjectWiseAttendance from './components/subject-wise-attendance';

export default function AnalyticsPage() {
  return (
    <div className="space-y-6">
       <Suspense fallback={<Skeleton className="h-48 w-full rounded-lg" />}>
        <OverallAttendance />
      </Suspense>
       <Suspense fallback={<Skeleton className="h-64 w-full" />}>
        <BunkSuggesterView />
      </Suspense>
      <Suspense fallback={<Skeleton className="h-64 w-full" />}>
        <SubjectWiseAttendance />
      </Suspense>
    </div>
  );
}
