import type {
  ControlId,
  MethodOption,
  MoodId,
  MoodOption,
  NeedId,
  ReflectionOption,
  ToolOption,
} from "@/lib/types";

export const moodOptions: MoodOption[] = [
  {
    id: "calm",
    label: "Calm",
    shortLabel: "Calm",
    value: 1,
    description: "You feel steady, clear, or already mostly okay.",
    accent: "#75c6d5",
    glow: "rgba(117, 198, 213, 0.28)",
  },
  {
    id: "irritated",
    label: "Irritated",
    shortLabel: "Irritated",
    value: 2,
    description: "Something is getting under your skin, but it is manageable.",
    accent: "#f2b15c",
    glow: "rgba(242, 177, 92, 0.25)",
  },
  {
    id: "frustrated",
    label: "Frustrated",
    shortLabel: "Frustrated",
    value: 3,
    description: "You feel blocked, overloaded, or stuck in a loop.",
    accent: "#f08b4d",
    glow: "rgba(240, 139, 77, 0.26)",
  },
  {
    id: "angry",
    label: "Angry",
    shortLabel: "Angry",
    value: 4,
    description: "The pressure is high and your body wants to react.",
    accent: "#ef6a58",
    glow: "rgba(239, 106, 88, 0.28)",
  },
  {
    id: "explosive",
    label: "Explosive",
    shortLabel: "Explosive",
    value: 5,
    description: "You need a stronger pause before responding to anything.",
    accent: "#f04f74",
    glow: "rgba(240, 79, 116, 0.3)",
  },
];

export const toolOptions: ToolOption[] = [
  {
    id: "pillow",
    name: "Impact Pillow",
    description: "Soft, safe, and ideal for quick pressure release.",
  },
  {
    id: "hammer",
    name: "Rubber Hammer",
    description: "A slightly louder ritual with playful bounce.",
  },
  {
    id: "paperball",
    name: "Paper Ball",
    description: "For compressing the noise into something you can let go.",
  },
  {
    id: "mute",
    name: "World Mute Switch",
    description: "A symbolic way to quiet everything for a minute.",
  },
];

export const methodOptions: MethodOption[] = [
  {
    id: "smash",
    name: "Smash Loop",
    description: "Repeated taps crack the tension until the scene settles.",
    ritual: "Tap through the pressure until it stops pushing back.",
    target: 9,
  },
  {
    id: "hold",
    name: "Pressure Hold",
    description: "Press and hold to release pressure without escalation.",
    ritual: "Hold steady and let the pressure drain instead of spill out.",
    target: 100,
  },
];

export const needOptions: ReflectionOption<NeedId>[] = [
  {
    id: "space",
    label: "Space",
    description: "You need distance before you respond.",
  },
  {
    id: "clarity",
    label: "Clarity",
    description: "You need to understand what actually triggered this.",
  },
  {
    id: "support",
    label: "Support",
    description: "You need help, reassurance, or backup.",
  },
  {
    id: "rest",
    label: "Rest",
    description: "You are depleted and your nervous system wants recovery.",
  },
  {
    id: "movement",
    label: "Movement",
    description: "Your body needs to move before your mind can settle.",
  },
];

export const controlOptions: ReflectionOption<ControlId>[] = [
  {
    id: "response",
    label: "My response",
    description: "I can choose what I do next.",
  },
  {
    id: "boundary",
    label: "My boundary",
    description: "I can protect my time, energy, or access.",
  },
  {
    id: "timing",
    label: "My timing",
    description: "I can delay the conversation until I am steadier.",
  },
  {
    id: "expectation",
    label: "My expectation",
    description: "I can adjust the story I am telling myself about this.",
  },
];

export function getMoodById(id: MoodId) {
  return moodOptions.find((mood) => mood.id === id) ?? moodOptions[0];
}

export function getToolById(id?: string) {
  return toolOptions.find((tool) => tool.id === id) ?? null;
}

export function getMethodById(id?: string) {
  return methodOptions.find((method) => method.id === id) ?? null;
}
