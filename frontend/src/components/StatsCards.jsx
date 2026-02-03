/**
 * Stats cards - current streak, longest streak, total no-contact days, monthly breakdown
 */
export default function StatsCards({ stats, targetName }) {
  if (!stats) return null;

  const cards = [
    { label: 'Current Streak', value: stats.currentStreakDays, suffix: 'days' },
    { label: 'Longest Streak', value: stats.longestStreakDays, suffix: 'days' },
    { label: 'Total No-Contact', value: stats.totalNoContactDays, suffix: 'days' },
  ];

  return (
    <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
      {cards.map((c) => (
        <div
          key={c.label}
          className="bg-white rounded-xl border border-slate-200 p-4 shadow-sm"
        >
          <p className="text-sm text-slate-500">{c.label}</p>
          <p className="text-2xl font-display font-bold text-slate-800 mt-1">
            {c.value} <span className="text-base font-normal text-slate-500">{c.suffix}</span>
          </p>
        </div>
      ))}
    </div>
  );
}
