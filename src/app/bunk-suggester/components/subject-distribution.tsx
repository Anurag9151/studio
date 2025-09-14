
'use client';

import { PieChart, Pie, Cell, ResponsiveContainer, Legend } from "recharts";
import { useAppContext } from "@/contexts/app-context";
import { useMemo } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { ChartConfig, ChartContainer } from "@/components/ui/chart";
import { getUniqueSubjects } from "@/lib/utils";

export default function SubjectDistribution() {
  const { subjects, attendanceRecords } = useAppContext();

  const totalClassesPerSubject = useMemo(() => {
    const uniqueSubjects = getUniqueSubjects(subjects);
    const data = uniqueSubjects.map(subject => {
        const total = attendanceRecords.filter(r => subject.originalIds.includes(r.subjectId)).length;
        return {
            name: subject.name,
            total: total,
            fill: subject.color || '#ccc'
        }
    }).filter(d => d.total > 0);
    
    return data;
  }, [subjects, attendanceRecords]);
  
  const chartConfig = useMemo(() => {
    const config: ChartConfig = {};
    const uniqueSubjects = getUniqueSubjects(subjects);
    uniqueSubjects.forEach((subject) => {
      config[subject.name] = {
        label: subject.name,
        color: subject.color,
      };
    });
    return config;
  }, [subjects]);

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
