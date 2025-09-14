export type Subject = {
  id: string;
  name: string;
  teacher?: string;
  color?: string;
  day: number; // 0 for Sunday, 1 for Monday, etc.
  startTime: string; // "HH:mm"
  endTime: string; // "HH:mm"
};

export type AttendanceRecord = {
  id: string;
  subjectId: string;
  date: string; // "yyyy-MM-dd"
  status: 'present' | 'absent';
};

export type AppSettings = {
  targetPercentage: number;
  theme?: 'blue' | 'green' | 'purple';
  mode?: 'light' | 'dark';
  workingDays?: 'Mon-Fri' | 'Mon-Sat';
  startTime?: string; // "HH:mm"
  endTime?: string; // "HH:mm"
  lunchBreak?: boolean;
};
