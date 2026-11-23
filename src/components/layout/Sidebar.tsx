'use client';

import React from 'react';
import { useWorkOS } from '@/context/WorkOSContext';
import {
  LayoutDashboard,
  CheckSquare,
  FolderKanban,
  UserCheck,
  CalendarDays,
  Video,
  AlertOctagon,
  BookOpenText,
  BarChart3,
  Award,
  FileText,
  Settings,
  Users,
  ChevronRight,
  Sparkles,
  LogOut,
  MessageSquare,
  X,
} from 'lucide-react';
import Logo from '@/components/common/Logo';

interface SidebarProps {
  isOpen?: boolean;
  onClose?: () => void;
}

export default function Sidebar({ isOpen = true, onClose }: SidebarProps) {
  const {
    activeTab,
    setActiveTab,
    setSelectedProjectId,
    tasks,
    followups,
    meetings,
    issues,
    unreadMessagesCount,
    user,
    isAdmin,
    signOutUser,
  } = useWorkOS();

  const today = new Date().toISOString().split('T')[0];

  const activeTasksCount = tasks.filter((t) => t.status !== 'Done').length;
  const followupsDueCount = followups.filter(
    (f) => f.followup_date <= today && f.status !== 'Completed'
  ).length;
  const todayMeetingsCount = meetings.filter(
    (m) => m.meeting_date === today
  ).length;
  const openIssuesCount = issues.filter(
    (i) => i.status !== 'Resolved' && i.status !== 'Closed'
  ).length;

  const navItems = [
    {
      id: 'dashboard',
      label: 'Dashboard',
      icon: LayoutDashboard,
      badge: null,
    },
    {
      id: 'messages',
      label: 'Messages',
      icon: MessageSquare,
      badge: unreadMessagesCount > 0 ? unreadMessagesCount : null,
      badgeColor: 'bg-indigo-100 text-indigo-700 dark:bg-indigo-900/60 dark:text-indigo-300',
    },
    {
      id: 'tasks',
      label: 'My Tasks',
      icon: CheckSquare,
      badge: activeTasksCount > 0 ? activeTasksCount : null,
      badgeColor: 'bg-blue-100 text-blue-700 dark:bg-blue-900/60 dark:text-blue-300',
    },
    {
      id: 'projects',
      label: 'Projects',
      icon: FolderKanban,
      badge: null,
    },
    {
      id: 'followups',
      label: 'Follow-ups',
      icon: UserCheck,
      badge: followupsDueCount > 0 ? followupsDueCount : null,
      badgeColor: 'bg-amber-100 text-amber-700 dark:bg-amber-900/60 dark:text-amber-300',
    },
    {
      id: 'calendar',
      label: 'Calendar',
      icon: CalendarDays,
      badge: null,
    },
    {
      id: 'meetings',
      label: 'Meetings',
      icon: Video,
      badge: todayMeetingsCount > 0 ? todayMeetingsCount : null,
      badgeColor: 'bg-purple-100 text-purple-700 dark:bg-purple-900/60 dark:text-purple-300',
    },
    {
      id: 'issues',
      label: 'Issues',
      icon: AlertOctagon,
      badge: openIssuesCount > 0 ? openIssuesCount : null,
      badgeColor: 'bg-red-100 text-red-700 dark:bg-red-900/60 dark:text-red-300',
    },
    {
      id: 'worklog',
      label: 'Work Log',
      icon: BookOpenText,
      badge: null,
    },
    {
      id: 'reports',
      label: 'Reports',
      icon: BarChart3,
      badge: null,
    },
    {
      id: 'achievements',
      label: 'Achievements',
      icon: Award,
      badge: null,
    },
    {
      id: 'notes',
      label: 'Notes',
      icon: FileText,
      badge: null,
    },
    {
      id: 'settings',
      label: 'Settings',
      icon: Settings,
      badge: null,
    },
    ...(isAdmin
      ? [
          {
            id: 'users',
            label: 'User Management',
            icon: Users,
            badge: 'Admin',
            badgeColor: 'bg-indigo-100 text-indigo-700 dark:bg-indigo-900/60 dark:text-indigo-300',
          },
        ]
      : []),
  ];

  const handleNavClick = (id: string) => {
    setActiveTab(id);
    if (id !== 'projects') {
      setSelectedProjectId(null);
    }
    if (onClose) {
      onClose();
    }
  };

  return (
    <aside
      className={`
        fixed inset-y-0 left-0 z-50 w-72 sm:w-80 md:w-64 flex flex-col bg-white dark:bg-slate-900 border-r border-slate-200 dark:border-slate-800 transition-transform duration-200 ease-in-out
        md:translate-x-0 ${isOpen ? 'translate-x-0 shadow-2xl' : '-translate-x-full'}
      `}
    >
      {/* Brand & Logo */}
      <div className="h-16 px-5 flex items-center justify-between border-b border-slate-200 dark:border-slate-800 shrink-0">
        <div className="flex items-center space-x-3 cursor-pointer" onClick={() => handleNavClick('dashboard')}>
          <Logo size={36} />
          <div>
            <div className="flex items-center space-x-1.5">
              <span className="font-bold text-slate-900 dark:text-white text-base tracking-tight block">
                Nexus OS
              </span>
              <span className="text-[9px] font-extrabold uppercase px-1.5 py-0.5 rounded-full bg-blue-100 dark:bg-blue-900/60 text-blue-700 dark:text-blue-300 tracking-wider">
                PRO
              </span>
            </div>
            <span className="text-[11px] text-slate-500 dark:text-slate-400 font-medium block -mt-0.5">
              Personal Command Centre
            </span>
          </div>
        </div>

        {/* Mobile Close Button */}
        {onClose && (
          <button
            onClick={onClose}
            className="md:hidden p-1.5 rounded-lg text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors cursor-pointer"
            aria-label="Close navigation"
          >
            <X className="w-5 h-5" />
          </button>
        )}
      </div>

      {/* Navigation list */}
      <div className="flex-1 overflow-y-auto px-3 py-4 space-y-1">
        <div className="px-3 pb-2 text-[11px] font-semibold tracking-wider text-slate-400 dark:text-slate-500 uppercase">
          WORKSPACE
        </div>
        {navItems.map((item) => {
          const Icon = item.icon;
          const isActive = activeTab === item.id;
          return (
            <button
              key={item.id}
              onClick={() => handleNavClick(item.id)}
              className={`
                w-full flex items-center justify-between px-3 py-2 rounded-lg text-sm font-medium transition-all duration-150 cursor-pointer
                ${
                  isActive
                    ? 'bg-blue-50 text-blue-700 dark:bg-blue-950/60 dark:text-blue-300 font-semibold'
                    : 'text-slate-600 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800/60 hover:text-slate-900 dark:hover:text-slate-200'
                }
              `}
            >
              <div className="flex items-center space-x-3 truncate">
                <Icon
                  className={`w-4 h-4 shrink-0 ${
                    isActive
                      ? 'text-blue-600 dark:text-blue-400'
                      : 'text-slate-400 dark:text-slate-500'
                  }`}
                />
                <span className="truncate">{item.label}</span>
              </div>
              {item.badge !== null && (
                <span
                  className={`text-[11px] font-semibold px-2 py-0.5 rounded-full ${item.badgeColor}`}
                >
                  {item.badge}
                </span>
              )}
            </button>
          );
        })}
      </div>

      {/* User profile & Command footer */}
      <div className="p-3.5 pb-6 md:pb-3.5 border-t border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 shrink-0">
        <div className="px-3 py-2.5 rounded-xl bg-slate-50 dark:bg-slate-800/50 border border-slate-200/80 dark:border-slate-800 flex items-center justify-between gap-2">
          <div className="min-w-0 flex-1">
            <div className="flex items-center space-x-1.5">
              <p className="text-xs font-bold text-slate-900 dark:text-white truncate">
                {user.name}
              </p>
              {user.system_role === 'Admin' ? (
                <span className="text-[9px] font-extrabold uppercase px-1.5 py-0.2 rounded-full bg-indigo-100 text-indigo-700 dark:bg-indigo-900/60 dark:text-indigo-300">
                  Admin
                </span>
              ) : (
                <span className="text-[9px] font-extrabold uppercase px-1.5 py-0.2 rounded-full bg-blue-100 text-blue-700 dark:bg-blue-900/60 dark:text-blue-300">
                  User
                </span>
              )}
            </div>
            <p className="text-[11px] text-slate-500 dark:text-slate-400 truncate mt-0.5">
              {user.role || (user.system_role === 'Admin' ? 'System Administrator' : 'Product Contributor')}
            </p>
          </div>
          <button
            onClick={() => {
              signOutUser();
              if (onClose) onClose();
            }}
            title="Sign out"
            className="p-2 rounded-lg text-slate-400 hover:text-rose-600 dark:hover:text-rose-400 hover:bg-rose-50 dark:hover:bg-rose-950/40 transition-colors cursor-pointer"
          >
            <LogOut className="w-4 h-4" />
          </button>
        </div>

        {/* Dedicated Full-Width Mobile Logout Button */}
        <button
          onClick={() => {
            signOutUser();
            if (onClose) onClose();
          }}
          className="md:hidden w-full mt-2.5 py-2.5 px-3 rounded-xl bg-rose-50 hover:bg-rose-100 dark:bg-rose-950/40 dark:hover:bg-rose-900/60 text-rose-700 dark:text-rose-300 border border-rose-200/80 dark:border-rose-900/60 font-semibold text-xs flex items-center justify-center space-x-2 transition-all cursor-pointer shadow-2xs"
        >
          <LogOut className="w-4 h-4" />
          <span>Sign Out of Nexus OS</span>
        </button>
      </div>
    </aside>
  );
}
