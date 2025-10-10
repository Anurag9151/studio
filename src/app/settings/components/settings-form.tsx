
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
import { Card, CardHeader, CardTitle, CardContent, CardFooter, CardDescription } from "@/components/ui/card";
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
  const [classPeriodDuration, setClassPeriodDuration] = useState(60);
  const [lunchStartTime, setLunchStartTime] = useState('13:00');
  const [lunchDuration, setLunchDuration] = useState(60);


  // Sync with context on initial load and when context changes
  useEffect(() => {
    setIsDark(settings.mode === 'dark');
    setTheme(settings.theme || 'blue');
    setTargetPercentage(settings.targetPercentage || 75);
    setWorkingDays(settings.workingDays || 'Mon-Fri');
    setStartTime(settings.startTime || '09:00');
    setEndTime(settings.endTime || '17:00');
    setClassPeriodDuration(settings.classPeriodDuration || 60);
    setLunchStartTime(settings.lunchStartTime || '13:00');
    setLunchDuration(settings.lunchDuration || 60);


    // Apply theme/mode to body
    document.body.classList.toggle('dark', settings.mode === 'dark');
    document.body.classList.remove('theme-blue', 'theme-green', 'theme-purple', 'theme-red', 'theme-orange', 'theme-yellow');
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
    document.body.classList.remove('theme-blue', 'theme-green', 'theme-purple', 'theme-red', 'theme-orange', 'theme-yellow');
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

  const handlePeriodDurationChange = (value: string) => {
    const duration = parseInt(value, 10);
    setClassPeriodDuration(duration);
    setSettings(prev => ({ ...prev, classPeriodDuration: duration }));
    toast({ title: "Timetable Updated", description: `Class duration set to ${duration} minutes.` });
  };

  const handleLunchStartTimeChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setLunchStartTime(e.target.value);
    setSettings(prev => ({ ...prev, lunchStartTime: e.target.value }));
  };

  const handleLunchDurationChange = (value: string) => {
    const duration = parseInt(value, 10);
    setLunchDuration(duration);
    setSettings(prev => ({ ...prev, lunchDuration: duration }));
    toast({ title: "Timetable Updated", description: `Lunch duration set to ${duration} minutes.` });
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
            <CardHeader><CardTitle>Display</CardTitle></CardHeader>
            <CardContent className="space-y-4">
                <div className="flex items-center justify-between">
                    <Label htmlFor="dark-mode">Dark Mode</Label>
                    <Switch
                        id="dark-mode"
                        checked={isDark}
                        onCheckedChange={handleModeToggle}
                    />
                </div>
                <div className="flex items-center justify-between">
                    <Label>Theme</Label>
                    <Select onValueChange={handleThemeChange} value={theme}>
                        <SelectTrigger className="w-[120px]">
                            <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                            <SelectItem value="blue">Blue</SelectItem>
                            <SelectItem value="green">Green</SelectItem>
                            <SelectItem value="purple">Purple</SelectItem>
                            <SelectItem value="red">Red</SelectItem>
                            <SelectItem value="orange">Orange</SelectItem>
                            <SelectItem value="yellow">Yellow</SelectItem>
                        </SelectContent>
                    </Select>
                </div>
            </CardContent>
        </Card>

        <Card>
            <CardHeader><CardTitle>Attendance</CardTitle></CardHeader>
            <CardContent className="space-y-4">
                 <div className="flex items-center justify-between">
                    <Label htmlFor="target-attendance">Target Attendance</Label>
                    <div className="flex items-center gap-2">
                      <Input id="target-attendance" type="number" value={targetPercentage} onChange={handleTargetChange} className="w-20 text-center" min="0" max="100" />
                      <span>%</span>
                    </div>
                </div>
            </CardContent>
        </Card>

        <Card>
            <CardHeader><CardTitle>Timetable</CardTitle></CardHeader>
            <CardContent className="space-y-4">
                <div className="flex items-center justify-between">
                    <Label>Working Days</Label>
                    <Select onValueChange={handleWorkingDaysChange} value={workingDays}>
                        <SelectTrigger className="w-[180px]">
                            <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                            <SelectItem value="Mon-Fri">Monday - Friday</SelectItem>
                            <SelectItem value="Mon-Sat">Monday - Saturday</SelectItem>
                        </SelectContent>
                    </Select>
                </div>
                <div className="flex items-center justify-between">
                    <Label>Day Start Time</Label>
                    <Input type="time" value={startTime} onChange={handleStartTimeChange} className="w-[120px]" />
                </div>
                 <div className="flex items-center justify-between">
                    <Label>Day End Time</Label>
                    <Input type="time" value={endTime} onChange={handleEndTimeChange} className="w-[120px]" />
                </div>
                 <div className="flex items-center justify-between">
                    <Label>Default Class Duration</Label>
                    <Select onValueChange={handlePeriodDurationChange} value={String(classPeriodDuration)}>
                        <SelectTrigger className="w-[180px]">
                            <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                            <SelectItem value="30">30 minutes</SelectItem>
                            <SelectItem value="40">40 minutes</SelectItem>
                            <SelectItem value="45">45 minutes</SelectItem>
                            <SelectItem value="50">50 minutes</SelectItem>
                            <SelectItem value="60">1 hour</SelectItem>
                            <SelectItem value="90">1 hour 30 minutes</SelectItem>
                        </SelectContent>
                    </Select>
                </div>
                <div className="flex items-center justify-between">
                    <Label>Lunch Start Time</Label>
                    <Input type="time" value={lunchStartTime} onChange={handleLunchStartTimeChange} className="w-[120px]" />
                </div>
                <div className="flex items-center justify-between">
                    <Label>Lunch Duration</Label>
                    <Select onValueChange={handleLunchDurationChange} value={String(lunchDuration)}>
                        <SelectTrigger className="w-[180px]">
                             <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                            <SelectItem value="0">No Break</SelectItem>
                            <SelectItem value="30">30 minutes</SelectItem>
                            <SelectItem value="45">45 minutes</SelectItem>
                            <SelectItem value="50">50 minutes</SelectItem>
                            <SelectItem value="60">1 hour</SelectItem>
                            <SelectItem value="90">1.5 hours</SelectItem>
                        </SelectContent>
                    </Select>
                </div>
            </CardContent>
        </Card>

        <Card>
            <CardHeader>
                <CardTitle>Data Management</CardTitle>
            </CardHeader>
            <CardContent>
                <Button variant="outline" className="w-full flex items-center gap-2" onClick={handleExport}>
                    <FileDown className="h-4 w-4" /> Export Report as PDF
                </Button>
            </CardContent>
        </Card>

        <Card>
            <CardHeader>
                <CardTitle className="text-lg text-destructive">Danger Zone</CardTitle>
            </CardHeader>
            <CardContent>
                <AlertDialog>
                    <AlertDialogTrigger asChild>
                        <Button variant="destructive" className="w-full flex items-center gap-2">
                            <Trash2 className="h-4 w-4" /> Reset App
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
            </CardContent>
        </Card>
    </div>
  );
}
