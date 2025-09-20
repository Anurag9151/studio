
'use client';

import React from 'react';
import { useAppContext } from '@/contexts/app-context';
import { getWeekDays } from '@/lib/utils';
import { Edit, Trash2, MoreVertical, Coffee } from 'lucide-react';
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
import { useMemo } from 'react';
import type { Subject } from '@/lib/types';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { addMinutes, format, parse } from 'date-fns';

export function TimetableListView({ subjects, handleDelete }: { subjects: Subject[], handleDelete: (id: string) => void }) {
    const weekDays = getWeekDays();
    const { settings } = useAppContext();
    
    const workingDayIndexes = useMemo(() => {
        const indexes = [1, 2, 3, 4, 5]; // Mon-Fri
        if (settings.workingDays === 'Mon-Sat') {
            indexes.push(6); // Add Saturday
        }
        return indexes;
    }, [settings.workingDays]);
    
    const lunchStartTime = settings.lunchStartTime || '13:00';
    const lunchDuration = settings.lunchDuration || 0;
    const lunchEndTime = format(addMinutes(parse(lunchStartTime, 'HH:mm', new Date()), lunchDuration), 'HH:mm');

    const subjectsByDay = useMemo(() => {
        const grouped: { [key: number]: (Subject | { isLunch: boolean, startTime: string, endTime: string, id: string })[] } = {};
        workingDayIndexes.forEach(i => grouped[i] = []);
        
        const uniqueSubjects = Array.from(new Map(subjects.map(s => [s.id, s])).values());
        
        uniqueSubjects.forEach(subject => {
            if (grouped[subject.day] !== undefined) {
                grouped[subject.day].push(subject);
            }
        });
        
        if (lunchDuration > 0) {
            workingDayIndexes.forEach(dayIndex => {
                grouped[dayIndex].push({
                    isLunch: true,
                    startTime: lunchStartTime,
                    endTime: lunchEndTime,
                    id: `lunch-${dayIndex}`,
                });
            });
        }

        for (const day in grouped) {
            grouped[day].sort((a, b) => a.startTime.localeCompare(b.startTime));
        }
        return grouped;
    }, [subjects, workingDayIndexes, lunchDuration, lunchStartTime, lunchEndTime]);

    return (
        <div className="space-y-4">
            {Object.entries(subjectsByDay).filter(([, dayItems]) => dayItems.length > 0).map(([day, dayItems]) => (
                <Card key={day}>
                    <CardHeader>
                        <CardTitle className="text-lg">{weekDays[parseInt(day)]}</CardTitle>
                    </CardHeader>
                    <CardContent className="space-y-3">
                        {dayItems.map(item => {
                            if ('isLunch' in item && item.isLunch) {
                                return (
                                     <div key={item.id} className="flex items-center gap-3 p-3 bg-muted/30 rounded-lg">
                                        <Coffee className="w-5 h-5 text-muted-foreground" />
                                        <div>
                                            <p className="font-semibold text-muted-foreground">Lunch Break</p>
                                            <p className="text-sm text-muted-foreground">{item.startTime} - {item.endTime}</p>
                                        </div>
                                    </div>
                                )
                            }
                            const subject = item as Subject;
                            return (
                                <div key={subject.id} className="flex items-center justify-between p-3 bg-muted/50 rounded-lg">
                                    <div className="flex items-center gap-3">
                                        <div className="w-2 h-10 rounded-full" style={{ backgroundColor: subject.color || '#3b82f6' }} />
                                        <div>
                                            <p className="font-semibold">{subject.name}</p>
                                            <p className="text-sm text-muted-foreground">{subject.startTime} - {subject.endTime}</p>
                                            {subject.teacher && <p className="text-xs text-muted-foreground pt-1">{subject.teacher}</p>}
                                        </div>
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
                            )
                        })}
                    </CardContent>
                </Card>
            ))}
        </div>
    );
}
