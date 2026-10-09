'use client';

import React, { useState, useMemo } from 'react';
import { useWorkOS } from '@/context/WorkOSContext';
import { AchievementCategory } from '@/types';
import {
  Award,
  Plus,
  Copy,
  Check,
  Filter,
  Trash2,
  Sparkles,
  Calendar,
  Briefcase,
} from 'lucide-react';

export default function AchievementsView() {
  const { achievements, projects, deleteAchievement, openQuickAdd } = useWorkOS();

  const [categoryFilter, setCategoryFilter] = useState<string>('all');
  const [copied, setCopied] = useState(false);

  const categories: AchievementCategory[] = [
    'Delivery',
    'Product',
    'Technical',
    'Operations',
    'Leadership',
    'Process Improvement',
  ];

  const filteredAchievements = useMemo(() => {
    return achievements.filter((a) => {
      if (categoryFilter !== 'all' && a.category !== categoryFilter) return false;
      return true;
    });
  }, [achievements, categoryFilter]);

  const handleExportCV = () => {
    const text = achievements
      .map(
        (a) =>
          `### ${a.title} (${a.achievement_date})\n**Category:** ${a.category}\n**Description:** ${a.description}\n**Impact:** ${a.impact}\n`
      )
      .join('\n---\n\n');

    navigator.clipboard.writeText(text);
    setCopied(true);
    setTimeout(() => setCopied(false), 2500);
  };

  return (
    <div className="space-y-6 max-w-7xl mx-auto pb-12">
      {/* Header */}
      <div className="flex flex-wrap items-center justify-between gap-4">
        <div>
          <h1 className="text-xl sm:text-2xl font-bold text-slate-900 dark:text-white tracking-tight">
            Professional Achievements &amp; Impact
          </h1>
          <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
            Document key delivery wins, business impacts, and technical breakthroughs for appraisal and CV.
          </p>
        </div>

        <div className="flex items-center space-x-2">
          <button
            onClick={handleExportCV}
            className="inline-flex items-center space-x-1.5 px-3.5 py-2 text-xs font-semibold rounded-xl bg-slate-100 hover:bg-slate-200 dark:bg-slate-800 dark:hover:bg-slate-700 text-slate-700 dark:text-slate-300 transition-colors"
          >
            {copied ? (
              <>
                <Check className="w-3.5 h-3.5 text-emerald-500" />
                <span className="text-emerald-600 dark:text-emerald-400">Copied to Clipboard!</span>
              </>
            ) : (
              <>
                <Copy className="w-3.5 h-3.5" />
                <span>Export for Appraisal / CV</span>
              </>
            )}
          </button>

          <button
            onClick={() => openQuickAdd('achievement')}
            className="inline-flex items-center space-x-1.5 px-4 py-2 text-xs font-semibold rounded-xl bg-blue-600 hover:bg-blue-700 text-white shadow-sm transition-all"
          >
            <Plus className="w-4 h-4" />
            <span>Add Achievement</span>
          </button>
        </div>
      </div>

      {/* Category Filter Pills */}
      <div className="flex items-center space-x-2 overflow-x-auto pb-1">
        <button
          onClick={() => setCategoryFilter('all')}
          className={`px-3 py-1.5 rounded-lg text-xs font-semibold whitespace-nowrap transition-colors ${
            categoryFilter === 'all'
              ? 'bg-blue-600 text-white'
              : 'bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 text-slate-600 dark:text-slate-400'
          }`}
        >
          All Categories
        </button>
        {categories.map((cat) => (
          <button
            key={cat}
            onClick={() => setCategoryFilter(cat)}
            className={`px-3 py-1.5 rounded-lg text-xs font-semibold whitespace-nowrap transition-colors ${
              categoryFilter === cat
                ? 'bg-blue-600 text-white'
                : 'bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 text-slate-600 dark:text-slate-400 hover:bg-slate-50'
            }`}
          >
            {cat}
          </button>
        ))}
      </div>

      {/* Achievements Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
        {filteredAchievements.map((ach) => {
          const project = projects.find((p) => p.id === ach.project_id);

          return (
            <div
              key={ach.id}
              className="p-5 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-sm flex flex-col justify-between space-y-4"
            >
              <div>
                <div className="flex items-center justify-between mb-2">
                  <span className="text-[10px] font-bold px-2.5 py-0.5 rounded-full bg-blue-50 dark:bg-blue-950/60 text-blue-700 dark:text-blue-300">
                    {ach.category}
                  </span>
                  <span className="text-xs text-slate-400 font-medium">
                    {ach.achievement_date}
                  </span>
                </div>

                <h3 className="text-sm font-bold text-slate-900 dark:text-white flex items-center space-x-1.5">
                  <span className="text-amber-500">⭐</span>
                  <span>{ach.title}</span>
                </h3>

                <p className="text-xs text-slate-600 dark:text-slate-400 mt-2">
                  {ach.description}
                </p>

                {/* Impact Statement */}
                <div className="mt-3 p-3 rounded-xl bg-emerald-50/50 dark:bg-emerald-950/30 border border-emerald-200/60 dark:border-emerald-900/40 text-xs text-emerald-900 dark:text-emerald-300">
                  <span className="font-bold uppercase text-[10px] tracking-wider block mb-0.5 text-emerald-700 dark:text-emerald-400">
                    Quantified Impact
                  </span>
                  <p>{ach.impact}</p>
                </div>
              </div>

              <div className="pt-3 border-t border-slate-100 dark:border-slate-800 flex items-center justify-between text-xs text-slate-500">
                <span>{project?.name || 'Cross-cutting'}</span>
                <button
                  onClick={() => {
                    if (confirm(`Delete achievement "${ach.title}"?`)) {
                      deleteAchievement(ach.id);
                    }
                  }}
                  className="p-1 text-slate-400 hover:text-red-600 rounded-lg"
                >
                  <Trash2 className="w-3.5 h-3.5" />
                </button>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
