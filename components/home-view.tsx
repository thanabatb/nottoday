"use client";

import Link from "next/link";
import { BellOff, Flame, MoonStar, Sparkles, Volume2, VolumeX } from "lucide-react";
import { useState } from "react";
import { ResetFlow } from "@/components/reset-flow";
import { useAppState } from "@/components/app-state-provider";
import { getMoodById, moodOptions } from "@/lib/session-data";
import { buildCoachCopy, formatLongDate, formatMetric } from "@/lib/session-logic";
import type { MoodId } from "@/lib/types";

function HeroMetric({
  label,
  value,
  tone,
}: {
  label: string;
  value: string;
  tone?: string;
}) {
  return (
    <div className="surface-soft p-4">
      <p className="eyebrow mb-2">{label}</p>
      <p className="text-2xl font-semibold" style={{ color: tone }}>
        {value}
      </p>
    </div>
  );
}

function QuickMoodButton({
  moodId,
  onSelect,
}: {
  moodId: MoodId;
  onSelect: (moodId: MoodId) => void;
}) {
  const mood = getMoodById(moodId);

  return (
    <button
      className="surface-soft flex min-h-28 flex-col items-start justify-between p-4 text-left transition duration-200 hover:-translate-y-0.5 hover:border-white/20"
      onClick={() => onSelect(moodId)}
      type="button"
      style={{
        boxShadow: `0 0 0 1px ${mood.glow} inset`,
      }}
    >
      <span className="text-sm text-white/60">{mood.value}/5</span>
      <div>
        <p className="text-lg font-semibold" style={{ color: mood.accent }}>
          {mood.label}
        </p>
        <p className="mt-2 text-sm leading-6 text-white/65">{mood.description}</p>
      </div>
    </button>
  );
}

export function HomeView() {
  const { appState, hydrated, logQuickCheckIn, stats, updatePreferences } = useAppState();
  const [resetOpen, setResetOpen] = useState(false);
  const latestSession = stats.recentSessions[0];
  const sceneGlow =
    appState.preferences.scene === "storm"
      ? "radial-gradient(circle at 15% 20%, rgba(255, 138, 101, 0.18), transparent 28%), radial-gradient(circle at 78% 18%, rgba(122, 170, 255, 0.18), transparent 32%)"
      : "radial-gradient(circle at 20% 18%, rgba(255, 214, 125, 0.18), transparent 30%), radial-gradient(circle at 80% 15%, rgba(122, 241, 198, 0.16), transparent 33%)";

  return (
    <main className="app-shell">
      <div className="pointer-events-none absolute inset-0 -z-10 opacity-80" style={{ backgroundImage: sceneGlow }} />

      <div className="mb-6 flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
        <div>
          <p className="eyebrow mb-3">Emotional Reset MVP</p>
          <h1 className="max-w-3xl text-4xl leading-tight sm:text-5xl">
            Notice the spike. Release it safely. Leave steadier than you arrived.
          </h1>
        </div>

        <div className="flex flex-wrap gap-3">
          <button
            className="surface-soft inline-flex items-center gap-2 px-4 py-3 text-sm text-white/80 transition hover:border-white/20"
            onClick={() =>
              updatePreferences({
                scene: appState.preferences.scene === "storm" ? "sunrise" : "storm",
              })
            }
            type="button"
          >
            <MoonStar className="size-4" />
            Scene: {appState.preferences.scene}
          </button>

          <button
            className="surface-soft inline-flex items-center gap-2 px-4 py-3 text-sm text-white/80 transition hover:border-white/20"
            onClick={() =>
              updatePreferences({
                soundEnabled: !appState.preferences.soundEnabled,
              })
            }
            type="button"
          >
            {appState.preferences.soundEnabled ? (
              <Volume2 className="size-4" />
            ) : (
              <VolumeX className="size-4" />
            )}
            Sound: {appState.preferences.soundEnabled ? "On" : "Off"}
          </button>

          <Link
            className="surface inline-flex items-center gap-2 px-4 py-3 text-sm font-medium transition hover:border-white/20"
            href="/stats"
          >
            <Sparkles className="size-4" />
            View stats
          </Link>
        </div>
      </div>

      <section className="surface relative overflow-hidden p-6 sm:p-8">
        <div className="absolute inset-x-0 top-0 h-px bg-gradient-to-r from-transparent via-white/30 to-transparent" />
        <div className="grid gap-8 lg:grid-cols-[1.35fr_0.9fr]">
          <div>
            <p className="eyebrow mb-4">Today&apos;s emotional weather</p>
            <div className="flex items-center gap-3 text-white/65">
              <BellOff className="size-4" />
              <p>{hydrated && latestSession ? formatLongDate(latestSession.createdAt) : "No check-in yet today"}</p>
            </div>
            <p className="mt-6 max-w-2xl text-lg leading-8 text-white/72">
              {latestSession
                ? buildCoachCopy(latestSession.moodAfter)
                : "Open the app in seconds, log your current level, and decide whether you need a quick check-in or a full reset ritual."}
            </p>

            <div className="mt-8 flex flex-wrap gap-3">
              <button
                className="inline-flex items-center gap-2 rounded-full bg-white px-5 py-3 text-sm font-semibold text-slate-950 transition hover:-translate-y-0.5"
                onClick={() => setResetOpen(true)}
                type="button"
              >
                <Flame className="size-4" />
                Start full reset
              </button>

              <Link
                className="inline-flex items-center gap-2 rounded-full border border-white/14 bg-white/5 px-5 py-3 text-sm font-medium text-white/80 transition hover:border-white/22"
                href="/stats"
              >
                See recovery trend
              </Link>
            </div>
          </div>

          <div className="grid gap-4 sm:grid-cols-2">
            <HeroMetric
              label="Awareness streak"
              tone="#9ce8c2"
              value={`${stats.awarenessStreak} day${stats.awarenessStreak === 1 ? "" : "s"}`}
            />
            <HeroMetric label="Calm days" tone="#f7d287" value={`${stats.calmDays}`} />
            <HeroMetric label="Average mood" tone="#ffb47f" value={`${formatMetric(stats.averageMood || 0)}/5`} />
            <HeroMetric
              label="Recovery score"
              tone="#7ee7d1"
              value={stats.fullSessions > 0 ? `${formatMetric(stats.averageRecovery)}` : "0.0"}
            />
          </div>
        </div>
      </section>

      <div className="mt-8 grid gap-8 xl:grid-cols-[1.2fr_0.85fr]">
        <section className="surface p-6 sm:p-8">
          <div className="mb-6 flex items-end justify-between gap-4">
            <div>
              <p className="eyebrow mb-3">Quick Check-In</p>
              <h2 className="text-3xl">Log the emotional level in one tap.</h2>
            </div>
            <p className="max-w-xs text-sm leading-6 text-white/55">
              Awareness is the main streak. You do not need a dramatic session to keep showing up.
            </p>
          </div>

          <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-3">
            {moodOptions.map((mood) => (
              <QuickMoodButton key={mood.id} moodId={mood.id} onSelect={logQuickCheckIn} />
            ))}
          </div>
        </section>

        <section className="surface p-6 sm:p-8">
          <div className="mb-6">
            <p className="eyebrow mb-3">Recent Pattern</p>
            <h2 className="text-3xl">The app rewards awareness, not chaos.</h2>
          </div>

          <div className="space-y-4">
            <div className="surface-soft p-4">
              <p className="text-sm text-white/55">Most-used tool</p>
              <p className="mt-2 text-xl font-semibold text-white/92">
                {stats.mostUsedTool ?? "No ritual yet"}
              </p>
            </div>
            <div className="surface-soft p-4">
              <p className="text-sm text-white/55">Most-used method</p>
              <p className="mt-2 text-xl font-semibold text-white/92">
                {stats.mostUsedMethod ?? "Not enough data"}
              </p>
            </div>
            <div className="surface-soft p-4">
              <p className="text-sm text-white/55">Badges unlocked</p>
              <p className="mt-2 text-xl font-semibold text-white/92">
                {stats.unlockedBadges.length > 0 ? stats.unlockedBadges.length : "0"}
              </p>
              <p className="mt-2 text-sm leading-6 text-white/60">
                {stats.unlockedBadges[0]?.description ??
                  "Finish a full reset and keep checking in on calm days to unlock the first milestones."}
              </p>
            </div>
          </div>
        </section>
      </div>

      <section className="mt-8 grid gap-6 lg:grid-cols-[1fr_1fr_0.9fr]">
        <div className="surface p-6">
          <p className="eyebrow mb-3">Flow</p>
          <h3 className="text-2xl">1. Check in</h3>
          <p className="mt-3 text-sm leading-6 text-white/65">
            Choose the current level fast. The flow is designed to start within seconds.
          </p>
        </div>
        <div className="surface p-6">
          <p className="eyebrow mb-3">Flow</p>
          <h3 className="text-2xl">2. Release safely</h3>
          <p className="mt-3 text-sm leading-6 text-white/65">
            Symbolic tools and short interactions create relief without glorifying aggression.
          </p>
        </div>
        <div className="surface p-6">
          <p className="eyebrow mb-3">Flow</p>
          <h3 className="text-2xl">3. Reflect and recover</h3>
          <p className="mt-3 text-sm leading-6 text-white/65">
            Structured prompts and rule-based guidance shift the tone from charge to clarity.
          </p>
        </div>
      </section>

      <section className="mt-8 surface p-6 sm:p-8">
        <div className="mb-5 flex items-end justify-between gap-4">
          <div>
            <p className="eyebrow mb-3">Recent sessions</p>
            <h2 className="text-3xl">Your last few moments of pause.</h2>
          </div>
          <Link className="text-sm text-white/60 transition hover:text-white" href="/stats">
            Open full stats
          </Link>
        </div>

        <div className="grid gap-4 lg:grid-cols-2">
          {stats.recentSessions.length > 0 ? (
            stats.recentSessions.map((session) => {
              const before = getMoodById(session.moodBefore);
              const after = getMoodById(session.moodAfter);

              return (
                <div key={session.id} className="surface-soft p-4">
                  <div className="flex items-start justify-between gap-4">
                    <div>
                      <p className="text-sm text-white/55">{formatLongDate(session.createdAt)}</p>
                      <p className="mt-2 text-lg font-semibold text-white/92">
                        {session.sessionType === "full" ? "Full reset" : "Quick check-in"}
                      </p>
                    </div>
                    <span className="rounded-full border border-white/10 px-3 py-1 text-xs uppercase tracking-[0.22em] text-white/55">
                      {session.sessionType}
                    </span>
                  </div>
                  <div className="mt-4 flex items-center gap-3 text-sm text-white/68">
                    <span style={{ color: before.accent }}>{before.shortLabel}</span>
                    <span className="text-white/35">→</span>
                    <span style={{ color: after.accent }}>{after.shortLabel}</span>
                  </div>
                  {session.suggestion ? (
                    <p className="mt-3 text-sm leading-6 text-white/58">{session.suggestion.title}</p>
                  ) : null}
                </div>
              );
            })
          ) : (
            <div className="surface-soft p-5 text-sm leading-7 text-white/62 lg:col-span-2">
              No sessions yet. The app is ready for either a one-tap mood log or the full ritual.
            </div>
          )}
        </div>
      </section>

      <ResetFlow open={resetOpen} onClose={() => setResetOpen(false)} />
    </main>
  );
}

