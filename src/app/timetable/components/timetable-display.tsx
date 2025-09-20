
'use client';

import { useToast } from '@/hooks/use-toast';
import { useState, useEffect } from 'react';
import { useAppContext } from '@/contexts/app-context';
import { TimetableGridView } from './timetable-grid-view';
import { TimetableListView } from './timetable-list-view';
import { Skeleton } from '@/components/ui/skeleton';
import { SegmentedControl, SegmentedControlItem } from '@/components/ui/segmented-control';
import { List, LayoutGrid } from 'lucide-react';

export default function TimetableDisplay() {
  const { subjects, setSubjects, setAttendanceRecords } = useAppContext();
  const { toast } = useToast();
  const [viewMode, setViewMode] = useState('grid');
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
      <div className="flex justify-center">
        <SegmentedControl value={viewMode} onValueChange={setViewMode} size="sm">
          <SegmentedControlItem value="list"><List className="mr-2 h-4 w-4" /> List</SegmentedControlItem>
          <SegmentedControlItem value="grid"><LayoutGrid className="mr-2 h-4 w-4" /> Grid</SegmentedControlItem>
        </SegmentedControl>
      </div>
      {subjects.length === 0 ? (
        <div className="text-center py-20 bg-card rounded-lg border border-dashed">
            <h3 className="mt-2 text-lg font-semibold">No classes in your timetable</h3>
            <p className="mt-1 text-sm text-muted-foreground">Get started by adding your first subject.</p>
        </div>
      ) : (
        <>
          {viewMode === 'list' && <TimetableListView subjects={subjects} handleDelete={handleDelete} />}
          {viewMode === 'grid' && <TimetableGridView subjects={subjects} />}
        </>
      )}
    </div>
  );
}
