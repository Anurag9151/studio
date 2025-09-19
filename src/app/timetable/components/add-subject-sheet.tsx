
'use client';

import { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
  SheetTrigger,
  SheetFooter,
  SheetClose
} from '@/components/ui/sheet';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { PlusCircle } from 'lucide-react';
import { useAppContext } from '@/contexts/app-context';
import { useToast } from '@/hooks/use-toast';
import { getWeekDays } from '@/lib/utils';
import type { Subject } from '@/lib/types';

type AddSubjectSheetProps = {
  subject?: Subject;
  children?: React.ReactNode;
  day?: number;
  startTime?: string;
};

export function AddSubjectSheet({ subject, children, day: preselectedDay, startTime: preselectedStartTime }: AddSubjectSheetProps) {
  const { subjects, setSubjects } = useAppContext();
  const { toast } = useToast();
  const [open, setOpen] = useState(false);

  // Form state
  const [name, setName] = useState('');
  const [teacher, setTeacher] = useState('');
  const [day, setDay] = useState('');
  const [startTime, setStartTime] = useState('');
  const [endTime, setEndTime] = useState('');
  
  const weekDays = getWeekDays();
  
  useEffect(() => {
    if (open) {
      if (subject) {
        setName(subject.name || '');
        setTeacher(subject.teacher || '');
        setDay(subject.day !== undefined ? String(subject.day) : '');
        setStartTime(subject.startTime || '');
        setEndTime(subject.endTime || '');
      } else {
        // Reset form for new subject
        setName('');
        setTeacher('');
        setDay(preselectedDay !== undefined ? String(preselectedDay) : '');
        setStartTime(preselectedStartTime || '');
        setEndTime(preselectedStartTime ? `${parseInt(preselectedStartTime.split(':')[0]) + 1}:00`.padStart(5, '0') : '');
      }
    }
  }, [open, subject, subjects, preselectedDay, preselectedStartTime]);


  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!name || !day || !startTime || !endTime) {
      toast({
        title: "Incomplete Form",
        description: "Please fill out all fields.",
        variant: "destructive",
      });
      return;
    }

    if (startTime >= endTime) {
       toast({
        title: "Invalid Time",
        description: "Start time must be before end time.",
        variant: "destructive",
      });
      return;
    }

    const numericDay = parseInt(day, 10);
    if (isNaN(numericDay)) {
        toast({
            title: "Invalid Day",
            description: "Please select a valid day.",
            variant: "destructive",
        });
        return;
    }
    
    // All subjects will use the same color
    const finalColor = 'hsl(var(--primary))';


    if (subject) {
      const updatedSubjects = subjects.map(s =>
        s.id === subject.id
          ? { ...s, name, teacher, day: numericDay, startTime, endTime, color: finalColor }
          : s
      );
      setSubjects(updatedSubjects);
      toast({ title: "Subject Updated", description: `${name} has been updated.` });
    } else {
      const newSubject: Subject = {
        id: crypto.randomUUID(),
        name,
        teacher,
        day: numericDay,
        startTime,
        endTime,
        color: finalColor,
      };
      setSubjects([...subjects, newSubject]);
      toast({ title: "Subject Added", description: `${name} has been added to your timetable.` });
    }

    setOpen(false);
  };

  return (
    <Sheet open={open} onOpenChange={setOpen}>
      <SheetTrigger asChild>
        {children ? children : (
            <Button>
                <PlusCircle className="mr-2 h-4 w-4" /> Add Class
            </Button>
        )}
      </SheetTrigger>
      <SheetContent side="bottom" className="rounded-t-lg">
        <SheetHeader className="text-left">
          <SheetTitle>{subject ? 'Edit Class' : 'Add Class'}</SheetTitle>
        </SheetHeader>
        <form onSubmit={handleSubmit} className="flex flex-col h-full">
          <div className="flex-1 space-y-4 py-4 overflow-y-auto">
            
            <div className="bg-muted/50 p-4 rounded-lg">
              <Label htmlFor="name" className="text-sm font-normal text-muted-foreground">Subject</Label>
              <Input id="name" value={name} onChange={e => setName(e.target.value)} placeholder="e.g. History" className="bg-transparent border-none text-base p-0 h-auto" />
            </div>

             <div className="bg-muted/50 p-4 rounded-lg">
              <Label htmlFor="teacher" className="text-sm font-normal text-muted-foreground">Teacher (Optional)</Label>
              <Input id="teacher" value={teacher} onChange={e => setTeacher(e.target.value)} placeholder="e.g. Prof. Smith" className="bg-transparent border-none text-base p-0 h-auto" />
            </div>

            <div className="bg-muted/50 p-4 rounded-lg">
                <Label htmlFor="day" className="text-sm font-normal text-muted-foreground">Day</Label>
                <Select onValueChange={setDay} value={day}>
                    <SelectTrigger className="bg-transparent border-none text-base p-0 h-auto">
                        <SelectValue placeholder="Select a day" />
                    </SelectTrigger>
                    <SelectContent>
                    {weekDays.map((weekday, index) => (
                        <SelectItem key={weekday} value={String(index)}>{weekday}</SelectItem>
                    ))}
                    </SelectContent>
                </Select>
            </div>
            
            <div className="grid grid-cols-2 gap-4">
                <div className="bg-muted/50 p-4 rounded-lg">
                    <Label htmlFor="start-time" className="text-sm font-normal text-muted-foreground">Start Time</Label>
                    <Input id="start-time" type="time" value={startTime} onChange={e => setStartTime(e.target.value)} className="bg-transparent border-none text-base p-0 h-auto" />
                </div>
                <div className="bg-muted/50 p-4 rounded-lg">
                    <Label htmlFor="end-time" className="text-sm font-normal text-muted-foreground">End Time</Label>
                    <Input id="end-time" type="time" value={endTime} onChange={e => setEndTime(e.target.value)} className="bg-transparent border-none text-base p-0 h-auto" />
                </div>
            </div>

          </div>
          <SheetFooter>
            <SheetClose asChild>
                <Button type="button" variant="outline">Cancel</Button>
            </SheetClose>
            <Button type="submit" className="w-full">Save</Button>
          </SheetFooter>
        </form>
      </SheetContent>
    </Sheet>
  );
}
