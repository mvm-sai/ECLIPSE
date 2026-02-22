export interface EnergyProfile {
  brainBurnersCompletedToday: number;
}

export interface StoryState {
  chapter: number;
  alignment: string;
}

export interface User {
  uid: string;
  email: string | null;
  displayName: string | null;
  photoURL: string | null;
  xp: number;
  level: number;
  rank: string;
  energyProfile: EnergyProfile;
  storyState: StoryState;
  lastActiveTime: Date;
  createdAt: Date;
}

export interface EnergyData {
  id: string;
  userId: string;
  value: number;
  unit: string;
  timestamp: Date;
  source: string;
  category: 'solar' | 'wind' | 'hydro' | 'grid' | 'other';
}

export interface EnergyStats {
  totalEnergy: number;
  averageDaily: number;
  peakUsage: number;
  efficiency: number;
  trend: 'up' | 'down' | 'stable';
  periodStart: Date;
  periodEnd: Date;
}

export interface DashboardStats {
  currentEnergy: number;
  dailyAverage: number;
  weeklyTotal: number;
  monthlyTotal: number;
  savingsPercent: number;
  carbonOffset: number;
}

export interface NavItem {
  label: string;
  href: string;
  icon: string;
  active?: boolean;
}

export interface ChartDataPoint {
  label: string;
  value: number;
  color?: string;
}

export interface AuthState {
  user: User | null;
  loading: boolean;
  error: string | null;
}

export interface FirestoreUserDoc {
  displayName: string | null;
  email: string | null;
  photoURL: string | null;
  xp: number;
  level: number;
  rank: string;
  energyProfile: EnergyProfile;
  storyState: StoryState;
  lastActiveTime: unknown;
  createdAt: unknown;
}

export const DEFAULT_USER_DOC: Omit<FirestoreUserDoc, 'displayName' | 'email' | 'photoURL' | 'lastActiveTime' | 'createdAt'> = {
  xp: 0,
  level: 1,
  rank: 'Beginner',
  energyProfile: {
    brainBurnersCompletedToday: 0,
  },
  storyState: {
    chapter: 1,
    alignment: 'neutral',
  },
};

/* ── Task Scheduling Types ───────────────────────────────────────── */

export type TaskType = 'brain-burner' | 'autopilot';

export type TaskDifficulty = 'easy' | 'medium' | 'hard';

export type TaskStatus = 'pending' | 'active' | 'completed' | 'skipped';

export interface Task {
  id: string;
  title: string;
  description: string;
  type: TaskType;
  difficulty: TaskDifficulty;
  status: TaskStatus;
  xpReward: number;
  estimatedMinutes: number;
  tags: string[];
  createdAt: Date;
  completedAt?: Date;
}

export interface SchedulingContext {
  currentHour: number;
  brainBurnersCompletedToday: number;
  lastActiveTime: Date;
  userLevel: number;
}

export interface SchedulingResult {
  tasks: Task[];
  reason: string;
  mode: 'focus' | 'autopilot' | 're-engagement';
}

export const BRAIN_BURNER_DAILY_CAP = 3;
export const AUTOPILOT_WINDOW_START = 15; // 3 PM
export const AUTOPILOT_WINDOW_END = 18; // 6 PM
export const INACTIVITY_THRESHOLD_MS = 24 * 60 * 60 * 1000; // 24 hours

