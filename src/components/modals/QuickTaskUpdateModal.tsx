'use client';

import React, { useState, useEffect } from 'react';
import { useWorkOS } from '@/context/WorkOSContext';
import { TaskStatus } from '@/types';
import { X, Check, Clock, ArrowRight } from 'lucide-react';

export default function QuickTaskUpdateModal() {
  const { quickUpdateTask, closeQuickUpdate, submitTaskUpdate } = useWorkOS();

  const [status, setStatus] = useState<TaskStatus>('In Progress');
  const [progress, setProgress] = useState<number>(0);
  const [updateText, setUpdateText] = useState<string>('');
  const [nextAction, setNextAction] = useState<string>('');
  const [nextFollowupDate, setNextFollowupDate] = useState<string>('');
  const [notes, setNotes] = useState<string>('');

  useEffect(() => {
    if (quickUpdateTask) {
      setStatus(quickUpdateTask.status);
      setProgress(quickUpdateTask.progress);
      setUpdateText('');
      setNextAction(quickUpdateTask.next_action || '');
      setNextFollowupDate(new Date(Date.now() + 86400000).toISOString().split('T')[0]);
      setNotes(quickUpdateTask.notes || '');
    }
  }, [quickUpdateTask]);

  if (!quickUpdateTask) return null;

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!updateText.trim()) {
      alert('Please enter a brief note for Today\'s Update.');
      return;
    }
    submitTaskUpdate(quickUpdateTask.id, {
      status,
      progress,
      updateText: updateText.trim(),
      nextAction: nextAction.trim() || undefined,
      nextFollowupDate: nextFollowupDate || undefined,
      notes: notes.trim() || undefined,
    });
    closeQuickUpdate();
  };

  const statuses: TaskStatus[] = [
    'To Do',
    'In Progress',
    'Waiting',
    'Blocked',
    'Done',
    'Cancelled',
  ];

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-sm animate-in fade-in duration-150">
      <div className="w-full max-w-lg bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-2xl overflow-hidden flex flex-col">
        {/* Header */}
        <div className="px-6 py-4 border-b border-slate-200 dark:border-slate-800 flex items-center justify-between">
          <div>
            <span className="text-[11px] font-semibold uppercase tracking-wider text-blue-600 dark:text-blue-400">
              Quick Task Update
            </span>
            <h2 className="text-base font-bold text-slate-900 dark:text-white truncate">
              {quickUpdateTask.title}
            </h2>
          </div>
          <button
            onClick={closeQuickUpdate}
            className="p-1.5 rounded-lg text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Form Body */}
        <form onSubmit={handleSubmit} className="p-6 space-y-4 overflow-y-auto max-h-[80vh]">
          {/* Status & Progress */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1.5">
                Status
              </label>
              <select
                value={status}
                onChange={(e) => {
                  const newStatus = e.target.value as TaskStatus;
                  setStatus(newStatus);
                  if (newStatus === 'Done') setProgress(100);
                }}
                className="w-full px-3 py-2 text-sm rounded-lg bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-blue-500"
              >
                {statuses.map((s) => (
                  <option key={s} value={s}>
                    {s}
                  </option>
                ))}
              </select>
            </div>

            <div>
              <div className="flex items-center justify-between mb-1.5">
                <label className="text-xs font-semibold text-slate-700 dark:text-slate-300">
                  Progress %
                </label>
                <span className="text-xs font-bold text-blue-600 dark:text-blue-400">
                  {progress}%
                </span>
              </div>
              <input
                type="range"
                min="0"
                max="100"
                step="5"
                value={progress}
                onChange={(e) => setProgress(Number(e.target.value))}
                className="w-full accent-blue-600 cursor-pointer h-2 bg-slate-200 dark:bg-slate-700 rounded-lg"
              />
            </div>
          </div>

          {/* Today's Update */}
          <div>
            <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1.5">
              Today&apos;s Update <span className="text-red-500">*</span>
            </label>
            <textarea
              required
              rows={2}
              value={updateText}
              onChange={(e) => setUpdateText(e.target.value)}
              placeholder="e.g. UAT completed. Waiting for production deployment."
              className="w-full px-3 py-2 text-sm rounded-lg bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-blue-500 resize-none placeholder:text-slate-400"
            />
          </div>

          {/* Next Action & Next Follow-up Date */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1.5">
                Next Action
              </label>
              <input
                type="text"
                value={nextAction}
                onChange={(e) => setNextAction(e.target.value)}
                placeholder="e.g. Follow up with Data Engineering"
                className="w-full px-3 py-2 text-sm rounded-lg bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-blue-500 placeholder:text-slate-400"
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1.5">
                Next Follow-up Date
              </label>
              <input
                type="date"
                value={nextFollowupDate}
                onChange={(e) => setNextFollowupDate(e.target.value)}
                className="w-full px-3 py-2 text-sm rounded-lg bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
            </div>
          </div>

          {/* Notes */}
          <div>
            <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1.5">
              Notes
            </label>
            <input
              type="text"
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
              placeholder="Any additional context, caveats, or links"
              className="w-full px-3 py-2 text-sm rounded-lg bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-blue-500 placeholder:text-slate-400"
            />
          </div>

          {/* Action Buttons */}
          <div className="pt-2 flex items-center justify-end space-x-3">
            <button
              type="button"
              onClick={closeQuickUpdate}
              className="px-4 py-2 text-xs font-semibold text-slate-600 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800 rounded-lg transition-colors"
            >
              Cancel
            </button>
            <button
              type="submit"
              className="px-5 py-2 text-xs font-semibold text-white bg-blue-600 hover:bg-blue-700 rounded-lg shadow-sm transition-all flex items-center space-x-1.5"
            >
              <Check className="w-3.5 h-3.5" />
              <span>Save Update</span>
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
