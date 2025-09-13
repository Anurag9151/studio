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
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/components/ui/accordion"
import { useToast } from '@/hooks/use-toast';
import { useMemo } from 'react';
import type { Subject } from '@/lib/types';
import { Button } from '@/components/ui/button';

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

  const subjectsByDay = useMemo(() => {
    const grouped: { [key: number]: Subject[] } = {};
    subjects.forEach(subject => {
      if (!grouped[subject.day]) {
        grouped[subject.day] = [];
      }
      grouped[subject.day].push(subject);
      grouped[subject.day].sort((a,b) => a.startTime.localeCompare(b.startTime));
    });
    return grouped;
  }, [subjects]);

  const scheduledDays = useMemo(() => {
    return Object.keys(subjectsByDay).map(Number).sort((a,b) => a - b);
  }, [subjectsByDay])

  if (subjects.length === 0) {
    return (
        <div className="text-center py-20 bg-card rounded-lg border border-dashed">
            <h3 className="mt-2 text-lg font-semibold">No subjects in your timetable</h3>
            <p className="mt-1 text-sm text-muted-foreground">Get started by adding your first subject.</p>
        </div>
    )
  }
  
  return (
    <div className="space-y-3">
       <Accordion type="multiple" defaultValue={scheduledDays.map(d => d.toString())} className="w-full space-y-3">
        {scheduledDays.map(dayIndex => (
          <AccordionItem key={dayIndex} value={dayIndex.toString()} className="bg-card border rounded-lg overflow-hidden">
            <AccordionTrigger className="px-4 py-3 text-base font-semibold hover:no-underline">
              {weekDays[dayIndex]}
            </AccordionTrigger>
            <AccordionContent className="border-t">
              <div className="divide-y">
                {subjectsByDay[dayIndex].map(subject => (
                  <div key={subject.id} className="p-4 flex justify-between items-center group">
                    <div>
                      <p className="font-medium">{subject.name}</p>
                      <p className="text-sm text-muted-foreground">{subject.startTime} - {subject.endTime}</p>
                    </div>
                    <div className="opacity-0 group-hover:opacity-100 transition-opacity">
                      <DropdownMenu>
                          <DropdownMenuTrigger asChild>
                              <Button variant="ghost" size="icon" className="h-8 w-8">
                                  <MoreVertical size={18} />
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
                ))}
              </div>
            </AccordionContent>
          </AccordionItem>
        ))}
       </Accordion>
    </div>
  );
}
