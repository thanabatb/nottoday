import { getControlOptions, getMethodById, getMoodById, getMoodOptions, getToolById } from "@/lib/session-data";
import { getIntlLocale } from "@/lib/i18n";
import type {
  AppState,
  Badge,
  DaySummary,
  DerivedStats,
  EmotionSession,
  FullSessionInput,
  HeatmapWeek,
  Locale,
  MoodCountSummary,
  MoodId,
  Suggestion,
} from "@/lib/types";

export const APP_STATE_KEY = "nottoday-state-v1";

export const defaultAppState: AppState = {
  sessions: [],
  preferences: {
    locale: "th",
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

const suggestionCatalog: Record<string, Record<Locale, Omit<Suggestion, "id">>> = {
  space: {
    en: {
      title: "Put five minutes between you and the trigger.",
      description: "Step away, mute notifications, or postpone the reply until your body settles.",
      actionLabel: "Take a short break",
    },
    th: {
      title: "เว้นระยะห้าระหว่างคุณกับสิ่งกระตุ้นก่อน",
      description: "ถอยออกมา ปิดการแจ้งเตือน หรือเลื่อนการตอบออกไปจนกว่าร่างกายจะนิ่งขึ้น",
      actionLabel: "พักสั้น ๆ",
    },
  },
  clarity: {
    en: {
      title: "Write the real issue in one sentence.",
      description: "Name what happened, what it meant to you, and what you need next.",
      actionLabel: "Name the issue",
    },
    th: {
      title: "เขียนปัญหาที่แท้จริงออกมาเป็นหนึ่งประโยค",
      description: "บอกให้ชัดว่าเกิดอะไรขึ้น มันมีความหมายต่อคุณอย่างไร และคุณต้องการอะไรต่อจากนี้",
      actionLabel: "ตั้งชื่อปัญหา",
    },
  },
  support: {
    en: {
      title: "Let someone steady the frame with you.",
      description: "Send one concise message asking for perspective, backup, or just a calm check-in.",
      actionLabel: "Reach out",
    },
    th: {
      title: "ให้ใครสักคนช่วยพยุงกรอบความคิดนี้ไปกับคุณ",
      description: "ส่งข้อความสั้น ๆ เพื่อขอมุมมอง ความช่วยเหลือ หรือแค่การเช็กอินอย่างสงบ",
      actionLabel: "ติดต่อใครสักคน",
    },
  },
  rest: {
    en: {
      title: "Your system wants recovery, not another round.",
      description: "Water, a snack, and ten quiet minutes will help more than pushing through.",
      actionLabel: "Recover first",
    },
    th: {
      title: "ระบบของคุณต้องการการฟื้นตัว ไม่ใช่การฝืนต่ออีกยก",
      description: "น้ำ ของว่าง และเวลาสงบสักสิบนาทีจะช่วยมากกว่าการฝืนไปต่อ",
      actionLabel: "ฟื้นตัวก่อน",
    },
  },
  movement: {
    en: {
      title: "Move before you message.",
      description: "A short walk or a minute of pacing can drain the leftover charge from your body.",
      actionLabel: "Move for a minute",
    },
    th: {
      title: "ขยับร่างกายก่อนส่งข้อความ",
      description: "เดินสั้น ๆ หรือเดินวนสักนิด จะช่วยปล่อยประจุที่ค้างอยู่ในร่างกายออกมา",
      actionLabel: "ขยับหนึ่งนาที",
    },
  },
  "high-intensity": {
    en: {
      title: "Do not answer while the temperature is still high.",
      description: "Your reflection says the activation is still strong. Delay the conversation and protect your timing.",
      actionLabel: "Pause the response",
    },
    th: {
      title: "อย่าเพิ่งตอบในตอนที่อุณหภูมิอารมณ์ยังสูงอยู่",
      description: "การทบทวนของคุณบอกว่ายังมีแรงกระตุ้นอยู่มาก เลื่อนบทสนทนาออกไปและปกป้องจังหวะของตัวเอง",
      actionLabel: "หยุดการตอบก่อน",
    },
  },
  "strong-recovery": {
    en: {
      title: "You made space before exploding.",
      description: "The shift is real. Lock it in with one calmer next move while your body is still settling.",
      actionLabel: "Choose the calmer move",
    },
    th: {
      title: "คุณสร้างพื้นที่ให้ตัวเองก่อนจะระเบิดอารมณ์",
      description: "การเปลี่ยนแปลงนี้เกิดขึ้นจริง ล็อกมันไว้ด้วยก้าวถัดไปที่สงบกว่าเดิมในขณะที่ร่างกายยังค่อย ๆ นิ่งลง",
      actionLabel: "เลือกก้าวที่สงบกว่า",
    },
  },
  timing: {
    en: {
      title: "Let timing do some of the work.",
      description: "A delayed answer is still a thoughtful answer. Come back when your tone matches your intent.",
      actionLabel: "Reply later",
    },
    th: {
      title: "ให้จังหวะเวลาช่วยแบกภาระบางส่วน",
      description: "การตอบช้าก็ยังเป็นการตอบอย่างตั้งใจได้ กลับมาตอนที่น้ำเสียงของคุณสอดคล้องกับเจตนาแล้ว",
      actionLabel: "ค่อยตอบทีหลัง",
    },
  },
  boundary: {
    en: {
      title: "Boundaries work better than resentment.",
      description: "Name the limit clearly and briefly. You do not need to over-explain it.",
      actionLabel: "Set the boundary",
    },
    th: {
      title: "การตั้งขอบเขตได้ผลดีกว่าการเก็บความขุ่นใจไว้",
      description: "บอกขอบเขตของคุณให้ชัดและสั้น คุณไม่จำเป็นต้องอธิบายมันเกินพอดี",
      actionLabel: "ตั้งขอบเขต",
    },
  },
};

const badgeCatalog: Record<string, Record<Locale, Omit<Badge, "id">>> = {
  "first-reset": {
    en: { name: "First Reset", description: "You finished your first full emotional reset." },
    th: { name: "รีเซ็ตครั้งแรก", description: "คุณทำการรีเซ็ตอารมณ์แบบเต็มรูปแบบครั้งแรกสำเร็จแล้ว" },
  },
  "three-calm-days": {
    en: { name: "3 Calm Days", description: "You checked in on calm days without needing the full ritual." },
    th: { name: "สงบ 3 วัน", description: "คุณเช็กอินในวันที่ใจสงบโดยไม่ต้องใช้พิธีเต็มรูปแบบ" },
  },
  "seven-day-awareness": {
    en: { name: "7-Day Awareness", description: "A full week of showing up for your emotional state." },
    th: { name: "รับรู้อารมณ์ 7 วัน", description: "คุณกลับมารับรู้อารมณ์ของตัวเองได้ต่อเนื่องครบหนึ่งสัปดาห์" },
  },
  "paused-before-reacting": {
    en: { name: "Paused Before Reacting", description: "You created real distance between the trigger and your response." },
    th: { name: "หยุดก่อนตอบสนอง", description: "คุณสร้างระยะห่างจริง ๆ ระหว่างสิ่งกระตุ้นกับการตอบสนองของตัวเอง" },
  },
  "quiet-win": {
    en: { name: "Quiet Win", description: "Five check-ins logged. Not every win needs to be loud." },
    th: { name: "ชัยชนะเงียบ ๆ", description: "คุณบันทึกเช็กอินครบห้าครั้งแล้ว ไม่ใช่ทุกชัยชนะต้องเสียงดัง" },
  },
  "soft-power": {
    en: { name: "Soft Power", description: "Your recovery trend shows stronger regulation over time." },
    th: { name: "พลังที่นุ่มนวล", description: "แนวโน้มการฟื้นตัวของคุณสะท้อนถึงการกำกับอารมณ์ที่แข็งแรงขึ้นตามเวลา" },
  },
};

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
        locale: parsed.preferences?.locale ?? defaultAppState.preferences.locale,
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

export function getSuggestionById(id: string, locale: Locale): Suggestion | null {
  const suggestion = suggestionCatalog[id]?.[locale];

  if (!suggestion) {
    return null;
  }

  return {
    id,
    ...suggestion,
  };
}

export function resolveSuggestion(suggestion: Suggestion | undefined, locale: Locale) {
  if (!suggestion) {
    return null;
  }

  return getSuggestionById(suggestion.id, locale) ?? suggestion;
}

function buildSuggestion(input: FullSessionInput, locale: Locale): Suggestion {
  const before = clampMood(input.moodBefore);
  const after = clampMood(input.moodAfter);

  if (after >= 4) {
    return getSuggestionById("high-intensity", locale) ?? { id: "high-intensity", title: "", description: "", actionLabel: "" };
  }

  if (before - after >= 2) {
    return getSuggestionById("strong-recovery", locale) ?? { id: "strong-recovery", title: "", description: "", actionLabel: "" };
  }

  if (input.controlId === "timing") {
    return getSuggestionById("timing", locale) ?? { id: "timing", title: "", description: "", actionLabel: "" };
  }

  if (input.controlId === "boundary") {
    return getSuggestionById("boundary", locale) ?? { id: "boundary", title: "", description: "", actionLabel: "" };
  }

  return getSuggestionById(input.needId, locale) ?? { id: input.needId, title: "", description: "", actionLabel: "" };
}

export function createFullSession(input: FullSessionInput, locale: Locale = "en"): EmotionSession {
  return {
    id: buildId("reset"),
    createdAt: new Date().toISOString(),
    sessionType: "full",
    moodBefore: input.moodBefore,
    moodAfter: input.moodAfter,
    releaseHitCount: input.releaseHitCount ?? 0,
    toolId: input.toolId,
    methodId: input.methodId,
    needId: input.needId,
    controlId: input.controlId,
    note: input.note.trim(),
    suggestion: buildSuggestion(input, locale),
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

function getBadge(id: string, locale: Locale): Badge {
  const copy = badgeCatalog[id]?.[locale];

  return {
    id,
    name: copy?.name ?? id,
    description: copy?.description ?? "",
  };
}

function getUnlockedBadges(sessions: EmotionSession[], weeklyTrend: DaySummary[], awarenessStreak: number, locale: Locale) {
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
    badges.push(getBadge("first-reset", locale));
  }

  if (calmDays >= 3) {
    badges.push(getBadge("three-calm-days", locale));
  }

  if (awarenessStreak >= 7) {
    badges.push(getBadge("seven-day-awareness", locale));
  }

  if (
    fullSessions.some(
      (session) => clampMood(session.moodBefore) - clampMood(session.moodAfter) >= 2,
    )
  ) {
    badges.push(getBadge("paused-before-reacting", locale));
  }

  if (sessions.length >= 5) {
    badges.push(getBadge("quiet-win", locale));
  }

  if (averageRecovery >= 1.3) {
    badges.push(getBadge("soft-power", locale));
  }

  return badges;
}

function countMoods(sessions: EmotionSession[], key: "moodBefore" | "moodAfter"): MoodCountSummary[] {
  const counts = new Map<MoodId, number>();

  sessions.forEach((session) => {
    const moodId = session[key];
    counts.set(moodId, (counts.get(moodId) ?? 0) + 1);
  });

  return getMoodOptions("en")
    .map((mood) => ({
      moodId: mood.id,
      count: counts.get(mood.id) ?? 0,
    }))
    .filter((entry) => entry.count > 0);
}

export function getDerivedStats(state: AppState, locale: Locale = state.preferences.locale): DerivedStats {
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
  const totalReleaseCount = fullSessions.reduce((total, session) => total + (session.releaseHitCount ?? 0), 0);

  return {
    awarenessStreak,
    longestAwarenessStreak,
    calmDays: weeklyTrend.filter((day) => day.calmDay).length,
    totalSessions: sessions.length,
    fullSessions: fullSessions.length,
    totalReleaseCount,
    averageMood,
    averageRecovery,
    todayCheckIn: uniqueDays.includes(buildDayKey()),
    mostUsedTool: findTopEntry(
      fullSessions.map((session) => session.toolId),
      (value) => getToolById(value, locale)?.name ?? value,
    ),
    mostUsedMethod: findTopEntry(
      fullSessions.map((session) => session.methodId),
      (value) => getMethodById(value, locale)?.name ?? value,
    ),
    moodOnEntry: countMoods(fullSessions, "moodBefore"),
    moodOnFinish: countMoods(fullSessions, "moodAfter"),
    unlockedBadges: getUnlockedBadges(sessions, weeklyTrend, awarenessStreak, locale),
    weeklyTrend,
    heatmapWeeks: getHeatmapWeeks(sessions),
    recentSessions: sessions.slice(0, 6),
  };
}

export function formatLongDate(value: string, locale: Locale = "en") {
  return new Intl.DateTimeFormat(getIntlLocale(locale), {
    month: "short",
    day: "numeric",
    hour: "numeric",
    minute: "2-digit",
  }).format(new Date(value));
}

export function formatDayLabel(dayKey: string, locale: Locale = "en") {
  const date = new Date(`${dayKey}T12:00:00`);
  return new Intl.DateTimeFormat(getIntlLocale(locale), { weekday: "short" }).format(date);
}

export function formatMetric(value: number) {
  return Number.isInteger(value) ? `${value}` : value.toFixed(1);
}

export function buildCoachCopy(moodId: MoodId, locale: Locale = "en") {
  const mood = getMoodById(moodId, locale);

  if (mood.value <= 2) {
    return locale === "th"
      ? "แค่รับรู้อารมณ์แบบเบา ๆ ก็มีความหมายแล้ว วันนี้เอาให้ง่ายเข้าไว้"
      : "Low-friction awareness counts too. Keep it easy today.";
  }

  if (mood.value === 3) {
    return locale === "th"
      ? "มีความร้อนพอให้สังเกตเห็น แต่ยังฟื้นกลับมาได้ด้วยพิธีสั้น ๆ"
      : "Enough heat to notice, but still recoverable with a short ritual.";
  }

  return locale === "th"
    ? "ตรวจพบแรงอารมณ์สูง หยุดสั้น ๆ ก่อน แล้วค่อยตอบสนองทีหลัง"
    : "High charge detected. Short pause first, response second.";
}

export function buildCompletionLine(session: EmotionSession, locale: Locale = "en") {
  const before = getMoodById(session.moodBefore, locale);
  const after = getMoodById(session.moodAfter, locale);
  const delta = before.value - after.value;

  if (delta > 0) {
    return locale === "th"
      ? `คุณเปลี่ยนจาก${before.label}ไปเป็น${after.label} การหยุดพักครั้งนี้มีความหมาย`
      : `You shifted from ${before.label.toLowerCase()} to ${after.label.toLowerCase()}. That pause mattered.`;
  }

  if (delta === 0) {
    return locale === "th"
      ? `คุณยังคงอยู่ที่ระดับ${after.label} แต่คุณก็ยังหยุดวงจรเดิมไว้ก่อนลงมือทำได้`
      : `You stayed at ${after.label.toLowerCase()}, but you still interrupted the spiral before acting.`;
  }

  return locale === "th"
    ? "แรงอารมณ์ยังคงอยู่ ให้ก้าวถัดไปเล็กลงและช้ากว่าแรงกระตุ้นแรกของคุณ"
    : "The charge is still present. Keep the next move small and slower than your first impulse.";
}

export function getControlLabel(controlId?: string, locale: Locale = "en") {
  return getControlOptions(locale).find((option) => option.id === controlId)?.label ?? (locale === "th" ? "ก้าวถัดไปของคุณ" : "Your next move");
}

export function getMoodScaleSummary(locale: Locale = "en") {
  return getMoodOptions(locale)
    .map((mood) => `${mood.value}. ${mood.label}`)
    .join("  ");
}
