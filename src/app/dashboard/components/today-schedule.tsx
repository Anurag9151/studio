'use client';

import { useAppContext } from '@/contexts/app-context';
import { useMemo } from 'react';
import { Button } from '@/components/ui/button';
import { format, getDay } from 'date-fns';
import { Check, X } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import { Badge } from '@/components/ui/badge';
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "@/components/ui/alert-dialog"

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
      newRecords[existingRecordIndex] = { ...newRecords[existingRecordIndex], status };
    } else {
      newRecords.push({
        id: crypto.randomUUID(),
        subjectId,
        date: todayDateStr,
        status,
      });
    }

    setAttendanceRecords(newRecords);
    toast({
      title: "Attendance Marked",
      description: `You've marked ${subjects.find(s=>s.id === subjectId)?.name} as ${status}.`,
    });
  };

  const getAttendanceStatus = (subjectId: string) => {
    return attendanceRecords.find(record => record.date === todayDateStr && record.subjectId === subjectId)?.status;
  };

  if (todaySubjects.length === 0) {
    return <div className="text-center text-muted-foreground py-10">No classes scheduled for today.</div>;
  }

  return (
    <div className="space-y-4">
      {todaySubjects.map(subject => {
        const status = getAttendanceStatus(subject.id);
        return (
          <div key={subject.id} className="flex items-center justify-between p-3 bg-muted/50 rounded-lg">
            <div>
              <p className="font-semibold">{subject.name}</p>
              <p className="text-sm text-muted-foreground">{subject.startTime} - {subject.endTime}</p>
            </div>
            <div className="flex items-center gap-2">
              {status ? (
                <Badge variant={status === 'present' ? 'default' : 'destructive'} className="capitalize">
                  {status}
                </Badge>
              ) : (
                <>
                  <AlertDialog>
                    <AlertDialogTrigger asChild>
                       <Button variant="outline" size="sm">Bunk</Button>
                    </AlertDialogTrigger>
                    <AlertDialogContent>
                      <AlertDialogHeader>
                        <AlertDialogTitle>Are you sure you want to bunk?</AlertDialogTitle>
                        <AlertDialogDescription>
                          This will mark "{subject.name}" as absent. This action can be changed later.
                        </AlertDialogDescription>
                      </AlertDialogHeader>
                      <AlertDialogFooter>
                        <AlertDialogCancel>Cancel</AlertDialogCancel>
                        <AlertDialogAction onClick={() => handleMarkAttendance(subject.id, 'absent')}>Continue</AlertDialogAction>
                      </AlertDialogFooter>
                    </AlertDialogContent>
                  </AlertDialog>
                  
                  <Button size="sm" onClick={() => handleMarkAttendance(subject.id, 'present')}>
                    <Check className="w-4 h-4 mr-1" /> Present
                  </Button>
                </>
              )}
            </div>
          </div>
        );
      })}
    </div>
  );
}
