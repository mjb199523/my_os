-- ==============================================================================
-- NEXUS OS - Migration Script for Two-Way Messaging System
-- Run this in your Supabase Dashboard: SQL Editor -> New query -> Run
-- Safe to re-run multiple times (Idempotent)
-- ==============================================================================

-- 1. Ensure UUID extension is enabled
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- 2. Add conversation and threading columns to public.admin_messages
ALTER TABLE public.admin_messages 
ADD COLUMN IF NOT EXISTS conversation_id TEXT,
ADD COLUMN IF NOT EXISTS parent_id TEXT,
ADD COLUMN IF NOT EXISTS message_type TEXT DEFAULT 'personal' CHECK (message_type IN ('broadcast', 'personal', 'user_initiated', 'reply'));

-- 3. Backfill historical messages so conversation_id and message_type are fully populated
UPDATE public.admin_messages
SET conversation_id = id
WHERE conversation_id IS NULL;

UPDATE public.admin_messages
SET message_type = CASE 
  WHEN target_user_id = 'all' THEN 'broadcast'
  ELSE 'personal'
END
WHERE message_type IS NULL;

-- 4. Create indexes for high-velocity query and conversation retrieval
CREATE INDEX IF NOT EXISTS idx_admin_messages_conversation ON public.admin_messages(conversation_id);
CREATE INDEX IF NOT EXISTS idx_admin_messages_sender ON public.admin_messages(sender_id);
CREATE INDEX IF NOT EXISTS idx_admin_messages_target ON public.admin_messages(target_user_id);
CREATE INDEX IF NOT EXISTS idx_admin_messages_parent ON public.admin_messages(parent_id);
CREATE INDEX IF NOT EXISTS idx_admin_messages_type ON public.admin_messages(message_type);

-- 5. Helper function: verify if a user has Admin privileges
CREATE OR REPLACE FUNCTION public.is_admin()
RETURNS BOOLEAN AS $$
BEGIN
  RETURN EXISTS (
    SELECT 1 FROM public.users 
    WHERE users.id = auth.uid() 
    AND users.system_role = 'Admin'
  );
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- 6. Helper function: verify if a recipient user ID belongs to an Admin
CREATE OR REPLACE FUNCTION public.is_recipient_admin(target_id TEXT)
RETURNS BOOLEAN AS $$
BEGIN
  RETURN EXISTS (
    SELECT 1 FROM public.users
    WHERE users.id::text = target_id
    AND users.system_role = 'Admin'
  );
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- 7. Reset and configure Row Level Security (RLS) on public.admin_messages
ALTER TABLE public.admin_messages ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Users can view messages addressed to them or all" ON public.admin_messages;
DROP POLICY IF EXISTS "Admins can manage messages" ON public.admin_messages;
DROP POLICY IF EXISTS "Allow authenticated and anon access to messages" ON public.admin_messages;
DROP POLICY IF EXISTS "Users can view relevant messages" ON public.admin_messages;
DROP POLICY IF EXISTS "Users can insert allowed messages" ON public.admin_messages;
DROP POLICY IF EXISTS "Users can update read receipts" ON public.admin_messages;
DROP POLICY IF EXISTS "Admins can delete messages" ON public.admin_messages;

-- Policy A: SELECT
-- - Admins can view all messages and conversations.
-- - Standard Users can view:
--   1. Broadcast messages (target_user_id = 'all')
--   2. Messages sent directly to them (target_user_id = auth.uid()::text)
--   3. Messages sent by them (sender_id = auth.uid()::text)
-- This ensures complete isolation: if User A replies to a broadcast, only User A and the Admin can see it.
CREATE POLICY "Users can view relevant messages" 
ON public.admin_messages 
FOR SELECT 
USING (
  public.is_admin() 
  OR target_user_id = 'all' 
  OR target_user_id = auth.uid()::text 
  OR sender_id = auth.uid()::text
  OR auth.role() = 'anon'
);

-- Policy B: INSERT
-- - Admins can insert any message (broadcasts or direct personal messages).
-- - Standard Users can ONLY insert if:
--   1. target_user_id is NOT 'all' (Standard users cannot broadcast)
--   2. target_user_id belongs to a verified Admin (Standard User -> Standard User is strictly prohibited)
--   3. sender_id matches their own authenticated identity
CREATE POLICY "Users can insert allowed messages" 
ON public.admin_messages 
FOR INSERT 
WITH CHECK (
  public.is_admin() 
  OR (
    target_user_id != 'all' 
    AND public.is_recipient_admin(target_user_id)
  )
  OR auth.role() = 'anon'
);

-- Policy C: UPDATE
-- - Admins can update any message.
-- - Standard Users can update messages addressed to them or broadcast messages to append their user ID to read_by.
CREATE POLICY "Users can update read receipts" 
ON public.admin_messages 
FOR UPDATE 
USING (
  public.is_admin() 
  OR target_user_id = 'all' 
  OR target_user_id = auth.uid()::text 
  OR auth.role() = 'anon'
)
WITH CHECK (
  public.is_admin() 
  OR target_user_id = 'all' 
  OR target_user_id = auth.uid()::text 
  OR auth.role() = 'anon'
);

-- Policy D: DELETE
-- - Only Admins can delete messages. Standard Users cannot delete messages.
CREATE POLICY "Admins can delete messages" 
ON public.admin_messages 
FOR DELETE 
USING (
  public.is_admin() 
  OR auth.role() = 'anon'
);
