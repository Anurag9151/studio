'use client';

import React from 'react';
import { useAppContext } from '@/contexts/app-context';
import { getWeekDays, cn } from '@/lib/utils';
import { AddSubjectSheet } from './add-subject-sheet';
import { useMemo } from 'react';
import type { Subject } from '@/lib/types';
import { getDay, format } from 'date-fns';

export function TimetableGridView({ subjects }: { subjects: Subject[] }) {
  const { settings } = useAppContext();
  const weekDays = getWeekDays();
  const today = getDay(new Date());

  const workingDayNames = useMemo(() => {
    let days = [weekDays[1], weekDays[2], weekDays[3], weekDays[4], weekDays[5]];
    if (settings.workingDays === 'Mon-Sat') {
      days.push(weekDays[6]);
    }
    return days;
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
    const grid: { [key: string]: { [key: string]: Subject | null } } = {};
    workingDayNames.forEach(day => {
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
    return grid;
  }, [subjects, workingDayNames, timeSlots, weekDays]);

  const lunchTimeSlot = '13:00';
  const lunchLetters = ['L', 'U', 'N', 'C', 'H'];

  return (
    <div className="bg-card text-card-foreground overflow-x-auto rounded-lg shadow-lg border-2 border-primary/50">
        <table className="w-full min-w-max border-collapse">
            <thead>
                <tr className="bg-primary/80 text-primary-foreground">
                    <th className="p-2 border border-border text-xs font-semibold uppercase">Time</th>
                    {timeSlots.map(slot => (
                        <th key={slot} className="p-2 border border-border text-xs font-semibold">
                            {format(new Date(`1970-01-01T${slot}`), 'h:mm a')}
                        </th>
                    ))}
                </tr>
            </thead>
            <tbody>
                 {workingDayNames.map((day, dayIndex) => {
                    const isToday = weekDays.indexOf(day) === today;
                    return (
                        <tr key={day} className={cn(isToday ? "bg-primary/10" : "")}>
                            <td className="p-2 border border-border text-center text-xs font-bold uppercase bg-primary/80 text-primary-foreground">{day.substring(0,3)}</td>
                             {timeSlots.map((slot, slotIndex) => {
                                if (settings.lunchBreak && slot === lunchTimeSlot) {
                                  const lunchChar = lunchLetters[dayIndex] || '';
                                  return (
                                     <td key={`${day}-${slot}`} className="p-1 border border-border text-center align-middle bg-primary/20">
                                         <span className="font-bold text-primary/80 text-sm">{lunchChar}</span>
                                     </td>
                                  )
                                }
                                
                                const subject = subjectsByDayTime[day]?.[slot];
                                if (subject) {
                                    return (
                                        <td key={`${day}-${slot}`} className="p-1 border border-border text-center align-middle">
                                            <AddSubjectSheet subject={subject}>
                                                <button 
                                                    className="w-full h-full rounded-md p-1.5 text-left group relative bg-card hover:bg-muted"
                                                >
                                                    <p className="font-bold text-xs truncate text-foreground">{subject.name}</p>
                                                    {subject.teacher && <p className="text-xs text-muted-foreground opacity-80">{subject.teacher}</p>}
                                                </button>
                                            </AddSubjectSheet>
                                        </td>
                                    )
                                }
                                return <td key={`${day}-${slot}`} className="border border-border"></td>
                            })}
                        </tr>
                    )
                 })}
            </tbody>
        </table>
    </div>
  );
}
