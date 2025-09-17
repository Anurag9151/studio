
'use client';

import React, { useMemo, useState, useEffect } from 'react';
import { format, getDay } from 'date-fns';
import { useAppContext } from '@/contexts/app-context';
import { Button } from '@/components/ui/button';
import { Skeleton } from '@/components/ui/skeleton';
import { useToast } from '@/hooks/use-toast';
import type { Subject } from '@/lib/types';

const TodaySchedule: React.FC<{ selectedDate: Date }> = ({ selectedDate }) => {
  const { subjects, attendanceRecords, setAttendanceRecords } = useAppContext();
  const { toast } = useToast();

  const [hydrated, setHydrated] = useState(false);

  useEffect(() => {
    setHydrated(true);
  }, []);

  const dayOfWeek = getDay(selectedDate);
  const selectedDateStr = format(selectedDate, "yyyy-MM-dd");

  const todaysSubjects = useMemo(() => {
    return subjects
      .filter((subj) => subj.day === dayOfWeek)
      .sort((a, b) => a.startTime.localeCompare(b.startTime));
  }, [subjects, dayOfWeek]);

  const handleToggleAttendance = (
    subjectId: string,
    newStatus: 'present' | 'absent'
  ) => {
    const existing = attendanceRecords.find(
      (rec) => rec.subjectId === subjectId && rec.date === selectedDateStr
    );

    if (!existing) {
      const newRecord = {
        id: crypto.randomUUID(),
        subjectId,
        date: selectedDateStr,
        status: newStatus,
      };
      setAttendanceRecords([...attendanceRecords, newRecord]);
      toast({ description: 'Attendance Marked' });
      return;
    }

    if (existing.status === newStatus) {
      setAttendanceRecords(
        attendanceRecords.filter((rec) => rec.id !== existing.id)
      );
      toast({ description: 'Attendance Unmarked' });
    } else {
      const updated = attendanceRecords.map((rec) =>
        rec.id === existing.id ? { ...rec, status: newStatus } : rec
      );
      setAttendanceRecords(updated);
      toast({ description: 'Attendance Updated' });
    }
  };

  if (!hydrated) {
    return (
      <div className="space-y-4">
        {[1, 2, 3].map((i) => (
          <div
            key={i}
            className="flex items-center justify-between border rounded-lg p-4"
          >
            <div className="w-1/2">
              <Skeleton className="h-5 w-3/4 mb-2" />
              <Skeleton className="h-4 w-1/2" />
            </div>
            <div className="flex space-x-2">
              <Skeleton className="h-9 w-20" />
              <Skeleton className="h-9 w-20" />
            </div>
          </div>
        ))}
      </div>
    );
  }

  if (todaysSubjects.length === 0) {
    return (
      <div className="text-center text-muted-foreground py-10 bg-card rounded-lg shadow-sm">
        <p>No subjects scheduled for {format(selectedDate, 'eeee')}.</p>
      </div>
    );
  }

  return (
    <div className="space-y-4">
        <h2 className="text-xl font-semibold tracking-tight">Schedule for {format(selectedDate, 'do MMMM')}</h2>
        {todaysSubjects.map((subject) => {
            const existing = attendanceRecords.find(
                (rec) => rec.subjectId === subject.id && rec.date === selectedDateStr
            );
            const currentStatus = existing?.status;

            return (
            <div
                key={`${subject.id}-${subject.startTime}`}
                className="flex items-center justify-between border rounded-lg p-4 bg-card"
            >
                <div>
                <h3 className="font-medium">{subject.name}</h3>
                <p className="text-sm text-muted-foreground">
                    {subject.startTime} - {subject.endTime}
                </p>
                </div>

                <div className="flex space-x-2">
                <Button
                    size="sm"
                    variant={currentStatus === "present" ? "default" : "outline"}
                    onClick={() => handleToggleAttendance(subject.id, "present")}
                >
                    Attend
                </Button>
                <Button
                    size="sm"
                    variant={currentStatus === "absent" ? "destructive" : "outline"}
                    onClick={() => handleToggleAttendance(subject.id, "absent")}
                >
                    Bunk
                </Button>
                </div>
            </div>
            );
        })}
    </div>
  );
};

export default TodaySchedule;
