'use client';

import React, { useState } from 'react';
import { useWorkOS } from '@/context/WorkOSContext';
import { Note } from '@/types';
import { FileText, Plus, Trash2, Tag, Calendar, FolderKanban } from 'lucide-react';

export default function NotesView() {
  const { notes, projects, deleteNote, openQuickAdd } = useWorkOS();

  const [selectedNoteId, setSelectedNoteId] = useState<string>(notes[0]?.id || '');

  const activeNote = notes.find((n) => n.id === selectedNoteId) || notes[0];

  return (
    <div className="space-y-6 max-w-7xl mx-auto pb-12">
      {/* Header */}
      <div className="flex flex-wrap items-center justify-between gap-4">
        <div>
          <h1 className="text-xl sm:text-2xl font-bold text-slate-900 dark:text-white tracking-tight">
            Notes &amp; Knowledge Base
          </h1>
          <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
            Architecture decision records, deployment checklists, and meeting talking points.
          </p>
        </div>
        <button
          onClick={() => openQuickAdd('note')}
          className="inline-flex items-center space-x-1.5 px-4 py-2 text-xs font-semibold rounded-xl bg-blue-600 hover:bg-blue-700 text-white shadow-sm transition-all"
        >
          <Plus className="w-4 h-4" />
          <span>New Note</span>
        </button>
      </div>

      {/* 2-Column Notes Layout */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {/* Left Column: Notes List */}
        <div className="space-y-3">
          {notes.map((note) => {
            const isSelected = note.id === selectedNoteId;
            const project = projects.find((p) => p.id === note.project_id);

            return (
              <div
                key={note.id}
                onClick={() => setSelectedNoteId(note.id)}
                className={`cursor-pointer p-4 rounded-xl border transition-all ${
                  isSelected
                    ? 'bg-blue-50/60 dark:bg-blue-950/40 border-blue-600 dark:border-blue-500 shadow-2xs'
                    : 'bg-white dark:bg-slate-900 border-slate-200 dark:border-slate-800 hover:border-slate-300'
                }`}
              >
                <h3 className="text-xs font-bold text-slate-900 dark:text-white truncate">
                  {note.title}
                </h3>
                <p className="text-[11px] text-slate-500 dark:text-slate-400 mt-1 line-clamp-2">
                  {note.content.replace(/[#*`]/g, '')}
                </p>
                <div className="flex items-center space-x-2 mt-2 text-[10px] text-slate-400">
                  {project && <span>{project.name}</span>}
                  {note.tags && note.tags.length > 0 && (
                    <span>• {note.tags.join(', ')}</span>
                  )}
                </div>
              </div>
            );
          })}
        </div>

        {/* Right Column: Note Reader/Editor */}
        <div className="md:col-span-2 bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-sm p-6">
          {activeNote ? (
            <div className="space-y-4">
              <div className="flex items-start justify-between pb-4 border-b border-slate-100 dark:border-slate-800">
                <div>
                  <h2 className="text-lg font-bold text-slate-900 dark:text-white">
                    {activeNote.title}
                  </h2>
                  <div className="flex items-center space-x-3 text-xs text-slate-400 mt-1">
                    <span>Last updated {new Date(activeNote.updated_at).toLocaleDateString()}</span>
                    {activeNote.tags && activeNote.tags.length > 0 && (
                      <span className="flex items-center space-x-1">
                        <Tag className="w-3 h-3" />
                        <span>{activeNote.tags.join(', ')}</span>
                      </span>
                    )}
                  </div>
                </div>

                <button
                  onClick={() => {
                    if (confirm(`Delete note "${activeNote.title}"?`)) {
                      deleteNote(activeNote.id);
                    }
                  }}
                  className="p-1.5 text-slate-400 hover:text-red-600 rounded-lg hover:bg-red-50"
                  title="Delete Note"
                >
                  <Trash2 className="w-4 h-4" />
                </button>
              </div>

              {/* Markdown Content Display */}
              <div className="text-xs leading-relaxed text-slate-800 dark:text-slate-200 font-mono whitespace-pre-wrap bg-slate-50 dark:bg-slate-800/40 p-4 rounded-xl border border-slate-200/60 dark:border-slate-800">
                {activeNote.content}
              </div>
            </div>
          ) : (
            <div className="text-center py-16 text-slate-400 text-xs">
              Select or create a note to view.
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
