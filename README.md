# My Work OS — Personal Work Management & Productivity Dashboard

A modern, responsive personal command centre designed specifically for a **Product / Project Delivery Manager** to manage daily work, projects, tasks, follow-ups, meetings, issues, daily work logs, and professional achievements from a unified interface.

Built with **Next.js 16 (App Router)**, **React 19**, **TypeScript**, **Tailwind CSS**, **Recharts**, **Lucide Icons**, and **Supabase / PostgreSQL**.

---

## 🌟 Key Features

### 1. Dashboard & "My Day" Command Centre
- **Dynamic Header:** Greeting ("Good morning/afternoon, Manash 👋") and real-time formatted date.
- **Top Summary Cards:** Tasks Today (total, completed, remaining), High Priority counts, Today's Meetings, and Follow-ups Due.
- **Today's Tasks Table:**
  - Inline status update dropdown (*To Do*, *In Progress*, *Waiting*, *Blocked*, *Done*, *Cancelled*).
  - Visual progress bar.
  - One-click **"Update"** modal (record today's update, next action, follow-up date, and progress in < 10 seconds).
  - **Task Activity Timeline:** Complete historical audit trail with timestamps and authors.
- **My Priorities & Follow-ups:** Side-by-side view highlighting critical blockers and pending external dependencies.
- **Projects Overview:** Real-time progress bars for *Assam IDP*, *SBA Bot*, *Live Report Bot*, etc.
- **Today's Meetings & Blockers:** Quick agendas and active impediment trackers.
- **Daily Work Log Card:** One-click **"Generate Today's Summary"** automatically aggregates completed tasks, meetings, follow-ups, and blockers into an executive brief.

### 2. My Tasks
- Search by task name, description, and next action.
- Quick filter tabs: *Today's Tasks*, *High Priority*, *Overdue*, *Blocked*, *Waiting*, *Upcoming*, *Completed*.
- Granular dropdown filters for Project, Status, Priority, and Task Type.
- Multi-field sorting by Due Date, Priority, Creation Date, or Title.
- Inline status updating, task deletion, and activity timeline.

### 3. Projects & Project Detail Pages
- Portfolio overview cards with real-time calculated completion percentages, pending counts, and blocker flags.
- **Project Detail Page:**
  - **Overview:** Objective, owner, and timeline.
  - **Tasks:** All linked project tasks with progress sliders.
  - **Issues:** Logged roadblocks and severities.
  - **Follow-ups:** External dependencies.
  - **Meetings:** Project alignment sessions.
  - **Milestones Tracker:** Add milestones and mark completion with checkboxes.

### 4. Follow-up Management
- Tracks external dependencies: Person/Team, Topic, Project, Last Discussion, Expected Action, Date, and Status.
- Visual alerts for **Overdue** (red) and **Due Today** (amber pulse).
- Status dropdown: *Pending*, *Waiting*, *Follow-up Due*, *Completed*, *Cancelled*.

### 5. Meetings & Action Items to Tasks
- Filter by *Today's Meetings*, *Upcoming*, and *Past*.
- Captures Agenda, Notes, and Key Decisions.
- **"Convert to Task" Action:** Turns meeting action items directly into executable tasks in 1 click.

### 6. Interactive Calendar
- Visual categories: Tasks (blue), Meetings (purple), Follow-ups (amber), Milestones (emerald).
- Modes: **Month View**, **Week View**, and **Day View**.
- Clicking any date displays a detailed sidebar inspector showing all activities for that day.

### 7. Issues & Blockers
- Track severities (*Critical*, *High*, *Medium*, *Low*) and status (*Open*, *Investigating*, *Waiting*, *Resolved*, *Closed*).
- Direct linking between issues and specific tasks.
- Quick **"Resolve ✓"** button.

### 8. Daily Work Log
- Dedicated fields: *What did I work on?*, *What did I complete?*, *What is pending?*, *What was blocked?*, *Important Decisions*, and *People Coordinated With*.
- **"Generate Today's Summary"**: Auto-populates all fields from real task and meeting activity.
- Day-by-day switcher to browse historical archives.

### 9. Reports & Analytics
- Toggle between **Weekly Review** and **Monthly Review**.
- Key Metrics: Total tasks, completion rate %, pending, blocked, meetings conducted, follow-ups handled.
- **Recharts Visualizations:**
  1. Tasks Completed vs Created by Day (Bar Chart)
  2. Tasks by Project (Horizontal Bar Chart)
  3. Tasks by Status (Bar Chart)
  4. Blockers & Issues by Severity (Bar Chart)
- Major Achievements spotlight.

### 10. Achievement Tracker
- Document major professional milestones with quantified impact.
- Filter by Category: *Delivery*, *Product*, *Technical*, *Operations*, *Leadership*, *Process Improvement*.
- **"Export for Appraisal / CV"**: Formats achievements into Markdown and copies directly to clipboard.

### 11. Notes & Knowledge Base
- Rich notes with Markdown support and tagging.
- Filter by linked project.

### 12. Global Search & Quick Add
- **⌘K / Ctrl+K Global Search:** Instantly searches across Tasks, Projects, Follow-ups, Meetings, Issues, Logs, and Achievements with categorized match counts.
- **Quick Add (`+`):** Top bar and floating mobile button to add any item without leaving the screen.

### 13. Theme & Persistence
- **Light & Dark Mode:** Clean switch via header toggle with system persistence.
- **Zero-Config Local Storage:** Works immediately with rich seed data.
- **Export & Import JSON Backup:** Backup entire workspace with 1 click.
- **Supabase Cloud Ready:** SQL schema included in `supabase/schema.sql` with Row Level Security (RLS) policies.

---

## 🚀 Getting Started

### 1. Run Locally
```bash
npm install
npm run dev
```
Open [http://localhost:3000](http://localhost:3000) (or `http://localhost:3001` if port 3000 is occupied).

### 2. Connect Supabase (Optional)
1. Create a project in [Supabase](https://supabase.com).
2. Go to the SQL Editor and run `supabase/schema.sql`.
3. Add your environment variables in `.env.local`:
   ```env
   NEXT_PUBLIC_SUPABASE_URL=https://your-project.supabase.co
   NEXT_PUBLIC_SUPABASE_ANON_KEY=your-anon-public-key
   ```
4. Restart your dev server.

### 3. Deploy to Vercel
Push your repository to GitHub and import it on [Vercel](https://vercel.com). Add the Supabase environment variables in the Vercel project settings.
