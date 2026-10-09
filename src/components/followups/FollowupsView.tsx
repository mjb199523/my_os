'use client';

import React, { useState, useMemo } from 'react';
import { useWorkOS } from '@/context/WorkOSContext';
import { FollowupStatus } from '@/types';
import {
  UserCheck,
  Plus,
  Search,
  CheckCircle2,
  Clock,
  AlertCircle,
  Trash2,
  ChevronDown,
} from 'lucide-react';

export default function FollowupsView() {
  const {
    followups,
    projects,
    updateFollowupStatus,
    deleteFollowup,
    openQuickAdd,
  } = useWorkOS();

  const today = new Date().toISOString().split('T')[0];

  const [search, setSearch] = useState('');
  const [filter, setFilter] = useState<'all' | 'due_today' | 'overdue' | 'pending' | 'completed'>('all');
  const [openStatusDropdownId, setOpenStatusDropdownId] = useState<string | null>(null);

  const filteredFollowups = useMemo(() => {
    return followups.filter((f) => {
      if (search.trim()) {
        const q = search.toLowerCase();
        const match =
          f.person.toLowerCase().includes(q) ||
          f.topic.toLowerCase().includes(q) ||
          f.expected_action.toLowerCase().includes(q);
        if (!match) return false;
      }

      if (filter === 'due_today') {
        return f.followup_date === today && f.status !== 'Completed';
      }
      if (filter === 'overdue') {
        return f.followup_date < today && f.status !== 'Completed';
      }
      if (filter === 'pending') {
        return f.status === 'Pending' || f.status === 'Waiting';
      }
      if (filter === 'completed') {
        return f.status === 'Completed';
      }

      return true;
    });
  }, [followups, search, filter, today]);

  const allStatuses: FollowupStatus[] = [
    'Pending',
    'Waiting',
    'Follow-up Due',
    'Completed',
    'Cancelled',
  ];

  const getStatusBadge = (status: FollowupStatus, date: string) => {
    if (status === 'Completed') {
      return 'bg-emerald-100 text-emerald-800 dark:bg-emerald-950/60 dark:text-emerald-300 border-emerald-300 dark:border-emerald-800';
    }
    if (date < today) {
      return 'bg-red-100 text-red-800 dark:bg-red-950/60 dark:text-red-300 border-red-300 dark:border-red-800';
    }
    if (date === today) {
      return 'bg-amber-100 text-amber-800 dark:bg-amber-950/60 dark:text-amber-300 border-amber-300 dark:border-amber-800 animate-pulse';
    }
    return 'bg-slate-100 text-slate-800 dark:bg-slate-800 dark:text-slate-300 border-slate-300 dark:border-slate-700';
  };

  return (
    <div className="space-y-6 max-w-7xl mx-auto pb-12">
      {/* Header */}
      <div className="flex flex-wrap items-center justify-between gap-4">
        <div>
          <h1 className="text-xl sm:text-2xl font-bold text-slate-900 dark:text-white tracking-tight">
            Follow-up Management
          </h1>
          <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
            Keep track of dependencies, vendor commitments, and cross-team actions.
          </p>
        </div>
        <button
          onClick={() => openQuickAdd('followup')}
          className="inline-flex items-center space-x-1.5 px-4 py-2 text-xs font-semibold rounded-xl bg-blue-600 hover:bg-blue-700 text-white shadow-sm transition-all"
        >
          <Plus className="w-4 h-4" />
          <span>New Follow-up</span>
        </button>
      </div>

      {/* Filter Tabs & Search */}
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div className="flex items-center space-x-2 overflow-x-auto pb-1">
          {[
            { id: 'all', label: 'All Follow-ups' },
            { id: 'due_today', label: 'Due Today' },
            { id: 'overdue', label: 'Overdue' },
            { id: 'pending', label: 'Pending' },
            { id: 'completed', label: 'Completed' },
          ].map((pill) => (
            <button
              key={pill.id}
              onClick={() => setFilter(pill.id as any)}
              className={`px-3 py-1.5 rounded-lg text-xs font-semibold whitespace-nowrap transition-all ${
                filter === pill.id
                  ? 'bg-blue-600 text-white shadow-sm'
                  : 'bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 text-slate-600 dark:text-slate-400 hover:bg-slate-50'
              }`}
            >
              {pill.label}
            </button>
          ))}
        </div>

        <div className="w-full sm:w-64 relative">
          <Search className="w-4 h-4 text-slate-400 absolute left-3 top-2.5" />
          <input
            type="text"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Search person or topic..."
            className="w-full pl-9 pr-3 py-1.5 text-xs rounded-lg bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700 text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-blue-500"
          />
        </div>
      </div>

      {/* Follow-up Table */}
      <div className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-sm overflow-hidden">
        {filteredFollowups.length === 0 ? (
          <div className="py-16 text-center">
            <UserCheck className="w-10 h-10 text-slate-300 dark:text-slate-600 mx-auto mb-2" />
            <p className="text-sm font-semibold text-slate-700 dark:text-slate-300">
              No follow-ups found
            </p>
            <p className="text-xs text-slate-400 mt-1">
              Add a follow-up or try changing the filter view.
            </p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="border-b border-slate-200 dark:border-slate-800 bg-slate-50/70 dark:bg-slate-800/40 text-[11px] font-semibold uppercase tracking-wider text-slate-500 dark:text-slate-400">
                  <th className="py-3 px-6">Person / Team</th>
                  <th className="py-3 px-4">Topic</th>
                  <th className="py-3 px-4">Project</th>
                  <th className="py-3 px-4">Last Discussion</th>
                  <th className="py-3 px-4">Expected Action</th>
                  <th className="py-3 px-4">Follow-up Date</th>
                  <th className="py-3 px-4">Status</th>
                  <th className="py-3 px-4 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 dark:divide-slate-800 text-xs">
                {filteredFollowups.map((fol) => {
                  const project = projects.find((p) => p.id === fol.project_id);
                  const isDropdownOpen = openStatusDropdownId === fol.id;
                  const isOverdue = fol.followup_date < today && fol.status !== 'Completed';
                  const isDueToday = fol.followup_date === today && fol.status !== 'Completed';

                  return (
                    <tr
                      key={fol.id}
                      className={`hover:bg-slate-50/80 dark:hover:bg-slate-800/50 transition-colors ${
                        isOverdue ? 'bg-red-50/20 dark:bg-red-950/10' : isDueToday ? 'bg-amber-50/20 dark:bg-amber-950/10' : ''
                      }`}
                    >
                      <td className="py-3.5 px-6 font-bold text-slate-900 dark:text-white whitespace-nowrap">
                        {fol.person}
                      </td>

                      <td className="py-3.5 px-4 font-medium text-slate-800 dark:text-slate-200 min-w-[180px]">
                        {fol.topic}
                      </td>

                      <td className="py-3.5 px-4 text-slate-600 dark:text-slate-400 whitespace-nowrap">
                        {project?.name || '—'}
                      </td>

                      <td className="py-3.5 px-4 text-slate-500 dark:text-slate-400 whitespace-nowrap">
                        {fol.last_discussion || '—'}
                      </td>

                      <td className="py-3.5 px-4 text-slate-700 dark:text-slate-300 min-w-[200px]">
                        {fol.expected_action}
                      </td>

                      <td className="py-3.5 px-4 whitespace-nowrap">
                        <span
                          className={`font-semibold ${
                            isOverdue
                              ? 'text-red-600 dark:text-red-400'
                              : isDueToday
                              ? 'text-amber-600 dark:text-amber-400 font-bold'
                              : 'text-slate-600 dark:text-slate-400'
                          }`}
                        >
                          {fol.followup_date === today
                            ? 'Due Today'
                            : isOverdue
                            ? `Overdue (${fol.followup_date})`
                            : fol.followup_date}
                        </span>
                      </td>

                      {/* Status Dropdown */}
                      <td className="py-3.5 px-4 whitespace-nowrap relative">
                        <div className="relative inline-block">
                          <button
                            onClick={() =>
                              setOpenStatusDropdownId(isDropdownOpen ? null : fol.id)
                            }
                            className={`inline-flex items-center space-x-1 px-2.5 py-1 rounded-lg text-xs font-bold border transition-colors ${getStatusBadge(
                              fol.status,
                              fol.followup_date
                            )}`}
                          >
                            <span>{fol.status}</span>
                            <ChevronDown className="w-3 h-3 opacity-70" />
                          </button>

                          {isDropdownOpen && (
                            <div className="absolute left-0 mt-1.5 w-36 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl shadow-xl z-30 py-1">
                              {allStatuses.map((st) => (
                                <button
                                  key={st}
                                  onClick={() => {
                                    updateFollowupStatus(fol.id, st);
                                    setOpenStatusDropdownId(null);
                                  }}
                                  className="w-full text-left px-3 py-1.5 text-xs font-medium hover:bg-slate-100 dark:hover:bg-slate-800 text-slate-700 dark:text-slate-300"
                                >
                                  {st}
                                </button>
                              ))}
                            </div>
                          )}
                        </div>
                      </td>

                      {/* Actions */}
                      <td className="py-3.5 px-4 text-right whitespace-nowrap">
                        <button
                          onClick={() => {
                            if (confirm(`Delete follow-up with ${fol.person}?`)) {
                              deleteFollowup(fol.id);
                            }
                          }}
                          className="p-1 text-slate-400 hover:text-red-600 rounded-lg hover:bg-red-50 dark:hover:bg-red-950/40"
                          title="Delete follow-up"
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
