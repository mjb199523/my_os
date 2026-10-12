'use client';

import React, { useState, useMemo } from 'react';
import { useWorkOS } from '@/context/WorkOSContext';
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  Tooltip,
  ResponsiveContainer,
  PieChart,
  Pie,
  Cell,
  CartesianGrid,
  AreaChart,
  Area,
} from 'recharts';
import {
  BarChart3,
  TrendingUp,
  CheckCircle2,
  Clock,
  AlertOctagon,
  Calendar,
  Award,
  Video,
  UserCheck,
} from 'lucide-react';

export default function ReportsView() {
  const { tasks, projects, followups, meetings, issues, achievements } = useWorkOS();

  const [period, setPeriod] = useState<'weekly' | 'monthly'>('weekly');

  const totalTasks = tasks.length;
  const completedTasks = tasks.filter((t) => t.status === 'Done').length;
  const pendingTasks = totalTasks - completedTasks;
  const blockedTasks = tasks.filter((t) => t.status === 'Blocked').length;
  const completionRate = totalTasks > 0 ? Math.round((completedTasks / totalTasks) * 100) : 0;

  const resolvedIssues = issues.filter((i) => i.status === 'Resolved' || i.status === 'Closed').length;
  const completedFollowups = followups.filter((f) => f.status === 'Completed').length;

  // 1. Chart: Tasks completed vs created dynamically by day
  const tasksByDayData = useMemo(() => {
    const result = [];
    const now = new Date();
    const numDays = period === 'weekly' ? 7 : 14;

    for (let i = numDays - 1; i >= 0; i--) {
      const d = new Date(now);
      d.setDate(d.getDate() - i);
      const dateStr = d.toISOString().split('T')[0];
      const dayLabel = d.toLocaleDateString('en-GB', { weekday: 'short', day: 'numeric' });

      const completedCount = tasks.filter((t) => {
        if (t.status !== 'Done') return false;
        if (t.completed_at) return t.completed_at.startsWith(dateStr);
        return t.due_date === dateStr;
      }).length;

      const createdCount = tasks.filter((t) => {
        if (t.created_at) return t.created_at.startsWith(dateStr);
        return t.start_date === dateStr;
      }).length;

      result.push({
        day: dayLabel,
        date: dateStr,
        completed: completedCount,
        created: createdCount,
      });
    }
    return result;
  }, [tasks, period]);

  // 2. Chart: Tasks by Project
  const tasksByProjectData = useMemo(() => {
    return projects.map((p) => {
      const count = tasks.filter((t) => t.project_id === p.id).length;
      return { name: p.name, value: count };
    });
  }, [projects, tasks]);

  // 3. Chart: Tasks by Status
  const tasksByStatusData = useMemo(() => {
    const counts: Record<string, number> = {};
    tasks.forEach((t) => {
      counts[t.status] = (counts[t.status] || 0) + 1;
    });
    return Object.entries(counts).map(([name, count]) => ({ name, count }));
  }, [tasks]);

  // 4. Chart: Tasks by Priority
  const tasksByPriorityData = useMemo(() => {
    const counts: Record<string, number> = { Critical: 0, High: 0, Medium: 0, Low: 0 };
    tasks.forEach((t) => {
      counts[t.priority] = (counts[t.priority] || 0) + 1;
    });
    return Object.entries(counts).map(([name, count]) => ({ name, count }));
  }, [tasks]);

  // 5. Chart: Issues by Severity
  const issuesBySeverityData = useMemo(() => {
    const counts: Record<string, number> = { Critical: 0, High: 0, Medium: 0, Low: 0 };
    issues.forEach((i) => {
      counts[i.severity] = (counts[i.severity] || 0) + 1;
    });
    return Object.entries(counts).map(([name, count]) => ({ name, count }));
  }, [issues]);

  const COLORS = ['#2563eb', '#3b82f6', '#60a5fa', '#93c5fd', '#bfdbfe'];
  const SEVERITY_COLORS = ['#ef4444', '#f97316', '#3b82f6', '#64748b'];

  return (
    <div className="space-y-6 max-w-7xl mx-auto pb-12">
      {/* Top Header */}
      <div className="flex flex-wrap items-center justify-between gap-4">
        <div>
          <h1 className="text-xl sm:text-2xl font-bold text-slate-900 dark:text-white tracking-tight">
            Work Performance &amp; Reports
          </h1>
          <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
            Analytics on throughput, delivery velocity, blockers, and milestone completions.
          </p>
        </div>

        {/* Period Switcher */}
        <div className="flex rounded-xl border border-slate-200 dark:border-slate-800 p-1 bg-white dark:bg-slate-900 text-xs font-semibold shadow-2xs">
          <button
            onClick={() => setPeriod('weekly')}
            className={`px-4 py-1.5 rounded-lg transition-colors ${
              period === 'weekly'
                ? 'bg-blue-600 text-white'
                : 'text-slate-600 dark:text-slate-400 hover:text-slate-900'
            }`}
          >
            Weekly Review
          </button>
          <button
            onClick={() => setPeriod('monthly')}
            className={`px-4 py-1.5 rounded-lg transition-colors ${
              period === 'monthly'
                ? 'bg-blue-600 text-white'
                : 'text-slate-600 dark:text-slate-400 hover:text-slate-900'
            }`}
          >
            Monthly Review
          </button>
        </div>
      </div>

      {/* TOP KPI METRICS (Sections 20 & 21) */}
      <div className="grid grid-cols-2 sm:grid-cols-4 lg:grid-cols-6 gap-3">
        <div className="p-3.5 rounded-xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-2xs">
          <span className="text-[11px] font-medium text-slate-400 uppercase">
            Total Tasks
          </span>
          <div className="text-2xl font-bold text-slate-900 dark:text-white mt-1">
            {totalTasks}
          </div>
          <p className="text-[10px] text-slate-500 mt-0.5">Workspace total</p>
        </div>

        <div className="p-3.5 rounded-xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-2xs">
          <span className="text-[11px] font-medium text-slate-400 uppercase">
            Completed
          </span>
          <div className="text-2xl font-bold text-emerald-600 dark:text-emerald-400 mt-1">
            {completedTasks}
          </div>
          <p className="text-[10px] text-emerald-600 font-semibold mt-0.5">
            {completionRate}% success rate
          </p>
        </div>

        <div className="p-3.5 rounded-xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-2xs">
          <span className="text-[11px] font-medium text-slate-400 uppercase">
            Pending Tasks
          </span>
          <div className="text-2xl font-bold text-blue-600 dark:text-blue-400 mt-1">
            {pendingTasks}
          </div>
          <p className="text-[10px] text-slate-500 mt-0.5">In pipeline</p>
        </div>

        <div className="p-3.5 rounded-xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-2xs">
          <span className="text-[11px] font-medium text-slate-400 uppercase">
            Blocked
          </span>
          <div className="text-2xl font-bold text-red-600 dark:text-red-400 mt-1">
            {blockedTasks}
          </div>
          <p className="text-[10px] text-red-500 font-medium mt-0.5">Needs unblocking</p>
        </div>

        <div className="p-3.5 rounded-xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-2xs">
          <span className="text-[11px] font-medium text-slate-400 uppercase">
            Meetings Conducted
          </span>
          <div className="text-2xl font-bold text-purple-600 dark:text-purple-400 mt-1">
            {meetings.length}
          </div>
          <p className="text-[10px] text-purple-500 mt-0.5">Total sessions</p>
        </div>

        <div className="p-3.5 rounded-xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-2xs">
          <span className="text-[11px] font-medium text-slate-400 uppercase">
            Follow-ups Handled
          </span>
          <div className="text-2xl font-bold text-amber-600 dark:text-amber-400 mt-1">
            {followups.length}
          </div>
          <p className="text-[10px] text-amber-500 mt-0.5">Cross-team syncs</p>
        </div>
      </div>

      {/* CHARTS GRID (Section 20) */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Chart 1: Tasks Completed by Day */}
        <div className="p-5 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-sm space-y-4">
          <h3 className="text-xs font-bold text-slate-900 dark:text-white uppercase tracking-wider">
            Tasks Completed vs Created by Day
          </h3>
          <div className="h-64 w-full">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={tasksByDayData} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
                <CartesianGrid strokeDasharray="3 3" opacity={0.15} />
                <XAxis dataKey="day" tick={{ fontSize: 11 }} />
                <YAxis tick={{ fontSize: 11 }} />
                <Tooltip
                  contentStyle={{
                    backgroundColor: '#0f172a',
                    border: 'none',
                    borderRadius: '8px',
                    color: '#fff',
                    fontSize: '12px',
                  }}
                />
                <Bar dataKey="completed" fill="#2563eb" radius={[4, 4, 0, 0]} name="Completed" />
                <Bar dataKey="created" fill="#93c5fd" radius={[4, 4, 0, 0]} name="Created" />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Chart 2: Tasks by Project */}
        <div className="p-5 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-sm space-y-4">
          <h3 className="text-xs font-bold text-slate-900 dark:text-white uppercase tracking-wider">
            Tasks by Project
          </h3>
          <div className="h-64 w-full">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart
                layout="vertical"
                data={tasksByProjectData}
                margin={{ top: 10, right: 20, left: 20, bottom: 0 }}
              >
                <CartesianGrid strokeDasharray="3 3" opacity={0.15} />
                <XAxis type="number" tick={{ fontSize: 11 }} />
                <YAxis dataKey="name" type="category" tick={{ fontSize: 11 }} width={100} />
                <Tooltip
                  contentStyle={{
                    backgroundColor: '#0f172a',
                    border: 'none',
                    borderRadius: '8px',
                    color: '#fff',
                    fontSize: '12px',
                  }}
                />
                <Bar dataKey="value" fill="#3b82f6" radius={[0, 4, 4, 0]} name="Tasks" />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Chart 3: Tasks by Status */}
        <div className="p-5 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-sm space-y-4">
          <h3 className="text-xs font-bold text-slate-900 dark:text-white uppercase tracking-wider">
            Tasks by Status
          </h3>
          <div className="h-64 w-full">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={tasksByStatusData} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
                <CartesianGrid strokeDasharray="3 3" opacity={0.15} />
                <XAxis dataKey="name" tick={{ fontSize: 11 }} />
                <YAxis tick={{ fontSize: 11 }} />
                <Tooltip
                  contentStyle={{
                    backgroundColor: '#0f172a',
                    border: 'none',
                    borderRadius: '8px',
                    color: '#fff',
                    fontSize: '12px',
                  }}
                />
                <Bar dataKey="count" fill="#10b981" radius={[4, 4, 0, 0]} name="Count" />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Chart 4: Issues by Severity */}
        <div className="p-5 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-sm space-y-4">
          <h3 className="text-xs font-bold text-slate-900 dark:text-white uppercase tracking-wider">
            Blockers &amp; Issues by Severity
          </h3>
          <div className="h-64 w-full">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={issuesBySeverityData} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
                <CartesianGrid strokeDasharray="3 3" opacity={0.15} />
                <XAxis dataKey="name" tick={{ fontSize: 11 }} />
                <YAxis tick={{ fontSize: 11 }} />
                <Tooltip
                  contentStyle={{
                    backgroundColor: '#0f172a',
                    border: 'none',
                    borderRadius: '8px',
                    color: '#fff',
                    fontSize: '12px',
                  }}
                />
                <Bar dataKey="count" fill="#ef4444" radius={[4, 4, 0, 0]} name="Issues" />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>
      </div>

      {/* SECTION 21: MAJOR ACHIEVEMENTS HIGHLIGHT */}
      <div className="p-6 rounded-2xl bg-gradient-to-r from-blue-900/10 via-indigo-900/10 to-purple-900/10 dark:from-blue-950/40 dark:via-indigo-950/40 dark:to-purple-950/40 border border-blue-200/60 dark:border-blue-900/40">
        <div className="flex items-center space-x-2 mb-3">
          <Award className="w-5 h-5 text-amber-500" />
          <h3 className="text-sm font-bold text-slate-900 dark:text-white uppercase tracking-wider">
            Major Achievements This Period
          </h3>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          {achievements.map((ach) => (
            <div
              key={ach.id}
              className="p-4 rounded-xl bg-white/80 dark:bg-slate-900/80 border border-slate-200/80 dark:border-slate-800 shadow-2xs"
            >
              <span className="text-[10px] font-bold px-2 py-0.5 rounded bg-blue-100 dark:bg-blue-950 text-blue-700 dark:text-blue-300">
                {ach.category}
              </span>
              <h4 className="text-xs font-bold text-slate-900 dark:text-white mt-2">
                ⭐ {ach.title}
              </h4>
              <p className="text-[11px] text-slate-600 dark:text-slate-400 mt-1 line-clamp-2">
                {ach.impact}
              </p>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
