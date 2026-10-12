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
  Plus,
} from 'lucide-react';

export default function CalendarView() {
  const { tasks, meetings, followups, milestones, openQuickUpdate, openQuickAdd } = useWorkOS();

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
      setSelectedDateStr(prev.toISOString().split('T')[0]);
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
      setSelectedDateStr(next.toISOString().split('T')[0]);
    }
  };

  const handleToday = () => {
    const today = new Date();
    setCurrentDate(today);
    setSelectedDateStr(today.toISOString().split('T')[0]);
  };

  // Month grid calculations
  const monthDays = useMemo(() => {
    const firstDayIndex = new Date(year, month, 1).getDay();
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

  // Week days calculation (7 days of currently viewed week)
  const weekDays = useMemo(() => {
    const startOfWeek = new Date(currentDate);
    const day = startOfWeek.getDay();
    startOfWeek.setDate(startOfWeek.getDate() - day); // Sunday

    const days = [];
    for (let i = 0; i < 7; i++) {
      const d = new Date(startOfWeek);
      d.setDate(startOfWeek.getDate() + i);
      days.push({
        dateObj: d,
        dateStr: d.toISOString().split('T')[0],
        dayName: d.toLocaleDateString('en-GB', { weekday: 'short' }),
        dayNum: d.getDate(),
      });
    }
    return days;
  }, [currentDate]);

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
                    ? 'bg-white dark:bg-slate-800 text-slate-900 dark:text-white shadow-2xs font-bold'
                    : 'text-slate-500 hover:text-slate-800 dark:hover:text-slate-300'
                }`}
              >
                {mode}
              </button>
            ))}
          </div>

          {/* Navigator */}
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

      {/* Visual Indicators Legend */}
      <div className="flex flex-wrap items-center justify-between gap-3 bg-white dark:bg-slate-900 px-4 py-2.5 rounded-xl border border-slate-200 dark:border-slate-800 text-xs">
        <span className="font-bold text-slate-800 dark:text-white">{monthName}</span>
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

      {/* MONTH VIEW */}
      {viewMode === 'month' && (
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Calendar Grid */}
          <div className="lg:col-span-2 bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-sm p-4 sm:p-5">
            <div className="grid grid-cols-7 text-center text-[11px] font-semibold text-slate-400 mb-2">
              <span>Sun</span>
              <span>Mon</span>
              <span>Tue</span>
              <span>Wed</span>
              <span>Thu</span>
              <span>Fri</span>
              <span>Sat</span>
            </div>

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

                    <div className="space-y-1 mt-1">
                      {dayTasks.length > 0 && (
                        <div className="h-1.5 rounded-full bg-blue-500 truncate" />
                      )}
                      {dayMeetings.length > 0 && (
                        <div className="h-1.5 rounded-full bg-purple-500 truncate" />
                      )}
                      {dayFollowups.length > 0 && (
                        <div className="h-1.5 rounded-full bg-amber-500 truncate" />
                      )}
                      {dayMilestones.length > 0 && (
                        <div className="h-1.5 rounded-full bg-emerald-500 truncate" />
                      )}
                    </div>
                  </div>
                );
              })}
            </div>
          </div>

          {/* Selected Date Activity Inspector Sidebar */}
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
      )}

      {/* WEEK VIEW (DYNAMIC) */}
      {viewMode === 'week' && (
        <div className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 p-4 shadow-sm overflow-x-auto">
          <div className="grid grid-cols-7 gap-3 min-w-[700px]">
            {weekDays.map((day) => {
              const dayTasks = tasks.filter((t) => t.due_date === day.dateStr);
              const dayMeetings = meetings.filter((m) => m.meeting_date === day.dateStr);
              const dayFollowups = followups.filter((f) => f.followup_date === day.dateStr);
              const dayMilestones = milestones.filter((m) => m.due_date === day.dateStr);
              const isToday = day.dateStr === new Date().toISOString().split('T')[0];

              return (
                <div
                  key={day.dateStr}
                  className={`p-3 rounded-xl border flex flex-col min-h-[300px] ${
                    isToday
                      ? 'bg-blue-50/40 dark:bg-blue-950/20 border-blue-300 dark:border-blue-800'
                      : 'bg-slate-50/50 dark:bg-slate-800/40 border-slate-200/70 dark:border-slate-800'
                  }`}
                >
                  <div className="border-b border-slate-200 dark:border-slate-700/60 pb-2 mb-2 flex items-center justify-between">
                    <div>
                      <span className="text-[10px] font-bold text-slate-400 uppercase">
                        {day.dayName}
                      </span>
                      <p className={`text-base font-bold ${isToday ? 'text-blue-600 dark:text-blue-400' : 'text-slate-800 dark:text-slate-200'}`}>
                        {day.dayNum}
                      </p>
                    </div>
                  </div>

                  <div className="space-y-2 flex-1 overflow-y-auto text-xs">
                    {/* Meetings */}
                    {dayMeetings.map((m) => (
                      <div key={m.id} className="p-2 rounded-lg bg-purple-50 dark:bg-purple-950/60 border border-purple-200 dark:border-purple-800 text-purple-900 dark:text-purple-200">
                        <span className="text-[10px] font-bold block">{m.start_time}</span>
                        <p className="font-semibold truncate">{m.title}</p>
                      </div>
                    ))}

                    {/* Tasks */}
                    {dayTasks.map((t) => (
                      <div
                        key={t.id}
                        onClick={() => openQuickUpdate(t)}
                        className="p-2 rounded-lg bg-blue-50 dark:bg-blue-950/60 border border-blue-200 dark:border-blue-800 text-blue-900 dark:text-blue-200 cursor-pointer hover:border-blue-400"
                      >
                        <p className="font-semibold truncate">{t.title}</p>
                        <span className="text-[10px] opacity-80">{t.status} • {t.progress}%</span>
                      </div>
                    ))}

                    {/* Followups */}
                    {dayFollowups.map((f) => (
                      <div key={f.id} className="p-2 rounded-lg bg-amber-50 dark:bg-amber-950/60 border border-amber-200 dark:border-amber-800 text-amber-900 dark:text-amber-200">
                        <p className="font-semibold truncate">{f.person}</p>
                        <span className="text-[10px] opacity-80">{f.topic}</span>
                      </div>
                    ))}

                    {/* Milestones */}
                    {dayMilestones.map((ms) => (
                      <div key={ms.id} className="p-2 rounded-lg bg-emerald-50 dark:bg-emerald-950/60 border border-emerald-200 dark:border-emerald-800 text-emerald-900 dark:text-emerald-200">
                        <span className="text-[10px] font-bold block">Milestone</span>
                        <p className="font-semibold truncate">{ms.title}</p>
                      </div>
                    ))}
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      )}

      {/* DAY VIEW (DYNAMIC) */}
      {viewMode === 'day' && (
        <div className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 p-6 shadow-sm space-y-4">
          <div className="flex items-center justify-between pb-3 border-b border-slate-100 dark:border-slate-800">
            <div>
              <h2 className="text-lg font-bold text-slate-900 dark:text-white">
                Schedule for {new Date(selectedDateStr).toLocaleDateString('en-GB', { weekday: 'long', day: '2-digit', month: 'long', year: 'numeric' })}
              </h2>
              <p className="text-xs text-slate-500">
                Hourly agenda, deliverable deadlines, and action items.
              </p>
            </div>
            <button
              onClick={() => openQuickAdd('meeting')}
              className="px-3 py-1.5 text-xs font-semibold rounded-lg bg-blue-600 text-white"
            >
              + Meeting
            </button>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {/* Meetings Column */}
            <div className="space-y-3">
              <h3 className="text-xs font-bold uppercase tracking-wider text-purple-600 dark:text-purple-400">
                Scheduled Meetings &amp; Discussions
              </h3>
              {selectedDateEvents.meetings.length === 0 ? (
                <p className="text-xs text-slate-400 py-6 text-center border rounded-xl border-dashed">
                  No meetings on this day.
                </p>
              ) : (
                selectedDateEvents.meetings.map((m) => (
                  <div key={m.id} className="p-4 rounded-xl bg-purple-50/50 dark:bg-purple-950/30 border border-purple-200/70 dark:border-purple-800">
                    <span className="text-xs font-bold text-purple-700 dark:text-purple-300">
                      {m.start_time} - {m.end_time}
                    </span>
                    <h4 className="text-sm font-bold text-slate-900 dark:text-white mt-1">
                      {m.title}
                    </h4>
                    <p className="text-xs text-slate-600 dark:text-slate-400 mt-1">
                      {m.participants}
                    </p>
                    {m.agenda && (
                      <p className="text-xs text-slate-500 mt-2 italic">
                        Agenda: {m.agenda}
                      </p>
                    )}
                  </div>
                ))
              )}
            </div>

            {/* Tasks & Followups Column */}
            <div className="space-y-3">
              <h3 className="text-xs font-bold uppercase tracking-wider text-blue-600 dark:text-blue-400">
                Tasks &amp; Follow-ups Due
              </h3>
              {selectedDateEvents.tasks.length === 0 && selectedDateEvents.followups.length === 0 ? (
                <p className="text-xs text-slate-400 py-6 text-center border rounded-xl border-dashed">
                  No tasks or follow-ups due on this day.
                </p>
              ) : (
                <>
                  {selectedDateEvents.tasks.map((t) => (
                    <div
                      key={t.id}
                      onClick={() => openQuickUpdate(t)}
                      className="cursor-pointer p-4 rounded-xl bg-slate-50 dark:bg-slate-800/50 border border-slate-200/70 dark:border-slate-800 hover:border-blue-400 flex items-center justify-between"
                    >
                      <div>
                        <span className="text-[10px] font-bold px-2 py-0.5 rounded bg-blue-100 dark:bg-blue-950 text-blue-700 dark:text-blue-300">
                          Task • {t.priority}
                        </span>
                        <h4 className="text-xs font-bold text-slate-900 dark:text-white mt-1">
                          {t.title}
                        </h4>
                        {t.next_action && (
                          <p className="text-[11px] text-slate-500 mt-0.5">
                            Next: {t.next_action}
                          </p>
                        )}
                      </div>
                      <span className="text-xs font-bold text-slate-700 dark:text-slate-300">
                        {t.progress}%
                      </span>
                    </div>
                  ))}

                  {selectedDateEvents.followups.map((f) => (
                    <div
                      key={f.id}
                      className="p-4 rounded-xl bg-amber-50/50 dark:bg-amber-950/30 border border-amber-200/70 dark:border-amber-800"
                    >
                      <span className="text-[10px] font-bold px-2 py-0.5 rounded bg-amber-100 dark:bg-amber-950 text-amber-700 dark:text-amber-300">
                        Follow-up • {f.status}
                      </span>
                      <h4 className="text-xs font-bold text-slate-900 dark:text-white mt-1">
                        {f.person}: {f.topic}
                      </h4>
                      <p className="text-[11px] text-slate-600 dark:text-slate-400 mt-0.5">
                        Expected: {f.expected_action}
                      </p>
                    </div>
                  ))}
                </>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
