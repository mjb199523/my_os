'use client';

import React, { useState, useEffect, useMemo, useRef } from 'react';
import { useWorkOS } from '@/context/WorkOSContext';
import {
  MessageSquare,
  Send,
  Search,
  Filter,
  Check,
  CheckCheck,
  Shield,
  User as UserIcon,
  Megaphone,
  Clock,
  ArrowLeft,
  Plus,
  Inbox,
  AlertCircle,
  Sparkles,
  Paperclip,
  Trash2,
  RefreshCw,
} from 'lucide-react';
import { AdminMessage, Conversation, MessagePriority, MessageType } from '@/types';

export default function MessagesView() {
  const {
    user,
    isAdmin,
    users,
    conversations,
    activeConversationId,
    setActiveConversationId,
    sendMessage,
    markConversationRead,
    openComposeMessage,
    deleteAdminMessage,
  } = useWorkOS();

  const [searchQuery, setSearchQuery] = useState('');
  const [filterTab, setFilterTab] = useState<'all' | 'unread' | 'broadcast' | 'direct'>('all');
  const [replyText, setReplyText] = useState('');
  const [isSending, setIsSending] = useState(false);
  const [replyError, setReplyError] = useState<string | null>(null);

  const messagesEndRef = useRef<HTMLDivElement>(null);

  // Auto-select first conversation if none selected on desktop
  useEffect(() => {
    if (!activeConversationId && conversations.length > 0 && typeof window !== 'undefined' && window.innerWidth >= 768) {
      setActiveConversationId(conversations[0].id);
    }
  }, [activeConversationId, conversations, setActiveConversationId]);

  // Current active conversation
  const activeConversation = useMemo(() => {
    return conversations.find((c) => c.id === activeConversationId) || null;
  }, [conversations, activeConversationId]);

  // Mark active conversation read upon viewing
  useEffect(() => {
    if (activeConversationId && activeConversation && activeConversation.unread_count > 0) {
      markConversationRead(activeConversationId);
    }
  }, [activeConversationId, activeConversation, markConversationRead]);

  // Auto-scroll to bottom of thread when messages change
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [activeConversation?.messages]);

  // Filtered conversation list
  const filteredConversations = useMemo(() => {
    return conversations.filter((conv) => {
      // Tab filter
      if (filterTab === 'unread' && conv.unread_count === 0) return false;
      if (filterTab === 'broadcast' && conv.message_type !== 'broadcast' && !conv.is_broadcast) return false;
      if (filterTab === 'direct' && (conv.message_type === 'broadcast' || conv.is_broadcast)) return false;

      // Search query filter
      if (searchQuery.trim()) {
        const query = searchQuery.toLowerCase();
        const matchesTitle = conv.title.toLowerCase().includes(query);
        const matchesOther = conv.other_participant_name.toLowerCase().includes(query);
        const matchesMsg = conv.messages.some((m: AdminMessage) => m.message.toLowerCase().includes(query));
        if (!matchesTitle && !matchesOther && !matchesMsg) return false;
      }

      return true;
    });
  }, [conversations, filterTab, searchQuery]);

  // Handle sending reply
  const handleSendReply = async (e?: React.FormEvent) => {
    if (e) e.preventDefault();
    if (!activeConversation || !replyText.trim() || isSending || !user) return;

    setReplyError(null);
    setIsSending(true);

    try {
      // Determine recipient:
      let targetUserId = '';
      if (isAdmin) {
        // Admin replies to the counterparty in the thread
        if (activeConversation.other_participant?.id) {
          targetUserId = activeConversation.other_participant.id;
        } else {
          // Find first message sender who is not this admin
          const userMsg = activeConversation.messages.find((m: AdminMessage) => m.sender_id !== user.id && m.target_user_id !== 'all');
          targetUserId = userMsg?.sender_id || (activeConversation.participant_ids.find((id: string) => id !== user.id && id !== 'all') || '');
        }
      } else {
        // Standard user replies to the Admin of this thread
        const adminMsg = activeConversation.messages.find((m: AdminMessage) => {
          const author = users.find((u) => u.id === m.sender_id);
          return author?.system_role === 'Admin' || m.sender_id === 'usr_manash_001';
        });
        targetUserId = adminMsg?.sender_id || users.find((u) => u.system_role === 'Admin')?.id || '';
      }

      const res = await sendMessage({
        target_user_id: targetUserId,
        title: `Re: ${activeConversation.title}`,
        message: replyText.trim(),
        conversation_id: activeConversation.id,
        parent_id: activeConversation.last_message.id,
        message_type: 'reply',
      });

      if (res.success) {
        setReplyText('');
      } else {
        setReplyError(res.error || 'Failed to send reply.');
      }
    } catch (err: any) {
      setReplyError(err?.message || 'Error occurred while sending reply.');
    } finally {
      setIsSending(false);
    }
  };

  const formatMessageTime = (dateStr: string) => {
    const d = new Date(dateStr);
    const now = new Date();
    const isToday = d.toDateString() === now.toDateString();

    if (isToday) {
      return d.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
    }
    return `${d.toLocaleDateString([], { month: 'short', day: 'numeric' })} at ${d.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}`;
  };

  const getPriorityBadge = (p: MessagePriority) => {
    switch (p) {
      case 'Urgent':
        return <span className="text-[10px] font-bold px-1.5 py-0.2 rounded bg-rose-100 text-rose-700">Urgent</span>;
      case 'Important':
        return <span className="text-[10px] font-bold px-1.5 py-0.2 rounded bg-amber-100 text-amber-700">Important</span>;
      case 'Announcement':
        return <span className="text-[10px] font-bold px-1.5 py-0.2 rounded bg-purple-100 text-purple-700">Announcement</span>;
      default:
        return null;
    }
  };

  return (
    <div className="h-[calc(100vh-5.5rem)] flex flex-col md:flex-row bg-white dark:bg-slate-900 rounded-3xl border border-slate-200 dark:border-slate-800 shadow-sm overflow-hidden">
      {/* LEFT COLUMN: Conversation List */}
      <div
        className={`w-full md:w-80 lg:w-96 border-r border-slate-200 dark:border-slate-800 flex flex-col h-full bg-slate-50/50 dark:bg-slate-900/60 ${
          activeConversationId ? 'hidden md:flex' : 'flex'
        }`}
      >
        {/* Header & New Message Button */}
        <div className="p-4 border-b border-slate-200 dark:border-slate-800 flex items-center justify-between">
          <div className="flex items-center space-x-2">
            <div className="w-8 h-8 rounded-xl bg-indigo-600 text-white flex items-center justify-center shadow-xs">
              <MessageSquare className="w-4 h-4" />
            </div>
            <div>
              <h1 className="text-sm font-bold text-slate-900 dark:text-white">
                Messages
              </h1>
              <p className="text-[11px] text-slate-500">
                {isAdmin ? 'Admin Two-Way Command Centre' : 'Direct Messages with Administrators'}
              </p>
            </div>
          </div>

          <button
            onClick={() => openComposeMessage()}
            className="inline-flex items-center space-x-1.5 px-3 py-1.5 text-xs font-semibold rounded-xl bg-indigo-600 hover:bg-indigo-700 text-white shadow-xs transition-colors cursor-pointer"
            title={isAdmin ? 'New Broadcast or Message' : 'New Message to Admin'}
          >
            <Plus className="w-3.5 h-3.5" />
            <span>New</span>
          </button>
        </div>

        {/* Search Input */}
        <div className="p-3 border-b border-slate-200/80 dark:border-slate-800">
          <div className="relative">
            <Search className="w-4 h-4 text-slate-400 absolute left-3 top-2.5" />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Search conversations..."
              className="w-full pl-9 pr-3 py-1.5 text-xs rounded-xl bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-slate-900 dark:text-white placeholder-slate-400 focus:outline-hidden focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 transition-all"
            />
          </div>
        </div>

        {/* Filter Tabs */}
        <div className="flex items-center px-3 py-2 space-x-1 border-b border-slate-200/80 dark:border-slate-800 overflow-x-auto text-[11px] font-semibold text-slate-500">
          <button
            type="button"
            onClick={() => setFilterTab('all')}
            className={`px-2.5 py-1 rounded-lg transition-colors cursor-pointer ${
              filterTab === 'all'
                ? 'bg-indigo-600 text-white'
                : 'hover:bg-slate-200/60 dark:hover:bg-slate-800 text-slate-600 dark:text-slate-400'
            }`}
          >
            All ({conversations.length})
          </button>
          <button
            type="button"
            onClick={() => setFilterTab('unread')}
            className={`px-2.5 py-1 rounded-lg transition-colors cursor-pointer ${
              filterTab === 'unread'
                ? 'bg-indigo-600 text-white'
                : 'hover:bg-slate-200/60 dark:hover:bg-slate-800 text-slate-600 dark:text-slate-400'
            }`}
          >
            Unread
          </button>
          <button
            type="button"
            onClick={() => setFilterTab('broadcast')}
            className={`px-2.5 py-1 rounded-lg transition-colors cursor-pointer ${
              filterTab === 'broadcast'
                ? 'bg-indigo-600 text-white'
                : 'hover:bg-slate-200/60 dark:hover:bg-slate-800 text-slate-600 dark:text-slate-400'
            }`}
          >
            Broadcasts
          </button>
          <button
            type="button"
            onClick={() => setFilterTab('direct')}
            className={`px-2.5 py-1 rounded-lg transition-colors cursor-pointer ${
              filterTab === 'direct'
                ? 'bg-indigo-600 text-white'
                : 'hover:bg-slate-200/60 dark:hover:bg-slate-800 text-slate-600 dark:text-slate-400'
            }`}
          >
            Personal
          </button>
        </div>

        {/* Conversation List */}
        <div className="flex-1 overflow-y-auto divide-y divide-slate-100 dark:divide-slate-800/60">
          {filteredConversations.length === 0 ? (
            <div className="p-8 text-center space-y-2">
              <div className="w-10 h-10 rounded-full bg-slate-200/60 dark:bg-slate-800 text-slate-400 flex items-center justify-center mx-auto">
                <Inbox className="w-5 h-5" />
              </div>
              <p className="text-xs font-semibold text-slate-700 dark:text-slate-300">
                No conversations found
              </p>
              <p className="text-[11px] text-slate-400 max-w-[200px] mx-auto">
                {isAdmin
                  ? 'Click New above to dispatch an announcement or message a user.'
                  : 'Click New above to initiate a conversation with an administrator.'}
              </p>
            </div>
          ) : (
            filteredConversations.map((conv) => {
              const isSelected = conv.id === activeConversationId;
              const hasUnread = conv.unread_count > 0;

              return (
                <div
                  key={conv.id}
                  onClick={() => setActiveConversationId(conv.id)}
                  className={`p-3.5 text-left transition-colors cursor-pointer relative flex items-start gap-3 ${
                    isSelected
                      ? 'bg-indigo-50/90 dark:bg-indigo-950/40 border-l-4 border-indigo-600'
                      : hasUnread
                      ? 'bg-blue-50/40 dark:bg-blue-950/20 hover:bg-slate-100/70 dark:hover:bg-slate-800/60'
                      : 'hover:bg-slate-100/50 dark:hover:bg-slate-800/40'
                  }`}
                >
                  {/* Left Avatar Icon */}
                  <div className="mt-0.5 shrink-0">
                    {conv.is_broadcast || conv.message_type === 'broadcast' ? (
                      <div className="w-9 h-9 rounded-xl bg-purple-100 dark:bg-purple-900/40 text-purple-600 flex items-center justify-center">
                        <Megaphone className="w-4 h-4" />
                      </div>
                    ) : (
                      <div className="w-9 h-9 rounded-xl bg-indigo-100 dark:bg-indigo-900/40 text-indigo-600 flex items-center justify-center font-bold text-xs uppercase">
                        {conv.other_participant_name.charAt(0) || 'U'}
                      </div>
                    )}
                  </div>

                  {/* Body Content */}
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center justify-between mb-0.5">
                      <span className={`text-xs truncate ${hasUnread ? 'font-bold text-slate-900 dark:text-white' : 'font-semibold text-slate-800 dark:text-slate-200'}`}>
                        {conv.other_participant_name}
                      </span>
                      <span className="text-[10px] text-slate-400 shrink-0">
                        {formatMessageTime(conv.updated_at)}
                      </span>
                    </div>

                    <div className="flex items-center gap-1.5 mb-1">
                      {conv.is_broadcast ? (
                        <span className="text-[9px] font-bold px-1.5 py-0.2 rounded bg-purple-100 text-purple-700">
                          📢 Broadcast
                        </span>
                      ) : conv.messages.length > 1 ? (
                        <span className="text-[9px] font-bold px-1.5 py-0.2 rounded bg-emerald-100 text-emerald-700">
                          💬 {conv.messages.length} msgs
                        </span>
                      ) : (
                        <span className="text-[9px] font-bold px-1.5 py-0.2 rounded bg-blue-100 text-blue-700">
                          🔒 Direct
                        </span>
                      )}

                      {getPriorityBadge(conv.priority)}
                    </div>

                    <p className="text-xs font-medium text-slate-700 dark:text-slate-300 truncate mb-0.5">
                      {conv.title}
                    </p>

                    <p className="text-[11px] text-slate-500 dark:text-slate-400 truncate">
                      {conv.last_message.sender_id === user?.id ? 'You: ' : ''}
                      {conv.last_message.message}
                    </p>
                  </div>

                  {/* Unread Indicator */}
                  {hasUnread && (
                    <span className="w-2.5 h-2.5 rounded-full bg-indigo-600 mt-2 shrink-0 animate-pulse" />
                  )}
                </div>
              );
            })
          )}
        </div>
      </div>

      {/* RIGHT COLUMN: Active Conversation Thread */}
      <div
        className={`flex-1 flex flex-col h-full bg-white dark:bg-slate-900 ${
          !activeConversationId ? 'hidden md:flex' : 'flex'
        }`}
      >
        {activeConversation ? (
          <>
            {/* Thread Header */}
            <div className="px-5 py-3.5 border-b border-slate-200 dark:border-slate-800 flex items-center justify-between bg-slate-50/40 dark:bg-slate-900/60">
              <div className="flex items-center space-x-3 min-w-0">
                {/* Mobile Back Button */}
                <button
                  type="button"
                  onClick={() => setActiveConversationId(null)}
                  className="md:hidden p-1.5 rounded-lg text-slate-500 hover:bg-slate-200/60 dark:hover:bg-slate-800 cursor-pointer"
                >
                  <ArrowLeft className="w-4 h-4" />
                </button>

                <div className="w-9 h-9 rounded-xl bg-indigo-100 dark:bg-indigo-900/40 text-indigo-600 flex items-center justify-center font-bold text-sm uppercase shrink-0">
                  {activeConversation.is_broadcast ? <Megaphone className="w-4 h-4" /> : activeConversation.other_participant_name.charAt(0)}
                </div>

                <div className="min-w-0">
                  <div className="flex items-center space-x-2">
                    <h2 className="text-xs sm:text-sm font-bold text-slate-900 dark:text-white truncate">
                      {activeConversation.title}
                    </h2>
                    {getPriorityBadge(activeConversation.priority)}
                  </div>
                  <p className="text-[11px] text-slate-500 truncate">
                    With: <span className="font-semibold text-slate-700 dark:text-slate-300">{activeConversation.other_participant_name}</span>
                    {activeConversation.other_participant?.role ? ` (${activeConversation.other_participant.role})` : ''}
                  </p>
                </div>
              </div>

              {/* Admin Actions */}
              {isAdmin && (
                <div className="flex items-center space-x-2 shrink-0">
                  <button
                    onClick={() => {
                      if (confirm('Delete this conversation thread?')) {
                        deleteAdminMessage(activeConversation.id);
                        setActiveConversationId(null);
                      }
                    }}
                    className="p-1.5 rounded-lg text-rose-500 hover:bg-rose-50 dark:hover:bg-rose-950/40 transition-colors cursor-pointer"
                    title="Delete Conversation"
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                </div>
              )}
            </div>

            {/* Root Broadcast Context Banner (if this thread is a reply to a broadcast) */}
            {activeConversation.messages.length > 0 && activeConversation.messages[0].target_user_id === 'all' && (
              <div className="px-5 py-2.5 bg-purple-50/70 dark:bg-purple-950/30 border-b border-purple-100 dark:border-purple-900/40 flex items-start space-x-2 text-xs text-purple-900 dark:text-purple-200">
                <Megaphone className="w-4 h-4 shrink-0 text-purple-600 mt-0.5" />
                <div className="min-w-0">
                  <p className="font-semibold text-[11px]">
                    Announcement Thread
                  </p>
                  <p className="text-[11px] text-purple-700 dark:text-purple-300 truncate">
                    {activeConversation.messages[0].title}: {activeConversation.messages[0].message}
                  </p>
                </div>
              </div>
            )}

            {/* Message Thread Feed */}
            <div className="flex-1 overflow-y-auto p-4 sm:p-6 space-y-4">
              {activeConversation.messages.map((msg: AdminMessage, idx: number) => {
                const isMe = msg.sender_id === user?.id;
                const isBroadcastRoot = msg.target_user_id === 'all';

                return (
                  <div
                    key={msg.id || idx}
                    className={`flex flex-col ${isMe ? 'items-end' : 'items-start'}`}
                  >
                    {/* Sender Label */}
                    <div className="flex items-center space-x-1.5 mb-1 text-[11px] text-slate-400">
                      <span className="font-semibold text-slate-700 dark:text-slate-300">
                        {isMe ? 'You' : msg.sender_name}
                      </span>
                      <span>•</span>
                      <span>{formatMessageTime(msg.created_at)}</span>
                    </div>

                    {/* Speech Bubble */}
                    <div
                      className={`max-w-md sm:max-w-lg lg:max-w-xl p-3.5 rounded-2xl text-xs sm:text-sm leading-relaxed whitespace-pre-wrap shadow-xs ${
                        isMe
                          ? 'bg-indigo-600 text-white rounded-br-xs'
                          : isBroadcastRoot
                          ? 'bg-purple-50 dark:bg-purple-950/40 border border-purple-200 dark:border-purple-900/60 text-slate-900 dark:text-white rounded-bl-xs'
                          : 'bg-slate-100 dark:bg-slate-800 text-slate-900 dark:text-white rounded-bl-xs'
                      }`}
                    >
                      {/* Priority Tag inside message if present */}
                      {msg.priority && msg.priority !== 'Normal' && (
                        <div className="mb-1">
                          <span className={`text-[10px] font-bold px-1.5 py-0.2 rounded ${
                            isMe ? 'bg-indigo-700 text-indigo-100' : 'bg-amber-100 text-amber-800'
                          }`}>
                            {msg.priority}
                          </span>
                        </div>
                      )}

                      {msg.message}
                    </div>

                    {/* Read receipt */}
                    {isMe && (
                      <div className="flex items-center space-x-1 mt-1 text-[10px] text-slate-400">
                        {msg.read_by.length > 1 ? (
                          <>
                            <CheckCheck className="w-3 h-3 text-indigo-500" />
                            <span>Seen by recipient</span>
                          </>
                        ) : (
                          <>
                            <Check className="w-3 h-3 text-slate-400" />
                            <span>Sent</span>
                          </>
                        )}
                      </div>
                    )}
                  </div>
                );
              })}
              <div ref={messagesEndRef} />
            </div>

            {/* Reply Input Bar */}
            <div className="p-3 sm:p-4 border-t border-slate-200 dark:border-slate-800 bg-slate-50/60 dark:bg-slate-900/60">
              {replyError && (
                <div className="mb-2 p-2 rounded-xl bg-rose-50 text-rose-700 border border-rose-200 text-xs flex items-center space-x-1.5">
                  <AlertCircle className="w-4 h-4 shrink-0" />
                  <span>{replyError}</span>
                </div>
              )}

              <form onSubmit={handleSendReply} className="flex items-end space-x-2">
                <div className="flex-1 relative">
                  <textarea
                    rows={2}
                    value={replyText}
                    onChange={(e) => setReplyText(e.target.value)}
                    onKeyDown={(e) => {
                      if (e.key === 'Enter' && (e.metaKey || e.ctrlKey)) {
                        e.preventDefault();
                        handleSendReply();
                      }
                    }}
                    placeholder={`Reply to ${activeConversation.other_participant_name}... (Press Ctrl+Enter to send)`}
                    className="w-full p-2.5 text-xs sm:text-sm rounded-xl bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-slate-900 dark:text-white placeholder-slate-400 focus:outline-hidden focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 transition-all resize-none font-medium"
                  />
                </div>

                <button
                  type="submit"
                  disabled={!replyText.trim() || isSending}
                  className="px-4 py-2.5 rounded-xl bg-indigo-600 hover:bg-indigo-700 text-white font-semibold text-xs shadow-xs transition-all disabled:opacity-50 disabled:cursor-not-allowed flex items-center space-x-1.5 shrink-0 cursor-pointer h-10"
                >
                  <Send className="w-3.5 h-3.5" />
                  <span>{isSending ? 'Sending...' : 'Reply'}</span>
                </button>
              </form>

              <div className="mt-1.5 flex items-center justify-between text-[11px] text-slate-400">
                <span className="flex items-center gap-1">
                  <Shield className="w-3 h-3 text-indigo-500" />
                  <span>Strict role-based privacy active. Replies are never visible to other users.</span>
                </span>
                <span className="hidden sm:inline">Ctrl + Enter to send</span>
              </div>
            </div>
          </>
        ) : (
          /* Empty Thread Selection State */
          <div className="flex-1 flex flex-col items-center justify-center p-8 text-center space-y-3">
            <div className="w-16 h-16 rounded-3xl bg-indigo-50 dark:bg-indigo-950/40 text-indigo-600 flex items-center justify-center shadow-xs">
              <MessageSquare className="w-8 h-8" />
            </div>
            <div>
              <h3 className="text-sm font-bold text-slate-900 dark:text-white">
                Select a conversation
              </h3>
              <p className="text-xs text-slate-500 max-w-sm mt-1">
                Choose a conversation from the left to read history, reply, or click New to start a discussion.
              </p>
            </div>
            <button
              onClick={() => openComposeMessage()}
              className="px-4 py-2 rounded-xl bg-indigo-600 hover:bg-indigo-700 text-white font-semibold text-xs flex items-center space-x-1.5 transition-colors cursor-pointer"
            >
              <Plus className="w-4 h-4" />
              <span>{isAdmin ? 'Start New Broadcast or Message' : 'Message an Administrator'}</span>
            </button>
          </div>
        )}
      </div>
    </div>
  );
}
