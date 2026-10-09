'use client';

import React, { useState } from 'react';
import { useWorkOS } from '@/context/WorkOSContext';
import { Project, ProjectStatus, Priority } from '@/types';
import {
  FolderKanban,
  Plus,
  ArrowLeft,
  CheckCircle2,
  Clock,
  AlertOctagon,
  UserCheck,
  Video,
  Calendar,
  Layers,
  Flag,
  FileText,
  History,
  X,
} from 'lucide-react';

export default function ProjectsView() {
  const {
    projects,
    tasks,
    issues,
    followups,
    meetings,
    milestones,
    selectedProjectId,
    setSelectedProjectId,
    getProjectStats,
    addProject,
    addMilestone,
    toggleMilestoneStatus,
    openQuickAdd,
    openQuickUpdate,
  } = useWorkOS();

  // Create Project modal state
  const [isCreateOpen, setIsCreateOpen] = useState(false);
  const [name, setName] = useState('');
  const [description, setDescription] = useState('');
  const [priority, setPriority] = useState<Priority>('High');
  const [status, setStatus] = useState<ProjectStatus>('Active');
  const [startDate, setStartDate] = useState(new Date().toISOString().split('T')[0]);
  const [endDate, setEndDate] = useState(new Date(Date.now() + 60 * 86400000).toISOString().split('T')[0]);
  const [tags, setTags] = useState('');

  // Project Detail Tab state
  const [detailTab, setDetailTab] = useState<
    'tasks' | 'issues' | 'followups' | 'meetings' | 'milestones'
  >('tasks');

  // Milestone input state
  const [newMilestoneTitle, setNewMilestoneTitle] = useState('');
  const [newMilestoneDate, setNewMilestoneDate] = useState('');

  const selectedProject = projects.find((p) => p.id === selectedProjectId);

  const handleCreateProject = (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim()) return;
    addProject({
      name: name.trim(),
      description,
      priority,
      status,
      start_date: startDate,
      end_date: endDate,
      tags: tags ? tags.split(',').map((t) => t.trim()) : [],
    });
    setName('');
    setDescription('');
    setTags('');
    setIsCreateOpen(false);
  };

  const handleAddMilestone = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newMilestoneTitle.trim() || !selectedProjectId) return;
    addMilestone({
      project_id: selectedProjectId,
      title: newMilestoneTitle.trim(),
      due_date: newMilestoneDate || new Date().toISOString().split('T')[0],
      status: 'Pending',
    });
    setNewMilestoneTitle('');
    setNewMilestoneDate('');
  };

  // If a project is selected, render the PROJECT DETAIL VIEW (Section 13)
  if (selectedProject) {
    const stats = getProjectStats(selectedProject.id);
    const projectTasks = tasks.filter((t) => t.project_id === selectedProject.id);
    const projectIssues = issues.filter((i) => i.project_id === selectedProject.id);
    const projectFollowups = followups.filter((f) => f.project_id === selectedProject.id);
    const projectMeetings = meetings.filter((m) => m.project_id === selectedProject.id);
    const projectMilestones = milestones.filter((m) => m.project_id === selectedProject.id);

    return (
      <div className="space-y-6 max-w-7xl mx-auto pb-12">
        {/* Back navigation & Header */}
        <div>
          <button
            onClick={() => setSelectedProjectId(null)}
            className="inline-flex items-center space-x-1.5 text-xs font-semibold text-slate-500 hover:text-slate-800 dark:hover:text-slate-200 mb-3 transition-colors"
          >
            <ArrowLeft className="w-3.5 h-3.5" />
            <span>Back to Projects</span>
          </button>

          <div className="flex flex-wrap items-center justify-between gap-4">
            <div>
              <div className="flex items-center space-x-3">
                <h1 className="text-xl sm:text-2xl font-bold text-slate-900 dark:text-white">
                  {selectedProject.name}
                </h1>
                <span className="text-[11px] font-bold px-2.5 py-0.5 rounded-full bg-blue-100 dark:bg-blue-950/60 text-blue-700 dark:text-blue-300">
                  {selectedProject.status}
                </span>
                <span className="text-[11px] font-bold px-2 py-0.5 rounded-full bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300">
                  {selectedProject.priority} Priority
                </span>
              </div>
              <p className="text-xs text-slate-500 dark:text-slate-400 mt-1 max-w-3xl">
                {selectedProject.description}
              </p>
            </div>

            <div className="flex items-center space-x-2">
              <button
                onClick={() => openQuickAdd('task')}
                className="px-3.5 py-1.5 text-xs font-semibold rounded-xl bg-blue-600 hover:bg-blue-700 text-white shadow-sm transition-all flex items-center space-x-1"
              >
                <Plus className="w-3.5 h-3.5" />
                <span>Add Task</span>
              </button>
            </div>
          </div>
        </div>

        {/* OVERVIEW STATS BAR */}
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
          <div className="p-4 rounded-xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-xs">
            <span className="text-[11px] font-medium text-slate-400 uppercase">
              Overall Progress
            </span>
            <div className="text-2xl font-bold text-blue-600 dark:text-blue-400 mt-1">
              {stats.progress}%
            </div>
            <div className="w-full bg-slate-100 dark:bg-slate-800 h-1.5 rounded-full overflow-hidden mt-2">
              <div
                className="bg-blue-600 h-full rounded-full"
                style={{ width: `${stats.progress}%` }}
              />
            </div>
          </div>

          <div className="p-4 rounded-xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-xs">
            <span className="text-[11px] font-medium text-slate-400 uppercase">
              Tasks
            </span>
            <div className="text-2xl font-bold text-slate-900 dark:text-white mt-1">
              {stats.completed} / {stats.total}
            </div>
            <p className="text-[11px] text-slate-500 mt-1">
              {stats.pending} pending tasks
            </p>
          </div>

          <div className="p-4 rounded-xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-xs">
            <span className="text-[11px] font-medium text-slate-400 uppercase">
              Blockers / Issues
            </span>
            <div className="text-2xl font-bold text-red-600 dark:text-red-400 mt-1">
              {stats.blocked}
            </div>
            <p className="text-[11px] text-slate-500 mt-1">
              {projectIssues.length} logged issues
            </p>
          </div>

          <div className="p-4 rounded-xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-xs">
            <span className="text-[11px] font-medium text-slate-400 uppercase">
              Timeline Target
            </span>
            <div className="text-sm font-bold text-slate-900 dark:text-white mt-2">
              {selectedProject.start_date} → {selectedProject.end_date}
            </div>
            <p className="text-[11px] text-slate-500 mt-1">
              Owner: {selectedProject.owner || 'Manash'}
            </p>
          </div>
        </div>

        {/* DETAIL TABS */}
        <div className="border-b border-slate-200 dark:border-slate-800 flex items-center space-x-6">
          {[
            { id: 'tasks', label: `Tasks (${projectTasks.length})` },
            { id: 'issues', label: `Issues (${projectIssues.length})` },
            { id: 'followups', label: `Follow-ups (${projectFollowups.length})` },
            { id: 'meetings', label: `Meetings (${projectMeetings.length})` },
            { id: 'milestones', label: `Milestones (${projectMilestones.length})` },
          ].map((tab) => (
            <button
              key={tab.id}
              onClick={() => setDetailTab(tab.id as any)}
              className={`pb-3 text-xs font-semibold border-b-2 transition-colors ${
                detailTab === tab.id
                  ? 'border-blue-600 text-blue-600 dark:text-blue-400'
                  : 'border-transparent text-slate-500 hover:text-slate-800 dark:hover:text-slate-300'
              }`}
            >
              {tab.label}
            </button>
          ))}
        </div>

        {/* TAB CONTENTS */}
        <div className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 p-6 shadow-sm">
          {/* TASKS TAB */}
          {detailTab === 'tasks' && (
            <div className="space-y-3">
              {projectTasks.length === 0 ? (
                <p className="text-xs text-slate-400 py-6 text-center">
                  No tasks associated with this project yet.
                </p>
              ) : (
                projectTasks.map((t) => (
                  <div
                    key={t.id}
                    onClick={() => openQuickUpdate(t)}
                    className="cursor-pointer p-3.5 rounded-xl bg-slate-50 dark:bg-slate-800/50 border border-slate-200/70 dark:border-slate-800 hover:border-slate-300 transition-colors flex items-center justify-between"
                  >
                    <div>
                      <div className="flex items-center space-x-2">
                        <span className="text-xs font-semibold text-slate-900 dark:text-white">
                          {t.title}
                        </span>
                        <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-slate-200 dark:bg-slate-700 text-slate-800 dark:text-slate-200">
                          {t.status}
                        </span>
                      </div>
                      {t.next_action && (
                        <p className="text-[11px] text-slate-500 mt-0.5">
                          Next: {t.next_action}
                        </p>
                      )}
                    </div>
                    <span className="text-xs font-bold text-slate-600 dark:text-slate-300">
                      {t.progress}%
                    </span>
                  </div>
                ))
              )}
            </div>
          )}

          {/* ISSUES TAB */}
          {detailTab === 'issues' && (
            <div className="space-y-3">
              {projectIssues.length === 0 ? (
                <p className="text-xs text-slate-400 py-6 text-center">
                  No open issues or blockers logged for this project.
                </p>
              ) : (
                projectIssues.map((iss) => (
                  <div
                    key={iss.id}
                    className="p-3.5 rounded-xl bg-red-50/40 dark:bg-red-950/20 border border-red-200/60 dark:border-red-900/40 flex items-center justify-between"
                  >
                    <div>
                      <div className="flex items-center space-x-2">
                        <span className="text-xs font-bold text-red-700 dark:text-red-400">
                          {iss.title}
                        </span>
                        <span className="text-[10px] font-bold px-2 py-0.5 rounded bg-red-100 dark:bg-red-900 text-red-800 dark:text-red-300">
                          {iss.severity}
                        </span>
                      </div>
                      <p className="text-[11px] text-slate-600 dark:text-slate-400 mt-1">
                        {iss.description}
                      </p>
                    </div>
                    <span className="text-[11px] text-slate-500 font-medium">
                      Owner: {iss.owner}
                    </span>
                  </div>
                ))
              )}
            </div>
          )}

          {/* FOLLOWUPS TAB */}
          {detailTab === 'followups' && (
            <div className="space-y-3">
              {projectFollowups.length === 0 ? (
                <p className="text-xs text-slate-400 py-6 text-center">
                  No follow-ups recorded for this project.
                </p>
              ) : (
                projectFollowups.map((fol) => (
                  <div
                    key={fol.id}
                    className="p-3.5 rounded-xl bg-slate-50 dark:bg-slate-800/50 border border-slate-200/70 dark:border-slate-800 flex items-center justify-between"
                  >
                    <div>
                      <span className="text-xs font-bold text-slate-900 dark:text-white">
                        {fol.person}: {fol.topic}
                      </span>
                      <p className="text-[11px] text-slate-500 mt-0.5">
                        Expected: {fol.expected_action}
                      </p>
                    </div>
                    <span className="text-[11px] font-medium text-amber-600 dark:text-amber-400">
                      Due: {fol.followup_date}
                    </span>
                  </div>
                ))
              )}
            </div>
          )}

          {/* MEETINGS TAB */}
          {detailTab === 'meetings' && (
            <div className="space-y-3">
              {projectMeetings.length === 0 ? (
                <p className="text-xs text-slate-400 py-6 text-center">
                  No meetings linked to this project.
                </p>
              ) : (
                projectMeetings.map((mtg) => (
                  <div
                    key={mtg.id}
                    className="p-3.5 rounded-xl bg-slate-50 dark:bg-slate-800/50 border border-slate-200/70 dark:border-slate-800 flex items-center justify-between"
                  >
                    <div>
                      <span className="text-xs font-bold text-slate-900 dark:text-white">
                        {mtg.title}
                      </span>
                      <p className="text-[11px] text-slate-500 mt-0.5">
                        {mtg.meeting_date} ({mtg.start_time} - {mtg.end_time})
                      </p>
                    </div>
                    <span className="text-[11px] text-slate-400">
                      {mtg.participants}
                    </span>
                  </div>
                ))
              )}
            </div>
          )}

          {/* MILESTONES TAB */}
          {detailTab === 'milestones' && (
            <div className="space-y-4">
              {/* Add milestone form */}
              <form onSubmit={handleAddMilestone} className="flex gap-2">
                <input
                  type="text"
                  required
                  value={newMilestoneTitle}
                  onChange={(e) => setNewMilestoneTitle(e.target.value)}
                  placeholder="New milestone name (e.g. State-wide Pilot Launch)"
                  className="flex-1 px-3 py-1.5 text-xs rounded-lg bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-slate-900 dark:text-white"
                />
                <input
                  type="date"
                  value={newMilestoneDate}
                  onChange={(e) => setNewMilestoneDate(e.target.value)}
                  className="px-3 py-1.5 text-xs rounded-lg bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-slate-900 dark:text-white"
                />
                <button
                  type="submit"
                  className="px-4 py-1.5 text-xs font-semibold rounded-lg bg-blue-600 text-white hover:bg-blue-700"
                >
                  Add
                </button>
              </form>

              <div className="space-y-2">
                {projectMilestones.map((m) => (
                  <div
                    key={m.id}
                    onClick={() => toggleMilestoneStatus(m.id)}
                    className="cursor-pointer p-3 rounded-xl bg-slate-50 dark:bg-slate-800/40 border border-slate-200/70 dark:border-slate-800 flex items-center justify-between hover:border-slate-300 transition-colors"
                  >
                    <div className="flex items-center space-x-3">
                      <input
                        type="checkbox"
                        checked={m.status === 'Completed'}
                        readOnly
                        className="rounded text-blue-600 cursor-pointer"
                      />
                      <span
                        className={`text-xs font-semibold ${
                          m.status === 'Completed'
                            ? 'line-through text-slate-400'
                            : 'text-slate-900 dark:text-white'
                        }`}
                      >
                        {m.title}
                      </span>
                    </div>
                    <span className="text-[11px] text-slate-500 font-medium">
                      Target: {m.due_date}
                    </span>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>
      </div>
    );
  }

  // PROJECTS LIST VIEW (Section 12)
  return (
    <div className="space-y-6 max-w-7xl mx-auto pb-12">
      <div className="flex flex-wrap items-center justify-between gap-4">
        <div>
          <h1 className="text-xl sm:text-2xl font-bold text-slate-900 dark:text-white tracking-tight">
            Projects Portfolio
          </h1>
          <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
            Key operational programs, state initiatives, and engineering tracks.
          </p>
        </div>
        <button
          onClick={() => setIsCreateOpen(true)}
          className="inline-flex items-center space-x-1.5 px-4 py-2 text-xs font-semibold rounded-xl bg-blue-600 hover:bg-blue-700 text-white shadow-sm transition-all"
        >
          <Plus className="w-4 h-4" />
          <span>New Project</span>
        </button>
      </div>

      {/* Projects Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
        {projects.map((proj) => {
          const stats = getProjectStats(proj.id);

          return (
            <div
              key={proj.id}
              onClick={() => setSelectedProjectId(proj.id)}
              className="cursor-pointer p-5 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 hover:border-blue-500 dark:hover:border-blue-500 shadow-sm transition-all group flex flex-col justify-between"
            >
              <div>
                <div className="flex items-center justify-between mb-3">
                  <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-blue-50 dark:bg-blue-950/60 text-blue-700 dark:text-blue-300">
                    {proj.status}
                  </span>
                  <span className="text-xs font-bold text-blue-600 dark:text-blue-400">
                    {stats.progress}%
                  </span>
                </div>

                <h3 className="text-base font-bold text-slate-900 dark:text-white group-hover:text-blue-600 dark:group-hover:text-blue-400 transition-colors">
                  {proj.name}
                </h3>
                <p className="text-xs text-slate-500 dark:text-slate-400 mt-1 line-clamp-2">
                  {proj.description}
                </p>

                {/* Progress bar */}
                <div className="w-full bg-slate-100 dark:bg-slate-800 h-2 rounded-full overflow-hidden mt-4">
                  <div
                    className="bg-blue-600 h-full rounded-full transition-all duration-300"
                    style={{ width: `${stats.progress}%` }}
                  />
                </div>
              </div>

              <div className="mt-5 pt-3 border-t border-slate-100 dark:border-slate-800 flex items-center justify-between text-xs text-slate-500 dark:text-slate-400">
                <span className="font-semibold">{stats.total} Tasks</span>
                <span>{stats.pending} Pending</span>
                {stats.blocked > 0 ? (
                  <span className="text-red-600 dark:text-red-400 font-bold">
                    {stats.blocked} Blocked
                  </span>
                ) : (
                  <span>0 Blocked</span>
                )}
              </div>
            </div>
          );
        })}
      </div>

      {/* CREATE PROJECT MODAL */}
      {isCreateOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-sm animate-in fade-in duration-150">
          <div className="w-full max-w-lg bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-2xl p-6">
            <div className="flex items-center justify-between pb-3 border-b border-slate-200 dark:border-slate-800">
              <h3 className="text-sm font-bold text-slate-900 dark:text-white">
                Create New Project
              </h3>
              <button
                onClick={() => setIsCreateOpen(false)}
                className="p-1 rounded text-slate-400 hover:text-slate-600"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <form onSubmit={handleCreateProject} className="space-y-3 mt-4">
              <div>
                <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
                  Project Name
                </label>
                <input
                  type="text"
                  required
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  placeholder="e.g. SBA Bot Phase 2"
                  className="w-full px-3 py-2 text-xs rounded-lg bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-slate-900 dark:text-white"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
                  Description
                </label>
                <textarea
                  rows={2}
                  value={description}
                  onChange={(e) => setDescription(e.target.value)}
                  placeholder="Program objectives, state scope, key deliverables"
                  className="w-full px-3 py-2 text-xs rounded-lg bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-slate-900 dark:text-white resize-none"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
                    Start Date
                  </label>
                  <input
                    type="date"
                    value={startDate}
                    onChange={(e) => setStartDate(e.target.value)}
                    className="w-full px-3 py-2 text-xs rounded-lg bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-slate-900 dark:text-white"
                  />
                </div>
                <div>
                  <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
                    Target End Date
                  </label>
                  <input
                    type="date"
                    value={endDate}
                    onChange={(e) => setEndDate(e.target.value)}
                    className="w-full px-3 py-2 text-xs rounded-lg bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-slate-900 dark:text-white"
                  />
                </div>
              </div>

              <div className="flex justify-end space-x-2 pt-3">
                <button
                  type="button"
                  onClick={() => setIsCreateOpen(false)}
                  className="px-4 py-2 text-xs font-semibold text-slate-600 hover:bg-slate-100 rounded-lg"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 text-xs font-semibold text-white bg-blue-600 hover:bg-blue-700 rounded-lg shadow-sm"
                >
                  Create
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
