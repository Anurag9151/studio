
'use client';

import { PieChart, Pie, Cell, ResponsiveContainer } from "recharts";
import { useAppContext } from "@/contexts/app-context";
import { useMemo, useState, useEffect } from "react";
import { calculateAttendance } from "@/lib/utils";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { cn } from "@/lib/utils";
import { Skeleton } from "@/components/ui/skeleton";

export default function OverallAttendance() {
  const { subjects, attendanceRecords } = useAppContext();
  const [isClient, setIsClient] = useState(false);

  useEffect(() => {
    setIsClient(true);
  }, []);

  const overallStats = useMemo(() => {
    if (!isClient) return { attended: 0, total: 0, percentage: 0, data: [] };

    let totalAttended = 0;
    let totalClasses = 0;
    subjects.forEach(subject => {
      const { attended, total } = calculateAttendance(subject.name, subjects, attendanceRecords);
      totalAttended += attended;
      totalClasses += total;
    });

    const percentage = totalClasses > 0 ? (totalAttended / totalClasses) * 100 : 0;
    const remainingPercentage = 100 - percentage;
    
    return {
      attended: totalAttended,
      total: totalClasses,
      percentage: parseFloat(percentage.toFixed(1)),
      data: [{ name: 'attended', value: percentage }, { name: 'missed', value: remainingPercentage }]
    };
  }, [subjects, attendanceRecords, isClient]);

  const color = useMemo(() => {
    if (!isClient) return "hsl(var(--muted))";
    if (overallStats.percentage >= 85) return "hsl(var(--chart-2))"; // Green
    if (overallStats.percentage >= 75) return "hsl(var(--chart-3))"; // Yellow
    return "hsl(var(--destructive))"; // Red
  }, [overallStats.percentage, isClient]);

  if (!isClient) {
    return <Skeleton className="h-48 w-full" />;
  }

  if (subjects.length === 0) {
    return (
      <Card>
        <CardHeader>
            <CardTitle>Overall Attendance</CardTitle>
        </CardHeader>
        <CardContent className="h-[200px] flex items-center justify-center">
            <div className="text-center text-muted-foreground">
            <p>No data to display.</p>
            </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card>
        <CardHeader>
            <CardTitle>Overall Attendance</CardTitle>
        </CardHeader>
        <CardContent>
            <div className="h-[200px] w-full relative">
                <ResponsiveContainer width="100%" height="100%">
                    <PieChart>
                        <Pie
                            data={overallStats.data}
                            dataKey="value"
                            cx="50%"
                            cy="50%"
                            innerRadius={60}
                            outerRadius={80}
                            startAngle={90}
                            endAngle={450}
                            paddingAngle={0}
                        >
                            <Cell key="attended-cell" fill={color} />
                            <Cell key="missed-cell" fill="hsl(var(--muted))" />
                        </Pie>
                    </PieChart>
                </ResponsiveContainer>
                <div className="absolute inset-0 flex flex-col items-center justify-center">
                    <p className={cn("text-4xl font-bold", 
                      overallStats.percentage < 75 ? "text-destructive" : ""
                    )} style={{color: overallStats.percentage >= 75 ? color : undefined}}>
                        {overallStats.percentage}%
                    </p>
                    <p className="text-sm text-muted-foreground">
                        Present {overallStats.attended} / Total {overallStats.total}
                    </p>
                </div>
            </div>
        </CardContent>
    </Card>
  );
}
