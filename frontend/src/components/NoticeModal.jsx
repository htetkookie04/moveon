/**
 * NoticeModal - full notice content view
 */
export default function NoticeModal({ notice, onClose, onMarkRead }) {
  if (!notice) return null;

  const typeColors = {
    INFO: 'bg-blue-50 border-blue-200 text-blue-800',
    WARNING: 'bg-amber-50 border-amber-200 text-amber-800',
    SUCCESS: 'bg-green-50 border-green-200 text-green-800',
    DANGER: 'bg-red-50 border-red-200 text-red-800',
  };
  const color = typeColors[notice.type] || typeColors.INFO;

  const handleMarkRead = () => {
    if (!notice.isRead) onMarkRead?.(notice.id);
    onClose?.();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50" onClick={onClose}>
      <div
        className="bg-white rounded-xl shadow-xl max-w-lg w-full max-h-[85vh] overflow-hidden flex flex-col"
        onClick={(e) => e.stopPropagation()}
      >
        <div className={`px-4 py-3 border-b ${color}`}>
          <h3 className="font-semibold text-lg">{notice.title}</h3>
          <p className="text-xs opacity-80 mt-0.5">
            {new Date(notice.createdAt).toLocaleString()}
          </p>
        </div>
        <div className="flex-1 overflow-y-auto p-4">
          <p className="text-slate-700 whitespace-pre-wrap">{notice.message}</p>
          {notice.linkUrl && (
            <a
              href={notice.linkUrl}
              target="_blank"
              rel="noopener noreferrer"
              className="mt-4 inline-block text-streak-600 hover:text-streak-700 font-medium"
            >
              View link →
            </a>
          )}
        </div>
        <div className="flex gap-2 p-4 border-t border-slate-200">
          {!notice.isRead && (
            <button
              onClick={handleMarkRead}
              className="px-4 py-2 rounded-lg bg-streak-500 text-white font-medium hover:bg-streak-600"
            >
              Mark as read
            </button>
          )}
          <button
            onClick={onClose}
            className="px-4 py-2 rounded-lg border border-slate-300 text-slate-700 hover:bg-slate-50"
          >
            Close
          </button>
        </div>
      </div>
    </div>
  );
}
