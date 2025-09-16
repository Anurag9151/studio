'use client';

import { useAppContext } from '@/contexts/app-context';
import { useMemo, useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { useToast } from '@/hooks/use-toast';
import { Skeleton } from '@/components/ui/skeleton';
import { getDay, format } from 'date-fns';
import { getWeekDays } from '@/lib/utils';

export default function TodaySchedule({ selectedDate }: { selectedDate: Date }) {
  const { subjects, attendanceRecords, setAttendanceRecords } = useAppContext();
  const { toast } = useToast();
  const [isClient, setIsClient] = useState(false);
  const weekDays = getWeekDays();

  useEffect(() => {
    setIsClient(true);
  }, []);

  const dayOfWeek = useMemo(() => getDay(selectedDate), [selectedDate]);

  const selectedDateStr = useMemo(
    () => format(selectedDate, 'yyyy-MM-dd'),
    [selectedDate]
  );

  const todaySubjects = useMemo(() => {
    if (!isClient) return [];

    const subjectsForDay = subjects.filter(
      (subject) => Number(subject.day) === dayOfWeek
    );

    const seen = new Set<string>();
    const uniqueSubjectsForDay = subjectsForDay.filter((subject) => {
      const key = subject.id; // Each class instance has a unique ID
      if (seen.has(key)) {
        return false;
      } else {
        seen.add(key);
        return true;
      }
    });

    return uniqueSubjectsForDay.sort((a, b) =>
      a.startTime.localeCompare(b.startTime)
    );
  }, [subjects, dayOfWeek, isClient]);

  const handleMarkAttendance = (
    subjectId: string,
    status: 'present' | 'absent'
  ) => {
    const existingRecordIndex = attendanceRecords.findIndex(
      (record) =>
        record.date === selectedDateStr && record.subjectId === subjectId
    );

    let newRecords = [...attendanceRecords];
    const subjectName =
      subjects.find((s) => s.id === subjectId)?.name || 'the class';

    if (existingRecordIndex > -1) {
      if (newRecords[existingRecord-index].status === status) {
        newRecords.splice(existingRecordIndex, 1);
        toast({
          title: 'Attendance Unmarked',
          description: `Attendance for ${subjectName} on ${format(selectedDate, 'do MMM')} has been cleared.`,
        });
      } else {
        newRecords[existingRecordIndex] = {
          ...newRecords[existingRecordIndex],
          status,
        };
        toast({
          title: 'Attendance Updated',
          description: `You've marked ${subjectName} as ${status} on ${format(selectedDate, 'do MMM')}.`,
        });
      }
    } else {
      newRecords.push({
        id: crypto.randomUUID(),
        subjectId,
        date: selectedDateStr,
        status,
      });
      toast({
        title: 'Attendance Marked',
        description: `You've marked ${subjectName} as ${status} on ${format(selectedDate, 'do MMM')}.`,
      });
    }

    setAttendanceRecords(newRecords);
  };

  const getAttendanceStatus = (subjectId: string) => {
    return attendanceRecords.find(
      (record) =>
        record.date === selectedDateStr && record.subjectId === subjectId
    )?.status;
  };

  if (!isClient) {
    return (
      <div className="space-y-3" role="status">
        <Skeleton className="h-20 w-full" />
        <Skeleton className="h-20 w-full" />
        <Skeleton className="h-20 w-full" />
      </div>
    );
  }

  if (todaySubjects.length === 0) {
    return (
      <div className="text-center text-muted-foreground py-10 bg-card rounded-lg shadow-sm">
        No classes scheduled for {weekDays[dayOfWeek]}.
      </div>
    );
  }

  return (
    <div className="space-y-3">
      {todaySubjects.map((subject) => {
        const status = getAttendanceStatus(subject.id);
        return (
          <div
            key={subject.id}
            className="flex items-center justify-between p-4 bg-card rounded-lg shadow-sm"
          >
            <div className="flex items-center gap-3">
              <div
                className="w-2 h-10 rounded-full"
                style={{
                  backgroundColor: subject.color || 'hsl(var(--primary))',
                }}
              />
              <div>
                <p className="font-semibold">{subject.name}</p>
                <p className="text-sm text-muted-foreground">
                  {subject.startTime} - {subject.endTime}
                </p>
              </div>
            </div>
            <div className="flex items-center gap-2">
              <Button
                size="sm"
                variant={status === 'absent' ? 'destructive' : 'outline'}
                onClick={() => handleMarkAttendance(subject.id, 'absent')}
              >
                Bunk
              </Button>
              <Button
                size="sm"
                variant={status === 'present' ? 'default' : 'outline'}
                onClick={() => handleMarkAttendance(subject.id, 'present')}
              >
                Attend
              </Button>
            </div>
          </div>
        );
      })}
    </div>
  );
}
