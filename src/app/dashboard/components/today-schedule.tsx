'use client';

import { useAppContext } from '@/contexts/app-context';
import { useMemo } from 'react';
import { Button } from '@/components/ui/button';
import { format, getDay } from 'date-fns';
import { useToast } from '@/hooks/use-toast';
import { Badge } from '@/components/ui/badge';

export default function TodaySchedule() {
  const { subjects, attendanceRecords, setAttendanceRecords } = useAppContext();
  const { toast } = useToast();

  const today = new Date();
  const dayOfWeek = getDay(today);
  const todayDateStr = format(today, 'yyyy-MM-dd');

  const todaySubjects = useMemo(() => {
    return subjects
      .filter(subject => subject.day === dayOfWeek)
      .sort((a, b) => a.startTime.localeCompare(b.startTime));
  }, [subjects, dayOfWeek]);

  const handleMarkAttendance = (subjectId: string, status: 'present' | 'absent') => {
    const existingRecordIndex = attendanceRecords.findIndex(
      record => record.date === todayDateStr && record.subjectId === subjectId
    );

    let newRecords = [...attendanceRecords];

    if (existingRecordIndex > -1) {
      // If the user clicks the same status again, unmark it.
      if(newRecords[existingRecordIndex].status === status) {
        newRecords.splice(existingRecordIndex, 1);
         toast({
          title: "Attendance Unmarked",
          description: `Attendance for ${subjects.find(s=>s.id === subjectId)?.name} has been cleared.`,
        });
      } else {
        newRecords[existingRecordIndex] = { ...newRecords[existingRecordIndex], status };
        toast({
          title: "Attendance Updated",
          description: `You've marked ${subjects.find(s=>s.id === subjectId)?.name} as ${status}.`,
        });
      }
    } else {
      newRecords.push({
        id: crypto.randomUUID(),
        subjectId,
        date: todayDateStr,
        status,
      });
      toast({
        title: "Attendance Marked",
        description: `You've marked ${subjects.find(s=>s.id === subjectId)?.name} as ${status}.`,
      });
    }

    setAttendanceRecords(newRecords);
  };

  const getAttendanceStatus = (subjectId: string) => {
    return attendanceRecords.find(record => record.date === todayDateStr && record.subjectId === subjectId)?.status;
  };

  if (todaySubjects.length === 0) {
    return <div className="text-center text-muted-foreground py-10 bg-card rounded-lg">No classes scheduled for today.</div>;
  }

  return (
    <div className="space-y-3">
      {todaySubjects.map(subject => {
        const status = getAttendanceStatus(subject.id);
        return (
          <div key={subject.id} className="flex items-center justify-between p-4 bg-card rounded-lg">
            <div>
              <p className="font-semibold">{subject.name}</p>
              <p className="text-sm text-muted-foreground">{subject.startTime} - {subject.endTime}</p>
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
