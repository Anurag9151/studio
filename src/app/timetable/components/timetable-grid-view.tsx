'use client';

import React from 'react';
import { useAppContext } from '@/contexts/app-context';
import { getWeekDays, cn } from '@/lib/utils';
import { AddSubjectSheet } from './add-subject-sheet';
import { useMemo } from 'react';
import type { Subject } from '@/lib/types';
import { getDay, format, parse, addMinutes, isBefore, differenceInMinutes } from 'date-fns';

type TimeSlot = {
    startTime: string;
    endTime: string;
    isLunch: boolean;
};

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
    const slots: TimeSlot[] = [];
    let currentTime = parse(settings.startTime || '09:00', 'HH:mm', new Date());
    const dayEndTime = parse(settings.endTime || '17:00', 'HH:mm', new Date());
    const lunchStartTime = parse(settings.lunchStartTime || '13:00', 'HH:mm', new Date());
    const classDuration = settings.classPeriodDuration || 60;
    const lunchDuration = settings.lunchDuration || 0;

    let lunchAdded = false;

    while (isBefore(currentTime, dayEndTime)) {
        // Check if it's time for lunch
        if (!lunchAdded && lunchDuration > 0 && currentTime >= lunchStartTime) {
            const lunchEndTime = addMinutes(currentTime, lunchDuration);
            slots.push({
                startTime: format(currentTime, 'HH:mm'),
                endTime: format(lunchEndTime, 'HH:mm'),
                isLunch: true,
            });
            currentTime = lunchEndTime;
            lunchAdded = true;
            continue;
        }

        const slotEndTime = addMinutes(currentTime, classDuration);
        slots.push({
            startTime: format(currentTime, 'HH:mm'),
            endTime: format(slotEndTime, 'HH:mm'),
            isLunch: false,
        });
        currentTime = slotEndTime;
    }

    return slots;
  }, [settings.startTime, settings.endTime, settings.classPeriodDuration, settings.lunchStartTime, settings.lunchDuration]);


  const findSlotIndex = (time: string) => {
    const timeDate = parse(time, 'HH:mm', new Date());
    return timeSlots.findIndex(slot => {
        const slotStartDate = parse(slot.startTime, 'HH:mm', new Date());
        return timeDate >= slotStartDate && timeDate < parse(slot.endTime, 'HH:mm', new Date());
    });
  }

  const lunchLetters = ['L', 'U', 'N', 'C', 'H'];

  return (
    <div className="bg-card text-card-foreground overflow-x-auto rounded-lg shadow-sm border">
        <table className="w-full border-collapse table-fixed">
            <thead>
                <tr className="border-b">
                    <th className="p-1 border-r text-xs font-semibold uppercase w-10 text-muted-foreground"></th>
                    {timeSlots.map(slot => (
                        <th key={slot.startTime} className="p-1 border-r text-[9px] font-medium text-muted-foreground">
                            {format(parse(slot.startTime, 'HH:mm', new Date()), 'h:mm a')}
                        </th>
                    ))}
                </tr>
            </thead>
            <tbody>
                 {workingDayNames.map((day, dayIndex) => {
                    const dayOfWeek = weekDays.indexOf(day);
                    const isToday = dayOfWeek === today;
                    const daySubjects = subjects.filter(s => s.day === dayOfWeek).sort((a, b) => a.startTime.localeCompare(b.startTime));
                    
                    const renderedCells = Array(timeSlots.length).fill(null);

                    daySubjects.forEach(subject => {
                        const startIdx = findSlotIndex(subject.startTime);
                        if (startIdx !== -1 && renderedCells[startIdx] === null) {
                             const subjectDuration = differenceInMinutes(
                                parse(subject.endTime, 'HH:mm', new Date()),
                                parse(subject.startTime, 'HH:mm', new Date())
                            );
                            const slotDuration = differenceInMinutes(
                                parse(timeSlots[startIdx].endTime, 'HH:mm', new Date()),
                                parse(timeSlots[startIdx].startTime, 'HH:mm', new Date())
                            );
                            const colSpan = Math.max(1, Math.round(subjectDuration / slotDuration));
                            
                            renderedCells[startIdx] = (
                                <td key={subject.id} colSpan={colSpan} className="p-0.5 border-r align-top">
                                    <AddSubjectSheet subject={subject}>
                                        <button 
                                            className="w-full h-full p-1 text-left group relative rounded-md hover:bg-muted/80 transition-colors flex flex-col"
                                            style={{ backgroundColor: `${subject.color}1A`}}
                                        >
                                            <div className="w-1 h-full absolute left-0 top-0 rounded-l-md" style={{backgroundColor: subject.color || 'hsl(var(--primary))'}} />
                                            <div className="pl-1.5">
                                                <p className="font-bold text-[10px] leading-tight text-foreground whitespace-normal break-words">{subject.name}</p>
                                                {subject.teacher && <p className="text-[9px] text-muted-foreground pt-0.5 whitespace-normal break-words">{subject.teacher}</p>}
                                            </div>
                                        </button>
                                    </AddSubjectSheet>
                                </td>
                            );

                            for(let i=1; i < colSpan; i++) {
                                if (startIdx + i < renderedCells.length) {
                                    renderedCells[startIdx + i] = 'occupied';
                                }
                            }
                        }
                    });

                    return (
                        <tr key={day} className={cn("border-b", isToday ? "bg-muted/50" : "")}>
                            <td className="p-1 border-r text-center text-xs font-bold uppercase text-muted-foreground">{day.substring(0,3)}</td>
                             {renderedCells.map((cell, index) => {
                                if (cell === 'occupied') return null;
                                if (cell) return cell;

                                const slot = timeSlots[index];

                                if(slot.isLunch) {
                                     const lunchChar = lunchLetters[dayIndex % lunchLetters.length] || '';
                                     return (
                                         <td key={`${day}-${slot.startTime}`} className="p-1 border-r text-center align-middle bg-muted/30">
                                             <span className="font-bold text-muted-foreground/50 text-sm select-none">{lunchChar}</span>
                                         </td>
                                     )
                                }

                                return (
                                    <td key={`${day}-${slot.startTime}`} className="border-r h-14">
                                        <AddSubjectSheet
                                            day={dayOfWeek}
                                            startTime={slot.startTime}
                                        >
                                            <button className="w-full h-full text-muted-foreground/30 hover:bg-muted/50 hover:text-muted-foreground/60 transition-colors flex items-center justify-center text-lg">
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
