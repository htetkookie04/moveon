/**
 * Modal showing full entry details - View, Edit, Delete
 */
const STATUS_CLASS = {
  NO_CONTACT: 'bg-green-500',
  CONTACT: 'bg-red-500',
  RESET: 'bg-amber-500',
};

export default function EntryDetailModal({ entry, onClose, onEdit, onDelete }) {
  if (!entry) return null;

  const dateStr =
    entry.entryDate &&
    new Date(entry.entryDate + 'T12:00:00Z').toLocaleDateString(undefined, {
      weekday: 'long',
      year: 'numeric',
      month: 'long',
      day: 'numeric',
    });

  const statusLabel =
    entry.status === 'NO_CONTACT'
      ? 'No Contact'
      : entry.status === 'CONTACT'
      ? 'Contact'
      : entry.status === 'RESET'
      ? 'Reset'
      : '—';

  const handleDelete = () => {
    if (window.confirm('Permanently delete this entry? This cannot be undone.')) {
      onDelete?.(entry.id);
      onClose?.();
    }
  };

  const handleEdit = () => {
    onClose?.();
    onEdit?.(entry);
  };

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50"
      onClick={onClose}
      role="dialog"
      aria-modal="true"
      aria-labelledby="entry-detail-title"
    >
      <div
        className="bg-white rounded-2xl shadow-xl max-w-lg w-full max-h-[90vh] overflow-hidden flex flex-col"
        onClick={(e) => e.stopPropagation()}
      >
        <h2 id="entry-detail-title" className="font-display text-xl font-semibold text-slate-800 p-6 pb-2">
          Entry Details
        </h2>

        <div className="px-6 py-2 overflow-y-auto flex-1 space-y-4">
          <div>
            <span className="text-sm font-medium text-slate-500">Date</span>
            <p className="text-slate-800">{dateStr}</p>
          </div>

          <div>
            <span className="text-sm font-medium text-slate-500">Status</span>
            <p>
              {entry.status ? (
                <span
                  className={`inline-block px-3 py-1 rounded-full text-sm font-medium text-white ${
                    STATUS_CLASS[entry.status] || 'bg-slate-400'
                  }`}
                >
                  {statusLabel}
                </span>
              ) : (
                <span className="text-slate-400">—</span>
              )}
            </p>
          </div>

          <div>
            <span className="text-sm font-medium text-slate-500">Emotion</span>
            <p className="text-slate-800">
              {entry.emotionEmoji || entry.emotionText ? (
                <>
                  {entry.emotionEmoji && <span className="text-2xl mr-2">{entry.emotionEmoji}</span>}
                  {entry.emotionText || '—'}
                </>
              ) : (
                '—'
              )}
            </p>
          </div>

          <div>
            <span className="text-sm font-medium text-slate-500">Note</span>
            <p className="text-slate-800 whitespace-pre-wrap mt-1">
              {entry.note || '—'}
            </p>
          </div>
        </div>

        <div className="p-6 pt-4 flex gap-2 border-t border-slate-200">
          <button
            type="button"
            onClick={onClose}
            className="flex-1 py-2 rounded-lg border border-slate-300 text-slate-700 hover:bg-slate-50"
          >
            Close
          </button>
          <button
            type="button"
            onClick={handleEdit}
            className="flex-1 py-2 rounded-lg bg-streak-500 text-white font-medium hover:bg-streak-600"
          >
            Edit
          </button>
          <button
            type="button"
            onClick={handleDelete}
            className="px-4 py-2 rounded-lg border border-red-300 text-red-600 hover:bg-red-50"
          >
            Delete
          </button>
        </div>
      </div>
    </div>
  );
}
