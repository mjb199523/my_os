-- ==============================================================================
-- MY WORK OS - Migration Script for Role-Based Data Isolation
-- Admins can view/add/update/delete EVERYONE'S data
-- Regular Users can view/add/update/delete ONLY their OWN data
-- Safe to re-run multiple times (Idempotent)
-- ==============================================================================

-- Helper function to check if current authenticated user is an Admin
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

-- 1. USERS: Admins can manage all users, users can only manage their own profile
DROP POLICY IF EXISTS "Users can manage own record" ON public.users;
DROP POLICY IF EXISTS "Admins manage all, users manage own profile" ON public.users;

CREATE POLICY "Admins manage all, users manage own profile" 
ON public.users 
FOR ALL 
USING (
  auth.uid() = id 
  OR public.is_admin() 
  OR auth.role() = 'anon'
)
WITH CHECK (
  auth.uid() = id 
  OR public.is_admin() 
  OR auth.role() = 'anon'
);

-- 2. PROJECTS: Admins manage all, users manage own
DROP POLICY IF EXISTS "Users can manage own projects" ON public.projects;
DROP POLICY IF EXISTS "Admins manage all projects, users manage own" ON public.projects;

CREATE POLICY "Admins manage all projects, users manage own" 
ON public.projects 
FOR ALL 
USING (
  auth.uid() = user_id 
  OR public.is_admin() 
  OR auth.role() = 'anon'
)
WITH CHECK (
  auth.uid() = user_id 
  OR public.is_admin() 
  OR auth.role() = 'anon'
);

-- 3. TASKS: Admins manage all, users manage own
DROP POLICY IF EXISTS "Users can manage own tasks" ON public.tasks;
DROP POLICY IF EXISTS "Admins manage all tasks, users manage own" ON public.tasks;

CREATE POLICY "Admins manage all tasks, users manage own" 
ON public.tasks 
FOR ALL 
USING (
  auth.uid() = user_id 
  OR public.is_admin() 
  OR auth.role() = 'anon'
)
WITH CHECK (
  auth.uid() = user_id 
  OR public.is_admin() 
  OR auth.role() = 'anon'
);

-- 4. TASK UPDATES: Admins manage all, users manage own
DROP POLICY IF EXISTS "Users can manage own task updates" ON public.task_updates;
DROP POLICY IF EXISTS "Admins manage all task updates, users manage own" ON public.task_updates;

CREATE POLICY "Admins manage all task updates, users manage own" 
ON public.task_updates 
FOR ALL 
USING (
  auth.uid() = user_id 
  OR public.is_admin() 
  OR auth.role() = 'anon'
)
WITH CHECK (
  auth.uid() = user_id 
  OR public.is_admin() 
  OR auth.role() = 'anon'
);

-- 5. FOLLOWUPS: Admins manage all, users manage own
DROP POLICY IF EXISTS "Users can manage own followups" ON public.followups;
DROP POLICY IF EXISTS "Admins manage all followups, users manage own" ON public.followups;

CREATE POLICY "Admins manage all followups, users manage own" 
ON public.followups 
FOR ALL 
USING (
  auth.uid() = user_id 
  OR public.is_admin() 
  OR auth.role() = 'anon'
)
WITH CHECK (
  auth.uid() = user_id 
  OR public.is_admin() 
  OR auth.role() = 'anon'
);

-- 6. MEETINGS: Admins manage all, users manage own
DROP POLICY IF EXISTS "Users can manage own meetings" ON public.meetings;
DROP POLICY IF EXISTS "Admins manage all meetings, users manage own" ON public.meetings;

CREATE POLICY "Admins manage all meetings, users manage own" 
ON public.meetings 
FOR ALL 
USING (
  auth.uid() = user_id 
  OR public.is_admin() 
  OR auth.role() = 'anon'
)
WITH CHECK (
  auth.uid() = user_id 
  OR public.is_admin() 
  OR auth.role() = 'anon'
);

-- 7. ISSUES: Admins manage all, users manage own
DROP POLICY IF EXISTS "Users can manage own issues" ON public.issues;
DROP POLICY IF EXISTS "Admins manage all issues, users manage own" ON public.issues;

CREATE POLICY "Admins manage all issues, users manage own" 
ON public.issues 
FOR ALL 
USING (
  auth.uid() = user_id 
  OR public.is_admin() 
  OR auth.role() = 'anon'
)
WITH CHECK (
  auth.uid() = user_id 
  OR public.is_admin() 
  OR auth.role() = 'anon'
);

-- 8. DAILY LOGS: Admins manage all, users manage own
DROP POLICY IF EXISTS "Users can manage own daily logs" ON public.daily_logs;
DROP POLICY IF EXISTS "Admins manage all daily logs, users manage own" ON public.daily_logs;

CREATE POLICY "Admins manage all daily logs, users manage own" 
ON public.daily_logs 
FOR ALL 
USING (
  auth.uid() = user_id 
  OR public.is_admin() 
  OR auth.role() = 'anon'
)
WITH CHECK (
  auth.uid() = user_id 
  OR public.is_admin() 
  OR auth.role() = 'anon'
);

-- 9. ACHIEVEMENTS: Admins manage all, users manage own
DROP POLICY IF EXISTS "Users can manage own achievements" ON public.achievements;
DROP POLICY IF EXISTS "Admins manage all achievements, users manage own" ON public.achievements;

CREATE POLICY "Admins manage all achievements, users manage own" 
ON public.achievements 
FOR ALL 
USING (
  auth.uid() = user_id 
  OR public.is_admin() 
  OR auth.role() = 'anon'
)
WITH CHECK (
  auth.uid() = user_id 
  OR public.is_admin() 
  OR auth.role() = 'anon'
);

-- 10. NOTES: Admins manage all, users manage own
DROP POLICY IF EXISTS "Users can manage own notes" ON public.notes;
DROP POLICY IF EXISTS "Admins manage all notes, users manage own" ON public.notes;

CREATE POLICY "Admins manage all notes, users manage own" 
ON public.notes 
FOR ALL 
USING (
  auth.uid() = user_id 
  OR public.is_admin() 
  OR auth.role() = 'anon'
)
WITH CHECK (
  auth.uid() = user_id 
  OR public.is_admin() 
  OR auth.role() = 'anon'
);

-- 11. MILESTONES: Admins manage all, users manage own projects' milestones
DROP POLICY IF EXISTS "Users can view milestones for own projects" ON public.milestones;
DROP POLICY IF EXISTS "Admins manage all milestones, users manage own" ON public.milestones;

CREATE POLICY "Admins manage all milestones, users manage own" 
ON public.milestones 
FOR ALL 
USING (
  EXISTS (
    SELECT 1 FROM public.projects 
    WHERE projects.id = milestones.project_id 
    AND (projects.user_id = auth.uid() OR public.is_admin() OR auth.role() = 'anon')
  )
)
WITH CHECK (
  EXISTS (
    SELECT 1 FROM public.projects 
    WHERE projects.id = milestones.project_id 
    AND (projects.user_id = auth.uid() OR public.is_admin() OR auth.role() = 'anon')
  )
);
