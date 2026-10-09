'use client';

import React, { useState, useMemo } from 'react';
import { useWorkOS } from '@/context/WorkOSContext';
import {
  ChevronLeft,
  ChevronRight,
  Calendar as CalendarIcon,
  CheckSquare,
  Video,
  UserCheck,
  Flag,
  Clock,
  X,
} from 'lucide-react';

export default function CalendarView() {
  const { tasks, meetings, followups, milestones, openQuickUpdate } = useWorkOS();

  const [currentDate, setCurrentDate] = useState(new Date());
  const [viewMode, setViewMode] = useState<'month' | 'week' | 'day'>('month');
  const [selectedDateStr, setSelectedDateStr] = useState<string>(
    new Date().toISOString().split('T')[0]
  );

  const year = currentDate.getFullYear();
  const month = currentDate.getMonth();

  // Navigation handlers
  const handlePrev = () => {
    if (viewMode === 'month') {
      setCurrentDate(new Date(year, month - 1, 1));
    } else if (viewMode === 'week') {
      const prev = new Date(currentDate);
      prev.setDate(prev.getDate() - 7);
      setCurrentDate(prev);
    } else {
      const prev = new Date(currentDate);
      prev.setDate(prev.getDate() - 1);
      setCurrentDate(prev);
    }
  };

  const handleNext = () => {
    if (viewMode === 'month') {
      setCurrentDate(new Date(year, month + 1, 1));
    } else if (viewMode === 'week') {
      const next = new Date(currentDate);
      next.setDate(next.getDate() + 7);
      setCurrentDate(next);
    } else {
      const next = new Date(currentDate);
      next.setDate(next.getDate() + 1);
      setCurrentDate(next);
    }
  };

  const handleToday = () => {
    const today = new Date();
    setCurrentDate(today);
    setSelectedDateStr(today.toISOString().split('T')[0]);
  };

  // Month grid calculations
  const monthDays = useMemo(() => {
    const firstDayIndex = new Date(year, month, 1).getDay(); // 0 is Sunday
    const totalDaysInMonth = new Date(year, month + 1, 0).getDate();
    const days: { dateStr: string; dayNum: number; isCurrentMonth: boolean }[] = [];

    // Prev month padding
    const prevMonthDays = new Date(year, month, 0).getDate();
    for (let i = firstDayIndex - 1; i >= 0; i--) {
      const d = prevMonthDays - i;
      const m = month === 0 ? 12 : month;
      const y = month === 0 ? year - 1 : year;
      const dateStr = `${y}-${String(m).padStart(2, '0')}-${String(d).padStart(2, '0')}`;
      days.push({ dateStr, dayNum: d, isCurrentMonth: false });
    }

    // Current month days
    for (let d = 1; d <= totalDaysInMonth; d++) {
      const dateStr = `${year}-${String(month + 1).padStart(2, '0')}-${String(d).padStart(2, '0')}`;
      days.push({ dateStr, dayNum: d, isCurrentMonth: true });
    }

    // Next month padding to fill 35 or 42 cells
    const remaining = 35 - (days.length % 35);
    if (remaining < 7 && remaining > 0) {
      for (let d = 1; d <= remaining; d++) {
        const m = month + 2 > 12 ? 1 : month + 2;
        const y = month + 2 > 12 ? year + 1 : year;
        const dateStr = `${y}-${String(m).padStart(2, '0')}-${String(d).padStart(2, '0')}`;
        days.push({ dateStr, dayNum: d, isCurrentMonth: false });
      }
    }

    return days;
  }, [year, month]);

  // Selected date events
  const selectedDateEvents = useMemo(() => {
    const dateTasks = tasks.filter((t) => t.due_date === selectedDateStr);
    const dateMeetings = meetings.filter((m) => m.meeting_date === selectedDateStr);
    const dateFollowups = followups.filter((f) => f.followup_date === selectedDateStr);
    const dateMilestones = milestones.filter((m) => m.due_date === selectedDateStr);

    return {
      tasks: dateTasks,
      meetings: dateMeetings,
      followups: dateFollowups,
      milestones: dateMilestones,
      totalCount:
        dateTasks.length + dateMeetings.length + dateFollowups.length + dateMilestones.length,
    };
  }, [selectedDateStr, tasks, meetings, followups, milestones]);

  const monthName = currentDate.toLocaleString('en-GB', { month: 'long', year: 'numeric' });

  return (
    <div className="space-y-6 max-w-7xl mx-auto pb-12">
      {/* Calendar Header */}
      <div className="flex flex-wrap items-center justify-between gap-4">
        <div>
          <h1 className="text-xl sm:text-2xl font-bold text-slate-900 dark:text-white tracking-tight">
            Schedule &amp; Calendar
          </h1>
          <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
            Synchronized view of task deadlines, meetings, follow-ups, and project milestones.
          </p>
        </div>

        <div className="flex items-center space-x-2">
          {/* View mode toggle */}
          <div className="flex rounded-lg border border-slate-200 dark:border-slate-800 p-0.5 bg-slate-50 dark:bg-slate-900 text-xs font-semibold">
            {(['month', 'week', 'day'] as const).map((mode) => (
              <button
                key={mode}
                onClick={() => setViewMode(mode)}
                className={`px-3 py-1 rounded-md capitalize transition-colors ${
                  viewMode === mode
                    ? 'bg-white dark:bg-slate-800 text-slate-900 dark:text-white shadow-2xs'
                    : 'text-slate-500 hover:text-slate-800 dark:hover:text-slate-300'
                }`}
              >
                {mode}
              </button>
            ))}
          </div>

          {/* Month Navigator */}
          <div className="flex items-center space-x-1">
            <button
              onClick={handlePrev}
              className="p-1.5 rounded-lg border border-slate-200 dark:border-slate-800 hover:bg-slate-100 dark:hover:bg-slate-800 text-slate-600 dark:text-slate-400"
            >
              <ChevronLeft className="w-4 h-4" />
            </button>
            <button
              onClick={handleToday}
              className="px-3 py-1.5 text-xs font-semibold rounded-lg border border-slate-200 dark:border-slate-800 hover:bg-slate-100 dark:hover:bg-slate-800 text-slate-700 dark:text-slate-300"
            >
              Today
            </button>
            <button
              onClick={handleNext}
              className="p-1.5 rounded-lg border border-slate-200 dark:border-slate-800 hover:bg-slate-100 dark:hover:bg-slate-800 text-slate-600 dark:text-slate-400"
            >
              <ChevronRight className="w-4 h-4" />
            </button>
          </div>
        </div>
      </div>

      {/* Main Calendar + Inspector Layout */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Calendar Grid (2 Cols on lg) */}
        <div className="lg:col-span-2 bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-sm p-4 sm:p-5">
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-sm font-bold text-slate-900 dark:text-white">
              {monthName}
            </h2>
            {/* Visual Indicators Legend (Section 16) */}
            <div className="flex items-center space-x-3 text-[11px] font-medium text-slate-500">
              <span className="flex items-center space-x-1">
                <span className="w-2 h-2 rounded-full bg-blue-500" />
                <span>Tasks</span>
              </span>
              <span className="flex items-center space-x-1">
                <span className="w-2 h-2 rounded-full bg-purple-500" />
                <span>Meetings</span>
              </span>
              <span className="flex items-center space-x-1">
                <span className="w-2 h-2 rounded-full bg-amber-500" />
                <span>Follow-ups</span>
              </span>
              <span className="flex items-center space-x-1">
                <span className="w-2 h-2 rounded-full bg-emerald-500" />
                <span>Milestones</span>
              </span>
            </div>
          </div>

          {/* Weekday headers */}
          <div className="grid grid-cols-7 text-center text-[11px] font-semibold text-slate-400 mb-2">
            <span>Sun</span>
            <span>Mon</span>
            <span>Tue</span>
            <span>Wed</span>
            <span>Thu</span>
            <span>Fri</span>
            <span>Sat</span>
          </div>

          {/* Days Grid */}
          <div className="grid grid-cols-7 gap-1 sm:gap-2">
            {monthDays.map((day, idx) => {
              const isSelected = day.dateStr === selectedDateStr;
              const isToday = day.dateStr === new Date().toISOString().split('T')[0];

              const dayTasks = tasks.filter((t) => t.due_date === day.dateStr);
              const dayMeetings = meetings.filter((m) => m.meeting_date === day.dateStr);
              const dayFollowups = followups.filter((f) => f.followup_date === day.dateStr);
              const dayMilestones = milestones.filter((m) => m.due_date === day.dateStr);

              return (
                <div
                  key={idx}
                  onClick={() => setSelectedDateStr(day.dateStr)}
                  className={`
                    min-h-[75px] sm:min-h-[85px] p-1.5 sm:p-2 rounded-xl cursor-pointer transition-all border flex flex-col justify-between
                    ${
                      isSelected
                        ? 'border-blue-600 bg-blue-50/50 dark:bg-blue-950/30'
                        : isToday
                        ? 'border-blue-300 dark:border-blue-800 bg-slate-50 dark:bg-slate-800/40'
                        : 'border-slate-100 dark:border-slate-800/60 hover:bg-slate-50 dark:hover:bg-slate-800/30'
                    }
                    ${!day.isCurrentMonth ? 'opacity-40' : 'opacity-100'}
                  `}
                >
                  <div className="flex items-center justify-between">
                    <span
                      className={`text-xs font-bold ${
                        isToday
                          ? 'w-5 h-5 rounded-full bg-blue-600 text-white flex items-center justify-center text-[10px]'
                          : 'text-slate-800 dark:text-slate-200'
                      }`}
                    >
                      {day.dayNum}
                    </span>
                  </div>

                  {/* Indicators */}
                  <div className="space-y-1 mt-1">
                    {dayTasks.length > 0 && (
                      <div className="h-1.5 rounded-full bg-blue-500 truncate" title={`${dayTasks.length} Tasks`} />
                    )}
                    {dayMeetings.length > 0 && (
                      <div className="h-1.5 rounded-full bg-purple-500 truncate" title={`${dayMeetings.length} Meetings`} />
                    )}
                    {dayFollowups.length > 0 && (
                      <div className="h-1.5 rounded-full bg-amber-500 truncate" title={`${dayFollowups.length} Follow-ups`} />
                    )}
                    {dayMilestones.length > 0 && (
                      <div className="h-1.5 rounded-full bg-emerald-500 truncate" title={`${dayMilestones.length} Milestones`} />
                    )}
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        {/* Selected Date Activity Inspector Sidebar (Section 16) */}
        <div className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-sm p-5 space-y-4">
          <div>
            <span className="text-[10px] font-bold uppercase tracking-wider text-blue-600 dark:text-blue-400">
              Selected Date
            </span>
            <h3 className="text-base font-bold text-slate-900 dark:text-white">
              {new Date(selectedDateStr).toLocaleDateString('en-GB', {
                weekday: 'long',
                day: '2-digit',
                month: 'long',
                year: 'numeric',
              })}
            </h3>
            <p className="text-[11px] text-slate-500">
              {selectedDateEvents.totalCount} scheduled activities
            </p>
          </div>

          <div className="space-y-3 max-h-[500px] overflow-y-auto divide-y divide-slate-100 dark:divide-slate-800">
            {selectedDateEvents.totalCount === 0 ? (
              <p className="text-xs text-slate-400 py-8 text-center">
                No items scheduled for this day.
              </p>
            ) : (
              <>
                {/* Tasks */}
                {selectedDateEvents.tasks.map((task) => (
                  <div
                    key={task.id}
                    onClick={() => openQuickUpdate(task)}
                    className="pt-2 cursor-pointer group"
                  >
                    <div className="flex items-center space-x-1.5 text-xs font-semibold text-blue-600 dark:text-blue-400">
                      <CheckSquare className="w-3.5 h-3.5" />
                      <span>Task: {task.title}</span>
                    </div>
                    <p className="text-[11px] text-slate-500 dark:text-slate-400 ml-5">
                      {task.status} • {task.priority} Priority • {task.progress}%
                    </p>
                  </div>
                ))}

                {/* Meetings */}
                {selectedDateEvents.meetings.map((mtg) => (
                  <div key={mtg.id} className="pt-2">
                    <div className="flex items-center space-x-1.5 text-xs font-semibold text-purple-600 dark:text-purple-400">
                      <Video className="w-3.5 h-3.5" />
                      <span>Meeting: {mtg.title}</span>
                    </div>
                    <p className="text-[11px] text-slate-500 dark:text-slate-400 ml-5">
                      {mtg.start_time} - {mtg.end_time} ({mtg.participants})
                    </p>
                  </div>
                ))}

                {/* Follow-ups */}
                {selectedDateEvents.followups.map((fol) => (
                  <div key={fol.id} className="pt-2">
                    <div className="flex items-center space-x-1.5 text-xs font-semibold text-amber-600 dark:text-amber-400">
                      <UserCheck className="w-3.5 h-3.5" />
                      <span>Follow-up: {fol.person}</span>
                    </div>
                    <p className="text-[11px] text-slate-500 dark:text-slate-400 ml-5">
                      {fol.topic} ({fol.status})
                    </p>
                  </div>
                ))}

                {/* Milestones */}
                {selectedDateEvents.milestones.map((m) => (
                  <div key={m.id} className="pt-2">
                    <div className="flex items-center space-x-1.5 text-xs font-semibold text-emerald-600 dark:text-emerald-400">
                      <Flag className="w-3.5 h-3.5" />
                      <span>Milestone: {m.title}</span>
                    </div>
                    <p className="text-[11px] text-slate-500 dark:text-slate-400 ml-5">
                      Status: {m.status}
                    </p>
                  </div>
                ))}
              </>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
