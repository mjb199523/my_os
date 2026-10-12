'use client';

import React, { useState } from 'react';
import { WorkOSProvider, useWorkOS } from '@/context/WorkOSContext';
import Sidebar from '@/components/layout/Sidebar';
import Header from '@/components/layout/Header';
import MobileNav from '@/components/layout/MobileNav';
import DashboardView from '@/components/dashboard/DashboardView';
import TasksView from '@/components/tasks/TasksView';
import ProjectsView from '@/components/projects/ProjectsView';
import FollowupsView from '@/components/followups/FollowupsView';
import MeetingsView from '@/components/meetings/MeetingsView';
import CalendarView from '@/components/calendar/CalendarView';
import IssuesView from '@/components/issues/IssuesView';
import WorkLogView from '@/components/worklog/WorkLogView';
import ReportsView from '@/components/reports/ReportsView';
import AchievementsView from '@/components/achievements/AchievementsView';
import NotesView from '@/components/notes/NotesView';
import SettingsView from '@/components/settings/SettingsView';

// Modals
import QuickTaskUpdateModal from '@/components/modals/QuickTaskUpdateModal';
import TaskHistoryModal from '@/components/modals/TaskHistoryModal';
import QuickAddModal from '@/components/modals/QuickAddModal';
import GlobalSearchModal from '@/components/modals/GlobalSearchModal';

import AuthModal from '@/components/modals/AuthModal';

function AppContent() {
  const { activeTab } = useWorkOS();
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);

  const renderActiveView = () => {
    switch (activeTab) {
      case 'dashboard':
        return <DashboardView />;
      case 'tasks':
        return <TasksView />;
      case 'projects':
        return <ProjectsView />;
      case 'followups':
        return <FollowupsView />;
      case 'calendar':
        return <CalendarView />;
      case 'meetings':
        return <MeetingsView />;
      case 'issues':
        return <IssuesView />;
      case 'worklog':
        return <WorkLogView />;
      case 'reports':
        return <ReportsView />;
      case 'achievements':
        return <AchievementsView />;
      case 'notes':
        return <NotesView />;
      case 'settings':
        return <SettingsView />;
      default:
        return <DashboardView />;
    }
  };

  return (
    <div className="min-h-screen bg-slate-50 dark:bg-slate-950 flex flex-col transition-colors">
      {/* Sidebar for Desktop & Drawer on Mobile */}
      <Sidebar
        isOpen={isSidebarOpen}
        onClose={() => setIsSidebarOpen(false)}
      />

      {/* Overlay for mobile drawer */}
      {isSidebarOpen && (
        <div
          onClick={() => setIsSidebarOpen(false)}
          className="fixed inset-0 bg-slate-900/50 z-30 md:hidden backdrop-blur-2xs"
        />
      )}

      {/* Main Content Area */}
      <div className="flex-1 flex flex-col md:pl-64">
        {/* Header */}
        <Header onToggleSidebar={() => setIsSidebarOpen((prev) => !prev)} />

        {/* Viewport Content */}
        <main className="flex-1 p-4 sm:p-6 lg:p-8 pb-20 md:pb-8">
          {renderActiveView()}
        </main>
      </div>

      {/* Mobile Bottom Navigation */}
      <MobileNav onOpenSidebar={() => setIsSidebarOpen(true)} />

      {/* Global Interactive Modals */}
      <QuickTaskUpdateModal />
      <TaskHistoryModal />
      <QuickAddModal />
      <GlobalSearchModal />
      <AuthModal />
    </div>
  );
}

export default function AppShell() {
  return (
    <WorkOSProvider>
      <AppContent />
    </WorkOSProvider>
  );
}
