'use client';

import React, { useState } from 'react';
import { useWorkOS } from '@/context/WorkOSContext';
import { Task, TaskStatus, Priority } from '@/types';
import {
  CheckSquare,
  AlertCircle,
  Video,
  UserCheck,
  Plus,
  ArrowRight,
  Clock,
  AlertOctagon,
  Sparkles,
  ExternalLink,
  ChevronDown,
  CheckCircle2,
  Calendar,
  Layers,
  Flame,
  FileEdit,
  History,
} from 'lucide-react';

export default function DashboardView() {
  const {
    tasks,
    projects,
    followups,
    meetings,
    issues,
    user,
    dailyLogs,
    saveDailyLog,
    generateTodaySummary,
    updateTaskStatus,
    openQuickUpdate,
    openHistory,
    openQuickAdd,
    setActiveTab,
    setSelectedProjectId,
  } = useWorkOS();

  const today = new Date().toISOString().split('T')[0];

  // Inline status dropdown state
  const [openStatusDropdownId, setOpenStatusDropdownId] = useState<string | null>(null);

  // Quick Daily Work Log state
  const todayLog = dailyLogs.find((l) => l.log_date === today);
  const [quickLogSummary, setQuickLogSummary] = useState(todayLog?.summary || '');
  const [quickLogWorkedOn, setQuickLogWorkedOn] = useState(todayLog?.worked_on || '');
  const [isLogSaved, setIsLogSaved] = useState(false);

  // All workspace tasks
  const allWorkspaceTasks = tasks;
  const totalTasksCount = allWorkspaceTasks.length;
  const completedTasksCount = allWorkspaceTasks.filter((t) => t.status === 'Done').length;
  const remainingTasksCount = totalTasksCount - completedTasksCount;

  // High priority tasks
  const highPriorityTasks = tasks.filter(
    (t) => (t.priority === 'High' || t.priority === 'Critical') && t.status !== 'Done'
  );

  // Today's meetings
  const todayMeetings = meetings.filter((m) => m.meeting_date === today);

  // Follow-ups due today
  const followupsDueToday = followups.filter(
    (f) => f.followup_date <= today && f.status !== 'Completed'
  );

  // Blockers / Critical issues
  const activeBlockers = issues.filter(
    (i) => i.status !== 'Resolved' && i.status !== 'Closed'
  );

  const handleStatusChange = (taskId: string, newStatus: TaskStatus) => {
    updateTaskStatus(taskId, newStatus);
    setOpenStatusDropdownId(null);
  };

  const handleGenerateSummary = () => {
    const generated = generateTodaySummary(today);
    setQuickLogSummary(generated.summary);
    setQuickLogWorkedOn(generated.worked_on);
    saveDailyLog({
      log_date: today,
      summary: generated.summary,
      worked_on: generated.worked_on,
      completed: generated.completed,
      pending: generated.pending,
      blocked: generated.blocked,
      people_coordinated: generated.people_coordinated,
    });
    setIsLogSaved(true);
    setTimeout(() => setIsLogSaved(false), 2500);
  };

  const handleSaveLog = () => {
    saveDailyLog({
      log_date: today,
      summary: quickLogSummary,
      worked_on: quickLogWorkedOn,
    });
    setIsLogSaved(true);
    setTimeout(() => setIsLogSaved(false), 2500);
  };

  const getPriorityBadge = (priority: Priority) => {
    switch (priority) {
      case 'Critical':
        return 'bg-red-100 text-red-700 dark:bg-red-900/60 dark:text-red-300 border-red-200 dark:border-red-800';
      case 'High':
        return 'bg-orange-100 text-orange-700 dark:bg-orange-900/60 dark:text-orange-300 border-orange-200 dark:border-orange-800';
      case 'Medium':
        return 'bg-blue-100 text-blue-700 dark:bg-blue-900/60 dark:text-blue-300 border-blue-200 dark:border-blue-800';
      default:
        return 'bg-slate-100 text-slate-700 dark:bg-slate-800 dark:text-slate-300 border-slate-200 dark:border-slate-700';
    }
  };

  const getStatusBadge = (status: TaskStatus) => {
    switch (status) {
      case 'Done':
        return 'bg-emerald-100 text-emerald-800 dark:bg-emerald-950/60 dark:text-emerald-300 border-emerald-300 dark:border-emerald-800';
      case 'In Progress':
        return 'bg-blue-100 text-blue-800 dark:bg-blue-950/60 dark:text-blue-300 border-blue-300 dark:border-blue-800';
      case 'Blocked':
        return 'bg-red-100 text-red-800 dark:bg-red-950/60 dark:text-red-300 border-red-300 dark:border-red-800 animate-pulse';
      case 'Waiting':
        return 'bg-amber-100 text-amber-800 dark:bg-amber-950/60 dark:text-amber-300 border-amber-300 dark:border-amber-800';
      case 'Cancelled':
        return 'bg-slate-100 text-slate-600 dark:bg-slate-800 dark:text-slate-400 border-slate-300 dark:border-slate-700';
      default:
        return 'bg-slate-100 text-slate-800 dark:bg-slate-800 dark:text-slate-300 border-slate-300 dark:border-slate-700';
    }
  };

  const allStatuses: TaskStatus[] = [
    'To Do',
    'In Progress',
    'Waiting',
    'Blocked',
    'Done',
    'Cancelled',
  ];

  return (
    <div className="space-y-6 max-w-7xl mx-auto pb-12">
      {/* SECTION 6: SUMMARY CARDS */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {/* Card 1: All Tasks */}
        <div
          onClick={() => setActiveTab('tasks')}
          className="group cursor-pointer p-4 rounded-xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 hover:border-blue-400 dark:hover:border-blue-600 shadow-sm transition-all duration-150"
        >
          <div className="flex items-center justify-between mb-2">
            <span className="text-xs font-semibold uppercase tracking-wider text-slate-500 dark:text-slate-400">
              All Tasks
            </span>
            <div className="w-8 h-8 rounded-lg bg-blue-50 dark:bg-blue-950/60 text-blue-600 dark:text-blue-400 flex items-center justify-center">
              <CheckSquare className="w-4 h-4" />
            </div>
          </div>
          <div className="flex items-baseline space-x-2">
            <span className="text-2xl font-bold text-slate-900 dark:text-white">
              {totalTasksCount}
            </span>
            <span className="text-xs text-slate-500 dark:text-slate-400 font-medium">
              Tasks
            </span>
          </div>
          <div className="mt-2 text-xs flex items-center space-x-2 text-slate-500 dark:text-slate-400">
            <span className="text-emerald-600 dark:text-emerald-400 font-semibold">
              {completedTasksCount} completed
            </span>
            <span>•</span>
            <span className="font-medium">{remainingTasksCount} remaining</span>
          </div>
        </div>

        {/* Card 2: High Priority */}
        <div
          onClick={() => setActiveTab('tasks')}
          className="group cursor-pointer p-4 rounded-xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 hover:border-orange-400 dark:hover:border-orange-600 shadow-sm transition-all duration-150"
        >
          <div className="flex items-center justify-between mb-2">
            <span className="text-xs font-semibold uppercase tracking-wider text-slate-500 dark:text-slate-400">
              High Priority
            </span>
            <div className="w-8 h-8 rounded-lg bg-orange-50 dark:bg-orange-950/60 text-orange-600 dark:text-orange-400 flex items-center justify-center">
              <Flame className="w-4 h-4" />
            </div>
          </div>
          <div className="flex items-baseline space-x-2">
            <span className="text-2xl font-bold text-slate-900 dark:text-white">
              {highPriorityTasks.length}
            </span>
            <span className="text-xs text-slate-500 dark:text-slate-400 font-medium">
              Urgent Items
            </span>
          </div>
          <div className="mt-2 text-xs text-orange-600 dark:text-orange-400 font-medium">
            Requires immediate attention
          </div>
        </div>

        {/* Card 3: Meetings */}
        <div
          onClick={() => setActiveTab('meetings')}
          className="group cursor-pointer p-4 rounded-xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 hover:border-purple-400 dark:hover:border-purple-600 shadow-sm transition-all duration-150"
        >
          <div className="flex items-center justify-between mb-2">
            <span className="text-xs font-semibold uppercase tracking-wider text-slate-500 dark:text-slate-400">
              Meetings
            </span>
            <div className="w-8 h-8 rounded-lg bg-purple-50 dark:bg-purple-950/60 text-purple-600 dark:text-purple-400 flex items-center justify-center">
              <Video className="w-4 h-4" />
            </div>
          </div>
          <div className="flex items-baseline space-x-2">
            <span className="text-2xl font-bold text-slate-900 dark:text-white">
              {todayMeetings.length}
            </span>
            <span className="text-xs text-slate-500 dark:text-slate-400 font-medium">
              Scheduled Today
            </span>
          </div>
          <div className="mt-2 text-xs text-purple-600 dark:text-purple-400 font-medium truncate">
            {todayMeetings[0] ? `Next: ${todayMeetings[0].start_time}` : 'No meetings'}
          </div>
        </div>

        {/* Card 4: Follow-ups */}
        <div
          onClick={() => setActiveTab('followups')}
          className="group cursor-pointer p-4 rounded-xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 hover:border-amber-400 dark:hover:border-amber-600 shadow-sm transition-all duration-150"
        >
          <div className="flex items-center justify-between mb-2">
            <span className="text-xs font-semibold uppercase tracking-wider text-slate-500 dark:text-slate-400">
              Follow-ups Due
            </span>
            <div className="w-8 h-8 rounded-lg bg-amber-50 dark:bg-amber-950/60 text-amber-600 dark:text-amber-400 flex items-center justify-center">
              <UserCheck className="w-4 h-4" />
            </div>
          </div>
          <div className="flex items-baseline space-x-2">
            <span className="text-2xl font-bold text-slate-900 dark:text-white">
              {followupsDueToday.length}
            </span>
            <span className="text-xs text-slate-500 dark:text-slate-400 font-medium">
              Awaiting External Action
            </span>
          </div>
          <div className="mt-2 text-xs text-amber-600 dark:text-amber-400 font-medium">
            Due today or pending
          </div>
        </div>
      </div>

      {/* SECTION 7 & 26: ALL TASKS */}
      <div className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-sm overflow-hidden">
        <div className="px-6 py-4 border-b border-slate-200 dark:border-slate-800 flex flex-wrap items-center justify-between gap-3">
          <div className="flex items-center space-x-2">
            <h2 className="text-sm sm:text-base font-bold text-slate-900 dark:text-white tracking-tight">
              ALL TASKS
            </h2>
            <span className="text-xs font-semibold px-2 py-0.5 rounded-full bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300">
              {allWorkspaceTasks.length}
            </span>
          </div>
          <div className="flex items-center space-x-2">
            <button
              onClick={() => openQuickAdd('task')}
              className="inline-flex items-center space-x-1.5 px-3 py-1.5 text-xs font-semibold rounded-lg bg-blue-600 hover:bg-blue-700 text-white shadow-sm transition-all"
            >
              <Plus className="w-3.5 h-3.5" />
              <span>Add Task</span>
            </button>
            <button
              onClick={() => setActiveTab('tasks')}
              className="text-xs font-semibold text-blue-600 dark:text-blue-400 hover:underline flex items-center space-x-1"
            >
              <span>View All</span>
              <ArrowRight className="w-3 h-3" />
            </button>
          </div>
        </div>

        {/* Task Table */}
        <div className="overflow-x-auto">
          {allWorkspaceTasks.length === 0 ? (
            <div className="py-12 text-center">
              <CheckCircle2 className="w-8 h-8 text-blue-500 mx-auto mb-2 opacity-80" />
              <p className="text-xs font-semibold text-slate-700 dark:text-slate-300">
                No tasks added yet
              </p>
              <p className="text-[11px] text-slate-400 mt-0.5">
                Click + Add Task to create your first task.
              </p>
            </div>
          ) : (
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="border-b border-slate-200 dark:border-slate-800 bg-slate-50/70 dark:bg-slate-800/40 text-[11px] font-semibold uppercase tracking-wider text-slate-500 dark:text-slate-400">
                  <th className="py-3 px-4 sm:px-6">Task</th>
                  <th className="py-3 px-4">Project</th>
                  <th className="py-3 px-3">Priority</th>
                  <th className="py-3 px-4">Status</th>
                  <th className="py-3 px-4">Progress</th>
                  <th className="py-3 px-4 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 dark:divide-slate-800 text-xs">
                {allWorkspaceTasks.map((task) => {
                  const project = projects.find((p) => p.id === task.project_id);
                  const isDropdownOpen = openStatusDropdownId === task.id;

                  return (
                    <tr
                      key={task.id}
                      className="hover:bg-slate-50/80 dark:hover:bg-slate-800/50 transition-colors group"
                    >
                      {/* Task title & next action */}
                      <td className="py-3.5 px-4 sm:px-6 min-w-[200px]">
                        <div className="font-semibold text-slate-900 dark:text-white flex items-center space-x-2">
                          <span className={task.status === 'Done' ? 'line-through text-slate-400' : ''}>
                            {task.title}
                          </span>
                        </div>
                        {task.next_action && (
                          <div className="text-[11px] text-slate-500 dark:text-slate-400 mt-0.5 flex items-center space-x-1">
                            <span className="text-blue-600 dark:text-blue-400 font-medium">Next:</span>
                            <span className="truncate max-w-xs">{task.next_action}</span>
                          </div>
                        )}
                      </td>

                      {/* Project */}
                      <td className="py-3.5 px-4 whitespace-nowrap">
                        <span className="font-medium text-slate-700 dark:text-slate-300">
                          {project?.name || 'Assam IDP'}
                        </span>
                      </td>

                      {/* Priority */}
                      <td className="py-3.5 px-3 whitespace-nowrap">
                        <span
                          className={`text-[10px] font-bold px-2 py-0.5 rounded-full border ${getPriorityBadge(
                            task.priority
                          )}`}
                        >
                          {task.priority}
                        </span>
                      </td>

                      {/* Inline Status Dropdown */}
                      <td className="py-3.5 px-4 whitespace-nowrap relative">
                        <div className="relative inline-block">
                          <button
                            onClick={() =>
                              setOpenStatusDropdownId(isDropdownOpen ? null : task.id)
                            }
                            className={`inline-flex items-center space-x-1 px-2.5 py-1 rounded-lg text-xs font-bold border transition-colors shadow-2xs ${getStatusBadge(
                              task.status
                            )}`}
                          >
                            <span>{task.status}</span>
                            <ChevronDown className="w-3 h-3 opacity-70" />
                          </button>

                          {isDropdownOpen && (
                            <div className="absolute left-0 mt-1.5 w-36 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl shadow-xl z-30 py-1">
                              {allStatuses.map((st) => (
                                <button
                                  key={st}
                                  onClick={() => handleStatusChange(task.id, st)}
                                  className={`w-full text-left px-3 py-1.5 text-xs font-medium hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors ${
                                    task.status === st
                                      ? 'text-blue-600 dark:text-blue-400 font-bold'
                                      : 'text-slate-700 dark:text-slate-300'
                                  }`}
                                >
                                  {st}
                                </button>
                              ))}
                            </div>
                          )}
                        </div>
                      </td>

                      {/* Progress Bar */}
                      <td className="py-3.5 px-4 whitespace-nowrap min-w-[120px]">
                        <div className="flex items-center space-x-2">
                          <div className="flex-1 bg-slate-100 dark:bg-slate-800 rounded-full h-1.5 overflow-hidden">
                            <div
                              className={`h-full rounded-full ${
                                task.status === 'Done'
                                  ? 'bg-emerald-500'
                                  : task.status === 'Blocked'
                                  ? 'bg-red-500'
                                  : 'bg-blue-600'
                              }`}
                              style={{ width: `${task.progress}%` }}
                            />
                          </div>
                          <span className="text-[11px] font-semibold text-slate-600 dark:text-slate-400 w-8 text-right">
                            {task.progress}%
                          </span>
                        </div>
                      </td>

                      {/* Actions */}
                      <td className="py-3.5 px-4 text-right whitespace-nowrap space-x-1.5">
                        <button
                          onClick={() => openQuickUpdate(task)}
                          className="px-2.5 py-1 text-xs font-semibold rounded-lg bg-slate-100 dark:bg-slate-800 hover:bg-blue-50 dark:hover:bg-blue-950/60 text-slate-700 dark:text-slate-300 hover:text-blue-600 dark:hover:text-blue-400 transition-colors inline-flex items-center space-x-1"
                          title="Quick Update (under 10 sec)"
                        >
                          <FileEdit className="w-3 h-3" />
                          <span>Update</span>
                        </button>
                        <button
                          onClick={() => openHistory(task)}
                          className="p-1 text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 rounded-lg hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors"
                          title="Activity History Timeline"
                        >
                          <History className="w-3.5 h-3.5" />
                        </button>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          )}
        </div>
      </div>

      {/* SECTION: PRIORITIES & FOLLOW-UPS (SIDE BY SIDE) */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Left: My Priorities */}
        <div className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 p-5 shadow-sm">
          <div className="flex items-center justify-between mb-4">
            <div className="flex items-center space-x-2">
              <h3 className="text-xs font-bold text-slate-900 dark:text-white uppercase tracking-wider">
                MY PRIORITIES
              </h3>
              <span className="text-[10px] font-semibold px-2 py-0.5 rounded-full bg-orange-100 dark:bg-orange-950/60 text-orange-700 dark:text-orange-300">
                {highPriorityTasks.length} Critical/High
              </span>
            </div>
            <button
              onClick={() => setActiveTab('tasks')}
              className="text-xs text-blue-600 dark:text-blue-400 font-semibold hover:underline"
            >
              Manage
            </button>
          </div>

          <div className="space-y-2.5">
            {highPriorityTasks.length === 0 ? (
              <p className="text-xs text-slate-400 py-4 text-center">
                No high-priority tasks pending!
              </p>
            ) : (
              highPriorityTasks.slice(0, 4).map((task) => {
                const project = projects.find((p) => p.id === task.project_id);
                return (
                  <div
                    key={task.id}
                    onClick={() => openQuickUpdate(task)}
                    className="cursor-pointer p-3 rounded-xl bg-slate-50 dark:bg-slate-800/50 border border-slate-200/70 dark:border-slate-800 hover:border-slate-300 dark:hover:border-slate-700 flex items-center justify-between transition-colors"
                  >
                    <div className="flex items-center space-x-2.5 min-w-0">
                      <span
                        className={`w-2.5 h-2.5 rounded-full shrink-0 ${
                          task.priority === 'Critical' ? 'bg-red-500 animate-pulse' : 'bg-orange-500'
                        }`}
                      />
                      <div className="min-w-0">
                        <p className="text-xs font-semibold text-slate-900 dark:text-white truncate">
                          {task.title}
                        </p>
                        <p className="text-[11px] text-slate-500 dark:text-slate-400 truncate">
                          {project?.name || 'Assam IDP'} • Due: {task.due_date}
                        </p>
                      </div>
                    </div>
                    <span className="text-[11px] font-bold text-slate-600 dark:text-slate-300 shrink-0">
                      {task.progress}%
                    </span>
                  </div>
                );
              })
            )}
          </div>
        </div>

        {/* Right: Follow-ups */}
        <div className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 p-5 shadow-sm">
          <div className="flex items-center justify-between mb-4">
            <div className="flex items-center space-x-2">
              <h3 className="text-xs font-bold text-slate-900 dark:text-white uppercase tracking-wider">
                FOLLOW-UPS DUE
              </h3>
              <span className="text-[10px] font-semibold px-2 py-0.5 rounded-full bg-amber-100 dark:bg-amber-950/60 text-amber-700 dark:text-amber-300">
                {followupsDueToday.length} Pending
              </span>
            </div>
            <button
              onClick={() => setActiveTab('followups')}
              className="text-xs text-blue-600 dark:text-blue-400 font-semibold hover:underline"
            >
              View All
            </button>
          </div>

          <div className="space-y-2.5">
            {followupsDueToday.length === 0 ? (
              <p className="text-xs text-slate-400 py-4 text-center">
                No follow-ups due today.
              </p>
            ) : (
              followupsDueToday.slice(0, 4).map((f) => (
                <div
                  key={f.id}
                  onClick={() => setActiveTab('followups')}
                  className="cursor-pointer p-3 rounded-xl bg-slate-50 dark:bg-slate-800/50 border border-slate-200/70 dark:border-slate-800 hover:border-slate-300 dark:hover:border-slate-700 flex items-center justify-between transition-colors"
                >
                  <div className="min-w-0">
                    <p className="text-xs font-semibold text-slate-900 dark:text-white truncate">
                      {f.person}
                    </p>
                    <p className="text-[11px] text-slate-500 dark:text-slate-400 truncate">
                      {f.topic} — {f.expected_action}
                    </p>
                  </div>
                  <span
                    className={`text-[10px] font-bold px-2 py-0.5 rounded-full shrink-0 ${
                      f.followup_date < today
                        ? 'bg-red-100 text-red-700 dark:bg-red-900/60 dark:text-red-300'
                        : 'bg-amber-100 text-amber-700 dark:bg-amber-900/60 dark:text-amber-300'
                    }`}
                  >
                    {f.followup_date < today ? 'Overdue' : 'Due Today'}
                  </span>
                </div>
              ))
            )}
          </div>
        </div>
      </div>

      {/* SECTION 12 & 38: PROJECTS PROGRESS */}
      <div className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 p-5 shadow-sm">
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center space-x-2">
            <h3 className="text-xs font-bold text-slate-900 dark:text-white uppercase tracking-wider">
              PROJECTS OVERVIEW
            </h3>
            <span className="text-[10px] font-semibold px-2 py-0.5 rounded-full bg-blue-100 dark:bg-blue-950/60 text-blue-700 dark:text-blue-300">
              {projects.length} Active
            </span>
          </div>
          <button
            onClick={() => setActiveTab('projects')}
            className="text-xs text-blue-600 dark:text-blue-400 font-semibold hover:underline"
          >
            All Projects
          </button>
        </div>

        {projects.length === 0 ? (
          <div className="py-8 text-center bg-slate-50 dark:bg-slate-800/30 rounded-xl border border-dashed border-slate-200 dark:border-slate-800">
            <p className="text-xs font-semibold text-slate-700 dark:text-slate-300">
              No projects created yet
            </p>
            <p className="text-[11px] text-slate-500 dark:text-slate-400 mt-0.5">
              Create your first project to start tracking your work stream.
            </p>
            <button
              onClick={() => setActiveTab('projects')}
              className="mt-3 px-3 py-1.5 text-xs font-semibold rounded-lg bg-blue-600 text-white hover:bg-blue-700"
            >
              + Create Project
            </button>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            {projects.slice(0, 3).map((proj) => {
              const projTasks = tasks.filter((t) => t.project_id === proj.id);
              const total = projTasks.length;
              const completed = projTasks.filter((t) => t.status === 'Done').length;
              const blocked = projTasks.filter((t) => t.status === 'Blocked').length;
              const pending = total - completed;
              const progress = total > 0 ? Math.round((completed / total) * 100) : 0;

              return (
                <div
                  key={proj.id}
                  onClick={() => {
                    setSelectedProjectId(proj.id);
                    setActiveTab('projects');
                  }}
                  className="cursor-pointer p-4 rounded-xl bg-slate-50 dark:bg-slate-800/40 border border-slate-200/70 dark:border-slate-800 hover:border-blue-400 dark:hover:border-blue-600 transition-all"
                >
                  <div className="flex items-center justify-between mb-2">
                    <h4 className="text-xs font-bold text-slate-900 dark:text-white truncate">
                      {proj.name}
                    </h4>
                    <span className="text-xs font-bold text-blue-600 dark:text-blue-400">
                      {progress}%
                    </span>
                  </div>

                  <div className="w-full bg-slate-200 dark:bg-slate-700 h-2 rounded-full overflow-hidden mb-3">
                    <div
                      className="bg-blue-600 h-full rounded-full transition-all duration-300"
                      style={{ width: `${progress}%` }}
                    />
                  </div>

                  <div className="flex items-center justify-between text-[11px] text-slate-500 dark:text-slate-400 font-medium">
                    <span>{total} Tasks</span>
                    <span>{pending} Pending</span>
                    {blocked > 0 ? (
                      <span className="text-red-600 dark:text-red-400 font-semibold">
                        {blocked} Blocked
                      </span>
                    ) : (
                      <span>0 Blocked</span>
                    )}
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>

      {/* SECTION: TODAY'S MEETINGS & BLOCKERS */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Today's Meetings */}
        <div className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 p-5 shadow-sm">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-xs font-bold text-slate-900 dark:text-white uppercase tracking-wider">
              TODAY&apos;S MEETINGS
            </h3>
            <button
              onClick={() => openQuickAdd('meeting')}
              className="text-xs text-blue-600 dark:text-blue-400 font-semibold hover:underline"
            >
              + Meeting
            </button>
          </div>

          <div className="space-y-3">
            {todayMeetings.length === 0 ? (
              <p className="text-xs text-slate-400 py-4 text-center">
                No meetings scheduled for today.
              </p>
            ) : (
              todayMeetings.map((mtg) => (
                <div
                  key={mtg.id}
                  onClick={() => setActiveTab('meetings')}
                  className="cursor-pointer p-3 rounded-xl bg-slate-50 dark:bg-slate-800/50 border border-slate-200/70 dark:border-slate-800 hover:border-slate-300 transition-colors"
                >
                  <div className="flex items-center justify-between">
                    <span className="text-xs font-bold text-purple-700 dark:text-purple-300">
                      {mtg.start_time} - {mtg.end_time}
                    </span>
                    <span className="text-[10px] text-slate-500">
                      {mtg.participants.split(',').length} participants
                    </span>
                  </div>
                  <p className="text-xs font-semibold text-slate-900 dark:text-white mt-1">
                    {mtg.title}
                  </p>
                  {mtg.agenda && (
                    <p className="text-[11px] text-slate-500 dark:text-slate-400 truncate mt-0.5">
                      {mtg.agenda}
                    </p>
                  )}
                </div>
              ))
            )}
          </div>
        </div>

        {/* Blockers */}
        <div className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 p-5 shadow-sm">
          <div className="flex items-center justify-between mb-4">
            <div className="flex items-center space-x-2">
              <h3 className="text-xs font-bold text-slate-900 dark:text-white uppercase tracking-wider">
                BLOCKERS &amp; ISSUES
              </h3>
              <span className="text-[10px] font-semibold px-2 py-0.5 rounded-full bg-red-100 dark:bg-red-950/60 text-red-700 dark:text-red-300">
                {activeBlockers.length} Active
              </span>
            </div>
            <button
              onClick={() => setActiveTab('issues')}
              className="text-xs text-blue-600 dark:text-blue-400 font-semibold hover:underline"
            >
              View Board
            </button>
          </div>

          <div className="space-y-3">
            {activeBlockers.length === 0 ? (
              <p className="text-xs text-slate-400 py-4 text-center">
                No active blockers! All systems clear.
              </p>
            ) : (
              activeBlockers.map((issue) => (
                <div
                  key={issue.id}
                  onClick={() => setActiveTab('issues')}
                  className="cursor-pointer p-3 rounded-xl bg-red-50/50 dark:bg-red-950/20 border border-red-200/70 dark:border-red-900/40 hover:border-red-300 transition-colors"
                >
                  <div className="flex items-center justify-between">
                    <span className="text-xs font-bold text-red-700 dark:text-red-400 flex items-center space-x-1.5">
                      <span className="w-2 h-2 rounded-full bg-red-600 animate-pulse" />
                      <span>{issue.title}</span>
                    </span>
                    <span className="text-[10px] font-bold px-2 py-0.5 rounded bg-red-100 dark:bg-red-900 text-red-800 dark:text-red-300">
                      {issue.severity}
                    </span>
                  </div>
                  <p className="text-[11px] text-slate-600 dark:text-slate-400 mt-1 line-clamp-2">
                    {issue.description}
                  </p>
                  <div className="mt-2 text-[10px] text-slate-500 flex items-center justify-between">
                    <span>Owner: {issue.owner}</span>
                    <span>Target: {issue.expected_resolution || 'Immediate'}</span>
                  </div>
                </div>
              ))
            )}
          </div>
        </div>
      </div>

      {/* SECTION 18, 19, 38: DAILY WORK LOG SUMMARY */}
      <div className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 p-5 shadow-sm">
        <div className="flex flex-wrap items-center justify-between gap-2 mb-3">
          <div>
            <h3 className="text-xs font-bold text-slate-900 dark:text-white uppercase tracking-wider">
              DAILY WORK LOG &amp; EXECUTIVE SUMMARY
            </h3>
            <p className="text-[11px] text-slate-500 dark:text-slate-400">
              Summarize today&apos;s achievements, roadblocks, and plan for tomorrow
            </p>
          </div>
          <div className="flex items-center space-x-2">
            <button
              onClick={handleGenerateSummary}
              className="px-3 py-1.5 text-xs font-semibold rounded-lg bg-indigo-50 hover:bg-indigo-100 text-indigo-700 dark:bg-indigo-950/40 dark:hover:bg-indigo-950/70 dark:text-indigo-300 border border-indigo-200 dark:border-indigo-800 transition-colors flex items-center space-x-1"
            >
              <Sparkles className="w-3.5 h-3.5" />
              <span>Generate Today&apos;s Summary</span>
            </button>
            <button
              onClick={handleSaveLog}
              className="px-4 py-1.5 text-xs font-semibold rounded-lg bg-blue-600 hover:bg-blue-700 text-white shadow-sm transition-all"
            >
              {isLogSaved ? 'Saved ✓' : 'Save Log'}
            </button>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
          <div>
            <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
              What did you accomplish today?
            </label>
            <textarea
              rows={4}
              value={quickLogWorkedOn}
              onChange={(e) => setQuickLogWorkedOn(e.target.value)}
              placeholder="• Completed UAT testing for Attendance API...&#10;• Unblocked Shiksha Setu schema integration..."
              className="w-full px-3 py-2 text-xs rounded-xl bg-slate-50 dark:bg-slate-800/60 border border-slate-200 dark:border-slate-700 text-slate-900 dark:text-white resize-none font-mono"
            />
          </div>

          <div>
            <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
              Executive Brief &amp; Tomorrow&apos;s Focus
            </label>
            <textarea
              rows={4}
              value={quickLogSummary}
              onChange={(e) => setQuickLogSummary(e.target.value)}
              placeholder="Click 'Generate Today's Summary' to automatically aggregate completed tasks, meetings, and follow-ups..."
              className="w-full px-3 py-2 text-xs rounded-xl bg-slate-50 dark:bg-slate-800/60 border border-slate-200 dark:border-slate-700 text-slate-900 dark:text-white resize-none"
            />
          </div>
        </div>
      </div>
    </div>
  );
}
