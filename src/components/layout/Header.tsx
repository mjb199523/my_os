'use client';

import React, { useState, useRef, useEffect } from 'react';
import { useWorkOS } from '@/context/WorkOSContext';
import {
  Search,
  Plus,
  Bell,
  Menu,
  CheckCircle2,
  Calendar,
  Clock,
  CheckSquare,
  UserCheck,
  Video,
  AlertOctagon,
  FileText,
  X,
  ExternalLink,
  Megaphone,
  Send,
  Mail,
  Users,
  ChevronDown,
} from 'lucide-react';

interface HeaderProps {
  onToggleSidebar: () => void;
}

export default function Header({ onToggleSidebar }: HeaderProps) {
  const {
    user,
    users,
    adminUserFilter,
    setAdminUserFilter,
    setIsSearchOpen,
    openQuickAdd,
    notifications,
    unreadNotificationsCount,
    markNotificationRead,
    clearAllNotifications,
    isAdmin,
    openComposeMessage,
    setActiveTab,
    isSupabaseConnected,
    setIsAuthModalOpen,
  } = useWorkOS();

  const [isNotificationsOpen, setIsNotificationsOpen] = useState(false);
  const notifRef = useRef<HTMLDivElement>(null);

  const [isQuickAddOpen, setIsQuickAddOpen] = useState(false);
  const quickAddRef = useRef<HTMLDivElement>(null);

  // Close dropdowns on outside click
  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (notifRef.current && !notifRef.current.contains(event.target as Node)) {
        setIsNotificationsOpen(false);
      }
      if (quickAddRef.current && !quickAddRef.current.contains(event.target as Node)) {
        setIsQuickAddOpen(false);
      }
    }
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  // Format today's date & live dynamic time clock (updating every second)
  const [currentDate, setCurrentDate] = useState(new Date());

  useEffect(() => {
    const timer = setInterval(() => {
      setCurrentDate(new Date());
    }, 1000);
    return () => clearInterval(timer);
  }, []);

  const dateOptions: Intl.DateTimeFormatOptions = {
    weekday: 'short',
    day: '2-digit',
    month: 'short',
    year: 'numeric',
  };
  const formattedDate = currentDate.toLocaleDateString('en-GB', dateOptions);
  
  // Format live 12-hour clock with seconds (e.g., 12:15:30 PM)
  const formattedTime = currentDate.toLocaleTimeString('en-US', {
    hour: '2-digit',
    minute: '2-digit',
    second: '2-digit',
    hour12: true,
  });

  const firstName = user.name ? user.name.split(' ')[0] : 'User';

  return (
    <header className="sticky top-0 z-30 bg-white/90 dark:bg-slate-900/90 backdrop-blur-md border-b border-slate-200 dark:border-slate-800 transition-colors">
      <div className="px-4 sm:px-6 py-2.5 flex items-center justify-between gap-3">
        {/* Left: Mobile hamburger & User Greeting (shows first name cleanly) */}
        <div className="flex items-center space-x-3 shrink-0">
          <button
            onClick={onToggleSidebar}
            className="md:hidden p-2 rounded-lg text-slate-500 hover:text-slate-700 hover:bg-slate-100 dark:hover:bg-slate-800 shrink-0"
            aria-label="Toggle navigation"
          >
            <Menu className="w-5 h-5" />
          </button>

          <div className="shrink-0">
            <div className="flex items-center space-x-2 whitespace-nowrap">
              <h1 className="text-base sm:text-lg font-bold text-slate-900 dark:text-white tracking-tight">
                {firstName} 👋
              </h1>
              {user.system_role === 'Admin' ? (
                <span className="inline-flex items-center space-x-1 px-2 py-0.5 rounded-full text-[10px] font-bold bg-indigo-100 text-indigo-700 dark:bg-indigo-900/60 dark:text-indigo-300 border border-indigo-200/50 dark:border-indigo-800 shrink-0">
                  <span>🛡️ Admin</span>
                </span>
              ) : (
                <span className="inline-flex items-center space-x-1 px-2 py-0.5 rounded-full text-[10px] font-bold bg-blue-100 text-blue-700 dark:bg-blue-900/60 dark:text-blue-300 border border-blue-200/50 dark:border-blue-800 shrink-0">
                  <span>👤 User</span>
                </span>
              )}
            </div>
            <div className="flex items-center space-x-2 text-xs text-slate-500 dark:text-slate-400 font-medium mt-0.5 whitespace-nowrap">
              <span>{formattedDate}</span>
              <span className="text-slate-300 dark:text-slate-600">•</span>
              <div className="inline-flex items-center space-x-1 font-mono font-semibold text-slate-700 dark:text-slate-200 bg-slate-100 dark:bg-slate-800/80 px-2 py-0.5 rounded-md border border-slate-200/80 dark:border-slate-700">
                <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse" />
                <Clock className="w-3 h-3 text-slate-400" />
                <span>{formattedTime}</span>
              </div>
            </div>
          </div>
        </div>

        {/* Quick Add Split Button (Task + Dropdown for other entities) */}
        <div className="relative shrink-0" ref={quickAddRef}>
          <div className="inline-flex items-stretch rounded-lg shadow-xs overflow-hidden border border-blue-600">
            <button
              onClick={() => openQuickAdd('task')}
              className="inline-flex items-center space-x-1.5 px-3 py-1.5 text-xs font-semibold bg-blue-600 hover:bg-blue-700 text-white transition-all cursor-pointer"
              title="Quick Add Task"
            >
              <Plus className="w-3.5 h-3.5" />
              <span>Task</span>
            </button>
            <button
              onClick={() => setIsQuickAddOpen((prev) => !prev)}
              className="px-1.5 bg-blue-600 hover:bg-blue-700 text-white border-l border-blue-500 transition-all flex items-center justify-center cursor-pointer"
              title="More creation options (Follow-up, Meeting, Issue, Note)"
              aria-label="More creation options"
            >
              <ChevronDown
                className={`w-3.5 h-3.5 transition-transform duration-150 ${
                  isQuickAddOpen ? 'rotate-180' : ''
                }`}
              />
            </button>
          </div>

          {/* Quick Add Dropdown Menu */}
          {isQuickAddOpen && (
            <div className="absolute left-0 mt-2 w-48 rounded-xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-2xl py-1.5 z-50 animate-in fade-in slide-in-from-top-1 duration-150">
              <button
                onClick={() => {
                  openQuickAdd('task');
                  setIsQuickAddOpen(false);
                }}
                className="w-full flex items-center space-x-2.5 px-3 py-2 text-xs font-medium text-slate-700 dark:text-slate-200 hover:bg-blue-50 dark:hover:bg-blue-950/50 hover:text-blue-600 dark:hover:text-blue-400 text-left transition-colors cursor-pointer"
              >
                <CheckSquare className="w-4 h-4 text-blue-600 dark:text-blue-400 shrink-0" />
                <span>New Task</span>
              </button>
              <button
                onClick={() => {
                  openQuickAdd('followup');
                  setIsQuickAddOpen(false);
                }}
                className="w-full flex items-center space-x-2.5 px-3 py-2 text-xs font-medium text-slate-700 dark:text-slate-200 hover:bg-amber-50 dark:hover:bg-amber-950/50 hover:text-amber-600 dark:hover:text-amber-400 text-left transition-colors cursor-pointer"
              >
                <UserCheck className="w-4 h-4 text-amber-500 shrink-0" />
                <span>New Follow-up</span>
              </button>
              <button
                onClick={() => {
                  openQuickAdd('meeting');
                  setIsQuickAddOpen(false);
                }}
                className="w-full flex items-center space-x-2.5 px-3 py-2 text-xs font-medium text-slate-700 dark:text-slate-200 hover:bg-purple-50 dark:hover:bg-purple-950/50 hover:text-purple-600 dark:hover:text-purple-400 text-left transition-colors cursor-pointer"
              >
                <Video className="w-4 h-4 text-purple-600 dark:text-purple-400 shrink-0" />
                <span>New Meeting</span>
              </button>
              <button
                onClick={() => {
                  openQuickAdd('issue');
                  setIsQuickAddOpen(false);
                }}
                className="w-full flex items-center space-x-2.5 px-3 py-2 text-xs font-medium text-slate-700 dark:text-slate-200 hover:bg-rose-50 dark:hover:bg-rose-950/50 hover:text-rose-600 dark:hover:text-rose-400 text-left transition-colors cursor-pointer"
              >
                <AlertOctagon className="w-4 h-4 text-rose-600 dark:text-rose-400 shrink-0" />
                <span>New Issue</span>
              </button>
              <button
                onClick={() => {
                  openQuickAdd('note');
                  setIsQuickAddOpen(false);
                }}
                className="w-full flex items-center space-x-2.5 px-3 py-2 text-xs font-medium text-slate-700 dark:text-slate-200 hover:bg-slate-100 dark:hover:bg-slate-800 text-left transition-colors cursor-pointer"
              >
                <FileText className="w-4 h-4 text-slate-500 shrink-0" />
                <span>New Note</span>
              </button>
            </div>
          )}
        </div>

        {/* Admin Data Scope Selector (Everyone vs Individual User) */}
        {isAdmin && users.length > 1 && (
          <div className="hidden sm:flex items-center space-x-1.5 bg-indigo-50/70 dark:bg-indigo-950/40 px-2.5 py-1.5 rounded-lg border border-indigo-200/60 dark:border-indigo-800/60 text-xs shrink-0">
            <Users className="w-3.5 h-3.5 text-indigo-600 dark:text-indigo-400 shrink-0" />
            <span className="font-semibold text-indigo-900 dark:text-indigo-200 shrink-0">Scope:</span>
            <select
              value={adminUserFilter}
              onChange={(e) => setAdminUserFilter(e.target.value)}
              className="bg-transparent font-medium text-slate-800 dark:text-slate-100 focus:outline-none cursor-pointer max-w-[150px] truncate text-xs"
              title="Filter views across users"
            >
              <option value="all" className="bg-white dark:bg-slate-900 text-slate-800 dark:text-slate-200">
                👥 Everyone ({users.length})
              </option>
              {users.map((u) => {
                const uFirst = u.name ? u.name.split(' ')[0] : u.email.split('@')[0];
                return (
                  <option key={u.id} value={u.id} className="bg-white dark:bg-slate-900 text-slate-800 dark:text-slate-200">
                    👤 {uFirst} ({u.system_role})
                  </option>
                );
              })}
            </select>
          </div>
        )}

        {/* Right side: Supabase Sync, Global Search, Notifications, Theme toggle */}
        <div className="flex items-center space-x-2 sm:space-x-2.5 shrink-0">
          {/* Supabase Status / Auth Button */}
          <button
            onClick={() => setIsAuthModalOpen(true)}
            className={`hidden md:inline-flex items-center space-x-1.5 px-2.5 py-1.5 rounded-lg text-xs font-semibold border transition-all shrink-0 ${
              isSupabaseConnected
                ? 'bg-emerald-50 dark:bg-emerald-950/40 text-emerald-700 dark:text-emerald-300 border-emerald-200 dark:border-emerald-800'
                : 'bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300 border-slate-200 dark:border-slate-700 hover:border-blue-400'
            }`}
            title="Configure Supabase Database & Authentication"
          >
            <span
              className={`w-2 h-2 rounded-full shrink-0 ${
                isSupabaseConnected ? 'bg-emerald-500' : 'bg-amber-400'
              }`}
            />
            <span className="hidden xl:inline">{isSupabaseConnected ? 'Supabase Synced' : 'Connect Cloud'}</span>
          </button>

          {/* Global Search trigger */}
          <button
            onClick={() => setIsSearchOpen(true)}
            className="flex items-center space-x-1.5 px-2.5 py-1.5 text-xs font-medium text-slate-500 dark:text-slate-400 bg-slate-100 hover:bg-slate-200 dark:bg-slate-800 dark:hover:bg-slate-700/80 rounded-lg transition-colors border border-transparent dark:border-slate-700 shrink-0 cursor-pointer"
            title="Search across all entities (Cmd+K)"
          >
            <Search className="w-3.5 h-3.5 shrink-0" />
            <span className="hidden sm:inline">Search OS</span>
            <kbd className="hidden lg:inline text-[10px] font-sans px-1.5 py-0.5 rounded bg-white dark:bg-slate-900 border border-slate-300 dark:border-slate-700 text-slate-400">
              ⌘K
            </kbd>
          </button>

          {/* Notification Centre Bell */}
          <div className="relative" ref={notifRef}>
            <button
              onClick={() => setIsNotificationsOpen((prev) => !prev)}
              className="relative p-2 rounded-lg text-slate-600 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800 hover:text-slate-900 dark:text-slate-200 transition-colors"
              aria-label="Admin Notifications"
              title="Admin Notifications"
            >
              <Bell className="w-4 h-4" />
              {unreadNotificationsCount > 0 && (
                <span className="absolute -top-0.5 -right-0.5 min-w-[18px] h-[18px] px-1 rounded-full bg-rose-500 text-white font-bold text-[10px] flex items-center justify-center shadow-xs animate-pulse">
                  {unreadNotificationsCount}
                </span>
              )}
            </button>

            {/* Notification Dropdown Panel */}
            {isNotificationsOpen && (
              <div className="absolute right-0 mt-2 w-80 sm:w-96 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-2xl overflow-hidden z-50 animate-in fade-in slide-in-from-top-2 duration-150">
                {/* Header */}
                <div className="px-4 py-3 border-b border-slate-100 dark:border-slate-800 flex items-center justify-between bg-slate-50/60 dark:bg-slate-800/40">
                  <div className="flex items-center space-x-2">
                    <Megaphone className="w-4 h-4 text-indigo-600 dark:text-indigo-400" />
                    <div>
                      <h3 className="text-xs font-bold text-slate-900 dark:text-white uppercase tracking-wider">
                        Admin Notifications
                      </h3>
                      <p className="text-[10px] text-slate-500 dark:text-slate-400">
                        {unreadNotificationsCount > 0
                          ? `${unreadNotificationsCount} unread message${unreadNotificationsCount > 1 ? 's' : ''}`
                          : 'All messages caught up'}
                      </p>
                    </div>
                  </div>

                  <div className="flex items-center space-x-2">
                    {isAdmin && (
                      <button
                        onClick={() => {
                          setIsNotificationsOpen(false);
                          openComposeMessage();
                        }}
                        className="inline-flex items-center space-x-1 px-2.5 py-1 text-[11px] font-semibold rounded-lg bg-indigo-600 hover:bg-indigo-700 text-white transition-colors"
                      >
                        <Send className="w-3 h-3" />
                        <span>Send</span>
                      </button>
                    )}
                    {unreadNotificationsCount > 0 && (
                      <button
                        onClick={clearAllNotifications}
                        className="text-[11px] text-blue-600 dark:text-blue-400 hover:underline font-medium"
                      >
                        Mark all read
                      </button>
                    )}
                  </div>
                </div>

                {/* Notifications List */}
                <div className="max-h-80 overflow-y-auto divide-y divide-slate-100 dark:divide-slate-800">
                  {notifications.length === 0 ? (
                    <div className="p-8 text-center space-y-2">
                      <div className="w-10 h-10 rounded-full bg-slate-100 dark:bg-slate-800 text-slate-400 flex items-center justify-center mx-auto">
                        <Bell className="w-5 h-5" />
                      </div>
                      <p className="text-xs font-semibold text-slate-700 dark:text-slate-300">
                        No notifications yet
                      </p>
                      <p className="text-[11px] text-slate-400 max-w-xs mx-auto">
                        When an administrator shares an announcement or direct update, it will appear here.
                      </p>
                    </div>
                  ) : (
                    notifications.map((item) => (
                      <div
                        key={item.id}
                        className={`p-3.5 transition-colors text-left flex items-start gap-3 ${
                          !item.read
                            ? 'bg-indigo-50/40 dark:bg-indigo-950/20 hover:bg-indigo-50/70 dark:hover:bg-indigo-950/40'
                            : 'hover:bg-slate-50 dark:hover:bg-slate-800/40'
                        }`}
                      >
                        {/* Unread indicator / avatar */}
                        <div className="mt-1 shrink-0">
                          {!item.read ? (
                            <span className="w-2.5 h-2.5 rounded-full bg-indigo-600 block animate-pulse" />
                          ) : (
                            <span className="w-2.5 h-2.5 rounded-full bg-slate-300 dark:bg-slate-600 block" />
                          )}
                        </div>

                        <div className="flex-1 min-w-0">
                          <div className="flex items-center justify-between gap-1 mb-0.5">
                            <span className="text-xs font-bold text-slate-900 dark:text-white truncate">
                              {item.title}
                            </span>
                            <span className="text-[10px] text-slate-400 shrink-0">
                              {item.timestamp}
                            </span>
                          </div>

                          <p className="text-xs text-slate-600 dark:text-slate-300 leading-relaxed whitespace-pre-wrap">
                            {item.message}
                          </p>

                          <div className="flex items-center justify-between mt-2 pt-1 border-t border-slate-100 dark:border-slate-800/60">
                            <span className="text-[10px] font-medium text-slate-400">
                              From: <span className="font-semibold text-slate-600 dark:text-slate-300">{item.sender_name || 'Administrator'}</span>
                            </span>

                            {!item.read && (
                              <button
                                onClick={() => markNotificationRead(item.id)}
                                className="text-[10px] font-semibold text-indigo-600 dark:text-indigo-400 hover:underline"
                              >
                                Mark as read
                              </button>
                            )}
                          </div>
                        </div>
                      </div>
                    ))
                  )}
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </header>
  );
}
