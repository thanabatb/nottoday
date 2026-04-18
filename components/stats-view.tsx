"use client";

import Link from "next/link";
import { ArrowLeft, BarChart3, FlameKindling, Trophy } from "lucide-react";
import { useAppState } from "@/components/app-state-provider";
import { getMoodById, moodOptions } from "@/lib/session-data";
import { formatLongDate, formatMetric } from "@/lib/session-logic";
import type { DaySummary } from "@/lib/types";

const weekdayLabels = ["S", "M", "T", "W", "T", "F", "S"];

function formatWeekLabel(weekStart: string) {
  return new Intl.DateTimeFormat("en", { month: "short", day: "numeric" }).format(new Date(`${weekStart}T12:00:00`));
}

function getHeatmapCellStyle(day: DaySummary) {
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

function buildDayTitle(day: DaySummary) {
  const formattedDay = new Intl.DateTimeFormat("en", { month: "short", day: "numeric" }).format(
    new Date(`${day.day}T12:00:00`),
  );

  if (day.completedSessions === 0) {
    return `${formattedDay}: no sessions`;
  }

  const moodValue = Math.max(1, Math.min(5, Math.round(day.averageMood || day.highestMood)));
  const mood = moodOptions[moodValue - 1];
  return `${formattedDay}: ${day.completedSessions} session${day.completedSessions === 1 ? "" : "s"}, ${mood.label.toLowerCase()} tone`;
}

function MetricCard({
  label,
  value,
  detail,
}: {
  label: string;
  value: string;
  detail: string;
}) {
  return (
    <div className="surface p-5">
      <p className="eyebrow mb-2">{label}</p>
      <p className="text-3xl font-semibold text-white/92">{value}</p>
      <p className="mt-3 text-sm leading-6 text-white/58">{detail}</p>
    </div>
  );
}

export function StatsView() {
  const { stats } = useAppState();
  const strongestDay = [...stats.weeklyTrend].sort((left, right) => right.averageMood - left.averageMood)[0];

  return (
    <main className="app-shell">
      <div className="mb-6 flex flex-wrap items-center justify-between gap-4">
        <div>
          <p className="eyebrow mb-3">Progress Tracking</p>
          <h1 className="text-4xl sm:text-5xl">Awareness, recovery, and calm-day signals.</h1>
        </div>

        <Link
          className="surface inline-flex items-center gap-2 px-4 py-3 text-sm font-medium transition hover:border-white/20"
          href="/"
        >
          <ArrowLeft className="size-4" />
          Back home
        </Link>
      </div>

      <section className="grid gap-4 lg:grid-cols-4">
        <MetricCard
          detail="Primary streak for the MVP. It rewards noticing your state."
          label="Awareness streak"
          value={`${stats.awarenessStreak}d`}
        />
        <MetricCard
          detail="Secondary signal for days where the temperature stayed low."
          label="Calm days"
          value={`${stats.calmDays}`}
        />
        <MetricCard
          detail="Average drop from before to after on full reset sessions."
          label="Recovery score"
          value={stats.fullSessions > 0 ? `${formatMetric(stats.averageRecovery)}` : "0.0"}
        />
        <MetricCard
          detail="All quick check-ins and full sessions combined."
          label="Total sessions"
          value={`${stats.totalSessions}`}
        />
      </section>

      <div className="mt-8 grid gap-8 xl:grid-cols-[1.2fr_0.85fr]">
        <section className="surface p-6 sm:p-8">
          <div className="mb-6 flex items-end justify-between gap-4">
            <div>
              <p className="eyebrow mb-3">Weekly heatmap</p>
              <h2 className="text-3xl">Emotion streaks across the last 12 weeks.</h2>
            </div>
            <BarChart3 className="size-6 text-white/45" />
          </div>

          <div className="overflow-x-auto pb-3">
            <div className="flex min-w-max items-start gap-2">
              <div className="mt-7 flex flex-col gap-2 pr-2">
                {weekdayLabels.map((label) => (
                  <div
                    key={label}
                    className="flex h-5 w-5 items-center justify-center text-[0.65rem] uppercase tracking-[0.2em] text-white/34 sm:h-6 sm:w-6"
                  >
                    {label}
                  </div>
                ))}
              </div>

              {stats.heatmapWeeks.map((week, index) => (
                <div key={week.weekStart} className="flex flex-col items-center gap-2">
                  <div className="h-5 text-center text-[0.62rem] uppercase tracking-[0.18em] text-white/38">
                    {index % 2 === 0 ? formatWeekLabel(week.weekStart) : ""}
                  </div>

                  {week.days.map((day) => (
                    <div
                      key={day.day}
                      className="h-5 w-5 rounded-[6px] border transition-transform hover:scale-110 sm:h-6 sm:w-6"
                      style={getHeatmapCellStyle(day)}
                      title={buildDayTitle(day)}
                    />
                  ))}
                </div>
              ))}
            </div>
          </div>

          <div className="mt-6 flex flex-wrap items-center gap-3 text-sm leading-6 text-white/64">
            <span>Average mood: {stats.totalSessions > 0 ? formatMetric(stats.averageMood) : "0.0"}/5</span>
            <span>Longest streak: {stats.longestAwarenessStreak} days</span>
            <span>Current streak: {stats.awarenessStreak} day{stats.awarenessStreak === 1 ? "" : "s"}</span>
          </div>

          <div className="mt-5 flex flex-wrap gap-3">
            {moodOptions.map((mood) => (
              <div
                key={mood.id}
                className="inline-flex items-center gap-2 rounded-full border border-white/8 bg-white/[0.03] px-3 py-2 text-xs uppercase tracking-[0.16em] text-white/56"
              >
                <span
                  className="h-3 w-3 rounded-[4px] border"
                  style={{ background: mood.accent, borderColor: `${mood.accent}66` }}
                />
                {mood.label}
              </div>
            ))}
          </div>
        </section>

        <section className="surface p-6 sm:p-8">
          <div className="mb-6 flex items-end justify-between gap-4">
            <div>
              <p className="eyebrow mb-3">Highlights</p>
              <h2 className="text-3xl">The current shape of your pattern.</h2>
            </div>
            <FlameKindling className="size-6 text-white/45" />
          </div>

          <div className="space-y-4">
            <div className="surface-soft p-4">
              <p className="text-sm text-white/55">Most-used ritual</p>
              <p className="mt-2 text-xl font-semibold text-white/92">
                {stats.mostUsedTool ?? "No full ritual yet"}
              </p>
              <p className="mt-2 text-sm leading-6 text-white/58">
                Most-used method: {stats.mostUsedMethod ?? "No method data yet"}
              </p>
            </div>

            <div className="surface-soft p-4">
              <p className="text-sm text-white/55">Highest recent day</p>
              <p className="mt-2 text-xl font-semibold text-white/92">
                {strongestDay?.completedSessions ? `${strongestDay.day}` : "No logged spikes this week"}
              </p>
              <p className="mt-2 text-sm leading-6 text-white/58">
                {strongestDay?.completedSessions
                  ? `Average mood ${formatMetric(strongestDay.averageMood)}/5`
                  : "Once sessions are logged, the weekly profile fills in automatically."}
              </p>
            </div>

            <div className="surface-soft p-4">
              <p className="text-sm text-white/55">Badges unlocked</p>
              <p className="mt-2 text-xl font-semibold text-white/92">{stats.unlockedBadges.length}</p>
              <p className="mt-2 text-sm leading-6 text-white/58">
                Milestones reward consistency, reflection, and emotional recovery instead of intensity.
              </p>
            </div>
          </div>
        </section>
      </div>

      <section className="mt-8 grid gap-8 xl:grid-cols-[1fr_1.1fr]">
        <div className="surface p-6 sm:p-8">
          <div className="mb-6 flex items-end justify-between gap-4">
            <div>
              <p className="eyebrow mb-3">Milestones</p>
              <h2 className="text-3xl">Warm, low-pressure badges.</h2>
            </div>
            <Trophy className="size-6 text-white/45" />
          </div>

          <div className="grid gap-4 md:grid-cols-2">
            {stats.unlockedBadges.length > 0 ? (
              stats.unlockedBadges.map((badge) => (
                <div key={badge.id} className="surface-soft p-4">
                  <p className="text-lg font-semibold text-white/92">{badge.name}</p>
                  <p className="mt-2 text-sm leading-6 text-white/58">{badge.description}</p>
                </div>
              ))
            ) : (
              <div className="surface-soft p-4 text-sm leading-7 text-white/58 md:col-span-2">
                No badges yet. The first one unlocks after a completed full reset.
              </div>
            )}
          </div>
        </div>

        <div className="surface p-6 sm:p-8">
          <div className="mb-6">
            <p className="eyebrow mb-3">Recent sessions</p>
            <h2 className="text-3xl">A short history of your pauses.</h2>
          </div>

          <div className="space-y-4">
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
                          {session.sessionType === "full" ? "Full reset session" : "Quick check-in"}
                        </p>
                      </div>
                      <span className="rounded-full border border-white/10 px-3 py-1 text-xs uppercase tracking-[0.22em] text-white/45">
                        {session.sessionType}
                      </span>
                    </div>
                    <div className="mt-4 flex items-center gap-3 text-sm text-white/68">
                      <span style={{ color: before.accent }}>{before.label}</span>
                      <span className="text-white/35">→</span>
                      <span style={{ color: after.accent }}>{after.label}</span>
                    </div>
                    {session.suggestion ? (
                      <p className="mt-3 text-sm leading-6 text-white/58">{session.suggestion.title}</p>
                    ) : null}
                  </div>
                );
              })
            ) : (
              <div className="surface-soft p-4 text-sm leading-7 text-white/58">
                The session history fills in after the first check-in.
              </div>
            )}
          </div>
        </div>
      </section>
    </main>
  );
}
