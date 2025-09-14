'use client';

import { BarChart, Bar, XAxis, YAxis, Cell, Tooltip } from "recharts";
import { useAppContext } from "@/contexts/app-context";
import { useMemo } from "react";
import { calculateAttendance } from "@/lib/utils";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { ChartConfig, ChartContainer, ChartTooltipContent } from "@/components/ui/chart";

export default function SubjectWiseAttendance() {
  const { subjects, attendanceRecords } = useAppContext();

  const chartData = useMemo(() => {
    return subjects.map(subject => {
      const { percentage } = calculateAttendance(subject.id, attendanceRecords, subjects);
      return {
        name: subject.name,
        percentage: percentage,
        fill: subject.color || `hsl(var(--chart-1))`
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
