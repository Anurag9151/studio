
'use client';

import { useAppContext } from '@/contexts/app-context';
import { calculateAttendance, getUniqueSubjects } from '@/lib/utils';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Progress } from '@/components/ui/progress';
import { useMemo } from 'react';

export default function SubjectWiseAttendance() {
  const { subjects, attendanceRecords } = useAppContext();

  const subjectsForDisplay = useMemo(() => {
    // Get unique subjects by name, and then calculate attendance for each.
    const uniqueSubjects = getUniqueSubjects(subjects);
    
    return uniqueSubjects.map(subject => {
        // Calculate attendance by NAME to aggregate all instances
        const { percentage } = calculateAttendance(subject.name, subjects, attendanceRecords);
        return {
            id: subject.id, // Keep a unique id for React key
            name: subject.name,
            percentage: percentage,
        };
    }).sort((a,b) => a.name.localeCompare(b.name));

  }, [subjects, attendanceRecords]);


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
          return (
            <div key={subject.id} className="grid grid-cols-[1fr_auto_auto] items-center gap-4">
              <span className="text-sm font-medium truncate">{subject.name}</span>
              <Progress value={subject.percentage} className="h-2 w-24" indicatorClassName={subject.percentage < 75 ? 'bg-destructive' : 'bg-primary'} />
              <span className="text-sm text-muted-foreground w-10 text-right">{Math.round(subject.percentage)}%</span>
            </div>
          );
        })}
      </CardContent>
    </Card>
  );
}
