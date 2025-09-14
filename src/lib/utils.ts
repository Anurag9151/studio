
import { type ClassValue, clsx } from "clsx"
import { twMerge } from "tailwind-merge"
import { type Subject, type AttendanceRecord } from "@/lib/types";
import { startOfDay, isBefore, parse, getDay, addDays } from 'date-fns';


export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs))
}

export function getUniqueSubjects(subjects: Subject[]): (Subject & { originalIds: string[] })[] {
  const uniqueSubjectsMap = new Map<string, Subject & { originalIds:string[] }>();

  subjects.forEach(subject => {
    const normalizedName = subject.name.trim().toLowerCase();
    if (!uniqueSubjectsMap.has(normalizedName)) {
      uniqueSubjectsMap.set(normalizedName, {
        ...subject,
        name: subject.name.trim(), // Use the trimmed version of the original name for display
        originalIds: [subject.id],
      });
    } else {
      const existing = uniqueSubjectsMap.get(normalizedName)!;
      existing.originalIds.push(subject.id);
      // You might want to merge properties here if needed, e.g. choose a color.
      // For now, we just keep the properties of the first one encountered.
    }
  });

  return Array.from(uniqueSubjectsMap.values());
}


export function calculateAttendance(subjectIdentifier: string, allSubjects: Subject[], attendanceRecords: AttendanceRecord[], byId = false) {
    const subjectOccurrences = byId 
      ? allSubjects.filter(s => s.id === subjectIdentifier)
      : allSubjects.filter(s => s.name.trim().toLowerCase() === subjectIdentifier.trim().toLowerCase());

    if (subjectOccurrences.length === 0) {
        return { attended: 0, total: 0, bunkedClasses: 0, percentage: 0 };
    }

    const subjectIds = subjectOccurrences.map(s => s.id);
    const relevantRecords = attendanceRecords.filter(r => subjectIds.includes(r.subjectId));

    const attended = relevantRecords.filter(r => r.status === 'present').length;
    const bunked = relevantRecords.filter(r => r.status === 'absent').length;

    let totalClasses = 0;
    
    // Find the date of the first ever record for these specific subjects.
    // This establishes the start of the "semester" for counting purposes.
    const firstRecordDate = attendanceRecords
        .map(r => parse(r.date, 'yyyy-MM-dd', new Date()))
        .sort((a, b) => a.getTime() - b.getTime())[0];

    // If there are no records, no classes have been held yet.
    if (firstRecordDate) {
        let currentDate = startOfDay(firstRecordDate);
        const today = startOfDay(new Date());

        // Iterate from the first recorded date until today
        while (isBefore(currentDate, today) || currentDate.toDateString() === today.toDateString()) {
            const dayOfWeek = getDay(currentDate);
            // Count how many of the subjects occurrences happen on this day of the week
            totalClasses += subjectOccurrences.filter(s => s.day === dayOfWeek).length;
            currentDate = addDays(currentDate, 1);
        }
    }
    
    // Fallback: If for some reason the calculation is less than what we have records for,
    // use the record count. This covers cases where timetable might have changed.
    const recordedTotal = attended + bunked;
    if (totalClasses < recordedTotal) {
      totalClasses = recordedTotal;
    }

    const percentage = totalClasses > 0 ? (attended / totalClasses) * 100 : 0;

    return {
        attended: attended,
        total: totalClasses,
        bunkedClasses: bunked,
        percentage: parseFloat(percentage.toFixed(1)),
    };
}


export function calculateBunkSuggestion(subjectName: string, allSubjects: Subject[], attendanceRecords: AttendanceRecord[], targetPercentage: number) {
    const { attended, total, bunkedClasses, percentage } = calculateAttendance(subjectName, allSubjects, attendanceRecords);

    if (total === 0) {
        return {
            attended,
            bunkedClasses,
            percentage,
            suggestion: "No classes recorded yet.",
            suggestionType: 'neutral'
        };
    }

    const target = targetPercentage / 100;

    if (percentage >= target) {
        // User is safe, calculate how many classes they can bunk
        const bunksAllowed = Math.floor((attended - target * total) / target);
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
        // User is in danger, calculate how many classes they must attend
        const requiredAttend = Math.ceil((target * total - attended) / (1 - target));
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



