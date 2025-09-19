
'use client';

import { BarChart, Bar, XAxis, YAxis, Cell, Tooltip, ResponsiveContainer } from "recharts";
import { useAppContext } from "@/contexts/app-context";
import { useMemo, useState, useEffect } from "react";
import { calculateAttendance } from "@/lib/utils";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { ChartConfig, ChartContainer, ChartTooltipContent } from "@/components/ui/chart";
import { Skeleton } from "@/components/ui/skeleton";

export default function SubjectWiseAttendance() {
  const { subjects, attendanceRecords } = useAppContext();
  const [isClient, setIsClient] = useState(false);

  useEffect(() => {
    setIsClient(true);
  }, []);

  const chartData = useMemo(() => {
    if (!isClient) return [];
    
    const uniqueSubjectNames = [...new Set(subjects.map(s => s.name))];
    
    return uniqueSubjectNames.map((name, index) => {
      const { percentage } = calculateAttendance(name, subjects, attendanceRecords);
      let color = 'hsl(var(--primary))';
      const existingSubject = subjects.find(s => s.name === name);
      if (existingSubject && existingSubject.color) {
          color = existingSubject.color;
      }
      return {
        name: name,
        percentage: parseFloat(percentage.toFixed(1)),
        fill: color
      };
    }).sort((a, b) => b.percentage - a.percentage);

  }, [subjects, attendanceRecords, isClient]);
  
  const chartConfig = useMemo(() => {
    if (!isClient) return {};
    const config: ChartConfig = {};
    chartData.forEach((data) => {
      config[data.name] = {
        label: data.name,
        color: data.fill,
      };
    });
    return config;
  }, [chartData, isClient]);

  if (!isClient) {
    return <Skeleton className="h-64 w-full" />;
  }

  if (subjects.length === 0) {
    return (
      <Card>
        <CardHeader>
            <CardTitle>Subject-wise Attendance</CardTitle>
        </CardHeader>
        <CardContent className="h-[250px] flex items-center justify-center">
            <div className="text-center text-muted-foreground">
            <p>No subjects to display.</p>
            </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card>
         <CardHeader>
            <CardTitle>Subject-wise Attendance</CardTitle>
        </CardHeader>
        <CardContent>
             <ChartContainer config={chartConfig} className="h-[250px] w-full">
                <ResponsiveContainer>
                    <BarChart data={chartData} margin={{ top: 20, right: 10, left: -20, bottom: 5 }}>
                        <XAxis dataKey="name" stroke="hsl(var(--muted-foreground))" fontSize={12} tickLine={false} axisLine={false} />
                        <YAxis 
                            stroke="hsl(var(--muted-foreground))"
                            fontSize={12}
                            tickLine={false}
                            axisLine={false}
                            tickFormatter={(value) => `${value}%`}
                        />
                        <Tooltip
                            cursor={false}
                            content={<ChartTooltipContent 
                                formatter={(value) => `${value}%`}
                            />}
                        />
                        <Bar dataKey="percentage" radius={[4, 4, 0, 0]}>
                            {chartData.map((entry) => (
                                <Cell key={`cell-${entry.name}`} fill={entry.fill} className={`${entry.percentage < 75 ? 'opacity-50' : ''}`} />
                            ))}
                        </Bar>
                    </BarChart>
                </ResponsiveContainer>
            </ChartContainer>
        </CardContent>
    </Card>
  );
}
