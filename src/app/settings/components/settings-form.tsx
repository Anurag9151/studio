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
import { Card, CardContent } from "@/components/ui/card";

export default function SettingsForm() {
  const { settings, setSettings } = useAppContext();
  const { toast } = useToast();
  const [isDark, setIsDark] = useState(false);
  const [theme, setTheme] = useState('blue');

  useEffect(() => {
    const currentTheme = settings.theme || 'blue';
    const currentMode = settings.mode || 'light';
    setTheme(currentTheme);
    setIsDark(currentMode === 'dark');
    document.body.classList.toggle('dark', currentMode === 'dark');
    document.body.classList.remove('theme-blue', 'theme-green', 'theme-purple');
    if(currentTheme !== 'blue') {
      document.body.classList.add(`theme-${currentTheme}`);
    }
  }, [settings]);

  const handleThemeChange = (newTheme: string) => {
    setTheme(newTheme);
    setSettings({ ...settings, theme: newTheme });
    document.body.classList.remove('theme-blue', 'theme-green', 'theme-purple');
    if (newTheme !== 'blue') {
        document.body.classList.add(`theme-${newTheme}`);
    }
     toast({
      title: "Theme Updated",
      description: `App theme set to ${newTheme}.`,
    });
  };

  const handleModeToggle = (isDarkMode: boolean) => {
    setIsDark(isDarkMode);
    const newMode = isDarkMode ? 'dark' : 'light';
    setSettings({ ...settings, mode: newMode });
    document.body.classList.toggle('dark', isDarkMode);
    toast({
      title: "Mode Changed",
      description: `Switched to ${newMode} mode.`,
    });
  };

  return (
    <div className="space-y-4">
        <div className="rounded-lg border bg-card text-card-foreground shadow-sm p-4 flex items-center justify-between">
            <Label htmlFor="dark-mode" className="text-base font-normal">Dark Mode</Label>
            <Switch
            id="dark-mode"
            checked={isDark}
            onCheckedChange={handleModeToggle}
            aria-label="Toggle dark mode"
            />
        </div>

        <div className="rounded-lg border bg-card text-card-foreground shadow-sm">
            <Select onValueChange={handleThemeChange} value={theme}>
                <SelectTrigger className="w-full border-none h-14 px-4 text-base">
                    <Label className="font-normal">Theme Color</Label>
                </SelectTrigger>
                <SelectContent>
                    <SelectItem value="blue">Blue</SelectItem>
                    <SelectItem value="green">Green</SelectItem>
                    <SelectItem value="purple">Purple</SelectItem>
                </SelectContent>
            </Select>
        </div>
    </div>
  );
}
