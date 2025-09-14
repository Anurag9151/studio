
'use client';

import { useAppContext } from '@/contexts/app-context';
import { calculateAttendance } from '@/lib/utils';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Progress } from '@/components/ui/progress';
import { useMemo } from 'react';

export default function SubjectWiseAttendance() {
  const { subjects, attendanceRecords } = useAppContext();

  // On the dashboard, we want to show every single class instance from the timetable
  // unlike the analytics page where we group them.
  const subjectsForDisplay = useMemo(() => {
    return subjects.sort((a,b) => a.name.localeCompare(b.name));
  }, [subjects]);


  if (subjectsForDisplay.length === 0) {
    return (
      <Card>
        <CardHeader>
          <CardTitle>Subject-wise Attendance</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="text-center text-muted-foreground py-8">
            <p>No subjects yet. Add a subject to track attendance.</p>
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle>Subject-wise Attendance</CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        {subjectsForDisplay.map(subject => {
          // Pass the subject ID and `true` to calculate for this specific instance
          const { percentage } = calculateAttendance(subject.id, subjects, attendanceRecords, true);
          return (
            <div key={subject.id} className="grid grid-cols-[1fr_auto_auto] items-center gap-4">
              <span className="text-sm font-medium truncate">{subject.name}</span>
              <Progress value={percentage} className="h-2 w-24" indicatorClassName={percentage < 75 ? 'bg-destructive' : 'bg-primary'} />
              <span className="text-sm text-muted-foreground w-10 text-right">{Math.round(percentage)}%</span>
            </div>
          );
        })}
      </CardContent>
    </Card>
  );
}
