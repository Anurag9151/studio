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
                <PlusCircle className="mr-2 h-4 w-4" /> Add Subject
            </Button>
        )}
      </SheetTrigger>
      <SheetContent>
        <SheetHeader>
          <SheetTitle>{subject ? 'Edit Subject' : 'Add a New Subject'}</SheetTitle>
          <SheetDescription>
            {subject ? 'Update the details for this class.' : 'Add a new class to your weekly schedule.'}
          </SheetDescription>
        </SheetHeader>
        <form onSubmit={handleSubmit}>
          <div className="grid gap-4 py-4">
            <div className="grid grid-cols-4 items-center gap-4">
              <Label htmlFor="name" className="text-right">Subject Name</Label>
              <Input id="name" value={name} onChange={e => setName(e.target.value)} className="col-span-3" placeholder="e.g. Physics" />
            </div>
            <div className="grid grid-cols-4 items-center gap-4">
              <Label htmlFor="day" className="text-right">Day</Label>
              <Select onValueChange={setDay} value={day}>
                <SelectTrigger className="col-span-3">
                  <SelectValue placeholder="Select a day" />
                </SelectTrigger>
                <SelectContent>
                  {weekDays.map((weekday, index) => (
                    <SelectItem key={weekday} value={index.toString()}>{weekday}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div className="grid grid-cols-4 items-center gap-4">
              <Label htmlFor="start-time" className="text-right">Start Time</Label>
              <Input id="start-time" type="time" value={startTime} onChange={e => setStartTime(e.target.value)} className="col-span-3" />
            </div>
            <div className="grid grid-cols-4 items-center gap-4">
              <Label htmlFor="end-time" className="text-right">End Time</Label>
              <Input id="end-time" type="time" value={endTime} onChange={e => setEndTime(e.target.value)} className="col-span-3" />
            </div>
          </div>
          <SheetFooter>
            <SheetClose asChild>
                <Button type="submit">Save Changes</Button>
            </SheetClose>
          </SheetFooter>
        </form>
      </SheetContent>
    </Sheet>
  );
}
