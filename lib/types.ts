export type Role = 'TEAM_MEMBER' | 'MANAGER' | 'ADMIN';
export type ReportStatus = 'DRAFT' | 'SUBMITTED' | 'NEEDS_CORRECTION' | 'APPROVED';
export type TaskPriority = 'LOW' | 'MEDIUM' | 'HIGH';
export type TaskStatus = 'TODO' | 'IN_PROGRESS' | 'BLOCKED' | 'DONE';
export type ProjectStatus = 'ACTIVE' | 'ARCHIVED';
export type ReviewAction = 'REQUESTED_CHANGES' | 'APPROVED';

export interface User {
  id: string;
  email: string;
  fullName: string;
  role: Role;
  department?: string;
  title?: string;
  avatarColor?: string;
  active: boolean;
  createdAt?: string;
  reportCount?: number;
}

export interface Project {
  id: string;
  name: string;
  code: string;
  description?: string;
  status: ProjectStatus;
  reportCount?: number;
}

export interface TaskItem {
  id?: string;
  taskName: string;
  priority: TaskPriority;
  status: TaskStatus;
  plannedPercentage: number;
  actualPercentage: number;
  plannedHours: number;
  spentHours: number;
  deliverableOutput?: string;
}

export interface ReviewComment {
  id: string;
  reportId: string;
  reportVersionId?: string;
  reviewerId: string;
  comment: string;
  action: ReviewAction;
  createdAt: string;
  reviewer?: {
    fullName: string;
    title?: string;
    avatarColor?: string;
  };
}

export interface ReportVersion {
  id: string;
  versionNumber: number;
  tasksPlannedNextWeek?: string;
  blockers: string[];
  keyBlockerIndex?: number | null;
  achievements: string[];
  keyAchievementIndex?: number | null;
  devHours: number;
  testingHours: number;
  meetingHours: number;
  docHours: number;
  notes?: string;
  submittedAt: string;
  tasks: TaskItem[];
  reviewComments?: ReviewComment[];
}

export interface Report {
  id: string;
  userId: string;
  projectId: string;
  weekStartDate: string;
  weekEndDate: string;
  status: ReportStatus;
  currentVersionNumber: number;
  createdAt: string;
  updatedAt: string;
  user?: User;
  project?: Project;
  versions?: ReportVersion[];
  reviewComments?: ReviewComment[];
  totalHours?: number;
  taskCount?: number;
  completionRate?: number;
  blockerCount?: number;
  hasKeyBlocker?: boolean;
  latestComment?: ReviewComment;
}

export interface DashboardSummary {
  totalMembers: number;
  totalSubmitted: number;
  pendingReviews: number;
  needsCorrectionCount: number;
  approvedCount: number;
  complianceRate: number;
  openBlockers: number;
}

export interface DashboardCharts {
  velocityTrend: {
    weekDate: string;
    weekLabel: string;
    plannedTasks: number;
    completedTasks: number;
  }[];
  statusByMember: {
    id: string;
    name: string;
    email: string;
    avatarColor: string;
    reportCount: number;
    completionRate: number;
    approved: number;
    submitted: number;
    needsCorrection: number;
    draft: number;
    approvedPct: number;
    submittedPct: number;
    needsCorrectionPct: number;
    draftPct: number;
  }[];
  projectWorkload: {
    id: string;
    name: string;
    code: string;
    hours: number;
    reportCount: number;
  }[];
  timeBreakdown: {
    name: string;
    hours: number;
    percentage: number;
    color: string;
  }[];
}
