
'use client';

import { createContext, useContext, ReactNode, useEffect } from 'react';
import { Subject, AttendanceRecord, AppSettings, Holiday } from '@/lib/types';
import useLocalStorage from '@/lib/hooks/use-local-storage';

interface AppContextType {
  subjects: Subject[];
  setSubjects: (subjects: Subject[] | ((prev: Subject[]) => Subject[])) => void;
  attendanceRecords: AttendanceRecord[];
  setAttendanceRecords: (records: AttendanceRecord[] | ((prev: AttendanceRecord[]) => AttendanceRecord[])) => void;
  holidays: Holiday[];
  setHolidays: (holidays: Holiday[] | ((prev: Holiday[]) => Holiday[])) => void;
  settings: AppSettings;
  setSettings: (settings: AppSettings | ((prev: AppSettings) => AppSettings)) => void;
}

const AppContext = createContext<AppContextType | undefined>(undefined);

export function AppProvider({ children }: { children: ReactNode }) {
  const [subjects, setSubjects] = useLocalStorage<Subject[]>('subjects', []);
  const [attendanceRecords, setAttendanceRecords] = useLocalStorage<AttendanceRecord[]>('attendance', []);
  const [holidays, setHolidays] = useLocalStorage<Holiday[]>('holidays', []);
  const [settings, setSettings] = useLocalStorage<AppSettings>('settings', { 
    targetPercentage: 75,
    theme: 'green',
    mode: 'light',
    workingDays: 'Mon-Sat',
    startTime: '09:00',
    endTime: '17:00',
    classPeriodDuration: 60,
    lunchStartTime: '13:00',
    lunchDuration: 60,
    remindersEnabled: false,
    reminderTime: '18:00',
  });

  useEffect(() => {
    const applyTheme = () => {
      document.body.classList.remove('dark', 'light', 'theme-blue', 'theme-green', 'theme-purple', 'theme-red', 'theme-orange', 'theme-yellow');
      document.body.classList.add(settings.mode || 'light');
      if (settings.theme) {
        document.body.classList.add(`theme-${settings.theme}`);
      }
    };
    applyTheme();
  }, [settings]);


  const value = {
    subjects,
    setSubjects,
    attendanceRecords,
    setAttendanceRecords,
    holidays,
    setHolidays,
    settings,
    setSettings,
  };

  return <AppContext.Provider value={value}>{children}</AppContext.Provider>;
}

export function useAppContext() {
  const context = useContext(AppContext);
  if (context === undefined) {
    throw new Error('useAppContext must be used within an AppProvider');
  }
  return context;
}
