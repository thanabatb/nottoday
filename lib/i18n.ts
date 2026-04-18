import type { Locale } from "@/lib/types";

type TranslationTree = {
  common: {
    cancel: string;
    close: string;
    back: string;
    exit: string;
    day: string;
    days: string;
    soundOn: string;
    soundOff: string;
    language: string;
    switchLanguage: string;
  };
  home: {
    enterRoom: string;
  };
  reset: {
    setupStage: string;
    mood: string;
    currentAnswer: string;
    moodQuestion: string;
    moodDescription: string;
    releaseStatus: string;
    angerLevel: string;
    hitsToEmpty: string;
    released: string;
    hits: string;
    tapPillow: string;
    clickPillow: string;
    finishRelease: string;
    reflection: string;
    reflectionTitle: string;
    reflectionDescription: string;
    intenseNow: string;
    needMost: string;
    withinControl: string;
    optionalNote: string;
    notePlaceholder: string;
    backToReleaseRoom: string;
    viewSummary: string;
    end: string;
    interruptedTitle: string;
    suggestedNextStep: string;
    moodShift: string;
    moodShiftConnector: string;
    awarenessStreak: string;
    scale: string;
    currentMonth: string;
    longest: string;
    averageMood: string;
  };
  stats: {
    progressTracking: string;
    title: string;
    backHome: string;
    awarenessStreak: string;
    awarenessStreakDetail: string;
    calmDays: string;
    calmDaysDetail: string;
    recoveryScore: string;
    recoveryScoreDetail: string;
    totalSessions: string;
    totalSessionsDetail: string;
    weeklyHeatmap: string;
    weeklyHeatmapTitle: string;
    highlights: string;
    highlightsTitle: string;
    mostUsedRitual: string;
    noFullRitual: string;
    noMethodData: string;
    highestRecentDay: string;
    noLoggedSpikes: string;
    weeklyProfileHint: string;
    badgesUnlocked: string;
    badgesUnlockedDetail: string;
    milestones: string;
    milestonesTitle: string;
    noBadges: string;
    recentSessions: string;
    recentSessionsTitle: string;
    noSessions: string;
    fullResetSession: string;
    quickCheckIn: string;
    averageMood: string;
    longestStreak: string;
    currentStreak: string;
    weeklyHeatmapSummary: string;
  };
};

const translations: Record<Locale, TranslationTree> = {
  en: {
    common: {
      cancel: "Cancel",
      close: "Close",
      back: "Back",
      exit: "Exit",
      day: "day",
      days: "days",
      soundOn: "Sound On",
      soundOff: "Sound Off",
      language: "Language",
      switchLanguage: "Switch language",
    },
    home: {
      enterRoom: "Enter Room",
    },
    reset: {
      setupStage: "Setup Stage",
      mood: "Mood",
      currentAnswer: "Current answer",
      moodQuestion: "What's your mood today?",
      moodDescription: "Choose the answer that matches right now. After you pick one, the release room opens.",
      releaseStatus: "Release Status",
      angerLevel: "Anger Level",
      hitsToEmpty: "hits to empty",
      released: "Released",
      hits: "Hits",
      tapPillow: "Tap the pillow to release pressure",
      clickPillow: "Click the pillow to release pressure",
      finishRelease: "I'm good now",
      reflection: "Reflection",
      reflectionTitle: "What feels true now?",
      reflectionDescription: "The release is over. Capture what changed and what you need next.",
      intenseNow: "How intense is it now?",
      needMost: "What do you need most?",
      withinControl: "What part is within your control?",
      optionalNote: "Optional note",
      notePlaceholder: "What sits underneath the anger?",
      backToReleaseRoom: "Back To Release Room",
      viewSummary: "View Summary",
      end: "End",
      interruptedTitle: "You interrupted the spiral.",
      suggestedNextStep: "Suggested next step",
      moodShift: "Mood shift",
      moodShiftConnector: "to",
      awarenessStreak: "Awareness streak",
      scale: "Scale",
      currentMonth: "Current month",
      longest: "Longest",
      averageMood: "Avg mood",
    },
    stats: {
      progressTracking: "Progress Tracking",
      title: "Awareness, recovery, and calm-day signals.",
      backHome: "Back home",
      awarenessStreak: "Awareness streak",
      awarenessStreakDetail: "Primary streak for the MVP. It rewards noticing your state.",
      calmDays: "Calm days",
      calmDaysDetail: "Secondary signal for days where the temperature stayed low.",
      recoveryScore: "Recovery score",
      recoveryScoreDetail: "Average drop from before to after on full reset sessions.",
      totalSessions: "Total sessions",
      totalSessionsDetail: "All quick check-ins and full sessions combined.",
      weeklyHeatmap: "Weekly heatmap",
      weeklyHeatmapTitle: "Emotion streaks across the last 12 weeks.",
      highlights: "Highlights",
      highlightsTitle: "The current shape of your pattern.",
      mostUsedRitual: "Most-used ritual",
      noFullRitual: "No full ritual yet",
      noMethodData: "No method data yet",
      highestRecentDay: "Highest recent day",
      noLoggedSpikes: "No logged spikes this week",
      weeklyProfileHint: "Once sessions are logged, the weekly profile fills in automatically.",
      badgesUnlocked: "Badges unlocked",
      badgesUnlockedDetail: "Milestones reward consistency, reflection, and emotional recovery instead of intensity.",
      milestones: "Milestones",
      milestonesTitle: "Warm, low-pressure badges.",
      noBadges: "No badges yet. The first one unlocks after a completed full reset.",
      recentSessions: "Recent sessions",
      recentSessionsTitle: "A short history of your pauses.",
      noSessions: "The session history fills in after the first check-in.",
      fullResetSession: "Full reset session",
      quickCheckIn: "Quick check-in",
      averageMood: "Average mood",
      longestStreak: "Longest streak",
      currentStreak: "Current streak",
      weeklyHeatmapSummary: "Current week emotional streak",
    },
  },
  th: {
    common: {
      cancel: "ยกเลิก",
      close: "ปิด",
      back: "ย้อนกลับ",
      exit: "ออก",
      day: "วัน",
      days: "วัน",
      soundOn: "เปิดเสียง",
      soundOff: "ปิดเสียง",
      language: "ภาษา",
      switchLanguage: "สลับภาษา",
    },
    home: {
      enterRoom: "เข้าห้อง",
    },
    reset: {
      setupStage: "ตั้งค่า",
      mood: "อารมณ์",
      currentAnswer: "คำตอบตอนนี้",
      moodQuestion: "วันนี้คุณรู้สึกอย่างไร?",
      moodDescription: "เลือกคำตอบที่ตรงกับความรู้สึกตอนนี้ แล้วระบบจะพาเข้าสู่ห้องระบายอารมณ์ทันที",
      releaseStatus: "สถานะการระบาย",
      angerLevel: "ระดับความโกรธ",
      hitsToEmpty: "ครั้งเพื่อให้หมด",
      released: "ระบายแล้ว",
      hits: "ครั้งที่กด",
      tapPillow: "แตะหมอนเพื่อระบายความกดดัน",
      clickPillow: "คลิกหมอนเพื่อระบายความกดดัน",
      finishRelease: "พอแล้ว",
      reflection: "ทบทวน",
      reflectionTitle: "ตอนนี้อะไรคือความจริงของใจคุณ?",
      reflectionDescription: "การระบายจบแล้ว ลองบันทึกว่ามีอะไรเปลี่ยนไปและตอนนี้คุณต้องการอะไร",
      intenseNow: "ตอนนี้ความเข้มข้นของอารมณ์เป็นอย่างไร?",
      needMost: "ตอนนี้คุณต้องการอะไรมากที่สุด?",
      withinControl: "อะไรคือสิ่งที่ยังอยู่ในการควบคุมของคุณ?",
      optionalNote: "บันทึกเพิ่มเติม",
      notePlaceholder: "อะไรคือสิ่งที่ซ่อนอยู่ใต้ความโกรธนี้?",
      backToReleaseRoom: "กลับไปที่ห้องระบาย",
      viewSummary: "ดูสรุป",
      end: "จบ",
      interruptedTitle: "คุณหยุดวงจรเดิมได้แล้ว",
      suggestedNextStep: "ก้าวถัดไปที่แนะนำ",
      moodShift: "การเปลี่ยนแปลงของอารมณ์",
      moodShiftConnector: "ไปเป็น",
      awarenessStreak: "สตรีคการรับรู้อารมณ์",
      scale: "ระดับอารมณ์",
      currentMonth: "เดือนปัจจุบัน",
      longest: "ยาวที่สุด",
      averageMood: "อารมณ์เฉลี่ย",
    },
    stats: {
      progressTracking: "ติดตามความคืบหน้า",
      title: "สัญญาณของการรับรู้ การฟื้นตัว และวันที่ใจสงบ",
      backHome: "กลับหน้าแรก",
      awarenessStreak: "สตรีคการรับรู้อารมณ์",
      awarenessStreakDetail: "สตรีคหลักของ MVP ใช้วัดการกลับมารับรู้อารมณ์ของตัวเอง",
      calmDays: "วันที่สงบ",
      calmDaysDetail: "สัญญาณรองสำหรับวันที่อารมณ์ไม่พุ่งสูง",
      recoveryScore: "คะแนนการฟื้นตัว",
      recoveryScoreDetail: "ค่าเฉลี่ยของระดับอารมณ์ที่ลดลงหลังทำ full reset",
      totalSessions: "จำนวนเซสชันทั้งหมด",
      totalSessionsDetail: "รวมทั้ง quick check-in และ full session",
      weeklyHeatmap: "ฮีตแมปรายสัปดาห์",
      weeklyHeatmapTitle: "สตรีคอารมณ์ย้อนหลัง 12 สัปดาห์",
      highlights: "ไฮไลต์",
      highlightsTitle: "ภาพรวมของรูปแบบอารมณ์ตอนนี้",
      mostUsedRitual: "พิธีที่ใช้บ่อยที่สุด",
      noFullRitual: "ยังไม่มีพิธีเต็มรูปแบบ",
      noMethodData: "ยังไม่มีข้อมูลรูปแบบ",
      highestRecentDay: "วันที่อารมณ์สูงสุดล่าสุด",
      noLoggedSpikes: "สัปดาห์นี้ยังไม่มีวันที่อารมณ์พุ่ง",
      weeklyProfileHint: "เมื่อเริ่มบันทึกเซสชัน โปรไฟล์รายสัปดาห์จะค่อย ๆ เติมเต็มเอง",
      badgesUnlocked: "เหรียญที่ปลดล็อก",
      badgesUnlockedDetail: "ให้รางวัลกับความสม่ำเสมอ การทบทวน และการฟื้นตัว มากกว่าความรุนแรงของอารมณ์",
      milestones: "ไมล์สโตน",
      milestonesTitle: "เหรียญรางวัลแบบเบา ๆ ไม่กดดัน",
      noBadges: "ยังไม่มีเหรียญรางวัล เหรียญแรกจะปลดล็อกหลังทำ full reset ครั้งแรก",
      recentSessions: "เซสชันล่าสุด",
      recentSessionsTitle: "ประวัติการหยุดพักสั้น ๆ ของคุณ",
      noSessions: "ประวัติเซสชันจะปรากฏหลังจากมีการเช็กอินครั้งแรก",
      fullResetSession: "เซสชันรีเซ็ตเต็มรูปแบบ",
      quickCheckIn: "เช็กอินแบบรวดเร็ว",
      averageMood: "อารมณ์เฉลี่ย",
      longestStreak: "สตรีคยาวที่สุด",
      currentStreak: "สตรีคปัจจุบัน",
      weeklyHeatmapSummary: "สตรีคอารมณ์ของสัปดาห์นี้",
    },
  },
};

export function getCopy(locale: Locale) {
  return translations[locale] ?? translations.en;
}

export function getIntlLocale(locale: Locale) {
  return locale === "th" ? "th-TH" : "en";
}

export function getLanguageLabel(locale: Locale) {
  return locale === "th" ? "ไทย" : "EN";
}

export function getWeekdayLabels(locale: Locale, format: "short" | "compact" = "short") {
  if (locale === "th") {
    return format === "compact"
      ? ["อา", "จ", "อ", "พ", "พฤ", "ศ", "ส"]
      : ["อาทิตย์", "จันทร์", "อังคาร", "พุธ", "พฤหัส", "ศุกร์", "เสาร์"];
  }

  return format === "compact"
    ? ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"]
    : ["Sunday", "Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday"];
}
