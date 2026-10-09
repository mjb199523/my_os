'use client';

import dynamic from 'next/dynamic';

const AppShell = dynamic(() => import('@/components/AppShell'), {
  ssr: false,
  loading: () => (
    <div className="min-h-screen bg-slate-50 dark:bg-slate-950 flex items-center justify-center">
      <div className="flex flex-col items-center space-y-3">
        <div className="w-10 h-10 rounded-xl bg-blue-600 flex items-center justify-center text-white font-bold text-sm animate-pulse shadow-md">
          OS
        </div>
        <p className="text-xs font-semibold text-slate-500 dark:text-slate-400">
          Loading My Work OS...
        </p>
      </div>
    </div>
  ),
});

export default function Home() {
  return <AppShell />;
}
