import { clsx, type ClassValue } from "clsx";
import { twMerge } from "tailwind-merge";
import { format } from "date-fns";

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

export const exportSessionAsText = (
  sessionGoals: string[],
  messages: any[],
  sessionTheme: string,
  sessionDate: Date,
  sessionNotes: string
) => {
  if (messages.length === 0) return;

  let content = `# ${sessionTheme || "Therapy Session"}\n`;
  content += `Date: ${format(sessionDate, "PPP")}\n\n`;

  if (sessionNotes) {
    content += `## Session Notes\n${sessionNotes}\n\n`;
  }

  if (sessionGoals.length > 0) {
    content += "## Session Goals\n";
    sessionGoals.forEach((goal, index) => {
      content += `${index + 1}. ${goal}\n`;
    });
    content += "\n";
  }

  content += "## Conversation\n\n";
  messages.forEach((msg) => {
    const sender = msg.sender === "user" ? "You" : "AI Therapist";
    content += `**${sender}**: ${msg.text}\n\n`;
  });

  const blob = new Blob([content], { type: "text/plain" });
  const url = URL.createObjectURL(blob);
  const a = document.createElement("a");
  a.href = url;
  a.download = `therapy-session-${format(sessionDate, "yyyy-MM-dd")}.txt`;
  document.body.appendChild(a);
  a.click();
  document.body.removeChild(a);
  URL.revokeObjectURL(url);
};

export const exportSessionAsPDF = async (
  sessionTheme: string,
  sessionDate: Date,
  sessionGoals: string[],
  sessionNotes: string,
  messages: any[]
) => {
  //  importing dynamically to avoid SSR issues
  const jsPDF = (await import("jspdf")).default;

  const doc = new jsPDF({
    orientation: "portrait",
    unit: "mm",
    format: "a4",
  });

  const pageWidth = doc.internal.pageSize.getWidth();
  const pageHeight = doc.internal.pageSize.getHeight();
  const margin = 20;
  const lineHeight = 7;
  let yPosition = margin;

  // Helper function to add a new page if needed
  const checkPageBreak = (requiredSpace: number) => {
    if (yPosition + requiredSpace > pageHeight - margin) {
      doc.addPage();
      yPosition = margin;
      return true;
    }
    return false;
  };

  // Helper function to wrap text
  const wrapText = (text: string, maxWidth: number) => {
    return doc.splitTextToSize(text, maxWidth);
  };

  // Header
  doc.setFontSize(24);
  doc.setFont("helvetica", "bold");
  doc.setTextColor(41, 128, 185); // Primary blue color
  doc.text("SolaceHub Therapy Session Report", margin, yPosition);
  yPosition += 15;

  // Underline
  doc.setDrawColor(41, 128, 185);
  doc.setLineWidth(0.5);
  doc.line(margin, yPosition, pageWidth - margin, yPosition);
  yPosition += 10;

  // Session Title
  doc.setFontSize(18);
  doc.setFont("helvetica", "bold");
  doc.setTextColor(0, 0, 0);
  doc.text(sessionTheme || "Untitled Session", margin, yPosition);
  yPosition += 10;

  // Session Date and Time
  doc.setFontSize(12);
  doc.setFont("helvetica", "normal");
  doc.setTextColor(100, 100, 100);
  doc.text(`Date: ${format(sessionDate, "PPP")}`, margin, yPosition);
  yPosition += 6;
  doc.text(`Time: ${format(sessionDate, "p")}`, margin, yPosition);
  yPosition += 15;

  // Session Goals Section
  if (sessionGoals.length > 0) {
    checkPageBreak(20);
    doc.setFontSize(16);
    doc.setFont("helvetica", "bold");
    doc.setTextColor(0, 0, 0);
    doc.text("Session Goals", margin, yPosition);
    yPosition += 8;

    doc.setFontSize(11);
    doc.setFont("helvetica", "normal");
    sessionGoals.forEach((goal, index) => {
      checkPageBreak(8);
      doc.text(`${index + 1}. ${goal}`, margin + 5, yPosition);
      yPosition += 6;
    });
    yPosition += 10;
  }

  // Session Notes Section
  if (sessionNotes.trim()) {
    checkPageBreak(20);
    doc.setFontSize(16);
    doc.setFont("helvetica", "bold");
    doc.setTextColor(0, 0, 0);
    doc.text("Session Notes", margin, yPosition);
    yPosition += 8;

    doc.setFontSize(11);
    doc.setFont("helvetica", "normal");
    const wrappedNotes = wrapText(sessionNotes, pageWidth - 2 * margin);
    wrappedNotes.forEach((line: string) => {
      checkPageBreak(6);
      doc.text(line, margin, yPosition);
      yPosition += 5;
    });
    yPosition += 15;
  }

  // Conversation Section
  if (messages.length > 0) {
    checkPageBreak(20);
    doc.setFontSize(16);
    doc.setFont("helvetica", "bold");
    doc.setTextColor(0, 0, 0);
    doc.text("Session Conversation", margin, yPosition);
    yPosition += 10;

    // Filter out system messages and format conversation
    const conversationMessages = messages.filter(
      (msg) => msg.sender && msg.text && msg.text.trim() !== ""
    );

    conversationMessages.forEach((message, index) => {
      // Check if we need a new page for this message
      const estimatedHeight = 15 + (message.text.length / 80) * 5; // Rough estimate
      checkPageBreak(estimatedHeight);

      // Sender label
      doc.setFontSize(12);
      doc.setFont("helvetica", "bold");

      if (message.sender === "user") {
        doc.setTextColor(34, 139, 34);
        doc.text("You:", margin, yPosition);
      } else {
        doc.setTextColor(41, 128, 185);
        doc.text("AI Therapist:", margin, yPosition);
      }

      yPosition += 7;

      // Message content
      doc.setFontSize(10);
      doc.setFont("helvetica", "normal");
      doc.setTextColor(0, 0, 0);

      const wrappedMessage = wrapText(message.text, pageWidth - 2 * margin - 5);
      wrappedMessage.forEach((line: string) => {
        checkPageBreak(5);
        doc.text(line, margin + 5, yPosition);
        yPosition += 4.5;
      });

      yPosition += 8;
    });
  }

  // Footer
  const totalPages = doc.getNumberOfPages();
  for (let i = 1; i <= totalPages; i++) {
    doc.setPage(i);
    doc.setFontSize(9);
    doc.setFont("helvetica", "normal");
    doc.setTextColor(150, 150, 150);
    doc.text(
      `Generated by SolaceHub - Page ${i} of ${totalPages}`,
      pageWidth / 2,
      pageHeight - 10,
      { align: "center" }
    );
    doc.text(format(new Date(), "PPpp"), pageWidth - margin, pageHeight - 10, {
      align: "right",
    });
  }

  const fileName = `SolaceHub_Session_${format(sessionDate, "yyyy-MM-dd")}.pdf`;
  doc.save(fileName);
};

export const getTimeOfDay = () => {
  const hour = new Date().getHours();
  if (hour < 12) return "morning";
  if (hour < 18) return "afternoon";
  return "evening";
};

export const getMoodStatus = (userData) => {
  if (!userData.lastMood)
    return {
      color: "bg-gray-100",
      text: "No data",
      textColor: "text-gray-600",
    };

  const mood = userData.lastMood.mood.toLowerCase();
  if (mood.includes("great") || mood.includes("good")) {
    return {
      color: "bg-green-100",
      text: "Positive",
      textColor: "text-green-700",
    };
  } else if (mood.includes("okay")) {
    return {
      color: "bg-blue-100",
      text: "Stable",
      textColor: "text-blue-700",
    };
  } else {
    return {
      color: "bg-orange-100",
      text: "Needs Attention",
      textColor: "text-orange-700",
    };
  }
};
