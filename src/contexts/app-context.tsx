'use client';

import { createContext, useContext, ReactNode, useEffect } from 'react';
import { Subject, AttendanceRecord, AppSettings } from '@/lib/types';
import useLocalStorage from '@/lib/hooks/use-local-storage';

interface AppContextType {
  subjects: Subject[];
  setSubjects: (subjects: Subject[] | ((prev: Subject[]) => Subject[])) => void;
  attendanceRecords: AttendanceRecord[];
  setAttendanceRecords: (records: AttendanceRecord[] | ((prev: AttendanceRecord[]) => AttendanceRecord[])) => void;
  settings: AppSettings;
  setSettings: (settings: AppSettings | ((prev: AppSettings) => AppSettings)) => void;
}

const AppContext = createContext<AppContextType | undefined>(undefined);

export function AppProvider({ children }: { children: ReactNode }) {
  const [subjects, setSubjects] = useLocalStorage<Subject[]>('subjects', []);
  const [attendanceRecords, setAttendanceRecords] = useLocalStorage<AttendanceRecord[]>('attendance', []);
  const [settings, setSettings] = useLocalStorage<AppSettings>('settings', { 
    targetPercentage: 75,
    theme: 'green',
    mode: 'light',
    workingDays: 'Mon-Sat',
    startTime: '09:00',
    endTime: '17:00',
    lunchBreak: true,
    remindersEnabled: false,
    reminderTime: '18:00',
  });

  useEffect(() => {
    const applyTheme = () => {
      document.body.classList.remove('dark', 'light', 'theme-blue', 'theme-green', 'theme-purple');
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
