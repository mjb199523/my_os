'use client';

import React, { useState, useEffect } from 'react';
import { useWorkOS } from '@/context/WorkOSContext';
import {
  Priority,
  TaskType,
  TaskStatus,
  FollowupStatus,
  IssueSeverity,
  IssueStatus,
  AchievementCategory,
} from '@/types';
import {
  X,
  Plus,
  CheckSquare,
  UserCheck,
  Video,
  AlertOctagon,
  FileText,
  Award,
} from 'lucide-react';

export default function QuickAddModal() {
  const {
    isQuickAddOpen,
    closeQuickAdd,
    quickAddType,
    quickAddProjectId,
    openQuickAdd,
    projects,
    tasks,
    addTask,
    addFollowup,
    addMeeting,
    addIssue,
    addNote,
    addAchievement,
  } = useWorkOS();

  const [activeTab, setActiveTab] = useState<
    'task' | 'followup' | 'meeting' | 'issue' | 'note' | 'achievement'
  >('task');

  useEffect(() => {
    if (quickAddType) {
      setActiveTab(quickAddType);
    }
    if (quickAddProjectId) {
      setTaskProjectId(quickAddProjectId);
      setFolProjectId(quickAddProjectId);
      setMtgProjectId(quickAddProjectId);
      setIssProjectId(quickAddProjectId);
      setNoteProjectId(quickAddProjectId);
    }
  }, [quickAddType, quickAddProjectId]);

  // Task form state
  const [taskName, setTaskName] = useState('');
  const [taskDescription, setTaskDescription] = useState('');
  const [taskProjectId, setTaskProjectId] = useState(projects[0]?.id || '');
  const [taskType, setTaskType] = useState<TaskType>('Development');
  const [taskPriority, setTaskPriority] = useState<Priority>('High');
  const [taskStatus, setTaskStatus] = useState<TaskStatus>('To Do');
  const [taskProgress, setTaskProgress] = useState(0);
  const [taskStartDate, setTaskStartDate] = useState(new Date().toISOString().split('T')[0]);
  const [taskDueDate, setTaskDueDate] = useState(new Date().toISOString().split('T')[0]);
  const [taskNextAction, setTaskNextAction] = useState('');
  const [taskTags, setTaskTags] = useState('');
  const [taskNotes, setTaskNotes] = useState('');
  const [isRecurring, setIsRecurring] = useState(false);
  const [recurrenceRule, setRecurrenceRule] = useState('');

  // Follow-up form state
  const [folPerson, setFolPerson] = useState('');
  const [folTopic, setFolTopic] = useState('');
  const [folProjectId, setFolProjectId] = useState(projects[0]?.id || '');
  const [folLastDiscussion, setFolLastDiscussion] = useState('');
  const [folExpectedAction, setFolExpectedAction] = useState('');
  const [folDate, setFolDate] = useState(new Date().toISOString().split('T')[0]);
  const [folStatus, setFolStatus] = useState<FollowupStatus>('Pending');
  const [folNotes, setFolNotes] = useState('');

  // Meeting form state
  const [mtgTitle, setMtgTitle] = useState('');
  const [mtgDate, setMtgDate] = useState(new Date().toISOString().split('T')[0]);
  const [mtgStartTime, setMtgStartTime] = useState('10:00 AM');
  const [mtgEndTime, setMtgEndTime] = useState('10:45 AM');
  const [mtgProjectId, setMtgProjectId] = useState(projects[0]?.id || '');
  const [mtgParticipants, setMtgParticipants] = useState('Manash, Team');
  const [mtgAgenda, setMtgAgenda] = useState('');
  const [mtgDecisions, setMtgDecisions] = useState('');
  const [mtgActionItem, setMtgActionItem] = useState('');

  // Issue form state
  const [issTitle, setIssTitle] = useState('');
  const [issDescription, setIssDescription] = useState('');
  const [issProjectId, setIssProjectId] = useState(projects[0]?.id || '');
  const [issTaskId, setIssTaskId] = useState('');
  const [issSeverity, setIssSeverity] = useState<IssueSeverity>('High');
  const [issStatus, setIssStatus] = useState<IssueStatus>('Open');
  const [issOwner, setIssOwner] = useState('Manash');
  const [issExpectedResolution, setIssExpectedResolution] = useState(new Date().toISOString().split('T')[0]);

  // Note form state
  const [noteTitle, setNoteTitle] = useState('');
  const [noteContent, setNoteContent] = useState('');
  const [noteProjectId, setNoteProjectId] = useState(projects[0]?.id || '');
  const [noteTags, setNoteTags] = useState('');

  // Achievement form state
  const [achTitle, setAchTitle] = useState('');
  const [achProjectId, setAchProjectId] = useState(projects[0]?.id || '');
  const [achDate, setAchDate] = useState(new Date().toISOString().split('T')[0]);
  const [achDescription, setAchDescription] = useState('');
  const [achImpact, setAchImpact] = useState('');
  const [achCategory, setAchCategory] = useState<AchievementCategory>('Delivery');

  if (!isQuickAddOpen) return null;

  const handleTaskSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!taskName.trim()) return;
    addTask({
      title: taskName.trim(),
      description: taskDescription,
      project_id: taskProjectId || projects[0]?.id,
      task_type: taskType,
      priority: taskPriority,
      status: taskStatus,
      progress: taskProgress,
      start_date: taskStartDate,
      due_date: taskDueDate,
      next_action: taskNextAction,
      is_recurring: isRecurring,
      recurrence_rule: recurrenceRule,
      tags: taskTags ? taskTags.split(',').map((t) => t.trim()) : [],
      notes: taskNotes,
    });
    closeQuickAdd();
  };

  const handleFollowupSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!folPerson.trim() || !folTopic.trim()) return;
    addFollowup({
      person: folPerson.trim(),
      topic: folTopic.trim(),
      project_id: folProjectId || undefined,
      last_discussion: folLastDiscussion,
      expected_action: folExpectedAction,
      followup_date: folDate,
      status: folStatus,
      notes: folNotes,
    });
    closeQuickAdd();
  };

  const handleMeetingSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!mtgTitle.trim()) return;
    addMeeting({
      title: mtgTitle.trim(),
      meeting_date: mtgDate,
      start_time: mtgStartTime,
      end_time: mtgEndTime,
      project_id: mtgProjectId || undefined,
      participants: mtgParticipants,
      agenda: mtgAgenda,
      decisions: mtgDecisions,
      action_items: mtgActionItem
        ? [{ id: `act_${Date.now()}`, text: mtgActionItem, assigned_to: 'Team' }]
        : [],
    });
    closeQuickAdd();
  };

  const handleIssueSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!issTitle.trim()) return;
    addIssue({
      title: issTitle.trim(),
      description: issDescription,
      project_id: issProjectId || undefined,
      task_id: issTaskId || undefined,
      severity: issSeverity,
      status: issStatus,
      owner: issOwner,
      expected_resolution: issExpectedResolution,
    });
    closeQuickAdd();
  };

  const handleNoteSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!noteTitle.trim()) return;
    addNote({
      title: noteTitle.trim(),
      content: noteContent,
      project_id: noteProjectId || undefined,
      tags: noteTags ? noteTags.split(',').map((t) => t.trim()) : [],
    });
    closeQuickAdd();
  };

  const handleAchievementSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!achTitle.trim()) return;
    addAchievement({
      title: achTitle.trim(),
      project_id: achProjectId || undefined,
      achievement_date: achDate,
      description: achDescription,
      impact: achImpact,
      category: achCategory,
    });
    closeQuickAdd();
  };

  const tabs = [
    { id: 'task', label: 'Task', icon: CheckSquare },
    { id: 'followup', label: 'Follow-up', icon: UserCheck },
    { id: 'meeting', label: 'Meeting', icon: Video },
    { id: 'issue', label: 'Issue', icon: AlertOctagon },
    { id: 'note', label: 'Note', icon: FileText },
    { id: 'achievement', label: 'Achievement', icon: Award },
  ] as const;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-sm animate-in fade-in duration-150">
      <div className="w-full max-w-2xl bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-2xl overflow-hidden flex flex-col max-h-[90vh]">
        {/* Header with Type selector */}
        <div className="px-6 py-4 border-b border-slate-200 dark:border-slate-800 flex items-center justify-between">
          <div className="flex items-center space-x-2">
            <span className="text-sm font-bold text-slate-900 dark:text-white">
              Quick Add
            </span>
          </div>
          <button
            onClick={closeQuickAdd}
            className="p-1.5 rounded-lg text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 hover:bg-slate-100 dark:hover:bg-slate-800"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Tab Buttons */}
        <div className="flex px-6 pt-3 border-b border-slate-200 dark:border-slate-800 overflow-x-auto gap-2 bg-slate-50/50 dark:bg-slate-900/50">
          {tabs.map((tab) => {
            const Icon = tab.icon;
            const isActive = activeTab === tab.id;
            return (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id)}
                className={`
                  flex items-center space-x-1.5 px-3 py-2 text-xs font-semibold rounded-t-lg transition-colors border-b-2
                  ${
                    isActive
                      ? 'border-blue-600 text-blue-600 dark:text-blue-400 bg-white dark:bg-slate-900'
                      : 'border-transparent text-slate-500 hover:text-slate-800 dark:hover:text-slate-300'
                  }
                `}
              >
                <Icon className="w-3.5 h-3.5" />
                <span>{tab.label}</span>
              </button>
            );
          })}
        </div>

        {/* Form Container */}
        <div className="p-6 overflow-y-auto flex-1">
          {/* TASK FORM */}
          {activeTab === 'task' && (
            <form onSubmit={handleTaskSubmit} className="space-y-4">
              <div>
                <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
                  Task Name <span className="text-red-500">*</span>
                </label>
                <input
                  required
                  type="text"
                  value={taskName}
                  onChange={(e) => setTaskName(e.target.value)}
                  placeholder="e.g. Attendance API Integration"
                  className="w-full px-3 py-2 text-sm rounded-lg bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-slate-900 dark:text-white focus:ring-2 focus:ring-blue-500"
                />
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                <div>
                  <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
                    Project
                  </label>
                  <select
                    value={taskProjectId}
                    onChange={(e) => setTaskProjectId(e.target.value)}
                    className="w-full px-3 py-2 text-xs rounded-lg bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-slate-900 dark:text-white"
                  >
                    {projects.map((p) => (
                      <option key={p.id} value={p.id}>
                        {p.name}
                      </option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
                    Task Type
                  </label>
                  <select
                    value={taskType}
                    onChange={(e) => setTaskType(e.target.value as TaskType)}
                    className="w-full px-3 py-2 text-xs rounded-lg bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-slate-900 dark:text-white"
                  >
                    {[
                      'Development',
                      'Meeting',
                      'Follow-up',
                      'Analysis',
                      'Documentation',
                      'Testing',
                      'Deployment',
                      'Support',
                      'Other',
                    ].map((t) => (
                      <option key={t} value={t}>
                        {t}
                      </option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
                    Priority
                  </label>
                  <select
                    value={taskPriority}
                    onChange={(e) => setTaskPriority(e.target.value as Priority)}
                    className="w-full px-3 py-2 text-xs rounded-lg bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-slate-900 dark:text-white"
                  >
                    {['Low', 'Medium', 'High', 'Critical'].map((p) => (
                      <option key={p} value={p}>
                        {p}
                      </option>
                    ))}
                  </select>
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                <div>
                  <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
                    Status
                  </label>
                  <select
                    value={taskStatus}
                    onChange={(e) => setTaskStatus(e.target.value as TaskStatus)}
                    className="w-full px-3 py-2 text-xs rounded-lg bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-slate-900 dark:text-white"
                  >
                    {['To Do', 'In Progress', 'Waiting', 'Blocked', 'Done', 'Cancelled'].map(
                      (s) => (
                        <option key={s} value={s}>
                          {s}
                        </option>
                      )
                    )}
                  </select>
                </div>

                <div>
                  <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
                    Due Date
                  </label>
                  <input
                    type="date"
                    value={taskDueDate}
                    onChange={(e) => setTaskDueDate(e.target.value)}
                    className="w-full px-3 py-2 text-xs rounded-lg bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-slate-900 dark:text-white"
                  />
                </div>

                <div>
                  <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
                    Progress: {taskProgress}%
                  </label>
                  <input
                    type="range"
                    min="0"
                    max="100"
                    step="5"
                    value={taskProgress}
                    onChange={(e) => setTaskProgress(Number(e.target.value))}
                    className="w-full accent-blue-600 mt-2"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
                  Next Action
                </label>
                <input
                  type="text"
                  value={taskNextAction}
                  onChange={(e) => setTaskNextAction(e.target.value)}
                  placeholder="e.g. Follow up with Data Engineering team"
                  className="w-full px-3 py-2 text-xs rounded-lg bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-slate-900 dark:text-white"
                />
              </div>

              <div className="flex items-center space-x-2 pt-1">
                <input
                  type="checkbox"
                  id="recurring-check"
                  checked={isRecurring}
                  onChange={(e) => setIsRecurring(e.target.checked)}
                  className="rounded text-blue-600"
                />
                <label htmlFor="recurring-check" className="text-xs text-slate-700 dark:text-slate-300">
                  Recurring Task
                </label>
                {isRecurring && (
                  <input
                    type="text"
                    value={recurrenceRule}
                    onChange={(e) => setRecurrenceRule(e.target.value)}
                    placeholder="e.g. Every weekday / Weekly"
                    className="ml-2 px-2 py-1 text-xs rounded bg-slate-100 dark:bg-slate-800 border border-slate-300 dark:border-slate-700"
                  />
                )}
              </div>

              <div className="flex justify-end pt-3">
                <button
                  type="submit"
                  className="px-5 py-2 text-xs font-semibold text-white bg-blue-600 hover:bg-blue-700 rounded-lg shadow-sm"
                >
                  Create Task
                </button>
              </div>
            </form>
          )}

          {/* FOLLOWUP FORM */}
          {activeTab === 'followup' && (
            <form onSubmit={handleFollowupSubmit} className="space-y-4">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
                    Person / Team <span className="text-red-500">*</span>
                  </label>
                  <input
                    required
                    type="text"
                    value={folPerson}
                    onChange={(e) => setFolPerson(e.target.value)}
                    placeholder="e.g. Data Engineering (Pranjal)"
                    className="w-full px-3 py-2 text-xs rounded-lg bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-slate-900 dark:text-white"
                  />
                </div>
                <div>
                  <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
                    Topic <span className="text-red-500">*</span>
                  </label>
                  <input
                    required
                    type="text"
                    value={folTopic}
                    onChange={(e) => setFolTopic(e.target.value)}
                    placeholder="e.g. Production API Deployment"
                    className="w-full px-3 py-2 text-xs rounded-lg bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-slate-900 dark:text-white"
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                <div>
                  <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
                    Related Project
                  </label>
                  <select
                    value={folProjectId}
                    onChange={(e) => setFolProjectId(e.target.value)}
                    className="w-full px-3 py-2 text-xs rounded-lg bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-slate-900 dark:text-white"
                  >
                    {projects.map((p) => (
                      <option key={p.id} value={p.id}>
                        {p.name}
                      </option>
                    ))}
                  </select>
                </div>
                <div>
                  <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
                    Follow-up Date
                  </label>
                  <input
                    type="date"
                    value={folDate}
                    onChange={(e) => setFolDate(e.target.value)}
                    className="w-full px-3 py-2 text-xs rounded-lg bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-slate-900 dark:text-white"
                  />
                </div>
                <div>
                  <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
                    Status
                  </label>
                  <select
                    value={folStatus}
                    onChange={(e) => setFolStatus(e.target.value as FollowupStatus)}
                    className="w-full px-3 py-2 text-xs rounded-lg bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-slate-900 dark:text-white"
                  >
                    {['Pending', 'Waiting', 'Follow-up Due', 'Completed', 'Cancelled'].map((s) => (
                      <option key={s} value={s}>
                        {s}
                      </option>
                    ))}
                  </select>
                </div>
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
                  Expected Action
                </label>
                <input
                  type="text"
                  value={folExpectedAction}
                  onChange={(e) => setFolExpectedAction(e.target.value)}
                  placeholder="e.g. Deploy hotfix v2.4 and share logs"
                  className="w-full px-3 py-2 text-xs rounded-lg bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-slate-900 dark:text-white"
                />
              </div>

              <div className="flex justify-end pt-3">
                <button
                  type="submit"
                  className="px-5 py-2 text-xs font-semibold text-white bg-blue-600 hover:bg-blue-700 rounded-lg shadow-sm"
                >
                  Create Follow-up
                </button>
              </div>
            </form>
          )}

          {/* MEETING FORM */}
          {activeTab === 'meeting' && (
            <form onSubmit={handleMeetingSubmit} className="space-y-4">
              <div>
                <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
                  Meeting Title <span className="text-red-500">*</span>
                </label>
                <input
                  required
                  type="text"
                  value={mtgTitle}
                  onChange={(e) => setMtgTitle(e.target.value)}
                  placeholder="e.g. Attendance API Architecture Review"
                  className="w-full px-3 py-2 text-xs rounded-lg bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-slate-900 dark:text-white"
                />
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                <div>
                  <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
                    Date
                  </label>
                  <input
                    type="date"
                    value={mtgDate}
                    onChange={(e) => setMtgDate(e.target.value)}
                    className="w-full px-3 py-2 text-xs rounded-lg bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-slate-900 dark:text-white"
                  />
                </div>
                <div>
                  <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
                    Start Time
                  </label>
                  <input
                    type="text"
                    value={mtgStartTime}
                    onChange={(e) => setMtgStartTime(e.target.value)}
                    placeholder="10:00 AM"
                    className="w-full px-3 py-2 text-xs rounded-lg bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-slate-900 dark:text-white"
                  />
                </div>
                <div>
                  <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
                    End Time
                  </label>
                  <input
                    type="text"
                    value={mtgEndTime}
                    onChange={(e) => setMtgEndTime(e.target.value)}
                    placeholder="11:00 AM"
                    className="w-full px-3 py-2 text-xs rounded-lg bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-slate-900 dark:text-white"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
                  Participants
                </label>
                <input
                  type="text"
                  value={mtgParticipants}
                  onChange={(e) => setMtgParticipants(e.target.value)}
                  placeholder="Manash, DE Lead, Director"
                  className="w-full px-3 py-2 text-xs rounded-lg bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-slate-900 dark:text-white"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
                  Key Action Item (Can convert to Task)
                </label>
                <input
                  type="text"
                  value={mtgActionItem}
                  onChange={(e) => setMtgActionItem(e.target.value)}
                  placeholder="e.g. DE team to deploy API"
                  className="w-full px-3 py-2 text-xs rounded-lg bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-slate-900 dark:text-white"
                />
              </div>

              <div className="flex justify-end pt-3">
                <button
                  type="submit"
                  className="px-5 py-2 text-xs font-semibold text-white bg-blue-600 hover:bg-blue-700 rounded-lg shadow-sm"
                >
                  Create Meeting
                </button>
              </div>
            </form>
          )}

          {/* ISSUE FORM */}
          {activeTab === 'issue' && (
            <form onSubmit={handleIssueSubmit} className="space-y-4">
              <div>
                <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
                  Issue Title <span className="text-red-500">*</span>
                </label>
                <input
                  required
                  type="text"
                  value={issTitle}
                  onChange={(e) => setIssTitle(e.target.value)}
                  placeholder="e.g. Production API timeout"
                  className="w-full px-3 py-2 text-xs rounded-lg bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-slate-900 dark:text-white"
                />
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                <div>
                  <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
                    Severity
                  </label>
                  <select
                    value={issSeverity}
                    onChange={(e) => setIssSeverity(e.target.value as IssueSeverity)}
                    className="w-full px-3 py-2 text-xs rounded-lg bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-slate-900 dark:text-white"
                  >
                    {['Low', 'Medium', 'High', 'Critical'].map((s) => (
                      <option key={s} value={s}>
                        {s}
                      </option>
                    ))}
                  </select>
                </div>
                <div>
                  <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
                    Owner
                  </label>
                  <input
                    type="text"
                    value={issOwner}
                    onChange={(e) => setIssOwner(e.target.value)}
                    className="w-full px-3 py-2 text-xs rounded-lg bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-slate-900 dark:text-white"
                  />
                </div>
                <div>
                  <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
                    Link Task
                  </label>
                  <select
                    value={issTaskId}
                    onChange={(e) => setIssTaskId(e.target.value)}
                    className="w-full px-3 py-2 text-xs rounded-lg bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-slate-900 dark:text-white"
                  >
                    <option value="">None</option>
                    {tasks.map((t) => (
                      <option key={t.id} value={t.id}>
                        {t.title}
                      </option>
                    ))}
                  </select>
                </div>
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
                  Description
                </label>
                <textarea
                  rows={2}
                  value={issDescription}
                  onChange={(e) => setIssDescription(e.target.value)}
                  placeholder="Describe root cause and current impact..."
                  className="w-full px-3 py-2 text-xs rounded-lg bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-slate-900 dark:text-white resize-none"
                />
              </div>

              <div className="flex justify-end pt-3">
                <button
                  type="submit"
                  className="px-5 py-2 text-xs font-semibold text-white bg-blue-600 hover:bg-blue-700 rounded-lg shadow-sm"
                >
                  Create Issue
                </button>
              </div>
            </form>
          )}

          {/* NOTE FORM */}
          {activeTab === 'note' && (
            <form onSubmit={handleNoteSubmit} className="space-y-4">
              <div>
                <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
                  Title <span className="text-red-500">*</span>
                </label>
                <input
                  required
                  type="text"
                  value={noteTitle}
                  onChange={(e) => setNoteTitle(e.target.value)}
                  placeholder="e.g. Deployment Architecture Decision Record"
                  className="w-full px-3 py-2 text-xs rounded-lg bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-slate-900 dark:text-white"
                />
              </div>
              <div>
                <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
                  Content (Markdown supported)
                </label>
                <textarea
                  rows={4}
                  value={noteContent}
                  onChange={(e) => setNoteContent(e.target.value)}
                  placeholder="Write notes, bullet points, checklists..."
                  className="w-full px-3 py-2 text-xs rounded-lg bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-slate-900 dark:text-white font-mono"
                />
              </div>
              <div className="flex justify-end pt-3">
                <button
                  type="submit"
                  className="px-5 py-2 text-xs font-semibold text-white bg-blue-600 hover:bg-blue-700 rounded-lg shadow-sm"
                >
                  Save Note
                </button>
              </div>
            </form>
          )}

          {/* ACHIEVEMENT FORM */}
          {activeTab === 'achievement' && (
            <form onSubmit={handleAchievementSubmit} className="space-y-4">
              <div>
                <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
                  Achievement Title <span className="text-red-500">*</span>
                </label>
                <input
                  required
                  type="text"
                  value={achTitle}
                  onChange={(e) => setAchTitle(e.target.value)}
                  placeholder="⭐ e.g. Successfully launched Live Report Bot"
                  className="w-full px-3 py-2 text-xs rounded-lg bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-slate-900 dark:text-white"
                />
              </div>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
                    Category
                  </label>
                  <select
                    value={achCategory}
                    onChange={(e) => setAchCategory(e.target.value as AchievementCategory)}
                    className="w-full px-3 py-2 text-xs rounded-lg bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-slate-900 dark:text-white"
                  >
                    {[
                      'Delivery',
                      'Product',
                      'Technical',
                      'Operations',
                      'Leadership',
                      'Process Improvement',
                    ].map((c) => (
                      <option key={c} value={c}>
                        {c}
                      </option>
                    ))}
                  </select>
                </div>
                <div>
                  <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
                    Date
                  </label>
                  <input
                    type="date"
                    value={achDate}
                    onChange={(e) => setAchDate(e.target.value)}
                    className="w-full px-3 py-2 text-xs rounded-lg bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-slate-900 dark:text-white"
                  />
                </div>
              </div>
              <div>
                <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
                  Impact (Appraisal & CV Ready)
                </label>
                <textarea
                  rows={2}
                  value={achImpact}
                  onChange={(e) => setAchImpact(e.target.value)}
                  placeholder="e.g. Reduced incident response time by 45% across 33 districts..."
                  className="w-full px-3 py-2 text-xs rounded-lg bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-slate-900 dark:text-white resize-none"
                />
              </div>
              <div className="flex justify-end pt-3">
                <button
                  type="submit"
                  className="px-5 py-2 text-xs font-semibold text-white bg-blue-600 hover:bg-blue-700 rounded-lg shadow-sm"
                >
                  Record Achievement
                </button>
              </div>
            </form>
          )}
        </div>
      </div>
    </div>
  );
}
