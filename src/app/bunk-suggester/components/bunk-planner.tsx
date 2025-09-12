'use client';

import { useState } from 'react';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { useAppContext } from '@/contexts/app-context';
import { calculateAttendance } from '@/lib/utils';
import { Lightbulb } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { suggestBunk } from '@/ai/flows/ai-bunk-suggestion-tool';
import { Skeleton } from '@/components/ui/skeleton';

export default function BunkPlanner() {
  const { subjects, attendanceRecords } = useAppContext();
  const [selectedSubjectId, setSelectedSubjectId] = useState<string | null>(null);
  const [prediction, setPrediction] = useState<{ original: number; new: number } | null>(null);
  const [aiSuggestion, setAiSuggestion] = useState<{ course: string; drop: number; reason: string} | null>(null);
  const [isLoading, setIsLoading] = useState(false);

  const handleSubjectChange = (subjectId: string) => {
    setSelectedSubjectId(subjectId);

    if (!subjectId) {
      setPrediction(null);
      return;
    }

    const { attended, total, percentage } = calculateAttendance(subjectId, attendanceRecords, subjects);
    
    // Simulate one absence
    const newTotal = total + 1;
    const newPercentage = newTotal > 0 ? (attended / newTotal) * 100 : 0;
    
    setPrediction({
      original: percentage,
      new: parseFloat(newPercentage.toFixed(1)),
    });
  };

  const handleAiSuggest = async () => {
    if (subjects.length === 0) return;
    setIsLoading(true);
    setAiSuggestion(null);

    // For simplicity, we'll pick the subject with the highest attendance to ask the AI about.
    // A real implementation might let the user choose or analyze all subjects.
    const subjectToAnalyze = subjects.map(s => {
        const { percentage, attended, total } = calculateAttendance(s.id, attendanceRecords, subjects);
        return { ...s, percentage, attended, total };
    }).sort((a,b) => b.percentage - a.percentage)[0];

    if(!subjectToAnalyze) {
        setIsLoading(false);
        return;
    }

    try {
        const result = await suggestBunk({
            courseName: subjectToAnalyze.name,
            currentGrade: 'N/A', // Not tracked in this app
            studentComfortability: 'N/A', // Not tracked
            totalAttendedClasses: subjectToAnalyze.attended,
            totalClasses: subjectToAnalyze.total,
            attendancePercentage: subjectToAnalyze.percentage,
        });

        setAiSuggestion({
            course: result.suggestedClassToBunk,
            drop: result.attendanceScoreDrop,
            reason: result.reasoning,
        });

    } catch (e) {
        console.error(e);
        // Handle error, maybe show a toast
    } finally {
        setIsLoading(false);
    }
  }

  return (
    <div className="space-y-6">
        <Card>
            <CardHeader>
                <CardTitle>Bunk Planner</CardTitle>
            </CardHeader>
            <CardContent>
                <div className="space-y-4">
                    <Select onValueChange={handleSubjectChange} disabled={subjects.length === 0}>
                        <SelectTrigger>
                            <SelectValue placeholder="Select a subject to bunk" />
                        </SelectTrigger>
                        <SelectContent>
                            {subjects.map(subject => (
                                <SelectItem key={subject.id} value={subject.id}>{subject.name}</SelectItem>
                            ))}
                        </SelectContent>
                    </Select>
                    
                    {prediction && (
                        <div className="text-center p-4 bg-muted/50 rounded-lg">
                            <p>If you skip this class, your attendance will drop from <span className="font-bold">{prediction.original}%</span> to <span className="font-bold text-destructive">{prediction.new}%</span>.</p>
                        </div>
                    )}
                </div>
            </CardContent>
        </Card>
        
        <Card>
            <CardHeader>
                <div className="flex items-center gap-2">
                    <Lightbulb className="text-yellow-400" />
                    <CardTitle>AI Bunk Suggestion</CardTitle>
                </div>
            </CardHeader>
            <CardContent className="space-y-4">
                 <Button onClick={handleAiSuggest} disabled={isLoading || subjects.length === 0} className="w-full">
                    {isLoading ? 'Thinking...' : 'Get Suggestion'}
                </Button>
                {isLoading && <Skeleton className="h-20 w-full" />}
                {aiSuggestion && (
                    <div className="p-4 bg-muted/50 rounded-lg space-y-2">
                        <p className="font-semibold">Suggestion: Bunk <span className="text-primary">{aiSuggestion.course}</span>.</p>
                        <p className="text-sm">{aiSuggestion.reason}</p>
                        <p className="text-sm font-medium text-destructive">Estimated Attendance Drop: {aiSuggestion.drop}%</p>
                    </div>
                )}
            </CardContent>
        </Card>
    </div>
  );
}
