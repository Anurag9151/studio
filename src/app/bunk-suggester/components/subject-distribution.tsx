
'use client';

import { PieChart, Pie, Cell, ResponsiveContainer } from "recharts";
import { useAppContext } from "@/contexts/app-context";
import { useMemo, useState, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { ChartConfig, ChartContainer } from "@/components/ui/chart";
import { Skeleton } from "@/components/ui/skeleton";
import { cn } from "@/lib/utils";

export default function SubjectDistribution() {
  const { subjects, attendanceRecords } = useAppContext();
  const [isClient, setIsClient] = useState(false);
  const chartColors = [
    'hsl(var(--chart-1))',
    'hsl(var(--chart-2))',
    'hsl(var(--chart-3))',
    'hsl(var(--chart-4))',
    'hsl(var(--chart-5))',
    'hsl(var(--primary))',
  ];

  useEffect(() => {
    setIsClient(true);
  }, []);

  const { data: totalClassesPerSubject, total: grandTotal } = useMemo(() => {
    if (!isClient) return { data: [], total: 0 };
    
    const subjectNames = [...new Set(subjects.map(s => s.name))];
    let grandTotal = 0;
    
    const data = subjectNames.map((name, index) => {
        const subjectIds = subjects.filter(s => s.name === name).map(s => s.id);
        const total = attendanceRecords.filter(r => subjectIds.includes(r.subjectId)).length;
        grandTotal += total;
        
        return {
            name: name,
            total: total,
            fill: chartColors[index % chartColors.length]
        }
    }).filter(d => d.total > 0).sort((a, b) => b.total - a.total);
    
    return { data, total: grandTotal };
  }, [subjects, attendanceRecords, isClient]);
  

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
            <div className="grid grid-cols-2 gap-6">
                <div className="h-[200px] w-full">
                    <ResponsiveContainer width="100%" height="100%">
                        <PieChart>
                            <Pie
                                data={totalClassesPerSubject}
                                dataKey="total"
                                nameKey="name"
                                cx="50%"
                                cy="50%"
                                outerRadius={80}
                                innerRadius={50}
                            >
                                {totalClassesPerSubject.map((entry, index) => (
                                    <Cell key={`cell-${index}`} fill={entry.fill} stroke={entry.fill} />
                                ))}
                            </Pie>
                        </PieChart>
                    </ResponsiveContainer>
                </div>
                 <div className="flex flex-col justify-center space-y-2 text-sm">
                    <div className="font-medium text-muted-foreground">Total Classes: {grandTotal}</div>
                    {totalClassesPerSubject.map(entry => (
                        <div key={entry.name} className="flex items-center gap-2">
                            <div className="w-2.5 h-2.5 rounded-full" style={{ backgroundColor: entry.fill }}/>
                            <div className="flex-1 truncate">
                                <span className="font-medium">{entry.name}</span>
                            </div>
                            <div className="font-mono w-16 text-right text-muted-foreground">
                                {grandTotal > 0 ? `${((entry.total / grandTotal) * 100).toFixed(0)}%` : '0%'}
                            </div>
                        </div>
                    ))}
                </div>
            </div>
        </CardContent>
    </Card>
  );
}

