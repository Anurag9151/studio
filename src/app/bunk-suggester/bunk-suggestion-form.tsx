'use client';

import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { useAppContext } from '@/contexts/app-context';
import { suggestBunk, SuggestBunkOutput } from '@/ai/flows/ai-bunk-suggestion-tool';
import { calculateAttendance } from '@/lib/utils';
import { Loader2, Lightbulb, TrendingDown } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';

export default function BunkSuggestionForm() {
  const { subjects, attendanceRecords } = useAppContext();
  const { toast } = useToast();
  const [selectedSubject, setSelectedSubject] = useState('');
  const [currentGrade, setCurrentGrade] = useState('');
  const [comfortLevel, setComfortLevel] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [suggestion, setSuggestion] = useState<SuggestBunkOutput | null>(null);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedSubject || !currentGrade || !comfortLevel) {
       toast({
        title: "Incomplete Form",
        description: "Please fill out all fields.",
        variant: "destructive",
      });
      return;
    }
    
    setIsLoading(true);
    setSuggestion(null);

    const subject = subjects.find(s => s.id === selectedSubject);
    if (!subject) {
      setIsLoading(false);
      return;
    }

    const { attended, total, percentage } = calculateAttendance(subject.id, attendanceRecords, subjects);

    try {
      const result = await suggestBunk({
        courseName: subject.name,
        currentGrade: currentGrade,
        totalAttendedClasses: attended,
        studentComfortability: comfortLevel,
        totalClasses: total + 1, // consider the class to be bunked
        attendancePercentage: percentage,
      });
      setSuggestion(result);
    } catch (error) {
        console.error("Error getting suggestion:", error);
        toast({
            title: "AI Error",
            description: "Could not get a suggestion from the AI. Please try again.",
            variant: "destructive",
        });
    }

    setIsLoading(false);
  };

  return (
    <div className="grid md:grid-cols-2 gap-8">
        <Card className="max-w-lg">
            <form onSubmit={handleSubmit}>
                <CardHeader>
                    <CardTitle>Bunk Planner Input</CardTitle>
                    <CardDescription>Fill in the details to get a recommendation.</CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                <div className="space-y-2">
                    <Label htmlFor="subject">Subject</Label>
                    <Select onValueChange={setSelectedSubject} value={selectedSubject}>
                    <SelectTrigger id="subject">
                        <SelectValue placeholder="Select a subject" />
                    </SelectTrigger>
                    <SelectContent>
                        {subjects.map(subject => (
                        <SelectItem key={subject.id} value={subject.id}>{subject.name}</SelectItem>
                        ))}
                    </SelectContent>
                    </Select>
                </div>
                <div className="space-y-2">
                    <Label htmlFor="grade">Current Grade</Label>
                    <Input id="grade" value={currentGrade} onChange={e => setCurrentGrade(e.target.value)} placeholder="e.g., B+ or 85%" />
                </div>
                <div className="space-y-2">
                    <Label htmlFor="comfort">Comfort Level with Topic</Label>
                    <Select onValueChange={setComfortLevel} value={comfortLevel}>
                    <SelectTrigger id="comfort">
                        <SelectValue placeholder="How well do you know the material?" />
                    </SelectTrigger>
                    <SelectContent>
                        <SelectItem value="very-comfortable">Very Comfortable</SelectItem>
                        <SelectItem value="comfortable">Comfortable</SelectItem>
                        <SelectItem value="neutral">Neutral</SelectItem>
                        <SelectItem value="uncomfortable">Uncomfortable</SelectItem>
                        <SelectItem value="very-uncomfortable">Very Uncomfortable</SelectItem>
                    </SelectContent>
                    </Select>
                </div>
                </CardContent>
                <CardFooter>
                <Button type="submit" disabled={isLoading}>
                    {isLoading ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : <Lightbulb className="mr-2 h-4 w-4" />}
                    Get Suggestion
                </Button>
                </CardFooter>
            </form>
        </Card>
        
        <div className="flex items-center justify-center">
            {isLoading && (
                <div className="flex flex-col items-center gap-4 text-muted-foreground">
                    <Loader2 className="h-12 w-12 animate-spin text-primary" />
                    <p>AI is thinking...</p>
                </div>
            )}
            {suggestion && (
                <Card className="w-full max-w-lg bg-accent/30 border-accent">
                    <CardHeader>
                        <CardTitle className="flex items-center gap-2">
                            <Lightbulb className="text-primary"/> AI Recommendation
                        </CardTitle>
                    </CardHeader>
                    <CardContent className="space-y-4">
                        <p className="font-semibold text-lg">
                           Suggestion: <span className="text-primary">{suggestion.suggestedClassToBunk}</span>
                        </p>
                        <div className="p-4 bg-background rounded-lg">
                           <p className="font-medium">Reasoning:</p>
                           <p className="text-muted-foreground">{suggestion.reasoning}</p>
                        </div>
                         <div className="flex items-center gap-2 text-destructive">
                            <TrendingDown />
                            <p>Estimated attendance drop: <span className="font-bold">{suggestion.attendanceScoreDrop.toFixed(1)}%</span></p>
                        </div>
                    </CardContent>
                </Card>
            )}
            {!isLoading && !suggestion && (
                 <div className="flex flex-col items-center gap-4 text-muted-foreground p-8 border-2 border-dashed rounded-lg">
                    <Lightbulb className="h-12 w-12" />
                    <p>Your AI suggestion will appear here.</p>
                </div>
            )}
        </div>
    </div>
  );
}
