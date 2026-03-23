/**
 * Stats cards - current streak, longest streak, total no-contact days
 */
export default function StatsCards({ stats }) {
  if (!stats) return null;

  const cards = [
    { label: 'Current Streak', value: stats.currentStreakDays, suffix: 'days' },
    { label: 'Longest Streak', value: stats.longestStreakDays, suffix: 'days' },
    { label: 'Total No-Contact', value: stats.totalNoContactDays, suffix: 'days' },
  ];

  return (
    <div className="grid grid-cols-3 gap-3">
      {cards.map((c) => (
        <div
          key={c.label}
          className="bg-white rounded-xl border border-slate-200 p-3 sm:p-4 shadow-sm"
        >
          <p className="text-xs sm:text-sm text-slate-500 leading-tight">{c.label}</p>
          <p className="text-lg sm:text-2xl font-display font-bold text-slate-800 mt-1">
            {c.value}{' '}
            <span className="text-xs sm:text-base font-normal text-slate-500">{c.suffix}</span>
          </p>
        </div>
      ))}
    </div>
  );
}
