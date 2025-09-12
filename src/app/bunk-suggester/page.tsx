import BunkSuggestionForm from "./bunk-suggestion-form";

export default function BunkSuggesterPage() {
  return (
    <div className="flex-1 space-y-4 p-4 md:p-8 pt-6">
      <div className="flex items-center justify-between space-y-2">
        <h2 className="text-3xl font-bold tracking-tight font-headline">AI Bunk Suggester</h2>
      </div>
      <p className="text-muted-foreground">
        Select a course and provide some details. Our AI will suggest if it's a good idea to bunk, considering the impact on your attendance.
      </p>
      <BunkSuggestionForm />
    </div>
  );
}
