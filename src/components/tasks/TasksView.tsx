'use client';

import React, { useState, useMemo } from 'react';
import { useWorkOS } from '@/context/WorkOSContext';
import { Task, TaskStatus, Priority, TaskType } from '@/types';
import {
  Search,
  Filter,
  Plus,
  ArrowUpDown,
  CheckCircle2,
  Clock,
  AlertTriangle,
  ChevronDown,
  Trash2,
  FileEdit,
  History,
  Repeat,
  Tag,
} from 'lucide-react';

export default function TasksView() {
  const {
    tasks,
    projects,
    updateTaskStatus,
    deleteTask,
    openQuickUpdate,
    openHistory,
    openQuickAdd,
  } = useWorkOS();

  const today = new Date().toISOString().split('T')[0];

  // Search & Filter state
  const [search, setSearch] = useState('');
  const [quickFilter, setQuickFilter] = useState<
    'all' | 'today' | 'upcoming' | 'overdue' | 'high_priority' | 'blocked' | 'waiting' | 'completed'
  >('all');
  const [selectedProject, setSelectedProject] = useState<string>('all');
  const [selectedStatus, setSelectedStatus] = useState<string>('all');
  const [selectedPriority, setSelectedPriority] = useState<string>('all');
  const [selectedType, setSelectedType] = useState<string>('all');
  const [sortBy, setSortBy] = useState<'due_date' | 'priority' | 'created_at' | 'title'>('due_date');
  const [sortOrder, setSortOrder] = useState<'asc' | 'desc'>('asc');

  // Inline status dropdown state
  const [openDropdownId, setOpenDropdownId] = useState<string | null>(null);

  const filteredTasks = useMemo(() => {
    return tasks
      .filter((task) => {
        // Search
        if (search.trim()) {
          const q = search.toLowerCase();
          const matchTitle = task.title.toLowerCase().includes(q);
          const matchDesc = task.description?.toLowerCase().includes(q);
          const matchNext = task.next_action?.toLowerCase().includes(q);
          if (!matchTitle && !matchDesc && !matchNext) return false;
        }

        // Quick filter
        if (quickFilter === 'today' && task.due_date !== today) return false;
        if (quickFilter === 'upcoming' && task.due_date <= today) return false;
        if (quickFilter === 'overdue' && (task.due_date >= today || task.status === 'Done')) return false;
        if (quickFilter === 'high_priority' && task.priority !== 'High' && task.priority !== 'Critical') return false;
        if (quickFilter === 'blocked' && task.status !== 'Blocked') return false;
        if (quickFilter === 'waiting' && task.status !== 'Waiting') return false;
        if (quickFilter === 'completed' && task.status !== 'Done') return false;

        // Dropdowns
        if (selectedProject !== 'all' && task.project_id !== selectedProject) return false;
        if (selectedStatus !== 'all' && task.status !== selectedStatus) return false;
        if (selectedPriority !== 'all' && task.priority !== selectedPriority) return false;
        if (selectedType !== 'all' && task.task_type !== selectedType) return false;

        return true;
      })
      .sort((a, b) => {
        let comp = 0;
        if (sortBy === 'due_date') {
          comp = a.due_date.localeCompare(b.due_date);
        } else if (sortBy === 'priority') {
          const rank: Record<Priority, number> = { Critical: 4, High: 3, Medium: 2, Low: 1 };
          comp = (rank[b.priority] || 0) - (rank[a.priority] || 0);
        } else if (sortBy === 'created_at') {
          comp = new Date(b.created_at).getTime() - new Date(a.created_at).getTime();
        } else if (sortBy === 'title') {
          comp = a.title.localeCompare(b.title);
        }
        return sortOrder === 'asc' ? comp : -comp;
      });
  }, [
    tasks,
    search,
    quickFilter,
    selectedProject,
    selectedStatus,
    selectedPriority,
    selectedType,
    sortBy,
    sortOrder,
    today,
  ]);

  const quickFilterPills = [
    { id: 'all', label: 'All Tasks' },
    { id: 'today', label: "Today's Tasks" },
    { id: 'high_priority', label: 'High Priority' },
    { id: 'overdue', label: 'Overdue' },
    { id: 'blocked', label: 'Blocked' },
    { id: 'waiting', label: 'Waiting' },
    { id: 'upcoming', label: 'Upcoming' },
    { id: 'completed', label: 'Completed' },
  ] as const;

  const allStatuses: TaskStatus[] = [
    'To Do',
    'In Progress',
    'Waiting',
    'Blocked',
    'Done',
    'Cancelled',
  ];

  const getPriorityBadge = (priority: Priority) => {
    switch (priority) {
      case 'Critical':
        return 'bg-red-100 text-red-700 dark:bg-red-900/60 dark:text-red-300';
      case 'High':
        return 'bg-orange-100 text-orange-700 dark:bg-orange-900/60 dark:text-orange-300';
      case 'Medium':
        return 'bg-blue-100 text-blue-700 dark:bg-blue-900/60 dark:text-blue-300';
      default:
        return 'bg-slate-100 text-slate-700 dark:bg-slate-800 dark:text-slate-300';
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
      default:
        return 'bg-slate-100 text-slate-800 dark:bg-slate-800 dark:text-slate-300 border-slate-300 dark:border-slate-700';
    }
  };

  return (
    <div className="space-y-6 max-w-7xl mx-auto pb-12">
      {/* Top Section */}
      <div className="flex flex-wrap items-center justify-between gap-4">
        <div>
          <h1 className="text-xl sm:text-2xl font-bold text-slate-900 dark:text-white tracking-tight">
            My Tasks
          </h1>
          <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
            Manage your deliverables, track progress, and log updates.
          </p>
        </div>
        <button
          onClick={() => openQuickAdd('task')}
          className="inline-flex items-center space-x-1.5 px-4 py-2 text-xs font-semibold rounded-xl bg-blue-600 hover:bg-blue-700 text-white shadow-sm transition-all"
        >
          <Plus className="w-4 h-4" />
          <span>Add Task</span>
        </button>
      </div>

      {/* Quick Filter Tabs */}
      <div className="flex items-center space-x-2 overflow-x-auto pb-1">
        {quickFilterPills.map((pill) => {
          const isActive = quickFilter === pill.id;
          return (
            <button
              key={pill.id}
              onClick={() => setQuickFilter(pill.id)}
              className={`
                whitespace-nowrap px-3 py-1.5 rounded-lg text-xs font-semibold transition-all
                ${
                  isActive
                    ? 'bg-blue-600 text-white shadow-sm'
                    : 'bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 text-slate-600 dark:text-slate-400 hover:bg-slate-50 dark:hover:bg-slate-800'
                }
              `}
            >
              {pill.label}
            </button>
          );
        })}
      </div>

      {/* Search & Granular Dropdown Filters */}
      <div className="p-4 rounded-xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-sm space-y-3">
        <div className="flex flex-wrap items-center gap-3">
          {/* Search Box */}
          <div className="flex-1 min-w-[200px] relative">
            <Search className="w-4 h-4 text-slate-400 absolute left-3 top-2.5" />
            <input
              type="text"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="Search tasks by name, next action..."
              className="w-full pl-9 pr-4 py-1.5 text-xs rounded-lg bg-slate-50 dark:bg-slate-800/80 border border-slate-200 dark:border-slate-700 text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
          </div>

          {/* Project Dropdown */}
          <select
            value={selectedProject}
            onChange={(e) => setSelectedProject(e.target.value)}
            className="px-3 py-1.5 text-xs rounded-lg bg-slate-50 dark:bg-slate-800/80 border border-slate-200 dark:border-slate-700 text-slate-900 dark:text-white"
          >
            <option value="all">All Projects</option>
            {projects.map((p) => (
              <option key={p.id} value={p.id}>
                {p.name}
              </option>
            ))}
          </select>

          {/* Status Dropdown */}
          <select
            value={selectedStatus}
            onChange={(e) => setSelectedStatus(e.target.value)}
            className="px-3 py-1.5 text-xs rounded-lg bg-slate-50 dark:bg-slate-800/80 border border-slate-200 dark:border-slate-700 text-slate-900 dark:text-white"
          >
            <option value="all">All Statuses</option>
            {allStatuses.map((st) => (
              <option key={st} value={st}>
                {st}
              </option>
            ))}
          </select>

          {/* Priority Dropdown */}
          <select
            value={selectedPriority}
            onChange={(e) => setSelectedPriority(e.target.value)}
            className="px-3 py-1.5 text-xs rounded-lg bg-slate-50 dark:bg-slate-800/80 border border-slate-200 dark:border-slate-700 text-slate-900 dark:text-white"
          >
            <option value="all">All Priorities</option>
            {['Low', 'Medium', 'High', 'Critical'].map((pr) => (
              <option key={pr} value={pr}>
                {pr}
              </option>
            ))}
          </select>

          {/* Sort By Dropdown */}
          <div className="flex items-center space-x-1">
            <select
              value={sortBy}
              onChange={(e) => setSortBy(e.target.value as any)}
              className="px-3 py-1.5 text-xs rounded-lg bg-slate-50 dark:bg-slate-800/80 border border-slate-200 dark:border-slate-700 text-slate-900 dark:text-white"
            >
              <option value="due_date">Sort: Due Date</option>
              <option value="priority">Sort: Priority</option>
              <option value="created_at">Sort: Created</option>
              <option value="title">Sort: Title</option>
            </select>
            <button
              onClick={() => setSortOrder(sortOrder === 'asc' ? 'desc' : 'asc')}
              className="p-1.5 rounded-lg border border-slate-200 dark:border-slate-700 text-slate-500 hover:text-slate-800 dark:hover:text-slate-200"
              title="Toggle sort order"
            >
              <ArrowUpDown className="w-3.5 h-3.5" />
            </button>
          </div>
        </div>
      </div>

      {/* Tasks Table */}
      <div className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-sm overflow-hidden">
        {filteredTasks.length === 0 ? (
          <div className="py-16 text-center">
            <CheckCircle2 className="w-10 h-10 text-slate-300 dark:text-slate-600 mx-auto mb-2" />
            <p className="text-sm font-semibold text-slate-700 dark:text-slate-300">
              No tasks matching current filters
            </p>
            <p className="text-xs text-slate-400 mt-1">
              Try adjusting your search query or reset the filters.
            </p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="border-b border-slate-200 dark:border-slate-800 bg-slate-50/70 dark:bg-slate-800/40 text-[11px] font-semibold uppercase tracking-wider text-slate-500 dark:text-slate-400">
                  <th className="py-3 px-6">Task</th>
                  <th className="py-3 px-4">Project</th>
                  <th className="py-3 px-3">Type</th>
                  <th className="py-3 px-3">Priority</th>
                  <th className="py-3 px-4">Status</th>
                  <th className="py-3 px-4">Due Date</th>
                  <th className="py-3 px-4">Progress</th>
                  <th className="py-3 px-6 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 dark:divide-slate-800 text-xs">
                {filteredTasks.map((task) => {
                  const project = projects.find((p) => p.id === task.project_id);
                  const isDropdownOpen = openDropdownId === task.id;
                  const isOverdue = task.due_date < today && task.status !== 'Done';

                  return (
                    <tr
                      key={task.id}
                      className="hover:bg-slate-50/80 dark:hover:bg-slate-800/50 transition-colors"
                    >
                      {/* Title & Next Action */}
                      <td className="py-3.5 px-6 min-w-[220px]">
                        <div className="font-semibold text-slate-900 dark:text-white flex items-center space-x-2">
                          <span
                            className={
                              task.status === 'Done' ? 'line-through text-slate-400' : ''
                            }
                          >
                            {task.title}
                          </span>
                          {task.is_recurring && (
                            <span title="Recurring task">
                              <Repeat className="w-3 h-3 text-blue-500" />
                            </span>
                          )}
                        </div>
                        {task.next_action && (
                          <div className="text-[11px] text-slate-500 dark:text-slate-400 mt-0.5">
                            <span className="text-blue-600 dark:text-blue-400 font-medium">Next:</span>{' '}
                            {task.next_action}
                          </div>
                        )}
                      </td>

                      {/* Project */}
                      <td className="py-3.5 px-4 whitespace-nowrap">
                        <span className="font-medium text-slate-700 dark:text-slate-300">
                          {project?.name || 'Project'}
                        </span>
                      </td>

                      {/* Type */}
                      <td className="py-3.5 px-3 whitespace-nowrap text-slate-500 dark:text-slate-400">
                        {task.task_type}
                      </td>

                      {/* Priority */}
                      <td className="py-3.5 px-3 whitespace-nowrap">
                        <span
                          className={`text-[10px] font-bold px-2 py-0.5 rounded-full ${getPriorityBadge(
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
                              setOpenDropdownId(isDropdownOpen ? null : task.id)
                            }
                            className={`inline-flex items-center space-x-1 px-2.5 py-1 rounded-lg text-xs font-bold border transition-colors ${getStatusBadge(
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
                                  onClick={() => {
                                    updateTaskStatus(task.id, st);
                                    setOpenDropdownId(null);
                                  }}
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

                      {/* Due Date */}
                      <td className="py-3.5 px-4 whitespace-nowrap">
                        <span
                          className={`font-medium ${
                            isOverdue
                              ? 'text-red-600 dark:text-red-400 font-bold'
                              : task.due_date === today
                              ? 'text-amber-600 dark:text-amber-400 font-bold'
                              : 'text-slate-600 dark:text-slate-400'
                          }`}
                        >
                          {task.due_date === today
                            ? 'Today'
                            : isOverdue
                            ? `Overdue (${task.due_date})`
                            : task.due_date}
                        </span>
                      </td>

                      {/* Progress */}
                      <td className="py-3.5 px-4 whitespace-nowrap min-w-[110px]">
                        <div className="flex items-center space-x-2">
                          <div className="flex-1 bg-slate-100 dark:bg-slate-800 rounded-full h-1.5 overflow-hidden">
                            <div
                              className="bg-blue-600 h-full rounded-full"
                              style={{ width: `${task.progress}%` }}
                            />
                          </div>
                          <span className="text-[11px] font-semibold text-slate-500">
                            {task.progress}%
                          </span>
                        </div>
                      </td>

                      {/* Actions */}
                      <td className="py-3.5 px-6 text-right whitespace-nowrap space-x-1.5">
                        <button
                          onClick={() => openQuickUpdate(task)}
                          className="px-2.5 py-1 text-xs font-semibold rounded-lg bg-slate-100 dark:bg-slate-800 hover:bg-blue-50 dark:hover:bg-blue-950/60 text-slate-700 dark:text-slate-300 hover:text-blue-600 transition-colors inline-flex items-center space-x-1"
                          title="Quick Update"
                        >
                          <FileEdit className="w-3 h-3" />
                          <span>Update</span>
                        </button>
                        <button
                          onClick={() => openHistory(task)}
                          className="p-1 text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 rounded-lg hover:bg-slate-100 dark:hover:bg-slate-800"
                          title="Activity History"
                        >
                          <History className="w-3.5 h-3.5" />
                        </button>
                        <button
                          onClick={() => {
                            if (confirm(`Delete task "${task.title}"?`)) {
                              deleteTask(task.id);
                            }
                          }}
                          className="p-1 text-slate-400 hover:text-red-600 rounded-lg hover:bg-red-50 dark:hover:bg-red-950/40"
                          title="Delete Task"
                        >
                          <Trash2 className="w-3.5 h-3.5" />
                        </button>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
}
