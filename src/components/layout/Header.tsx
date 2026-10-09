'use client';

import React, { useState, useRef, useEffect } from 'react';
import { useWorkOS } from '@/context/WorkOSContext';
import {
  Search,
  Plus,
  Bell,
  Sun,
  Moon,
  Menu,
  CheckCircle2,
  Calendar,
  CheckSquare,
  UserCheck,
  Video,
  AlertOctagon,
  FileText,
  X,
  ExternalLink,
} from 'lucide-react';

interface HeaderProps {
  onToggleSidebar: () => void;
}

export default function Header({ onToggleSidebar }: HeaderProps) {
  const {
    user,
    darkMode,
    toggleDarkMode,
    setIsSearchOpen,
    openQuickAdd,
    notifications,
    markNotificationRead,
    clearAllNotifications,
    setActiveTab,
  } = useWorkOS();

  const [isNotificationsOpen, setIsNotificationsOpen] = useState(false);
  const notifRef = useRef<HTMLDivElement>(null);

  // Close notifications dropdown on outside click
  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (notifRef.current && !notifRef.current.contains(event.target as Node)) {
        setIsNotificationsOpen(false);
      }
    }
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  // Format today's date dynamically (e.g. "Friday, 09 October 2026")
  const dateObj = new Date();
  const dateOptions: Intl.DateTimeFormatOptions = {
    weekday: 'long',
    day: '2-digit',
    month: 'long',
    year: 'numeric',
  };
  const formattedDate = dateObj.toLocaleDateString('en-GB', dateOptions);

  // Dynamic greeting based on time of day
  const hour = dateObj.getHours();
  let greetingTime = 'morning';
  if (hour >= 12 && hour < 17) {
    greetingTime = 'afternoon';
  } else if (hour >= 17) {
    greetingTime = 'evening';
  }

  const firstName = user.name.split(' ')[0] || 'Manash';

  return (
    <header className="sticky top-0 z-30 bg-white/90 dark:bg-slate-900/90 backdrop-blur-md border-b border-slate-200 dark:border-slate-800 transition-colors">
      <div className="px-4 sm:px-6 py-3.5 flex items-center justify-between gap-4">
        {/* Left: Mobile hamburger & Greetings */}
        <div className="flex items-center space-x-3 min-w-0">
          <button
            onClick={onToggleSidebar}
            className="md:hidden p-2 rounded-lg text-slate-500 hover:text-slate-700 hover:bg-slate-100 dark:hover:bg-slate-800"
            aria-label="Toggle navigation"
          >
            <Menu className="w-5 h-5" />
          </button>

          <div>
            <div className="flex items-center space-x-2">
              <h1 className="text-base sm:text-lg font-bold text-slate-900 dark:text-white tracking-tight">
                Good {greetingTime}, {firstName} 👋
              </h1>
            </div>
            <p className="text-xs text-slate-500 dark:text-slate-400 font-medium">
              {formattedDate}
            </p>
          </div>
        </div>

        {/* Center/Right: Quick Action buttons */}
        <div className="hidden lg:flex items-center space-x-2">
          <button
            onClick={() => openQuickAdd('task')}
            className="inline-flex items-center space-x-1.5 px-3 py-1.5 text-xs font-semibold rounded-lg bg-blue-600 hover:bg-blue-700 text-white shadow-sm transition-all"
          >
            <Plus className="w-3.5 h-3.5" />
            <span>Task</span>
          </button>

          <button
            onClick={() => openQuickAdd('followup')}
            className="inline-flex items-center space-x-1.5 px-3 py-1.5 text-xs font-semibold rounded-lg bg-amber-50 hover:bg-amber-100 text-amber-700 dark:bg-amber-950/40 dark:hover:bg-amber-950/70 dark:text-amber-300 border border-amber-200 dark:border-amber-800 transition-all"
          >
            <Plus className="w-3.5 h-3.5" />
            <span>Follow-up</span>
          </button>

          <button
            onClick={() => openQuickAdd('meeting')}
            className="inline-flex items-center space-x-1.5 px-3 py-1.5 text-xs font-semibold rounded-lg bg-purple-50 hover:bg-purple-100 text-purple-700 dark:bg-purple-950/40 dark:hover:bg-purple-950/70 dark:text-purple-300 border border-purple-200 dark:border-purple-800 transition-all"
          >
            <Plus className="w-3.5 h-3.5" />
            <span>Meeting</span>
          </button>

          <button
            onClick={() => openQuickAdd('issue')}
            className="inline-flex items-center space-x-1.5 px-3 py-1.5 text-xs font-semibold rounded-lg bg-red-50 hover:bg-red-100 text-red-700 dark:bg-red-950/40 dark:hover:bg-red-950/70 dark:text-red-300 border border-red-200 dark:border-red-800 transition-all"
          >
            <Plus className="w-3.5 h-3.5" />
            <span>Issue</span>
          </button>

          <button
            onClick={() => openQuickAdd('note')}
            className="inline-flex items-center space-x-1.5 px-3 py-1.5 text-xs font-semibold rounded-lg bg-slate-100 hover:bg-slate-200 text-slate-700 dark:bg-slate-800 dark:hover:bg-slate-700 dark:text-slate-300 transition-all"
          >
            <Plus className="w-3.5 h-3.5" />
            <span>Note</span>
          </button>
        </div>

        {/* Right side: Global Search, Notifications, Theme toggle */}
        <div className="flex items-center space-x-2 sm:space-x-3 shrink-0">
          {/* Global Search trigger */}
          <button
            onClick={() => setIsSearchOpen(true)}
            className="flex items-center space-x-2 px-3 py-1.5 text-xs font-medium text-slate-500 dark:text-slate-400 bg-slate-100 hover:bg-slate-200 dark:bg-slate-800 dark:hover:bg-slate-700/80 rounded-lg transition-colors border border-transparent dark:border-slate-700"
            title="Search across all entities (Cmd+K)"
          >
            <Search className="w-3.5 h-3.5" />
            <span className="hidden sm:inline">Search OS</span>
            <kbd className="hidden sm:inline text-[10px] font-sans px-1.5 py-0.5 rounded bg-white dark:bg-slate-900 border border-slate-300 dark:border-slate-700 text-slate-400">
              ⌘K
            </kbd>
          </button>

          {/* Quick Add icon button for mobile & small screens */}
          <div className="lg:hidden">
            <button
              onClick={() => openQuickAdd('task')}
              className="p-2 rounded-lg bg-blue-600 text-white hover:bg-blue-700 shadow-sm"
              title="Add Task"
            >
              <Plus className="w-4 h-4" />
            </button>
          </div>

          {/* Notification Centre Bell */}
          <div className="relative" ref={notifRef}>
            <button
              onClick={() => setIsNotificationsOpen((prev) => !prev)}
              className="relative p-2 rounded-lg text-slate-600 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800 hover:text-slate-900 dark:hover:text-slate-200 transition-colors"
              aria-label="Notifications"
            >
              <Bell className="w-4 h-4" />
              {notifications.length > 0 && (
                <span className="absolute top-1.5 right-1.5 w-2 h-2 rounded-full bg-red-500 animate-pulse" />
              )}
            </button>

            {/* Notification Dropdown Panel */}
            {isNotificationsOpen && (
              <div className="absolute right-0 mt-2 w-80 sm:w-96 rounded-xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-xl overflow-hidden z-50 animate-in fade-in slide-in-from-top-2 duration-150">
                <div className="px-4 py-3 border-b border-slate-200 dark:border-slate-800 flex items-center justify-between">
                  <div>
                    <h3 className="text-xs font-bold text-slate-900 dark:text-white uppercase tracking-wider">
                      Notification Centre
                    </h3>
                    <p className="text-[11px] text-slate-500 dark:text-slate-400">
                      {notifications.length} actionable updates
                    </p>
                  </div>
                  {notifications.length > 0 && (
                    <button
                      onClick={clearAllNotifications}
                      className="text-[11px] text-blue-600 dark:text-blue-400 hover:underline font-medium"
                    >
                      Clear all
                    </button>
                  )}
                </div>

                <div className="max-h-80 overflow-y-auto divide-y divide-slate-100 dark:divide-slate-800">
                  {notifications.length === 0 ? (
                    <div className="p-6 text-center">
                      <CheckCircle2 className="w-8 h-8 text-emerald-500 mx-auto mb-2 opacity-80" />
                      <p className="text-xs font-medium text-slate-600 dark:text-slate-300">
                        All clear!
                      </p>
                      <p className="text-[11px] text-slate-400">
                        No overdue tasks or urgent blockers.
                      </p>
                    </div>
                  ) : (
                    notifications.map((item) => (
                      <div
                        key={item.id}
                        className="p-3 hover:bg-slate-50 dark:hover:bg-slate-800/50 transition-colors flex items-start justify-between gap-3 text-left"
                      >
                        <div className="flex-1 min-w-0">
                          <div className="flex items-center space-x-1.5">
                            <span className="text-xs font-semibold text-slate-900 dark:text-white">
                              {item.title}
                            </span>
                            <span className="text-[10px] font-medium text-slate-400">
                              • {item.timestamp}
                            </span>
                          </div>
                          <p className="text-xs text-slate-600 dark:text-slate-400 truncate mt-0.5">
                            {item.message}
                          </p>
                        </div>
                        <button
                          onClick={() => markNotificationRead(item.id)}
                          className="text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 p-1 rounded"
                          title="Dismiss"
                        >
                          <X className="w-3.5 h-3.5" />
                        </button>
                      </div>
                    ))
                  )}
                </div>
              </div>
            )}
          </div>

          {/* Dark Mode Toggle */}
          <button
            onClick={toggleDarkMode}
            className="p-2 rounded-lg text-slate-600 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800 hover:text-slate-900 dark:text-slate-200 transition-colors"
            title={darkMode ? 'Switch to Light Mode' : 'Switch to Dark Mode'}
            aria-label="Toggle dark mode"
          >
            {darkMode ? (
              <Sun className="w-4 h-4 text-amber-400" />
            ) : (
              <Moon className="w-4 h-4 text-slate-600" />
            )}
          </button>
        </div>
      </div>
    </header>
  );
}
