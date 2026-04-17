"use client";

import Link from "next/link";
import { ArrowLeft, BarChart3, FlameKindling, Trophy } from "lucide-react";
import { useAppState } from "@/components/app-state-provider";
import { getMoodById } from "@/lib/session-data";
import { formatDayLabel, formatLongDate, formatMetric } from "@/lib/session-logic";

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
              <p className="eyebrow mb-3">Weekly trend</p>
              <h2 className="text-3xl">Mood intensity across the last 7 days.</h2>
            </div>
            <BarChart3 className="size-6 text-white/45" />
          </div>

          <div className="grid min-h-72 grid-cols-7 items-end gap-3">
            {stats.weeklyTrend.map((day) => {
              const height = day.averageMood > 0 ? `${Math.max(18, day.averageMood * 18)}%` : "10%";
              const tone =
                day.averageMood <= 2
                  ? "linear-gradient(180deg,#7ee7d1,#52b7c4)"
                  : day.averageMood <= 3.4
                    ? "linear-gradient(180deg,#f4cf78,#ef9d54)"
                    : "linear-gradient(180deg,#f28b69,#ef5f67)";

              return (
                <div key={day.day} className="flex h-full flex-col items-center justify-end gap-3">
                  <div className="flex w-full flex-1 items-end">
                    <div className="w-full overflow-hidden rounded-t-[18px] bg-white/6">
                      <div className="rounded-t-[18px] transition-all" style={{ height, background: tone }} />
                    </div>
                  </div>
                  <div className="text-center">
                    <p className="text-xs uppercase tracking-[0.22em] text-white/42">{formatDayLabel(day.day)}</p>
                    <p className="mt-1 text-sm text-white/66">
                      {day.completedSessions > 0 ? formatMetric(day.averageMood) : "–"}
                    </p>
                  </div>
                </div>
              );
            })}
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
