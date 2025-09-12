'use client';

import { useAppContext } from '@/contexts/app-context';
import { useMemo } from 'react';
import { Card, CardContent } from '@/components/ui/card';
import { calculateAttendance } from '@/lib/utils';

export default function AttendanceSummary() {
  const { subjects, attendanceRecords } = useAppContext();

  const overallAttendance = useMemo(() => {
    if (subjects.length === 0) {
      return { attended: 0, total: 0, percentage: 0 };
    }

    let totalAttended = 0;
    let totalClasses = 0;

    subjects.forEach(subject => {
      const { attended, total } = calculateAttendance(subject.id, attendanceRecords, subjects);
      totalAttended += attended;
      totalClasses += total;
    });
    
    const percentage = totalClasses > 0 ? (totalAttended / totalClasses) * 100 : 0;

    return {
      attended: totalAttended,
      total: totalClasses,
      percentage: parseFloat(percentage.toFixed(1)),
    };
  }, [subjects, attendanceRecords]);

  return (
    <Card>
      <CardContent className="pt-6">
        <p className="text-sm text-muted-foreground">Attendance</p>
        <p className="text-4xl font-bold">{overallAttendance.percentage}%</p>
        <p className="text-sm text-muted-foreground">Attended: {overallAttendance.attended}/{overallAttendance.total}</p>
      </CardContent>
    </Card>
  );
}
