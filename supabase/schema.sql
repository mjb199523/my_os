-- ==============================================================================
-- MY WORK OS - PostgreSQL & Supabase Database Schema
-- Personal Work Management and Productivity Dashboard
-- ==============================================================================

-- Enable UUID extension
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- 1. USERS TABLE
CREATE TABLE IF NOT EXISTS public.users (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  name TEXT NOT NULL,
  email TEXT UNIQUE NOT NULL,
  avatar_url TEXT,
  role TEXT DEFAULT 'Product Delivery Manager',
  system_role TEXT DEFAULT 'User' CHECK (system_role IN ('Admin', 'User')),
  status TEXT DEFAULT 'Active' CHECK (status IN ('Active', 'Inactive')),
  last_login_at TIMESTAMPTZ,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- 2. PROJECTS TABLE
CREATE TABLE IF NOT EXISTS public.projects (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID REFERENCES public.users(id) ON DELETE CASCADE,
  name TEXT NOT NULL,
  description TEXT,
  status TEXT NOT NULL DEFAULT 'Active' CHECK (status IN ('Planning', 'Active', 'On Hold', 'Completed', 'Archived')),
  priority TEXT NOT NULL DEFAULT 'Medium' CHECK (priority IN ('Low', 'Medium', 'High', 'Critical')),
  start_date DATE NOT NULL,
  end_date DATE NOT NULL,
  owner TEXT DEFAULT 'Manash',
  tags TEXT[],
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- 3. TASKS TABLE
CREATE TABLE IF NOT EXISTS public.tasks (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID REFERENCES public.users(id) ON DELETE CASCADE,
  project_id UUID REFERENCES public.projects(id) ON DELETE CASCADE,
  title TEXT NOT NULL,
  description TEXT,
  task_type TEXT NOT NULL DEFAULT 'Development' CHECK (task_type IN ('Development', 'Meeting', 'Follow-up', 'Analysis', 'Documentation', 'Testing', 'Deployment', 'Support', 'Other')),
  priority TEXT NOT NULL DEFAULT 'Medium' CHECK (priority IN ('Low', 'Medium', 'High', 'Critical')),
  status TEXT NOT NULL DEFAULT 'To Do' CHECK (status IN ('To Do', 'In Progress', 'Waiting', 'Blocked', 'Done', 'Cancelled')),
  progress INTEGER NOT NULL DEFAULT 0 CHECK (progress >= 0 AND progress <= 100),
  start_date DATE NOT NULL,
  due_date DATE NOT NULL,
  next_action TEXT,
  is_recurring BOOLEAN DEFAULT FALSE,
  recurrence_rule TEXT,
  tags TEXT[],
  notes TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW(),
  completed_at TIMESTAMPTZ
);

-- 4. TASK UPDATES TABLE (Activity History)
CREATE TABLE IF NOT EXISTS public.task_updates (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  task_id UUID REFERENCES public.tasks(id) ON DELETE CASCADE,
  user_id UUID REFERENCES public.users(id) ON DELETE CASCADE,
  author_name TEXT DEFAULT 'Manash',
  status TEXT NOT NULL,
  progress INTEGER NOT NULL,
  update_text TEXT NOT NULL,
  next_action TEXT,
  next_followup_date DATE,
  notes TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- 5. FOLLOWUPS TABLE
CREATE TABLE IF NOT EXISTS public.followups (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID REFERENCES public.users(id) ON DELETE CASCADE,
  project_id UUID REFERENCES public.projects(id) ON DELETE SET NULL,
  person TEXT NOT NULL,
  topic TEXT NOT NULL,
  last_discussion TEXT,
  expected_action TEXT NOT NULL,
  followup_date DATE NOT NULL,
  status TEXT NOT NULL DEFAULT 'Pending' CHECK (status IN ('Pending', 'Waiting', 'Follow-up Due', 'Completed', 'Cancelled')),
  notes TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- 6. MEETINGS TABLE
CREATE TABLE IF NOT EXISTS public.meetings (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID REFERENCES public.users(id) ON DELETE CASCADE,
  project_id UUID REFERENCES public.projects(id) ON DELETE SET NULL,
  title TEXT NOT NULL,
  meeting_date DATE NOT NULL,
  start_time TEXT NOT NULL,
  end_time TEXT NOT NULL,
  participants TEXT NOT NULL,
  agenda TEXT,
  notes TEXT,
  decisions TEXT,
  action_items JSONB DEFAULT '[]'::jsonb,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- 7. ISSUES TABLE (Blockers)
CREATE TABLE IF NOT EXISTS public.issues (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID REFERENCES public.users(id) ON DELETE CASCADE,
  project_id UUID REFERENCES public.projects(id) ON DELETE SET NULL,
  task_id UUID REFERENCES public.tasks(id) ON DELETE SET NULL,
  title TEXT NOT NULL,
  description TEXT NOT NULL,
  severity TEXT NOT NULL DEFAULT 'Medium' CHECK (severity IN ('Low', 'Medium', 'High', 'Critical')),
  status TEXT NOT NULL DEFAULT 'Open' CHECK (status IN ('Open', 'Investigating', 'Waiting', 'Resolved', 'Closed')),
  owner TEXT NOT NULL,
  expected_resolution TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  resolved_at TIMESTAMPTZ,
  notes TEXT
);

-- 8. DAILY LOGS TABLE
CREATE TABLE IF NOT EXISTS public.daily_logs (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID REFERENCES public.users(id) ON DELETE CASCADE,
  log_date DATE NOT NULL,
  worked_on TEXT,
  completed TEXT,
  pending TEXT,
  blocked TEXT,
  decisions TEXT,
  people_coordinated TEXT,
  summary TEXT,
  notes TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW(),
  UNIQUE (user_id, log_date)
);

-- 9. ACHIEVEMENTS TABLE
CREATE TABLE IF NOT EXISTS public.achievements (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID REFERENCES public.users(id) ON DELETE CASCADE,
  project_id UUID REFERENCES public.projects(id) ON DELETE SET NULL,
  title TEXT NOT NULL,
  description TEXT NOT NULL,
  impact TEXT NOT NULL,
  category TEXT NOT NULL CHECK (category IN ('Delivery', 'Product', 'Technical', 'Operations', 'Leadership', 'Process Improvement')),
  achievement_date DATE NOT NULL,
  tags TEXT[],
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- 10. NOTES TABLE
CREATE TABLE IF NOT EXISTS public.notes (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID REFERENCES public.users(id) ON DELETE CASCADE,
  project_id UUID REFERENCES public.projects(id) ON DELETE SET NULL,
  task_id UUID REFERENCES public.tasks(id) ON DELETE SET NULL,
  title TEXT NOT NULL,
  content TEXT NOT NULL,
  tags TEXT[],
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- 11. MILESTONES TABLE
CREATE TABLE IF NOT EXISTS public.milestones (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  project_id UUID REFERENCES public.projects(id) ON DELETE CASCADE,
  title TEXT NOT NULL,
  description TEXT,
  due_date DATE NOT NULL,
  status TEXT NOT NULL DEFAULT 'Pending' CHECK (status IN ('Pending', 'In Progress', 'Completed')),
  created_at TIMESTAMPTZ DEFAULT NOW(),
  completed_at TIMESTAMPTZ
);

-- INDEXES
CREATE INDEX IF NOT EXISTS idx_tasks_user_due ON public.tasks(user_id, due_date);
CREATE INDEX IF NOT EXISTS idx_tasks_project ON public.tasks(project_id);
CREATE INDEX IF NOT EXISTS idx_tasks_status ON public.tasks(status);
CREATE INDEX IF NOT EXISTS idx_task_updates_task ON public.task_updates(task_id);
CREATE INDEX IF NOT EXISTS idx_followups_user_date ON public.followups(user_id, followup_date);
CREATE INDEX IF NOT EXISTS idx_meetings_user_date ON public.meetings(user_id, meeting_date);
CREATE INDEX IF NOT EXISTS idx_issues_user ON public.issues(user_id);
CREATE INDEX IF NOT EXISTS idx_daily_logs_date ON public.daily_logs(user_id, log_date);

-- ROW LEVEL SECURITY (RLS)
ALTER TABLE public.users ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.projects ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.tasks ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.task_updates ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.followups ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.meetings ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.issues ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.daily_logs ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.achievements ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.notes ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.milestones ENABLE ROW LEVEL SECURITY;

-- POLICIES
-- Helper function to check if user is Admin
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

CREATE POLICY "Admins manage all, users manage own profile" ON public.users FOR ALL USING (auth.uid() = id OR public.is_admin() OR auth.role() = 'anon') WITH CHECK (auth.uid() = id OR public.is_admin() OR auth.role() = 'anon');
CREATE POLICY "Admins manage all projects, users manage own" ON public.projects FOR ALL USING (auth.uid() = user_id OR public.is_admin() OR auth.role() = 'anon') WITH CHECK (auth.uid() = user_id OR public.is_admin() OR auth.role() = 'anon');
CREATE POLICY "Admins manage all tasks, users manage own" ON public.tasks FOR ALL USING (auth.uid() = user_id OR public.is_admin() OR auth.role() = 'anon') WITH CHECK (auth.uid() = user_id OR public.is_admin() OR auth.role() = 'anon');
CREATE POLICY "Admins manage all task updates, users manage own" ON public.task_updates FOR ALL USING (auth.uid() = user_id OR public.is_admin() OR auth.role() = 'anon') WITH CHECK (auth.uid() = user_id OR public.is_admin() OR auth.role() = 'anon');
CREATE POLICY "Admins manage all followups, users manage own" ON public.followups FOR ALL USING (auth.uid() = user_id OR public.is_admin() OR auth.role() = 'anon') WITH CHECK (auth.uid() = user_id OR public.is_admin() OR auth.role() = 'anon');
CREATE POLICY "Admins manage all meetings, users manage own" ON public.meetings FOR ALL USING (auth.uid() = user_id OR public.is_admin() OR auth.role() = 'anon') WITH CHECK (auth.uid() = user_id OR public.is_admin() OR auth.role() = 'anon');
CREATE POLICY "Admins manage all issues, users manage own" ON public.issues FOR ALL USING (auth.uid() = user_id OR public.is_admin() OR auth.role() = 'anon') WITH CHECK (auth.uid() = user_id OR public.is_admin() OR auth.role() = 'anon');
CREATE POLICY "Admins manage all daily logs, users manage own" ON public.daily_logs FOR ALL USING (auth.uid() = user_id OR public.is_admin() OR auth.role() = 'anon') WITH CHECK (auth.uid() = user_id OR public.is_admin() OR auth.role() = 'anon');
CREATE POLICY "Admins manage all achievements, users manage own" ON public.achievements FOR ALL USING (auth.uid() = user_id OR public.is_admin() OR auth.role() = 'anon') WITH CHECK (auth.uid() = user_id OR public.is_admin() OR auth.role() = 'anon');
CREATE POLICY "Admins manage all notes, users manage own" ON public.notes FOR ALL USING (auth.uid() = user_id OR public.is_admin() OR auth.role() = 'anon') WITH CHECK (auth.uid() = user_id OR public.is_admin() OR auth.role() = 'anon');
CREATE POLICY "Admins manage all milestones, users manage own" ON public.milestones FOR ALL USING (
  EXISTS (SELECT 1 FROM public.projects WHERE projects.id = milestones.project_id AND (projects.user_id = auth.uid() OR public.is_admin() OR auth.role() = 'anon'))
) WITH CHECK (
  EXISTS (SELECT 1 FROM public.projects WHERE projects.id = milestones.project_id AND (projects.user_id = auth.uid() OR public.is_admin() OR auth.role() = 'anon'))
);

-- 12. ADMIN MESSAGES TABLE (Unidirectional Notifications from Admin to Users)
CREATE TABLE IF NOT EXISTS public.admin_messages (
  id TEXT PRIMARY KEY DEFAULT uuid_generate_v4()::text,
  sender_id TEXT,
  sender_name TEXT,
  target_user_id TEXT NOT NULL DEFAULT 'all',
  target_user_name TEXT DEFAULT 'All Users',
  title TEXT NOT NULL,
  message TEXT NOT NULL,
  priority TEXT NOT NULL DEFAULT 'Normal' CHECK (priority IN ('Normal', 'Important', 'Urgent', 'Announcement')),
  read_by TEXT[] DEFAULT '{}',
  created_at TIMESTAMPTZ DEFAULT NOW()
);

ALTER TABLE public.admin_messages ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Users can view messages addressed to them or all" ON public.admin_messages FOR SELECT USING (
  target_user_id = 'all' OR target_user_id = auth.uid()::text OR sender_id = auth.uid()::text OR auth.role() IN ('authenticated', 'anon')
);
CREATE POLICY "Admins can manage messages" ON public.admin_messages FOR ALL USING (true) WITH CHECK (true);
