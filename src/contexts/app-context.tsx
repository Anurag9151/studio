'use client';

import { createContext, useContext, ReactNode } from 'react';
import { Subject, AttendanceRecord, AppSettings } from '@/lib/types';
import useLocalStorage from '@/lib/hooks/use-local-storage';

interface AppContextType {
  subjects: Subject[];
  setSubjects: (subjects: Subject[]) => void;
  attendanceRecords: AttendanceRecord[];
  setAttendanceRecords: (records: AttendanceRecord[]) => void;
  settings: AppSettings;
  setSettings: (settings: AppSettings) => void;
}

const AppContext = createContext<AppContextType | undefined>(undefined);

export function AppProvider({ children }: { children: ReactNode }) {
  const [subjects, setSubjects] = useLocalStorage<Subject[]>('subjects', []);
  const [attendanceRecords, setAttendanceRecords] = useLocalStorage<AttendanceRecord[]>('attendance', []);
  const [settings, setSettings] = useLocalStorage<AppSettings>('settings', { targetPercentage: 75 });

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
