"use client";

import { AnimatePresence, motion } from "framer-motion";
import { ArrowRight, ShieldPlus, Sparkles, X } from "lucide-react";
import { useEffect, useId, useRef, useState } from "react";
import { useAppState } from "@/components/app-state-provider";
import { controlOptions, getMoodById, methodOptions, moodOptions, needOptions, toolOptions } from "@/lib/session-data";
import { buildCompletionLine, formatMetric, getMoodScaleSummary } from "@/lib/session-logic";
import type { EmotionSession, FullSessionInput, MethodId, MoodId } from "@/lib/types";

const transition = { duration: 0.26, ease: [0.22, 1, 0.36, 1] as const };

function MoodPicker({
  selected,
  onSelect,
  compact = false,
}: {
  selected: MoodId;
  onSelect: (moodId: MoodId) => void;
  compact?: boolean;
}) {
  return (
    <div className={`grid gap-3 ${compact ? "sm:grid-cols-5" : "md:grid-cols-2 xl:grid-cols-3"}`}>
      {moodOptions.map((mood) => (
        <button
          key={mood.id}
          className={`rounded-[22px] border px-4 py-4 text-left transition ${
            selected === mood.id
              ? "border-white/25 bg-white/10"
              : "border-white/8 bg-white/[0.03] hover:border-white/16"
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

function ReleaseMechanic({
  methodId,
  progress,
  onProgress,
}: {
  methodId: MethodId;
  progress: number;
  onProgress: (progress: number) => void;
}) {
  const method = methodOptions.find((option) => option.id === methodId) ?? methodOptions[0];
  const [impacts, setImpacts] = useState<number[]>([]);
  const effectId = useId();
  const holdIntervalRef = useRef<number | null>(null);
  const progressRef = useRef(progress);

  const stopHold = () => {
    if (holdIntervalRef.current !== null) {
      window.clearInterval(holdIntervalRef.current);
      holdIntervalRef.current = null;
    }
  };

  useEffect(() => {
    progressRef.current = progress;
  }, [progress]);

  useEffect(() => () => stopHold(), []);

  if (methodId === "smash") {
    return (
      <div className="surface-soft relative overflow-hidden px-5 py-8 text-center">
        <div className="pointer-events-none absolute inset-0 bg-[radial-gradient(circle_at_center,rgba(255,122,89,0.14),transparent_55%)]" />
        <div className="relative">
          <p className="text-sm uppercase tracking-[0.22em] text-white/52">{method.ritual}</p>
          <motion.button
            animate={{
              rotate: progress > 0 ? [0, -0.6, 0.5, 0] : 0,
              scale: progress >= 100 ? 0.97 : 1,
            }}
            className="relative mx-auto mt-8 flex h-52 w-52 items-center justify-center rounded-full border border-white/12 bg-white/8 text-2xl font-semibold text-white"
            onClick={() => {
              const nextProgress = Math.min(100, progress + 100 / method.target);
              const impactId = Date.now();

              onProgress(nextProgress);
              setImpacts((current) => [...current, impactId]);
              window.setTimeout(() => {
                setImpacts((current) => current.filter((item) => item !== impactId));
              }, 300);
            }}
            transition={transition}
            type="button"
          >
            <div className="absolute inset-4 rounded-full border border-dashed border-white/18" />
            <span>Not today</span>
            {impacts.map((impactId, index) => (
              <span
                key={`${effectId}-${impactId}`}
                className="pointer-events-none absolute size-4 rounded-full bg-orange-300/80 blur-[1px]"
                style={{
                  left: `${30 + (index % 3) * 20}%`,
                  top: `${18 + ((index + 1) % 4) * 14}%`,
                }}
              />
            ))}
          </motion.button>
          <div className="mx-auto mt-6 h-2 w-full max-w-sm overflow-hidden rounded-full bg-white/8">
            <div
              className="h-full rounded-full bg-[linear-gradient(90deg,#f4a261,#ef6351)] transition-all duration-200"
              style={{ width: `${progress}%` }}
            />
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="surface-soft relative overflow-hidden px-5 py-8 text-center">
      <div className="pointer-events-none absolute inset-0 bg-[radial-gradient(circle_at_center,rgba(125,244,197,0.14),transparent_58%)]" />
      <div className="relative">
        <p className="text-sm uppercase tracking-[0.22em] text-white/52">{method.ritual}</p>
        <div className="mx-auto mt-8 flex h-56 w-56 items-center justify-center rounded-full border border-white/12 bg-white/6">
          <button
            className="flex h-40 w-40 items-center justify-center rounded-full border border-white/15 bg-[radial-gradient(circle,#8ff0d030_0%,#ffffff08_70%)] text-lg font-semibold text-white"
            onPointerCancel={stopHold}
            onPointerDown={() => {
              stopHold();
              holdIntervalRef.current = window.setInterval(() => {
                const nextProgress = Math.min(100, progressRef.current + 4);

                progressRef.current = nextProgress;
                onProgress(nextProgress);

                if (nextProgress >= 100) {
                  stopHold();
                }
              }, 80);
            }}
            onPointerLeave={stopHold}
            onPointerUp={() => {
              stopHold();
              if (progressRef.current < 100) {
                const nextProgress = Math.min(100, progressRef.current + 8);

                progressRef.current = nextProgress;
                onProgress(nextProgress);
              }
            }}
            type="button"
          >
            Hold steady
          </button>
          <svg className="pointer-events-none absolute inset-0" viewBox="0 0 224 224">
            <circle cx="112" cy="112" fill="none" r="96" stroke="rgba(255,255,255,0.08)" strokeWidth="8" />
            <circle
              cx="112"
              cy="112"
              fill="none"
              r="96"
              stroke="#88f1d4"
              strokeDasharray={`${(progress / 100) * 603} 603`}
              strokeLinecap="round"
              strokeWidth="8"
              style={{ transform: "rotate(-90deg)", transformOrigin: "50% 50%" }}
            />
          </svg>
        </div>
        <p className="mt-5 text-sm text-white/65">{formatMetric(progress)}% settled</p>
      </div>
    </div>
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
    <div className="mb-6">
      <p className="eyebrow mb-3">{step}</p>
      <h2 className="text-3xl">{title}</h2>
      <p className="mt-3 max-w-2xl text-sm leading-7 text-white/62">{description}</p>
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
}: {
  open: boolean;
  onClose: () => void;
}) {
  const { saveResetSession, stats } = useAppState();
  const [stepIndex, setStepIndex] = useState(0);
  const [draft, setDraft] = useState<FullSessionInput>(initialDraft);
  const [releaseProgress, setReleaseProgress] = useState(0);
  const [completedSession, setCompletedSession] = useState<EmotionSession | null>(null);
  const canContinueFromRelease = releaseProgress >= 100;

  const closeAndReset = () => {
    onClose();
  };

  if (!open) {
    return null;
  }

  return (
    <AnimatePresence>
      <motion.div
        animate={{ opacity: 1 }}
        className="fixed inset-0 z-50 bg-slate-950/72 px-4 py-6 backdrop-blur-md"
        exit={{ opacity: 0 }}
        initial={{ opacity: 0 }}
      >
        <div className="mx-auto flex h-full max-w-5xl items-start justify-center overflow-y-auto">
          <motion.div
            animate={{ opacity: 1, y: 0, scale: 1 }}
            className="surface relative my-auto w-full overflow-hidden"
            exit={{ opacity: 0, y: 16, scale: 0.98 }}
            initial={{ opacity: 0, y: 24, scale: 0.98 }}
            transition={transition}
          >
            <div className="absolute inset-x-0 top-0 h-px bg-gradient-to-r from-transparent via-white/35 to-transparent" />
            <button
              className="absolute right-5 top-5 inline-flex size-10 items-center justify-center rounded-full border border-white/12 bg-white/6 text-white/70 transition hover:border-white/22"
              onClick={closeAndReset}
              type="button"
            >
              <X className="size-4" />
            </button>

            <div className="border-b border-white/8 px-6 py-5 sm:px-8">
              <div className="mb-4 flex items-center justify-between gap-4">
                <div>
                  <p className="eyebrow mb-2">Full Reset Session</p>
                  <p className="text-sm text-white/58">
                    {["Check-in", "Tool", "Method", "Release", "Reflection", "Completion"][stepIndex]}
                  </p>
                </div>
                <div className="rounded-full border border-white/10 px-3 py-1 text-xs uppercase tracking-[0.24em] text-white/55">
                  {stepIndex + 1}/6
                </div>
              </div>
              <div className="h-1 overflow-hidden rounded-full bg-white/8">
                <div
                  className="h-full rounded-full bg-[linear-gradient(90deg,#f3a75f,#8ef0cd)] transition-all duration-300"
                  style={{ width: `${((stepIndex + 1) / 6) * 100}%` }}
                />
              </div>
            </div>

            <div className="px-6 py-6 sm:px-8 sm:py-8">
              {stepIndex === 0 ? (
                <div>
                  <StepHeader
                    description="Start with the emotional level right now. It should be a fast gut-check, not a long analysis."
                    step="Check-In"
                    title="How charged are you?"
                  />
                  <MoodPicker
                    onSelect={(moodBefore) => setDraft((current) => ({ ...current, moodBefore }))}
                    selected={draft.moodBefore}
                  />
                </div>
              ) : null}

              {stepIndex === 1 ? (
                <div>
                  <StepHeader
                    description="Choose a symbolic tool that matches the emotional tone you want for this ritual."
                    step="Tool"
                    title="Pick the release object."
                  />
                  <div className="grid gap-4 md:grid-cols-2">
                    {toolOptions.map((tool) => (
                      <button
                        key={tool.id}
                        className={`rounded-[24px] border p-5 text-left transition ${
                          draft.toolId === tool.id
                            ? "border-white/24 bg-white/10"
                            : "border-white/8 bg-white/[0.03] hover:border-white/18"
                        }`}
                        onClick={() => setDraft((current) => ({ ...current, toolId: tool.id }))}
                        type="button"
                      >
                        <p className="eyebrow mb-3">Ritual tool</p>
                        <h3 className="text-2xl">{tool.name}</h3>
                        <p className="mt-3 text-sm leading-6 text-white/62">{tool.description}</p>
                      </button>
                    ))}
                  </div>
                </div>
              ) : null}

              {stepIndex === 2 ? (
                <div>
                  <StepHeader
                    description="Methods create different interaction patterns. Keep it satisfying, but brief."
                    step="Method"
                    title="Choose the release pattern."
                  />
                  <div className="grid gap-4 md:grid-cols-2">
                    {methodOptions.map((method) => (
                      <button
                        key={method.id}
                        className={`rounded-[24px] border p-5 text-left transition ${
                          draft.methodId === method.id
                            ? "border-white/24 bg-white/10"
                            : "border-white/8 bg-white/[0.03] hover:border-white/18"
                        }`}
                        onClick={() => {
                          setDraft((current) => ({ ...current, methodId: method.id }));
                          setReleaseProgress(0);
                        }}
                        type="button"
                      >
                        <p className="eyebrow mb-3">Interaction</p>
                        <h3 className="text-2xl">{method.name}</h3>
                        <p className="mt-3 text-sm leading-6 text-white/62">{method.description}</p>
                      </button>
                    ))}
                  </div>
                </div>
              ) : null}

              {stepIndex === 3 ? (
                <div>
                  <StepHeader
                    description="The release moment should feel good enough to interrupt the spiral, then stop before it becomes the whole point."
                    step="Release"
                    title="Complete the ritual."
                  />

                  <ReleaseMechanic
                    methodId={draft.methodId}
                    onProgress={setReleaseProgress}
                    progress={releaseProgress}
                  />

                  <div className="mt-5 rounded-[24px] border border-white/8 bg-white/[0.03] p-4 text-sm leading-7 text-white/60">
                    {draft.methodId === "smash"
                      ? "Tap the orb until the shell cracks and the progress bar fills."
                      : "Press and hold until the ring completes. Release early if you need to reset your grip."}
                  </div>
                </div>
              ) : null}

              {stepIndex === 4 ? (
                <div>
                  <StepHeader
                    description="After the release, the tone softens. Capture what shifted and what you need next."
                    step="Reflection"
                    title="What feels true now?"
                  />

                  <div className="space-y-6">
                    <div>
                      <p className="mb-3 text-sm font-medium text-white/74">How intense is it now?</p>
                      <MoodPicker
                        compact
                        onSelect={(moodAfter) => setDraft((current) => ({ ...current, moodAfter }))}
                        selected={draft.moodAfter}
                      />
                    </div>

                    <div>
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

                    <div>
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

                    <div>
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
                </div>
              ) : null}

              {stepIndex === 5 && completedSession ? (
                <div>
                  <StepHeader
                    description={buildCompletionLine(completedSession)}
                    step="Completion"
                    title="You interrupted the spiral."
                  />

                  <div className="grid gap-4 lg:grid-cols-[1.1fr_0.85fr]">
                    <div className="rounded-[28px] border border-emerald-200/14 bg-[linear-gradient(180deg,rgba(145,244,196,0.12),rgba(255,255,255,0.04))] p-6">
                      <div className="inline-flex items-center gap-2 rounded-full border border-emerald-200/20 px-3 py-1 text-xs uppercase tracking-[0.24em] text-emerald-100/75">
                        <Sparkles className="size-4" />
                        Suggested next step
                      </div>
                      <h3 className="mt-4 text-3xl">{completedSession.suggestion?.title}</h3>
                      <p className="mt-4 text-sm leading-7 text-white/70">
                        {completedSession.suggestion?.description}
                      </p>
                      <div className="mt-6 inline-flex items-center gap-2 rounded-full bg-white/90 px-4 py-3 text-sm font-semibold text-slate-950">
                        <ShieldPlus className="size-4" />
                        {completedSession.suggestion?.actionLabel}
                      </div>
                    </div>

                    <div className="space-y-4">
                      <div className="rounded-[24px] border border-white/10 bg-white/[0.04] p-5">
                        <p className="eyebrow mb-3">Mood shift</p>
                        <p className="text-xl font-semibold text-white/92">
                          {getMoodById(completedSession.moodBefore).label} to{" "}
                          {getMoodById(completedSession.moodAfter).label}
                        </p>
                      </div>
                      <div className="rounded-[24px] border border-white/10 bg-white/[0.04] p-5">
                        <p className="eyebrow mb-3">Awareness streak</p>
                        <p className="text-xl font-semibold text-white/92">
                          {stats.awarenessStreak} day{stats.awarenessStreak === 1 ? "" : "s"}
                        </p>
                      </div>
                      <div className="rounded-[24px] border border-white/10 bg-white/[0.04] p-5">
                        <p className="eyebrow mb-3">Scale</p>
                        <p className="text-sm leading-7 text-white/65">{getMoodScaleSummary()}</p>
                      </div>
                    </div>
                  </div>
                </div>
              ) : null}

              <div className="mt-8 flex flex-col-reverse gap-3 border-t border-white/8 pt-5 sm:flex-row sm:items-center sm:justify-between">
                <button
                  className="rounded-full border border-white/12 px-5 py-3 text-sm font-medium text-white/70 transition hover:border-white/22"
                  onClick={() => {
                    if (stepIndex === 0) {
                      closeAndReset();
                      return;
                    }

                    if (stepIndex === 5) {
                      closeAndReset();
                      return;
                    }

                    setStepIndex((current) => Math.max(0, current - 1));
                  }}
                  type="button"
                >
                  {stepIndex === 0 ? "Cancel" : stepIndex === 5 ? "Close" : "Back"}
                </button>

                {stepIndex < 5 ? (
                  <button
                    className="inline-flex items-center justify-center gap-2 rounded-full bg-white px-5 py-3 text-sm font-semibold text-slate-950 transition hover:-translate-y-0.5 disabled:cursor-not-allowed disabled:opacity-40"
                    disabled={stepIndex === 3 && !canContinueFromRelease}
                    onClick={() => {
                      if (stepIndex === 4) {
                        const session = saveResetSession(draft);
                        setCompletedSession(session);
                        setStepIndex(5);
                        return;
                      }

                      setStepIndex((current) => Math.min(5, current + 1));
                    }}
                    type="button"
                  >
                    {stepIndex === 4 ? "Finish reset" : "Continue"}
                    <ArrowRight className="size-4" />
                  </button>
                ) : null}
              </div>
            </div>
          </motion.div>
        </div>
      </motion.div>
    </AnimatePresence>
  );
}
