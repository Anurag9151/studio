'use client';

import { Bar, BarChart, ResponsiveContainer, XAxis, YAxis, Tooltip, Legend } from "recharts";
import { RadialBar, RadialBarChart } from "recharts";
import { useAppContext } from "@/contexts/app-context";
import { useMemo } from "react";
import { calculateAttendance } from "@/lib/utils";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { ChartConfig, ChartContainer, ChartTooltip, ChartTooltipContent } from "@/components/ui/chart";

export default function AttendanceCharts() {
  const { subjects, attendanceRecords } = useAppContext();

  const chartData = useMemo(() => {
    return subjects.map(subject => {
      const { percentage } = calculateAttendance(subject.id, attendanceRecords, subjects);
      return {
        name: subject.name,
        percentage: percentage,
        fill: `var(--color-${subject.name.replace(/\s+/g, '-').toLowerCase()})`
      };
    }).sort((a, b) => b.percentage - a.percentage);
  }, [subjects, attendanceRecords]);

  const chartConfig = useMemo(() => {
    const config: ChartConfig = {};
    subjects.forEach((subject, index) => {
      config[subject.name.replace(/\s+/g, '-').toLowerCase()] = {
        label: subject.name,
        color: `hsl(var(--chart-${(index % 5) + 1}))`,
      };
    });
    return config;
  }, [subjects]);


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
      <Card className="h-full flex items-center justify-center col-span-12 lg:col-span-3">
        <div className="text-center text-muted-foreground">
          <p>No analytics to display.</p>
          <p className="text-sm">Add subjects to see your progress.</p>
        </div>
      </Card>
    );
  }

  return (
    <Card className="col-span-12 lg:col-span-3">
        <CardHeader>
            <CardTitle>Analytics</CardTitle>
            <CardDescription>Visualize your attendance journey.</CardDescription>
        </CardHeader>
        <CardContent>
            <Tabs defaultValue="subjects" className="w-full">
            <TabsList className="grid w-full grid-cols-2">
                <TabsTrigger value="subjects">By Subject</TabsTrigger>
                <TabsTrigger value="overall">Overall</TabsTrigger>
            </TabsList>
            <TabsContent value="subjects">
                <ChartContainer config={chartConfig} className="h-[200px] w-full">
                    <BarChart accessibilityLayer data={chartData} layout="vertical" margin={{ left: 10, right: 20 }}>
                        <XAxis type="number" dataKey="percentage" domain={[0, 100]} hide />
                        <YAxis
                            dataKey="name"
                            type="category"
                            tickLine={false}
                            axisLine={false}
                            tickMargin={8}
                            width={80}
                            tickFormatter={(value) => value.length > 10 ? value.substring(0, 9) + '...' : value}
                        />
                         <ChartTooltip
                            cursor={{ fill: 'hsl(var(--muted))' }}
                            content={<ChartTooltipContent indicator="dot" />}
                        />
                        <Bar dataKey="percentage" radius={[0, 4, 4, 0]} background={{ fill: 'hsl(var(--muted))', radius: 4 }} />
                    </BarChart>
                </ChartContainer>
            </TabsContent>
            <TabsContent value="overall">
                <div className="h-[200px] flex items-center justify-center">
                    <ResponsiveContainer width="100%" height="100%">
                        <RadialBarChart 
                            innerRadius="80%" 
                            outerRadius="90%" 
                            data={[{ value: overallPercentage, fill: 'hsl(var(--primary))' }]} 
                            startAngle={90} 
                            endAngle={450}
                        >
                            <RadialBar
                                background
                                dataKey='value'
                                cornerRadius={10}
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
      </CardContent>
    </Card>
  );
}
