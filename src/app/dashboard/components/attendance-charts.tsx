'use client';

import { PieChart, Pie, Cell, ResponsiveContainer, Legend } from "recharts";
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
        id: subject.id,
        name: subject.name,
        percentage: percentage,
        fill: `var(--color-${subject.name.replace(/\s+/g, '-').toLowerCase()})`
      };
    }).sort((a, b) => b.percentage - a.percentage);
  }, [subjects, attendanceRecords]);
  
  const chartConfig = useMemo(() => {
    const config: ChartConfig = {};
    subjects.forEach((subject, index) => {
      const safeName = subject.name.replace(/\s+/g, '-').toLowerCase();
      config[safeName] = {
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
            <CardContent>
                <ChartContainer config={chartConfig} className="h-[200px] w-full">
                    <ResponsiveContainer width="100%" height="100%">
                        <PieChart>
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
                                {chartData.map((entry) => (
                                    <Cell key={`cell-${entry.name}`} fill={entry.fill} />
                                ))}
                            </Pie>
                             <Legend content={<CustomLegend payload={chartData.map(d => ({ value: d.name, color: d.fill }))} />} />
                        </PieChart>
                    </ResponsiveContainer>
                </ChartContainer>
            </CardContent>
        </Card>
        <Card>
            <CardContent>
                <ChartContainer config={chartConfig} className="h-[200px] w-full">
                    <BarChart accessibilityLayer data={chartData} margin={{ left: 10, right: 20 }}>
                        <XAxis type="number" dataKey="percentage" domain={[0, 100]} hide />
                        <YAxis
                            dataKey="name"
                            type="category"
                            tickLine={false}
                            axisLine={false}
                            tickMargin={8}
                            width={80}
                            tick={false}
                        />
                        <Bar dataKey="percentage" radius={[4, 4, 4, 4]} background={{ fill: 'hsl(var(--muted))', radius: 4 }} key="id" />
                    </BarChart>
                </ChartContainer>
            </CardContent>
        </Card>
    </div>
  );
}

const CustomLegend = ({ payload }: any) => {
  return (
    <ul className="flex flex-col space-y-2 absolute right-4 top-1/2 -translate-y-1/2">
      {
        payload.map((entry: any, index: number) => (
          <li key={`item-${index}`} className="flex items-center space-x-2">
            <span className="w-2.5 h-2.5 rounded-full" style={{backgroundColor: entry.color}} />
            <span className="text-sm text-muted-foreground">{entry.value}</span>
          </li>
        ))
      }
    </ul>
  )
}
