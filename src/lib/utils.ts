import { type ClassValue, clsx } from "clsx"
import { twMerge } from "tailwind-merge"
import { type Subject, type AttendanceRecord } from "@/lib/types";
import { startOfDay, isBefore, parse, getDay } from 'date-fns';


export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs))
}

export function calculateAttendance(subjectId: string, attendanceRecords: AttendanceRecord[], subjects: Subject[], untilDate: Date = new Date()) {
  const subject = subjects.find(s => s.id === subjectId);
  if (!subject) return { attended: 0, total: 0, percentage: 0 };

  const relevantRecords = attendanceRecords.filter(r => r.subjectId === subjectId);
  
  let totalClasses = 0;
  const courseStartDate = subjects.length > 0 ? relevantRecords.reduce((oldest, record) => {
    const recordDate = parse(record.date, 'yyyy-MM-dd', new Date());
    return isBefore(recordDate, oldest) ? recordDate : oldest;
  }, new Date()) : new Date();

  let currentDate = startOfDay(courseStartDate);
  const endDate = startOfDay(untilDate);

  // This logic is simplified. A more robust solution would need a "semester start date".
  // For now, we count total classes from the first attendance mark.
  if (relevantRecords.length > 0) {
    const firstRecordDate = relevantRecords.map(r => parse(r.date, 'yyyy-MM-dd', new Date())).sort((a,b) => a.getTime() - b.getTime())[0];
    currentDate = startOfDay(firstRecordDate);
  } else {
     // If no records, total is 0
    return { attended: 0, total: 0, percentage: 0 };
  }

  while (isBefore(currentDate, endDate) || currentDate.toDateString() === endDate.toDateString()) {
    if (getDay(currentDate) === subject.day) {
      totalClasses++;
    }
    currentDate.setDate(currentDate.getDate() + 1);
  }
  
  const attendedClasses = relevantRecords.filter(r => r.status === 'present').length;

  const percentage = totalClasses > 0 ? (attendedClasses / totalClasses) * 100 : 0;

  return {
    attended: attendedClasses,
    total: totalClasses,
    percentage: parseFloat(percentage.toFixed(1)),
  };
}

export function getWeekDays(): string[] {
  return ["Sunday", "Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday"];
}
