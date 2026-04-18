"use client";

import Link from "next/link";
import { ArrowLeft, BarChart3, FlameKindling, Trophy } from "lucide-react";
import { useAppState } from "@/components/app-state-provider";
import { LocaleToggle } from "@/components/locale-toggle";
import { getCopy, getIntlLocale, getWeekdayLabels } from "@/lib/i18n";
import { getMoodById, getMoodOptions } from "@/lib/session-data";
import { formatLongDate, formatMetric, resolveSuggestion } from "@/lib/session-logic";
import type { DaySummary, MoodCountSummary } from "@/lib/types";

function formatWeekLabel(weekStart: string, locale: "en" | "th") {
  return new Intl.DateTimeFormat(getIntlLocale(locale), { month: "short", day: "numeric" }).format(new Date(`${weekStart}T12:00:00`));
}

function getHeatmapCellStyle(day: DaySummary, locale: "en" | "th") {
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

function buildDayTitle(day: DaySummary, locale: "en" | "th") {
  const formattedDay = new Intl.DateTimeFormat(getIntlLocale(locale), { month: "short", day: "numeric" }).format(
    new Date(`${day.day}T12:00:00`),
  );

  if (day.completedSessions === 0) {
    return locale === "th" ? `${formattedDay}: ไม่มีเซสชัน` : `${formattedDay}: no sessions`;
  }

  const moodValue = Math.max(1, Math.min(5, Math.round(day.averageMood || day.highestMood)));
  const mood = getMoodOptions(locale)[moodValue - 1];
  return locale === "th"
    ? `${formattedDay}: ${day.completedSessions} เซสชัน, อารมณ์โทน${mood.label}`
    : `${formattedDay}: ${day.completedSessions} session${day.completedSessions === 1 ? "" : "s"}, ${mood.label.toLowerCase()} tone`;
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

function MoodCountList({
  counts,
  emptyLabel,
  locale,
}: {
  counts: MoodCountSummary[];
  emptyLabel: string;
  locale: "en" | "th";
}) {
  if (counts.length === 0) {
    return <p className="text-sm leading-6 text-white/56">{emptyLabel}</p>;
  }

  return (
    <div className="flex flex-wrap gap-3">
      {counts.map((entry) => {
        const mood = getMoodById(entry.moodId, locale);

        return (
          <div
            key={entry.moodId}
            className="inline-flex items-center gap-2 rounded-full border border-white/10 bg-white/[0.04] px-3 py-2 text-sm text-white/78"
          >
            <span
              className="h-2.5 w-2.5 rounded-full"
              style={{ backgroundColor: mood.accent, boxShadow: `0 0 0 1px ${mood.glow} inset` }}
            />
            <span>{mood.label}</span>
            <span className="text-white/44">{entry.count}</span>
          </div>
        );
      })}
    </div>
  );
}

export function StatsView() {
  const { appState, stats, updatePreferences } = useAppState();
  const locale = appState.preferences.locale;
  const copy = getCopy(locale);
  const moodOptions = getMoodOptions(locale);
  const weekdayLabels = getWeekdayLabels(locale, "compact");
  const strongestDay = [...stats.weeklyTrend].sort((left, right) => right.averageMood - left.averageMood)[0];
  const handleLocaleToggle = () => {
    updatePreferences({
      locale: locale === "en" ? "th" : "en",
    });
  };

  return (
    <main className="app-shell">
      <div className="mb-6 flex flex-wrap items-center justify-between gap-4">
        <div>
          <p className="eyebrow mb-3">{copy.stats.progressTracking}</p>
          <h1 className="text-4xl sm:text-5xl">{copy.stats.title}</h1>
        </div>

        <div className="flex flex-wrap items-center gap-3">
          <LocaleToggle className="static" locale={locale} onToggle={handleLocaleToggle} />
          <Link
            className="surface inline-flex items-center gap-2 px-4 py-3 text-sm font-medium transition hover:border-white/20"
            href="/"
          >
            <ArrowLeft className="size-4" />
            {copy.stats.backHome}
          </Link>
        </div>
      </div>

      <section className="grid gap-4 lg:grid-cols-4">
        <MetricCard
          detail={copy.stats.awarenessStreakDetail}
          label={copy.stats.awarenessStreak}
          value={`${stats.awarenessStreak}d`}
        />
        <MetricCard
          detail={copy.stats.calmDaysDetail}
          label={copy.stats.calmDays}
          value={`${stats.calmDays}`}
        />
        <MetricCard
          detail={copy.stats.recoveryScoreDetail}
          label={copy.stats.recoveryScore}
          value={stats.fullSessions > 0 ? `${formatMetric(stats.averageRecovery)}` : "0.0"}
        />
        <MetricCard
          detail={copy.stats.totalSessionsDetail}
          label={copy.stats.totalSessions}
          value={`${stats.totalSessions}`}
        />
      </section>

      <div className="mt-8 grid gap-8 xl:grid-cols-[1.2fr_0.85fr]">
        <section className="surface p-6 sm:p-8">
          <div className="mb-6 flex items-end justify-between gap-4">
            <div>
              <p className="eyebrow mb-3">{copy.stats.weeklyHeatmap}</p>
              <h2 className="text-3xl">{copy.stats.weeklyHeatmapTitle}</h2>
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
                    {index % 2 === 0 ? formatWeekLabel(week.weekStart, locale) : ""}
                  </div>

                  {week.days.map((day) => (
                    <div
                      key={day.day}
                      className="h-5 w-5 rounded-[6px] border transition-transform hover:scale-110 sm:h-6 sm:w-6"
                      style={getHeatmapCellStyle(day, locale)}
                      title={buildDayTitle(day, locale)}
                    />
                  ))}
                </div>
              ))}
            </div>
          </div>

          <div className="mt-6 flex flex-wrap items-center gap-3 text-sm leading-6 text-white/64">
            <span>{copy.stats.averageMood}: {stats.totalSessions > 0 ? formatMetric(stats.averageMood) : "0.0"}/5</span>
            <span>{copy.stats.longestStreak}: {stats.longestAwarenessStreak} {locale === "th" ? "วัน" : "days"}</span>
            <span>{copy.stats.currentStreak}: {stats.awarenessStreak} {locale === "th" ? "วัน" : stats.awarenessStreak === 1 ? "day" : "days"}</span>
          </div>

          <div className="mt-5 flex flex-wrap gap-3">
            {moodOptions.map((mood) => (
              <div
                key={mood.id}
                className="inline-flex items-center gap-2 rounded-full border border-white/8 bg-white/[0.03] px-3 py-2 text-xs tracking-[0.16em] text-white/56"
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
              <p className="eyebrow mb-3">{copy.stats.highlights}</p>
              <h2 className="text-3xl">{copy.stats.highlightsTitle}</h2>
            </div>
            <FlameKindling className="size-6 text-white/45" />
          </div>

          <div className="space-y-4">
            <div className="surface-soft p-4">
              <p className="text-sm text-white/55">{copy.stats.mostUsedRitual}</p>
              <p className="mt-2 text-xl font-semibold text-white/92">
                {stats.mostUsedTool ?? copy.stats.noFullRitual}
              </p>
              <p className="mt-2 text-sm leading-6 text-white/58">
                {copy.stats.mostUsedMethodLabel}: {stats.mostUsedMethod ?? copy.stats.noMethodData}
              </p>
            </div>

            <div className="surface-soft p-4">
              <p className="text-sm text-white/55">{copy.stats.highestRecentDay}</p>
              <p className="mt-2 text-xl font-semibold text-white/92">
                {strongestDay?.completedSessions ? `${strongestDay.day}` : copy.stats.noLoggedSpikes}
              </p>
              <p className="mt-2 text-sm leading-6 text-white/58">
                {strongestDay?.completedSessions
                  ? `${copy.stats.averageMood} ${formatMetric(strongestDay.averageMood)}/5`
                  : copy.stats.weeklyProfileHint}
              </p>
            </div>

            <div className="surface-soft p-4">
              <p className="text-sm text-white/55">{copy.stats.badgesUnlocked}</p>
              <p className="mt-2 text-xl font-semibold text-white/92">{stats.unlockedBadges.length}</p>
              <p className="mt-2 text-sm leading-6 text-white/58">
                {copy.stats.badgesUnlockedDetail}
              </p>
            </div>
          </div>
        </section>
      </div>

      <section className="mt-8 surface p-6 sm:p-8">
        <div className="mb-6">
          <p className="eyebrow mb-3">{copy.stats.releaseProfile}</p>
          <h2 className="text-3xl">{copy.stats.releaseProfileTitle}</h2>
        </div>

        <div className="grid gap-4 lg:grid-cols-3">
          <div className="surface-soft p-4">
            <p className="text-sm text-white/55">{copy.stats.totalReleaseCount}</p>
            <p className="mt-2 text-3xl font-semibold text-white/92">{stats.totalReleaseCount}</p>
            <p className="mt-2 text-sm leading-6 text-white/58">{copy.stats.totalReleaseCountDetail}</p>
          </div>

          <div className="surface-soft p-4">
            <p className="text-sm text-white/55">{copy.stats.moodOnEntry}</p>
            <div className="mt-3">
              <MoodCountList counts={stats.moodOnEntry} emptyLabel={copy.stats.noReleaseData} locale={locale} />
            </div>
            <p className="mt-3 text-sm leading-6 text-white/58">{copy.stats.moodOnEntryDetail}</p>
          </div>

          <div className="surface-soft p-4">
            <p className="text-sm text-white/55">{copy.stats.moodOnFinish}</p>
            <div className="mt-3">
              <MoodCountList counts={stats.moodOnFinish} emptyLabel={copy.stats.noReleaseData} locale={locale} />
            </div>
            <p className="mt-3 text-sm leading-6 text-white/58">{copy.stats.moodOnFinishDetail}</p>
          </div>
        </div>
      </section>

      <section className="mt-8 grid gap-8 xl:grid-cols-[1fr_1.1fr]">
        <div className="surface p-6 sm:p-8">
          <div className="mb-6 flex items-end justify-between gap-4">
            <div>
              <p className="eyebrow mb-3">{copy.stats.milestones}</p>
              <h2 className="text-3xl">{copy.stats.milestonesTitle}</h2>
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
                {copy.stats.noBadges}
              </div>
            )}
          </div>
        </div>

        <div className="surface p-6 sm:p-8">
          <div className="mb-6">
            <p className="eyebrow mb-3">{copy.stats.recentSessions}</p>
            <h2 className="text-3xl">{copy.stats.recentSessionsTitle}</h2>
          </div>

          <div className="space-y-4">
            {stats.recentSessions.length > 0 ? (
              stats.recentSessions.map((session) => {
                const before = getMoodById(session.moodBefore, locale);
                const after = getMoodById(session.moodAfter, locale);
                const suggestion = resolveSuggestion(session.suggestion, locale);

                return (
                  <div key={session.id} className="surface-soft p-4">
                    <div className="flex items-start justify-between gap-4">
                      <div>
                        <p className="text-sm text-white/55">{formatLongDate(session.createdAt, locale)}</p>
                        <p className="mt-2 text-lg font-semibold text-white/92">
                          {session.sessionType === "full" ? copy.stats.fullResetSession : copy.stats.quickCheckIn}
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
                    {suggestion ? (
                      <p className="mt-3 text-sm leading-6 text-white/58">{suggestion.title}</p>
                    ) : null}
                  </div>
                );
              })
            ) : (
              <div className="surface-soft p-4 text-sm leading-7 text-white/58">
                {copy.stats.noSessions}
              </div>
            )}
          </div>
        </div>
      </section>
    </main>
  );
}
