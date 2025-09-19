
import { type ClassValue, clsx } from "clsx"
import { twMerge } from "tailwind-merge"
import { type Subject, type AttendanceRecord, type Holiday } from "@/lib/types";
import { startOfDay, isBefore, parse, getDay, addDays, format } from 'date-fns';


export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs))
}

export function calculateAttendance(
    subjectName: string,
    allSubjects: Subject[],
    attendanceRecords: AttendanceRecord[],
    holidays: Holiday[] = []
) {
    const subjectOccurrences = allSubjects.filter(s => s.name?.trim().toLowerCase() === subjectName.trim().toLowerCase());
    
    if (subjectOccurrences.length === 0) {
        return { attended: 0, total: 0, bunkedClasses: 0, percentage: 0 };
    }

    const subjectIds = subjectOccurrences.map(s => s.id);
    const attendedRecords = attendanceRecords.filter(r => subjectIds.includes(r.subjectId) && r.status === 'present');
    const bunkedRecords = attendanceRecords.filter(r => subjectIds.includes(r.subjectId) && r.status === 'absent');

    const attended = attendedRecords.length;
    const bunkedClasses = bunkedRecords.length;

    const holidayDates = new Set(holidays.map(h => h.date));
    
    let totalClasses = 0;
    
    // Determine the start date for calculation
    const allRecordDates = attendanceRecords.map(r => parse(r.date, 'yyyy-MM-dd', new Date()));
    const firstRecordDate = allRecordDates.length > 0 ? allRecordDates.sort((a, b) => a.getTime() - b.getTime())[0] : new Date();

    if (firstRecordDate) {
        let currentDate = startOfDay(firstRecordDate);
        const today = startOfDay(new Date());

        while (isBefore(currentDate, today) || currentDate.toDateString() === today.toDateString()) {
            const dayOfWeek = getDay(currentDate);
            const dateString = format(currentDate, 'yyyy-MM-dd');
            
            if (!holidayDates.has(dateString)) {
                totalClasses += subjectOccurrences.filter(s => Number(s.day) === dayOfWeek).length;
            }
            
            currentDate = addDays(currentDate, 1);
        }
    }
    
    const recordedTotal = attended + bunkedClasses;
    if (totalClasses < recordedTotal) {
      totalClasses = recordedTotal;
    }

    const percentage = totalClasses > 0 ? (attended / totalClasses) * 100 : 0;

    return {
        attended,
        total: totalClasses,
        bunkedClasses,
        percentage: parseFloat(percentage.toFixed(1)),
    };
}


export function calculateBunkSuggestion(
    subjectName: string, 
    allSubjects: Subject[], 
    attendanceRecords: AttendanceRecord[], 
    targetPercentage: number,
    holidays: Holiday[] = []
) {
    const { attended, total, bunkedClasses, percentage } = calculateAttendance(subjectName, allSubjects, attendanceRecords, holidays);

    if (total === 0) {
        return {
            attended,
            bunkedClasses,
            percentage,
            suggestion: "No classes recorded yet.",
            suggestionType: 'neutral'
        };
    }

    const target = targetPercentage; // Target is already a percentage (e.g., 75)

    if (percentage >= target) {
        // Calculate how many classes can be bunked to stay AT or ABOVE target
        const bunksAllowed = Math.floor((attended - (target / 100) * total) / (target / 100));

        if (bunksAllowed > 0) {
             return {
                attended,
                bunkedClasses,
                percentage,
                suggestion: `You can safely bunk ${bunksAllowed} more class${bunksAllowed > 1 ? 'es' : ''}.`,
                suggestionType: 'safe'
            };
        } else {
             return {
                attended,
                bunkedClasses,
                percentage,
                suggestion: "You are just above the target. Don't bunk the next class.",
                suggestionType: 'safe'
            };
        }
    } else {
        // Calculate how many classes must be attended to reach the target
        const requiredAttend = Math.ceil(((target / 100) * total - attended) / (1 - (target / 100)));
        
        if (requiredAttend > 0) {
            return {
                attended,
                bunkedClasses,
                percentage,
                suggestion: `You must attend the next ${requiredAttend} class${requiredAttend > 1 ? 'es' : ''} to reach ${targetPercentage}%.`,
                suggestionType: 'danger'
            };
        } else {
             return {
                attended,
                bunkedClasses,
                percentage,
                suggestion: `You are below the target. Attend the next class.`,
                suggestionType: 'danger'
            };
        }
    }
}


export function getWeekDays(): string[] {
  return ["Sunday", "Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday"];
}

