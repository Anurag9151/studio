'use client';

import React from 'react';
import { useAppContext } from '@/contexts/app-context';
import { getWeekDays, cn } from '@/lib/utils';
import { AddSubjectSheet } from './add-subject-sheet';
import { useMemo } from 'react';
import type { Subject } from '@/lib/types';
import { getDay, format, parse, addMinutes, isBefore, differenceInMinutes } from 'date-fns';

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
    if (!settings.startTime || !settings.endTime || !settings.classPeriodDuration) {
        return [];
    }
    let currentTime = parse(settings.startTime, 'HH:mm', new Date());
    const end = parse(settings.endTime, 'HH:mm', new Date());
    
    while(isBefore(currentTime, end)) {
        slots.push(format(currentTime, 'HH:mm'));
        currentTime = addMinutes(currentTime, settings.classPeriodDuration);
    }
    return slots;
  }, [settings.startTime, settings.endTime, settings.classPeriodDuration]);

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
            // Find the closest time slot that is at or before the subject's start time
            const subjectStartTime = parse(subject.startTime, "HH:mm", new Date());
            const slot = timeSlots.slice().reverse().find(s => {
                const slotTime = parse(s, "HH:mm", new Date());
                return !isBefore(subjectStartTime, slotTime);
            });
            if (slot && !grid[dayName][slot]) { // Check if slot is not already taken
                grid[dayName][slot] = subject;
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

    const slotDuration = settings.classPeriodDuration || 60;
    const slotEndTime = addMinutes(slotTime, slotDuration);

    // Check for any overlap between slot and lunch time
    return (
      (isBefore(slotTime, lunchEnd) && isBefore(lunchStart, slotEndTime))
    );
  }
  const lunchLetters = ['L', 'U', 'N', 'C', 'H'];

  return (
    <div className="bg-card text-card-foreground overflow-x-auto rounded-lg shadow-lg border-2 border-primary/50">
        <table className="w-full table-fixed border-collapse">
            <thead>
                <tr className="bg-primary/80 text-primary-foreground">
                    <th className="p-1 border border-border text-xs font-semibold uppercase w-12">Day</th>
                    {timeSlots.map(slot => (
                        <th key={slot} className="p-1 border border-border text-[10px] font-semibold whitespace-nowrap min-w-[60px]">
                            {format(parse(slot, 'HH:mm', new Date()), 'h:mm a')}
                        </th>
                    ))}
                </tr>
            </thead>
            <tbody>
                 {workingDayNames.map((day, dayIndex) => {
                    const isToday = weekDays.indexOf(day) === today;
                    let renderedSubjectsForDay: { [key:string]: boolean } = {};
                    return (
                        <tr key={day} className={cn(isToday ? "bg-primary/10" : "")}>
                            <td className="p-1 border border-border text-center text-xs font-bold uppercase bg-primary/80 text-primary-foreground">{day.substring(0,3)}</td>
                             {timeSlots.map((slot) => {
                                if (renderedSubjectsForDay[slot]) {
                                  return null; // This slot is covered by a colspan from a previous subject
                                }

                                if (isLunchSlot(slot)) {
                                  const lunchChar = lunchLetters[dayIndex % lunchLetters.length] || '';
                                  return (
                                     <td key={`${day}-${slot}`} className="p-1 border border-border text-center align-middle bg-primary/20">
                                         <span className="font-bold text-primary/80 text-sm">{lunchChar}</span>
                                     </td>
                                  )
                                }
                                
                                const subject = subjectsByDayTime[day]?.[slot];
                                if (subject) {
                                    const subjectDuration = differenceInMinutes(
                                        parse(subject.endTime, 'HH:mm', new Date()),
                                        parse(subject.startTime, 'HH:mm', new Date())
                                    );
                                    const colSpan = Math.max(1, Math.round(subjectDuration / (settings.classPeriodDuration || 60)));
                                    
                                    // Mark subsequent cells that are covered by the colspan
                                    const currentSlotIndex = timeSlots.indexOf(slot);
                                    for(let i = 1; i < colSpan; i++) {
                                      const nextSlotIndex = currentSlotIndex + i;
                                      if (nextSlotIndex < timeSlots.length) {
                                        renderedSubjectsForDay[timeSlots[nextSlotIndex]] = true;
                                      }
                                    }

                                    return (
                                        <td key={`${day}-${slot}`} colSpan={colSpan} className="p-0 border border-border text-center align-middle">
                                            <AddSubjectSheet subject={subject}>
                                                <button 
                                                    className="w-full h-full p-1 text-left group relative bg-primary/20 hover:bg-primary/30 transition-colors"
                                                >
                                                    <p className="font-bold text-[10px] leading-tight break-words text-foreground whitespace-normal">{subject.name}</p>
                                                    {subject.teacher && <p className="text-[9px] text-muted-foreground opacity-80 break-words">{subject.teacher}</p>}
                                                </button>
                                            </AddSubjectSheet>
                                        </td>
                                    )
                                }

                                return (
                                    <td key={`${day}-${slot}`} className="border border-border h-12">
                                        <AddSubjectSheet
                                            day={weekDays.indexOf(day)}
                                            startTime={slot}
                                        >
                                            <button className="w-full h-full text-primary/30 hover:bg-primary/5 hover:text-primary/60 transition-colors flex items-center justify-center">
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
