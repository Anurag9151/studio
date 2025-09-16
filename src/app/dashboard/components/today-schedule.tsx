'use client';

import React, { useMemo, useState, useEffect } from 'react';
import { format, getDay } from 'date-fns';
import { useAppContext } from '@/contexts/app-context';
import { Button } from '@/components/ui/button';
import { Skeleton } from '@/components/ui/skeleton';
import { useToast } from '@/hooks/use-toast';

/**
 * Utility function to map JS getDay() -> DB convention
 * JS getDay(): Sunday=0, Monday=1, ..., Saturday=6
 * DB: Monday=0, ..., Sunday=6
 */
const mapDayToDb = (jsDay: number): number => {
  // Shift so that Monday=0 ... Sunday=6
  // JS 1 (Monday) → 0, ..., JS 0 (Sunday) → 6
  return jsDay === 0 ? 6 : jsDay - 1;
};

const TodaySchedule: React.FC<{ selectedDate: Date }> = ({ selectedDate }) => {
  const { subjects, attendanceRecords, setAttendanceRecords } = useAppContext();
  const { toast } = useToast();

  const [hydrated, setHydrated] = useState(false);

  useEffect(() => {
    // Next.js hydration handling
    setHydrated(true);
  }, []);

  const dbDayOfWeek = mapDayToDb(getDay(selectedDate));
  const selectedDateStr = format(selectedDate, "yyyy-MM-dd");

  const todaysSubjects = useMemo(() => {
    // 1. Filter subjects for the selected day
    const filtered = subjects.filter((subj) => Number(subj.day) === getDay(selectedDate));

    // 2. Deduplicate by key (subject.id + startTime)
    const seen = new Set<string>();
    const unique: typeof filtered = [];

    for (const subj of filtered) {
      const key = `${subj.id}-${subj.startTime}`;
      if (!seen.has(key)) {
        seen.add(key);
        unique.push(subj);
      }
    }

    // 3. Sort by startTime (ascending)
    unique.sort((a, b) => a.startTime.localeCompare(b.startTime));

    return unique;
  }, [subjects, selectedDate]);

  const handleToggleAttendance = (
    subjectId: string,
    newStatus: 'present' | 'absent'
  ) => {
    const existing = attendanceRecords.find(
      (rec) => rec.subjectId === subjectId && rec.date === selectedDateStr
    );

    if (!existing) {
      // Add record
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
      // Toggle off (remove record)
      setAttendanceRecords(
        attendanceRecords.filter((rec) => rec.id !== existing.id)
      );
      toast({ description: 'Attendance Unmarked' });
    } else {
      // Update record
      const updated = attendanceRecords.map((rec) =>
        rec.id === existing.id ? { ...rec, status: newStatus } : rec
      );
      setAttendanceRecords(updated);
      toast({ description: 'Attendance Updated' });
    }
  };

  if (!hydrated) {
    // Skeleton loader during hydration
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
        <p>No subjects scheduled for today.</p>
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
                {/* Left side: Subject info */}
                <div>
                <h3 className="font-medium">{subject.name}</h3>
                <p className="text-sm text-muted-foreground">
                    {subject.startTime} - {subject.endTime}
                </p>
                </div>

                {/* Right side: Action buttons */}
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
