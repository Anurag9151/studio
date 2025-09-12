import { AddSubjectSheet } from "./components/add-subject-sheet";
import TimetableDisplay from "./components/timetable-display";
import { Suspense } from "react";
import { Skeleton } from "@/components/ui/skeleton";

export default function TimetablePage() {
  return (
    <div className="flex-1 space-y-4 p-4 md:p-8 pt-6">
      <div className="flex items-center justify-between space-y-2">
        <h2 className="text-3xl font-bold tracking-tight font-headline">Weekly Timetable</h2>
        <AddSubjectSheet />
      </div>
      <Suspense fallback={<Skeleton className="h-[500px] w-full" />}>
        <TimetableDisplay />
      </Suspense>
    </div>
  );
}
