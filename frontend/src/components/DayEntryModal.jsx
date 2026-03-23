/**
 * Modal for editing a day's entry - status, note, emotion
 */
import { useState, useEffect } from 'react';

const STATUSES = [
  { value: 'NO_CONTACT', label: 'No Contact', color: 'bg-green-500' },
  { value: 'CONTACT', label: 'Contact', color: 'bg-red-500' },
  { value: 'RESET', label: 'Reset', color: 'bg-amber-500' },
];

const EMOJIS = ['😊', '😢', '😤', '😌', '💪', '😐', '🙏', '❤️', '🔥', '✨'];

export default function DayEntryModal({ date, entry, onSave, onClose }) {
  const [status, setStatus] = useState(entry?.status ?? null);
  const [note, setNote] = useState(entry?.note || '');
  const [emotionText, setEmotionText] = useState(entry?.emotionText || '');
  const [emotionEmoji, setEmotionEmoji] = useState(entry?.emotionEmoji || '');
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState('');

  useEffect(() => {
    setStatus(entry?.status ?? null);
    setNote(entry?.note || '');
    setEmotionText(entry?.emotionText || '');
    setEmotionEmoji(entry?.emotionEmoji || '');
  }, [entry, date]);

  const handleStatusClick = (value) => {
    setStatus((prev) => (prev === value ? null : value));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setSaving(true);
    try {
      await onSave({
        status: status ?? null,
        note: note.trim() || null,
        emotionText: emotionText.trim() || null,
        emotionEmoji: emotionEmoji || null,
      });
      onClose();
    } catch (err) {
      setError(err.response?.data?.error || 'Failed to save');
    } finally {
      setSaving(false);
    }
  };

  const dateStr = date
    ? new Date(date).toLocaleDateString(undefined, {
        weekday: 'long',
        year: 'numeric',
        month: 'long',
        day: 'numeric',
      })
    : '';

  return (
    <div
      className="fixed inset-0 z-50 flex items-end sm:items-center justify-center bg-black/50"
      onClick={onClose}
    >
      <div
        className="bg-white w-full sm:max-w-md sm:rounded-2xl rounded-t-2xl shadow-xl max-h-[92dvh] overflow-y-auto"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Drag handle — mobile */}
        <div className="flex justify-center pt-3 pb-1 sm:hidden">
          <div className="w-10 h-1 rounded-full bg-slate-200" />
        </div>

        <div className="p-5 sm:p-6">
          <h3 className="font-display text-lg sm:text-xl font-semibold text-slate-800 mb-4">
            {dateStr}
          </h3>

          <form onSubmit={handleSubmit} className="space-y-4">
            {error && (
              <div className="p-3 rounded-lg bg-red-50 text-red-700 text-sm">{error}</div>
            )}

            {/* Status */}
            <div>
              <label className="block text-sm font-medium text-slate-700 mb-2">
                Status <span className="text-slate-400 font-normal">(optional)</span>
              </label>
              <div className="flex gap-2 flex-wrap">
                {STATUSES.map((s) => (
                  <button
                    key={s.value}
                    type="button"
                    onClick={() => handleStatusClick(s.value)}
                    className={`flex-1 min-w-[90px] px-3 py-2.5 rounded-lg font-medium text-sm transition-colors ${
                      status === s.value
                        ? `${s.color} text-white`
                        : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
                    }`}
                  >
                    {s.label}
                  </button>
                ))}
              </div>
            </div>

            {/* Note */}
            <div>
              <label className="block text-sm font-medium text-slate-700 mb-1">Note</label>
              <textarea
                value={note}
                onChange={(e) => setNote(e.target.value)}
                rows={3}
                className="w-full px-4 py-2.5 rounded-lg border border-slate-300 focus:outline-none focus:border-streak-500 text-sm resize-none"
                placeholder="How are you feeling?"
              />
            </div>

            {/* Emotion */}
            <div>
              <label className="block text-sm font-medium text-slate-700 mb-2">Emotion</label>
              <div className="flex gap-1.5 mb-3 flex-wrap">
                {EMOJIS.map((emoji) => (
                  <button
                    key={emoji}
                    type="button"
                    onClick={() => setEmotionEmoji(emotionEmoji === emoji ? '' : emoji)}
                    className={`text-2xl p-1.5 rounded-lg transition-colors touch-manipulation ${
                      emotionEmoji === emoji
                        ? 'bg-streak-100 ring-2 ring-[#116176]'
                        : 'hover:bg-slate-100'
                    }`}
                  >
                    {emoji}
                  </button>
                ))}
              </div>
              <input
                type="text"
                value={emotionText}
                onChange={(e) => setEmotionText(e.target.value)}
                className="w-full px-4 py-2.5 rounded-lg border border-slate-300 focus:outline-none focus:border-streak-500 text-sm"
                placeholder="Describe your emotion (optional)"
              />
            </div>

            {/* Actions */}
            <div className="flex gap-2 pt-1">
              <button
                type="button"
                onClick={onClose}
                className="flex-1 py-3 rounded-lg border border-slate-300 text-slate-700 hover:bg-slate-50 text-sm font-medium transition-colors"
              >
                Cancel
              </button>
              <button
                type="submit"
                disabled={saving}
                className="flex-1 py-3 rounded-lg bg-[linear-gradient(90deg,#116176,#8CF2F8)] text-white font-medium text-sm hover:opacity-90 disabled:opacity-50 transition-opacity"
              >
                {saving ? 'Saving...' : 'Save'}
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
}
