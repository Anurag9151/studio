'use client';

import { BarChart, Bar, XAxis, YAxis, Cell, Tooltip } from "recharts";
import { useAppContext } from "@/contexts/app-context";
import { useMemo } from "react";
import { calculateAttendance } from "@/lib/utils";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { ChartConfig, ChartContainer, ChartTooltipContent } from "@/components/ui/chart";
import { Subject } from "@/lib/types";

export default function SubjectWiseAttendance() {
  const { subjects, attendanceRecords } = useAppContext();

  const chartData = useMemo(() => {
    const uniqueSubjects: { [name: string]: Subject & { ids: string[] } } = {};

    subjects.forEach(subject => {
      if (!uniqueSubjects[subject.name]) {
        uniqueSubjects[subject.name] = { ...subject, ids: [subject.id] };
      } else {
        uniqueSubjects[subject.name].ids.push(subject.id);
      }
    });

    return Object.values(uniqueSubjects).map(uniqueSubject => {
      let totalAttended = 0;
      let totalClasses = 0;

      uniqueSubject.ids.forEach(id => {
        const { attended, total } = calculateAttendance(id, attendanceRecords, subjects);
        totalAttended += attended;
        totalClasses += total;
      });
      
      const percentage = totalClasses > 0 ? (totalAttended / totalClasses) * 100 : 0;
      
      return {
        name: uniqueSubject.name,
        percentage: parseFloat(percentage.toFixed(1)),
        fill: uniqueSubject.color || `hsl(var(--chart-1))`
      };
    }).sort((a, b) => b.percentage - a.percentage);

  }, [subjects, attendanceRecords]);
  
  const chartConfig = useMemo(() => {
    const config: ChartConfig = {};
    chartData.forEach((data) => {
      config[data.name] = {
        label: data.name,
        color: data.fill,
      };
    });
    return config;
  }, [chartData]);


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
            </ChartContainer>
        </CardContent>
    </Card>
  );
}
