'use client';

import React, { useState } from 'react';
import { useWorkOS } from '@/context/WorkOSContext';
import {
  Settings,
  Database,
  Download,
  Upload,
  RefreshCw,
  Trash2,
  User,
  ShieldCheck,
  CheckCircle2,
  ExternalLink,
} from 'lucide-react';
import Logo from '@/components/common/Logo';

export default function SettingsView() {
  const {
    user,
    updateUser,
    resetToSeedData,
    clearAllData,
    exportDataJSON,
    importDataJSON,
    isSupabaseConnected,
    setIsAuthModalOpen,
    syncWithSupabase,
    isSyncing,
    lastSyncedAt,
  } = useWorkOS();

  const [importStatus, setImportStatus] = useState<string | null>(null);

  const handleDownloadBackup = () => {
    const jsonStr = exportDataJSON();
    const blob = new Blob([jsonStr], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `my_work_os_backup_${new Date().toISOString().split('T')[0]}.json`;
    a.click();
    URL.revokeObjectURL(url);
  };

  const handleImportFile = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onload = (event) => {
      const content = event.target?.result as string;
      const success = importDataJSON(content);
      if (success) {
        setImportStatus('Backup restored successfully!');
      } else {
        setImportStatus('Invalid JSON file format.');
      }
      setTimeout(() => setImportStatus(null), 3000);
    };
    reader.readAsText(file);
  };

  return (
    <div className="space-y-6 max-w-4xl mx-auto pb-12">
      {/* Header */}
      <div>
        <h1 className="text-xl sm:text-2xl font-bold text-slate-900 dark:text-white tracking-tight">
          System Settings &amp; Data Control
        </h1>
        <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
          Manage workspace persistence, backup/restore, and Supabase database connection.
        </p>
      </div>

      {/* User Profile Card */}
      <div className="p-6 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-sm space-y-4">
        <div className="flex flex-wrap items-center justify-between gap-4">
          <div className="flex items-center space-x-3">
            <div className="w-12 h-12 rounded-xl bg-gradient-to-tr from-blue-600 to-indigo-600 text-white font-bold text-base flex items-center justify-center shadow-sm uppercase">
              {user.name ? user.name.slice(0, 2) : 'ME'}
            </div>
            <div>
              <h2 className="text-base font-bold text-slate-900 dark:text-white">
                {user.name}
              </h2>
              <p className="text-xs text-slate-500 dark:text-slate-400">
                {user.role} • {user.email}
              </p>
            </div>
          </div>
          <span className="text-[11px] font-semibold px-2.5 py-1 rounded-full bg-blue-50 dark:bg-blue-950/60 text-blue-700 dark:text-blue-300">
            Workspace Owner
          </span>
        </div>

        {/* Editable Profile Inputs */}
        <div className="pt-3 border-t border-slate-100 dark:border-slate-800 grid grid-cols-1 sm:grid-cols-3 gap-3">
          <div>
            <label className="block text-[11px] font-semibold text-slate-500 mb-1">
              Your Name
            </label>
            <input
              type="text"
              value={user.name}
              onChange={(e) => updateUser({ name: e.target.value })}
              className="w-full px-3 py-1.5 text-xs rounded-lg bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-slate-900 dark:text-white font-medium"
              placeholder="e.g. Manashjyoti Barman"
            />
          </div>
          <div>
            <label className="block text-[11px] font-semibold text-slate-500 mb-1">
              Designation / Role
            </label>
            <input
              type="text"
              value={user.role || ''}
              onChange={(e) => updateUser({ role: e.target.value })}
              className="w-full px-3 py-1.5 text-xs rounded-lg bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-slate-900 dark:text-white font-medium"
              placeholder="e.g. Product Delivery Lead"
            />
          </div>
          <div>
            <label className="block text-[11px] font-semibold text-slate-500 mb-1">
              Email Address
            </label>
            <input
              type="email"
              value={user.email}
              onChange={(e) => updateUser({ email: e.target.value })}
              className="w-full px-3 py-1.5 text-xs rounded-lg bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-slate-900 dark:text-white font-medium"
              placeholder="e.g. manash@company.com"
            />
          </div>
        </div>
      </div>

      {/* Database & Supabase Mode Card */}
      <div className="p-6 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-sm space-y-4">
        <div className="flex flex-wrap items-center justify-between gap-3">
          <div className="flex items-center space-x-2.5">
            <Database className="w-5 h-5 text-blue-600 dark:text-blue-400" />
            <h2 className="text-sm font-bold text-slate-900 dark:text-white">
              Database &amp; Cloud Synchronization
            </h2>
          </div>
          <div className="flex items-center space-x-2">
            <span
              className={`text-[11px] font-bold px-2.5 py-0.5 rounded-full ${
                isSupabaseConnected
                  ? 'bg-emerald-100 text-emerald-800 dark:bg-emerald-950 dark:text-emerald-300'
                  : 'bg-amber-100 text-amber-800 dark:bg-amber-950 dark:text-amber-300'
              }`}
            >
              {isSupabaseConnected ? 'Supabase Live Connected' : 'Local Storage Mode'}
            </span>
            <button
              onClick={() => setIsAuthModalOpen(true)}
              className="px-3 py-1 text-xs font-semibold rounded-lg bg-blue-600 text-white hover:bg-blue-700 shadow-2xs"
            >
              {isSupabaseConnected ? 'Configure Supabase' : 'Connect Supabase'}
            </button>
          </div>
        </div>

        {lastSyncedAt && (
          <p className="text-[11px] text-slate-500">
            Last synchronized at: {lastSyncedAt}
          </p>
        )}

        <p className="text-xs text-slate-600 dark:text-slate-400 leading-relaxed">
          The application operates with persistent storage and cloud synchronization. Environment variables in <code className="px-1.5 py-0.5 rounded bg-slate-100 dark:bg-slate-800 text-blue-600">.env.local</code>:
        </p>

        <div className="p-3.5 rounded-xl bg-slate-50 dark:bg-slate-800/60 border border-slate-200/70 dark:border-slate-700 font-mono text-[11px] text-slate-800 dark:text-slate-200 space-y-1">
          <div>NEXT_PUBLIC_SUPABASE_URL=https://••••••••••••.supabase.co</div>
          <div>NEXT_PUBLIC_SUPABASE_ANON_KEY=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.••••••••••••</div>
        </div>
      </div>

      {/* Backup & Restore Controls */}
      <div className="p-6 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-sm space-y-4">
        <h2 className="text-sm font-bold text-slate-900 dark:text-white">
          Data Management &amp; Seed State
        </h2>

        {importStatus && (
          <div className="p-3 rounded-xl bg-emerald-50 dark:bg-emerald-950/40 text-emerald-700 dark:text-emerald-300 text-xs font-semibold">
            {importStatus}
          </div>
        )}

        <div className="flex flex-wrap gap-3">
          <button
            onClick={handleDownloadBackup}
            className="inline-flex items-center space-x-1.5 px-4 py-2 text-xs font-semibold rounded-xl bg-slate-100 hover:bg-slate-200 dark:bg-slate-800 dark:hover:bg-slate-700 text-slate-700 dark:text-slate-200 transition-colors"
          >
            <Download className="w-3.5 h-3.5" />
            <span>Export JSON Backup</span>
          </button>

          <label className="inline-flex items-center space-x-1.5 px-4 py-2 text-xs font-semibold rounded-xl bg-slate-100 hover:bg-slate-200 dark:bg-slate-800 dark:hover:bg-slate-700 text-slate-700 dark:text-slate-200 transition-colors cursor-pointer">
            <Upload className="w-3.5 h-3.5" />
            <span>Restore Backup</span>
            <input
              type="file"
              accept=".json"
              onChange={handleImportFile}
              className="hidden"
            />
          </label>

          <button
            onClick={() => {
              if (
                confirm(
                  'Are you sure you want to clear all data and start from scratch with 0 items?'
                )
              ) {
                clearAllData();
                alert('Workspace cleared! You are now starting completely from 0.');
              }
            }}
            className="inline-flex items-center space-x-1.5 px-4 py-2 text-xs font-semibold rounded-xl bg-rose-600 hover:bg-rose-700 text-white transition-colors shadow-2xs"
          >
            <Trash2 className="w-3.5 h-3.5" />
            <span>Clear All Data (Start from 0)</span>
          </button>

          <button
            onClick={() => {
              if (
                confirm(
                  'Reset workspace back to original template seed data?'
                )
              ) {
                resetToSeedData();
                alert('Workspace reset to initial seed state.');
              }
            }}
            className="inline-flex items-center space-x-1.5 px-4 py-2 text-xs font-semibold rounded-xl bg-slate-100 hover:bg-slate-200 dark:bg-slate-800 dark:hover:bg-slate-700 text-slate-700 dark:text-slate-300 transition-colors"
          >
            <RefreshCw className="w-3.5 h-3.5" />
            <span>Load Demo Template</span>
          </button>
        </div>
      </div>

      {/* About & Brand Card */}
      <div className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 p-6 shadow-sm flex items-center justify-between">
        <div className="flex items-center space-x-4">
          <Logo size={44} />
          <div>
            <h4 className="text-sm font-bold text-slate-900 dark:text-white">
              My Work OS
            </h4>
            <p className="text-xs text-slate-500 dark:text-slate-400">
              Personal Command Centre &bull; Version 2.0.0
            </p>
          </div>
        </div>
        <span className="text-xs font-medium text-slate-400">
          Designed for high-output delivery managers
        </span>
      </div>
    </div>
  );
}
