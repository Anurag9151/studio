
'use client';

import { useAppContext } from '@/contexts/app-context';
import { useMemo, useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { useToast } from '@/hooks/use-toast';
import { Skeleton } from '@/components/ui/skeleton';
import { getDay, format } from 'date-fns';
import type { AttendanceRecord } from '@/lib/types';

export default function TodaySchedule({ selectedDate }: { selectedDate: Date }) {
  const { subjects, attendanceRecords, setAttendanceRecords } = useAppContext();
  const { toast } = useToast();
  const [isClient, setIsClient] = useState(false);

  useEffect(() => {
    setIsClient(true);
  }, []);

  const dayOfWeek = useMemo(() => {
    return getDay(selectedDate); // Sunday = 0, Monday = 1, etc.
  }, [selectedDate]);

  const selectedDateStr = useMemo(
    () => format(selectedDate, 'yyyy-MM-dd'),
    [selectedDate]
  );

  const todaySubjects = useMemo(() => {
    if (!isClient) {
      return [];
    }

    // 1. Filter subjects for the selected day of the week.
    const subjectsForDay = subjects.filter(
      (subject) => subject.day === dayOfWeek
    );

    // 2. Ensure uniqueness for each specific class instance (id + time).
    // This prevents accidental duplicates but allows a subject to be intentionally scheduled multiple times.
    const uniqueSubjectsMap = new Map();
    subjectsForDay.forEach((subject) => {
      const uniqueKey = `${subject.id}-${subject.startTime}`;
      if (!uniqueSubjectsMap.has(uniqueKey)) {
        uniqueSubjectsMap.set(uniqueKey, subject);
      }
    });

    const uniqueSubjects = Array.from(uniqueSubjectsMap.values());

    // 3. Sort the final list by start time to ensure correct chronological order.
    return uniqueSubjects.sort((a, b) =>
      a.startTime.localeCompare(b.startTime)
    );
  }, [subjects, dayOfWeek, isClient]);

  const handleMarkAttendance = (
    subjectId: string,
    status: 'present' | 'absent'
  ) => {
    const newRecords = [...attendanceRecords];
    const subjectName = subjects.find((s) => s.id === subjectId)?.name || 'Class';

    const recordIndex = newRecords.findIndex(
      (record) =>
        record.date === selectedDateStr && record.subjectId === subjectId
    );

    if (recordIndex > -1) {
      // Record exists, check if we need to update it or remove it.
      if (newRecords[recordIndex].status === status) {
        // Status is the same, so unmark it (toggle off).
        newRecords.splice(recordIndex, 1);
        toast({
          title: 'Attendance Unmarked',
          description: `Attendance for ${subjectName} on ${format(selectedDate, 'do MMM')} has been removed.`,
        });
      } else {
        // Status is different, so update it.
        newRecords[recordIndex].status = status;
        toast({
          title: 'Attendance Updated',
          description: `Marked ${subjectName} as ${status}.`,
        });
      }
    } else {
      // No record exists, so add a new one.
      const newRecord: AttendanceRecord = {
        id: crypto.randomUUID(),
        subjectId,
        date: selectedDateStr,
        status,
      };
      newRecords.push(newRecord);
      toast({
        title: 'Attendance Marked',
        description: `Marked ${subjectName} as ${status}.`,
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
        <Skeleton className="h-20 w-full rounded-lg" />
        <Skeleton className="h-20 w-full rounded-lg" />
        <Skeleton className="h-20 w-full rounded-lg" />
      </div>
    );
  }

  if (todaySubjects.length === 0) {
    return (
      <div className="text-center text-muted-foreground py-10 bg-card rounded-lg shadow-sm">
        <p>No classes scheduled for {format(selectedDate, 'eeee')}.</p>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      <h2 className="text-lg font-semibold tracking-tight">
        Schedule for {format(selectedDate, 'do MMMM')}
      </h2>
      <div className="space-y-3">
        {todaySubjects.map((subject) => {
          const status = getAttendanceStatus(subject.id);
          return (
            <div
              key={`${subject.id}-${subject.startTime}`}
              className="flex items-center justify-between p-3 bg-card border rounded-lg shadow-sm"
            >
              <div className="flex items-center gap-3">
                <div
                  className="w-1.5 h-10 rounded-full"
                  style={{ backgroundColor: subject.color || '#3b82f6' }}
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
                  className="w-[80px]"
                >
                  Bunk
                </Button>
                <Button
                  size="sm"
                  variant={status === 'present' ? 'default' : 'outline'}
                  onClick={() => handleMarkAttendance(subject.id, 'present')}
                  className="w-[80px]"
                >
                  Attend
                </Button>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
