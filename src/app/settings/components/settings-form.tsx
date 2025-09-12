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
import { Trash2 } from "lucide-react";

export default function SettingsForm() {
  const { settings, setSettings, setSubjects, setAttendanceRecords } = useAppContext();
  const { toast } = useToast();
  const [target, setTarget] = useState(settings.targetPercentage.toString());

  useEffect(() => {
    setTarget(settings.targetPercentage.toString());
  }, [settings.targetPercentage]);

  const handleSave = () => {
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
    setSettings({ targetPercentage: 75 });
    toast({
      title: "Data Cleared",
      description: "All your data has been removed.",
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
            <Button onClick={handleSave}>Save</Button>
        </div>
        <p className="text-sm text-muted-foreground">Set the minimum attendance you want to maintain.</p>
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
