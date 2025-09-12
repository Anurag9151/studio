import AttendanceCharts from "../dashboard/components/attendance-charts";
import BunkPlanner from "./components/bunk-planner";

export default function BunkSuggesterPage() {
  return (
    <div className="space-y-4">
      <BunkPlanner />
      <AttendanceCharts />
    </div>
  );
}
