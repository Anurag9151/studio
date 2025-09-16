
'use client';

import { useMemo, useState, useEffect } from 'react';
import { useAppContext } from '@/contexts/app-context';
import { calculateBunkSuggestion, getUniqueSubjects, cn } from '@/lib/utils';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { AlertCircle, ArrowDown, ArrowUp, ShieldCheck, TrendingDown } from 'lucide-react';
import type { Subject } from '@/lib/types';
import { Skeleton } from '@/components/ui/skeleton';

type SortKey = 'percentage_desc' | 'percentage_asc' | 'bunks_desc';

export default function BunkSuggesterView() {
  const { subjects, attendanceRecords, settings, holidays } = useAppContext();
  const [sortKey, setSortKey] = useState<SortKey>('percentage_desc');
  const [isClient, setIsClient] = useState(false);
  const targetPercentage = settings.targetPercentage || 75;

  useEffect(() => {
    setIsClient(true);
  }, []);

  const uniqueSubjects = useMemo(() => getUniqueSubjects(subjects), [subjects]);

  const subjectStats = useMemo(() => {
    if (!isClient) return [];
    return uniqueSubjects.map(subject => {
        const suggestion = calculateBunkSuggestion(subject.name, subjects, attendanceRecords, targetPercentage, holidays);
        return {
            ...subject,
            ...suggestion
        };
    }).sort((a, b) => {
        switch (sortKey) {
            case 'percentage_asc':
                return a.percentage - b.percentage;
            case 'bunks_desc':
                return b.bunkedClasses - a.bunkedClasses;
            case 'percentage_desc':
            default:
                return b.percentage - a.percentage;
        }
    });
  }, [uniqueSubjects, subjects, attendanceRecords, targetPercentage, sortKey, isClient, holidays]);

  if (!isClient) {
    return <Skeleton className="h-64 w-full" />;
  }

  if (subjects.length === 0) {
    return (
      <Card>
        <CardHeader>
          <CardTitle>Bunk Suggester</CardTitle>
        </CardHeader>
        <CardContent className="h-[250px] flex items-center justify-center">
          <div className="text-center text-muted-foreground">
            <p>No subjects to display.</p>
          </div>
        </CardContent>
      </Card>
    );
  }

  const SortButton = ({ value, label }: { value: SortKey, label: React.ReactNode}) => (
    <Button
        variant={sortKey === value ? 'default' : 'outline'}
        size="sm"
        onClick={() => setSortKey(value)}
        className="text-xs h-8"
    >
        {label}
    </Button>
  );

  return (
    <Card>
      <CardHeader>
        <div className="flex justify-between items-center">
            <CardTitle>Bunk Suggester</CardTitle>
            <span className="text-sm text-muted-foreground">Target: {targetPercentage}%</span>
        </div>
      </CardHeader>
      <CardContent>
        <div className="flex items-center gap-2 mb-4 overflow-x-auto pb-2">
            <SortButton value="percentage_desc" label={<><ArrowDown size={14} /> Highest %</>} />
            <SortButton value="percentage_asc" label={<><ArrowUp size={14} /> Lowest %</>} />
            <SortButton value="bunks_desc" label={<><TrendingDown size={14} /> Most Bunked</>} />
        </div>
        <div className="space-y-4">
          {subjectStats.map(stat => (
            <div key={stat.id} className="p-4 rounded-lg" style={{ backgroundColor: `${stat.color}20`}}>
                <div className="flex justify-between items-start">
                    <div>
                        <p className="font-bold text-base">{stat.name}</p>
                        <p className="text-sm" style={{ color: `${stat.color}` }}>
                            Bunked: {stat.bunkedClasses} / Attended: {stat.attended}
                        </p>
                    </div>
                    <p className={cn("font-bold text-xl", stat.percentage < targetPercentage ? 'text-destructive' : 'text-green-600')}>
                        {stat.percentage.toFixed(1)}%
                    </p>
                </div>
                <div 
                    className={cn(
                        "mt-2 text-xs font-medium flex items-center gap-1.5 p-2 rounded-md", 
                        stat.suggestionType === 'safe' && 'bg-green-100 text-green-800 dark:bg-green-900/50 dark:text-green-300',
                        stat.suggestionType === 'danger' && 'bg-red-100 text-red-800 dark:bg-red-900/50 dark:text-red-300'
                    )}
                >
                    {stat.suggestionType === 'safe' ? <ShieldCheck size={14} /> : <AlertCircle size={14} />}
                    <span>{stat.suggestion}</span>
                </div>
            </div>
          ))}
        </div>
      </CardContent>
    </Card>
  );
}
