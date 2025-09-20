
'use client';

import { useToast } from '@/hooks/use-toast';
import { useState, useEffect } from 'react';
import { useAppContext } from '@/contexts/app-context';
import { TimetableListView } from './timetable-list-view';
import { Skeleton } from '@/components/ui/skeleton';

export default function TimetableDisplay() {
  const { subjects, setSubjects, setAttendanceRecords } = useAppContext();
  const { toast } = useToast();
  const [isClient, setIsClient] = useState(false);

  useEffect(() => {
    setIsClient(true);
  }, []);

  const handleDelete = (subjectId: string) => {
    const subjectToDelete = subjects.find(s => s.id === subjectId);
    if (!subjectToDelete) return;

    setSubjects(subjects.filter(s => s.id !== subjectId));
    setAttendanceRecords(records => records.filter(r => r.subjectId !== subjectId));
    toast({
        title: "Subject Deleted",
        description: `${subjectToDelete.name} has been removed.`,
        variant: "destructive"
    })
  };

  if (!isClient) {
    return <Skeleton className="h-[300px] w-full" />;
  }

  return (
    <div className="space-y-4">
      {subjects.length === 0 ? (
        <div className="text-center py-20 bg-card rounded-lg border border-dashed">
            <h3 className="mt-2 text-lg font-semibold">No classes in your timetable</h3>
            <p className="mt-1 text-sm text-muted-foreground">Get started by adding your first subject.</p>
        </div>
      ) : (
        <TimetableListView subjects={subjects} handleDelete={handleDelete} />
      )}
    </div>
  );
}
