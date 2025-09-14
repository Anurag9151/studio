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

export default function SettingsForm() {
  const { settings, setSettings } = useAppContext();
  const { toast } = useToast();
  
  // Local state for form fields
  const [isDark, setIsDark] = useState(false);
  const [theme, setTheme] = useState('blue');
  const [workingDays, setWorkingDays] = useState('Mon-Fri');
  const [startTime, setStartTime] = useState('09:00');
  const [endTime, setEndTime] = useState('17:00');
  const [lunchBreak, setLunchBreak] = useState(true);

  // Sync with context on initial load and when context changes
  useEffect(() => {
    setIsDark(settings.mode === 'dark');
    setTheme(settings.theme || 'blue');
    setWorkingDays(settings.workingDays || 'Mon-Fri');
    setStartTime(settings.startTime || '09:00');
    setEndTime(settings.endTime || '17:00');
    setLunchBreak(settings.lunchBreak === undefined ? true : settings.lunchBreak);

    // Apply theme/mode to body
    document.body.classList.toggle('dark', settings.mode === 'dark');
    document.body.classList.remove('theme-blue', 'theme-green', 'theme-purple');
    if(settings.theme && settings.theme !== 'blue') {
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
    if (newTheme !== 'blue') {
        document.body.classList.add(`theme-${newTheme}`);
    }
    toast({ title: "Theme Updated", description: `App theme set to ${newTheme}.` });
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
    </div>
  );
}
