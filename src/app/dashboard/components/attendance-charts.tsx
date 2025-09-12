'use client';

import { Bar, BarChart, ResponsiveContainer, XAxis, YAxis, Tooltip } from "recharts";
import { RadialBar, RadialBarChart } from "recharts";
import { useAppContext } from "@/contexts/app-context";
import { useMemo } from "react";
import { calculateAttendance } from "@/lib/utils";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";


export default function AttendanceCharts() {
  const { subjects, attendanceRecords } = useAppContext();

  const chartData = useMemo(() => {
    return subjects.map(subject => {
      const { percentage } = calculateAttendance(subject.id, attendanceRecords, subjects);
      return {
        name: subject.name.length > 10 ? subject.name.substring(0, 9) + '...' : subject.name,
        percentage: percentage,
      };
    }).sort((a, b) => b.percentage - a.percentage);
  }, [subjects, attendanceRecords]);

  const overallPercentage = useMemo(() => {
    let totalAttended = 0;
    let totalClasses = 0;
    subjects.forEach(subject => {
        const { attended, total } = calculateAttendance(subject.id, attendanceRecords, subjects);
        totalAttended += attended;
        totalClasses += total;
    });
    return totalClasses > 0 ? (totalAttended / totalClasses) * 100 : 0;
  }, [subjects, attendanceRecords]);

  if (subjects.length === 0) {
    return (
      <div className="flex items-center justify-center h-full text-muted-foreground">
        No data to display
      </div>
    );
  }

  return (
    <Tabs defaultValue="subjects" className="w-full">
      <TabsList className="grid w-full grid-cols-2">
        <TabsTrigger value="subjects">By Subject</TabsTrigger>
        <TabsTrigger value="overall">Overall</TabsTrigger>
      </TabsList>
      <TabsContent value="subjects">
        <div className="h-[200px]">
          <ResponsiveContainer width="100%" height="100%">
            <BarChart data={chartData} layout="vertical" margin={{ left: 10, right: 20 }}>
              <XAxis type="number" domain={[0, 100]} hide />
              <YAxis dataKey="name" type="category" axisLine={false} tickLine={false} tick={{ fontSize: 12 }} width={80} />
              <Tooltip cursor={{ fill: 'hsl(var(--muted))' }} contentStyle={{ backgroundColor: 'hsl(var(--background))', border: '1px solid hsl(var(--border))' }} />
              <Bar dataKey="percentage" fill="hsl(var(--primary))" radius={[0, 4, 4, 0]} background={{ fill: 'hsl(var(--muted))', radius: 4 }} />
            </BarChart>
          </ResponsiveContainer>
        </div>
      </TabsContent>
      <TabsContent value="overall">
        <div className="h-[200px] flex items-center justify-center">
             <ResponsiveContainer width="100%" height="100%">
                <RadialBarChart 
                    innerRadius="80%" 
                    outerRadius="90%" 
                    data={[{ value: overallPercentage }]} 
                    startAngle={90} 
                    endAngle={450}
                >
                    <RadialBar
                        background
                        dataKey='value'
                        cornerRadius={10}
                        fill="hsl(var(--primary))"
                    />
                    <text
                        x="50%"
                        y="50%"
                        textAnchor="middle"
                        dominantBaseline="middle"
                        className="text-3xl font-bold fill-foreground"
                    >
                        {overallPercentage.toFixed(1)}%
                    </text>
                     <text
                        x="50%"
                        y="65%"
                        textAnchor="middle"
                        dominantBaseline="middle"
                        className="text-sm fill-muted-foreground"
                    >
                        Overall
                    </text>
                </RadialBarChart>
            </ResponsiveContainer>
        </div>
      </TabsContent>
    </Tabs>
  );
}
