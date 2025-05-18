import { clsx, type ClassValue } from "clsx";
import { twMerge } from "tailwind-merge";
import { format } from "date-fns";

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

export const exportSessionAsText = (
  sessionGoals,
  messages,
  sessionTheme,
  sessionDate,
  sessionNotes
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
