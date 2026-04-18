import type {
  ControlId,
  Locale,
  MethodOption,
  MoodId,
  MoodOption,
  NeedId,
  ReflectionOption,
  ToolOption,
} from "@/lib/types";

const moodEntries = [
  {
    id: "calm" as const,
    value: 1,
    accent: "#75c6d5",
    glow: "rgba(117, 198, 213, 0.28)",
    copy: {
      en: {
        label: "Calm",
        shortLabel: "Calm",
        description: "You feel steady, clear, or already mostly okay.",
      },
      th: {
        label: "สงบ",
        shortLabel: "สงบ",
        description: "คุณรู้สึกนิ่ง ชัดเจน หรือค่อนข้างโอเคอยู่แล้ว",
      },
    },
  },
  {
    id: "irritated" as const,
    value: 2,
    accent: "#f2b15c",
    glow: "rgba(242, 177, 92, 0.25)",
    copy: {
      en: {
        label: "Irritated",
        shortLabel: "Irritated",
        description: "Something is getting under your skin, but it is manageable.",
      },
      th: {
        label: "หงุดหงิด",
        shortLabel: "หงุดหงิด",
        description: "มีบางอย่างกวนใจคุณอยู่ แต่ยังพอรับมือได้",
      },
    },
  },
  {
    id: "frustrated" as const,
    value: 3,
    accent: "#f08b4d",
    glow: "rgba(240, 139, 77, 0.26)",
    copy: {
      en: {
        label: "Frustrated",
        shortLabel: "Frustrated",
        description: "You feel blocked, overloaded, or stuck in a loop.",
      },
      th: {
        label: "อัดอั้น",
        shortLabel: "อัดอั้น",
        description: "คุณรู้สึกติดขัด หนักเกินไป หรือวนอยู่กับเรื่องเดิม",
      },
    },
  },
  {
    id: "angry" as const,
    value: 4,
    accent: "#ef6a58",
    glow: "rgba(239, 106, 88, 0.28)",
    copy: {
      en: {
        label: "Angry",
        shortLabel: "Angry",
        description: "The pressure is high and your body wants to react.",
      },
      th: {
        label: "โกรธ",
        shortLabel: "โกรธ",
        description: "แรงกดดันสูงมากและร่างกายของคุณอยากตอบสนองทันที",
      },
    },
  },
  {
    id: "explosive" as const,
    value: 5,
    accent: "#f04f74",
    glow: "rgba(240, 79, 116, 0.3)",
    copy: {
      en: {
        label: "Explosive",
        shortLabel: "Explosive",
        description: "You need a stronger pause before responding to anything.",
      },
      th: {
        label: "ระเบิดอารมณ์",
        shortLabel: "รุนแรง",
        description: "คุณต้องการการหยุดพักที่ชัดเจนกว่านี้ก่อนจะตอบสนองอะไรออกไป",
      },
    },
  },
];

const toolEntries = [
  {
    id: "pillow",
    copy: {
      en: { name: "Impact Pillow", description: "Soft, safe, and ideal for quick pressure release." },
      th: { name: "หมอนปล่อยแรง", description: "นุ่ม ปลอดภัย และเหมาะกับการระบายแรงกดดันอย่างรวดเร็ว" },
    },
  },
  {
    id: "hammer",
    copy: {
      en: { name: "Rubber Hammer", description: "A slightly louder ritual with playful bounce." },
      th: { name: "ค้อนยาง", description: "พิธีที่มีจังหวะและเสียงมากขึ้นเล็กน้อย แต่ยังดูเล่นสนุกได้" },
    },
  },
  {
    id: "paperball",
    copy: {
      en: { name: "Paper Ball", description: "For compressing the noise into something you can let go." },
      th: { name: "ก้อนกระดาษ", description: "ใช้บีบความวุ่นวายให้กลายเป็นสิ่งที่คุณปล่อยวางได้" },
    },
  },
  {
    id: "mute",
    copy: {
      en: { name: "World Mute Switch", description: "A symbolic way to quiet everything for a minute." },
      th: { name: "สวิตช์ปิดโลก", description: "วิธีเชิงสัญลักษณ์เพื่อทำให้ทุกอย่างเงียบลงสักครู่" },
    },
  },
];

const methodEntries = [
  {
    id: "smash" as const,
    target: 9,
    copy: {
      en: {
        name: "Smash Loop",
        description: "Repeated taps crack the tension until the scene settles.",
        ritual: "Tap through the pressure until it stops pushing back.",
      },
      th: {
        name: "วงจรระบาย",
        description: "แตะซ้ำ ๆ เพื่อคลายความตึงจนฉากค่อย ๆ สงบลง",
        ritual: "แตะผ่านแรงกดดันไปเรื่อย ๆ จนมันหยุดตีกลับ",
      },
    },
  },
  {
    id: "hold" as const,
    target: 100,
    copy: {
      en: {
        name: "Pressure Hold",
        description: "Press and hold to release pressure without escalation.",
        ritual: "Hold steady and let the pressure drain instead of spill out.",
      },
      th: {
        name: "กดค้างระบาย",
        description: "กดค้างเพื่อปล่อยแรงกดดันโดยไม่ทำให้สถานการณ์รุนแรงขึ้น",
        ritual: "กดไว้นิ่ง ๆ แล้วปล่อยให้แรงกดดันค่อย ๆ ไหลออกแทนการระเบิดออกมา",
      },
    },
  },
];

const needEntries = [
  {
    id: "space" as const,
    copy: {
      en: { label: "Space", description: "You need distance before you respond." },
      th: { label: "พื้นที่", description: "คุณต้องการระยะห่างก่อนจะตอบสนอง" },
    },
  },
  {
    id: "clarity" as const,
    copy: {
      en: { label: "Clarity", description: "You need to understand what actually triggered this." },
      th: { label: "ความชัดเจน", description: "คุณต้องเข้าใจก่อนว่าอะไรคือสิ่งที่กระตุ้นอารมณ์ครั้งนี้" },
    },
  },
  {
    id: "support" as const,
    copy: {
      en: { label: "Support", description: "You need help, reassurance, or backup." },
      th: { label: "การสนับสนุน", description: "คุณต้องการความช่วยเหลือ การยืนยันความรู้สึก หรือคนคอยช่วยพยุง" },
    },
  },
  {
    id: "rest" as const,
    copy: {
      en: { label: "Rest", description: "You are depleted and your nervous system wants recovery." },
      th: { label: "การพัก", description: "คุณกำลังหมดแรง และระบบประสาทของคุณต้องการการฟื้นตัว" },
    },
  },
  {
    id: "movement" as const,
    copy: {
      en: { label: "Movement", description: "Your body needs to move before your mind can settle." },
      th: { label: "การเคลื่อนไหว", description: "ร่างกายของคุณต้องได้ขยับก่อนที่ใจจะค่อย ๆ สงบลง" },
    },
  },
];

const controlEntries = [
  {
    id: "response" as const,
    copy: {
      en: { label: "My response", description: "I can choose what I do next." },
      th: { label: "การตอบสนองของฉัน", description: "ฉันยังเลือกได้ว่าจะทำอะไรต่อจากนี้" },
    },
  },
  {
    id: "boundary" as const,
    copy: {
      en: { label: "My boundary", description: "I can protect my time, energy, or access." },
      th: { label: "ขอบเขตของฉัน", description: "ฉันสามารถปกป้องเวลา พลังงาน หรือพื้นที่ของตัวเองได้" },
    },
  },
  {
    id: "timing" as const,
    copy: {
      en: { label: "My timing", description: "I can delay the conversation until I am steadier." },
      th: { label: "จังหวะของฉัน", description: "ฉันสามารถเลื่อนบทสนทนาออกไปจนกว่าจะนิ่งขึ้นได้" },
    },
  },
  {
    id: "expectation" as const,
    copy: {
      en: { label: "My expectation", description: "I can adjust the story I am telling myself about this." },
      th: { label: "ความคาดหวังของฉัน", description: "ฉันสามารถปรับเรื่องราวที่กำลังเล่าให้ตัวเองฟังเกี่ยวกับสิ่งนี้ได้" },
    },
  },
];

export function getMoodOptions(locale: Locale): MoodOption[] {
  return moodEntries.map((entry) => ({
    id: entry.id,
    value: entry.value,
    accent: entry.accent,
    glow: entry.glow,
    label: entry.copy[locale].label,
    shortLabel: entry.copy[locale].shortLabel,
    description: entry.copy[locale].description,
  }));
}

export function getToolOptions(locale: Locale): ToolOption[] {
  return toolEntries.map((entry) => ({
    id: entry.id,
    name: entry.copy[locale].name,
    description: entry.copy[locale].description,
  }));
}

export function getMethodOptions(locale: Locale): MethodOption[] {
  return methodEntries.map((entry) => ({
    id: entry.id,
    target: entry.target,
    name: entry.copy[locale].name,
    description: entry.copy[locale].description,
    ritual: entry.copy[locale].ritual,
  }));
}

export function getNeedOptions(locale: Locale): ReflectionOption<NeedId>[] {
  return needEntries.map((entry) => ({
    id: entry.id,
    label: entry.copy[locale].label,
    description: entry.copy[locale].description,
  }));
}

export function getControlOptions(locale: Locale): ReflectionOption<ControlId>[] {
  return controlEntries.map((entry) => ({
    id: entry.id,
    label: entry.copy[locale].label,
    description: entry.copy[locale].description,
  }));
}

export function getMoodById(id: MoodId, locale: Locale = "en") {
  return getMoodOptions(locale).find((mood) => mood.id === id) ?? getMoodOptions(locale)[0];
}

export function getToolById(id?: string, locale: Locale = "en") {
  return getToolOptions(locale).find((tool) => tool.id === id) ?? null;
}

export function getMethodById(id?: string, locale: Locale = "en") {
  return getMethodOptions(locale).find((method) => method.id === id) ?? null;
}
