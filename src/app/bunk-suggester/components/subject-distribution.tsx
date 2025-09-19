
'use client';

import { PieChart, Pie, Cell, ResponsiveContainer, Legend } from "recharts";
import { useAppContext } from "@/contexts/app-context";
import { useMemo, useState, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { ChartConfig, ChartContainer } from "@/components/ui/chart";
import { Skeleton } from "@/components/ui/skeleton";

export default function SubjectDistribution() {
  const { subjects, attendanceRecords } = useAppContext();
  const [isClient, setIsClient] = useState(false);
  const colors = ['#3b82f6', '#ef4444', '#22c55e', '#f97316', '#8b5cf6', '#ec4899'];

  useEffect(() => {
    setIsClient(true);
  }, []);

  const totalClassesPerSubject = useMemo(() => {
    if (!isClient) return [];
    
    const subjectNames = [...new Set(subjects.map(s => s.name))];
    const subjectColorMap = new Map<string, string>();
    
    const data = subjectNames.map((name, index) => {
        const subjectIds = subjects.filter(s => s.name === name).map(s => s.id);
        const total = attendanceRecords.filter(r => subjectIds.includes(r.subjectId)).length;
        
        let color = 'hsl(var(--primary))';
        const existingSubject = subjects.find(s => s.name === name);
        if (existingSubject && existingSubject.color) {
            color = existingSubject.color;
        }

        return {
            name: name,
            total: total,
            fill: color
        }
    }).filter(d => d.total > 0);
    
    return data;
  }, [subjects, attendanceRecords, isClient]);
  
  const chartConfig = useMemo(() => {
    if (!isClient) return {};
    const config: ChartConfig = {};
    totalClassesPerSubject.forEach((data) => {
      config[data.name] = {
        label: data.name,
        color: data.fill,
      };
    });
    return config;
  }, [totalClassesPerSubject, isClient]);

  if (!isClient) {
    return <Skeleton className="h-64 w-full" />;
  }

  if (totalClassesPerSubject.length === 0) {
    return (
      <Card>
        <CardHeader>
            <CardTitle>Subject Distribution</CardTitle>
        </CardHeader>
        <CardContent className="h-[250px] flex items-center justify-center">
            <div className="text-center text-muted-foreground">
            <p>No classes recorded yet.</p>
            </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card>
        <CardHeader>
            <CardTitle>Subject Distribution</CardTitle>
        </CardHeader>
        <CardContent>
            <ChartContainer config={chartConfig} className="h-[250px] w-full">
                <ResponsiveContainer width="100%" height="100%">
                    <PieChart>
                        <Pie
                            data={totalClassesPerSubject}
                            dataKey="total"
                            nameKey="name"
                            cx="50%"
                            cy="50%"
                            outerRadius={80}
                            labelLine={false}
                            label={({ cx, cy, midAngle, innerRadius, outerRadius, percent, index }) => {
                                const RADIAN = Math.PI / 180;
                                const radius = innerRadius + (outerRadius - innerRadius) * 1.2;
                                const x = cx + radius * Math.cos(-midAngle * RADIAN);
                                const y = cy + radius * Math.sin(-midAngle * RADIAN);
                                return (
                                <text x={x} y={y} fill="hsl(var(--foreground))" textAnchor={x > cx ? 'start' : 'end'} dominantBaseline="central" className="text-xs">
                                    {`${(percent * 100).toFixed(0)}%`}
                                </text>
                                );
                            }}
                        >
                            {totalClassesPerSubject.map((entry, index) => (
                                <Cell key={`cell-${index}`} fill={entry.fill} />
                            ))}
                        </Pie>
                        <Legend iconType="circle" />
                    </PieChart>
                </ResponsiveContainer>
            </ChartContainer>
        </CardContent>
    </Card>
  );
}
