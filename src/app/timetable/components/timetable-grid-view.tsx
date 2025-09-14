'use client';

import React from 'react';
import { useAppContext } from '@/contexts/app-context';
import { getWeekDays, cn } from '@/lib/utils';
import { Edit } from 'lucide-react';
import { AddSubjectSheet } from './add-subject-sheet';
import { useMemo } from 'react';
import type { Subject } from '@/lib/types';
import { getDay, format } from 'date-fns';

export function TimetableGridView({ subjects }: { subjects: Subject[] }) {
  const { settings } = useAppContext();
  const weekDays = getWeekDays();
  const today = getDay(new Date());

  const workingDays = useMemo(() => {
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

  return (
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
                                        <button 
                                            className="w-full h-full rounded-md p-1 text-left group relative text-white"
                                            style={{ backgroundColor: subjectInfo.color || '#3b82f6' }}
                                        >
                                            <p className="font-bold text-xs truncate">{subjectInfo.name}</p>
                                            <p className="text-xs opacity-80">{subjectInfo.teacher}</p>
                                            <div className="absolute top-1 right-1 opacity-0 group-hover:opacity-100 transition-opacity">
                                                <Edit size={12} />
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
  );
}
