
'use client';

import { useAppContext } from '@/contexts/app-context';
import { useMemo, useState, useEffect } from 'react';
import { Card, CardContent } from '@/components/ui/card';
import { calculateAttendance, getUniqueSubjects } from '@/lib/utils';
import { Skeleton } from '@/components/ui/skeleton';

export default function AttendanceSummary() {
  const { subjects, attendanceRecords, holidays } = useAppContext();
  const [isClient, setIsClient] = useState(false);

  useEffect(() => {
    setIsClient(true);
  }, []);

  const overallAttendance = useMemo(() => {
    if (!isClient || subjects.length === 0) {
      return { attended: 0, total: 0, percentage: 0 };
    }

    let totalAttended = 0;
    let totalClasses = 0;

    const uniqueSubjects = getUniqueSubjects(subjects);

    uniqueSubjects.forEach(subject => {
      const { attended, total } = calculateAttendance(subject.name, subjects, attendanceRecords, holidays);
      totalAttended += attended;
      totalClasses += total;
    });
    
    const percentage = totalClasses > 0 ? (totalAttended / totalClasses) * 100 : 0;

    return {
      attended: totalAttended,
      total: totalClasses,
      percentage: parseFloat(percentage.toFixed(1)),
    };
  }, [subjects, attendanceRecords, isClient, holidays]);

  if (!isClient) {
    return (
      <Card>
        <CardContent className="pt-6">
          <p className="text-sm text-muted-foreground">Attendance</p>
          <Skeleton className="h-10 w-24 mt-1" />
          <Skeleton className="h-4 w-32 mt-2" />
        </CardContent>
      </Card>
    )
  }

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
