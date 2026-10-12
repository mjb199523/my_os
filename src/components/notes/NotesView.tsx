'use client';

import React, { useState, useEffect } from 'react';
import { useWorkOS } from '@/context/WorkOSContext';
import { Note } from '@/types';
import {
  FileText,
  Plus,
  Trash2,
  Tag,
  Save,
  Check,
  Edit3,
  X,
} from 'lucide-react';

export default function NotesView() {
  const { notes, projects, addNote, updateNote, deleteNote, openQuickAdd } = useWorkOS();

  const [selectedNoteId, setSelectedNoteId] = useState<string>(notes[0]?.id || '');
  const [isEditing, setIsEditing] = useState(false);

  const activeNote = notes.find((n) => n.id === selectedNoteId) || notes[0];

  // Editor states
  const [editTitle, setEditTitle] = useState('');
  const [editContent, setEditContent] = useState('');
  const [editProjectId, setEditProjectId] = useState('');
  const [editTags, setEditTags] = useState('');
  const [saveSuccess, setSaveSuccess] = useState(false);

  useEffect(() => {
    if (activeNote) {
      setEditTitle(activeNote.title);
      setEditContent(activeNote.content);
      setEditProjectId(activeNote.project_id || '');
      setEditTags(activeNote.tags ? activeNote.tags.join(', ') : '');
      setIsEditing(false);
    }
  }, [activeNote]);

  const handleSaveNote = async () => {
    if (!activeNote || !editTitle.trim()) return;
    await updateNote(activeNote.id, {
      title: editTitle.trim(),
      content: editContent,
      project_id: editProjectId || undefined,
      tags: editTags ? editTags.split(',').map((t) => t.trim()).filter(Boolean) : [],
    });
    setIsEditing(false);
    setSaveSuccess(true);
    setTimeout(() => setSaveSuccess(false), 2000);
  };

  const handleCreateNew = async () => {
    const id = `not_${Date.now()}`;
    await addNote({
      id,
      title: 'Untitled Note',
      content: 'Write your notes or documentation here...',
      tags: ['General'],
    });
    setSelectedNoteId(id);
    setIsEditing(true);
  };

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
          onClick={handleCreateNew}
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
            const isSelected = note.id === (activeNote?.id || selectedNoteId);
            const project = projects.find((p) => p.id === note.project_id);

            return (
              <div
                key={note.id}
                onClick={() => {
                  setSelectedNoteId(note.id);
                  setIsEditing(false);
                }}
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
              {/* Header with Edit/Save buttons */}
              <div className="flex items-start justify-between pb-4 border-b border-slate-100 dark:border-slate-800">
                {isEditing ? (
                  <div className="flex-1 mr-4 space-y-2">
                    <input
                      type="text"
                      value={editTitle}
                      onChange={(e) => setEditTitle(e.target.value)}
                      placeholder="Note Title"
                      className="w-full text-base font-bold text-slate-900 dark:text-white bg-slate-50 dark:bg-slate-800 px-3 py-1.5 rounded-lg border border-slate-200 dark:border-slate-700"
                    />
                    <div className="flex gap-2">
                      <select
                        value={editProjectId}
                        onChange={(e) => setEditProjectId(e.target.value)}
                        className="text-xs bg-slate-50 dark:bg-slate-800 px-2.5 py-1 rounded-lg border border-slate-200 dark:border-slate-700"
                      >
                        <option value="">No Project</option>
                        {projects.map((p) => (
                          <option key={p.id} value={p.id}>
                            {p.name}
                          </option>
                        ))}
                      </select>
                      <input
                        type="text"
                        value={editTags}
                        onChange={(e) => setEditTags(e.target.value)}
                        placeholder="Tags separated by commas"
                        className="flex-1 text-xs bg-slate-50 dark:bg-slate-800 px-2.5 py-1 rounded-lg border border-slate-200 dark:border-slate-700"
                      />
                    </div>
                  </div>
                ) : (
                  <div>
                    <h2 className="text-lg font-bold text-slate-900 dark:text-white">
                      {activeNote.title}
                    </h2>
                    <div className="flex items-center space-x-3 text-xs text-slate-400 mt-1">
                      <span>Updated {new Date(activeNote.updated_at).toLocaleDateString()}</span>
                      {activeNote.tags && activeNote.tags.length > 0 && (
                        <span className="flex items-center space-x-1">
                          <Tag className="w-3 h-3" />
                          <span>{activeNote.tags.join(', ')}</span>
                        </span>
                      )}
                    </div>
                  </div>
                )}

                <div className="flex items-center space-x-2">
                  {saveSuccess && (
                    <span className="text-xs text-emerald-600 font-semibold flex items-center space-x-1">
                      <Check className="w-3.5 h-3.5" />
                      <span>Saved!</span>
                    </span>
                  )}

                  {isEditing ? (
                    <>
                      <button
                        onClick={() => setIsEditing(false)}
                        className="px-3 py-1.5 text-xs font-semibold rounded-lg bg-slate-100 hover:bg-slate-200 text-slate-700 dark:bg-slate-800 dark:text-slate-300"
                      >
                        Cancel
                      </button>
                      <button
                        onClick={handleSaveNote}
                        className="px-3.5 py-1.5 text-xs font-semibold rounded-lg bg-blue-600 hover:bg-blue-700 text-white shadow-2xs flex items-center space-x-1"
                      >
                        <Save className="w-3.5 h-3.5" />
                        <span>Save</span>
                      </button>
                    </>
                  ) : (
                    <button
                      onClick={() => setIsEditing(true)}
                      className="px-3 py-1.5 text-xs font-semibold rounded-lg bg-slate-100 hover:bg-slate-200 dark:bg-slate-800 dark:hover:bg-slate-700 text-slate-700 dark:text-slate-300 flex items-center space-x-1"
                    >
                      <Edit3 className="w-3.5 h-3.5" />
                      <span>Edit</span>
                    </button>
                  )}

                  <button
                    onClick={() => {
                      if (confirm(`Delete note "${activeNote.title}"?`)) {
                        deleteNote(activeNote.id);
                      }
                    }}
                    className="p-1.5 text-slate-400 hover:text-red-600 rounded-lg hover:bg-red-50 dark:hover:bg-red-950/40"
                    title="Delete Note"
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                </div>
              </div>

              {/* Note Content */}
              {isEditing ? (
                <div>
                  <textarea
                    rows={12}
                    value={editContent}
                    onChange={(e) => setEditContent(e.target.value)}
                    placeholder="Write Markdown notes here..."
                    className="w-full text-xs font-mono bg-slate-50 dark:bg-slate-800/80 p-4 rounded-xl border border-slate-200 dark:border-slate-700 text-slate-900 dark:text-white resize-y"
                  />
                </div>
              ) : (
                <div className="text-xs leading-relaxed text-slate-800 dark:text-slate-200 font-mono whitespace-pre-wrap bg-slate-50 dark:bg-slate-800/40 p-4 rounded-xl border border-slate-200/60 dark:border-slate-800 min-h-[250px]">
                  {activeNote.content}
                </div>
              )}
            </div>
          ) : (
            <div className="text-center py-16 text-slate-400 text-xs">
              No notes available. Click &quot;New Note&quot; to create one.
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
