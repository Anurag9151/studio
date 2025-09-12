'use server';
/**
 * @fileOverview An AI tool that suggests the least impactful class to skip.
 *
 * - suggestBunk - A function that suggests the best class to bunk based on various factors.
 * - SuggestBunkInput - The input type for the suggestBunk function.
 * - SuggestBunkOutput - The return type for the suggestBunk function.
 */

import {ai} from '@/ai/genkit';
import {z} from 'genkit';

const SuggestBunkInputSchema = z.object({
  currentGrade: z
    .string()
    .describe('The current grade of the student in the course.'),
  totalAttendedClasses: z
    .number()
    .describe('The total number of classes attended for the course.'),
  studentComfortability: z
    .string()
    .describe('The student’s comfort level with the topic.'),
  courseName: z.string().describe('The name of the course.'),
  totalClasses: z.number().describe('The total number of classes for the course.'),
  attendancePercentage: z.number().describe('The current attendance percentage in the course.'),
});
export type SuggestBunkInput = z.infer<typeof SuggestBunkInputSchema>;

const SuggestBunkOutputSchema = z.object({
  suggestedClassToBunk: z
    .string()
    .describe('The name of the course that is least impactful to skip.'),
  attendanceScoreDrop: z
    .number()
    .describe('The estimated attendance score drop if the suggested class is skipped.'),
  reasoning: z.string().describe('The reasoning behind the suggestion.'),
});
export type SuggestBunkOutput = z.infer<typeof SuggestBunkOutputSchema>;

export async function suggestBunk(input: SuggestBunkInput): Promise<SuggestBunkOutput> {
  return suggestBunkFlow(input);
}

const prompt = ai.definePrompt({
  name: 'suggestBunkPrompt',
  input: {schema: SuggestBunkInputSchema},
  output: {schema: SuggestBunkOutputSchema},
  prompt: `You are an AI tool that analyzes a student's attendance and academic performance to suggest the least impactful class to skip.

  Consider the following factors:
  - Current grade in the course
  - Total attended classes for the course
  - Student's comfort level with the topic

  Based on these factors, suggest the best course to bunk and provide an accurate estimation of the attendance score drop.

  Here is the student's information:
  Course Name: {{{courseName}}}
  Current Grade: {{{currentGrade}}}
  Total Attended Classes: {{{totalAttendedClasses}}}
  Student Comfort Level: {{{studentComfortability}}}
  Total Classes: {{{totalClasses}}}
  Current Attendance Percentage: {{{attendancePercentage}}}

  Give your recommendation, estimate the attendance drop, and provide a short explanation.
  The suggestedClassToBunk should be the name of the course, and the attendanceScoreDrop should be a number.
  {
    "suggestedClassToBunk": "<course_name>",
    "attendanceScoreDrop": <score_drop>,
    "reasoning": "<reasoning>"
  }
  `,
});

const suggestBunkFlow = ai.defineFlow(
  {
    name: 'suggestBunkFlow',
    inputSchema: SuggestBunkInputSchema,
    outputSchema: SuggestBunkOutputSchema,
  },
  async input => {
    const {output} = await prompt(input);
    return output!;
  }
);
