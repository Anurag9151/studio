
'use client';

import React from 'react';
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
import { useMemo, useState } from 'react';
import type { Subject } from '@/lib/types';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { getDay, format } from 'date-fns';
import { cn } from '@/lib/utils';
import { Switch } from '@/components/ui/switch';
import { Label } from '@/components/ui/label';

export default function TimetableDisplay() {
  const { subjects, setSubjects, settings, setAttendanceRecords } = useAppContext();
  const { toast } = useToast();
  const [isExpandedView, setIsExpandedView] = useState(false);

  const weekDays = getWeekDays();
  const today = getDay(new Date());

  const workingDays = useMemo(() => {
    // getDay() returns 0 for Sun, 1 for Mon, etc. We want the names.
    const dayNames = weekDays.slice(1, 6); // Mon-Fri
    if (settings.workingDays === 'Mon-Sat') {
      dayNames.push(weekDays[6]); // Add Saturday
    }
    return dayNames;
  }, [settings.workingDays, weekDays]);

  const timeSlots = useMemo(() => {
    const slots = [];
    const start = parseInt(settings.startTime?.split(':')[0] || '9');
    const end = parseInt(settings.endTime?.split(':')[0] || '17');
    for (let i = start; i < end; i++) {
      slots.push(`${i.toString().padStart(2, '0')}:00`);
    }
    return slots;
  }, [settings.startTime, settings.endTime]);

  const handleDelete = (subjectId: string) => {
    const subjectToDelete = subjects.find(s => s.id === subjectId);
    if (!subjectToDelete) return;

    setSubjects(subjects.filter(s => s.id !== subjectId));
    setAttendanceRecords(records => records.filter(r => r.subjectId !== subjectId));
    toast({
        title: "Subject Deleted",
        description: `${subjectToDelete.name} has been removed.`,
        variant: "destructive"
    })
  };

  const subjectsByDayTime = useMemo(() => {
    const grid: { [key: string]: { [key: string]: Subject | 'lunch' | null } } = {};
    workingDays.forEach(day => {
      grid[day] = {};
      timeSlots.forEach(slot => {
        grid[day][slot] = null;
      });
    });

    subjects.forEach(subject => {
        const dayName = weekDays[subject.day];
        if (grid[dayName]) {
            const startHour = parseInt(subject.startTime.split(':')[0]);
            const slot = timeSlots.find(s => parseInt(s.split(':')[0]) === startHour);
            if (slot) {
                grid[dayName][slot] = subject;
            }
        }
    });

    if (settings.lunchBreak) {
        const lunchSlot = '13:00';
        if(timeSlots.includes(lunchSlot)) {
            workingDays.forEach(day => {
                grid[day][lunchSlot] = 'lunch';
            });
        }
    }

    return grid;
  }, [subjects, workingDays, timeSlots, weekDays, settings.lunchBreak]);

  if (subjects.length === 0) {
    return (
        <div className="text-center py-20 bg-card rounded-lg border border-dashed">
            <h3 className="mt-2 text-lg font-semibold">No classes in your timetable</h3>
            <p className="mt-1 text-sm text-muted-foreground">Get started by adding your first subject.</p>
        </div>
    )
  }

  return (
    <div className="space-y-4">
        <div className="flex items-center justify-end space-x-2">
            <Label htmlFor="view-toggle">Expanded View</Label>
            <Switch
                id="view-toggle"
                checked={isExpandedView}
                onCheckedChange={setIsExpandedView}
            />
        </div>

        {isExpandedView ? (
            <ExpandedView subjects={subjects} handleDelete={handleDelete} />
        ) : (
            <div className="rounded-lg border bg-card text-card-foreground shadow-sm overflow-x-auto">
                <div className={`grid grid-cols-[auto_repeat(${workingDays.length},_minmax(0,_1fr))] min-w-max`}>
                    <div className="p-2 border-b border-r text-xs font-semibold text-muted-foreground sticky left-0 bg-card"></div>
                    {workingDays.map(day => (
                        <div key={day} className={cn("p-2 text-center border-b text-xs font-semibold", weekDays.indexOf(day) === today ? "bg-primary/10 text-primary" : "text-muted-foreground")}>
                            {day.substring(0, 3)}
                        </div>
                    ))}
                
                    {timeSlots.map(slot => (
                        <React.Fragment key={slot}>
                            <div className="p-2 border-r text-xs text-muted-foreground h-20 flex items-center justify-center sticky left-0 bg-card">
                                {format(new Date(`1970-01-01T${slot}`), 'h a')}
                            </div>
                            {workingDays.map(day => {
                                const subject = subjectsByDayTime[day]?.[slot];
                                if (subject === 'lunch') {
                                    return (
                                        <div key={`${day}-${slot}`} className="p-1 border-l">
                                            <div className="h-full flex items-center justify-center text-muted-foreground/50 text-xs">
                                                Lunch
                                            </div>
                                        </div>
                                    )
                                }
                                if (subject) {
                                    const subjectInfo = subject as Subject;
                                    return (
                                        <div key={`${day}-${slot}`} className="p-1 border-l">
                                            <AddSubjectSheet subject={subjectInfo}>
                                                <button className="w-full h-full bg-primary/10 rounded-md p-1 text-left group relative">
                                                    <p className="font-bold text-xs text-primary truncate">{subjectInfo.name}</p>
                                                    <p className="text-xs text-primary/70">{subjectInfo.teacher}</p>
                                                    <div className="absolute top-1 right-1 opacity-0 group-hover:opacity-100 transition-opacity">
                                                        <Edit size={12} className="text-primary/70" />
                                                    </div>
                                                </button>
                                            </AddSubjectSheet>
                                        </div>
                                    )
                                }
                                return <div key={`${day}-${slot}`} className="border-l"></div>
                            })}
                        </React.Fragment>
                    ))}
                </div>
            </div>
        )}
    </div>
  );
}

function ExpandedView({ subjects, handleDelete }: { subjects: Subject[], handleDelete: (id: string) => void }) {
    const weekDays = getWeekDays();
    const { settings } = useAppContext();
    
    const workingDayIndexes = useMemo(() => {
        const indexes = [1, 2, 3, 4, 5]; // Mon-Fri
        if (settings.workingDays === 'Mon-Sat') {
            indexes.push(6); // Add Saturday
        }
        return indexes;
    }, [settings.workingDays]);

    const subjectsByDay = useMemo(() => {
        const grouped: { [key: number]: Subject[] } = {};
        workingDayIndexes.forEach(i => grouped[i] = []);
        
        subjects.forEach(subject => {
            if (grouped[subject.day] !== undefined) {
                grouped[subject.day].push(subject);
            }
        });

        for (const day in grouped) {
            grouped[day].sort((a, b) => a.startTime.localeCompare(b.startTime));
        }
        return grouped;
    }, [subjects, workingDayIndexes]);

    return (
        <div className="space-y-4">
            {Object.entries(subjectsByDay).filter(([, daySubjects]) => daySubjects.length > 0).map(([day, daySubjects]) => (
                <Card key={day}>
                    <CardHeader>
                        <CardTitle className="text-lg">{weekDays[parseInt(day)]}</CardTitle>
                    </CardHeader>
                    <CardContent className="space-y-3">
                        {daySubjects.map(subject => (
                            <div key={subject.id} className="flex items-center justify-between p-3 bg-muted/50 rounded-lg">
                                <div>
                                    <p className="font-semibold">{subject.name}</p>
                                    <p className="text-sm text-muted-foreground">{subject.startTime} - {subject.endTime}</p>
                                    {subject.teacher && <p className="text-xs text-muted-foreground pt-1">{subject.teacher}</p>}
                                </div>
                                 <DropdownMenu>
                                    <DropdownMenuTrigger asChild>
                                        <Button variant="ghost" size="icon" className="h-8 w-8">
                                            <MoreVertical size={16} />
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
                        ))}
                    </CardContent>
                </Card>
            ))}
        </div>
    );
}
