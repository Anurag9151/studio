'use client';

import { useAppContext } from '@/contexts/app-context';
import { getWeekDays } from '@/lib/utils';
import { Edit, Trash2, MoreVertical } from 'lucide-react';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { AddSubjectSheet } from './add-subject-sheet';
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
import { useToast } from '@/hooks/use-toast';
import { useMemo } from 'react';
import type { Subject } from '@/lib/types';
import { Button } from '@/components/ui/button';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';

const timeSlots = [
  '09:00', '10:00', '11:00', '12:00', '13:00', '14:00', '15:00', '16:00', '17:00'
];

export default function TimetableDisplay() {
  const { subjects, setSubjects, setAttendanceRecords } = useAppContext();
  const { toast } = useToast();

  const weekDays = getWeekDays();

  const handleDelete = (subjectId: string) => {
    setSubjects(subjects.filter(s => s.id !== subjectId));
    setAttendanceRecords(records => records.filter(r => r.subjectId !== subjectId));
    toast({
        title: "Subject Deleted",
        description: "The subject and its attendance records have been removed.",
        variant: "destructive"
    })
  };

  const subjectsByDayTime = useMemo(() => {
    const grid: { [key: number]: { [key: string]: Subject | null } } = {};
    weekDays.forEach((_, dayIndex) => {
      grid[dayIndex] = {};
      timeSlots.forEach(slot => {
        grid[dayIndex][slot] = null;
      });
    });

    subjects.forEach(subject => {
      const startHour = parseInt(subject.startTime.split(':')[0]);
      const slot = timeSlots.find(s => parseInt(s.split(':')[0]) === startHour);
      if (slot && subject.day >= 1 && subject.day <= 5) { // Only Monday to Friday
         grid[subject.day][slot] = subject;
      }
    });
    return grid;
  }, [subjects, weekDays]);

  if (subjects.length === 0) {
    return (
        <div className="text-center py-20 bg-card rounded-lg border border-dashed">
            <h3 className="mt-2 text-lg font-semibold">No classes in your timetable</h3>
            <p className="mt-1 text-sm text-muted-foreground">Get started by adding your first subject.</p>
        </div>
    )
  }

  return (
    <div className="rounded-lg border bg-card overflow-x-auto">
      <Table className="min-w-max">
        <TableHeader>
          <TableRow>
            <TableHead className="w-24 font-bold">Time</TableHead>
            {weekDays.slice(1, 6).map(day => ( // Monday to Friday
              <TableHead key={day} className="text-center font-bold">{day}</TableHead>
            ))}
          </TableRow>
        </TableHeader>
        <TableBody>
          {timeSlots.slice(0, -1).map((slot, timeIndex) => (
            <TableRow key={slot}>
              <TableCell className="text-muted-foreground text-xs">
                {slot} - {timeSlots[timeIndex + 1]}
              </TableCell>
              {weekDays.slice(1, 6).map((_, dayIndex) => {
                const day = dayIndex + 1;
                const subject = subjectsByDayTime[day]?.[slot];
                if (subject) {
                  return (
                    <TableCell key={`${day}-${slot}`} className="p-1 align-top h-24">
                       <div className="bg-muted/30 rounded-md p-2 h-full group relative">
                          <p className="font-semibold text-sm truncate">{subject.name}</p>
                          {subject.teacher && <p className="text-xs text-muted-foreground truncate">{subject.teacher}</p>}
                          <p className="text-xs text-muted-foreground">{subject.startTime} - {subject.endTime}</p>
                          <div className="absolute top-1 right-1 opacity-0 group-hover:opacity-100 transition-opacity">
                            <DropdownMenu>
                                <DropdownMenuTrigger asChild>
                                    <Button variant="ghost" size="icon" className="h-6 w-6">
                                        <MoreVertical size={14} />
                                    </Button>
                                </DropdownMenuTrigger>
                                <DropdownMenuContent align="end">
                                      <AddSubjectSheet subject={subject}>
                                        <DropdownMenuItem onSelect={(e) => e.preventDefault()}>
                                            <Edit className="mr-2 h-4 w-4" />
                                            <span>Edit</span>
                                        </DropdownMenuItem>
                                    </AddSubjectSheet>
                                    <AlertDialog>
                                        <AlertDialogTrigger asChild>
                                            <DropdownMenuItem onSelect={(e) => e.preventDefault()} className="text-destructive focus:text-destructive focus:bg-destructive/10">
                                                <Trash2 className="mr-2 h-4 w-4" />
                                                <span>Delete</span>
                                            </DropdownMenuItem>
                                        </AlertDialogTrigger>
                                        <AlertDialogContent>
                                            <AlertDialogHeader>
                                            <AlertDialogTitle>Are you absolutely sure?</AlertDialogTitle>
                                            <AlertDialogDescription>
                                                This action cannot be undone. This will permanently delete the
                                                subject and all its attendance records.
                                            </AlertDialogDescription>
                                            </AlertDialogHeader>
                                            <AlertDialogFooter>
                                            <AlertDialogCancel>Cancel</AlertDialogCancel>
                                            <AlertDialogAction onClick={() => handleDelete(subject.id)} className="bg-destructive hover:bg-destructive/90">Delete</AlertDialogAction>
                                            </AlertDialogFooter>
                                        </AlertDialogContent>
                                    </AlertDialog>
                                </DropdownMenuContent>
                            </DropdownMenu>
                          </div>
                       </div>
                    </TableCell>
                  );
                }
                return <TableCell key={`${day}-${slot}`}></TableCell>;
              })}
            </TableRow>
          ))}
        </TableBody>
      </Table>
    </div>
  );
}
