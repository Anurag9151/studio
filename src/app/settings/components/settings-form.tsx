'use client';

import { useAppContext } from "@/contexts/app-context";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { useToast } from "@/hooks/use-toast";
import { useState, useEffect } from "react";
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
import { Trash2, Sun, Moon, Palette } from "lucide-react";
import { Switch } from "@/components/ui/switch";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";

export default function SettingsForm() {
  const { settings, setSettings, setSubjects, setAttendanceRecords } = useAppContext();
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
    document.body.classList.add(`theme-${currentTheme}`);
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

  const handleClearData = () => {
    setSubjects([]);
    setAttendanceRecords([]);
    setSettings({ targetPercentage: 75, theme: 'blue', mode: 'light' });
    toast({
      title: "Data Cleared",
      description: "All your data has been removed.",
    });
  };

  const handleThemeChange = (newTheme: string) => {
    setTheme(newTheme);
    setSettings({ ...settings, theme: newTheme });
    document.body.classList.remove('theme-blue', 'theme-green', 'theme-purple');
    document.body.classList.add(`theme-${newTheme}`);
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
    <div className="space-y-8">
      <div className="space-y-2">
        <Label htmlFor="target">Target Attendance Percentage</Label>
        <div className="flex items-center gap-2">
          <Input
            id="target"
            type="number"
            value={target}
            onChange={(e) => setTarget(e.target.value)}
            placeholder="e.g., 75"
            className="max-w-xs"
          />
          <Button onClick={handleSaveTarget}>Save</Button>
        </div>
        <p className="text-sm text-muted-foreground">Set the minimum attendance you want to maintain.</p>
      </div>
      
      <div className="space-y-4">
        <Label>Theme</Label>
        <div className="flex items-center space-x-4">
          <div className="flex items-center space-x-2">
            <Sun className="h-5 w-5" />
            <Switch
              checked={isDark}
              onCheckedChange={handleModeToggle}
              aria-label="Toggle dark mode"
            />
            <Moon className="h-5 w-5" />
          </div>
        </div>
         <RadioGroup value={theme} onValueChange={handleThemeChange} className="flex space-x-2">
            <Label htmlFor="theme-blue" className="flex items-center space-x-2 cursor-pointer p-2 border rounded-md has-[:checked]:bg-muted has-[:checked]:border-primary">
              <RadioGroupItem value="blue" id="theme-blue" />
              <div className="w-4 h-4 rounded-full bg-[#4A55A2]"></div>
              <span>Blue</span>
            </Label>
            <Label htmlFor="theme-green" className="flex items-center space-x-2 cursor-pointer p-2 border rounded-md has-[:checked]:bg-muted has-[:checked]:border-primary">
              <RadioGroupItem value="green" id="theme-green" />
              <div className="w-4 h-4 rounded-full bg-green-600"></div>
              <span>Green</span>
            </Label>
             <Label htmlFor="theme-purple" className="flex items-center space-x-2 cursor-pointer p-2 border rounded-md has-[:checked]:bg-muted has-[:checked]:border-primary">
              <RadioGroupItem value="purple" id="theme-purple" />
              <div className="w-4 h-4 rounded-full bg-purple-600"></div>
              <span>Purple</span>
            </Label>
        </RadioGroup>
        <p className="text-sm text-muted-foreground">Customize the look and feel of the app.</p>
      </div>

      <div className="space-y-2">
        <Label>Danger Zone</Label>
        <AlertDialog>
          <AlertDialogTrigger asChild>
            <Button variant="destructive">
              <Trash2 className="mr-2 h-4 w-4" />
              Clear All Data
            </Button>
          </AlertDialogTrigger>
          <AlertDialogContent>
            <AlertDialogHeader>
              <AlertDialogTitle>Are you absolutely sure?</AlertDialogTitle>
              <AlertDialogDescription>
                This action cannot be undone. This will permanently delete all your subjects, attendance records, and settings.
              </AlertDialogDescription>
            </AlertDialogHeader>
            <AlertDialogFooter>
              <AlertDialogCancel>Cancel</AlertDialogCancel>
              <AlertDialogAction onClick={handleClearData} className="bg-destructive hover:bg-destructive/90">
                Yes, delete everything
              </AlertDialogAction>
            </AlertDialogFooter>
          </AlertDialogContent>
        </AlertDialog>
        <p className="text-sm text-muted-foreground">This will reset the entire application.</p>
      </div>
    </div>
  );
}
