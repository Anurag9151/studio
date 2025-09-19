
'use client';

import { useAppContext } from "@/contexts/app-context";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { useToast } from "@/hooks/use-toast";
import { useState, useEffect } from "react";
import { Switch } from "@/components/ui/switch";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "@/components/ui/alert-dialog";
import { Trash2, FileDown } from "lucide-react";
import { exportToPDF } from "@/lib/pdf-export";


export default function SettingsForm() {
  const { settings, setSettings, subjects, setSubjects, attendanceRecords, setAttendanceRecords, holidays, setHolidays } = useAppContext();
  const { toast } = useToast();
  
  // Local state for form fields
  const [isDark, setIsDark] = useState(false);
  const [theme, setTheme] = useState('blue');
  const [targetPercentage, setTargetPercentage] = useState<number | string>(75);
  const [workingDays, setWorkingDays] = useState('Mon-Fri');
  const [startTime, setStartTime] = useState('09:00');
  const [endTime, setEndTime] = useState('17:00');
  const [lunchBreak, setLunchBreak] = useState(true);
  const [remindersEnabled, setRemindersEnabled] = useState(false);
  const [reminderTime, setReminderTime] = useState('18:00');


  // Sync with context on initial load and when context changes
  useEffect(() => {
    setIsDark(settings.mode === 'dark');
    setTheme(settings.theme || 'blue');
    setTargetPercentage(settings.targetPercentage || 75);
    setWorkingDays(settings.workingDays || 'Mon-Fri');
    setStartTime(settings.startTime || '09:00');
    setEndTime(settings.endTime || '17:00');
    setLunchBreak(settings.lunchBreak === undefined ? true : settings.lunchBreak);
    setRemindersEnabled(settings.remindersEnabled || false);
    setReminderTime(settings.reminderTime || '18:00');


    // Apply theme/mode to body
    document.body.classList.toggle('dark', settings.mode === 'dark');
    document.body.classList.remove('theme-blue', 'theme-green', 'theme-purple');
    if(settings.theme) {
      document.body.classList.add(`theme-${settings.theme}`);
    }
  }, [settings]);

  // Handlers update both local state and context
  const handleModeToggle = (isDarkMode: boolean) => {
    setIsDark(isDarkMode);
    const newMode = isDarkMode ? 'dark' : 'light';
    setSettings(prev => ({ ...prev, mode: newMode }));
    document.body.classList.toggle('dark', isDarkMode);
    toast({ title: "Mode Changed", description: `Switched to ${newMode} mode.` });
  };
  
  const handleThemeChange = (newTheme: string) => {
    setTheme(newTheme);
    setSettings(prev => ({ ...prev, theme: newTheme as any }));
    document.body.classList.remove('theme-blue', 'theme-green', 'theme-purple');
    if (newTheme) {
        document.body.classList.add(`theme-${newTheme}`);
    }
    toast({ title: "Theme Updated", description: `App theme set to ${newTheme}.` });
  };
  
   const handleTargetChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value;
    // Allow empty string for editing, but store as number in context
    if (value === '') {
        setTargetPercentage('');
        return;
    }

    const newTarget = parseInt(value, 10);
    if (!isNaN(newTarget) && newTarget >= 0 && newTarget <= 100) {
      setTargetPercentage(newTarget);
      setSettings(prev => ({ ...prev, targetPercentage: newTarget }));
    } else if (value.length <= 3) { // Allow typing up to 3 digits
        setTargetPercentage(value);
    }
  };

  const handleWorkingDaysChange = (value: string) => {
    setWorkingDays(value as 'Mon-Fri');
    setSettings(prev => ({ ...prev, workingDays: value as any }));
    toast({ title: "Timetable Updated", description: `Working days set to ${value}.` });
  };

  const handleStartTimeChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setStartTime(e.target.value);
    setSettings(prev => ({ ...prev, startTime: e.target.value }));
  };

  const handleEndTimeChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setEndTime(e.target.value);
    setSettings(prev => ({ ...prev, endTime: e.target.value }));
  };

  const handleLunchBreakToggle = (value: boolean) => {
    setLunchBreak(value);
    setSettings(prev => ({ ...prev, lunchBreak: value }));
    toast({ title: "Timetable Updated", description: `Lunch break ${value ? 'enabled' : 'disabled'}.` });
  };

  const handleRemindersToggle = (value: boolean) => {
    setRemindersEnabled(value);
    setSettings(prev => ({ ...prev, remindersEnabled: value }));
    toast({ title: "Reminders Updated", description: `Attendance reminders ${value ? 'enabled' : 'disabled'}.` });
  };

  const handleReminderTimeChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setReminderTime(e.target.value);
    setSettings(prev => ({ ...prev, reminderTime: e.target.value }));
  };
  
  const handleResetApp = () => {
    setSubjects([]);
    setAttendanceRecords([]);
    setHolidays([]);
    // Optionally reset settings to default, or keep them.
    // For now, let's just clear the data.
    toast({
      title: "App Reset",
      description: "All your data has been cleared.",
      variant: "destructive"
    });
  };

  const handleExport = () => {
    exportToPDF(subjects, attendanceRecords, settings, holidays);
    toast({
        title: "Report Generated",
        description: "Your PDF report has been downloaded."
    });
  }

  return (
    <div className="space-y-6">
        <Card>
            <CardHeader><CardTitle className="text-xl">Display</CardTitle></CardHeader>
            <CardContent className="space-y-4">
                <div className="flex items-center justify-between rounded-lg border p-4">
                    <Label htmlFor="dark-mode" className="font-normal">Dark Mode</Label>
                    <Switch
                        id="dark-mode"
                        checked={isDark}
                        onCheckedChange={handleModeToggle}
                    />
                </div>
                <div className="rounded-lg border">
                    <Select onValueChange={handleThemeChange} value={theme}>
                        <SelectTrigger className="w-full border-none h-14 px-4">
                            <Label className="font-normal">Theme Color</Label>
                        </SelectTrigger>
                        <SelectContent>
                            <SelectItem value="blue">Blue</SelectItem>
                            <SelectItem value="green">Green</SelectItem>
                            <SelectItem value="purple">Purple</SelectItem>
                        </SelectContent>
                    </Select>
                </div>
            </CardContent>
        </Card>

        <Card>
            <CardHeader><CardTitle className="text-xl">Attendance Goal</CardTitle></CardHeader>
            <CardContent className="space-y-4">
                 <div className="rounded-lg border p-3">
                    <Label htmlFor="target-attendance" className="text-xs">Target Attendance (%)</Label>
                    <Input id="target-attendance" type="number" value={targetPercentage} onChange={handleTargetChange} className="bg-transparent border-none p-0 h-auto text-base" min="0" max="100" />
                </div>
            </CardContent>
        </Card>
        
        <Card>
            <CardHeader><CardTitle className="text-xl">Notifications</CardTitle></CardHeader>
            <CardContent className="space-y-4">
                <div className="flex items-center justify-between rounded-lg border p-4">
                    <Label htmlFor="reminders" className="font-normal">Enable Reminders</Label>
                    <Switch
                        id="reminders"
                        checked={remindersEnabled}
                        onCheckedChange={handleRemindersToggle}
                    />
                </div>
                 <div className="rounded-lg border p-3">
                    <Label htmlFor="reminder-time" className="text-xs">Reminder Time</Label>
                    <Input id="reminder-time" type="time" value={reminderTime} onChange={handleReminderTimeChange} className="bg-transparent border-none p-0 h-auto text-base" disabled={!remindersEnabled} />
                </div>
            </CardContent>
        </Card>

        <Card>
            <CardHeader><CardTitle className="text-xl">Timetable</CardTitle></CardHeader>
            <CardContent className="space-y-4">
                 <div className="rounded-lg border">
                    <Select onValueChange={handleWorkingDaysChange} value={workingDays}>
                        <SelectTrigger className="w-full border-none h-14 px-4">
                            <Label className="font-normal">Working Days</Label>
                        </SelectTrigger>
                        <SelectContent>
                            <SelectItem value="Mon-Fri">Monday - Friday</SelectItem>
                            <SelectItem value="Mon-Sat">Monday - Saturday</SelectItem>
                        </SelectContent>
                    </Select>
                </div>
                <div className="grid grid-cols-2 gap-4">
                    <div className="rounded-lg border p-3">
                        <Label htmlFor="start-time" className="text-xs">Start Time</Label>
                        <Input id="start-time" type="time" value={startTime} onChange={handleStartTimeChange} className="bg-transparent border-none p-0 h-auto text-base" />
                    </div>
                     <div className="rounded-lg border p-3">
                        <Label htmlFor="end-time" className="text-xs">End Time</Label>
                        <Input id="end-time" type="time" value={endTime} onChange={handleEndTimeChange} className="bg-transparent border-none p-0 h-auto text-base" />
                    </div>
                </div>
                 <div className="flex items-center justify-between rounded-lg border p-4">
                    <Label htmlFor="lunch-break" className="font-normal">Show Lunch Break (1-2 PM)</Label>
                    <Switch
                        id="lunch-break"
                        checked={lunchBreak}
                        onCheckedChange={handleLunchBreakToggle}
                    />
                </div>
            </CardContent>
        </Card>

        <Card>
            <CardHeader><CardTitle className="text-xl">Data Management</CardTitle></CardHeader>
            <CardContent>
                <Button variant="outline" className="w-full" onClick={handleExport}>
                    <FileDown className="mr-2" /> Export Report as PDF
                </Button>
            </CardContent>
        </Card>

        <Card>
            <CardHeader><CardTitle className="text-lg text-destructive">Danger Zone</CardTitle></CardHeader>
            <CardContent className="space-y-2">
                <AlertDialog>
                    <AlertDialogTrigger asChild>
                        <Button variant="destructive" className="w-full">
                            <Trash2 className="mr-2" /> Reset App
                        </Button>
                    </AlertDialogTrigger>
                    <AlertDialogContent>
                        <AlertDialogHeader>
                        <AlertDialogTitle>Are you absolutely sure?</AlertDialogTitle>
                        <AlertDialogDescription>
                            This action cannot be undone. This will permanently delete all your subjects, attendance records, and holidays. Your settings will be kept.
                        </AlertDialogDescription>
                        </AlertDialogHeader>
                        <AlertDialogFooter>
                        <AlertDialogCancel>Cancel</AlertDialogCancel>
                        <AlertDialogAction onClick={handleResetApp} className="bg-destructive hover:bg-destructive/90">Reset</AlertDialogAction>
                        </AlertDialogFooter>
                    </AlertDialogContent>
                </AlertDialog>
                <p className="text-xs text-muted-foreground pt-2 text-center">Permanently delete all your data.</p>
            </CardContent>
        </Card>
    </div>
  );
}
