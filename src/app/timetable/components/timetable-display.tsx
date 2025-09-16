
'use client';

import { useToast } from '@/hooks/use-toast';
import { useState, useEffect } from 'react';
import type { Subject } from '@/lib/types';
import { Label } from '@/components/ui/label';
import { Switch } from '@/components/ui/switch';
import { useAppContext } from '@/contexts/app-context';
import { TimetableGridView } from './timetable-grid-view';
import { TimetableListView } from './timetable-list-view';
import {
  SegmentedControl,
  SegmentedControlItem,
} from '@/components/ui/segmented-control';
import DateBasedSchedule from './date-based-schedule';
import { Skeleton } from '@/components/ui/skeleton';

export default function TimetableDisplay() {
  const { subjects, setSubjects, setAttendanceRecords } = useAppContext();
  const { toast } = useToast();
  const [isListView, setIsListView] = useState(false);
  const [activeView, setActiveView] = useState('day');
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

  const DayView = () => {
    if (!isClient) {
      return <Skeleton className="h-[200px] w-full" />;
    }

    return (
      <>
        {subjects.length === 0 ? (
          <div className="text-center py-20 bg-card rounded-lg border border-dashed">
              <h3 className="mt-2 text-lg font-semibold">No classes in your timetable</h3>
              <p className="mt-1 text-sm text-muted-foreground">Get started by adding your first subject.</p>
          </div>
        ) : (
          <div className="space-y-4">
              <div className="flex items-center justify-end space-x-2">
                  <Label htmlFor="view-toggle">List View</Label>
                  <Switch
                      id="view-toggle"
                      checked={isListView}
                      onCheckedChange={setIsListView}
                  />
              </div>

              {isListView ? (
                  <TimetableListView subjects={subjects} handleDelete={handleDelete} />
              ) : (
                  <TimetableGridView subjects={subjects} />
              )}
          </div>
        )}
      </>
    )
  }

  return (
    <div className="space-y-4">
        <div className="flex justify-center">
            <SegmentedControl value={activeView} onValueChange={setActiveView} className="w-full">
                <SegmentedControlItem value="day" className="flex-1">By Day</SegmentedControlItem>
                <SegmentedControlItem value="date" className="flex-1">By Date</SegmentedControlItem>
            </SegmentedControl>
        </div>

        {activeView === 'day' ? <DayView /> : <DateBasedSchedule />}
    </div>
  );
}
