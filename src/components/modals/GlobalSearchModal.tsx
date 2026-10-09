'use client';

import React, { useState, useMemo } from 'react';
import { useWorkOS } from '@/context/WorkOSContext';
import {
  Search,
  X,
  CheckSquare,
  FolderKanban,
  UserCheck,
  Video,
  AlertOctagon,
  BookOpenText,
  Award,
  ArrowRight,
} from 'lucide-react';

export default function GlobalSearchModal() {
  const {
    isSearchOpen,
    setIsSearchOpen,
    tasks,
    projects,
    followups,
    meetings,
    issues,
    dailyLogs,
    achievements,
    setActiveTab,
    setSelectedProjectId,
    openQuickUpdate,
  } = useWorkOS();

  const [query, setQuery] = useState('');

  const results = useMemo(() => {
    if (!query.trim()) return null;
    const q = query.toLowerCase();

    const matchedTasks = tasks.filter(
      (t) =>
        t.title.toLowerCase().includes(q) ||
        t.description?.toLowerCase().includes(q) ||
        t.next_action?.toLowerCase().includes(q)
    );

    const matchedProjects = projects.filter(
      (p) =>
        p.name.toLowerCase().includes(q) ||
        p.description?.toLowerCase().includes(q)
    );

    const matchedFollowups = followups.filter(
      (f) =>
        f.person.toLowerCase().includes(q) ||
        f.topic.toLowerCase().includes(q) ||
        f.expected_action.toLowerCase().includes(q)
    );

    const matchedMeetings = meetings.filter(
      (m) =>
        m.title.toLowerCase().includes(q) ||
        m.participants.toLowerCase().includes(q) ||
        m.agenda?.toLowerCase().includes(q) ||
        m.decisions?.toLowerCase().includes(q)
    );

    const matchedIssues = issues.filter(
      (i) =>
        i.title.toLowerCase().includes(q) ||
        i.description.toLowerCase().includes(q) ||
        i.owner.toLowerCase().includes(q)
    );

    const matchedLogs = dailyLogs.filter(
      (l) =>
        l.worked_on.toLowerCase().includes(q) ||
        l.completed.toLowerCase().includes(q) ||
        l.summary.toLowerCase().includes(q)
    );

    const matchedAchievements = achievements.filter(
      (a) =>
        a.title.toLowerCase().includes(q) ||
        a.impact.toLowerCase().includes(q)
    );

    const totalCount =
      matchedTasks.length +
      matchedProjects.length +
      matchedFollowups.length +
      matchedMeetings.length +
      matchedIssues.length +
      matchedLogs.length +
      matchedAchievements.length;

    return {
      tasks: matchedTasks,
      projects: matchedProjects,
      followups: matchedFollowups,
      meetings: matchedMeetings,
      issues: matchedIssues,
      dailyLogs: matchedLogs,
      achievements: matchedAchievements,
      totalCount,
    };
  }, [query, tasks, projects, followups, meetings, issues, dailyLogs, achievements]);

  if (!isSearchOpen) return null;

  const navigateTo = (tab: string, extra?: () => void) => {
    setActiveTab(tab);
    if (extra) extra();
    setIsSearchOpen(false);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-start justify-center pt-16 sm:pt-24 p-4 bg-slate-900/60 backdrop-blur-sm animate-in fade-in duration-150">
      <div className="w-full max-w-2xl bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-2xl overflow-hidden flex flex-col max-h-[80vh]">
        {/* Search Input Bar */}
        <div className="px-4 py-3 border-b border-slate-200 dark:border-slate-800 flex items-center space-x-3">
          <Search className="w-5 h-5 text-slate-400 shrink-0" />
          <input
            autoFocus
            type="text"
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder="Search across tasks, projects, follow-ups, meetings, issues, logs..."
            className="flex-1 bg-transparent border-0 text-sm font-medium text-slate-900 dark:text-white placeholder:text-slate-400 focus:outline-none"
          />
          {query && (
            <button
              onClick={() => setQuery('')}
              className="p-1 rounded text-slate-400 hover:text-slate-600"
            >
              <X className="w-4 h-4" />
            </button>
          )}
          <kbd
            onClick={() => setIsSearchOpen(false)}
            className="cursor-pointer text-[10px] px-2 py-0.5 rounded bg-slate-100 dark:bg-slate-800 border border-slate-300 dark:border-slate-700 text-slate-500 hover:text-slate-800"
          >
            ESC
          </kbd>
        </div>

        {/* Results Body */}
        <div className="p-4 overflow-y-auto flex-1 space-y-4">
          {!results ? (
            <div className="py-10 text-center">
              <Search className="w-8 h-8 text-slate-300 dark:text-slate-600 mx-auto mb-2" />
              <p className="text-xs font-semibold text-slate-600 dark:text-slate-400">
                Type something to search across your workspace
              </p>
              <p className="text-[11px] text-slate-400 mt-1">
                Try &quot;Attendance API&quot;, &quot;Assam IDP&quot;, or &quot;UAT&quot;
              </p>
            </div>
          ) : results.totalCount === 0 ? (
            <div className="py-10 text-center text-xs text-slate-500">
              No results found for &quot;{query}&quot;
            </div>
          ) : (
            <div>
              {/* Category Pill Summary */}
              <div className="flex flex-wrap gap-2 pb-3 border-b border-slate-100 dark:border-slate-800 text-[11px] font-semibold text-slate-600 dark:text-slate-400">
                {results.tasks.length > 0 && (
                  <span className="px-2 py-0.5 rounded-full bg-blue-50 dark:bg-blue-900/40 text-blue-600 dark:text-blue-300">
                    Tasks: {results.tasks.length}
                  </span>
                )}
                {results.projects.length > 0 && (
                  <span className="px-2 py-0.5 rounded-full bg-indigo-50 dark:bg-indigo-900/40 text-indigo-600 dark:text-indigo-300">
                    Projects: {results.projects.length}
                  </span>
                )}
                {results.meetings.length > 0 && (
                  <span className="px-2 py-0.5 rounded-full bg-purple-50 dark:bg-purple-900/40 text-purple-600 dark:text-purple-300">
                    Meetings: {results.meetings.length}
                  </span>
                )}
                {results.followups.length > 0 && (
                  <span className="px-2 py-0.5 rounded-full bg-amber-50 dark:bg-amber-900/40 text-amber-600 dark:text-amber-300">
                    Follow-ups: {results.followups.length}
                  </span>
                )}
                {results.issues.length > 0 && (
                  <span className="px-2 py-0.5 rounded-full bg-red-50 dark:bg-red-900/40 text-red-600 dark:text-red-300">
                    Issues: {results.issues.length}
                  </span>
                )}
                {results.dailyLogs.length > 0 && (
                  <span className="px-2 py-0.5 rounded-full bg-emerald-50 dark:bg-emerald-900/40 text-emerald-600 dark:text-emerald-300">
                    Work Logs: {results.dailyLogs.length}
                  </span>
                )}
                {results.achievements.length > 0 && (
                  <span className="px-2 py-0.5 rounded-full bg-yellow-50 dark:bg-yellow-900/40 text-yellow-600 dark:text-yellow-300">
                    Achievements: {results.achievements.length}
                  </span>
                )}
              </div>

              {/* Items List */}
              <div className="space-y-3 mt-3">
                {/* Tasks */}
                {results.tasks.map((task) => (
                  <button
                    key={task.id}
                    onClick={() =>
                      navigateTo('tasks', () => openQuickUpdate(task))
                    }
                    className="w-full text-left p-2.5 rounded-xl hover:bg-slate-50 dark:hover:bg-slate-800 border border-transparent hover:border-slate-200 dark:hover:border-slate-700 transition-colors flex items-center justify-between"
                  >
                    <div className="flex items-center space-x-2.5 min-w-0">
                      <CheckSquare className="w-4 h-4 text-blue-600 shrink-0" />
                      <div className="truncate">
                        <p className="text-xs font-semibold text-slate-900 dark:text-white truncate">
                          {task.title}
                        </p>
                        <p className="text-[11px] text-slate-500 dark:text-slate-400">
                          Task • {task.status} • {task.priority} Priority
                        </p>
                      </div>
                    </div>
                    <ArrowRight className="w-3.5 h-3.5 text-slate-400 shrink-0" />
                  </button>
                ))}

                {/* Projects */}
                {results.projects.map((proj) => (
                  <button
                    key={proj.id}
                    onClick={() =>
                      navigateTo('projects', () => setSelectedProjectId(proj.id))
                    }
                    className="w-full text-left p-2.5 rounded-xl hover:bg-slate-50 dark:hover:bg-slate-800 border border-transparent hover:border-slate-200 dark:hover:border-slate-700 transition-colors flex items-center justify-between"
                  >
                    <div className="flex items-center space-x-2.5 min-w-0">
                      <FolderKanban className="w-4 h-4 text-indigo-600 shrink-0" />
                      <div className="truncate">
                        <p className="text-xs font-semibold text-slate-900 dark:text-white truncate">
                          {proj.name}
                        </p>
                        <p className="text-[11px] text-slate-500 dark:text-slate-400 truncate">
                          Project • {proj.description}
                        </p>
                      </div>
                    </div>
                    <ArrowRight className="w-3.5 h-3.5 text-slate-400 shrink-0" />
                  </button>
                ))}

                {/* Follow-ups */}
                {results.followups.map((fol) => (
                  <button
                    key={fol.id}
                    onClick={() => navigateTo('followups')}
                    className="w-full text-left p-2.5 rounded-xl hover:bg-slate-50 dark:hover:bg-slate-800 border border-transparent hover:border-slate-200 dark:hover:border-slate-700 transition-colors flex items-center justify-between"
                  >
                    <div className="flex items-center space-x-2.5 min-w-0">
                      <UserCheck className="w-4 h-4 text-amber-600 shrink-0" />
                      <div className="truncate">
                        <p className="text-xs font-semibold text-slate-900 dark:text-white truncate">
                          {fol.person}: {fol.topic}
                        </p>
                        <p className="text-[11px] text-slate-500 dark:text-slate-400">
                          Follow-up • Due: {fol.followup_date} • {fol.status}
                        </p>
                      </div>
                    </div>
                    <ArrowRight className="w-3.5 h-3.5 text-slate-400 shrink-0" />
                  </button>
                ))}

                {/* Meetings */}
                {results.meetings.map((mtg) => (
                  <button
                    key={mtg.id}
                    onClick={() => navigateTo('meetings')}
                    className="w-full text-left p-2.5 rounded-xl hover:bg-slate-50 dark:hover:bg-slate-800 border border-transparent hover:border-slate-200 dark:hover:border-slate-700 transition-colors flex items-center justify-between"
                  >
                    <div className="flex items-center space-x-2.5 min-w-0">
                      <Video className="w-4 h-4 text-purple-600 shrink-0" />
                      <div className="truncate">
                        <p className="text-xs font-semibold text-slate-900 dark:text-white truncate">
                          {mtg.title}
                        </p>
                        <p className="text-[11px] text-slate-500 dark:text-slate-400">
                          Meeting • {mtg.meeting_date} at {mtg.start_time}
                        </p>
                      </div>
                    </div>
                    <ArrowRight className="w-3.5 h-3.5 text-slate-400 shrink-0" />
                  </button>
                ))}

                {/* Issues */}
                {results.issues.map((iss) => (
                  <button
                    key={iss.id}
                    onClick={() => navigateTo('issues')}
                    className="w-full text-left p-2.5 rounded-xl hover:bg-slate-50 dark:hover:bg-slate-800 border border-transparent hover:border-slate-200 dark:hover:border-slate-700 transition-colors flex items-center justify-between"
                  >
                    <div className="flex items-center space-x-2.5 min-w-0">
                      <AlertOctagon className="w-4 h-4 text-red-600 shrink-0" />
                      <div className="truncate">
                        <p className="text-xs font-semibold text-slate-900 dark:text-white truncate">
                          {iss.title}
                        </p>
                        <p className="text-[11px] text-slate-500 dark:text-slate-400">
                          Issue • {iss.severity} Severity • {iss.status}
                        </p>
                      </div>
                    </div>
                    <ArrowRight className="w-3.5 h-3.5 text-slate-400 shrink-0" />
                  </button>
                ))}
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
