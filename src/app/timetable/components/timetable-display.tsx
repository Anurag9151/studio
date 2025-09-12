'use client';

import { useAppContext } from '@/contexts/app-context';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { getWeekDays } from '@/lib/utils';
import { Button } from '@/components/ui/button';
import { MoreHorizontal, Edit, Trash2 } from 'lucide-react';
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
import { Badge } from '@/components/ui/badge';
import { useState } from 'react';

export default function TimetableDisplay() {
  const { subjects, setSubjects, setAttendanceRecords } = useAppContext();
  const { toast } = useToast();
  const weekDays = getWeekDays();
  const [activeDay, setActiveDay] = useState(new Date().getDay());

  const handleDelete = (subjectId: string) => {
    setSubjects(subjects.filter(s => s.id !== subjectId));
    setAttendanceRecords(records => records.filter(r => r.subjectId !== subjectId));
    toast({
        title: "Subject Deleted",
        description: "The subject and its attendance records have been removed.",
        variant: "destructive"
    })
  };
  
  const daySubjects = subjects
    .filter(s => s.day === activeDay)
    .sort((a, b) => a.startTime.localeCompare(b.startTime));

  if (subjects.length === 0) {
    return (
        <div className="text-center py-20 bg-card rounded-lg border border-dashed">
            <h3 className="mt-2 text-lg font-semibold">No subjects in your timetable</h3>
            <p className="mt-1 text-sm text-muted-foreground">Get started by adding your first subject.</p>
        </div>
    )
  }

  return (
    <div className="space-y-4">
      <div className="flex justify-between overflow-x-auto pb-2">
        {weekDays.map((day, dayIndex) => (
          <Button
            key={day}
            variant={activeDay === dayIndex ? 'default' : 'ghost'}
            onClick={() => setActiveDay(dayIndex)}
            className="flex-shrink-0"
          >
            {day.substring(0, 3)}
          </Button>
        ))}
      </div>

      <div className="space-y-3">
        {daySubjects.length > 0 ? (
          daySubjects.map(subject => (
            <Card key={subject.id} className="p-4 relative group">
                <div className="flex justify-between items-start">
                    <div>
                        <p className="font-semibold">{subject.name}</p>
                        <p className="text-sm text-muted-foreground">{subject.startTime} - {subject.endTime}</p>
                    </div>
                     <Badge variant="secondary">{weekDays[subject.day].substring(0,3)}</Badge>
                </div>
              
              <div className="absolute top-1 right-1">
                  <DropdownMenu>
                      <DropdownMenuTrigger asChild>
                          <Button variant="ghost" size="icon" className="h-7 w-7 opacity-0 group-hover:opacity-100">
                              <MoreHorizontal className="h-4 w-4" />
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
            </Card>
          ))
        ) : (
          <div className="text-center text-sm text-muted-foreground pt-16 h-full">
            No classes for {weekDays[activeDay]}.
          </div>
        )}
      </div>
    </div>
  );
}
