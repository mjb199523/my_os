'use client';

import React, { useState, useMemo } from 'react';
import { useWorkOS } from '@/context/WorkOSContext';
import { IssueStatus, IssueSeverity } from '@/types';
import {
  AlertOctagon,
  Plus,
  CheckCircle2,
  Trash2,
  Clock,
  ExternalLink,
  ChevronDown,
} from 'lucide-react';

export default function IssuesView() {
  const {
    issues,
    projects,
    tasks,
    resolveIssue,
    deleteIssue,
    updateIssue,
    openQuickAdd,
    openQuickUpdate,
  } = useWorkOS();

  const [severityFilter, setSeverityFilter] = useState<string>('all');
  const [statusFilter, setStatusFilter] = useState<string>('all');

  const filteredIssues = useMemo(() => {
    return issues.filter((i) => {
      if (severityFilter !== 'all' && i.severity !== severityFilter) return false;
      if (statusFilter !== 'all' && i.status !== statusFilter) return false;
      return true;
    });
  }, [issues, severityFilter, statusFilter]);

  const getSeverityBadge = (sev: IssueSeverity) => {
    switch (sev) {
      case 'Critical':
        return 'bg-red-100 text-red-800 dark:bg-red-950/60 dark:text-red-300 border-red-300 dark:border-red-800 animate-pulse';
      case 'High':
        return 'bg-orange-100 text-orange-800 dark:bg-orange-950/60 dark:text-orange-300 border-orange-300 dark:border-orange-800';
      case 'Medium':
        return 'bg-blue-100 text-blue-800 dark:bg-blue-950/60 dark:text-blue-300 border-blue-300 dark:border-blue-800';
      default:
        return 'bg-slate-100 text-slate-800 dark:bg-slate-800 dark:text-slate-300 border-slate-300 dark:border-slate-700';
    }
  };

  const getStatusBadge = (st: IssueStatus) => {
    switch (st) {
      case 'Resolved':
      case 'Closed':
        return 'bg-emerald-100 text-emerald-800 dark:bg-emerald-950/60 dark:text-emerald-300';
      case 'Investigating':
        return 'bg-purple-100 text-purple-800 dark:bg-purple-950/60 dark:text-purple-300';
      case 'Waiting':
        return 'bg-amber-100 text-amber-800 dark:bg-amber-950/60 dark:text-amber-300';
      default:
        return 'bg-red-100 text-red-800 dark:bg-red-950/60 dark:text-red-300';
    }
  };

  return (
    <div className="space-y-6 max-w-7xl mx-auto pb-12">
      {/* Header */}
      <div className="flex flex-wrap items-center justify-between gap-4">
        <div>
          <h1 className="text-xl sm:text-2xl font-bold text-slate-900 dark:text-white tracking-tight">
            Issues &amp; Blockers
          </h1>
          <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
            Log technical impediments, track resolution ETAs, and link to blocked tasks.
          </p>
        </div>
        <button
          onClick={() => openQuickAdd('issue')}
          className="inline-flex items-center space-x-1.5 px-4 py-2 text-xs font-semibold rounded-xl bg-blue-600 hover:bg-blue-700 text-white shadow-sm transition-all"
        >
          <Plus className="w-4 h-4" />
          <span>Log Issue</span>
        </button>
      </div>

      {/* Filter Row */}
      <div className="flex items-center space-x-3">
        <select
          value={severityFilter}
          onChange={(e) => setSeverityFilter(e.target.value)}
          className="px-3 py-1.5 text-xs rounded-lg bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 text-slate-800 dark:text-slate-200"
        >
          <option value="all">All Severities</option>
          {['Critical', 'High', 'Medium', 'Low'].map((s) => (
            <option key={s} value={s}>
              {s}
            </option>
          ))}
        </select>

        <select
          value={statusFilter}
          onChange={(e) => setStatusFilter(e.target.value)}
          className="px-3 py-1.5 text-xs rounded-lg bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 text-slate-800 dark:text-slate-200"
        >
          <option value="all">All Statuses</option>
          {['Open', 'Investigating', 'Waiting', 'Resolved', 'Closed'].map((s) => (
            <option key={s} value={s}>
              {s}
            </option>
          ))}
        </select>
      </div>

      {/* Issues Grid / Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {filteredIssues.length === 0 ? (
          <div className="col-span-full py-16 text-center bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800">
            <CheckCircle2 className="w-10 h-10 text-emerald-500 mx-auto mb-2 opacity-80" />
            <p className="text-sm font-semibold text-slate-700 dark:text-slate-300">
              No issues logged matching these filters!
            </p>
          </div>
        ) : (
          filteredIssues.map((issue) => {
            const project = projects.find((p) => p.id === issue.project_id);
            const linkedTask = tasks.find((t) => t.id === issue.task_id);

            return (
              <div
                key={issue.id}
                className="p-5 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-sm flex flex-col justify-between space-y-4"
              >
                <div>
                  <div className="flex items-center justify-between mb-2">
                    <span
                      className={`text-[10px] font-bold px-2.5 py-0.5 rounded-full border ${getSeverityBadge(
                        issue.severity
                      )}`}
                    >
                      {issue.severity}
                    </span>
                    <span
                      className={`text-[10px] font-bold px-2 py-0.5 rounded-full ${getStatusBadge(
                        issue.status
                      )}`}
                    >
                      {issue.status}
                    </span>
                  </div>

                  <h3 className="text-sm font-bold text-slate-900 dark:text-white">
                    {issue.title}
                  </h3>
                  <p className="text-xs text-slate-600 dark:text-slate-400 mt-1">
                    {issue.description}
                  </p>

                  {/* Linked Task badge (Section 17) */}
                  {linkedTask && (
                    <div
                      onClick={() => openQuickUpdate(linkedTask)}
                      className="cursor-pointer mt-3 p-2 rounded-lg bg-blue-50/60 dark:bg-blue-950/40 border border-blue-200/60 dark:border-blue-900/40 flex items-center justify-between text-xs text-blue-700 dark:text-blue-300"
                    >
                      <span className="truncate font-medium">
                        Linked Task: {linkedTask.title}
                      </span>
                      <ExternalLink className="w-3 h-3 shrink-0 ml-1" />
                    </div>
                  )}
                </div>

                <div className="pt-3 border-t border-slate-100 dark:border-slate-800 flex items-center justify-between text-xs text-slate-500">
                  <div>
                    <span>Owner: {issue.owner}</span>
                    {issue.expected_resolution && (
                      <span className="ml-3">ETA: {issue.expected_resolution}</span>
                    )}
                  </div>

                  <div className="flex items-center space-x-2">
                    {issue.status !== 'Resolved' && issue.status !== 'Closed' && (
                      <button
                        onClick={() => resolveIssue(issue.id)}
                        className="px-2.5 py-1 text-[11px] font-semibold rounded-lg bg-emerald-50 hover:bg-emerald-100 dark:bg-emerald-950/40 text-emerald-700 dark:text-emerald-300 border border-emerald-200 dark:border-emerald-800 transition-colors"
                      >
                        Resolve ✓
                      </button>
                    )}
                    <button
                      onClick={() => {
                        if (confirm(`Delete issue "${issue.title}"?`)) {
                          deleteIssue(issue.id);
                        }
                      }}
                      className="p-1 text-slate-400 hover:text-red-600 rounded-lg"
                    >
                      <Trash2 className="w-3.5 h-3.5" />
                    </button>
                  </div>
                </div>
              </div>
            );
          })
        )}
      </div>
    </div>
  );
}
