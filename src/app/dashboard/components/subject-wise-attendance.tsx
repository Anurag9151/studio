'use client';

import { useAppContext } from '@/contexts/app-context';
import { calculateAttendance } from '@/lib/utils';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Progress } from '@/components/ui/progress';

export default function SubjectWiseAttendance() {
  const { subjects, attendanceRecords } = useAppContext();

  if (subjects.length === 0) {
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
        {subjects.map(subject => {
          const { percentage } = calculateAttendance(subject.id, attendanceRecords, subjects);
          return (
            <div key={subject.id}>
              <div className="flex justify-between items-center mb-1">
                <span className="text-sm font-medium">{subject.name}</span>
                <span className="text-sm text-muted-foreground">{percentage}%</span>
              </div>
              <Progress value={percentage} className="h-2" />
            </div>
          );
        })}
      </CardContent>
    </Card>
  );
}
