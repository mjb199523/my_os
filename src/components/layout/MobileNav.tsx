'use client';

import React from 'react';
import { useWorkOS } from '@/context/WorkOSContext';
import {
  LayoutDashboard,
  CheckSquare,
  FolderKanban,
  UserCheck,
  Plus,
  Menu,
} from 'lucide-react';

interface MobileNavProps {
  onOpenSidebar: () => void;
}

export default function MobileNav({ onOpenSidebar }: MobileNavProps) {
  const { activeTab, setActiveTab, openQuickAdd } = useWorkOS();

  const navItems = [
    { id: 'dashboard', label: 'Dashboard', icon: LayoutDashboard },
    { id: 'tasks', label: 'Tasks', icon: CheckSquare },
    { id: 'projects', label: 'Projects', icon: FolderKanban },
    { id: 'followups', label: 'Follow-ups', icon: UserCheck },
  ];

  return (
    <div className="md:hidden fixed bottom-0 left-0 right-0 z-40 bg-white/95 dark:bg-slate-900/95 backdrop-blur-md border-t border-slate-200 dark:border-slate-800 px-3 py-2 flex items-center justify-around shadow-lg">
      {navItems.slice(0, 2).map((item) => {
        const Icon = item.icon;
        const isActive = activeTab === item.id;
        return (
          <button
            key={item.id}
            onClick={() => setActiveTab(item.id)}
            className={`flex flex-col items-center justify-center p-1.5 rounded-lg text-xs font-medium transition-colors ${
              isActive
                ? 'text-blue-600 dark:text-blue-400 font-bold'
                : 'text-slate-500 hover:text-slate-900 dark:hover:text-slate-300'
            }`}
          >
            <Icon className="w-5 h-5 mb-0.5" />
            <span className="text-[10px]">{item.label}</span>
          </button>
        );
      })}

      {/* Floating Center Quick Add */}
      <button
        onClick={() => openQuickAdd('task')}
        className="w-10 h-10 rounded-full bg-blue-600 hover:bg-blue-700 text-white flex items-center justify-center shadow-md active:scale-95 transition-transform -mt-4 border-2 border-white dark:border-slate-900"
        title="Quick Add"
      >
        <Plus className="w-5 h-5" />
      </button>

      {navItems.slice(2).map((item) => {
        const Icon = item.icon;
        const isActive = activeTab === item.id;
        return (
          <button
            key={item.id}
            onClick={() => setActiveTab(item.id)}
            className={`flex flex-col items-center justify-center p-1.5 rounded-lg text-xs font-medium transition-colors ${
              isActive
                ? 'text-blue-600 dark:text-blue-400 font-bold'
                : 'text-slate-500 hover:text-slate-900 dark:hover:text-slate-300'
            }`}
          >
            <Icon className="w-5 h-5 mb-0.5" />
            <span className="text-[10px]">{item.label}</span>
          </button>
        );
      })}

      {/* Sidebar Drawer Toggle */}
      <button
        onClick={onOpenSidebar}
        className="flex flex-col items-center justify-center p-1.5 rounded-lg text-xs font-medium text-slate-500 hover:text-slate-900 dark:hover:text-slate-300"
      >
        <Menu className="w-5 h-5 mb-0.5" />
        <span className="text-[10px]">More</span>
      </button>
    </div>
  );
}
