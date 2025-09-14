'use client';

import { useAppContext } from '@/contexts/app-context';
import { calculateAttendance } from '@/lib/utils';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Progress } from '@/components/ui/progress';
import { useMemo } from 'react';

export default function SubjectWiseAttendance() {
  const { subjects, attendanceRecords } = useAppContext();

  const uniqueSubjects = useMemo(() => {
    const subjectMap = new Map();
    subjects.forEach(subject => {
        // Since timetable allows multiple entries for the same subject on different days,
        // we group them by name for a consolidated view.
        if (!subjectMap.has(subject.name)) {
            subjectMap.set(subject.name, subject);
        }
    });
    return Array.from(subjectMap.values());
  }, [subjects]);


  if (uniqueSubjects.length === 0) {
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
        {uniqueSubjects.map(subject => {
          const { percentage } = calculateAttendance(subject.id, attendanceRecords, subjects);
          return (
            <div key={subject.id} className="grid grid-cols-[1fr_auto_auto] items-center gap-4">
              <span className="text-sm font-medium truncate">{subject.name}</span>
              <Progress value={percentage} className="h-2 w-24" />
              <span className="text-sm text-muted-foreground w-10 text-right">{percentage}%</span>
            </div>
          );
        })}
      </CardContent>
    </Card>
  );
}
