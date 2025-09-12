'use client';

import { useAppContext } from "@/contexts/app-context";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
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
  const [target, setTarget] = useState(settings.targetPercentage.toString());
  const [isDark, setIsDark] = useState(false);
  const [theme, setTheme] = useState('blue');

  useEffect(() => {
    setTarget(settings.targetPercentage.toString());
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

  const handleSaveTarget = () => {
    const newTarget = parseFloat(target);
    if (isNaN(newTarget) || newTarget < 0 || newTarget > 100) {
      toast({
        title: "Invalid Percentage",
        description: "Please enter a number between 0 and 100.",
        variant: "destructive",
      });
      return;
    }
    setSettings({ ...settings, targetPercentage: newTarget });
    toast({
      title: "Settings Saved",
      description: `Your target attendance is now ${newTarget}%.`,
    });
  };

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
    <Card>
      <CardContent className="pt-6 space-y-6">
          <div className="flex items-center justify-between">
            <Label htmlFor="dark-mode" className="text-base">Dark Mode</Label>
            <Switch
              id="dark-mode"
              checked={isDark}
              onCheckedChange={handleModeToggle}
              aria-label="Toggle dark mode"
            />
          </div>

          <div className="flex items-center justify-between">
              <Label className="text-base">Theme Color</Label>
              <Select onValueChange={handleThemeChange} value={theme}>
                  <SelectTrigger className="w-[180px] bg-background">
                      <SelectValue placeholder="Select a theme" />
                  </SelectTrigger>
                  <SelectContent>
                      <SelectItem value="blue">Blue</SelectItem>
                      <SelectItem value="green">Green</SelectItem>
                      <SelectItem value="purple">Purple</SelectItem>
                  </SelectContent>
              </Select>
          </div>
      
          <div className="flex items-center justify-between">
              <Label className="text-base">Target Attendance</Label>
                <div className="flex items-center gap-2">
                  <Input
                      id="target"
                      type="number"
                      value={target}
                      onChange={(e) => setTarget(e.target.value)}
                      className="w-24 bg-background"
                  />
                  <span>%</span>
              </div>
          </div>
          <Button onClick={handleSaveTarget} size="sm" className="w-full">Save</Button>
      </CardContent>
    </Card>
  );
}
