import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "Nexus OS — High-Output Personal Command Centre",
  description:
    "Intelligent command centre for Product & Project Delivery Managers: manage daily work, projects, tasks, follow-ups, meetings, issues, daily logs, and achievements.",
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
