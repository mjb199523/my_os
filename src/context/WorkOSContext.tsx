'use client';

import React, { createContext, useContext, useState, useEffect, useMemo, ReactNode, useCallback } from 'react';
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
  AdminMessage,
  MessagePriority,
  TaskStatus,
  FollowupStatus,
  IssueStatus,
} from '@/types';
import {
  CURRENT_USER,
  INITIAL_USERS,
  INITIAL_ADMIN_MESSAGES,
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
import { getSupabase, isSupabaseConfigured, setSupabaseCredentials, clearSupabaseCredentials } from '@/lib/supabase';

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
  quickAddProjectId?: string;
  openQuickAdd: (type?: 'task' | 'followup' | 'meeting' | 'issue' | 'note' | 'achievement', projectId?: string) => void;
  closeQuickAdd: () => void;
  quickUpdateTask: Task | null;
  openQuickUpdate: (task: Task) => void;
  closeQuickUpdate: () => void;
  historyTask: Task | null;
  openHistory: (task: Task) => void;
  closeHistory: () => void;
  isAuthModalOpen: boolean;
  setIsAuthModalOpen: (open: boolean) => void;

  // Task actions
  addTask: (task: Partial<Task>) => Promise<void>;
  updateTask: (id: string, updates: Partial<Task>) => Promise<void>;
  deleteTask: (id: string) => Promise<void>;
  updateTaskStatus: (id: string, newStatus: TaskStatus) => Promise<void>;
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
  ) => Promise<void>;

  // Project actions
  addProject: (proj: Partial<Project>) => Promise<void>;
  updateProject: (id: string, updates: Partial<Project>) => Promise<void>;
  deleteProject: (id: string) => Promise<void>;
  getProjectProgress: (projectId: string) => number;
  getProjectStats: (projectId: string) => { total: number; completed: number; pending: number; blocked: number; progress: number };

  // Followup actions
  addFollowup: (f: Partial<Followup>) => Promise<void>;
  updateFollowup: (id: string, updates: Partial<Followup>) => Promise<void>;
  deleteFollowup: (id: string) => Promise<void>;
  updateFollowupStatus: (id: string, status: FollowupStatus) => Promise<void>;

  // Meeting actions
  addMeeting: (m: Partial<Meeting>) => Promise<void>;
  updateMeeting: (id: string, updates: Partial<Meeting>) => Promise<void>;
  deleteMeeting: (id: string) => Promise<void>;
  convertMeetingActionItemToTask: (meetingId: string, actionItemId: string) => Promise<void>;
  addMeetingActionItem: (meetingId: string, text: string, assignedTo?: string) => Promise<void>;

  // Issue actions
  addIssue: (i: Partial<Issue>) => Promise<void>;
  updateIssue: (id: string, updates: Partial<Issue>) => Promise<void>;
  deleteIssue: (id: string) => Promise<void>;
  resolveIssue: (id: string) => Promise<void>;

  // Daily log actions
  getDailyLog: (date: string) => DailyLog | undefined;
  saveDailyLog: (log: Partial<DailyLog>) => Promise<void>;
  generateTodaySummary: (date: string) => {
    worked_on: string;
    completed: string;
    pending: string;
    blocked: string;
    summary: string;
    people_coordinated: string;
  };

  // Achievement actions
  addAchievement: (a: Partial<Achievement>) => Promise<void>;
  deleteAchievement: (id: string) => Promise<void>;

  // Milestone actions
  addMilestone: (m: Partial<Milestone>) => Promise<void>;
  deleteMilestone: (id: string) => Promise<void>;
  toggleMilestoneStatus: (id: string) => Promise<void>;

  // Note actions
  addNote: (n: Partial<Note>) => Promise<void>;
  updateNote: (id: string, updates: Partial<Note>) => Promise<void>;
  deleteNote: (id: string) => Promise<void>;

  // Admin user scope filter ('all' or specific user ID)
  adminUserFilter: string;
  setAdminUserFilter: (userIdOrAll: string) => void;

  // User profile & Portal user actions
  updateUser: (updates: Partial<User>) => Promise<void>;
  users: User[];
  isAdmin: boolean;
  addUser: (newUser: {
    name: string;
    email: string;
    role?: string;
    system_role: 'Admin' | 'User';
    password?: string;
    status?: 'Active' | 'Inactive';
  }) => Promise<{ success: boolean; error?: string }>;
  updatePortalUser: (id: string, updates: Partial<User>) => Promise<{ success: boolean; error?: string }>;
  deletePortalUser: (id: string) => Promise<{ success: boolean; error?: string }>;
  loginWithCredentials: (email: string, pass: string) => Promise<{ success: boolean; error?: string; user?: User }>;

  // Admin Messages & Notification Centre
  adminMessages: AdminMessage[];
  unreadNotificationsCount: number;
  sendAdminMessage: (payload: {
    target_user_id: string;
    title: string;
    message: string;
    priority?: MessagePriority;
  }) => Promise<{ success: boolean; error?: string }>;
  deleteAdminMessage: (id: string) => Promise<{ success: boolean; error?: string }>;
  isComposeMessageOpen: boolean;
  setIsComposeMessageOpen: (open: boolean) => void;
  composeTargetUserId?: string;
  openComposeMessage: (targetUserId?: string) => void;
  closeComposeMessage: () => void;
  markNotificationRead: (id: string) => void;
  clearAllNotifications: () => void;

  // Supabase & Auth
  isAuthenticated: boolean;
  loginUser: (email: string) => void;
  isSupabaseConnected: boolean;
  isSyncing: boolean;
  lastSyncedAt: string | null;
  connectSupabase: (url: string, key: string) => Promise<boolean>;
  disconnectSupabase: () => void;
  syncWithSupabase: () => Promise<void>;
  signInWithPassword: (email: string, pass: string) => Promise<{ error: any }>;
  signUpWithPassword: (email: string, pass: string, name: string) => Promise<{ error: any }>;
  signOutUser: () => Promise<void>;

  // System & Backup
  clearAllData: () => void;
  resetToSeedData: () => void;
  exportDataJSON: () => string;
  importDataJSON: (jsonStr: string) => boolean;
}

const WorkOSContext = createContext<WorkOSContextType | undefined>(undefined);

const STORAGE_KEY = 'my_work_os_data_v2';

export function WorkOSProvider({ children }: { children: ReactNode }) {
  const [activeTab, setActiveTab] = useState<string>('dashboard');
  const [selectedProjectId, setSelectedProjectId] = useState<string | null>(null);

  // Modals state
  const [isSearchOpen, setIsSearchOpen] = useState(false);
  const [isQuickAddOpen, setIsQuickAddOpen] = useState(false);
  const [quickAddType, setQuickAddType] = useState<'task' | 'followup' | 'meeting' | 'issue' | 'note' | 'achievement' | null>(null);
  const [quickAddProjectId, setQuickAddProjectId] = useState<string | undefined>(undefined);
  const [quickUpdateTask, setQuickUpdateTask] = useState<Task | null>(null);
  const [historyTask, setHistoryTask] = useState<Task | null>(null);
  const [isAuthModalOpen, setIsAuthModalOpen] = useState(false);
  const [adminMessages, setAdminMessages] = useState<AdminMessage[]>(INITIAL_ADMIN_MESSAGES);
  const [isComposeMessageOpen, setIsComposeMessageOpen] = useState(false);
  const [composeTargetUserId, setComposeTargetUserId] = useState<string | undefined>(undefined);

  const openComposeMessage = (targetUserId?: string) => {
    setComposeTargetUserId(targetUserId);
    setIsComposeMessageOpen(true);
  };

  const closeComposeMessage = () => {
    setIsComposeMessageOpen(false);
    setComposeTargetUserId(undefined);
  };

  // Sync state
  const [isSyncing, setIsSyncing] = useState(false);
  const [lastSyncedAt, setLastSyncedAt] = useState<string | null>(null);
  const [isSupabaseConnected, setIsSupabaseConnected] = useState(false);

  // Auth & Session state
  const [isAuthenticated, setIsAuthenticated] = useState<boolean>(false);

  // Data state: Master entities across all users
  const [users, setUsers] = useState<User[]>(INITIAL_USERS);
  const [user, setUser] = useState<User>(CURRENT_USER);

  const isAdmin = useMemo(() => {
    return user?.system_role === 'Admin';
  }, [user?.system_role]);

  // Admin filter: 'all' to see everyone, or specific user ID to focus on one user
  const [adminUserFilter, setAdminUserFilter] = useState<string>('all');

  const [allProjects, setAllProjects] = useState<Project[]>(INITIAL_PROJECTS);
  const [allTasks, setAllTasks] = useState<Task[]>(INITIAL_TASKS);
  const [allTaskUpdates, setAllTaskUpdates] = useState<TaskUpdate[]>(INITIAL_TASK_UPDATES);
  const [allFollowups, setAllFollowups] = useState<Followup[]>(INITIAL_FOLLOWUPS);
  const [allMeetings, setAllMeetings] = useState<Meeting[]>(INITIAL_MEETINGS);
  const [allIssues, setAllIssues] = useState<Issue[]>(INITIAL_ISSUES);
  const [allDailyLogs, setAllDailyLogs] = useState<DailyLog[]>(INITIAL_DAILY_LOGS);
  const [allAchievements, setAllAchievements] = useState<Achievement[]>(INITIAL_ACHIEVEMENTS);
  const [allNotes, setAllNotes] = useState<Note[]>(INITIAL_NOTES);
  const [allMilestones, setAllMilestones] = useState<Milestone[]>(INITIAL_MILESTONES);
  const [isInitialized, setIsInitialized] = useState(false);

  // =========================================================================
  // SCOPED VIEWS: Admin sees all (or filtered user); User sees ONLY own data
  // =========================================================================

  // Visible Projects
  const projects = useMemo(() => {
    if (isAdmin) {
      if (adminUserFilter === 'all') return allProjects;
      return allProjects.filter((p) => p.user_id === adminUserFilter);
    }
    return allProjects.filter((p) => p.user_id === user.id);
  }, [allProjects, isAdmin, adminUserFilter, user.id]);

  const visibleProjectIds = useMemo(() => new Set(projects.map((p) => p.id)), [projects]);

  // Visible Tasks
  const tasks = useMemo(() => {
    if (isAdmin) {
      if (adminUserFilter === 'all') return allTasks;
      return allTasks.filter((t) => t.user_id === adminUserFilter);
    }
    return allTasks.filter((t) => t.user_id === user.id);
  }, [allTasks, isAdmin, adminUserFilter, user.id]);

  const visibleTaskIds = useMemo(() => new Set(tasks.map((t) => t.id)), [tasks]);

  // Visible Task Updates
  const taskUpdates = useMemo(() => {
    if (isAdmin) {
      if (adminUserFilter === 'all') return allTaskUpdates;
      return allTaskUpdates.filter((u) => u.user_id === adminUserFilter || visibleTaskIds.has(u.task_id));
    }
    return allTaskUpdates.filter((u) => u.user_id === user.id || visibleTaskIds.has(u.task_id));
  }, [allTaskUpdates, isAdmin, adminUserFilter, user.id, visibleTaskIds]);

  // Visible Followups
  const followups = useMemo(() => {
    if (isAdmin) {
      if (adminUserFilter === 'all') return allFollowups;
      return allFollowups.filter((f) => f.user_id === adminUserFilter);
    }
    return allFollowups.filter((f) => f.user_id === user.id);
  }, [allFollowups, isAdmin, adminUserFilter, user.id]);

  // Visible Meetings
  const meetings = useMemo(() => {
    if (isAdmin) {
      if (adminUserFilter === 'all') return allMeetings;
      return allMeetings.filter((m) => m.user_id === adminUserFilter);
    }
    return allMeetings.filter((m) => m.user_id === user.id);
  }, [allMeetings, isAdmin, adminUserFilter, user.id]);

  // Visible Issues
  const issues = useMemo(() => {
    if (isAdmin) {
      if (adminUserFilter === 'all') return allIssues;
      return allIssues.filter((i) => i.user_id === adminUserFilter);
    }
    return allIssues.filter((i) => i.user_id === user.id);
  }, [allIssues, isAdmin, adminUserFilter, user.id]);

  // Visible Daily Logs
  const dailyLogs = useMemo(() => {
    if (isAdmin) {
      if (adminUserFilter === 'all') return allDailyLogs;
      return allDailyLogs.filter((d) => d.user_id === adminUserFilter);
    }
    return allDailyLogs.filter((d) => d.user_id === user.id);
  }, [allDailyLogs, isAdmin, adminUserFilter, user.id]);

  // Visible Achievements
  const achievements = useMemo(() => {
    if (isAdmin) {
      if (adminUserFilter === 'all') return allAchievements;
      return allAchievements.filter((a) => a.user_id === adminUserFilter);
    }
    return allAchievements.filter((a) => a.user_id === user.id);
  }, [allAchievements, isAdmin, adminUserFilter, user.id]);

  // Visible Notes
  const notes = useMemo(() => {
    if (isAdmin) {
      if (adminUserFilter === 'all') return allNotes;
      return allNotes.filter((n) => n.user_id === adminUserFilter);
    }
    return allNotes.filter((n) => n.user_id === user.id);
  }, [allNotes, isAdmin, adminUserFilter, user.id]);

  // Visible Milestones
  const milestones = useMemo(() => {
    if (isAdmin) {
      if (adminUserFilter === 'all') return allMilestones;
      return allMilestones.filter((m) => visibleProjectIds.has(m.project_id));
    }
    return allMilestones.filter((m) => visibleProjectIds.has(m.project_id));
  }, [allMilestones, isAdmin, adminUserFilter, visibleProjectIds]);

  // 1. Initial Load & Setup
  useEffect(() => {
    try {
      if (typeof window !== 'undefined') {
        localStorage.removeItem('my_work_os_theme');
        document.documentElement.classList.remove('dark');
      }

      const sessionAuth = localStorage.getItem('my_work_os_authenticated');
      if (sessionAuth === 'true') {
        setIsAuthenticated(true);
      }

      const client = getSupabase();
      if (client) {
        setIsSupabaseConnected(true);
        syncWithSupabase();
      }

      const savedData = localStorage.getItem(STORAGE_KEY);
      if (savedData) {
        const parsed = JSON.parse(savedData);
        let loadedUsers: User[] = INITIAL_USERS;
        if (Array.isArray(parsed.users) && parsed.users.length > 0) {
          const existingEmails = new Set(parsed.users.map((u: User) => u.email.toLowerCase()));
          const merged = [...parsed.users];
          for (const iu of INITIAL_USERS) {
            if (!existingEmails.has(iu.email.toLowerCase())) {
              merged.push(iu);
            }
          }
          loadedUsers = merged;
          setUsers(loadedUsers);
        } else {
          setUsers(INITIAL_USERS);
        }

        const activeUserId = localStorage.getItem('my_work_os_active_user_id');
        if (activeUserId) {
          const activeUser = loadedUsers.find((u: User) => u.id === activeUserId);
          if (activeUser) {
            setUser(activeUser);
          } else if (parsed.user) {
            setUser({
              ...parsed.user,
              system_role: parsed.user.system_role || 'Admin',
            });
          }
        } else if (parsed.user) {
          setUser({
            ...parsed.user,
            system_role: parsed.user.system_role || 'Admin',
          });
        }

        // Helper to load or merge seed data so new demo users always have seed items
        if (Array.isArray(parsed.projects)) {
          const existingIds = new Set(parsed.projects.map((p: Project) => p.id));
          const merged = [...parsed.projects];
          for (const ip of INITIAL_PROJECTS) {
            if (!existingIds.has(ip.id)) merged.push(ip);
          }
          setAllProjects(merged);
        } else {
          setAllProjects(INITIAL_PROJECTS);
        }

        if (Array.isArray(parsed.tasks)) {
          const existingIds = new Set(parsed.tasks.map((t: Task) => t.id));
          const merged = [...parsed.tasks];
          for (const it of INITIAL_TASKS) {
            if (!existingIds.has(it.id)) merged.push(it);
          }
          setAllTasks(merged);
        } else {
          setAllTasks(INITIAL_TASKS);
        }

        if (Array.isArray(parsed.taskUpdates)) {
          setAllTaskUpdates(parsed.taskUpdates);
        } else {
          setAllTaskUpdates(INITIAL_TASK_UPDATES);
        }

        if (Array.isArray(parsed.followups)) {
          const existingIds = new Set(parsed.followups.map((f: Followup) => f.id));
          const merged = [...parsed.followups];
          for (const ifo of INITIAL_FOLLOWUPS) {
            if (!existingIds.has(ifo.id)) merged.push(ifo);
          }
          setAllFollowups(merged);
        } else {
          setAllFollowups(INITIAL_FOLLOWUPS);
        }

        if (Array.isArray(parsed.meetings)) {
          const existingIds = new Set(parsed.meetings.map((m: Meeting) => m.id));
          const merged = [...parsed.meetings];
          for (const im of INITIAL_MEETINGS) {
            if (!existingIds.has(im.id)) merged.push(im);
          }
          setAllMeetings(merged);
        } else {
          setAllMeetings(INITIAL_MEETINGS);
        }

        if (Array.isArray(parsed.issues)) {
          const existingIds = new Set(parsed.issues.map((i: Issue) => i.id));
          const merged = [...parsed.issues];
          for (const ii of INITIAL_ISSUES) {
            if (!existingIds.has(ii.id)) merged.push(ii);
          }
          setAllIssues(merged);
        } else {
          setAllIssues(INITIAL_ISSUES);
        }

        if (Array.isArray(parsed.dailyLogs)) {
          const existingIds = new Set(parsed.dailyLogs.map((d: DailyLog) => d.id));
          const merged = [...parsed.dailyLogs];
          for (const idl of INITIAL_DAILY_LOGS) {
            if (!existingIds.has(idl.id)) merged.push(idl);
          }
          setAllDailyLogs(merged);
        } else {
          setAllDailyLogs(INITIAL_DAILY_LOGS);
        }

        if (Array.isArray(parsed.achievements)) {
          const existingIds = new Set(parsed.achievements.map((a: Achievement) => a.id));
          const merged = [...parsed.achievements];
          for (const ia of INITIAL_ACHIEVEMENTS) {
            if (!existingIds.has(ia.id)) merged.push(ia);
          }
          setAllAchievements(merged);
        } else {
          setAllAchievements(INITIAL_ACHIEVEMENTS);
        }

        if (Array.isArray(parsed.notes)) {
          const existingIds = new Set(parsed.notes.map((n: Note) => n.id));
          const merged = [...parsed.notes];
          for (const inote of INITIAL_NOTES) {
            if (!existingIds.has(inote.id)) merged.push(inote);
          }
          setAllNotes(merged);
        } else {
          setAllNotes(INITIAL_NOTES);
        }

        if (Array.isArray(parsed.milestones)) {
          const existingIds = new Set(parsed.milestones.map((m: Milestone) => m.id));
          const merged = [...parsed.milestones];
          for (const im of INITIAL_MILESTONES) {
            if (!existingIds.has(im.id)) merged.push(im);
          }
          setAllMilestones(merged);
        } else {
          setAllMilestones(INITIAL_MILESTONES);
        }

        if (Array.isArray(parsed.adminMessages)) {
          setAdminMessages(parsed.adminMessages);
        } else {
          setAdminMessages(INITIAL_ADMIN_MESSAGES);
        }
      }
    } catch (e) {
      console.error('Failed to load local storage data', e);
    } finally {
      setIsInitialized(true);
    }
  }, []);

  // 2. Persistence to LocalStorage on every state update
  useEffect(() => {
    if (!isInitialized) return;
    try {
      const payload = {
        user,
        users,
        adminMessages,
        projects: allProjects,
        tasks: allTasks,
        taskUpdates: allTaskUpdates,
        followups: allFollowups,
        meetings: allMeetings,
        issues: allIssues,
        dailyLogs: allDailyLogs,
        achievements: allAchievements,
        notes: allNotes,
        milestones: allMilestones,
      };
      localStorage.setItem(STORAGE_KEY, JSON.stringify(payload));
    } catch (e) {
      console.error('Failed to save to local storage', e);
    }
  }, [
    isInitialized,
    user,
    users,
    adminMessages,
    allProjects,
    allTasks,
    allTaskUpdates,
    allFollowups,
    allMeetings,
    allIssues,
    allDailyLogs,
    allAchievements,
    allNotes,
    allMilestones,
  ]);

  // 3. Supabase Auth Listener & Cloud Sync
  useEffect(() => {
    const client = getSupabase();
    if (!client) return;

    // Check existing session
    client.auth.getUser().then(({ data }) => {
      if (data?.user) {
        setUser((prev) => ({
          ...prev,
          id: data.user.id,
          name: data.user.user_metadata?.full_name || prev.name || data.user.email?.split('@')[0] || 'User',
          email: data.user.email || prev.email,
          avatar_url: data.user.user_metadata?.avatar_url || prev.avatar_url || '',
          role: data.user.user_metadata?.role || prev.role || 'Product Delivery Manager',
          created_at: data.user.created_at,
        }));
      }
    });

    const { data: authListener } = client.auth.onAuthStateChange((_event, session) => {
      if (session?.user) {
        setUser((prev) => ({
          ...prev,
          id: session.user.id,
          name: session.user.user_metadata?.full_name || prev.name || session.user.email?.split('@')[0] || 'User',
          email: session.user.email || prev.email,
          avatar_url: session.user.user_metadata?.avatar_url || prev.avatar_url || '',
          role: session.user.user_metadata?.role || prev.role || 'Product Delivery Manager',
          created_at: session.user.created_at,
        }));
      }
    });

    return () => {
      authListener?.subscription.unsubscribe();
    };
  }, [isSupabaseConnected]);

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
  const openQuickAdd = (type: 'task' | 'followup' | 'meeting' | 'issue' | 'note' | 'achievement' = 'task', projectId?: string) => {
    setQuickAddType(type);
    setQuickAddProjectId(projectId);
    setIsQuickAddOpen(true);
  };

  const closeQuickAdd = () => {
    setIsQuickAddOpen(false);
    setQuickAddType(null);
    setQuickAddProjectId(undefined);
  };

  const openQuickUpdate = (task: Task) => setQuickUpdateTask(task);
  const closeQuickUpdate = () => setQuickUpdateTask(null);
  const openHistory = (task: Task) => setHistoryTask(task);
  const closeHistory = () => setHistoryTask(null);

  // SUPABASE CLOUD SYNC METHOD
  const syncWithSupabase = useCallback(async () => {
    const client = getSupabase();
    if (!client) return;

    setIsSyncing(true);
    try {
      // 1. Fetch remote projects
      const { data: remoteProjects, error: prjErr } = await client.from('projects').select('*');
      if (!prjErr && remoteProjects) {
        setAllProjects(remoteProjects);
      }

      // 2. Fetch remote tasks
      const { data: remoteTasks, error: tskErr } = await client.from('tasks').select('*');
      if (!tskErr && remoteTasks) {
        setAllTasks(remoteTasks);
      }

      // 3. Fetch remote followups
      const { data: remoteFollowups, error: folErr } = await client.from('followups').select('*');
      if (!folErr && remoteFollowups) {
        setAllFollowups(remoteFollowups);
      }

      // 4. Fetch remote meetings
      const { data: remoteMeetings, error: mtgErr } = await client.from('meetings').select('*');
      if (!mtgErr && remoteMeetings) {
        setAllMeetings(remoteMeetings);
      }

      // 5. Fetch remote issues
      const { data: remoteIssues, error: issErr } = await client.from('issues').select('*');
      if (!issErr && remoteIssues) {
        setAllIssues(remoteIssues);
      }

      // 6. Fetch remote daily logs
      const { data: remoteLogs, error: logErr } = await client.from('daily_logs').select('*');
      if (!logErr && remoteLogs) {
        setAllDailyLogs(remoteLogs);
      }

      // 7. Fetch remote achievements
      const { data: remoteAch, error: achErr } = await client.from('achievements').select('*');
      if (!achErr && remoteAch) {
        setAllAchievements(remoteAch);
      }

      // 8. Fetch remote milestones
      const { data: remoteMls, error: mlsErr } = await client.from('milestones').select('*');
      if (!mlsErr && remoteMls) {
        setAllMilestones(remoteMls);
      }

      // 9. Fetch remote notes
      const { data: remoteNotes, error: notErr } = await client.from('notes').select('*');
      if (!notErr && remoteNotes) {
        setAllNotes(remoteNotes);
      }

      // 10. Fetch remote users
      const { data: remoteUsers, error: usrErr } = await client.from('users').select('*');
      if (!usrErr && remoteUsers && remoteUsers.length > 0) {
        setUsers((prev) => {
          const merged = [...prev];
          for (const ru of remoteUsers) {
            const idx = merged.findIndex((u) => u.id === ru.id || u.email.toLowerCase() === ru.email.toLowerCase());
            if (idx >= 0) {
              merged[idx] = { ...merged[idx], ...ru };
            } else {
              merged.push({
                ...ru,
                system_role: ru.system_role || 'User',
                status: ru.status || 'Active',
              });
            }
          }
          return merged;
        });
      }

      // 11. Fetch remote admin messages (unidirectional notifications)
      const { data: remoteMsgs, error: msgErr } = await client
        .from('admin_messages')
        .select('*')
        .order('created_at', { ascending: false });
      if (!msgErr && remoteMsgs && remoteMsgs.length > 0) {
        setAdminMessages((prev) => {
          const merged = [...prev];
          for (const rm of remoteMsgs) {
            const idx = merged.findIndex((m) => m.id === rm.id);
            if (idx >= 0) {
              merged[idx] = { ...merged[idx], ...rm };
            } else {
              merged.push(rm);
            }
          }
          return merged;
        });
      }

      setLastSyncedAt(new Date().toLocaleTimeString());
    } catch (e) {
      console.error('Supabase sync error:', e);
    } finally {
      setIsSyncing(false);
    }
  }, []);

  const connectSupabase = async (url: string, key: string): Promise<boolean> => {
    const success = setSupabaseCredentials(url, key);
    if (success) {
      setIsSupabaseConnected(true);
      await syncWithSupabase();
      return true;
    }
    return false;
  };

  const disconnectSupabase = () => {
    clearSupabaseCredentials();
    setIsSupabaseConnected(false);
  };

  const signInWithPassword = async (email: string, pass: string) => {
    const client = getSupabase();
    if (!client) return { error: { message: 'Supabase client is not connected' } };
    const res = await client.auth.signInWithPassword({ email, password: pass });
    if (!res.error) {
      await syncWithSupabase();
    }
    return res;
  };

  const signUpWithPassword = async (email: string, pass: string, name: string) => {
    const client = getSupabase();
    if (!client) return { error: { message: 'Supabase client is not connected' } };
    const res = await client.auth.signUp({
      email,
      password: pass,
      options: { data: { full_name: name } },
    });
    return res;
  };

  const loginUser = (email: string) => {
    const cleanEmail = email.trim().toLowerCase();
    const matchedUser = users.find((u) => u.email.trim().toLowerCase() === cleanEmail);
    if (matchedUser) {
      setUser(matchedUser);
      localStorage.setItem('my_work_os_active_user_id', matchedUser.id);
    } else {
      setUser((prev) => ({
        ...prev,
        email: cleanEmail,
        name: prev.name || 'Manashjyoti Barman',
        system_role: 'Admin',
      }));
    }
    setIsAuthenticated(true);
    setAdminUserFilter('all');
    setActiveTab('dashboard');
    localStorage.setItem('my_work_os_authenticated', 'true');
  };

  const loginWithCredentials = async (
    email: string,
    pass: string
  ): Promise<{ success: boolean; error?: string; user?: User }> => {
    const cleanEmail = email.trim().toLowerCase();
    const matchedUser = users.find((u) => u.email.trim().toLowerCase() === cleanEmail);

    if (!matchedUser) {
      // If not in local users, attempt Supabase if client is configured
      const client = getSupabase();
      if (client) {
        const res = await client.auth.signInWithPassword({ email: cleanEmail, password: pass });
        if (!res.error && res.data.user) {
          const cloudUser: User = {
            id: res.data.user.id,
            name: res.data.user.user_metadata?.full_name || cleanEmail.split('@')[0],
            email: cleanEmail,
            role: res.data.user.user_metadata?.role || 'Team Member',
            system_role: (res.data.user.user_metadata?.system_role as 'Admin' | 'User') || 'User',
            status: 'Active',
            created_at: res.data.user.created_at,
            last_login_at: new Date().toISOString(),
          };
          setUser(cloudUser);
          setUsers((prev) => (prev.some((u) => u.id === cloudUser.id) ? prev : [...prev, cloudUser]));
          setIsAuthenticated(true);
          setAdminUserFilter('all');
          setActiveTab('dashboard');
          localStorage.setItem('my_work_os_authenticated', 'true');
          localStorage.setItem('my_work_os_active_user_id', cloudUser.id);
          return { success: true, user: cloudUser };
        }
      }
      return { success: false, error: 'Invalid email or password. Please verify your credentials.' };
    }

    if (matchedUser.status === 'Inactive') {
      return {
        success: false,
        error: 'This account has been deactivated by an Administrator. Please contact support.',
      };
    }

    if (matchedUser.password && matchedUser.password !== pass) {
      return { success: false, error: 'Incorrect password. Please try again.' };
    }

    const updatedUser: User = {
      ...matchedUser,
      last_login_at: new Date().toISOString(),
    };

    setUser(updatedUser);
    setUsers((prev) => prev.map((u) => (u.id === updatedUser.id ? updatedUser : u)));
    setIsAuthenticated(true);
    setAdminUserFilter('all');
    setActiveTab('dashboard');
    localStorage.setItem('my_work_os_authenticated', 'true');
    localStorage.setItem('my_work_os_active_user_id', updatedUser.id);

    return { success: true, user: updatedUser };
  };

  const addUser = async (newUserData: {
    name: string;
    email: string;
    role?: string;
    system_role: 'Admin' | 'User';
    password?: string;
    status?: 'Active' | 'Inactive';
  }): Promise<{ success: boolean; error?: string }> => {
    if (!isAdmin) {
      return { success: false, error: 'Access denied. Only Administrators can onboard users.' };
    }

    const cleanEmail = newUserData.email.trim().toLowerCase();
    if (!cleanEmail || !cleanEmail.includes('@')) {
      return { success: false, error: 'Please enter a valid email address.' };
    }

    if (users.some((u) => u.email.trim().toLowerCase() === cleanEmail)) {
      return { success: false, error: 'A user with this email address already exists.' };
    }

    const newUser: User = {
      id: `usr_${Date.now()}_${Math.random().toString(36).substring(2, 6)}`,
      name: newUserData.name.trim(),
      email: cleanEmail,
      role: newUserData.role?.trim() || (newUserData.system_role === 'Admin' ? 'System Administrator' : 'Product Contributor'),
      system_role: newUserData.system_role,
      password: newUserData.password || undefined,
      status: newUserData.status || 'Active',
      avatar_url: '',
      created_at: new Date().toISOString(),
      last_login_at: undefined,
    };

    setUsers((prev) => [newUser, ...prev]);

    // If Supabase is connected, persist to Supabase users table
    const client = getSupabase();
    if (client) {
      try {
        await client.from('users').insert({
          id: newUser.id,
          name: newUser.name,
          email: newUser.email,
          role: newUser.role,
          system_role: newUser.system_role,
          status: newUser.status,
          created_at: newUser.created_at,
        });
      } catch (err) {
        console.warn('Supabase remote user insert skipped:', err);
      }
    }

    return { success: true };
  };

  const updatePortalUser = async (
    id: string,
    updates: Partial<User>
  ): Promise<{ success: boolean; error?: string }> => {
    if (!isAdmin && user.id !== id) {
      return { success: false, error: 'Access denied. Only Administrators can update user accounts.' };
    }

    // Guard: Prevent removing the last Administrator
    if (updates.system_role === 'User') {
      const adminCount = users.filter((u) => u.system_role === 'Admin').length;
      const targetUser = users.find((u) => u.id === id);
      if (targetUser?.system_role === 'Admin' && adminCount <= 1) {
        return { success: false, error: 'Cannot remove the last Administrator on the portal.' };
      }
    }

    setUsers((prev) =>
      prev.map((u) => {
        if (u.id === id) {
          return { ...u, ...updates };
        }
        return u;
      })
    );

    if (id === user.id) {
      setUser((prev) => ({ ...prev, ...updates }));
    }

    const client = getSupabase();
    if (client) {
      try {
        await client
          .from('users')
          .update({
            ...(updates.name && { name: updates.name }),
            ...(updates.role && { role: updates.role }),
            ...(updates.system_role && { system_role: updates.system_role }),
            ...(updates.status && { status: updates.status }),
          })
          .eq('id', id);
      } catch (err) {
        console.warn('Supabase remote user update skipped:', err);
      }
    }

    return { success: true };
  };

  const deletePortalUser = async (id: string): Promise<{ success: boolean; error?: string }> => {
    if (!isAdmin) {
      return { success: false, error: 'Access denied. Only Administrators can delete users.' };
    }

    if (id === user.id) {
      return { success: false, error: 'You cannot delete your own active Administrator account.' };
    }

    const targetUser = users.find((u) => u.id === id);
    if (targetUser?.system_role === 'Admin') {
      const adminCount = users.filter((u) => u.system_role === 'Admin').length;
      if (adminCount <= 1) {
        return { success: false, error: 'Cannot delete the last Administrator on the portal.' };
      }
    }

    setUsers((prev) => prev.filter((u) => u.id !== id));

    const client = getSupabase();
    if (client) {
      try {
        await client.from('users').delete().eq('id', id);
      } catch (err) {
        console.warn('Supabase remote user delete skipped:', err);
      }
    }

    return { success: true };
  };

  const signOutUser = async () => {
    const client = getSupabase();
    if (client) {
      await client.auth.signOut();
    }
    setIsAuthenticated(false);
    setActiveTab('dashboard');
    localStorage.removeItem('my_work_os_authenticated');
    localStorage.removeItem('my_work_os_active_user_id');
  };

  // DYNAMIC TASK ACTIONS
  const addTask = async (newTask: Partial<Task>) => {
    const targetUserId = isAdmin ? (newTask.user_id || user.id) : user.id;
    const id = `tsk_${Date.now()}_${Math.random().toString(36).substring(2, 6)}`;
    const task: Task = {
      id,
      user_id: targetUserId,
      project_id: newTask.project_id || projects[0]?.id || 'prj_default',
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

    setAllTasks((prev) => [task, ...prev]);

    const targetUser = users.find((u) => u.id === targetUserId);
    const authorName = targetUser ? targetUser.name.split(' ')[0] : user.name.split(' ')[0] || 'User';

    const updateItem: TaskUpdate = {
      id: `upd_${Date.now()}_${Math.random().toString(36).substring(2, 6)}`,
      task_id: id,
      user_id: targetUserId,
      author_name: authorName,
      status: task.status,
      progress: task.progress,
      update_text: `Task created: "${task.title}"`,
      next_action: task.next_action,
      created_at: new Date().toISOString(),
    };
    setAllTaskUpdates((prev) => [updateItem, ...prev]);

    // Remote Supabase write
    const client = getSupabase();
    if (client) {
      try {
        await client.from('tasks').insert([task]);
        await client.from('task_updates').insert([updateItem]);
      } catch (err) {
        console.error('Error inserting task to Supabase:', err);
      }
    }
  };

  const updateTask = async (id: string, updates: Partial<Task>) => {
    const existing = allTasks.find((t) => t.id === id);
    if (!existing) return;
    if (!isAdmin && existing.user_id !== user.id) {
      console.warn('Unauthorized: standard users cannot update another user task');
      return;
    }

    const nowIso = new Date().toISOString();
    let updatedTaskObj: Task | null = null;

    setAllTasks((prev) =>
      prev.map((t) => {
        if (t.id === id) {
          const updated = { ...t, ...updates, updated_at: nowIso };
          if (updates.status === 'Done' && !t.completed_at) {
            updated.completed_at = nowIso;
            updated.progress = 100;
          }
          updatedTaskObj = updated;
          return updated;
        }
        return t;
      })
    );

    const client = getSupabase();
    if (client && updatedTaskObj) {
      try {
        await client.from('tasks').update(updates).eq('id', id);
      } catch (err) {
        console.error('Error updating task in Supabase:', err);
      }
    }
  };

  const deleteTask = async (id: string) => {
    const existing = allTasks.find((t) => t.id === id);
    if (!existing) return;
    if (!isAdmin && existing.user_id !== user.id) {
      console.warn('Unauthorized: standard users cannot delete another user task');
      return;
    }

    setAllTasks((prev) => prev.filter((t) => t.id !== id));
    setAllTaskUpdates((prev) => prev.filter((u) => u.task_id !== id));

    const client = getSupabase();
    if (client) {
      try {
        await client.from('tasks').delete().eq('id', id);
      } catch (err) {
        console.error('Error deleting task in Supabase:', err);
      }
    }
  };

  const updateTaskStatus = async (id: string, newStatus: TaskStatus) => {
    const target = allTasks.find((t) => t.id === id);
    if (!target) return;
    if (!isAdmin && target.user_id !== user.id) {
      console.warn('Unauthorized: standard users cannot update status of another user task');
      return;
    }

    const nowIso = new Date().toISOString();
    const isDone = newStatus === 'Done';

    setAllTasks((prev) =>
      prev.map((t) => {
        if (t.id === id) {
          const updatedProgress = isDone ? 100 : t.status === 'Done' && !isDone ? 50 : t.progress;
          return {
            ...t,
            status: newStatus,
            progress: updatedProgress,
            updated_at: nowIso,
            completed_at: isDone ? nowIso : null,
          };
        }
        return t;
      })
    );

    const updateItem: TaskUpdate = {
      id: `upd_${Date.now()}_${Math.random().toString(36).substring(2, 6)}`,
      task_id: id,
      user_id: user.id,
      author_name: user.name.split(' ')[0] || 'User',
      status: newStatus,
      progress: newStatus === 'Done' ? 100 : target.progress,
      update_text: `Status changed from ${target.status} to ${newStatus}`,
      created_at: nowIso,
    };
    setAllTaskUpdates((prev) => [updateItem, ...prev]);

    const client = getSupabase();
    if (client) {
      try {
        await client.from('tasks').update({
          status: newStatus,
          progress: isDone ? 100 : target.progress,
          completed_at: isDone ? nowIso : null,
          updated_at: nowIso,
        }).eq('id', id);
        await client.from('task_updates').insert([updateItem]);
      } catch (err) {
        console.error('Error updating task status in Supabase:', err);
      }
    }
  };

  const submitTaskUpdate = async (
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
    const target = allTasks.find((t) => t.id === taskId);
    if (!target) return;
    if (!isAdmin && target.user_id !== user.id) {
      console.warn('Unauthorized: standard users cannot submit updates for another user task');
      return;
    }

    await updateTask(taskId, {
      status: payload.status,
      progress: payload.progress,
      next_action: payload.nextAction,
      notes: payload.notes,
    });

    const updateItem: TaskUpdate = {
      id: `upd_${Date.now()}_${Math.random().toString(36).substring(2, 6)}`,
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

    setAllTaskUpdates((prev) => [updateItem, ...prev]);

    const client = getSupabase();
    if (client) {
      try {
        await client.from('task_updates').insert([updateItem]);
      } catch (err) {
        console.error('Error inserting task update to Supabase:', err);
      }
    }

    if (payload.nextFollowupDate && payload.nextAction) {
      await addFollowup({
        project_id: target.project_id,
        user_id: target.user_id,
        person: 'Assigned Stakeholder',
        topic: payload.nextAction,
        last_discussion: new Date().toLocaleDateString('en-GB'),
        expected_action: payload.nextAction,
        followup_date: payload.nextFollowupDate,
        status: 'Pending',
        notes: `Auto-created from task update: ${target.title}`,
      });
    }
  };

  // DYNAMIC PROJECT ACTIONS
  const addProject = async (newProj: Partial<Project>) => {
    const targetUserId = isAdmin ? (newProj.user_id || user.id) : user.id;
    const assignedUser = users.find((u) => u.id === targetUserId);
    const proj: Project = {
      id: `prj_${Date.now()}_${Math.random().toString(36).substring(2, 6)}`,
      user_id: targetUserId,
      name: newProj.name || 'Untitled Project',
      description: newProj.description || '',
      status: newProj.status || 'Active',
      priority: newProj.priority || 'Medium',
      start_date: newProj.start_date || new Date().toISOString().split('T')[0],
      end_date: newProj.end_date || new Date().toISOString().split('T')[0],
      owner: newProj.owner || (assignedUser ? assignedUser.name.split(' ')[0] : user.name.split(' ')[0]),
      tags: newProj.tags || [],
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString(),
    };
    setAllProjects((prev) => [proj, ...prev]);

    const client = getSupabase();
    if (client) {
      try {
        await client.from('projects').insert([proj]);
      } catch (err) {
        console.error('Error inserting project to Supabase:', err);
      }
    }
  };

  const updateProject = async (id: string, updates: Partial<Project>) => {
    const target = allProjects.find((p) => p.id === id);
    if (!target) return;
    if (!isAdmin && target.user_id !== user.id) {
      console.warn('Unauthorized: standard users cannot update another user project');
      return;
    }

    setAllProjects((prev) =>
      prev.map((p) => (p.id === id ? { ...p, ...updates, updated_at: new Date().toISOString() } : p))
    );
    const client = getSupabase();
    if (client) {
      try {
        await client.from('projects').update(updates).eq('id', id);
      } catch (err) {
        console.error('Error updating project in Supabase:', err);
      }
    }
  };

  const deleteProject = async (id: string) => {
    const target = allProjects.find((p) => p.id === id);
    if (!target) return;
    if (!isAdmin && target.user_id !== user.id) {
      console.warn('Unauthorized: standard users cannot delete another user project');
      return;
    }

    setAllProjects((prev) => prev.filter((p) => p.id !== id));
    setAllTasks((prev) => prev.filter((t) => t.project_id !== id));
    setAllMilestones((prev) => prev.filter((m) => m.project_id !== id));

    const client = getSupabase();
    if (client) {
      try {
        await client.from('projects').delete().eq('id', id);
      } catch (err) {
        console.error('Error deleting project in Supabase:', err);
      }
    }
  };

  const getProjectStats = (projectId: string) => {
    const projTasks = allTasks.filter((t) => t.project_id === projectId);
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

  // DYNAMIC FOLLOWUP ACTIONS
  const addFollowup = async (f: Partial<Followup>) => {
    const targetUserId = isAdmin ? (f.user_id || user.id) : user.id;
    const item: Followup = {
      id: `fol_${Date.now()}_${Math.random().toString(36).substring(2, 6)}`,
      user_id: targetUserId,
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
    setAllFollowups((prev) => [item, ...prev]);

    const client = getSupabase();
    if (client) {
      try {
        await client.from('followups').insert([item]);
      } catch (err) {
        console.error('Error inserting followup to Supabase:', err);
      }
    }
  };

  const updateFollowup = async (id: string, updates: Partial<Followup>) => {
    const target = allFollowups.find((f) => f.id === id);
    if (!target) return;
    if (!isAdmin && target.user_id !== user.id) {
      console.warn('Unauthorized: standard users cannot update another user followup');
      return;
    }

    setAllFollowups((prev) =>
      prev.map((f) => (f.id === id ? { ...f, ...updates, updated_at: new Date().toISOString() } : f))
    );
    const client = getSupabase();
    if (client) {
      try {
        await client.from('followups').update(updates).eq('id', id);
      } catch (err) {
        console.error('Error updating followup in Supabase:', err);
      }
    }
  };

  const deleteFollowup = async (id: string) => {
    const target = allFollowups.find((f) => f.id === id);
    if (!target) return;
    if (!isAdmin && target.user_id !== user.id) {
      console.warn('Unauthorized: standard users cannot delete another user followup');
      return;
    }

    setAllFollowups((prev) => prev.filter((f) => f.id !== id));
    const client = getSupabase();
    if (client) {
      try {
        await client.from('followups').delete().eq('id', id);
      } catch (err) {
        console.error('Error deleting followup in Supabase:', err);
      }
    }
  };

  const updateFollowupStatus = async (id: string, status: FollowupStatus) => {
    await updateFollowup(id, { status });
  };

  // DYNAMIC MEETING ACTIONS
  const addMeeting = async (m: Partial<Meeting>) => {
    const targetUserId = isAdmin ? (m.user_id || user.id) : user.id;
    const item: Meeting = {
      id: `mtg_${Date.now()}_${Math.random().toString(36).substring(2, 6)}`,
      user_id: targetUserId,
      project_id: m.project_id,
      title: m.title || 'Untitled Meeting',
      meeting_date: m.meeting_date || new Date().toISOString().split('T')[0],
      start_time: m.start_time || '10:00 AM',
      end_time: m.end_time || '11:00 AM',
      participants: m.participants || user.name,
      agenda: m.agenda || '',
      notes: m.notes || '',
      decisions: m.decisions || '',
      action_items: m.action_items || [],
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString(),
    };
    setAllMeetings((prev) => [item, ...prev]);

    const client = getSupabase();
    if (client) {
      try {
        await client.from('meetings').insert([item]);
      } catch (err) {
        console.error('Error inserting meeting to Supabase:', err);
      }
    }
  };

  const updateMeeting = async (id: string, updates: Partial<Meeting>) => {
    const target = allMeetings.find((m) => m.id === id);
    if (!target) return;
    if (!isAdmin && target.user_id !== user.id) {
      console.warn('Unauthorized: standard users cannot update another user meeting');
      return;
    }

    setAllMeetings((prev) =>
      prev.map((m) => (m.id === id ? { ...m, ...updates, updated_at: new Date().toISOString() } : m))
    );
    const client = getSupabase();
    if (client) {
      try {
        await client.from('meetings').update(updates).eq('id', id);
      } catch (err) {
        console.error('Error updating meeting in Supabase:', err);
      }
    }
  };

  const deleteMeeting = async (id: string) => {
    const target = allMeetings.find((m) => m.id === id);
    if (!target) return;
    if (!isAdmin && target.user_id !== user.id) {
      console.warn('Unauthorized: standard users cannot delete another user meeting');
      return;
    }

    setAllMeetings((prev) => prev.filter((m) => m.id !== id));
    const client = getSupabase();
    if (client) {
      try {
        await client.from('meetings').delete().eq('id', id);
      } catch (err) {
        console.error('Error deleting meeting in Supabase:', err);
      }
    }
  };

  const addMeetingActionItem = async (meetingId: string, text: string, assignedTo?: string) => {
    const meeting = allMeetings.find((m) => m.id === meetingId);
    if (!meeting) return;
    if (!isAdmin && meeting.user_id !== user.id) return;
    const newItem = { id: `act_${Date.now()}`, text, assigned_to: assignedTo || 'Team' };
    const updated = [...(meeting.action_items || []), newItem];
    await updateMeeting(meetingId, { action_items: updated });
  };

  const convertMeetingActionItemToTask = async (meetingId: string, actionItemId: string) => {
    const meeting = allMeetings.find((m) => m.id === meetingId);
    if (!meeting || !meeting.action_items) return;
    if (!isAdmin && meeting.user_id !== user.id) return;
    const actionItem = meeting.action_items.find((a) => a.id === actionItemId);
    if (!actionItem) return;

    const taskId = `tsk_${Date.now()}_${Math.random().toString(36).substring(2, 6)}`;
    await addTask({
      id: taskId,
      user_id: meeting.user_id,
      project_id: meeting.project_id || projects[0]?.id || 'prj_default',
      title: actionItem.text,
      description: `Action item from meeting "${meeting.title}" on ${meeting.meeting_date}`,
      task_type: 'Development',
      priority: 'High',
      status: 'To Do',
      next_action: `Assigned: ${actionItem.assigned_to || 'Assignee'}`,
      tags: ['Action Item', 'Meeting'],
    });

    const updatedActionItems = meeting.action_items.map((a) =>
      a.id === actionItemId ? { ...a, converted_to_task_id: taskId } : a
    );
    await updateMeeting(meetingId, { action_items: updatedActionItems });
  };

  // DYNAMIC ISSUE ACTIONS
  const addIssue = async (i: Partial<Issue>) => {
    const targetUserId = isAdmin ? (i.user_id || user.id) : user.id;
    const assignedUser = users.find((u) => u.id === targetUserId);
    const item: Issue = {
      id: `iss_${Date.now()}_${Math.random().toString(36).substring(2, 6)}`,
      user_id: targetUserId,
      project_id: i.project_id,
      task_id: i.task_id,
      title: i.title || 'Untitled Issue',
      description: i.description || '',
      severity: i.severity || 'Medium',
      status: i.status || 'Open',
      owner: i.owner || (assignedUser ? assignedUser.name.split(' ')[0] : user.name.split(' ')[0]),
      expected_resolution: i.expected_resolution || '',
      notes: i.notes || '',
      created_at: new Date().toISOString(),
    };
    setAllIssues((prev) => [item, ...prev]);

    const client = getSupabase();
    if (client) {
      try {
        await client.from('issues').insert([item]);
      } catch (err) {
        console.error('Error inserting issue to Supabase:', err);
      }
    }
  };

  const updateIssue = async (id: string, updates: Partial<Issue>) => {
    const target = allIssues.find((iss) => iss.id === id);
    if (!target) return;
    if (!isAdmin && target.user_id !== user.id) {
      console.warn('Unauthorized: standard users cannot update another user issue');
      return;
    }

    setAllIssues((prev) => prev.map((iss) => (iss.id === id ? { ...iss, ...updates } : iss)));
    const client = getSupabase();
    if (client) {
      try {
        await client.from('issues').update(updates).eq('id', id);
      } catch (err) {
        console.error('Error updating issue in Supabase:', err);
      }
    }
  };

  const deleteIssue = async (id: string) => {
    const target = allIssues.find((iss) => iss.id === id);
    if (!target) return;
    if (!isAdmin && target.user_id !== user.id) {
      console.warn('Unauthorized: standard users cannot delete another user issue');
      return;
    }

    setAllIssues((prev) => prev.filter((i) => i.id !== id));
    const client = getSupabase();
    if (client) {
      try {
        await client.from('issues').delete().eq('id', id);
      } catch (err) {
        console.error('Error deleting issue in Supabase:', err);
      }
    }
  };

  const resolveIssue = async (id: string) => {
    await updateIssue(id, {
      status: 'Resolved',
      resolved_at: new Date().toISOString(),
    });
  };

  // DYNAMIC DAILY LOG ACTIONS
  const getDailyLog = (date: string) => {
    return dailyLogs.find((l) => l.log_date === date);
  };

  const saveDailyLog = async (log: Partial<DailyLog>) => {
    const targetDate = log.log_date || new Date().toISOString().split('T')[0];
    const targetUserId = isAdmin ? (log.user_id || (adminUserFilter !== 'all' ? adminUserFilter : user.id)) : user.id;

    let savedItem: DailyLog | null = null;
    setAllDailyLogs((prev) => {
      const index = prev.findIndex((l) => l.log_date === targetDate && l.user_id === targetUserId);
      if (index >= 0) {
        const copy = [...prev];
        const updated = {
          ...copy[index],
          ...log,
          updated_at: new Date().toISOString(),
        } as DailyLog;
        copy[index] = updated;
        savedItem = updated;
        return copy;
      } else {
        const newLog: DailyLog = {
          id: `log_${targetDate.replace(/-/g, '_')}_${targetUserId}`,
          user_id: targetUserId,
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
        savedItem = newLog;
        return [newLog, ...prev];
      }
    });

    const client = getSupabase();
    if (client && savedItem) {
      try {
        await client.from('daily_logs').upsert([savedItem]);
      } catch (err) {
        console.error('Error saving daily log to Supabase:', err);
      }
    }
  };

  const generateTodaySummary = (date: string) => {
    const completedTasksList = tasks.filter(
      (t) => t.status === 'Done' && (t.completed_at?.startsWith(date) || t.due_date === date)
    );
    const pendingTasksList = tasks.filter((t) => t.due_date === date && t.status !== 'Done');
    const blockedList = tasks.filter((t) => t.status === 'Blocked');
    const todayMeetings = meetings.filter((m) => m.meeting_date === date);
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
      : '• All scheduled deliverables on track.';

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

  // DYNAMIC ACHIEVEMENT ACTIONS
  const addAchievement = async (a: Partial<Achievement>) => {
    const targetUserId = isAdmin ? (a.user_id || user.id) : user.id;
    const item: Achievement = {
      id: `ach_${Date.now()}_${Math.random().toString(36).substring(2, 6)}`,
      user_id: targetUserId,
      project_id: a.project_id,
      title: a.title || 'Untitled Achievement',
      description: a.description || '',
      impact: a.impact || '',
      category: a.category || 'Delivery',
      achievement_date: a.achievement_date || new Date().toISOString().split('T')[0],
      tags: a.tags || [],
      created_at: new Date().toISOString(),
    };
    setAllAchievements((prev) => [item, ...prev]);

    const client = getSupabase();
    if (client) {
      try {
        await client.from('achievements').insert([item]);
      } catch (err) {
        console.error('Error inserting achievement to Supabase:', err);
      }
    }
  };

  const deleteAchievement = async (id: string) => {
    const target = allAchievements.find((a) => a.id === id);
    if (!target) return;
    if (!isAdmin && target.user_id !== user.id) {
      console.warn('Unauthorized: standard users cannot delete another user achievement');
      return;
    }

    setAllAchievements((prev) => prev.filter((a) => a.id !== id));
    const client = getSupabase();
    if (client) {
      try {
        await client.from('achievements').delete().eq('id', id);
      } catch (err) {
        console.error('Error deleting achievement in Supabase:', err);
      }
    }
  };

  // DYNAMIC MILESTONE ACTIONS
  const addMilestone = async (m: Partial<Milestone>) => {
    const targetProjectId = m.project_id || projects[0]?.id || 'prj_default';
    const project = allProjects.find((p) => p.id === targetProjectId);
    if (!isAdmin && project?.user_id !== user.id) {
      console.warn('Unauthorized: cannot add milestone to project owned by another user');
      return;
    }

    const item: Milestone = {
      id: `mls_${Date.now()}_${Math.random().toString(36).substring(2, 6)}`,
      project_id: targetProjectId,
      title: m.title || 'New Milestone',
      description: m.description || '',
      due_date: m.due_date || new Date().toISOString().split('T')[0],
      status: m.status || 'Pending',
      created_at: new Date().toISOString(),
    };
    setAllMilestones((prev) => [item, ...prev]);

    const client = getSupabase();
    if (client) {
      try {
        await client.from('milestones').insert([item]);
      } catch (err) {
        console.error('Error inserting milestone to Supabase:', err);
      }
    }
  };

  const deleteMilestone = async (id: string) => {
    const target = allMilestones.find((m) => m.id === id);
    if (!target) return;
    const project = allProjects.find((p) => p.id === target.project_id);
    if (!isAdmin && project?.user_id !== user.id) {
      console.warn('Unauthorized: cannot delete milestone from project owned by another user');
      return;
    }

    setAllMilestones((prev) => prev.filter((m) => m.id !== id));
    const client = getSupabase();
    if (client) {
      try {
        await client.from('milestones').delete().eq('id', id);
      } catch (err) {
        console.error('Error deleting milestone in Supabase:', err);
      }
    }
  };

  const toggleMilestoneStatus = async (id: string) => {
    const target = allMilestones.find((m) => m.id === id);
    if (!target) return;
    const project = allProjects.find((p) => p.id === target.project_id);
    if (!isAdmin && project?.user_id !== user.id) {
      console.warn('Unauthorized: cannot toggle milestone from project owned by another user');
      return;
    }

    const nextStatus = target.status === 'Completed' ? 'In Progress' : 'Completed';
    const nowIso = new Date().toISOString();
    const completedAt = nextStatus === 'Completed' ? nowIso : null;

    setAllMilestones((prev) =>
      prev.map((m) =>
        m.id === id
          ? {
              ...m,
              status: nextStatus,
              completed_at: completedAt,
            }
          : m
      )
    );

    const client = getSupabase();
    if (client) {
      try {
        await client.from('milestones').update({
          status: nextStatus,
          completed_at: completedAt,
        }).eq('id', id);
      } catch (err) {
        console.error('Error toggling milestone in Supabase:', err);
      }
    }
  };

  // DYNAMIC NOTE ACTIONS
  const addNote = async (n: Partial<Note>) => {
    const targetUserId = isAdmin ? (n.user_id || user.id) : user.id;
    const item: Note = {
      id: `not_${Date.now()}_${Math.random().toString(36).substring(2, 6)}`,
      user_id: targetUserId,
      project_id: n.project_id,
      task_id: n.task_id,
      title: n.title || 'Untitled Note',
      content: n.content || '',
      tags: n.tags || [],
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString(),
    };
    setAllNotes((prev) => [item, ...prev]);

    const client = getSupabase();
    if (client) {
      try {
        await client.from('notes').insert([item]);
      } catch (err) {
        console.error('Error inserting note to Supabase:', err);
      }
    }
  };

  const updateNote = async (id: string, updates: Partial<Note>) => {
    const target = allNotes.find((n) => n.id === id);
    if (!target) return;
    if (!isAdmin && target.user_id !== user.id) {
      console.warn('Unauthorized: cannot update note owned by another user');
      return;
    }

    setAllNotes((prev) =>
      prev.map((n) => (n.id === id ? { ...n, ...updates, updated_at: new Date().toISOString() } : n))
    );
    const client = getSupabase();
    if (client) {
      try {
        await client.from('notes').update(updates).eq('id', id);
      } catch (err) {
        console.error('Error updating note in Supabase:', err);
      }
    }
  };

  const deleteNote = async (id: string) => {
    const target = allNotes.find((n) => n.id === id);
    if (!target) return;
    if (!isAdmin && target.user_id !== user.id) {
      console.warn('Unauthorized: cannot delete note owned by another user');
      return;
    }

    setAllNotes((prev) => prev.filter((n) => n.id !== id));
    const client = getSupabase();
    if (client) {
      try {
        await client.from('notes').delete().eq('id', id);
      } catch (err) {
        console.error('Error deleting note in Supabase:', err);
      }
    }
  };

  // UNIDIRECTIONAL ADMIN NOTIFICATIONS (Admin -> Users)
  // Strict recipient delivery: Broadcast ('all') goes to everyone, individual goes ONLY to selected recipient
  const notifications: NotificationItem[] = useMemo(() => {
    if (!user?.id) return [];

    const relevant = adminMessages.filter((msg) => {
      // 1. In case of 'all', the message is sent to all
      if (msg.target_user_id === 'all') return true;

      // 2. Direct message goes ONLY to the specifically selected user
      if (msg.target_user_id === user.id) return true;

      // When this user is not selected, do not deliver to them
      return false;
    });

    return relevant.map((msg) => {
      const isRead = msg.read_by.includes(user.id);
      return {
        id: msg.id,
        title: msg.title,
        message: msg.message,
        type: 'admin_message' as const,
        target_id: msg.id,
        timestamp: new Date(msg.created_at).toLocaleDateString(undefined, {
          month: 'short',
          day: 'numeric',
          hour: '2-digit',
          minute: '2-digit',
        }),
        read: isRead,
        priority: msg.priority,
        sender_name: msg.sender_name,
        target_user_id: msg.target_user_id,
        target_user_name: msg.target_user_name,
      };
    });
  }, [adminMessages, user?.id]);

  const unreadNotificationsCount = useMemo(() => {
    return notifications.filter((n) => !n.read).length;
  }, [notifications]);

  const markNotificationRead = (id: string) => {
    setAdminMessages((prev) =>
      prev.map((msg) => {
        if (msg.id === id) {
          if (!msg.read_by.includes(user.id)) {
            const updatedReadBy = [...msg.read_by, user.id];
            const client = getSupabase();
            if (client) {
              Promise.resolve(
                client.from('admin_messages').update({ read_by: updatedReadBy }).eq('id', id)
              ).catch((err) => {
                console.warn('Supabase mark read update error:', err);
              });
            }
            return { ...msg, read_by: updatedReadBy };
          }
        }
        return msg;
      })
    );
  };

  const clearAllNotifications = () => {
    setAdminMessages((prev) =>
      prev.map((msg) => {
        if (!msg.read_by.includes(user.id)) {
          const updatedReadBy = [...msg.read_by, user.id];
          const client = getSupabase();
          if (client) {
            Promise.resolve(
              client.from('admin_messages').update({ read_by: updatedReadBy }).eq('id', msg.id)
            ).catch((err) => {
              console.warn('Supabase clear read update error:', err);
            });
          }
          return { ...msg, read_by: updatedReadBy };
        }
        return msg;
      })
    );
  };

  const sendAdminMessage = async (payload: {
    target_user_id: string;
    title: string;
    message: string;
    priority?: MessagePriority;
  }): Promise<{ success: boolean; error?: string }> => {
    if (!isAdmin) {
      return { success: false, error: 'Access denied: Only administrators can broadcast or send notifications.' };
    }

    if (!payload.title.trim() || !payload.message.trim()) {
      return { success: false, error: 'Title and message cannot be empty.' };
    }

    let targetName = 'All Users';
    if (payload.target_user_id !== 'all') {
      const target = users.find((u) => u.id === payload.target_user_id);
      targetName = target ? target.name : 'Selected User';
    }

    const newMessage: AdminMessage = {
      id: `msg_${Date.now()}_${Math.random().toString(36).substring(2, 6)}`,
      sender_id: user.id,
      sender_name: `${user.name} (Admin)`,
      target_user_id: payload.target_user_id,
      target_user_name: targetName,
      title: payload.title.trim(),
      message: payload.message.trim(),
      priority: payload.priority || 'Normal',
      created_at: new Date().toISOString(),
      read_by: [],
    };

    setAdminMessages((prev) => [newMessage, ...prev]);

    const client = getSupabase();
    if (client) {
      try {
        await client.from('admin_messages').insert({
          id: newMessage.id,
          sender_id: user.id,
          sender_name: newMessage.sender_name,
          target_user_id: payload.target_user_id,
          target_user_name: newMessage.target_user_name,
          title: newMessage.title,
          message: newMessage.message,
          priority: newMessage.priority,
          read_by: newMessage.read_by,
          created_at: newMessage.created_at,
        });
      } catch (err) {
        console.warn('Supabase remote admin message insert skipped/error:', err);
      }
    }

    return { success: true };
  };

  const deleteAdminMessage = async (id: string): Promise<{ success: boolean; error?: string }> => {
    if (!isAdmin) {
      return { success: false, error: 'Access denied: Only administrators can delete notifications.' };
    }

    setAdminMessages((prev) => prev.filter((m) => m.id !== id));

    const client = getSupabase();
    if (client) {
      try {
        await client.from('admin_messages').delete().eq('id', id);
      } catch (err) {
        console.warn('Supabase remote admin message delete skipped/error:', err);
      }
    }

    return { success: true };
  };

  // USER PROFILE ACTIONS
  const updateUser = async (updates: Partial<User>) => {
    setUser((prev) => {
      const updatedUser = { ...prev, ...updates };
      try {
        const existingData = localStorage.getItem(STORAGE_KEY);
        if (existingData) {
          const parsed = JSON.parse(existingData);
          parsed.user = updatedUser;
          localStorage.setItem(STORAGE_KEY, JSON.stringify(parsed));
        }
      } catch (err) {
        console.error('Failed to immediately save user profile:', err);
      }
      return updatedUser;
    });

    const client = getSupabase();
    if (client && user.id) {
      try {
        await client.from('users').upsert({ id: user.id, ...updates });
      } catch (e) {
        console.error('Failed to update user in Supabase:', e);
      }
    }
  };

  // SYSTEM DATA METHODS
  const clearAllData = () => {
    localStorage.removeItem(STORAGE_KEY);
    setAllProjects([]);
    setAllTasks([]);
    setAllTaskUpdates([]);
    setAllFollowups([]);
    setAllMeetings([]);
    setAllIssues([]);
    setAllDailyLogs([]);
    setAllAchievements([]);
    setAllMilestones([]);
    setAllNotes([]);
    setAdminUserFilter('all');
  };

  const resetToSeedData = () => {
    localStorage.removeItem(STORAGE_KEY);
    setUser(CURRENT_USER);
    setUsers(INITIAL_USERS);
    setAdminMessages(INITIAL_ADMIN_MESSAGES);
    setAllProjects(INITIAL_PROJECTS);
    setAllTasks(INITIAL_TASKS);
    setAllTaskUpdates(INITIAL_TASK_UPDATES);
    setAllFollowups(INITIAL_FOLLOWUPS);
    setAllMeetings(INITIAL_MEETINGS);
    setAllIssues(INITIAL_ISSUES);
    setAllDailyLogs(INITIAL_DAILY_LOGS);
    setAllAchievements(INITIAL_ACHIEVEMENTS);
    setAllMilestones(INITIAL_MILESTONES);
    setAllNotes(INITIAL_NOTES);
    setAdminUserFilter('all');
  };

  const exportDataJSON = () => {
    const payload = {
      exportedAt: new Date().toISOString(),
      user,
      users,
      adminMessages,
      projects: allProjects,
      tasks: allTasks,
      taskUpdates: allTaskUpdates,
      followups: allFollowups,
      meetings: allMeetings,
      issues: allIssues,
      dailyLogs: allDailyLogs,
      achievements: allAchievements,
      milestones: allMilestones,
      notes: allNotes,
    };
    return JSON.stringify(payload, null, 2);
  };

  const importDataJSON = (jsonStr: string) => {
    try {
      const parsed = JSON.parse(jsonStr);
      if (Array.isArray(parsed.users)) setUsers(parsed.users);
      if (Array.isArray(parsed.adminMessages)) setAdminMessages(parsed.adminMessages);
      if (Array.isArray(parsed.projects)) setAllProjects(parsed.projects);
      if (Array.isArray(parsed.tasks)) setAllTasks(parsed.tasks);
      if (Array.isArray(parsed.taskUpdates)) setAllTaskUpdates(parsed.taskUpdates);
      if (Array.isArray(parsed.followups)) setAllFollowups(parsed.followups);
      if (Array.isArray(parsed.meetings)) setAllMeetings(parsed.meetings);
      if (Array.isArray(parsed.issues)) setAllIssues(parsed.issues);
      if (Array.isArray(parsed.dailyLogs)) setAllDailyLogs(parsed.dailyLogs);
      if (Array.isArray(parsed.achievements)) setAllAchievements(parsed.achievements);
      if (Array.isArray(parsed.milestones)) setAllMilestones(parsed.milestones);
      if (Array.isArray(parsed.notes)) setAllNotes(parsed.notes);
      return true;
    } catch (e) {
      console.error('Invalid JSON import', e);
      return false;
    }
  };

  // Sanitize public users and current user so password fields are NEVER exposed to consumer components or React tree
  const sanitizedUsers = useMemo(() => {
    return users.map(({ password: _p, ...safeUser }) => safeUser);
  }, [users]);

  const sanitizedUser = useMemo(() => {
    const { password: _p, ...safeUser } = user;
    return safeUser;
  }, [user]);

  return (
    <WorkOSContext.Provider
      value={{
        user: sanitizedUser,
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
        adminUserFilter,
        setAdminUserFilter,
        notifications,
        unreadNotificationsCount,
        adminMessages,
        sendAdminMessage,
        deleteAdminMessage,
        isComposeMessageOpen,
        setIsComposeMessageOpen,
        composeTargetUserId,
        openComposeMessage,
        closeComposeMessage,
        activeTab,
        setActiveTab,
        selectedProjectId,
        setSelectedProjectId,
        isSearchOpen,
        setIsSearchOpen,
        isQuickAddOpen,
        setIsQuickAddOpen,
        quickAddType,
        quickAddProjectId,
        openQuickAdd,
        closeQuickAdd,
        quickUpdateTask,
        openQuickUpdate,
        closeQuickUpdate,
        historyTask,
        openHistory,
        closeHistory,
        isAuthModalOpen,
        setIsAuthModalOpen,
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
        addMeetingActionItem,
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
        deleteMilestone,
        toggleMilestoneStatus,
        addNote,
        updateNote,
        deleteNote,
        updateUser,
        users: sanitizedUsers,
        isAdmin,
        addUser,
        updatePortalUser,
        deletePortalUser,
        loginWithCredentials,
        markNotificationRead,
        clearAllNotifications,
        clearAllData,
        resetToSeedData,
        exportDataJSON,
        importDataJSON,
        isAuthenticated,
        loginUser,
        isSupabaseConnected,
        isSyncing,
        lastSyncedAt,
        connectSupabase,
        disconnectSupabase,
        syncWithSupabase,
        signInWithPassword,
        signUpWithPassword,
        signOutUser,
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
