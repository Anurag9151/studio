# **App Name**: Local Lessons

## Core Features:

- Weekly Timetable Setup: Allows the user to configure a weekly timetable by adding subjects, assigning them to specific days and time slots, configuring the number of classes per day, subject name, start and end times, and duration.
- Attendance Marking: Automatically fetches today’s timetable and displays classes for the user to mark as Present or Absent. All data is saved locally using SQLite.
- Attendance Percentage Calculation: Calculates attendance percentage using the formula: (Attended Classes ÷ Total Classes) × 100. Displays subject-wise percentages and total average percentage in a dashboard view.
- Minimum Attendance Calculator: Calculates how many more classes must be attended to reach a user-defined target percentage (default 75%).
- Bunk Planner: Predicts the new attendance percentage if the user plans to skip a class, helping the user assess the impact of skipping classes.
- Visual Analytics: Graphs visualizing subject-wise attendance using a pie chart for subject distribution and a bar graph for trends.
- AI Bunk Suggestion Tool: Uses an LLM to make the best recommendation on a course which a user could bunk, by reasoning on information such as student current grade, total attended classes for the course, student comfortability and/or expertise with the topic. Output must include an accurate estimation of attendance score drop.

## Style Guidelines:

- Primary color: Deep blue (#3F51B5), reminiscent of school uniforms and focus.
- Background color: Very light blue (#E8EAF6), creating a calm and clean backdrop.
- Accent color: Muted purple (#7E57C2), provides contrast and highlights important elements.
- Body and headline font: 'PT Sans' for a humanist and modern feel that is very readable.
- Use clear and consistent icons for subjects, attendance status, and settings.
- Clean and modern UI with rounded cards, shadows, and simple navigation; dashboard screen with attendance summary and charts, a timetable screen for editing/adding classes, and a settings screen.
- Use subtle transitions and animations for marking attendance and updating charts.