
'use client';

import { useAppContext } from '@/contexts/app-context';
import { useMemo, useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { useToast } from '@/hooks/use-toast';
import { Skeleton } from '@/components/ui/skeleton';
import { getDay, format } from 'date-fns';
import type { Subject, AttendanceRecord } from '@/lib/types';

export default function TodaySchedule({ selectedDate }: { selectedDate: Date }) {
  const { subjects, attendanceRecords, setAttendanceRecords } = useAppContext();
  const { toast } = useToast();
  const [isClient, setIsClient] = useState(false);

  useEffect(() => {
    setIsClient(true);
  }, []);

  const dayOfWeek = useMemo(() => {
    return getDay(selectedDate); // Sunday = 0, Monday = 1 ...
  }, [selectedDate]);

  const selectedDateStr = useMemo(
    () => format(selectedDate, 'yyyy-MM-dd'),
    [selectedDate]
  );

  const todaySubjects = useMemo(() => {
    if (!isClient) return [];
    
    // Filter by selected day
    const subjectsForDay = subjects.filter(
      (subject) => subject.day === dayOfWeek
    );
  
    // Create a Set of seen subject IDs to handle duplicates
    const seen = new Set<string>();
    const uniqueSubjects = subjectsForDay.filter(subject => {
        const duplicate = seen.has(subject.id);
        seen.add(subject.id);
        return !duplicate;
    });

    // Sort by time
    return uniqueSubjects.sort((a, b) =>
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
      subjects.find((s) => s.id === subjectId)?.name || 'Unknown';

    if (existingRecordIndex > -1) {
      // If the clicked status is the same as the existing one, unmark it (remove the record)
      if (newRecords[existingRecordIndex].status === status) {
        newRecords.splice(existingRecordIndex, 1);
        toast({
          title: 'Attendance Unmarked',
          description: `Attendance for ${subjectName} on ${selectedDateStr} has been removed.`,
        });
      } else {
        // Otherwise, update the status
        newRecords[existingRecordIndex] = {
          ...newRecords[existingRecordIndex],
          status,
        };
        toast({
          title: 'Attendance Updated',
          description: `You marked ${subjectName} as ${status}.`,
        });
      }
    } else {
      // If no record exists, add a new one
      newRecords.push({
        id: crypto.randomUUID(),
        subjectId,
        date: selectedDateStr,
        status,
      });
      toast({
        title: 'Attendance Marked',
        description: `You marked ${subjectName} as ${status}.`,
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
      <div className="space-y-3">
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
                    <div className="w-1.5 h-10 rounded-full" style={{ backgroundColor: subject.color || '#3b82f6' }} />
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
