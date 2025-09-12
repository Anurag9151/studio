'use client';

import { PieChart, Pie, Cell, ResponsiveContainer, Tooltip } from "recharts";
import { BarChart, Bar, XAxis, YAxis } from "recharts";
import { useAppContext } from "@/contexts/app-context";
import { useMemo } from "react";
import { calculateAttendance } from "@/lib/utils";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { ChartConfig, ChartContainer } from "@/components/ui/chart";

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


  if (subjects.length === 0) {
    return (
      <Card>
        <CardHeader>
            <CardTitle>Analytics</CardTitle>
        </CardHeader>
        <CardContent className="h-[200px] flex items-center justify-center">
            <div className="text-center text-muted-foreground">
            <p>No analytics to display.</p>
            </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <div className="space-y-6">
        <Card>
            <CardHeader>
                <CardTitle>Subject-wise Distribution</CardTitle>
            </CardHeader>
            <CardContent>
                <ChartContainer config={chartConfig} className="h-[200px] w-full">
                    <ResponsiveContainer width="100%" height="100%">
                        <PieChart>
                            <Tooltip
                                cursor={{ fill: "hsl(var(--muted))" }}
                                contentStyle={{
                                    background: "hsl(var(--background))",
                                    borderRadius: "var(--radius)",
                                    border: "1px solid hsl(var(--border))"
                                }}
                            />
                            <Pie
                                data={chartData}
                                dataKey="percentage"
                                nameKey="name"
                                cx="50%"
                                cy="50%"
                                innerRadius={40}
                                outerRadius={80}
                                labelLine={false}
                                paddingAngle={5}
                            >
                                {chartData.map((entry, index) => (
                                    <Cell key={`cell-${index}`} fill={entry.fill} />
                                ))}
                            </Pie>
                        </PieChart>
                    </ResponsiveContainer>
                </ChartContainer>
            </CardContent>
        </Card>
        <Card>
            <CardHeader>
                <CardTitle>Attendance Trend</CardTitle>
            </CardHeader>
            <CardContent>
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
                         <Tooltip
                            cursor={{ fill: 'hsl(var(--muted))' }}
                             contentStyle={{
                                background: "hsl(var(--background))",
                                borderRadius: "var(--radius)",
                                border: "1px solid hsl(var(--border))"
                            }}
                        />
                        <Bar dataKey="percentage" radius={[0, 4, 4, 0]} background={{ fill: 'hsl(var(--muted))', radius: 4 }} />
                    </BarChart>
                </ChartContainer>
            </CardContent>
        </Card>
    </div>
  );
}
