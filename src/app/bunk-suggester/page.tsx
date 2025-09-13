import AttendanceSummary from "../dashboard/components/attendance-summary";
import AttendanceCharts from "../dashboard/components/attendance-charts";

export default function BunkSuggesterPage() {
  return (
    <div className="space-y-4">
      <AttendanceSummary />
      <AttendanceCharts />
    </div>
  );
}
