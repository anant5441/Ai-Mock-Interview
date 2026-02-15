import jsPDF from "jspdf";
import autoTable from "jspdf-autotable";
import type { InterviewReportType } from "@/types/report";

/**
 * Export interview data as CSV file
 */
export function exportInterviewDataAsCSV(data: InterviewReportType[]): void {
  if (data.length === 0) {
    return;
  }

  // CSV Headers
  const headers = [
    "Interview ID",
    "Position",
    "Tech Stack",
    "Experience",
    "Date",
    "Average Rating",
    "Question",
    "User Answer",
    "Rating",
    "Feedback",
  ];

  // Flatten data for CSV
  const rows: string[][] = [];
  for (const interview of data) {
    if (interview.questions.length === 0) {
      // If no questions, still add interview info
      rows.push([
        interview.interviewId,
        interview.position,
        interview.techStack,
        interview.experience.toString(),
        interview.createdAt,
        interview.averageRating.toFixed(1),
        "",
        "",
        "",
        "",
      ]);
    } else {
      for (const question of interview.questions) {
        rows.push([
          interview.interviewId,
          interview.position,
          interview.techStack,
          interview.experience.toString(),
          interview.createdAt,
          interview.averageRating.toFixed(1),
          question.question,
          question.answer,
          question.rating.toString(),
          question.feedback,
        ]);
      }
    }
  }

  // Convert to CSV string
  const csvContent = [
    headers.join(","),
    ...rows.map((row) =>
      row
        .map((cell) => {
          // Escape quotes and wrap in quotes if contains comma, newline, or quote
          const cellStr = String(cell).replace(/"/g, '""');
          if (cellStr.includes(",") || cellStr.includes("\n") || cellStr.includes('"')) {
            return `"${cellStr}"`;
          }
          return cellStr;
        })
        .join(",")
    ),
  ].join("\n");

  // Create blob and download
  const blob = new Blob([csvContent], { type: "text/csv;charset=utf-8;" });
  const link = document.createElement("a");
  const url = URL.createObjectURL(blob);
  link.setAttribute("href", url);
  link.setAttribute("download", `interview-report-${new Date().toISOString().split("T")[0]}.csv`);
  link.style.visibility = "hidden";
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
  URL.revokeObjectURL(url);
}

/**
 * Export interview data as PDF file
 */
export function exportInterviewDataAsPDF(data: InterviewReportType[]): void {
  if (data.length === 0) {
    return;
  }

  const doc = new jsPDF();
  const margin = 20;
  let yPosition = margin;

  // Title
  doc.setFontSize(20);
  doc.setFont("helvetica", "bold");
  doc.text("AI Mock Interview Performance Report", margin, yPosition);
  yPosition += 15;

  // Generation date
  doc.setFontSize(10);
  doc.setFont("helvetica", "normal");
  doc.setTextColor(100, 100, 100);
  doc.text(
    `Generated on: ${new Date().toLocaleDateString("en-US", {
      year: "numeric",
      month: "long",
      day: "numeric",
    })}`,
    margin,
    yPosition
  );
  yPosition += 15;

  // Summary section
  const totalInterviews = data.length;
  const allRatings = data.flatMap((iv) => iv.questions.map((q) => q.rating));
  const avgRating =
    allRatings.length > 0
      ? allRatings.reduce((a, b) => a + b, 0) / allRatings.length
      : 0;
  const bestRating = allRatings.length > 0 ? Math.max(...allRatings) : 0;
  const worstRating = allRatings.length > 0 ? Math.min(...allRatings) : 0;

  doc.setFontSize(12);
  doc.setFont("helvetica", "bold");
  doc.setTextColor(0, 0, 0);
  doc.text("Summary", margin, yPosition);
  yPosition += 10;

  doc.setFontSize(10);
  doc.setFont("helvetica", "normal");
  doc.text(`Total Interviews: ${totalInterviews}`, margin + 5, yPosition);
  yPosition += 7;
  doc.text(`Average Rating: ${avgRating.toFixed(1)}/10`, margin + 5, yPosition);
  yPosition += 7;
  doc.text(`Best Rating: ${bestRating}/10`, margin + 5, yPosition);
  yPosition += 7;
  doc.text(`Worst Rating: ${worstRating}/10`, margin + 5, yPosition);
  yPosition += 15;

  // Table data
  const tableData: string[][] = [];

  for (const interview of data) {
    if (interview.questions.length === 0) {
      tableData.push([
        `${interview.position} (${interview.techStack})`,
        "No questions answered",
        "-",
        "-",
      ]);
    } else {
      for (const question of interview.questions) {
        tableData.push([
          `${interview.position} (${interview.techStack})`,
          question.question.length > 60
            ? question.question.substring(0, 57) + "..."
            : question.question,
          question.rating.toString(),
          question.feedback.length > 80
            ? question.feedback.substring(0, 77) + "..."
            : question.feedback,
        ]);
      }
    }
  }

  // Add table
  autoTable(doc, {
    startY: yPosition,
    head: [["Interview", "Question", "Rating", "Feedback"]],
    body: tableData,
    theme: "striped",
    headStyles: {
      fillColor: [59, 130, 246],
      textColor: 255,
      fontStyle: "bold",
    },
    styles: {
      fontSize: 8,
      cellPadding: 3,
    },
    columnStyles: {
      0: { cellWidth: 50 },
      1: { cellWidth: 60 },
      2: { cellWidth: 20 },
      3: { cellWidth: 60 },
    },
    margin: { left: margin, right: margin },
  });

  // Save PDF
  const finalY = (doc as unknown as { lastAutoTable?: { finalY?: number } }).lastAutoTable?.finalY || yPosition;
  if (finalY > doc.internal.pageSize.getHeight() - margin) {
    doc.addPage();
  }

  doc.save(`interview-report-${new Date().toISOString().split("T")[0]}.pdf`);
}

/**
 * Export cover letter as PDF
 */
export function exportCoverLetterAsPDF(content: string): void {
  if (!content.trim()) {
    return;
  }

  const doc = new jsPDF();
  const pageWidth = doc.internal.pageSize.getWidth();
  const pageHeight = doc.internal.pageSize.getHeight();
  const margin = 20;
  const maxWidth = pageWidth - 2 * margin;

  // Split content into lines that fit the page width
  const lines = doc.splitTextToSize(content, maxWidth);

  let yPosition = margin;

  // Add content line by line
  doc.setFontSize(11);
  doc.setFont("helvetica", "normal");

  for (const line of lines) {
    if (yPosition > pageHeight - margin - 10) {
      doc.addPage();
      yPosition = margin;
    }
    doc.text(line, margin, yPosition);
    yPosition += 7;
  }

  // Save PDF
  doc.save(`cover-letter-${new Date().toISOString().split("T")[0]}.pdf`);
}
