'use client';

import React from 'react';
import { useWorkOS } from '@/context/WorkOSContext';
import { X, Clock, Calendar, ArrowRight, User } from 'lucide-react';

export default function TaskHistoryModal() {
  const { historyTask, closeHistory, taskUpdates } = useWorkOS();

  if (!historyTask) return null;

  // Filter updates for this task and sort newest first
  const updates = taskUpdates
    .filter((u) => u.task_id === historyTask.id)
    .sort((a, b) => new Date(b.created_at).getTime() - new Date(a.created_at).getTime());

  const formatDate = (isoString: string) => {
    try {
      const date = new Date(isoString);
      return date.toLocaleDateString('en-GB', {
        day: '2-digit',
        month: 'short',
        hour: '2-digit',
        minute: '2-digit',
        hour12: true,
      });
    } catch {
      return isoString;
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-sm animate-in fade-in duration-150">
      <div className="w-full max-w-lg bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-2xl overflow-hidden flex flex-col">
        {/* Header */}
        <div className="px-6 py-4 border-b border-slate-200 dark:border-slate-800 flex items-center justify-between">
          <div>
            <span className="text-[11px] font-semibold uppercase tracking-wider text-blue-600 dark:text-blue-400">
              Task Activity History
            </span>
            <h2 className="text-base font-bold text-slate-900 dark:text-white truncate">
              {historyTask.title}
            </h2>
          </div>
          <button
            onClick={closeHistory}
            className="p-1.5 rounded-lg text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Timeline Body */}
        <div className="p-6 overflow-y-auto max-h-[70vh]">
          {updates.length === 0 ? (
            <div className="text-center py-8 text-slate-400 text-xs">
              No previous updates recorded for this task yet.
            </div>
          ) : (
            <div className="relative border-l border-slate-200 dark:border-slate-800 ml-3.5 space-y-6">
              {updates.map((update, idx) => (
                <div key={update.id} className="relative pl-6">
                  {/* Timeline point */}
                  <span className="absolute -left-1.5 top-1.5 w-3 h-3 rounded-full border-2 border-white dark:border-slate-900 bg-blue-600 dark:bg-blue-400" />

                  {/* Header info */}
                  <div className="flex items-center space-x-2 text-xs text-slate-500 dark:text-slate-400 mb-1">
                    <span className="font-semibold text-slate-900 dark:text-slate-200">
                      {formatDate(update.created_at)}
                    </span>
                    <span>•</span>
                    <span className="flex items-center space-x-1 text-slate-600 dark:text-slate-300 font-medium">
                      <User className="w-3 h-3" />
                      <span>{update.author_name || 'Manash'}</span>
                    </span>
                    <span>•</span>
                    <span className="px-1.5 py-0.5 rounded bg-slate-100 dark:bg-slate-800 text-[10px] font-bold text-slate-700 dark:text-slate-300">
                      {update.status} ({update.progress}%)
                    </span>
                  </div>

                  {/* Update Text */}
                  <div className="p-3 rounded-xl bg-slate-50 dark:bg-slate-800/60 border border-slate-200/70 dark:border-slate-800 text-xs text-slate-800 dark:text-slate-200">
                    <p className="font-medium whitespace-pre-wrap">{update.update_text}</p>

                    {update.next_action && (
                      <div className="mt-2 pt-2 border-t border-slate-200 dark:border-slate-700/60 flex items-center space-x-1.5 text-[11px] text-blue-600 dark:text-blue-400 font-medium">
                        <ArrowRight className="w-3 h-3 shrink-0" />
                        <span>Next: {update.next_action}</span>
                      </div>
                    )}
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="px-6 py-3 border-t border-slate-200 dark:border-slate-800 flex justify-end">
          <button
            onClick={closeHistory}
            className="px-4 py-2 text-xs font-semibold text-slate-600 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800 rounded-lg transition-colors"
          >
            Close
          </button>
        </div>
      </div>
    </div>
  );
}
