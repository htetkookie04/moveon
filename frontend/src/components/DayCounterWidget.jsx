/**
 * Day Counter Widget - shows current streak, last contact, warning if today not marked
 * Tailwind gradient card, mobile responsive
 * Accepts stats from parent so it can refetch when calendar entry is saved
 */
const EMOJI_OPTIONS = ['💪', '🔥', '✨', '🌟', '💜', '🌸', '🌈', '🎯'];

export default function DayCounterWidget({ targetId, stats, loading, error }) {

  if (!targetId) {
    return (
      <div className="rounded-2xl bg-gradient-to-br from-slate-100 to-slate-200 p-6 border border-slate-200">
        <p className="text-slate-600 text-center">Select a target to see your streak</p>
      </div>
    );
  }

  if (loading) {
    return (
      <div className="rounded-2xl bg-gradient-to-br from-streak-500/10 to-streak-600/10 p-6 border border-streak-200 animate-pulse">
        <div className="h-16 bg-streak-200/50 rounded-lg mb-4" />
        <div className="h-4 bg-streak-200/50 rounded w-2/3" />
      </div>
    );
  }

  if (error) {
    return (
      <div className="rounded-2xl bg-red-50 p-6 border border-red-200">
        <p className="text-red-700">{error}</p>
      </div>
    );
  }

  if (!stats) {
    return (
      <div className="rounded-2xl bg-gradient-to-br from-streak-500/10 to-streak-600/10 p-6 border border-streak-200 animate-pulse">
        <div className="h-16 bg-streak-200/50 rounded-lg mb-4" />
        <div className="h-4 bg-streak-200/50 rounded w-2/3" />
      </div>
    );
  }

  return (
    <div
      className="rounded-2xl bg-gradient-to-br from-streak-500 via-streak-600 to-violet-600 p-6 sm:p-8 text-white shadow-lg border border-streak-400/30"
      data-testid="day-counter-widget"
    >
      <div className="flex items-center justify-between mb-4">
        <h3 className="font-display font-semibold text-lg text-white/90">Move On</h3>
        <span className="text-2xl">{EMOJI_OPTIONS[stats.currentStreakDays % EMOJI_OPTIONS.length]}</span>
      </div>

      <div className="text-5xl sm:text-6xl font-display font-bold mb-2">
        {stats.currentStreakDays}
      </div>
      <p className="text-white/80 text-sm mb-4">days no contact</p>

      <div className="space-y-1 text-sm text-white/90">
        {stats.streakStartDate && (
          <p>Streak started: {new Date(stats.streakStartDate).toLocaleDateString()}</p>
        )}
        {stats.lastContactDate && (
          <p>Last contact: {new Date(stats.lastContactDate).toLocaleDateString()}</p>
        )}
      </div>

      {!stats.todayMarked && (
        <div className="mt-4 p-3 rounded-lg bg-amber-500/30 border border-amber-400/50">
          <p className="text-sm font-medium text-amber-100">
            ⚠️ Today is not marked yet. Update your calendar to keep your streak accurate.
          </p>
        </div>
      )}

      <div className="mt-6 pt-4 border-t border-white/20 grid grid-cols-2 gap-4 text-center">
        <div>
          <p className="text-2xl font-bold">{stats.longestStreakDays}</p>
          <p className="text-xs text-white/70">Longest streak</p>
        </div>
        <div>
          <p className="text-2xl font-bold">{stats.totalNoContactDays}</p>
          <p className="text-xs text-white/70">Total no-contact days</p>
        </div>
      </div>
    </div>
  );
}
