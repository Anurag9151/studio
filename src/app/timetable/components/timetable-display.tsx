'use client';

import { useAppContext } from '@/contexts/app-context';
import { getWeekDays } from '@/lib/utils';
import { Edit, Trash2 } from 'lucide-react';
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
import { Subject } from '@/lib/types';

export default function TimetableDisplay() {
  const { subjects, setSubjects, setAttendanceRecords } = useAppContext();
  const { toast } = useToast();

  const weekDays = getWeekDays().slice(1, 6); // Mon-Fri

  const handleDelete = (subjectId: string) => {
    setSubjects(subjects.filter(s => s.id !== subjectId));
    setAttendanceRecords(records => records.filter(r => r.subjectId !== subjectId));
    toast({
        title: "Subject Deleted",
        description: "The subject and its attendance records have been removed.",
        variant: "destructive"
    })
  };

  const timeSlots = useMemo(() => {
    const slots = new Set<string>();
    subjects.forEach(s => {
        slots.add(s.startTime);
    });
    const sortedSlots = Array.from(slots).sort();
    
    // Ensure a minimum set of slots for a good default view
    const defaultSlots = ['09:00', '10:00', '11:00', '12:00', '14:00', '15:00'];
    defaultSlots.forEach(s => slots.add(s));

    return Array.from(slots).sort();
  }, [subjects]);

  if (subjects.length === 0) {
    return (
        <div className="text-center py-20 bg-card rounded-lg border border-dashed">
            <h3 className="mt-2 text-lg font-semibold">No subjects in your timetable</h3>
            <p className="mt-1 text-sm text-muted-foreground">Get started by adding your first subject.</p>
        </div>
    )
  }

  const getSubjectForSlot = (dayIndex: number, time: string): Subject | undefined => {
    return subjects.find(s => s.day === dayIndex + 1 && s.startTime === time);
  };
  
  return (
    <div className="bg-card rounded-lg border overflow-hidden">
      <div className="grid grid-cols-6">
        {/* Header Row */}
        <div className="p-2 text-center font-semibold text-sm text-muted-foreground"></div>
        {weekDays.map((day) => (
          <div key={day} className="p-2 text-center font-semibold text-sm text-muted-foreground border-l">
            {day.substring(0, 3)}
          </div>
        ))}

        {/* Time Slot Rows */}
        {timeSlots.map((time) => (
          <div key={time} className="grid grid-cols-6 col-span-6 border-t items-stretch">
            <div className="p-2 text-center text-xs font-medium text-muted-foreground flex items-center justify-center">
              {time}
            </div>
            {weekDays.map((_, dayIndex) => {
                const subject = getSubjectForSlot(dayIndex, time);
                return (
                    <div key={dayIndex} className="p-1.5 text-center text-xs border-l flex items-center justify-center min-h-[4rem] relative group">
                        {subject ? (
                            <>
                                <span className="font-medium">{subject.name}</span>
                                <div className="absolute top-0 right-0 opacity-0 group-hover:opacity-100 transition-opacity">
                                    <DropdownMenu>
                                        <DropdownMenuTrigger asChild>
                                            <button className="p-1 rounded-full hover:bg-muted">
                                                <Edit size={12} />
                                            </button>
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
                                                    <DropdownMenuItem onSelect={(e) => e.preventDefault()} className="text-destructive focus:text-destructive">
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
                            </>
                        ) : null}
                    </div>
                );
            })}
          </div>
        ))}
      </div>
    </div>
  );
}
