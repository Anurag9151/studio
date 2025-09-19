
import jsPDF from "jspdf";
import autoTable from "jspdf-autotable";
import { format } from "date-fns";
import type { Subject, AttendanceRecord, AppSettings, Holiday } from "@/lib/types";
import { calculateAttendance } from "@/lib/utils";

export const exportToPDF = (
  subjects: Subject[],
  attendanceRecords: AttendanceRecord[],
  settings: AppSettings,
  holidays: Holiday[]
) => {
  const doc = new jsPDF();
  const uniqueSubjectNames = [...new Set(subjects.map(s => s.name))];

  // Title
  doc.setFontSize(22);
  doc.text("Attendance Report", 14, 22);
  doc.setFontSize(12);
  doc.text(`Report generated on: ${format(new Date(), 'do MMMM yyyy')}`, 14, 30);
  
  // Overall Summary
  let totalAttended = 0;
  let totalClasses = 0;
  uniqueSubjectNames.forEach(name => {
    const { attended, total } = calculateAttendance(name, subjects, attendanceRecords, holidays);
    totalAttended += attended;
    totalClasses += total;
  });
  const overallPercentage = totalClasses > 0 ? (totalAttended / totalClasses) * 100 : 0;
  
  doc.setFontSize(16);
  doc.text("Overall Summary", 14, 45);
  doc.setFontSize(12);
  doc.text(`Total Attendance: ${overallPercentage.toFixed(2)}%`, 14, 52);
  doc.text(`(Attended ${totalAttended} out of ${totalClasses} classes)`, 14, 58);
  doc.text(`Target Attendance: ${settings.targetPercentage}%`, 14, 64);


  // Subject-wise Table
  const tableData = uniqueSubjectNames.map(name => {
    const { attended, total, bunkedClasses, percentage } = calculateAttendance(name, subjects, attendanceRecords, holidays);
    return [name, total, attended, bunkedClasses, `${percentage.toFixed(2)}%`];
  });

  autoTable(doc, {
    startY: 75,
    head: [['Subject', 'Total Classes', 'Attended', 'Bunked', 'Percentage']],
    body: tableData,
    headStyles: { fillColor: [3, 105, 161] }, // A shade of blue
    didDrawPage: function (data) {
      // Footer
      const str = `Page ${doc.internal.getNumberOfPages()}`;
      doc.setFontSize(10);
      doc.text(str, data.settings.margin.left, doc.internal.pageSize.height - 10);
    },
  });

  // Save the PDF
  doc.save(`attendance-report-${format(new Date(), 'yyyy-MM-dd')}.pdf`);
};
