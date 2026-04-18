import { controlOptions, getMethodById, getMoodById, getToolById, moodOptions } from "@/lib/session-data";
import type {
  AppState,
  Badge,
  DaySummary,
  DerivedStats,
  EmotionSession,
  FullSessionInput,
  HeatmapWeek,
  MoodId,
  NeedId,
  Suggestion,
} from "@/lib/types";

export const APP_STATE_KEY = "nottoday-state-v1";

export const defaultAppState: AppState = {
  sessions: [],
  preferences: {
    soundEnabled: false,
    scene: "storm",
  },
};

export function buildDayKey(dateLike: string | Date = new Date()) {
  const date = typeof dateLike === "string" ? new Date(dateLike) : dateLike;
  const year = date.getFullYear();
  const month = `${date.getMonth() + 1}`.padStart(2, "0");
  const day = `${date.getDate()}`.padStart(2, "0");
  return `${year}-${month}-${day}`;
}

function clampMood(id: MoodId) {
  return getMoodById(id).value;
}

function buildId(prefix: string) {
  return `${prefix}-${Math.random().toString(36).slice(2, 10)}`;
}

export function restoreAppState(rawState: string | null): AppState {
  if (!rawState) {
    return defaultAppState;
  }

  try {
    const parsed = JSON.parse(rawState) as Partial<AppState>;

    return {
      sessions: Array.isArray(parsed.sessions)
        ? parsed.sessions
            .filter((session): session is EmotionSession => Boolean(session?.id && session?.createdAt))
            .sort((left, right) => right.createdAt.localeCompare(left.createdAt))
        : [],
      preferences: {
        soundEnabled: parsed.preferences?.soundEnabled ?? defaultAppState.preferences.soundEnabled,
        scene: parsed.preferences?.scene ?? defaultAppState.preferences.scene,
      },
    };
  } catch {
    return defaultAppState;
  }
}

export function createQuickSession(moodBefore: MoodId): EmotionSession {
  return {
    id: buildId("quick"),
    createdAt: new Date().toISOString(),
    sessionType: "quick",
    moodBefore,
    moodAfter: moodBefore,
    completed: true,
  };
}

function buildSuggestion(input: FullSessionInput): Suggestion {
  const before = clampMood(input.moodBefore);
  const after = clampMood(input.moodAfter);

  const needSuggestions: Record<NeedId, Suggestion> = {
    space: {
      id: "space",
      title: "Put five minutes between you and the trigger.",
      description: "Step away, mute notifications, or postpone the reply until your body settles.",
      actionLabel: "Take a short break",
    },
    clarity: {
      id: "clarity",
      title: "Write the real issue in one sentence.",
      description: "Name what happened, what it meant to you, and what you need next.",
      actionLabel: "Name the issue",
    },
    support: {
      id: "support",
      title: "Let someone steady the frame with you.",
      description: "Send one concise message asking for perspective, backup, or just a calm check-in.",
      actionLabel: "Reach out",
    },
    rest: {
      id: "rest",
      title: "Your system wants recovery, not another round.",
      description: "Water, a snack, and ten quiet minutes will help more than pushing through.",
      actionLabel: "Recover first",
    },
    movement: {
      id: "movement",
      title: "Move before you message.",
      description: "A short walk or a minute of pacing can drain the leftover charge from your body.",
      actionLabel: "Move for a minute",
    },
  };

  if (after >= 4) {
    return {
      id: "high-intensity",
      title: "Do not answer while the temperature is still high.",
      description: "Your reflection says the activation is still strong. Delay the conversation and protect your timing.",
      actionLabel: "Pause the response",
    };
  }

  if (before - after >= 2) {
    return {
      id: "strong-recovery",
      title: "You made space before exploding.",
      description: "The shift is real. Lock it in with one calmer next move while your body is still settling.",
      actionLabel: "Choose the calmer move",
    };
  }

  if (input.controlId === "timing") {
    return {
      id: "timing",
      title: "Let timing do some of the work.",
      description: "A delayed answer is still a thoughtful answer. Come back when your tone matches your intent.",
      actionLabel: "Reply later",
    };
  }

  if (input.controlId === "boundary") {
    return {
      id: "boundary",
      title: "Boundaries work better than resentment.",
      description: "Name the limit clearly and briefly. You do not need to over-explain it.",
      actionLabel: "Set the boundary",
    };
  }

  return needSuggestions[input.needId];
}

export function createFullSession(input: FullSessionInput): EmotionSession {
  return {
    id: buildId("reset"),
    createdAt: new Date().toISOString(),
    sessionType: "full",
    moodBefore: input.moodBefore,
    moodAfter: input.moodAfter,
    toolId: input.toolId,
    methodId: input.methodId,
    needId: input.needId,
    controlId: input.controlId,
    note: input.note.trim(),
    suggestion: buildSuggestion(input),
    completed: true,
  };
}

function countBy<T extends string | undefined>(values: T[]) {
  const counts = new Map<string, number>();

  values.forEach((value) => {
    if (!value) {
      return;
    }

    counts.set(value, (counts.get(value) ?? 0) + 1);
  });

  return counts;
}

function findTopEntry(values: (string | undefined)[], resolver?: (value: string) => string | null) {
  const entries = [...countBy(values).entries()].sort((left, right) => right[1] - left[1]);
  const top = entries[0]?.[0];

  if (!top) {
    return null;
  }

  return resolver ? resolver(top) : top;
}

function mapSessionsByDay(sessions: EmotionSession[]) {
  const dayMap = new Map<string, EmotionSession[]>();

  sessions.forEach((session) => {
    const day = buildDayKey(session.createdAt);
    dayMap.set(day, [...(dayMap.get(day) ?? []), session]);
  });

  return dayMap;
}

function buildDaySummary(dayKey: string, sessionsForDay: EmotionSession[]): DaySummary {
  const moods = sessionsForDay.map((session) => clampMood(session.moodBefore));
  const fullSessionCount = sessionsForDay.filter((session) => session.sessionType === "full").length;
  const averageMood = moods.length > 0 ? moods.reduce((total, mood) => total + mood, 0) / moods.length : 0;
  const highestMood = moods.length > 0 ? Math.max(...moods) : 0;

  return {
    day: dayKey,
    averageMood,
    highestMood,
    fullSessionCount,
    calmDay: moods.length > 0 && highestMood <= 2 && fullSessionCount === 0,
    completedSessions: sessionsForDay.length,
  };
}

function getWeeklyTrend(sessions: EmotionSession[]) {
  const dayMap = mapSessionsByDay(sessions);
  const days: DaySummary[] = [];

  for (let offset = 6; offset >= 0; offset -= 1) {
    const date = new Date();
    date.setDate(date.getDate() - offset);
    const dayKey = buildDayKey(date);
    days.push(buildDaySummary(dayKey, dayMap.get(dayKey) ?? []));
  }

  return days;
}

function calculateStreak(daysWithCheckIns: string[]) {
  if (daysWithCheckIns.length === 0) {
    return 0;
  }

  const ordered = [...new Set(daysWithCheckIns)].sort((left, right) => right.localeCompare(left));
  let streak = 1;

  for (let index = 1; index < ordered.length; index += 1) {
    const previous = new Date(`${ordered[index - 1]}T12:00:00`);
    const current = new Date(`${ordered[index]}T12:00:00`);
    const diff = Math.round((previous.getTime() - current.getTime()) / (1000 * 60 * 60 * 24));

    if (diff !== 1) {
      break;
    }

    streak += 1;
  }

  return streak;
}

function calculateLongestStreak(daysWithCheckIns: string[]) {
  if (daysWithCheckIns.length === 0) {
    return 0;
  }

  const ordered = [...new Set(daysWithCheckIns)].sort();
  let longest = 1;
  let current = 1;

  for (let index = 1; index < ordered.length; index += 1) {
    const previous = new Date(`${ordered[index - 1]}T12:00:00`);
    const next = new Date(`${ordered[index]}T12:00:00`);
    const diff = Math.round((next.getTime() - previous.getTime()) / (1000 * 60 * 60 * 24));

    if (diff === 1) {
      current += 1;
      longest = Math.max(longest, current);
      continue;
    }

    current = 1;
  }

  return longest;
}

function getStartOfWeek(dateLike: string | Date) {
  const date = typeof dateLike === "string" ? new Date(`${dateLike}T12:00:00`) : new Date(dateLike);
  const day = date.getDay();

  date.setDate(date.getDate() - day);
  date.setHours(12, 0, 0, 0);
  return date;
}

function getHeatmapWeeks(sessions: EmotionSession[], weekCount = 12): HeatmapWeek[] {
  const dayMap = mapSessionsByDay(sessions);
  const currentWeekStart = getStartOfWeek(new Date());
  const weeks: HeatmapWeek[] = [];

  for (let weekOffset = weekCount - 1; weekOffset >= 0; weekOffset -= 1) {
    const weekStart = new Date(currentWeekStart);
    weekStart.setDate(currentWeekStart.getDate() - weekOffset * 7);
    const days: DaySummary[] = [];

    for (let dayOffset = 0; dayOffset < 7; dayOffset += 1) {
      const date = new Date(weekStart);
      date.setDate(weekStart.getDate() + dayOffset);
      const dayKey = buildDayKey(date);
      days.push(buildDaySummary(dayKey, dayMap.get(dayKey) ?? []));
    }

    weeks.push({
      weekStart: buildDayKey(weekStart),
      days,
    });
  }

  return weeks;
}

function getUnlockedBadges(sessions: EmotionSession[], weeklyTrend: DaySummary[], awarenessStreak: number) {
  const fullSessions = sessions.filter((session) => session.sessionType === "full");
  const calmDays = weeklyTrend.filter((day) => day.calmDay).length;
  const averageRecovery =
    fullSessions.length > 0
      ? fullSessions.reduce(
          (total, session) => total + (clampMood(session.moodBefore) - clampMood(session.moodAfter)),
          0,
        ) / fullSessions.length
      : 0;

  const badges: Badge[] = [];

  if (fullSessions.length >= 1) {
    badges.push({
      id: "first-reset",
      name: "First Reset",
      description: "You finished your first full emotional reset.",
    });
  }

  if (calmDays >= 3) {
    badges.push({
      id: "three-calm-days",
      name: "3 Calm Days",
      description: "You checked in on calm days without needing the full ritual.",
    });
  }

  if (awarenessStreak >= 7) {
    badges.push({
      id: "seven-day-awareness",
      name: "7-Day Awareness",
      description: "A full week of showing up for your emotional state.",
    });
  }

  if (
    fullSessions.some(
      (session) => clampMood(session.moodBefore) - clampMood(session.moodAfter) >= 2,
    )
  ) {
    badges.push({
      id: "paused-before-reacting",
      name: "Paused Before Reacting",
      description: "You created real distance between the trigger and your response.",
    });
  }

  if (sessions.length >= 5) {
    badges.push({
      id: "quiet-win",
      name: "Quiet Win",
      description: "Five check-ins logged. Not every win needs to be loud.",
    });
  }

  if (averageRecovery >= 1.3) {
    badges.push({
      id: "soft-power",
      name: "Soft Power",
      description: "Your recovery trend shows stronger regulation over time.",
    });
  }

  return badges;
}

export function getDerivedStats(state: AppState): DerivedStats {
  const sessions = [...state.sessions].sort((left, right) => right.createdAt.localeCompare(left.createdAt));
  const fullSessions = sessions.filter((session) => session.sessionType === "full");
  const weeklyTrend = getWeeklyTrend(sessions);
  const uniqueDays = [...new Set(sessions.map((session) => buildDayKey(session.createdAt)))];
  const awarenessStreak = calculateStreak(uniqueDays);
  const longestAwarenessStreak = calculateLongestStreak(uniqueDays);
  const averageMood =
    sessions.length > 0
      ? sessions.reduce((total, session) => total + clampMood(session.moodBefore), 0) / sessions.length
      : 0;
  const averageRecovery =
    fullSessions.length > 0
      ? fullSessions.reduce(
          (total, session) => total + (clampMood(session.moodBefore) - clampMood(session.moodAfter)),
          0,
        ) / fullSessions.length
      : 0;

  return {
    awarenessStreak,
    longestAwarenessStreak,
    calmDays: weeklyTrend.filter((day) => day.calmDay).length,
    totalSessions: sessions.length,
    fullSessions: fullSessions.length,
    averageMood,
    averageRecovery,
    todayCheckIn: uniqueDays.includes(buildDayKey()),
    mostUsedTool: findTopEntry(
      fullSessions.map((session) => session.toolId),
      (value) => getToolById(value)?.name ?? value,
    ),
    mostUsedMethod: findTopEntry(
      fullSessions.map((session) => session.methodId),
      (value) => getMethodById(value)?.name ?? value,
    ),
    unlockedBadges: getUnlockedBadges(sessions, weeklyTrend, awarenessStreak),
    weeklyTrend,
    heatmapWeeks: getHeatmapWeeks(sessions),
    recentSessions: sessions.slice(0, 6),
  };
}

export function formatLongDate(value: string) {
  return new Intl.DateTimeFormat("en", {
    month: "short",
    day: "numeric",
    hour: "numeric",
    minute: "2-digit",
  }).format(new Date(value));
}

export function formatDayLabel(dayKey: string) {
  const date = new Date(`${dayKey}T12:00:00`);
  return new Intl.DateTimeFormat("en", { weekday: "short" }).format(date);
}

export function formatMetric(value: number) {
  return Number.isInteger(value) ? `${value}` : value.toFixed(1);
}

export function buildCoachCopy(moodId: MoodId) {
  const mood = getMoodById(moodId);

  if (mood.value <= 2) {
    return "Low-friction awareness counts too. Keep it easy today.";
  }

  if (mood.value === 3) {
    return "Enough heat to notice, but still recoverable with a short ritual.";
  }

  return "High charge detected. Short pause first, response second.";
}

export function buildCompletionLine(session: EmotionSession) {
  const before = getMoodById(session.moodBefore);
  const after = getMoodById(session.moodAfter);
  const delta = before.value - after.value;

  if (delta > 0) {
    return `You shifted from ${before.label.toLowerCase()} to ${after.label.toLowerCase()}. That pause mattered.`;
  }

  if (delta === 0) {
    return `You stayed at ${after.label.toLowerCase()}, but you still interrupted the spiral before acting.`;
  }

  return `The charge is still present. Keep the next move small and slower than your first impulse.`;
}

export function getControlLabel(controlId?: string) {
  return controlOptions.find((option) => option.id === controlId)?.label ?? "Your next move";
}

export function getMoodScaleSummary() {
  return moodOptions.map((mood) => `${mood.value}. ${mood.label}`).join("  ");
}
