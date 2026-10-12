import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "My Work OS — Personal Work Management & Productivity Dashboard",
  description:
    "Personal command centre for a Product & Project Delivery Manager: manage daily work, projects, tasks, follow-ups, meetings, issues, daily logs, and professional achievements.",
  icons: {
    icon: [
      { url: '/logo.svg', type: 'image/svg+xml' },
      { url: '/icon.svg', type: 'image/svg+xml' },
    ],
    shortcut: '/logo.svg',
    apple: '/logo.svg',
  },
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en" className="h-full antialiased suppressHydrationWarning">
      <body className="min-h-full flex flex-col bg-slate-50 dark:bg-slate-950 text-slate-900 dark:text-slate-100 transition-colors">
        {children}
      </body>
    </html>
  );
}
