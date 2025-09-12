import TimetableDisplay from "./components/timetable-display";
import { Suspense } from "react";
import { Skeleton } from "@/components/ui/skeleton";

export default function TimetablePage() {
  return (
    <div className="space-y-4">
      <Suspense fallback={<Skeleton className="h-[500px] w-full" />}>
        <TimetableDisplay />
      </Suspense>
    </div>
  );
}
