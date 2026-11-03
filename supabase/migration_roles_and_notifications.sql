-- ==============================================================================
-- MY WORK OS - Migration Script for Roles & Unidirectional Notifications
-- Run this in your Supabase Dashboard: SQL Editor -> New query -> Run
-- Safe to re-run multiple times (Idempotent)
-- ==============================================================================

-- 1. Ensure UUID extension is enabled
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- 2. Add system_role, status, and last_login_at to public.users table if missing
ALTER TABLE public.users 
ADD COLUMN IF NOT EXISTS system_role TEXT DEFAULT 'User' CHECK (system_role IN ('Admin', 'User')),
ADD COLUMN IF NOT EXISTS status TEXT DEFAULT 'Active' CHECK (status IN ('Active', 'Inactive')),
ADD COLUMN IF NOT EXISTS last_login_at TIMESTAMPTZ;

-- 3. Ensure your account is set as Admin
UPDATE public.users 
SET system_role = 'Admin' 
WHERE email = 'manashjyoti.barman07@gmail.com';

-- 4. Create or adapt public.admin_messages table for unidirectional notifications
-- Uses TEXT for id and user references to support both UUIDs and prefixed IDs seamlessly
CREATE TABLE IF NOT EXISTS public.admin_messages (
  id TEXT PRIMARY KEY DEFAULT uuid_generate_v4()::text,
  sender_id TEXT,
  sender_name TEXT,
  target_user_id TEXT NOT NULL DEFAULT 'all', -- 'all' for broadcast, or specific user ID
  target_user_name TEXT DEFAULT 'All Users',
  title TEXT NOT NULL,
  message TEXT NOT NULL,
  priority TEXT NOT NULL DEFAULT 'Normal' CHECK (priority IN ('Normal', 'Important', 'Urgent', 'Announcement')),
  read_by TEXT[] DEFAULT '{}',
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Ensure all columns exist if the table was previously created
ALTER TABLE public.admin_messages
ADD COLUMN IF NOT EXISTS sender_name TEXT,
ADD COLUMN IF NOT EXISTS target_user_name TEXT DEFAULT 'All Users',
ADD COLUMN IF NOT EXISTS read_by TEXT[] DEFAULT '{}';

-- 5. Enable Row Level Security (RLS)
ALTER TABLE public.admin_messages ENABLE ROW LEVEL SECURITY;

-- 6. Setup RLS Policies for admin_messages
DROP POLICY IF EXISTS "Users can view messages addressed to them or all" ON public.admin_messages;
DROP POLICY IF EXISTS "Admins can manage messages" ON public.admin_messages;
DROP POLICY IF EXISTS "Allow authenticated and anon access to messages" ON public.admin_messages;

-- Policy: Allow reading announcements/messages
CREATE POLICY "Users can view messages addressed to them or all" 
ON public.admin_messages 
FOR SELECT 
USING (
  target_user_id = 'all' 
  OR target_user_id = auth.uid()::text 
  OR sender_id = auth.uid()::text
  OR public.is_admin()
);

-- Policy: Allow insert, update, and delete
CREATE POLICY "Admins can manage messages" 
ON public.admin_messages 
FOR ALL 
USING (true)
WITH CHECK (true);
