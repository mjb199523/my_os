export type Priority = 'Low' | 'Medium' | 'High' | 'Critical';

export type TaskStatus = 'To Do' | 'In Progress' | 'Waiting' | 'Blocked' | 'Done' | 'Cancelled';

export type TaskType = 
  | 'Development'
  | 'Meeting'
  | 'Follow-up'
  | 'Analysis'
  | 'Documentation'
  | 'Testing'
  | 'Deployment'
  | 'Support'
  | 'Other';

export type ProjectStatus = 'Planning' | 'Active' | 'On Hold' | 'Completed' | 'Archived';

export type FollowupStatus = 'Pending' | 'Waiting' | 'Follow-up Due' | 'Completed' | 'Cancelled';

export type IssueSeverity = 'Low' | 'Medium' | 'High' | 'Critical';

export type IssueStatus = 'Open' | 'Investigating' | 'Waiting' | 'Resolved' | 'Closed';

export type AchievementCategory = 
  | 'Delivery'
  | 'Product'
  | 'Technical'
  | 'Operations'
  | 'Leadership'
  | 'Process Improvement';

export interface User {
  id: string;
  name: string;
  email: string;
  avatar_url?: string;
  role?: string;
  created_at: string;
}

export interface Project {
  id: string;
  user_id: string;
  name: string;
  description: string;
  status: ProjectStatus;
  priority: Priority;
  start_date: string;
  end_date: string;
  owner?: string;
  tags?: string[];
  created_at: string;
  updated_at: string;
}

export interface TaskUpdate {
  id: string;
  task_id: string;
  user_id: string;
  author_name?: string;
  status: TaskStatus;
  progress: number;
  update_text: string;
  next_action?: string;
  next_followup_date?: string;
  notes?: string;
  created_at: string;
}

export interface Task {
  id: string;
  user_id: string;
  project_id: string;
  title: string;
  description?: string;
  task_type: TaskType;
  priority: Priority;
  status: TaskStatus;
  progress: number;
  start_date: string;
  due_date: string;
  next_action?: string;
  is_recurring?: boolean;
  recurrence_rule?: string;
  tags?: string[];
  notes?: string;
  created_at: string;
  updated_at: string;
  completed_at?: string | null;
}

export interface Followup {
  id: string;
  user_id: string;
  project_id?: string;
  person: string;
  topic: string;
  last_discussion?: string;
  expected_action: string;
  followup_date: string;
  status: FollowupStatus;
  notes?: string;
  created_at: string;
  updated_at: string;
}

export interface Meeting {
  id: string;
  user_id: string;
  project_id?: string;
  title: string;
  meeting_date: string;
  start_time: string;
  end_time: string;
  participants: string;
  agenda?: string;
  notes?: string;
  decisions?: string;
  action_items?: {
    id: string;
    text: string;
    assigned_to?: string;
    converted_to_task_id?: string;
  }[];
  created_at: string;
  updated_at: string;
}

export interface Issue {
  id: string;
  user_id: string;
  project_id?: string;
  task_id?: string;
  title: string;
  description: string;
  severity: IssueSeverity;
  status: IssueStatus;
  owner: string;
  expected_resolution?: string;
  created_at: string;
  resolved_at?: string | null;
  notes?: string;
}

export interface DailyLog {
  id: string;
  user_id: string;
  log_date: string; // YYYY-MM-DD
  worked_on: string;
  completed: string;
  pending: string;
  blocked: string;
  decisions: string;
  people_coordinated: string;
  summary: string;
  notes: string;
  created_at: string;
  updated_at: string;
}

export interface Achievement {
  id: string;
  user_id: string;
  project_id?: string;
  title: string;
  description: string;
  impact: string;
  category: AchievementCategory;
  achievement_date: string;
  tags?: string[];
  created_at: string;
}

export interface Note {
  id: string;
  user_id: string;
  project_id?: string;
  task_id?: string;
  title: string;
  content: string;
  tags: string[];
  created_at: string;
  updated_at: string;
}

export interface Milestone {
  id: string;
  project_id: string;
  title: string;
  description?: string;
  due_date: string;
  status: 'Pending' | 'In Progress' | 'Completed';
  created_at: string;
  completed_at?: string | null;
}

export interface NotificationItem {
  id: string;
  title: string;
  message: string;
  type: 'task_due' | 'task_overdue' | 'followup_due' | 'meeting' | 'blocker';
  target_id?: string;
  timestamp: string;
  read: boolean;
}
