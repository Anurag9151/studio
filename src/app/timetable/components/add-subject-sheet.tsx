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
import { PlusCircle, CalendarDays } from 'lucide-react';
import { useAppContext } from '@/contexts/app-context';
import { useToast } from '@/hooks/use-toast';
import { getWeekDays } from '@/lib/utils';
import type { Subject } from '@/lib/types';
import { addMinutes, format, parse, differenceInMinutes } from 'date-fns';
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from '@/components/ui/popover';
import { Checkbox } from '@/components/ui/checkbox';

type AddSubjectSheetProps = {
  subject?: Subject;
  children?: React.ReactNode;
  day?: number;
  startTime?: string;
};

export function AddSubjectSheet({ subject, children, day: preselectedDay, startTime: preselectedStartTime }: AddSubjectSheetProps) {
  const { subjects, setSubjects, settings, setAttendanceRecords } = useAppContext();
  const { toast } = useToast();
  const [open, setOpen] = useState(false);

  // Form state
  const [name, setName] = useState('');
  const [teacher, setTeacher] = useState('');
  const [days, setDays] = useState<number[]>([]);
  const [startTime, setStartTime] = useState('');
  const [endTime, setEndTime] = useState('');
  const [duration, setDuration] = useState<number | string>(settings.classPeriodDuration || 60);
  const [editingGroupIds, setEditingGroupIds] = useState<string[]>([]);

  const weekDays = getWeekDays();
  const chartColors = [
    'hsl(var(--chart-1))',
    'hsl(var(--chart-2))',
    'hsl(var(--chart-3))',
    'hsl(var(--chart-4))',
    'hsl(var(--chart-5))',
  ];
  
  const calculateEndTime = (start: string, newDuration: number) => {
    if (!start) return '';
    const startTimeDate = parse(start, 'HH:mm', new Date());
    const endTimeDate = addMinutes(startTimeDate, newDuration);
    return format(endTimeDate, 'HH:mm');
  };

  useEffect(() => {
    if (open) {
      if (subject) {
        // Editing mode: find all instances of this class (same name and start time)
        const group = subjects.filter(
            s => s.name === subject.name && s.startTime === subject.startTime
        );
        const groupIds = group.map(s => s.id);
        const groupDays = group.map(s => s.day);

        setEditingGroupIds(groupIds);
        setDays(groupDays);
        
        // Set other form fields from the subject that was clicked
        setName(subject.name || '');
        setTeacher(subject.teacher || '');
        setStartTime(subject.startTime || '');
        setEndTime(subject.endTime || '');
        if (subject.startTime && subject.endTime) {
            const start = parse(subject.startTime, 'HH:mm', new Date());
            const end = parse(subject.endTime, 'HH:mm', new Date());
            const diff = differenceInMinutes(end, start);
            setDuration(diff);
        } else {
            setDuration(settings.classPeriodDuration || 60);
        }
      } else {
        // Adding mode
        const newStartTime = preselectedStartTime || '';
        const newDuration = settings.classPeriodDuration || 60;
        setName('');
        setTeacher('');
        setDays(preselectedDay !== undefined ? [preselectedDay] : []);
        setEditingGroupIds([]);
        setStartTime(newStartTime);
        setDuration(newDuration);
        setEndTime(calculateEndTime(newStartTime, newDuration));
      }
    }
  }, [open, subject, subjects, preselectedDay, preselectedStartTime, settings.classPeriodDuration]);

  const handleStartTimeChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const newStartTime = e.target.value;
    setStartTime(newStartTime);
    if(typeof duration === 'number') {
        setEndTime(calculateEndTime(newStartTime, duration));
    }
  };

  const handleDurationChange = (value: string) => {
    const newDuration = parseInt(value, 10);
    setDuration(newDuration);
    if(startTime) {
        setEndTime(calculateEndTime(startTime, newDuration));
    }
  }

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!name || days.length === 0 || !startTime || !endTime) {
      toast({
        title: "Incomplete Form",
        description: "Please fill out name, days, and time.",
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
    
    // Find color
    const existingSubjectForColor = subjects.find(s => s.name.toLowerCase() === name.toLowerCase() && !editingGroupIds.includes(s.id));
    let finalColor = existingSubjectForColor?.color;
    if (subject && subject.name.toLowerCase() === name.toLowerCase()) {
        finalColor = subject.color;
    }

    if (!finalColor) {
      const uniqueSubjectNames = new Set(subjects.filter(s => !editingGroupIds.includes(s.id)).map(s => s.name));
       if (!uniqueSubjectNames.has(name)) {
          uniqueSubjectNames.add(name);
      }
      const uniqueNamesCount = Array.from(uniqueSubjectNames).length;
      finalColor = chartColors[(uniqueNamesCount) % chartColors.length];
    }
    
    const subjectsFromOriginalGroup = subjects.filter(s => editingGroupIds.includes(s.id));
    const originalDays = subjectsFromOriginalGroup.map(s => s.day);
    
    const daysToDelete = originalDays.filter(d => !days.includes(d));
    const daysToAdd = days.filter(d => !originalDays.includes(d));
    const daysToKeepAndUpdate = originalDays.filter(d => days.includes(d));

    let currentSubjects = [...subjects];
    const idsToDelete: string[] = [];

    // 1. Delete subjects for days that were unchecked
    daysToDelete.forEach(dayToDelete => {
        const subjectToDelete = subjectsFromOriginalGroup.find(s => s.day === dayToDelete);
        if (subjectToDelete) {
            idsToDelete.push(subjectToDelete.id);
        }
    });
    
    currentSubjects = currentSubjects.filter(s => !idsToDelete.includes(s.id));
    if (idsToDelete.length > 0) {
        setAttendanceRecords(prev => prev.filter(rec => !idsToDelete.includes(rec.subjectId)));
    }

    // 2. Update subjects for days that remained checked
    currentSubjects = currentSubjects.map(s => {
        if (daysToKeepAndUpdate.includes(s.day) && editingGroupIds.includes(s.id)) {
            return {
                ...s,
                name,
                teacher,
                startTime,
                endTime,
                color: finalColor,
            };
        }
        return s;
    });

    // 3. Add new subjects for newly checked days
    const newSubjects: Subject[] = daysToAdd.map(dayToAdd => ({
        id: crypto.randomUUID(),
        name,
        teacher,
        day: dayToAdd,
        startTime,
        endTime,
        color: finalColor,
    }));
    currentSubjects.push(...newSubjects);

    // 4. Final color sync for all subjects with this name
    currentSubjects = currentSubjects.map(s => 
        s.name.toLowerCase() === name.toLowerCase() 
        ? { ...s, color: finalColor } 
        : s
    );

    setSubjects(currentSubjects);
    
    toast({ 
      title: subject ? "Class Schedule Updated" : "Class Schedule Added",
      description: `${name} is now scheduled for the selected days.`
    });

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
                <Label className="text-sm font-normal text-muted-foreground">Days</Label>
                <Popover>
                    <PopoverTrigger asChild>
                        <Button
                            variant="ghost"
                            className="w-full justify-start text-left font-normal bg-transparent border-none text-base p-0 h-auto mt-1 hover:bg-transparent"
                        >
                            <span className="truncate text-foreground">
                                {days.length > 0
                                    ? days.sort().map(d => weekDays[d]).join(', ')
                                    : 'Select days'
                                }
                            </span>
                        </Button>
                    </PopoverTrigger>
                    <PopoverContent className="w-auto p-0" align="start">
                        <div className="p-4 grid gap-2">
                            {weekDays.map((weekday, dayIndex) => {
                                if (dayIndex === 0) return null; // Skip Sunday
                                return (
                                    <div key={dayIndex} className="flex items-center space-x-2">
                                        <Checkbox
                                            id={`day-${dayIndex}`}
                                            checked={days.includes(dayIndex)}
                                            onCheckedChange={(checked) => {
                                                setDays(prev => checked ? [...prev, dayIndex] : prev.filter(d => d !== dayIndex))
                                            }}
                                        />
                                        <Label htmlFor={`day-${dayIndex}`} className="font-normal text-foreground">{weekday}</Label>
                                    </div>
                                )
                            })}
                        </div>
                    </PopoverContent>
                </Popover>
            </div>
            
            <div className="grid grid-cols-2 gap-4">
                <div className="bg-muted/50 p-4 rounded-lg">
                    <Label htmlFor="start-time" className="text-sm font-normal text-muted-foreground">Start Time</Label>
                    <Input id="start-time" type="time" value={startTime} onChange={handleStartTimeChange} className="bg-transparent border-none text-base p-0 h-auto" />
                </div>
                 <div className="bg-muted/50 rounded-lg">
                    <Label className="text-sm font-normal text-muted-foreground px-4 pt-4">Duration</Label>
                    <Select onValueChange={handleDurationChange} value={String(duration)}>
                        <SelectTrigger className="bg-transparent border-none text-base h-auto">
                            <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                            <SelectItem value="40">40 minutes</SelectItem>
                            <SelectItem value="45">45 minutes</SelectItem>
                            <SelectItem value="50">50 minutes</SelectItem>
                            <SelectItem value="60">1 hour</SelectItem>
                            <SelectItem value="90">1 hour 30 minutes</SelectItem>
                            <SelectItem value="120">2 hours</SelectItem>
                        </SelectContent>
                    </Select>
                </div>
            </div>
            <div className="bg-muted/50 p-4 rounded-lg">
              <Label htmlFor="end-time" className="text-sm font-normal text-muted-foreground">End Time</Label>
              <Input id="end-time" type="time" value={endTime} onChange={e => setEndTime(e.target.value)} className="bg-transparent border-none text-base p-0 h-auto" />
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
