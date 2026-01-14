export type ActivityCategory = 
  | 'work'
  | 'exercise'
  | 'leisure'
  | 'social'
  | 'health'
  | 'learning'
  | 'chores'
  | 'personal'
  | 'travel'
  | 'other';

export type ActivityPriority = 'high' | 'medium' | 'low';

export type ActivityStatus = 'pending' | 'in_progress' | 'completed' | 'cancelled';

export type HabitType = 'good' | 'bad';

export interface Activity {
  id: string;
  title: string;
  description?: string;
  category: ActivityCategory;
  priority: ActivityPriority;
  status: ActivityStatus;
  startTime?: string;
  endTime?: string;
  date: string;
  duration?: number; // in minutes
  location?: string;
  isAllDay: boolean;
  reminders?: string[];
  tags?: string[];
  createdAt: string;
  completedAt?: string;
}

export interface Habit {
  id: string;
  title: string;
  description?: string;
  category: ActivityCategory;
  type: HabitType;
  frequency: 'daily' | 'weekly' | 'monthly';
  targetCount: number;
  currentStreak: number;
  longestStreak: number;
  completedDates: string[];
  successDates: string[];
  lastRelapsedDate?: string;
  totalRelapses: number;
  daysClean: number;
  color: string;
  icon: string;
  reminders?: string[];
  createdAt: string;
  isActive: boolean;
}

export interface DailySummary {
  date: string;
  totalActivities: number;
  completedActivities: number;
  totalDuration: number;
  productivityScore: number;
  categoryBreakdown: {
    category: ActivityCategory;
    count: number;
    duration: number;
  }[];
}

export interface TimeBlock {
  id: string;
  title: string;
  startTime: string;
  endTime: string;
  category: ActivityCategory;
  color: string;
}

export const ACTIVITY_COLORS: Record<ActivityCategory, string> = {
  work: '#3B82F6',
  exercise: '#10B981',
  leisure: '#F59E0B',
  social: '#EC4899',
  health: '#14B8A6',
  learning: '#8B5CF6',
  chores: '#6B7280',
  personal: '#F97316',
  travel: '#06B6D4',
  other: '#A1A1AA',
};

export const ACTIVITY_ICONS: Record<ActivityCategory, string> = {
  work: 'Briefcase',
  exercise: 'Dumbbell',
  leisure: 'Gamepad2',
  social: 'Users',
  health: 'Heart',
  learning: 'BookOpen',
  chores: 'Home',
  personal: 'User',
  travel: 'Car',
  other: 'MoreHorizontal',
};
