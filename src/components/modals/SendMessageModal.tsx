'use client';

import React, { useState, useEffect } from 'react';
import { useWorkOS } from '@/context/WorkOSContext';
import {
  X,
  Send,
  Bell,
  Users,
  User as UserIcon,
  AlertCircle,
  Megaphone,
  CheckCircle2,
  Shield,
} from 'lucide-react';
import { MessagePriority } from '@/types';

export default function SendMessageModal() {
  const {
    isComposeMessageOpen,
    closeComposeMessage,
    composeTargetUserId,
    users,
    user: currentUser,
    isAdmin,
    sendAdminMessage,
  } = useWorkOS();

  const [targetUserId, setTargetUserId] = useState<'all' | string>('all');
  const [title, setTitle] = useState('');
  const [message, setMessage] = useState('');
  const [priority, setPriority] = useState<MessagePriority>('Normal');
  const [error, setError] = useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [successMsg, setSuccessMsg] = useState(false);

  useEffect(() => {
    if (isComposeMessageOpen) {
      setTargetUserId(composeTargetUserId || 'all');
      setTitle('');
      setMessage('');
      setPriority('Normal');
      setError(null);
      setSuccessMsg(false);
    }
  }, [isComposeMessageOpen, composeTargetUserId]);

  if (!isComposeMessageOpen || !isAdmin) return null;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setIsSubmitting(true);

    try {
      const res = await sendAdminMessage({
        target_user_id: targetUserId,
        title: title.trim(),
        message: message.trim(),
        priority,
      });

      if (res.success) {
        setSuccessMsg(true);
        setTimeout(() => {
          closeComposeMessage();
        }, 800);
      } else {
        setError(res.error || 'Failed to send notification.');
      }
    } catch (err: any) {
      setError(err?.message || 'An error occurred while sending the message.');
    } finally {
      setIsSubmitting(false);
    }
  };

  const priorityOptions: { value: MessagePriority; label: string; color: string }[] = [
    { value: 'Normal', label: 'Standard Note', color: 'border-blue-500 text-blue-700 bg-blue-50/60 dark:bg-blue-950/40 dark:text-blue-300' },
    { value: 'Announcement', label: 'Announcement', color: 'border-purple-500 text-purple-700 bg-purple-50/60 dark:bg-purple-950/40 dark:text-purple-300' },
    { value: 'Important', label: 'Important', color: 'border-amber-500 text-amber-700 bg-amber-50/60 dark:bg-amber-950/40 dark:text-amber-300' },
    { value: 'Urgent', label: 'Urgent Alert', color: 'border-rose-500 text-rose-700 bg-rose-50/60 dark:bg-rose-950/40 dark:text-rose-300' },
  ];

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-2xs">
      <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-3xl shadow-2xl w-full max-w-lg overflow-hidden animate-in fade-in zoom-in-95 duration-150">
        {/* Header */}
        <div className="px-6 py-4 border-b border-slate-100 dark:border-slate-800 flex items-center justify-between">
          <div className="flex items-center space-x-2.5">
            <div className="w-9 h-9 rounded-xl bg-indigo-100 dark:bg-indigo-900/40 text-indigo-600 dark:text-indigo-400 flex items-center justify-center">
              <Megaphone className="w-5 h-5" />
            </div>
            <div>
              <div className="flex items-center space-x-2">
                <h2 className="text-base font-bold text-slate-900 dark:text-white">
                  Send User Notification
                </h2>
                <span className="text-[10px] font-extrabold uppercase px-1.5 py-0.2 rounded-full bg-indigo-100 text-indigo-700 dark:bg-indigo-900 dark:text-indigo-300">
                  Admin Only
                </span>
              </div>
              <p className="text-xs text-slate-500 dark:text-slate-400">
                Direct unidirectional message sent to a user or broadcast to all
              </p>
            </div>
          </div>
          <button
            onClick={closeComposeMessage}
            className="p-1.5 rounded-lg text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Error or Success Alert */}
        {error && (
          <div className="mx-6 mt-4 p-3 rounded-xl bg-rose-50 dark:bg-rose-950/40 border border-rose-200 dark:border-rose-900/60 flex items-start space-x-2 text-rose-700 dark:text-rose-300 text-xs">
            <AlertCircle className="w-4 h-4 shrink-0 mt-0.5" />
            <span>{error}</span>
          </div>
        )}

        {successMsg && (
          <div className="mx-6 mt-4 p-3 rounded-xl bg-emerald-50 dark:bg-emerald-950/40 border border-emerald-200 dark:border-emerald-900/60 flex items-center space-x-2 text-emerald-700 dark:text-emerald-300 text-xs">
            <CheckCircle2 className="w-4 h-4 shrink-0 text-emerald-500" />
            <span className="font-semibold">Notification dispatched successfully!</span>
          </div>
        )}

        {/* Form */}
        <form onSubmit={handleSubmit} className="p-6 space-y-4">
          {/* Target Recipient Selector */}
          <div>
            <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1.5">
              Select Recipient <span className="text-rose-500">*</span>
            </label>
            <select
              value={targetUserId}
              onChange={(e) => setTargetUserId(e.target.value)}
              className="w-full px-3 py-2 text-xs sm:text-sm rounded-xl bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-slate-900 dark:text-white focus:outline-hidden focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 transition-all font-medium"
            >
              <option value="all">📢 Broadcast to All Portal Users</option>
              <optgroup label="Individual Users">
                {users.map((u) => (
                  <option key={u.id} value={u.id}>
                    👤 {u.name} ({u.email}) - {u.system_role}
                  </option>
                ))}
              </optgroup>
            </select>
          </div>

          {/* Priority Level */}
          <div>
            <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1.5">
              Notification Category / Priority
            </label>
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
              {priorityOptions.map((opt) => (
                <button
                  key={opt.value}
                  type="button"
                  onClick={() => setPriority(opt.value)}
                  className={`py-1.5 px-2.5 rounded-xl border text-xs font-semibold transition-all text-center ${
                    priority === opt.value
                      ? `${opt.color} ring-2 ring-indigo-500/20 shadow-2xs`
                      : 'border-slate-200 dark:border-slate-800 bg-slate-50/50 dark:bg-slate-800/40 text-slate-600 dark:text-slate-400 hover:border-slate-300'
                  }`}
                >
                  {opt.label}
                </button>
              ))}
            </div>
          </div>

          {/* Title */}
          <div>
            <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1.5">
              Message Subject / Title <span className="text-rose-500">*</span>
            </label>
            <input
              type="text"
              required
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              placeholder="e.g. Sprint Planning Schedule Update"
              className="w-full px-3.5 py-2 text-xs sm:text-sm rounded-xl bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-slate-900 dark:text-white placeholder-slate-400 focus:outline-hidden focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 transition-all font-medium"
            />
          </div>

          {/* Message Body */}
          <div>
            <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1.5">
              Message Content <span className="text-rose-500">*</span>
            </label>
            <textarea
              required
              rows={4}
              value={message}
              onChange={(e) => setMessage(e.target.value)}
              placeholder="Type your message to the recipient. This will immediately show up in their notification centre bell icon..."
              className="w-full p-3 text-xs sm:text-sm rounded-xl bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-slate-900 dark:text-white placeholder-slate-400 focus:outline-hidden focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 transition-all font-medium resize-none"
            />
          </div>

          {/* Footer Actions */}
          <div className="pt-2 border-t border-slate-100 dark:border-slate-800 flex items-center justify-end space-x-2">
            <button
              type="button"
              onClick={closeComposeMessage}
              className="px-4 py-2 text-xs font-semibold rounded-xl text-slate-600 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={isSubmitting || successMsg}
              className="px-5 py-2 text-xs font-semibold rounded-xl bg-indigo-600 hover:bg-indigo-700 text-white shadow-sm transition-all disabled:opacity-70 flex items-center space-x-1.5 cursor-pointer"
            >
              <Send className="w-3.5 h-3.5" />
              <span>{isSubmitting ? 'Sending...' : 'Send Notification'}</span>
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}