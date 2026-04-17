"use client";

import Image from "next/image";
import { AnimatePresence, motion } from "framer-motion";
import { ArrowRight, ShieldPlus, Sparkles, X } from "lucide-react";
import { useEffect, useState } from "react";
import { useAppState } from "@/components/app-state-provider";
import { controlOptions, getMoodById, methodOptions, moodOptions, needOptions, toolOptions } from "@/lib/session-data";
import { buildCompletionLine, getMoodScaleSummary } from "@/lib/session-logic";
import type { EmotionSession, FullSessionInput, MoodId } from "@/lib/types";

const transition = { duration: 0.26, ease: [0.22, 1, 0.36, 1] as const };
const moodTargetHits: Record<MoodId, number> = {
  calm: 8,
  irritated: 16,
  frustrated: 28,
  angry: 45,
  explosive: 80,
};
type SmashEffect = {
  id: number;
  left: number;
  top: number;
  rotation: number;
  size: number;
};

function MoodPicker({
  selected,
  onSelect,
  compact = false,
}: {
  selected: MoodId | null;
  onSelect: (moodId: MoodId) => void;
  compact?: boolean;
}) {
  return (
    <div className={`grid gap-3 ${compact ? "sm:grid-cols-5" : "md:grid-cols-2 xl:grid-cols-5"}`}>
      {moodOptions.map((mood) => (
        <button
          key={mood.id}
          className={`text-left transition ${
            selected === mood.id
              ? "border-white/28 bg-white/12"
              : "border-white/10 bg-white/[0.04] hover:border-white/18 hover:bg-white/[0.06]"
          } ${
            compact
              ? "rounded-[22px] border px-4 py-4"
              : "min-h-40 rounded-[28px] border px-5 py-5 backdrop-blur-md"
          }`}
          onClick={() => onSelect(mood.id)}
          type="button"
          style={{
            boxShadow: selected === mood.id ? `0 0 0 1px ${mood.glow} inset` : undefined,
          }}
        >
          <p className="text-xs uppercase tracking-[0.22em] text-white/45">{mood.value}/5</p>
          <p className="mt-3 text-lg font-semibold" style={{ color: mood.accent }}>
            {mood.label}
          </p>
          {!compact ? <p className="mt-2 text-sm leading-6 text-white/62">{mood.description}</p> : null}
        </button>
      ))}
    </div>
  );
}

function SoundToggleButton({
  soundEnabled,
  onToggle,
  className = "",
}: {
  soundEnabled: boolean;
  onToggle: () => void;
  className?: string;
}) {
  return (
    <button
      aria-label={soundEnabled ? "Turn landing sound off" : "Turn landing sound on"}
      className={`sound-toggle ${className}`.trim()}
      data-enabled={soundEnabled}
      onClick={onToggle}
      type="button"
    >
      <Image
        alt=""
        aria-hidden="true"
        className="sound-toggle-icon"
        height={24}
        src="/illustrations/volume-high.svg"
        width={24}
      />
      <span className="sr-only">{soundEnabled ? "Sound On" : "Sound Off"}</span>
    </button>
  );
}

function StepHeader({
  step,
  title,
  description,
}: {
  step: string;
  title: string;
  description: string;
}) {
  return (
    <div className="mb-8 text-center lg:text-left">
      <div className="inline-flex rounded-full border border-white/14 bg-white/[0.04] px-4 py-2 text-[0.68rem] uppercase tracking-[0.28em] text-white/58">
        {step}
      </div>
      <h2 className="mt-5 text-4xl leading-none sm:text-5xl">{title}</h2>
      <p className="mx-auto mt-4 max-w-2xl text-sm leading-7 text-white/66 lg:mx-0">{description}</p>
    </div>
  );
}

const initialDraft: FullSessionInput = {
  moodBefore: "frustrated",
  moodAfter: "irritated",
  toolId: toolOptions[0].id,
  methodId: methodOptions[0].id,
  needId: "space",
  controlId: "response",
  note: "",
};

export function ResetFlow({
  open,
  onClose,
  onSoundtrackChange,
}: {
  open: boolean;
  onClose: () => void;
  onSoundtrackChange: (track: "main" | "ending") => void;
}) {
  const { appState, saveResetSession, stats, updatePreferences } = useAppState();
  const [stepIndex, setStepIndex] = useState(0);
  const [draft, setDraft] = useState<FullSessionInput>(initialDraft);
  const [pillowBroken, setPillowBroken] = useState(false);
  const [smashEffects, setSmashEffects] = useState<SmashEffect[]>([]);
  const [hitCount, setHitCount] = useState(0);
  const [completedSession, setCompletedSession] = useState<EmotionSession | null>(null);
  const [usesTouchInput, setUsesTouchInput] = useState(false);
  const soundEnabled = appState.preferences.soundEnabled;
  const targetHits = moodTargetHits[draft.moodBefore];
  const releasedPercent = Math.min(100, Math.round((hitCount / targetHits) * 100));
  const angerLevel = Math.max(0, 100 - releasedPercent);

  const spawnSmashEffect = () => {
    const id = Date.now() + Math.floor(Math.random() * 10000);
    const nextEffect: SmashEffect = {
      id,
      left: 18 + Math.random() * 64,
      top: 12 + Math.random() * 68,
      rotation: -28 + Math.random() * 56,
      size: 20 + Math.random() * 24,
    };

    setSmashEffects((current) => [...current, nextEffect]);
    window.setTimeout(() => {
      setSmashEffects((current) => current.filter((effect) => effect.id !== id));
    }, 320);
  };

  const handlePillowPressStart = () => {
    if (pillowBroken) {
      return;
    }

    setPillowBroken(true);
    setHitCount((current) => current + 1);
    spawnSmashEffect();
  };

  const handlePillowPressEnd = () => {
    setPillowBroken(false);
  };

  const resetFlowState = () => {
    setStepIndex(0);
    setDraft(initialDraft);
    setPillowBroken(false);
    setSmashEffects([]);
    setHitCount(0);
    setCompletedSession(null);
  };

  const closeAndReset = () => {
    resetFlowState();
    onClose();
  };
  const handleSoundToggle = () => {
    updatePreferences({
      soundEnabled: !soundEnabled,
    });
  };

  useEffect(() => {
    if (!open) {
      return;
    }

    onSoundtrackChange(stepIndex >= 2 ? "ending" : "main");
  }, [onSoundtrackChange, open, stepIndex]);

  useEffect(() => {
    if (typeof window === "undefined") {
      return;
    }

    const mediaQuery = window.matchMedia("(pointer: coarse)");
    const updateInputMode = () => {
      setUsesTouchInput(mediaQuery.matches || window.navigator.maxTouchPoints > 0);
    };

    updateInputMode();
    mediaQuery.addEventListener("change", updateInputMode);

    return () => {
      mediaQuery.removeEventListener("change", updateInputMode);
    };
  }, []);

  if (!open) {
    return null;
  }

  return (
    <AnimatePresence>
      {stepIndex === 0 ? (
        <motion.div
          animate={{ opacity: 1 }}
          className="fixed inset-0 z-50 overflow-y-auto bg-slate-950/72 px-4 py-6 backdrop-blur-md"
          exit={{ opacity: 0 }}
          initial={{ opacity: 0 }}
        >
          <div className="mx-auto flex min-h-full max-w-4xl items-start justify-center py-12 sm:items-center sm:py-0">
            <motion.div
              animate={{ opacity: 1, y: 0, scale: 1 }}
              className="surface relative max-h-[calc(100vh-3rem)] w-full overflow-x-hidden overflow-y-auto sm:max-h-none"
              exit={{ opacity: 0, y: 16, scale: 0.98 }}
              initial={{ opacity: 0, y: 24, scale: 0.98 }}
              transition={transition}
            >
              <div className="absolute inset-x-0 top-0 h-px bg-gradient-to-r from-transparent via-white/35 to-transparent" />
              <button className="flow-close absolute right-5 top-5" onClick={closeAndReset} type="button">
                <X className="size-4" />
              </button>
              <SoundToggleButton className="sound-toggle-modal" onToggle={handleSoundToggle} soundEnabled={soundEnabled} />

              <div className="border-b border-white/8 px-6 py-5 sm:px-8">
                <p className="eyebrow mb-2">Setup Stage</p>
                <div className="flex items-center justify-between gap-4">
                  <p className="text-sm uppercase tracking-[0.32em] text-white/58">Mood</p>
                  <span className="rounded-full border border-white/10 px-3 py-1 text-xs uppercase tracking-[0.24em] text-white/55">
                    1/1
                  </span>
                </div>
              </div>

              <div className="px-6 py-6 sm:px-8 sm:py-8">
                <div className="text-center">
                  <StepHeader
                    description="Choose the answer that matches right now. After you pick one, the release room opens."
                    step="Mood"
                    title="What's your mood today?"
                  />
                  <div className="mx-auto mb-6 w-fit rounded-full border border-white/12 bg-white/[0.05] px-5 py-3 text-sm leading-7 text-white/66">
                    Current answer: {getMoodById(draft.moodBefore).label}
                  </div>
                  <MoodPicker
                    onSelect={(moodBefore) => {
                      setDraft((current) => ({ ...current, moodBefore }));
                      setPillowBroken(false);
                      setSmashEffects([]);
                      setHitCount(0);
                      setStepIndex(1);
                    }}
                    selected={draft.moodBefore}
                  />
                </div>

                <div className="mt-10 flex justify-start border-t border-white/8 pt-5">
                  <button
                    className="rounded-full border border-white/12 bg-white/[0.04] px-5 py-3 text-sm font-medium text-white/72 transition hover:border-white/22 hover:bg-white/[0.08]"
                    onClick={closeAndReset}
                    type="button"
                  >
                    Cancel
                  </button>
                </div>
              </div>
            </motion.div>
          </div>
        </motion.div>
      ) : (
        <motion.div
          animate={{ opacity: 1 }}
          className="flow-screen z-50"
          exit={{ opacity: 0 }}
          initial={{ opacity: 0 }}
          style={stepIndex >= 2 ? { backgroundImage: "url('/illustrations/reflect_bg.png')" } : undefined}
        >
          <div className="relative mx-auto min-h-screen w-full max-w-7xl px-4 py-6 sm:px-8">
          <SoundToggleButton onToggle={handleSoundToggle} soundEnabled={soundEnabled} />
          {stepIndex === 1 ? (
              <div className="relative min-h-[calc(100vh-3rem)] sm:min-h-[86vh]">
                <button
                  className="absolute left-0 top-0 z-10 rounded-full border border-white/12 bg-black/28 px-5 py-3 text-sm font-medium text-white/78 shadow-[0_18px_50px_rgba(0,0,0,0.24)] backdrop-blur-md transition hover:border-white/22 hover:bg-black/36"
                  onClick={closeAndReset}
                  type="button"
                >
                  Exit
                </button>

                <div className="flex min-h-[calc(100vh-3rem)] flex-col gap-5 pb-24 pt-16 sm:block sm:min-h-[86vh] sm:pb-0 sm:pt-0">
                  <div className="mx-auto w-full max-w-sm rounded-[28px] border border-white/12 bg-black/30 p-4 text-white shadow-[0_24px_80px_rgba(0,0,0,0.28)] backdrop-blur-md sm:absolute sm:left-0 sm:top-1/2 sm:mx-0 sm:w-40 sm:max-w-none sm:-translate-y-1/2 sm:p-4 md:w-44 lg:w-48 lg:p-5">
                    <p className="text-[0.68rem] uppercase tracking-[0.28em] text-white/52">Release Status</p>
                    <p className="mt-2 text-sm text-white/62">{getMoodById(draft.moodBefore).label} mood</p>
                    <div className="mt-5 flex items-end gap-4">
                      <div className="relative h-40 w-5 overflow-hidden rounded-full bg-white/10 sm:h-56 md:h-64">
                        <motion.div
                          animate={{ height: `${angerLevel}%` }}
                          className="absolute inset-x-0 bottom-0 rounded-full bg-[linear-gradient(180deg,#ffb26b_0%,#ff5b4d_100%)]"
                          transition={{ duration: 0.18, ease: "easeOut" }}
                        />
                      </div>
                      <div className="pb-1">
                        <p className="text-[0.68rem] uppercase tracking-[0.24em] text-white/45">Anger Level</p>
                        <p className="mt-2 text-3xl font-semibold text-white">{angerLevel}%</p>
                        <p className="mt-1 text-sm text-white/56">{targetHits} hits to empty</p>
                      </div>
                    </div>
                    <div className="mt-5 grid gap-3 sm:block sm:space-y-3">
                      <div className="rounded-[20px] border border-white/10 bg-white/[0.05] px-4 py-3">
                        <p className="text-[0.65rem] uppercase tracking-[0.24em] text-white/45">Released</p>
                        <p className="mt-1 text-2xl font-semibold text-white">{100 - angerLevel}%</p>
                      </div>
                      <div className="rounded-[20px] border border-white/10 bg-white/[0.05] px-4 py-3">
                        <p className="text-[0.65rem] uppercase tracking-[0.24em] text-white/45">Hits</p>
                        <p className="mt-1 text-2xl font-semibold text-white">{hitCount}</p>
                      </div>
                    </div>
                  </div>

                  <div className="mx-auto w-full max-w-[18rem] sm:absolute sm:left-1/2 sm:top-1/2 sm:max-w-none sm:w-[20rem] sm:-translate-x-1/2 sm:-translate-y-1/2 md:w-[24rem] lg:w-[28rem]">
                    <p className="mb-4 text-center text-[0.68rem] uppercase tracking-[0.26em] text-white/60">
                      {usesTouchInput ? "Tap" : "Click"} the pillow to release pressure
                    </p>
                    <div className="relative">
                      <AnimatePresence>
                        {smashEffects.map((effect) => (
                          <motion.div
                            key={effect.id}
                            animate={{ opacity: [0, 1, 0], scale: [0.72, 1, 1.08], y: [12, 0, -8] }}
                            className="pointer-events-none absolute z-10"
                            exit={{ opacity: 0, scale: 1.12 }}
                            initial={{ opacity: 0, scale: 0.72, y: 12 }}
                            style={{
                              left: `${effect.left}%`,
                              top: `${effect.top}%`,
                              rotate: `${effect.rotation}deg`,
                              width: `${effect.size}%`,
                            }}
                            transition={{ duration: 0.32, ease: "easeOut" }}
                          >
                            <Image
                              alt=""
                              aria-hidden="true"
                              className="h-auto w-full"
                              height={180}
                              src="/images/smash_effect.png"
                              width={180}
                            />
                          </motion.div>
                        ))}
                      </AnimatePresence>

                      <button
                        className="relative block w-full touch-manipulation select-none transition hover:scale-[1.02]"
                        onBlur={handlePillowPressEnd}
                        onKeyDown={(event) => {
                          if ((event.key === " " || event.key === "Enter") && !event.repeat) {
                            event.preventDefault();
                            handlePillowPressStart();
                          }
                        }}
                        onKeyUp={(event) => {
                          if (event.key === " " || event.key === "Enter") {
                            event.preventDefault();
                            handlePillowPressEnd();
                          }
                        }}
                        onMouseDown={handlePillowPressStart}
                        onMouseLeave={handlePillowPressEnd}
                        onMouseUp={handlePillowPressEnd}
                        onTouchCancel={handlePillowPressEnd}
                        onTouchEnd={handlePillowPressEnd}
                        onTouchStart={handlePillowPressStart}
                        type="button"
                      >
                        <Image
                          alt="Release pillow"
                          className="h-auto w-full drop-shadow-[0_24px_60px_rgba(0,0,0,0.35)]"
                          draggable={false}
                          height={420}
                          priority
                          src={pillowBroken ? "/images/pillow_break.png" : "/images/pillow_normal.png"}
                          width={520}
                        />
                      </button>
                    </div>
                  </div>

                  <div className="mx-auto mt-auto w-full max-w-xs sm:absolute sm:bottom-0 sm:left-1/2 sm:w-auto sm:max-w-none sm:-translate-x-1/2">
                    <button
                      className="start-button start-button-soft w-full sm:w-auto"
                      onClick={() => setStepIndex(2)}
                      type="button"
                    >
                      I&apos;m good now
                    </button>
                  </div>
                </div>
              </div>
          ) : null}

          {stepIndex === 2 ? (
              <div className="mx-auto max-w-5xl">
                <div className="mb-8 flex items-start justify-between gap-6">
                  <div>
                    <p className="eyebrow mb-3">Reflection</p>
                    <h2 className="text-5xl leading-none sm:text-6xl">What feels true now?</h2>
                    <p className="mt-4 max-w-2xl text-base leading-8 text-white/68">
                      The release is over. Capture what changed and what you need next.
                    </p>
                  </div>

                  <button className="flow-close" onClick={closeAndReset} type="button">
                    <X className="size-4" />
                  </button>
                </div>

                <div className="space-y-6">
                  <div className="flow-panel p-5">
                    <p className="mb-3 text-sm font-medium text-white/74">How intense is it now?</p>
                    <MoodPicker
                      compact
                      onSelect={(moodAfter) => setDraft((current) => ({ ...current, moodAfter }))}
                      selected={draft.moodAfter}
                    />
                  </div>

                  <div className="flow-panel p-5">
                    <p className="mb-3 text-sm font-medium text-white/74">What do you need most?</p>
                    <div className="grid gap-3 md:grid-cols-2">
                      {needOptions.map((option) => (
                        <button
                          key={option.id}
                          className={`rounded-[20px] border p-4 text-left transition ${
                            draft.needId === option.id
                              ? "border-white/24 bg-white/10"
                              : "border-white/8 bg-white/[0.03] hover:border-white/18"
                          }`}
                          onClick={() => setDraft((current) => ({ ...current, needId: option.id }))}
                          type="button"
                        >
                          <p className="text-base font-semibold text-white/92">{option.label}</p>
                          <p className="mt-2 text-sm leading-6 text-white/60">{option.description}</p>
                        </button>
                      ))}
                    </div>
                  </div>

                  <div className="flow-panel p-5">
                    <p className="mb-3 text-sm font-medium text-white/74">What part is within your control?</p>
                    <div className="grid gap-3 md:grid-cols-2">
                      {controlOptions.map((option) => (
                        <button
                          key={option.id}
                          className={`rounded-[20px] border p-4 text-left transition ${
                            draft.controlId === option.id
                              ? "border-white/24 bg-white/10"
                              : "border-white/8 bg-white/[0.03] hover:border-white/18"
                          }`}
                          onClick={() => setDraft((current) => ({ ...current, controlId: option.id }))}
                          type="button"
                        >
                          <p className="text-base font-semibold text-white/92">{option.label}</p>
                          <p className="mt-2 text-sm leading-6 text-white/60">{option.description}</p>
                        </button>
                      ))}
                    </div>
                  </div>

                  <div className="flow-panel p-5">
                    <label className="mb-3 block text-sm font-medium text-white/74" htmlFor="session-note">
                      Optional note
                    </label>
                    <textarea
                      className="min-h-28 w-full rounded-[20px] border border-white/10 bg-white/[0.03] px-4 py-4 text-sm text-white outline-none placeholder:text-white/30 focus:border-white/20"
                      id="session-note"
                      onChange={(event) =>
                        setDraft((current) => ({
                          ...current,
                          note: event.target.value,
                        }))
                      }
                      placeholder="What sits underneath the anger?"
                      value={draft.note}
                    />
                  </div>
                </div>

                <div className="mt-10 flex flex-col-reverse gap-3 sm:flex-row sm:items-center sm:justify-between">
                  <button
                    className="rounded-full border border-white/12 bg-white/[0.04] px-5 py-3 text-sm font-medium text-white/72 transition hover:border-white/22 hover:bg-white/[0.08]"
                    onClick={() => setStepIndex(1)}
                    type="button"
                  >
                    Back To Release Room
                  </button>

                  <button
                    className="inline-flex items-center justify-center gap-2 rounded-full bg-white px-5 py-3 text-sm font-semibold text-slate-950 transition hover:-translate-y-0.5"
                    onClick={() => {
                      const session = saveResetSession(draft);
                      setCompletedSession(session);
                      setStepIndex(3);
                    }}
                    type="button"
                  >
                    View Summary
                    <ArrowRight className="size-4" />
                  </button>
                </div>
              </div>
          ) : null}

          {stepIndex === 3 && completedSession ? (
              <div className="mx-auto max-w-5xl">
                <div className="mb-8 flex items-start justify-between gap-6">
                  <div>
                    <p className="eyebrow mb-3">End</p>
                    <h2 className="text-5xl leading-none sm:text-6xl">You interrupted the spiral.</h2>
                    <p className="mt-4 max-w-2xl text-base leading-8 text-white/68">
                      {buildCompletionLine(completedSession)}
                    </p>
                  </div>

                  <button className="flow-close" onClick={closeAndReset} type="button">
                    <X className="size-4" />
                  </button>
                </div>

                <div className="grid gap-4 lg:grid-cols-[1.15fr_0.85fr]">
                  <div className="flow-panel bg-[linear-gradient(180deg,rgba(145,244,196,0.16),rgba(255,255,255,0.04))] p-6">
                    <div className="inline-flex items-center gap-2 rounded-full border border-emerald-200/20 px-3 py-1 text-xs uppercase tracking-[0.24em] text-emerald-100/75">
                      <Sparkles className="size-4" />
                      Suggested next step
                    </div>
                    <h3 className="mt-4 text-3xl">{completedSession.suggestion?.title}</h3>
                    <p className="mt-4 text-sm leading-7 text-white/70">{completedSession.suggestion?.description}</p>
                    <div className="mt-6 inline-flex items-center gap-2 rounded-full bg-white/90 px-4 py-3 text-sm font-semibold text-slate-950">
                      <ShieldPlus className="size-4" />
                      {completedSession.suggestion?.actionLabel}
                    </div>
                  </div>

                  <div className="space-y-4">
                    <div className="flow-panel p-5">
                      <p className="eyebrow mb-3">Mood shift</p>
                      <p className="text-xl font-semibold text-white/92">
                        {getMoodById(completedSession.moodBefore).label} to {getMoodById(completedSession.moodAfter).label}
                      </p>
                    </div>
                    <div className="flow-panel p-5">
                      <p className="eyebrow mb-3">Awareness streak</p>
                      <p className="text-xl font-semibold text-white/92">
                        {stats.awarenessStreak} day{stats.awarenessStreak === 1 ? "" : "s"}
                      </p>
                    </div>
                    <div className="flow-panel p-5">
                      <p className="eyebrow mb-3">Scale</p>
                      <p className="text-sm leading-7 text-white/65">{getMoodScaleSummary()}</p>
                    </div>
                  </div>
                </div>

                <div className="mt-10 flex justify-end">
                  <button
                    className="rounded-full border border-white/12 bg-white/[0.04] px-5 py-3 text-sm font-medium text-white/72 transition hover:border-white/22 hover:bg-white/[0.08]"
                    onClick={closeAndReset}
                    type="button"
                  >
                    Close
                  </button>
                </div>
              </div>
          ) : null}
        </div>
      </motion.div>
      )}
    </AnimatePresence>
  );
}
