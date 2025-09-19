
'use client';

import { PieChart, Pie, Cell, ResponsiveContainer } from "recharts";
import { useAppContext } from "@/contexts/app-context";
import { useMemo, useState, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";

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
    
    const uniqueSubjects = Array.from(new Map(subjects.map(s => [s.name, s])).values());
    let grandTotal = 0;
    
    const data = uniqueSubjects.map((subject, index) => {
        const subjectIds = subjects.filter(s => s.name === subject.name).map(s => s.id);
        const total = attendanceRecords.filter(r => subjectIds.includes(r.subjectId)).length;
        grandTotal += total;
        
        return {
            name: subject.name,
            total: total,
            fill: subject.color || chartColors[index % chartColors.length]
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
            <div className="grid grid-cols-2 gap-6 items-center">
                <div className="h-[180px] w-full relative">
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
                     <div className="absolute inset-0 flex flex-col items-center justify-center pointer-events-none">
                        <p className="text-sm text-muted-foreground">Total</p>
                        <p className="text-3xl font-bold">{grandTotal}</p>
                        <p className="text-sm text-muted-foreground">Classes</p>
                    </div>
                </div>
                 <div className="flex flex-col justify-center space-y-2 text-sm">
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
