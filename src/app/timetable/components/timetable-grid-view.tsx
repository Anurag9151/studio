'use client';

import React from 'react';
import { useAppContext } from '@/contexts/app-context';
import { getWeekDays, cn } from '@/lib/utils';
import { AddSubjectSheet } from './add-subject-sheet';
import { useMemo } from 'react';
import type { Subject } from '@/lib/types';
import { getDay, format, parse, addMinutes, isBefore } from 'date-fns';

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
        // Simple placement logic: find the hour slot
        const hour = subject.startTime.split(':')[0] + ':00';
        if (grid[dayName]?.[hour] === null) {
          grid[dayName][hour] = subject;
        }
      }
    });
    return grid;
  }, [subjects, workingDayNames, timeSlots, weekDays]);

  const lunchStartTime = settings.lunchStartTime || '13:00';
  const lunchDuration = settings.lunchDuration || 0;
  const lunchEndTime = format(addMinutes(parse(lunchStartTime, 'HH:mm', new Date()), lunchDuration), 'HH:mm');

  const isLunchSlot = (slot: string) => {
    if (lunchDuration <= 0) return false;
    const slotTime = parse(slot, "HH:mm", new Date());
    const lunchStart = parse(lunchStartTime, "HH:mm", new Date());
    const lunchEnd = parse(lunchEndTime, "HH:mm", new Date());
    return slotTime >= lunchStart && slotTime < lunchEnd;
  }
  const lunchLetters = ['L', 'U', 'N', 'C', 'H'];

  return (
    <div className="bg-card text-card-foreground overflow-x-auto rounded-lg shadow-sm border">
        <table className="w-full border-collapse">
            <thead>
                <tr className="border-b">
                    <th className="p-2 border-r text-xs font-semibold uppercase w-14 text-muted-foreground"></th>
                    {timeSlots.map(slot => (
                        <th key={slot} className="p-2 border-r text-[10px] font-semibold whitespace-nowrap min-w-[70px] text-muted-foreground">
                            {format(parse(slot, 'HH:mm', new Date()), 'h a')}
                        </th>
                    ))}
                </tr>
            </thead>
            <tbody>
                 {workingDayNames.map((day, dayIndex) => {
                    const isToday = weekDays.indexOf(day) === today;
                    return (
                        <tr key={day} className={cn("border-b", isToday ? "bg-muted/50" : "")}>
                            <td className="p-2 border-r text-center text-xs font-bold uppercase text-muted-foreground">{day.substring(0,3)}</td>
                             {timeSlots.map(slot => {
                                if (isLunchSlot(slot)) {
                                  const lunchChar = lunchLetters[dayIndex % lunchLetters.length] || '';
                                  return (
                                     <td key={`${day}-${slot}`} className="p-1 border-r text-center align-middle bg-muted/30">
                                         <span className="font-bold text-muted-foreground/50 text-sm select-none">{lunchChar}</span>
                                     </td>
                                  )
                                }
                                
                                const subject = subjectsByDayTime[day]?.[slot];
                                if (subject) {
                                    return (
                                        <td key={`${day}-${slot}`} className="p-1 border-r text-center align-middle">
                                            <AddSubjectSheet subject={subject}>
                                                <button 
                                                    className="w-full h-full p-2 text-left group relative rounded-md hover:bg-muted/80 transition-colors flex flex-col justify-center"
                                                    style={{ backgroundColor: `${subject.color}1A`}}
                                                >
                                                    <div className="w-1 h-4/5 absolute left-0 top-1/2 -translate-y-1/2 rounded-r-full" style={{backgroundColor: subject.color || 'hsl(var(--primary))'}} />
                                                    <div className="pl-2">
                                                        <p className="font-bold text-[11px] leading-tight text-foreground">{subject.name}</p>
                                                        {subject.teacher && <p className="text-[10px] text-muted-foreground pt-0.5">{subject.teacher}</p>}
                                                    </div>
                                                </button>
                                            </AddSubjectSheet>
                                        </td>
                                    )
                                }

                                return (
                                    <td key={`${day}-${slot}`} className="border-r h-16">
                                        <AddSubjectSheet
                                            day={weekDays.indexOf(day)}
                                            startTime={slot}
                                        >
                                            <button className="w-full h-full text-muted-foreground/30 hover:bg-muted/50 hover:text-muted-foreground/60 transition-colors flex items-center justify-center text-xl">
                                                +
                                            </button>
                                        </AddSubjectSheet>
                                    </td>
                                )
                            })}
                        </tr>
                    )
                 })}
            </tbody>
        </table>
    </div>
  );
}