
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
import { addMinutes, format, parse } from 'date-fns';

type AddSubjectSheetProps = {
  subject?: Subject;
  children?: React.ReactNode;
  day?: number;
  startTime?: string;
};

export function AddSubjectSheet({ subject, children, day: preselectedDay, startTime: preselectedStartTime }: AddSubjectSheetProps) {
  const { subjects, setSubjects, settings } = useAppContext();
  const { toast } = useToast();
  const [open, setOpen] = useState(false);

  // Form state
  const [name, setName] = useState('');
  const [teacher, setTeacher] = useState('');
  const [day, setDay] = useState('');
  const [startTime, setStartTime] = useState('');
  const [endTime, setEndTime] = useState('');
  
  const weekDays = getWeekDays();
  const chartColors = [
    'hsl(var(--chart-1))',
    'hsl(var(--chart-2))',
    'hsl(var(--chart-3))',
    'hsl(var(--chart-4))',
    'hsl(var(--chart-5))',
  ];
  
  const calculateEndTime = (start: string) => {
    if (!start) return '';
    const duration = settings.classPeriodDuration || 60;
    const startTimeDate = parse(start, 'HH:mm', new Date());
    const endTimeDate = addMinutes(startTimeDate, duration);
    return format(endTimeDate, 'HH:mm');
  };

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
        const newStartTime = preselectedStartTime || '';
        setName('');
        setTeacher('');
        setDay(preselectedDay !== undefined ? String(preselectedDay) : '');
        setStartTime(newStartTime);
        setEndTime(calculateEndTime(newStartTime));
      }
    }
  }, [open, subject, preselectedDay, preselectedStartTime]);

  const handleStartTimeChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const newStartTime = e.target.value;
    setStartTime(newStartTime);
    setEndTime(calculateEndTime(newStartTime));
  };

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
    
    // Check if a subject with this name already exists
    const existingSubject = subjects.find(s => s.name.toLowerCase() === name.toLowerCase());
    let finalColor = existingSubject?.color;

    if (!finalColor) {
      const uniqueSubjectNames = new Set(subjects.map(s => s.name));
      if (!existingSubject) {
          uniqueSubjectNames.add(name);
      }
      const uniqueNamesCount = Array.from(uniqueSubjectNames).length;
      finalColor = chartColors[(uniqueNamesCount - 1) % chartColors.length];
    }


    if (subject) {
      // If we are editing, we need to decide if we update colors for all subjects with the same name.
      // If the name has changed, all subjects with the old name should retain their color, and this one gets a new one.
      const oldName = subject.name;
      const newName = name;
      const updatedSubjects = subjects.map(s => {
        // Update the subject being edited
        if (s.id === subject.id) {
          return { ...s, name: newName, teacher, day: numericDay, startTime, endTime, color: finalColor };
        }
        // If other subjects share the new name, update their color too
        if (s.name.toLowerCase() === newName.toLowerCase()) {
            return { ...s, color: finalColor };
        }
        return s;
      });
      setSubjects(updatedSubjects);
      toast({ title: "Subject Updated", description: `${name} has been updated.` });

    } else {
       // On adding a new subject, if other subjects with the same name exist, use their color.
       const newSubject: Subject = {
        id: crypto.randomUUID(),
        name,
        teacher,
        day: numericDay,
        startTime,
        endTime,
        color: finalColor,
      };

      const updatedSubjects = subjects.map(s => 
          s.name.toLowerCase() === name.toLowerCase() 
          ? { ...s, color: finalColor } 
          : s
      );

      setSubjects([...updatedSubjects, newSubject]);
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
                    <Input id="start-time" type="time" value={startTime} onChange={handleStartTimeChange} className="bg-transparent border-none text-base p-0 h-auto" />
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
