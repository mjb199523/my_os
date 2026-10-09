'use client';

import React, { createContext, useContext, useState, useEffect, useMemo, ReactNode } from 'react';
import {
  User,
  Project,
  Task,
  TaskUpdate,
  Followup,
  Meeting,
  Issue,
  DailyLog,
  Achievement,
  Note,
  Milestone,
  NotificationItem,
  TaskStatus,
  FollowupStatus,
  IssueStatus,
} from '@/types';
import {
  CURRENT_USER,
  INITIAL_PROJECTS,
  INITIAL_TASKS,
  INITIAL_TASK_UPDATES,
  INITIAL_FOLLOWUPS,
  INITIAL_MEETINGS,
  INITIAL_ISSUES,
  INITIAL_DAILY_LOGS,
  INITIAL_ACHIEVEMENTS,
  INITIAL_MILESTONES,
  INITIAL_NOTES,
} from '@/lib/seed-data';
import { supabase, isSupabaseConfigured } from '@/lib/supabase';

interface WorkOSContextType {
  user: User;
  projects: Project[];
  tasks: Task[];
  taskUpdates: TaskUpdate[];
  followups: Followup[];
  meetings: Meeting[];
  issues: Issue[];
  dailyLogs: DailyLog[];
  achievements: Achievement[];
  notes: Note[];
  milestones: Milestone[];
  notifications: NotificationItem[];
  darkMode: boolean;
  toggleDarkMode: () => void;
  activeTab: string;
  setActiveTab: (tab: string) => void;
  selectedProjectId: string | null;
  setSelectedProjectId: (id: string | null) => void;
  
  // Modals & Panels
  isSearchOpen: boolean;
  setIsSearchOpen: (open: boolean) => void;
  isQuickAddOpen: boolean;
  setIsQuickAddOpen: (open: boolean) => void;
  quickAddType: 'task' | 'followup' | 'meeting' | 'issue' | 'note' | 'achievement' | null;
  openQuickAdd: (type?: 'task' | 'followup' | 'meeting' | 'issue' | 'note' | 'achievement') => void;
  closeQuickAdd: () => void;
  quickUpdateTask: Task | null;
  openQuickUpdate: (task: Task) => void;
  closeQuickUpdate: () => void;
  historyTask: Task | null;
  openHistory: (task: Task) => void;
  closeHistory: () => void;

  // Task actions
  addTask: (task: Partial<Task>) => void;
  updateTask: (id: string, updates: Partial<Task>) => void;
  deleteTask: (id: string) => void;
  updateTaskStatus: (id: string, newStatus: TaskStatus) => void;
  submitTaskUpdate: (
    taskId: string,
    payload: {
      status: TaskStatus;
      progress: number;
      updateText: string;
      nextAction?: string;
      nextFollowupDate?: string;
      notes?: string;
    }
  ) => void;

  // Project actions
  addProject: (proj: Partial<Project>) => void;
  updateProject: (id: string, updates: Partial<Project>) => void;
  deleteProject: (id: string) => void;
  getProjectProgress: (projectId: string) => number;
  getProjectStats: (projectId: string) => { total: number; completed: number; pending: number; blocked: number; progress: number };

  // Followup actions
  addFollowup: (f: Partial<Followup>) => void;
  updateFollowup: (id: string, updates: Partial<Followup>) => void;
  deleteFollowup: (id: string) => void;
  updateFollowupStatus: (id: string, status: FollowupStatus) => void;

  // Meeting actions
  addMeeting: (m: Partial<Meeting>) => void;
  updateMeeting: (id: string, updates: Partial<Meeting>) => void;
  deleteMeeting: (id: string) => void;
  convertMeetingActionItemToTask: (meetingId: string, actionItemId: string) => void;

  // Issue actions
  addIssue: (i: Partial<Issue>) => void;
  updateIssue: (id: string, updates: Partial<Issue>) => void;
  deleteIssue: (id: string) => void;
  resolveIssue: (id: string) => void;

  // Daily log actions
  getDailyLog: (date: string) => DailyLog | undefined;
  saveDailyLog: (log: Partial<DailyLog>) => void;
  generateTodaySummary: (date: string) => {
    worked_on: string;
    completed: string;
    pending: string;
    blocked: string;
    summary: string;
    people_coordinated: string;
  };

  // Achievement actions
  addAchievement: (a: Partial<Achievement>) => void;
  deleteAchievement: (id: string) => void;

  // Milestone actions
  addMilestone: (m: Partial<Milestone>) => void;
  toggleMilestoneStatus: (id: string) => void;

  // Note actions
  addNote: (n: Partial<Note>) => void;
  updateNote: (id: string, updates: Partial<Note>) => void;
  deleteNote: (id: string) => void;

  // Notification actions
  markNotificationRead: (id: string) => void;
  clearAllNotifications: () => void;

  // Storage / Sync
  resetToSeedData: () => void;
  exportDataJSON: () => string;
  importDataJSON: (jsonStr: string) => boolean;
  isSupabaseMode: boolean;
  syncWithSupabase: () => Promise<void>;
}

const WorkOSContext = createContext<WorkOSContextType | undefined>(undefined);

const STORAGE_KEY = 'my_work_os_data_v1';

export function WorkOSProvider({ children }: { children: ReactNode }) {
  // Navigation & Theme state
  const [activeTab, setActiveTab] = useState<string>('dashboard');
  const [selectedProjectId, setSelectedProjectId] = useState<string | null>(null);
  const [darkMode, setDarkMode] = useState<boolean>(false);

  // Modals state
  const [isSearchOpen, setIsSearchOpen] = useState(false);
  const [isQuickAddOpen, setIsQuickAddOpen] = useState(false);
  const [quickAddType, setQuickAddType] = useState<'task' | 'followup' | 'meeting' | 'issue' | 'note' | 'achievement' | null>(null);
  const [quickUpdateTask, setQuickUpdateTask] = useState<Task | null>(null);
  const [historyTask, setHistoryTask] = useState<Task | null>(null);

  // Data state
  const [user, setUser] = useState<User>(CURRENT_USER);
  const [projects, setProjects] = useState<Project[]>(INITIAL_PROJECTS);
  const [tasks, setTasks] = useState<Task[]>(INITIAL_TASKS);
  const [taskUpdates, setTaskUpdates] = useState<TaskUpdate[]>(INITIAL_TASK_UPDATES);
  const [followups, setFollowups] = useState<Followup[]>(INITIAL_FOLLOWUPS);
  const [meetings, setMeetings] = useState<Meeting[]>(INITIAL_MEETINGS);
  const [issues, setIssues] = useState<Issue[]>(INITIAL_ISSUES);
  const [dailyLogs, setDailyLogs] = useState<DailyLog[]>(INITIAL_DAILY_LOGS);
  const [achievements, setAchievements] = useState<Achievement[]>(INITIAL_ACHIEVEMENTS);
  const [notes, setNotes] = useState<Note[]>(INITIAL_NOTES);
  const [milestones, setMilestones] = useState<Milestone[]>(INITIAL_MILESTONES);
  const [isInitialized, setIsInitialized] = useState(false);

  // Load from localStorage on mount
  useEffect(() => {
    try {
      const savedTheme = localStorage.getItem('my_work_os_theme');
      if (savedTheme === 'dark') {
        setDarkMode(true);
        document.documentElement.classList.add('dark');
      }

      const savedData = localStorage.getItem(STORAGE_KEY);
      if (savedData) {
        const parsed = JSON.parse(savedData);
        if (parsed.projects) setProjects(parsed.projects);
        if (parsed.tasks) setTasks(parsed.tasks);
        if (parsed.taskUpdates) setTaskUpdates(parsed.taskUpdates);
        if (parsed.followups) setFollowups(parsed.followups);
        if (parsed.meetings) setMeetings(parsed.meetings);
        if (parsed.issues) setIssues(parsed.issues);
        if (parsed.dailyLogs) setDailyLogs(parsed.dailyLogs);
        if (parsed.achievements) setAchievements(parsed.achievements);
        if (parsed.notes) setNotes(parsed.notes);
        if (parsed.milestones) setMilestones(parsed.milestones);
        if (parsed.user) setUser(parsed.user);
      }
    } catch (e) {
      console.error('Failed to load local storage data', e);
    } finally {
      setIsInitialized(true);
    }
  }, []);

  // Save to localStorage when state changes
  useEffect(() => {
    if (!isInitialized) return;
    try {
      const payload = {
        user,
        projects,
        tasks,
        taskUpdates,
        followups,
        meetings,
        issues,
        dailyLogs,
        achievements,
        notes,
        milestones,
      };
      localStorage.setItem(STORAGE_KEY, JSON.stringify(payload));
    } catch (e) {
      console.error('Failed to save to local storage', e);
    }
  }, [
    isInitialized,
    user,
    projects,
    tasks,
    taskUpdates,
    followups,
    meetings,
    issues,
    dailyLogs,
    achievements,
    notes,
    milestones,
  ]);

  // Dark mode toggle
  const toggleDarkMode = () => {
    setDarkMode((prev) => {
      const next = !prev;
      if (next) {
        document.documentElement.classList.add('dark');
        localStorage.setItem('my_work_os_theme', 'dark');
      } else {
        document.documentElement.classList.remove('dark');
        localStorage.setItem('my_work_os_theme', 'light');
      }
      return next;
    });
  };

  // Keyboard shortcut: Cmd/Ctrl + K for Global Search
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if ((e.metaKey || e.ctrlKey) && e.key === 'k') {
        e.preventDefault();
        setIsSearchOpen((prev) => !prev);
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, []);

  // Modals helpers
  const openQuickAdd = (type: 'task' | 'followup' | 'meeting' | 'issue' | 'note' | 'achievement' = 'task') => {
    setQuickAddType(type);
    setIsQuickAddOpen(true);
  };

  const closeQuickAdd = () => {
    setIsQuickAddOpen(false);
    setQuickAddType(null);
  };

  const openQuickUpdate = (task: Task) => {
    setQuickUpdateTask(task);
  };

  const closeQuickUpdate = () => {
    setQuickUpdateTask(null);
  };

  const openHistory = (task: Task) => {
    setHistoryTask(task);
  };

  const closeHistory = () => {
    setHistoryTask(null);
  };

  // Task methods
  const addTask = (newTask: Partial<Task>) => {
    const id = `tsk_${Date.now()}`;
    const task: Task = {
      id,
      user_id: user.id,
      project_id: newTask.project_id || projects[0]?.id || 'prj_assam_idp',
      title: newTask.title || 'Untitled Task',
      description: newTask.description || '',
      task_type: newTask.task_type || 'Development',
      priority: newTask.priority || 'Medium',
      status: newTask.status || 'To Do',
      progress: newTask.progress || 0,
      start_date: newTask.start_date || new Date().toISOString().split('T')[0],
      due_date: newTask.due_date || new Date().toISOString().split('T')[0],
      next_action: newTask.next_action || '',
      is_recurring: newTask.is_recurring || false,
      recurrence_rule: newTask.recurrence_rule || '',
      tags: newTask.tags || [],
      notes: newTask.notes || '',
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString(),
    };
    setTasks((prev) => [task, ...prev]);

    // Initial update history item
    const updateItem: TaskUpdate = {
      id: `upd_${Date.now()}`,
      task_id: id,
      user_id: user.id,
      author_name: user.name.split(' ')[0] || 'User',
      status: task.status,
      progress: task.progress,
      update_text: `Task created: "${task.title}"`,
      next_action: task.next_action,
      created_at: new Date().toISOString(),
    };
    setTaskUpdates((prev) => [updateItem, ...prev]);
  };

  const updateTask = (id: string, updates: Partial<Task>) => {
    setTasks((prev) =>
      prev.map((t) => {
        if (t.id === id) {
          const updated = { ...t, ...updates, updated_at: new Date().toISOString() };
          if (updates.status === 'Done' && !t.completed_at) {
            updated.completed_at = new Date().toISOString();
            updated.progress = 100;
          }
          return updated;
        }
        return t;
      })
    );
  };

  const deleteTask = (id: string) => {
    setTasks((prev) => prev.filter((t) => t.id !== id));
  };

  const updateTaskStatus = (id: string, newStatus: TaskStatus) => {
    setTasks((prev) =>
      prev.map((t) => {
        if (t.id === id) {
          const isDone = newStatus === 'Done';
          const updatedProgress = isDone ? 100 : t.status === 'Done' && !isDone ? 50 : t.progress;
          const updated: Task = {
            ...t,
            status: newStatus,
            progress: updatedProgress,
            updated_at: new Date().toISOString(),
            completed_at: isDone ? new Date().toISOString() : null,
          };
          return updated;
        }
        return t;
      })
    );

    // Append to update history automatically
    const target = tasks.find((t) => t.id === id);
    if (target) {
      const updateItem: TaskUpdate = {
        id: `upd_${Date.now()}`,
        task_id: id,
        user_id: user.id,
        author_name: user.name.split(' ')[0] || 'User',
        status: newStatus,
        progress: newStatus === 'Done' ? 100 : target.progress,
        update_text: `Status changed from ${target.status} to ${newStatus}`,
        created_at: new Date().toISOString(),
      };
      setTaskUpdates((prev) => [updateItem, ...prev]);
    }
  };

  const submitTaskUpdate = (
    taskId: string,
    payload: {
      status: TaskStatus;
      progress: number;
      updateText: string;
      nextAction?: string;
      nextFollowupDate?: string;
      notes?: string;
    }
  ) => {
    updateTask(taskId, {
      status: payload.status,
      progress: payload.progress,
      next_action: payload.nextAction,
      notes: payload.notes,
    });

    const updateItem: TaskUpdate = {
      id: `upd_${Date.now()}`,
      task_id: taskId,
      user_id: user.id,
      author_name: user.name.split(' ')[0] || 'User',
      status: payload.status,
      progress: payload.progress,
      update_text: payload.updateText,
      next_action: payload.nextAction,
      next_followup_date: payload.nextFollowupDate,
      notes: payload.notes,
      created_at: new Date().toISOString(),
    };

    setTaskUpdates((prev) => [updateItem, ...prev]);

    // If next followup date was specified, optionally sync or add a followup
    if (payload.nextFollowupDate && payload.nextAction) {
      const task = tasks.find((t) => t.id === taskId);
      const newFollowup: Followup = {
        id: `fol_${Date.now()}`,
        user_id: user.id,
        project_id: task?.project_id,
        person: 'Assigned Stakeholder',
        topic: payload.nextAction,
        last_discussion: new Date().toLocaleDateString('en-GB'),
        expected_action: payload.nextAction,
        followup_date: payload.nextFollowupDate,
        status: 'Pending',
        notes: `Auto-created from task update: ${task?.title}`,
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString(),
      };
      setFollowups((prev) => [newFollowup, ...prev]);
    }
  };

  // Project methods
  const addProject = (newProj: Partial<Project>) => {
    const proj: Project = {
      id: `prj_${Date.now()}`,
      user_id: user.id,
      name: newProj.name || 'Untitled Project',
      description: newProj.description || '',
      status: newProj.status || 'Active',
      priority: newProj.priority || 'Medium',
      start_date: newProj.start_date || new Date().toISOString().split('T')[0],
      end_date: newProj.end_date || new Date().toISOString().split('T')[0],
      owner: newProj.owner || user.name.split(' ')[0],
      tags: newProj.tags || [],
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString(),
    };
    setProjects((prev) => [proj, ...prev]);
  };

  const updateProject = (id: string, updates: Partial<Project>) => {
    setProjects((prev) =>
      prev.map((p) => (p.id === id ? { ...p, ...updates, updated_at: new Date().toISOString() } : p))
    );
  };

  const deleteProject = (id: string) => {
    setProjects((prev) => prev.filter((p) => p.id !== id));
  };

  const getProjectStats = (projectId: string) => {
    const projTasks = tasks.filter((t) => t.project_id === projectId);
    const total = projTasks.length;
    const completed = projTasks.filter((t) => t.status === 'Done').length;
    const blocked = projTasks.filter((t) => t.status === 'Blocked').length;
    const pending = total - completed;
    const progress = total > 0 ? Math.round((completed / total) * 100) : 0;
    return { total, completed, pending, blocked, progress };
  };

  const getProjectProgress = (projectId: string) => {
    return getProjectStats(projectId).progress;
  };

  // Followup methods
  const addFollowup = (f: Partial<Followup>) => {
    const item: Followup = {
      id: `fol_${Date.now()}`,
      user_id: user.id,
      project_id: f.project_id,
      person: f.person || 'Stakeholder',
      topic: f.topic || 'General Follow-up',
      last_discussion: f.last_discussion || new Date().toLocaleDateString('en-GB'),
      expected_action: f.expected_action || '',
      followup_date: f.followup_date || new Date().toISOString().split('T')[0],
      status: f.status || 'Pending',
      notes: f.notes || '',
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString(),
    };
    setFollowups((prev) => [item, ...prev]);
  };

  const updateFollowup = (id: string, updates: Partial<Followup>) => {
    setFollowups((prev) =>
      prev.map((f) => (f.id === id ? { ...f, ...updates, updated_at: new Date().toISOString() } : f))
    );
  };

  const deleteFollowup = (id: string) => {
    setFollowups((prev) => prev.filter((f) => f.id !== id));
  };

  const updateFollowupStatus = (id: string, status: FollowupStatus) => {
    updateFollowup(id, { status });
  };

  // Meeting methods
  const addMeeting = (m: Partial<Meeting>) => {
    const item: Meeting = {
      id: `mtg_${Date.now()}`,
      user_id: user.id,
      project_id: m.project_id,
      title: m.title || 'Untitled Meeting',
      meeting_date: m.meeting_date || new Date().toISOString().split('T')[0],
      start_time: m.start_time || '10:00 AM',
      end_time: m.end_time || '11:00 AM',
      participants: m.participants || 'Team',
      agenda: m.agenda || '',
      notes: m.notes || '',
      decisions: m.decisions || '',
      action_items: m.action_items || [],
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString(),
    };
    setMeetings((prev) => [item, ...prev]);
  };

  const updateMeeting = (id: string, updates: Partial<Meeting>) => {
    setMeetings((prev) =>
      prev.map((m) => (m.id === id ? { ...m, ...updates, updated_at: new Date().toISOString() } : m))
    );
  };

  const deleteMeeting = (id: string) => {
    setMeetings((prev) => prev.filter((m) => m.id !== id));
  };

  const convertMeetingActionItemToTask = (meetingId: string, actionItemId: string) => {
    const meeting = meetings.find((m) => m.id === meetingId);
    if (!meeting || !meeting.action_items) return;
    const actionItem = meeting.action_items.find((a) => a.id === actionItemId);
    if (!actionItem) return;

    // Create task
    const taskId = `tsk_${Date.now()}`;
    const newTask: Task = {
      id: taskId,
      user_id: user.id,
      project_id: meeting.project_id || projects[0]?.id || 'prj_assam_idp',
      title: actionItem.text,
      description: `Action item from meeting "${meeting.title}" on ${meeting.meeting_date}`,
      task_type: 'Development',
      priority: 'High',
      status: 'To Do',
      progress: 0,
      start_date: new Date().toISOString().split('T')[0],
      due_date: new Date().toISOString().split('T')[0],
      next_action: `Assigned: ${actionItem.assigned_to || 'Assignee'}`,
      tags: ['Action Item', 'Meeting'],
      notes: `Generated from meeting ${meeting.title}`,
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString(),
    };
    setTasks((prev) => [newTask, ...prev]);

    // Update meeting action item with converted_to_task_id
    const updatedActionItems = meeting.action_items.map((a) =>
      a.id === actionItemId ? { ...a, converted_to_task_id: taskId } : a
    );
    updateMeeting(meetingId, { action_items: updatedActionItems });
  };

  // Issue methods
  const addIssue = (i: Partial<Issue>) => {
    const item: Issue = {
      id: `iss_${Date.now()}`,
      user_id: user.id,
      project_id: i.project_id,
      task_id: i.task_id,
      title: i.title || 'Untitled Issue',
      description: i.description || '',
      severity: i.severity || 'Medium',
      status: i.status || 'Open',
      owner: i.owner || 'Manash',
      expected_resolution: i.expected_resolution || '',
      notes: i.notes || '',
      created_at: new Date().toISOString(),
    };
    setIssues((prev) => [item, ...prev]);
  };

  const updateIssue = (id: string, updates: Partial<Issue>) => {
    setIssues((prev) =>
      prev.map((iss) => (iss.id === id ? { ...iss, ...updates } : iss))
    );
  };

  const deleteIssue = (id: string) => {
    setIssues((prev) => prev.filter((i) => i.id !== id));
  };

  const resolveIssue = (id: string) => {
    updateIssue(id, {
      status: 'Resolved',
      resolved_at: new Date().toISOString(),
    });
  };

  // Daily log methods
  const getDailyLog = (date: string) => {
    return dailyLogs.find((l) => l.log_date === date);
  };

  const saveDailyLog = (log: Partial<DailyLog>) => {
    const targetDate = log.log_date;
    if (!targetDate) return;
    setDailyLogs((prev) => {
      const index = prev.findIndex((l) => l.log_date === targetDate);
      if (index >= 0) {
        const copy = [...prev];
        copy[index] = {
          ...copy[index],
          ...log,
          updated_at: new Date().toISOString(),
        } as DailyLog;
        return copy;
      } else {
        const newLog: DailyLog = {
          id: `log_${targetDate.replace(/-/g, '_')}`,
          user_id: user.id,
          log_date: targetDate,
          worked_on: log.worked_on || '',
          completed: log.completed || '',
          pending: log.pending || '',
          blocked: log.blocked || '',
          decisions: log.decisions || '',
          people_coordinated: log.people_coordinated || '',
          summary: log.summary || '',
          notes: log.notes || '',
          created_at: new Date().toISOString(),
          updated_at: new Date().toISOString(),
        };
        return [newLog, ...prev];
      }
    });
  };

  const generateTodaySummary = (date: string) => {
    // Collect today's completed tasks
    const completedTasksList = tasks.filter(
      (t) => t.status === 'Done' && (t.completed_at?.startsWith(date) || t.due_date === date)
    );
    // Collect today's pending tasks
    const pendingTasksList = tasks.filter((t) => t.due_date === date && t.status !== 'Done');
    // Collect blocked items
    const blockedList = tasks.filter((t) => t.status === 'Blocked');
    // Collect today's meetings
    const todayMeetings = meetings.filter((m) => m.meeting_date === date);
    // Collect today's followups
    const todayFollowups = followups.filter((f) => f.followup_date === date);

    const worked_on = [
      ...tasks.filter((t) => t.status === 'In Progress').map((t) => `• In Progress: ${t.title} (${projects.find(p => p.id === t.project_id)?.name || 'Project'})`),
      ...todayMeetings.map((m) => `• Attended meeting: ${m.title} (${m.start_time})`),
      ...todayFollowups.map((f) => `• Followed up with: ${f.person} on ${f.topic}`)
    ].join('\n') || '• Worked on sprint backlog items and daily coordination.';

    const completed = completedTasksList.length > 0
      ? completedTasksList.map((t) => `• Completed: ${t.title}`).join('\n')
      : '• No tasks marked as Done today.';

    const pending = pendingTasksList.length > 0
      ? pendingTasksList.map((t) => `• Pending: ${t.title} (Progress: ${t.progress}%)`).join('\n')
      : '• All today\'s scheduled tasks completed.';

    const blocked = blockedList.length > 0
      ? blockedList.map((t) => `• Blocked: ${t.title} - ${t.next_action || 'Pending unblock'}`).join('\n')
      : '• No critical blockers encountered today.';

    const peopleList = Array.from(new Set([
      ...todayMeetings.flatMap((m) => m.participants.split(',').map((p) => p.trim())),
      ...todayFollowups.map((f) => f.person)
    ])).filter(Boolean).join(', ');

    const summary = `Completed ${completedTasksList.length} tasks today, with ${pendingTasksList.length} pending and ${blockedList.length} blockers. Conducted ${todayMeetings.length} meetings and addressed ${todayFollowups.length} follow-ups.`;

    return {
      worked_on,
      completed,
      pending,
      blocked,
      summary,
      people_coordinated: peopleList || 'Internal delivery team',
    };
  };

  // Achievement methods
  const addAchievement = (a: Partial<Achievement>) => {
    const item: Achievement = {
      id: `ach_${Date.now()}`,
      user_id: user.id,
      project_id: a.project_id,
      title: a.title || 'Untitled Achievement',
      description: a.description || '',
      impact: a.impact || '',
      category: a.category || 'Delivery',
      achievement_date: a.achievement_date || new Date().toISOString().split('T')[0],
      tags: a.tags || [],
      created_at: new Date().toISOString(),
    };
    setAchievements((prev) => [item, ...prev]);
  };

  const deleteAchievement = (id: string) => {
    setAchievements((prev) => prev.filter((a) => a.id !== id));
  };

  // Milestone methods
  const addMilestone = (m: Partial<Milestone>) => {
    const item: Milestone = {
      id: `mls_${Date.now()}`,
      project_id: m.project_id || projects[0]?.id || 'prj_assam_idp',
      title: m.title || 'New Milestone',
      description: m.description || '',
      due_date: m.due_date || new Date().toISOString().split('T')[0],
      status: m.status || 'Pending',
      created_at: new Date().toISOString(),
    };
    setMilestones((prev) => [item, ...prev]);
  };

  const toggleMilestoneStatus = (id: string) => {
    setMilestones((prev) =>
      prev.map((m) => {
        if (m.id === id) {
          const nextStatus = m.status === 'Completed' ? 'In Progress' : 'Completed';
          return {
            ...m,
            status: nextStatus,
            completed_at: nextStatus === 'Completed' ? new Date().toISOString() : null,
          };
        }
        return m;
      })
    );
  };

  // Note methods
  const addNote = (n: Partial<Note>) => {
    const item: Note = {
      id: `not_${Date.now()}`,
      user_id: user.id,
      project_id: n.project_id,
      task_id: n.task_id,
      title: n.title || 'Untitled Note',
      content: n.content || '',
      tags: n.tags || [],
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString(),
    };
    setNotes((prev) => [item, ...prev]);
  };

  const updateNote = (id: string, updates: Partial<Note>) => {
    setNotes((prev) =>
      prev.map((n) => (n.id === id ? { ...n, ...updates, updated_at: new Date().toISOString() } : n))
    );
  };

  const deleteNote = (id: string) => {
    setNotes((prev) => prev.filter((n) => n.id !== id));
  };

  // Notifications calculation
  const notifications: NotificationItem[] = useMemo(() => {
    const today = new Date().toISOString().split('T')[0];
    const items: NotificationItem[] = [];

    // Tasks due today
    tasks
      .filter((t) => t.due_date === today && t.status !== 'Done')
      .forEach((t) => {
        items.push({
          id: `notif_due_${t.id}`,
          title: 'Task Due Today',
          message: `${t.title} (${t.priority} priority)`,
          type: 'task_due',
          target_id: t.id,
          timestamp: 'Today',
          read: false,
        });
      });

    // Overdue tasks
    tasks
      .filter((t) => t.due_date < today && t.status !== 'Done')
      .forEach((t) => {
        items.push({
          id: `notif_overdue_${t.id}`,
          title: 'Task Overdue ⚠️',
          message: `${t.title} was due on ${t.due_date}`,
          type: 'task_overdue',
          target_id: t.id,
          timestamp: 'Overdue',
          read: false,
        });
      });

    // Follow-ups due
    followups
      .filter((f) => f.followup_date <= today && f.status !== 'Completed')
      .forEach((f) => {
        items.push({
          id: `notif_fol_${f.id}`,
          title: 'Follow-up Due Today',
          message: `Follow up with ${f.person} on ${f.topic}`,
          type: 'followup_due',
          target_id: f.id,
          timestamp: 'Today',
          read: false,
        });
      });

    // Blockers
    issues
      .filter((i) => i.status !== 'Resolved' && i.status !== 'Closed')
      .forEach((i) => {
        items.push({
          id: `notif_iss_${i.id}`,
          title: 'Active Blocker 🔴',
          message: `${i.title} (${i.severity} severity)`,
          type: 'blocker',
          target_id: i.id,
          timestamp: 'Action Needed',
          read: false,
        });
      });

    // Meetings today
    meetings
      .filter((m) => m.meeting_date === today)
      .forEach((m) => {
        items.push({
          id: `notif_mtg_${m.id}`,
          title: 'Meeting Scheduled',
          message: `${m.title} at ${m.start_time}`,
          type: 'meeting',
          target_id: m.id,
          timestamp: m.start_time,
          read: false,
        });
      });

    return items;
  }, [tasks, followups, issues, meetings]);

  const [dismissedNotifications, setDismissedNotifications] = useState<string[]>([]);

  const activeNotifications = useMemo(() => {
    return notifications.filter((n) => !dismissedNotifications.includes(n.id));
  }, [notifications, dismissedNotifications]);

  const markNotificationRead = (id: string) => {
    setDismissedNotifications((prev) => [...prev, id]);
  };

  const clearAllNotifications = () => {
    setDismissedNotifications(notifications.map((n) => n.id));
  };

  // Reset to seed data
  const resetToSeedData = () => {
    localStorage.removeItem(STORAGE_KEY);
    setUser(CURRENT_USER);
    setProjects(INITIAL_PROJECTS);
    setTasks(INITIAL_TASKS);
    setTaskUpdates(INITIAL_TASK_UPDATES);
    setFollowups(INITIAL_FOLLOWUPS);
    setMeetings(INITIAL_MEETINGS);
    setIssues(INITIAL_ISSUES);
    setDailyLogs(INITIAL_DAILY_LOGS);
    setAchievements(INITIAL_ACHIEVEMENTS);
    setMilestones(INITIAL_MILESTONES);
    setNotes(INITIAL_NOTES);
  };

  const exportDataJSON = () => {
    const payload = {
      exportedAt: new Date().toISOString(),
      user,
      projects,
      tasks,
      taskUpdates,
      followups,
      meetings,
      issues,
      dailyLogs,
      achievements,
      milestones,
      notes,
    };
    return JSON.stringify(payload, null, 2);
  };

  const importDataJSON = (jsonStr: string) => {
    try {
      const parsed = JSON.parse(jsonStr);
      if (parsed.projects) setProjects(parsed.projects);
      if (parsed.tasks) setTasks(parsed.tasks);
      if (parsed.taskUpdates) setTaskUpdates(parsed.taskUpdates);
      if (parsed.followups) setFollowups(parsed.followups);
      if (parsed.meetings) setMeetings(parsed.meetings);
      if (parsed.issues) setIssues(parsed.issues);
      if (parsed.dailyLogs) setDailyLogs(parsed.dailyLogs);
      if (parsed.achievements) setAchievements(parsed.achievements);
      if (parsed.milestones) setMilestones(parsed.milestones);
      if (parsed.notes) setNotes(parsed.notes);
      return true;
    } catch (e) {
      console.error('Invalid JSON import', e);
      return false;
    }
  };

  // Supabase sync capability if configured
  const syncWithSupabase = async () => {
    if (!supabase || !isSupabaseConfigured) return;
    try {
      // Sync logic with Supabase database tables
      console.log('Syncing data with Supabase...');
    } catch (e) {
      console.error('Supabase sync error', e);
    }
  };

  return (
    <WorkOSContext.Provider
      value={{
        user,
        projects,
        tasks,
        taskUpdates,
        followups,
        meetings,
        issues,
        dailyLogs,
        achievements,
        notes,
        milestones,
        notifications: activeNotifications,
        darkMode,
        toggleDarkMode,
        activeTab,
        setActiveTab,
        selectedProjectId,
        setSelectedProjectId,
        isSearchOpen,
        setIsSearchOpen,
        isQuickAddOpen,
        setIsQuickAddOpen,
        quickAddType,
        openQuickAdd,
        closeQuickAdd,
        quickUpdateTask,
        openQuickUpdate,
        closeQuickUpdate,
        historyTask,
        openHistory,
        closeHistory,
        addTask,
        updateTask,
        deleteTask,
        updateTaskStatus,
        submitTaskUpdate,
        addProject,
        updateProject,
        deleteProject,
        getProjectProgress,
        getProjectStats,
        addFollowup,
        updateFollowup,
        deleteFollowup,
        updateFollowupStatus,
        addMeeting,
        updateMeeting,
        deleteMeeting,
        convertMeetingActionItemToTask,
        addIssue,
        updateIssue,
        deleteIssue,
        resolveIssue,
        getDailyLog,
        saveDailyLog,
        generateTodaySummary,
        addAchievement,
        deleteAchievement,
        addMilestone,
        toggleMilestoneStatus,
        addNote,
        updateNote,
        deleteNote,
        markNotificationRead,
        clearAllNotifications,
        resetToSeedData,
        exportDataJSON,
        importDataJSON,
        isSupabaseMode: isSupabaseConfigured,
        syncWithSupabase,
      }}
    >
      {children}
    </WorkOSContext.Provider>
  );
}

export function useWorkOS() {
  const context = useContext(WorkOSContext);
  if (!context) {
    throw new Error('useWorkOS must be used within a WorkOSProvider');
  }
  return context;
}
