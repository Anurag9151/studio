'use client';

import React, { useMemo, useState, useEffect } from 'react';
import { format, getDay } from 'date-fns';
import { useAppContext } from '@/contexts/app-context';
import { Button } from '@/components/ui/button';
import { Skeleton } from '@/components/ui/skeleton';
import { useToast } from '@/hooks/use-toast';

// Utility: map JS getDay() to our convention (Mon=1 ... Sun=0)
const mapDayToDb = (date: Date): number => {
  return getDay(date);
};

const TodaySchedule: React.FC = () => {
  const { subjects, attendanceRecords, setAttendanceRecords } = useAppContext();
  const { toast } = useToast();

  const [hydrated, setHydrated] = useState(false);

  useEffect(() => {
    // Mark hydration after mount to avoid mismatch
    setHydrated(true);
  }, []);

  const today = new Date();
  const todayDateStr = format(today, 'yyyy-MM-dd');
  const todayDbDay = mapDayToDb(today);

  // Deduplicate + filter + sort subjects
  const todaySubjects = useMemo(() => {
    const filtered = subjects.filter((s) => s.day === todayDbDay);

    // Deduplicate by subject.id + startTime
    const uniqueMap = new Map<string, typeof filtered[number]>();
    filtered.forEach((s) => {
      const key = `${s.id}-${s.startTime}`;
      if (!uniqueMap.has(key)) {
        uniqueMap.set(key, s);
      }
    });

    const uniqueList = Array.from(uniqueMap.values());

    // Sort by startTime ascending
    return uniqueList.sort((a, b) => a.startTime.localeCompare(b.startTime));
  }, [subjects, todayDbDay]);

  // Handler for toggling attendance
  const handleToggleAttendance = (subjectId: string, newStatus: 'present' | 'absent') => {
    const existing = attendanceRecords.find(
      (rec) => rec.subjectId === subjectId && rec.date === todayDateStr
    );

    if (!existing) {
      // Add new record
      const newRecord = {
        id: crypto.randomUUID(),
        subjectId,
        date: todayDateStr,
        status: newStatus,
      };
      setAttendanceRecords([...attendanceRecords, newRecord]);
      toast({ description: 'Attendance Marked' });
      return;
    }

    if (existing.status === newStatus) {
      // Toggle off (remove record)
      const updated = attendanceRecords.filter((rec) => rec.id !== existing.id);
      setAttendanceRecords(updated);
      toast({ description: 'Attendance Unmarked' });
      return;
    }

    // Update existing
    const updated = attendanceRecords.map((rec) =>
      rec.id === existing.id ? { ...rec, status: newStatus } : rec
    );
    setAttendanceRecords(updated);
    toast({ description: 'Attendance Updated' });
  };

  if (!hydrated) {
    return (
      <div className="space-y-4">
        {[...Array(3)].map((_, i) => (
          <div key={i} className="flex items-center justify-between p-4 border rounded-lg">
            <div className="flex-1 space-y-2">
              <Skeleton className="h-4 w-40" />
              <Skeleton className="h-4 w-24" />
            </div>
            <div className="flex gap-2">
              <Skeleton className="h-8 w-16" />
              <Skeleton className="h-8 w-16" />
            </div>
          </div>
        ))}
      </div>
    );
  }

  if (todaySubjects.length === 0) {
    return (
      <div className="text-center text-muted-foreground py-10 bg-card rounded-lg shadow-sm">
        <p>No subjects scheduled for today.</p>
      </div>
    );
  }

  return (
    <div className="space-y-4">
        <h2 className="text-xl font-semibold tracking-tight">Today's Schedule</h2>
        {todaySubjects.map((subject) => {
            const existing = attendanceRecords.find(
            (rec) => rec.subjectId === subject.id && rec.date === todayDateStr
            );

            const isPresent = existing?.status === 'present';
            const isAbsent = existing?.status === 'absent';

            return (
            <div
                key={`${subject.id}-${subject.startTime}`}
                className="flex items-center justify-between p-4 border rounded-lg bg-card shadow-sm"
            >
                <div>
                <p className="font-medium">{subject.name}</p>
                <p className="text-sm text-muted-foreground">
                    {subject.startTime} - {subject.endTime}
                </p>
                </div>

                <div className="flex gap-2">
                <Button
                    size="sm"
                    variant={isPresent ? 'default' : 'outline'}
                    onClick={() => handleToggleAttendance(subject.id, 'present')}
                >
                    Attend
                </Button>
                <Button
                    size="sm"
                    variant={isAbsent ? 'destructive' : 'outline'}
                    onClick={() => handleToggleAttendance(subject.id, 'absent')}
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
