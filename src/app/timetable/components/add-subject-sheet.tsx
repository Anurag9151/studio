'use client';

import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import {
  Sheet,
  SheetContent,
  SheetDescription,
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
};

export function AddSubjectSheet({ subject, children }: AddSubjectSheetProps) {
  const { subjects, setSubjects } = useAppContext();
  const { toast } = useToast();
  const [open, setOpen] = useState(false);

  const [name, setName] = useState(subject?.name || '');
  const [day, setDay] = useState<string>(subject?.day?.toString() || '');
  const [startTime, setStartTime] = useState(subject?.startTime || '');
  const [endTime, setEndTime] = useState(subject?.endTime || '');

  const weekDays = getWeekDays();

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

    if (subject) {
      // Edit mode
      const updatedSubjects = subjects.map(s =>
        s.id === subject.id
          ? { ...s, name, day: parseInt(day), startTime, endTime }
          : s
      );
      setSubjects(updatedSubjects);
      toast({ title: "Subject Updated", description: `${name} has been updated.` });
    } else {
      // Add mode
      const newSubject: Subject = {
        id: crypto.randomUUID(),
        name,
        day: parseInt(day),
        startTime,
        endTime,
      };
      setSubjects([...subjects, newSubject]);
      toast({ title: "Subject Added", description: `${name} has been added to your timetable.` });
    }

    // Reset form
    setName('');
    setDay('');
    setStartTime('');
    setEndTime('');
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
        <form onSubmit={handleSubmit}>
          <div className="grid gap-4 py-4">
            <div className="space-y-2">
              <Label htmlFor="name">Subject</Label>
              <Input id="name" value={name} onChange={e => setName(e.target.value)} placeholder="e.g. History" />
            </div>
            <div className="space-y-2">
              <Label htmlFor="day">Day</Label>
              <Select onValueChange={setDay} value={day}>
                <SelectTrigger>
                  <SelectValue placeholder="Select a day" />
                </SelectTrigger>
                <SelectContent>
                  {weekDays.map((weekday, index) => (
                    <SelectItem key={weekday} value={index.toString()}>{weekday}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
             <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                    <Label htmlFor="start-time">Start Time</Label>
                    <Input id="start-time" type="time" value={startTime} onChange={e => setStartTime(e.target.value)} />
                </div>
                <div className="space-y-2">
                    <Label htmlFor="end-time">End Time</Label>
                    <Input id="end-time" type="time" value={endTime} onChange={e => setEndTime(e.target.value)} />
                </div>
            </div>
          </div>
          <SheetFooter>
            <SheetClose asChild>
                <Button type="submit" className="w-full">Save</Button>
            </SheetClose>
          </SheetFooter>
        </form>
      </SheetContent>
    </Sheet>
  );
}
