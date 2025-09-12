'use client';

import { useAppContext } from "@/contexts/app-context";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Droplets, Target, CheckCircle } from "lucide-react";
import { useMemo } from "react";
import { calculateAttendance } from "@/lib/utils";

export default function AttendanceSummary() {
  const { subjects, attendanceRecords, settings } = useAppContext();

  const summary = useMemo(() => {
    let totalAttended = 0;
    let totalClasses = 0;

    subjects.forEach(subject => {
      const { attended, total } = calculateAttendance(subject.id, attendanceRecords, subjects);
      totalAttended += attended;
      totalClasses += total;
    });

    const overallPercentage = totalClasses > 0 ? (totalAttended / totalClasses) * 100 : 0;

    const classesToAttendForTarget = Math.max(0, Math.ceil((settings.targetPercentage / 100) * totalClasses - totalAttended));

    return {
      overallPercentage: parseFloat(overallPercentage.toFixed(1)),
      totalAttended,
      classesToAttendForTarget
    };
  }, [subjects, attendanceRecords, settings.targetPercentage]);
  
  if (subjects.length === 0) {
    return (
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Overall Attendance</CardTitle>
            <Droplets className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">N/A</div>
            <p className="text-xs text-muted-foreground">Add subjects to begin tracking</p>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
      <Card>
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
          <CardTitle className="text-sm font-medium">Overall Attendance</CardTitle>
          <Droplets className="h-4 w-4 text-muted-foreground" />
        </CardHeader>
        <CardContent>
          <div className="text-2xl font-bold">{summary.overallPercentage}%</div>
          <p className="text-xs text-muted-foreground">Across all subjects</p>
        </CardContent>
      </Card>
      <Card>
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
          <CardTitle className="text-sm font-medium">Classes Attended</CardTitle>
          <CheckCircle className="h-4 w-4 text-muted-foreground" />
        </CardHeader>
        <CardContent>
          <div className="text-2xl font-bold">+{summary.totalAttended}</div>
          <p className="text-xs text-muted-foreground">Total classes marked as present</p>
        </CardContent>
      </Card>
      <Card>
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
          <CardTitle className="text-sm font-medium">Target ({settings.targetPercentage}%)</CardTitle>
          <Target className="h-4 w-4 text-muted-foreground" />
        </CardHeader>
        <CardContent>
          <div className="text-2xl font-bold">{summary.classesToAttendForTarget} more</div>
          <p className="text-xs text-muted-foreground">Classes to attend to meet your goal</p>
        </CardContent>
      </Card>
    </div>
  );
}
