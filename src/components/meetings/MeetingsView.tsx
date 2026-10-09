'use client';

import React, { useState } from 'react';
import { useWorkOS } from '@/context/WorkOSContext';
import { Meeting } from '@/types';
import {
  Video,
  Plus,
  Calendar,
  Clock,
  Users,
  CheckCircle2,
  ArrowRight,
  Trash2,
  CheckSquare,
} from 'lucide-react';

export default function MeetingsView() {
  const {
    meetings,
    projects,
    deleteMeeting,
    convertMeetingActionItemToTask,
    openQuickAdd,
    setActiveTab,
  } = useWorkOS();

  const today = new Date().toISOString().split('T')[0];

  const [activeTab, setActiveTabFilter] = useState<'today' | 'upcoming' | 'past'>('today');

  const filteredMeetings = meetings.filter((m) => {
    if (activeTab === 'today') return m.meeting_date === today;
    if (activeTab === 'upcoming') return m.meeting_date > today;
    if (activeTab === 'past') return m.meeting_date < today;
    return true;
  });

  return (
    <div className="space-y-6 max-w-7xl mx-auto pb-12">
      {/* Header */}
      <div className="flex flex-wrap items-center justify-between gap-4">
        <div>
          <h1 className="text-xl sm:text-2xl font-bold text-slate-900 dark:text-white tracking-tight">
            Meetings &amp; Alignments
          </h1>
          <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
            Capture agendas, log decisions, and convert action items directly into executable tasks.
          </p>
        </div>
        <button
          onClick={() => openQuickAdd('meeting')}
          className="inline-flex items-center space-x-1.5 px-4 py-2 text-xs font-semibold rounded-xl bg-blue-600 hover:bg-blue-700 text-white shadow-sm transition-all"
        >
          <Plus className="w-4 h-4" />
          <span>New Meeting</span>
        </button>
      </div>

      {/* Tabs */}
      <div className="flex items-center space-x-2 border-b border-slate-200 dark:border-slate-800 pb-2">
        {[
          { id: 'today', label: `Today's Meetings (${meetings.filter(m => m.meeting_date === today).length})` },
          { id: 'upcoming', label: `Upcoming (${meetings.filter(m => m.meeting_date > today).length})` },
          { id: 'past', label: `Past Meetings (${meetings.filter(m => m.meeting_date < today).length})` },
        ].map((tab) => (
          <button
            key={tab.id}
            onClick={() => setActiveTabFilter(tab.id as any)}
            className={`px-3 py-1.5 text-xs font-semibold rounded-lg transition-colors ${
              activeTab === tab.id
                ? 'bg-blue-600 text-white'
                : 'text-slate-600 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800'
            }`}
          >
            {tab.label}
          </button>
        ))}
      </div>

      {/* Meetings List */}
      <div className="space-y-4">
        {filteredMeetings.length === 0 ? (
          <div className="py-16 text-center bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800">
            <Video className="w-10 h-10 text-slate-300 dark:text-slate-600 mx-auto mb-2" />
            <p className="text-sm font-semibold text-slate-700 dark:text-slate-300">
              No meetings scheduled in this view
            </p>
            <p className="text-xs text-slate-400 mt-1">
              Add a meeting or check another tab.
            </p>
          </div>
        ) : (
          filteredMeetings.map((mtg) => {
            const project = projects.find((p) => p.id === mtg.project_id);

            return (
              <div
                key={mtg.id}
                className="p-5 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-sm space-y-4"
              >
                {/* Meeting Header */}
                <div className="flex flex-wrap items-start justify-between gap-2">
                  <div>
                    <div className="flex items-center space-x-2.5">
                      <h3 className="text-base font-bold text-slate-900 dark:text-white">
                        {mtg.title}
                      </h3>
                      {project && (
                        <span className="text-[11px] font-semibold px-2.5 py-0.5 rounded-full bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300">
                          {project.name}
                        </span>
                      )}
                    </div>
                    <div className="flex flex-wrap items-center space-x-4 text-xs text-slate-500 dark:text-slate-400 mt-1.5">
                      <span className="flex items-center space-x-1">
                        <Calendar className="w-3.5 h-3.5 text-slate-400" />
                        <span>{mtg.meeting_date}</span>
                      </span>
                      <span className="flex items-center space-x-1">
                        <Clock className="w-3.5 h-3.5 text-slate-400" />
                        <span>
                          {mtg.start_time} - {mtg.end_time}
                        </span>
                      </span>
                      <span className="flex items-center space-x-1">
                        <Users className="w-3.5 h-3.5 text-slate-400" />
                        <span>{mtg.participants}</span>
                      </span>
                    </div>
                  </div>

                  <button
                    onClick={() => {
                      if (confirm(`Delete meeting "${mtg.title}"?`)) {
                        deleteMeeting(mtg.id);
                      }
                    }}
                    className="p-1 text-slate-400 hover:text-red-600 rounded-lg"
                    title="Delete Meeting"
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                </div>

                {/* Agenda & Notes */}
                {(mtg.agenda || mtg.notes) && (
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-3 text-xs bg-slate-50 dark:bg-slate-800/40 p-3.5 rounded-xl border border-slate-200/60 dark:border-slate-800">
                    {mtg.agenda && (
                      <div>
                        <span className="font-bold text-slate-700 dark:text-slate-300 uppercase text-[10px] tracking-wider block mb-0.5">
                          Agenda
                        </span>
                        <p className="text-slate-600 dark:text-slate-400">
                          {mtg.agenda}
                        </p>
                      </div>
                    )}
                    {mtg.notes && (
                      <div>
                        <span className="font-bold text-slate-700 dark:text-slate-300 uppercase text-[10px] tracking-wider block mb-0.5">
                          Discussion Notes
                        </span>
                        <p className="text-slate-600 dark:text-slate-400">
                          {mtg.notes}
                        </p>
                      </div>
                    )}
                  </div>
                )}

                {/* Decisions */}
                {mtg.decisions && (
                  <div className="text-xs p-3 rounded-xl bg-blue-50/60 dark:bg-blue-950/30 border border-blue-200/60 dark:border-blue-900/40 text-blue-900 dark:text-blue-300">
                    <span className="font-bold uppercase text-[10px] tracking-wider block mb-0.5">
                      Key Decisions
                    </span>
                    <p>{mtg.decisions}</p>
                  </div>
                )}

                {/* Action Items with "Convert to Task" button (Section 15) */}
                {mtg.action_items && mtg.action_items.length > 0 && (
                  <div className="space-y-2 pt-2 border-t border-slate-100 dark:border-slate-800">
                    <span className="text-[11px] font-bold uppercase tracking-wider text-slate-500">
                      Action Items
                    </span>
                    <div className="space-y-2">
                      {mtg.action_items.map((item) => (
                        <div
                          key={item.id}
                          className="flex flex-wrap items-center justify-between gap-2 p-2.5 rounded-xl bg-slate-50 dark:bg-slate-800/50 border border-slate-200/70 dark:border-slate-800 text-xs"
                        >
                          <div className="flex items-center space-x-2">
                            <span className="w-1.5 h-1.5 rounded-full bg-blue-600" />
                            <span className="font-medium text-slate-900 dark:text-white">
                              {item.text}
                            </span>
                            {item.assigned_to && (
                              <span className="text-slate-400 text-[11px]">
                                (Assigned: {item.assigned_to})
                              </span>
                            )}
                          </div>

                          {item.converted_to_task_id ? (
                            <span className="inline-flex items-center space-x-1 text-[11px] font-semibold text-emerald-600 dark:text-emerald-400">
                              <CheckCircle2 className="w-3.5 h-3.5" />
                              <span>Converted to Task</span>
                            </span>
                          ) : (
                            <button
                              onClick={() =>
                                convertMeetingActionItemToTask(mtg.id, item.id)
                              }
                              className="px-2.5 py-1 rounded-lg bg-blue-600 hover:bg-blue-700 text-white font-semibold text-[11px] shadow-2xs transition-colors flex items-center space-x-1"
                            >
                              <CheckSquare className="w-3 h-3" />
                              <span>Convert to Task</span>
                            </button>
                          )}
                        </div>
                      ))}
                    </div>
                  </div>
                )}
              </div>
            );
          })
        )}
      </div>
    </div>
  );
}
