'use client';

import React, { useState, useEffect } from 'react';
import { useWorkOS } from '@/context/WorkOSContext';
import { DailyLog } from '@/types';
import {
  BookOpenText,
  Sparkles,
  Save,
  Calendar,
  CheckCircle2,
  Clock,
  Users,
  AlertOctagon,
  ChevronLeft,
  ChevronRight,
} from 'lucide-react';

export default function WorkLogView() {
  const { dailyLogs, saveDailyLog, generateTodaySummary, tasks, meetings, followups } =
    useWorkOS();

  const todayStr = new Date().toISOString().split('T')[0];
  const [selectedDate, setSelectedDate] = useState<string>(todayStr);

  const existingLog = dailyLogs.find((l) => l.log_date === selectedDate);

  // Form states
  const [workedOn, setWorkedOn] = useState('');
  const [completed, setCompleted] = useState('');
  const [pending, setPending] = useState('');
  const [blocked, setBlocked] = useState('');
  const [decisions, setDecisions] = useState('');
  const [people, setPeople] = useState('');
  const [summary, setSummary] = useState('');
  const [notes, setNotes] = useState('');
  const [isSavedMessage, setIsSavedMessage] = useState(false);

  useEffect(() => {
    if (existingLog) {
      setWorkedOn(existingLog.worked_on || '');
      setCompleted(existingLog.completed || '');
      setPending(existingLog.pending || '');
      setBlocked(existingLog.blocked || '');
      setDecisions(existingLog.decisions || '');
      setPeople(existingLog.people_coordinated || '');
      setSummary(existingLog.summary || '');
      setNotes(existingLog.notes || '');
    } else {
      setWorkedOn('');
      setCompleted('');
      setPending('');
      setBlocked('');
      setDecisions('');
      setPeople('');
      setSummary('');
      setNotes('');
    }
  }, [selectedDate, existingLog]);

  const handleGenerateSummary = () => {
    const generated = generateTodaySummary(selectedDate);
    setWorkedOn(generated.worked_on);
    setCompleted(generated.completed);
    setPending(generated.pending);
    setBlocked(generated.blocked);
    setPeople(generated.people_coordinated);
    setSummary(generated.summary);
  };

  const handleSave = (e: React.FormEvent) => {
    e.preventDefault();
    saveDailyLog({
      log_date: selectedDate,
      worked_on: workedOn,
      completed,
      pending,
      blocked,
      decisions,
      people_coordinated: people,
      summary,
      notes,
    });
    setIsSavedMessage(true);
    setTimeout(() => setIsSavedMessage(false), 2500);
  };

  // Day step navigation
  const stepDate = (days: number) => {
    const d = new Date(selectedDate);
    d.setDate(d.getDate() + days);
    setSelectedDate(d.toISOString().split('T')[0]);
  };

  return (
    <div className="space-y-6 max-w-7xl mx-auto pb-12">
      {/* Header & Date Selector */}
      <div className="flex flex-wrap items-center justify-between gap-4">
        <div>
          <h1 className="text-xl sm:text-2xl font-bold text-slate-900 dark:text-white tracking-tight">
            Daily Work Log
          </h1>
          <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
            Your personal record of engineering coordination, decisions, and deliverables.
          </p>
        </div>

        <div className="flex items-center space-x-2">
          <div className="flex items-center space-x-1 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl p-1 shadow-2xs">
            <button
              onClick={() => stepDate(-1)}
              className="p-1 text-slate-500 hover:text-slate-800 dark:hover:text-slate-200"
              title="Previous Day"
            >
              <ChevronLeft className="w-4 h-4" />
            </button>
            <input
              type="date"
              value={selectedDate}
              onChange={(e) => setSelectedDate(e.target.value)}
              className="px-2 py-0.5 text-xs font-semibold text-slate-800 dark:text-white bg-transparent border-0 focus:outline-none"
            />
            <button
              onClick={() => stepDate(1)}
              className="p-1 text-slate-500 hover:text-slate-800 dark:hover:text-slate-200"
              title="Next Day"
            >
              <ChevronRight className="w-4 h-4" />
            </button>
          </div>

          <button
            onClick={() => setSelectedDate(todayStr)}
            className="px-3 py-1.5 text-xs font-semibold rounded-xl bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300 hover:bg-slate-200 transition-colors"
          >
            Today
          </button>
        </div>
      </div>

      {/* Main Work Log Form */}
      <form onSubmit={handleSave} className="space-y-6">
        <div className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 p-6 shadow-sm space-y-5">
          {/* Top Actions Bar */}
          <div className="flex flex-wrap items-center justify-between gap-3 pb-4 border-b border-slate-100 dark:border-slate-800">
            <div className="flex items-center space-x-2">
              <span className="text-xs font-bold uppercase tracking-wider text-slate-500">
                Log for {new Date(selectedDate).toLocaleDateString('en-GB', { weekday: 'long', day: '2-digit', month: 'long', year: 'numeric' })}
              </span>
            </div>

            <div className="flex items-center space-x-3">
              <button
                type="button"
                onClick={handleGenerateSummary}
                className="inline-flex items-center space-x-1.5 px-3.5 py-1.5 text-xs font-semibold rounded-xl bg-indigo-50 hover:bg-indigo-100 text-indigo-700 dark:bg-indigo-950/40 dark:hover:bg-indigo-950/70 dark:text-indigo-300 border border-indigo-200 dark:border-indigo-800 transition-colors"
              >
                <Sparkles className="w-3.5 h-3.5" />
                <span>Generate Today&apos;s Summary</span>
              </button>

              <button
                type="submit"
                className="inline-flex items-center space-x-1.5 px-4 py-1.5 text-xs font-semibold rounded-xl bg-blue-600 hover:bg-blue-700 text-white shadow-sm transition-all"
              >
                <Save className="w-3.5 h-3.5" />
                <span>{isSavedMessage ? 'Saved Successfully ✓' : 'Save Work Log'}</span>
              </button>
            </div>
          </div>

          {/* Section 18 fields */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
            {/* What did I work on? */}
            <div>
              <label className="block text-xs font-bold text-slate-800 dark:text-slate-200 mb-1.5">
                What did I work on?
              </label>
              <textarea
                rows={3}
                value={workedOn}
                onChange={(e) => setWorkedOn(e.target.value)}
                placeholder="• Stand-up sync with backend team&#10;• Review of IDP aggregation queries..."
                className="w-full px-3 py-2 text-xs rounded-xl bg-slate-50 dark:bg-slate-800/60 border border-slate-200 dark:border-slate-700 text-slate-900 dark:text-white font-mono"
              />
            </div>

            {/* What did I complete? */}
            <div>
              <label className="block text-xs font-bold text-slate-800 dark:text-slate-200 mb-1.5">
                What did I complete?
              </label>
              <textarea
                rows={3}
                value={completed}
                onChange={(e) => setCompleted(e.target.value)}
                placeholder="• UAT test sign-off documentation&#10;• Live Report Bot morning deployment..."
                className="w-full px-3 py-2 text-xs rounded-xl bg-slate-50 dark:bg-slate-800/60 border border-slate-200 dark:border-slate-700 text-slate-900 dark:text-white font-mono"
              />
            </div>

            {/* What is pending? */}
            <div>
              <label className="block text-xs font-bold text-slate-800 dark:text-slate-200 mb-1.5">
                What is pending?
              </label>
              <textarea
                rows={3}
                value={pending}
                onChange={(e) => setPending(e.target.value)}
                placeholder="• Shiksha Setu team confirmation on UUID schema&#10;• Friday progress summary email..."
                className="w-full px-3 py-2 text-xs rounded-xl bg-slate-50 dark:bg-slate-800/60 border border-slate-200 dark:border-slate-700 text-slate-900 dark:text-white font-mono"
              />
            </div>

            {/* What was blocked? */}
            <div>
              <label className="block text-xs font-bold text-slate-800 dark:text-slate-200 mb-1.5">
                What was blocked?
              </label>
              <textarea
                rows={3}
                value={blocked}
                onChange={(e) => setBlocked(e.target.value)}
                placeholder="• Database connection pool limit saturation..."
                className="w-full px-3 py-2 text-xs rounded-xl bg-slate-50 dark:bg-slate-800/60 border border-slate-200 dark:border-slate-700 text-slate-900 dark:text-white font-mono"
              />
            </div>

            {/* Important decisions */}
            <div>
              <label className="block text-xs font-bold text-slate-800 dark:text-slate-200 mb-1.5">
                Important Decisions
              </label>
              <textarea
                rows={3}
                value={decisions}
                onChange={(e) => setDecisions(e.target.value)}
                placeholder="• Freeze Registry migration until Tuesday to avoid weekend data risk..."
                className="w-full px-3 py-2 text-xs rounded-xl bg-slate-50 dark:bg-slate-800/60 border border-slate-200 dark:border-slate-700 text-slate-900 dark:text-white font-mono"
              />
            </div>

            {/* People I coordinated with */}
            <div>
              <label className="block text-xs font-bold text-slate-800 dark:text-slate-200 mb-1.5">
                People I Coordinated With
              </label>
              <textarea
                rows={3}
                value={people}
                onChange={(e) => setPeople(e.target.value)}
                placeholder="Pranjal (DE Lead), Baruah (Shiksha Setu), State Director..."
                className="w-full px-3 py-2 text-xs rounded-xl bg-slate-50 dark:bg-slate-800/60 border border-slate-200 dark:border-slate-700 text-slate-900 dark:text-white font-mono"
              />
            </div>
          </div>

          {/* Section 19: End-of-Day Executive Summary */}
          <div className="pt-4 border-t border-slate-100 dark:border-slate-800">
            <label className="block text-xs font-bold text-slate-800 dark:text-slate-200 mb-1.5">
              End-of-Day Executive Summary (Daily Stand-up &amp; Leadership Digest)
            </label>
            <textarea
              rows={3}
              value={summary}
              onChange={(e) => setSummary(e.target.value)}
              placeholder="High-level narrative summary of key milestones achieved today..."
              className="w-full px-3 py-2 text-xs rounded-xl bg-slate-50 dark:bg-slate-800/60 border border-slate-200 dark:border-slate-700 text-slate-900 dark:text-white font-sans"
            />
          </div>
        </div>
      </form>
    </div>
  );
}
