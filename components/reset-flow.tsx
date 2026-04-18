"use client";

import Image from "next/image";
import Link from "next/link";
import { AnimatePresence, motion } from "framer-motion";
import { ArrowRight, ShieldPlus, Sparkles, X } from "lucide-react";
import { useEffect, useState } from "react";
import { useAppState } from "@/components/app-state-provider";
import { LocaleToggle } from "@/components/locale-toggle";
import { getCopy, getIntlLocale, getWeekdayLabels } from "@/lib/i18n";
import { getControlOptions, getMoodById, getMoodOptions, getNeedOptions } from "@/lib/session-data";
import { buildCompletionLine, formatMetric, getMoodScaleSummary, resolveSuggestion } from "@/lib/session-logic";
import type { DaySummary, EmotionSession, FullSessionInput, Locale, MoodId } from "@/lib/types";

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
  locale,
  selected,
  onSelect,
  compact = false,
}: {
  locale: "en" | "th";
  selected: MoodId | null;
  onSelect: (moodId: MoodId) => void;
  compact?: boolean;
}) {
  const moodOptions = getMoodOptions(locale);

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
  offLabel,
  soundEnabled,
  onLabel,
  onToggle,
  className = "",
}: {
  offLabel: string;
  soundEnabled: boolean;
  onLabel: string;
  onToggle: () => void;
  className?: string;
}) {
  return (
    <button
      aria-label={soundEnabled ? offLabel : onLabel}
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
      <span className="sr-only">{soundEnabled ? onLabel : offLabel}</span>
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

function getHeatmapCellStyle(day: DaySummary, locale: Locale) {
  const moodOptions = getMoodOptions(locale);

  if (day.completedSessions === 0) {
    return {
      background: "rgba(255, 255, 255, 0.05)",
      borderColor: "rgba(255, 255, 255, 0.06)",
      boxShadow: "none",
    };
  }

  const moodIndex = Math.max(0, Math.min(moodOptions.length - 1, Math.round(day.averageMood || day.highestMood) - 1));
  const mood = moodOptions[moodIndex];
  const strength = Math.min(0.92, 0.38 + day.completedSessions * 0.14);

  return {
    background: `${mood.accent}${Math.round(strength * 255)
      .toString(16)
      .padStart(2, "0")}`,
    borderColor: `${mood.accent}66`,
    boxShadow: `0 0 0 1px ${mood.glow} inset`,
  };
}

function buildDayTitle(day: DaySummary, locale: Locale) {
  const formattedDay = new Intl.DateTimeFormat(getIntlLocale(locale), { month: "short", day: "numeric" }).format(
    new Date(`${day.day}T12:00:00`),
  );
  const moodOptions = getMoodOptions(locale);

  if (day.completedSessions === 0) {
    return locale === "th" ? `${formattedDay}: ไม่มีเซสชัน` : `${formattedDay}: no sessions`;
  }

  const moodValue = Math.max(1, Math.min(5, Math.round(day.averageMood || day.highestMood)));
  const mood = moodOptions[moodValue - 1];
  return locale === "th"
    ? `${formattedDay}: ${day.completedSessions} เซสชัน, โทนอารมณ์${mood.label}`
    : `${formattedDay}: ${day.completedSessions} session${day.completedSessions === 1 ? "" : "s"}, ${mood.label.toLowerCase()} tone`;
}

const initialDraft: FullSessionInput = {
  moodBefore: "frustrated",
  moodAfter: "irritated",
  toolId: "pillow",
  methodId: "smash",
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
  const locale = appState.preferences.locale;
  const copy = getCopy(locale);
  const needOptions = getNeedOptions(locale);
  const controlOptions = getControlOptions(locale);
  const soundEnabled = appState.preferences.soundEnabled;
  const targetHits = moodTargetHits[draft.moodBefore];
  const releasedPercent = Math.min(100, Math.round((hitCount / targetHits) * 100));
  const angerLevel = Math.max(0, 100 - releasedPercent);
  const currentWeekDays = stats.heatmapWeeks.at(-1)?.days ?? [];
  const currentMonthLabel = new Intl.DateTimeFormat(getIntlLocale(locale), { month: "long" }).format(new Date());
  const compactWeekdayLabels = getWeekdayLabels(locale, "compact");
  const completionSuggestion = resolveSuggestion(completedSession?.suggestion, locale);

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
  const handleLocaleToggle = () => {
    updatePreferences({
      locale: locale === "en" ? "th" : "en",
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
              <LocaleToggle className="locale-toggle-modal" locale={locale} onToggle={handleLocaleToggle} />
              <SoundToggleButton
                className="sound-toggle-modal"
                offLabel={copy.common.soundOff}
                onLabel={copy.common.soundOn}
                onToggle={handleSoundToggle}
                soundEnabled={soundEnabled}
              />

              <div className="border-b border-white/8 px-6 py-5 sm:px-8">
                <p className="eyebrow mb-2">{copy.reset.setupStage}</p>
                <div className="flex items-center justify-between gap-4">
                  <p className="text-sm uppercase tracking-[0.32em] text-white/58">{copy.reset.mood}</p>
                  <span className="rounded-full border border-white/10 px-3 py-1 text-xs uppercase tracking-[0.24em] text-white/55">
                    1/1
                  </span>
                </div>
              </div>

              <div className="px-6 py-6 sm:px-8 sm:py-8">
                <div className="text-center">
                  <StepHeader
                    description={copy.reset.moodDescription}
                    step={copy.reset.mood}
                    title={copy.reset.moodQuestion}
                  />
                  <div className="mx-auto mb-6 w-fit rounded-full border border-white/12 bg-white/[0.05] px-5 py-3 text-sm leading-7 text-white/66">
                    {copy.reset.currentAnswer}: {getMoodById(draft.moodBefore, locale).label}
                  </div>
                  <MoodPicker
                    locale={locale}
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
                    {copy.common.cancel}
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
          <LocaleToggle locale={locale} onToggle={handleLocaleToggle} />
          <SoundToggleButton
            offLabel={copy.common.soundOff}
            onLabel={copy.common.soundOn}
            onToggle={handleSoundToggle}
            soundEnabled={soundEnabled}
          />
          {stepIndex === 1 ? (
              <div className="relative min-h-[calc(100vh-3rem)] sm:min-h-[86vh]">
                <button
                  className="absolute left-0 top-0 z-10 rounded-full border border-white/12 bg-black/28 px-5 py-3 text-sm font-medium text-white/78 shadow-[0_18px_50px_rgba(0,0,0,0.24)] backdrop-blur-md transition hover:border-white/22 hover:bg-black/36"
                  onClick={closeAndReset}
                  type="button"
                >
                  {copy.common.exit}
                </button>

                <div className="flex min-h-[calc(100vh-3rem)] flex-col gap-5 pb-24 pt-16 sm:block sm:min-h-[86vh] sm:pb-0 sm:pt-0">
                  <div className="mx-auto w-full max-w-sm rounded-[28px] border border-white/12 bg-black/30 p-4 text-white shadow-[0_24px_80px_rgba(0,0,0,0.28)] backdrop-blur-md sm:absolute sm:left-0 sm:top-1/2 sm:mx-0 sm:w-40 sm:max-w-none sm:-translate-y-1/2 sm:p-4 md:w-44 lg:w-48 lg:p-5">
                    <p className="text-[0.68rem] uppercase tracking-[0.28em] text-white/52">{copy.reset.releaseStatus}</p>
                    <p className="mt-2 text-sm text-white/62">{getMoodById(draft.moodBefore, locale).label}</p>
                    <div className="mt-5 flex items-end gap-4">
                      <div className="relative h-40 w-5 overflow-hidden rounded-full bg-white/10 sm:h-56 md:h-64">
                        <motion.div
                          animate={{ height: `${angerLevel}%` }}
                          className="absolute inset-x-0 bottom-0 rounded-full bg-[linear-gradient(180deg,#ffb26b_0%,#ff5b4d_100%)]"
                          transition={{ duration: 0.18, ease: "easeOut" }}
                        />
                      </div>
                      <div className="pb-1">
                        <p className="text-[0.68rem] uppercase tracking-[0.24em] text-white/45">{copy.reset.angerLevel}</p>
                        <p className="mt-2 text-3xl font-semibold text-white">{angerLevel}%</p>
                        <p className="mt-1 text-sm text-white/56">{targetHits} {copy.reset.hitsToEmpty}</p>
                      </div>
                    </div>
                    <div className="mt-5 grid gap-3 sm:block sm:space-y-3">
                      <div className="rounded-[20px] border border-white/10 bg-white/[0.05] px-4 py-3">
                        <p className="text-[0.65rem] uppercase tracking-[0.24em] text-white/45">{copy.reset.released}</p>
                        <p className="mt-1 text-2xl font-semibold text-white">{100 - angerLevel}%</p>
                      </div>
                      <div className="rounded-[20px] border border-white/10 bg-white/[0.05] px-4 py-3">
                        <p className="text-[0.65rem] uppercase tracking-[0.24em] text-white/45">{copy.reset.hits}</p>
                        <p className="mt-1 text-2xl font-semibold text-white">{hitCount}</p>
                      </div>
                    </div>
                  </div>

                  <div className="mx-auto w-full max-w-[18rem] sm:absolute sm:left-1/2 sm:top-1/2 sm:max-w-none sm:w-[20rem] sm:-translate-x-1/2 sm:-translate-y-1/2 md:w-[24rem] lg:w-[28rem]">
                    <p className="mb-4 text-center text-[0.68rem] uppercase tracking-[0.26em] text-white/60">
                      {usesTouchInput ? copy.reset.tapPillow : copy.reset.clickPillow}
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
                      {copy.reset.finishRelease}
                    </button>
                  </div>
                </div>
              </div>
          ) : null}

          {stepIndex === 2 ? (
              <div className="mx-auto max-w-5xl">
                <div className="mb-8 flex items-start justify-between gap-6">
                  <div>
                    <p className="eyebrow mb-3">{copy.reset.reflection}</p>
                    <h2 className="text-5xl leading-none sm:text-6xl">{copy.reset.reflectionTitle}</h2>
                    <p className="mt-4 max-w-2xl text-base leading-8 text-white/68">
                      {copy.reset.reflectionDescription}
                    </p>
                  </div>

                  <button className="flow-close" onClick={closeAndReset} type="button">
                    <X className="size-4" />
                  </button>
                </div>

                <div className="space-y-6">
                  <div className="flow-panel p-5">
                    <p className="mb-3 text-sm font-medium text-white/74">{copy.reset.intenseNow}</p>
                    <MoodPicker
                      compact
                      onSelect={(moodAfter) => setDraft((current) => ({ ...current, moodAfter }))}
                      locale={locale}
                      selected={draft.moodAfter}
                    />
                  </div>

                  <div className="flow-panel p-5">
                    <p className="mb-3 text-sm font-medium text-white/74">{copy.reset.needMost}</p>
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
                    <p className="mb-3 text-sm font-medium text-white/74">{copy.reset.withinControl}</p>
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
                      {copy.reset.optionalNote}
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
                      placeholder={copy.reset.notePlaceholder}
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
                    {copy.reset.backToReleaseRoom}
                  </button>

                  <button
                    className="inline-flex items-center justify-center gap-2 rounded-full bg-white px-5 py-3 text-sm font-semibold text-slate-950 transition hover:-translate-y-0.5"
                    onClick={() => {
                      const session = saveResetSession({
                        ...draft,
                        releaseHitCount: hitCount,
                      });
                      setCompletedSession(session);
                      setStepIndex(3);
                    }}
                    type="button"
                  >
                    {copy.reset.viewSummary}
                    <ArrowRight className="size-4" />
                  </button>
                </div>
              </div>
          ) : null}

          {stepIndex === 3 && completedSession ? (
              <div className="mx-auto max-w-5xl">
                <div className="mb-8 flex items-start justify-between gap-6">
                  <div>
                    <p className="eyebrow mb-3">{copy.reset.end}</p>
                    <h2 className="text-5xl leading-none sm:text-6xl">{copy.reset.interruptedTitle}</h2>
                    <p className="mt-4 max-w-2xl text-base leading-8 text-white/68">
                      {buildCompletionLine(completedSession, locale)}
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
                      {copy.reset.suggestedNextStep}
                    </div>
                    <h3 className="mt-4 text-3xl">{completionSuggestion?.title}</h3>
                    <p className="mt-4 text-sm leading-7 text-white/70">{completionSuggestion?.description}</p>
                    <div className="mt-6 inline-flex items-center gap-2 rounded-full bg-white/90 px-4 py-3 text-sm font-semibold text-slate-950">
                      <ShieldPlus className="size-4" />
                      {completionSuggestion?.actionLabel}
                    </div>
                  </div>

                  <div className="space-y-4">
                    <div className="flow-panel p-5">
                      <p className="eyebrow mb-3">{copy.reset.moodShift}</p>
                      <p className="text-xl font-semibold text-white/92">
                        {getMoodById(completedSession.moodBefore, locale).label} {copy.reset.moodShiftConnector}{" "}
                        {getMoodById(completedSession.moodAfter, locale).label}
                      </p>
                    </div>
                    <div className="flow-panel p-5">
                      <p className="eyebrow mb-3">{copy.reset.awarenessStreak}</p>
                      <p className="text-xl font-semibold text-white/92">
                        {stats.awarenessStreak} {stats.awarenessStreak === 1 ? copy.common.day : copy.common.days}
                      </p>
                      <div className="mt-4 rounded-[22px] border border-white/8 bg-white/[0.03] p-4">
                        <p className="text-[0.68rem] uppercase tracking-[0.22em] text-white/38">{currentMonthLabel}</p>
                        <div className="mt-4 grid grid-cols-7 gap-2">
                          {currentWeekDays.map((day, index) => (
                            <div key={day.day} className="flex flex-col items-center gap-2 text-center">
                              <p className="text-[0.58rem] uppercase tracking-[0.14em] text-white/34">
                                {compactWeekdayLabels[index]}
                              </p>
                              <div
                                className="h-6 w-6 rounded-[7px] border sm:h-7 sm:w-7"
                                style={getHeatmapCellStyle(day, locale)}
                                title={buildDayTitle(day, locale)}
                              />
                              <p className="text-[0.6rem] text-white/36">
                                {new Date(`${day.day}T12:00:00`).getDate()}
                              </p>
                            </div>
                          ))}
                        </div>
                      </div>
                      <div className="mt-3 flex flex-wrap gap-3 text-xs leading-5 text-white/54">
                        <span>{copy.reset.longest}: {stats.longestAwarenessStreak} {copy.common.days}</span>
                        <span>{copy.reset.averageMood}: {stats.totalSessions > 0 ? formatMetric(stats.averageMood) : "0.0"}/5</span>
                      </div>
                    </div>
                    <div className="flow-panel p-5">
                      <p className="eyebrow mb-3">{copy.reset.scale}</p>
                      <p className="text-sm leading-7 text-white/65">{getMoodScaleSummary(locale)}</p>
                    </div>
                  </div>
                </div>

                <div className="mt-10 flex flex-col-reverse gap-3 sm:flex-row sm:justify-end">
                  <Link
                    className="inline-flex items-center justify-center rounded-full bg-white px-5 py-3 text-sm font-semibold text-slate-950 transition hover:-translate-y-0.5"
                    href="/stats"
                    onClick={closeAndReset}
                  >
                    {copy.reset.viewPattern}
                  </Link>
                  <button
                    className="rounded-full border border-white/12 bg-white/[0.04] px-5 py-3 text-sm font-medium text-white/72 transition hover:border-white/22 hover:bg-white/[0.08]"
                    onClick={closeAndReset}
                    type="button"
                  >
                    {copy.common.close}
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
