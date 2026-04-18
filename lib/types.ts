export type MoodId = "calm" | "irritated" | "frustrated" | "angry" | "explosive";
export type MethodId = "smash" | "hold";
export type SessionType = "quick" | "full";
export type NeedId = "space" | "clarity" | "support" | "rest" | "movement";
export type ControlId = "response" | "boundary" | "timing" | "expectation";
export type SceneId = "storm" | "sunrise";
export type Locale = "en" | "th";

export interface MoodOption {
  id: MoodId;
  label: string;
  value: number;
  shortLabel: string;
  description: string;
  accent: string;
  glow: string;
}

export interface ToolOption {
  id: string;
  name: string;
  description: string;
}

export interface MethodOption {
  id: MethodId;
  name: string;
  description: string;
  ritual: string;
  target: number;
}

export interface ReflectionOption<T extends string> {
  id: T;
  label: string;
  description: string;
}

export interface Suggestion {
  id: string;
  title: string;
  description: string;
  actionLabel: string;
}

export interface EmotionSession {
  id: string;
  createdAt: string;
  sessionType: SessionType;
  moodBefore: MoodId;
  moodAfter: MoodId;
  releaseHitCount?: number;
  toolId?: string;
  methodId?: MethodId;
  note?: string;
  needId?: NeedId;
  controlId?: ControlId;
  completed: boolean;
  suggestion?: Suggestion;
}

export interface Preferences {
  locale: Locale;
  displayName?: string;
  soundEnabled: boolean;
  scene: SceneId;
}

export interface AppState {
  sessions: EmotionSession[];
  preferences: Preferences;
}

export interface FullSessionInput {
  moodBefore: MoodId;
  moodAfter: MoodId;
  releaseHitCount?: number;
  toolId: string;
  methodId: MethodId;
  needId: NeedId;
  controlId: ControlId;
  note: string;
}

export interface DaySummary {
  day: string;
  averageMood: number;
  highestMood: number;
  fullSessionCount: number;
  calmDay: boolean;
  completedSessions: number;
}

export interface HeatmapWeek {
  weekStart: string;
  days: DaySummary[];
}

export interface Badge {
  id: string;
  name: string;
  description: string;
}

export interface MoodCountSummary {
  moodId: MoodId;
  count: number;
}

export interface DerivedStats {
  awarenessStreak: number;
  longestAwarenessStreak: number;
  calmDays: number;
  totalSessions: number;
  fullSessions: number;
  totalReleaseCount: number;
  averageMood: number;
  averageRecovery: number;
  todayCheckIn: boolean;
  mostUsedTool: string | null;
  mostUsedMethod: string | null;
  moodOnEntry: MoodCountSummary[];
  moodOnFinish: MoodCountSummary[];
  unlockedBadges: Badge[];
  weeklyTrend: DaySummary[];
  heatmapWeeks: HeatmapWeek[];
  recentSessions: EmotionSession[];
}
