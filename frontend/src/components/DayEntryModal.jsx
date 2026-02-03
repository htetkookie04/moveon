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

  const dateStr = date ? new Date(date).toLocaleDateString(undefined, { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' }) : '';

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50" onClick={onClose}>
      <div
        className="bg-white rounded-2xl shadow-xl max-w-md w-full p-6"
        onClick={(e) => e.stopPropagation()}
      >
        <h3 className="font-display text-xl font-semibold text-slate-800 mb-2">{dateStr}</h3>

        <form onSubmit={handleSubmit} className="space-y-4">
          {error && (
            <div className="p-3 rounded-lg bg-red-50 text-red-700 text-sm">{error}</div>
          )}

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
                  className={`px-4 py-2 rounded-lg font-medium transition-colors ${
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

          <div>
            <label className="block text-sm font-medium text-slate-700 mb-1">Note</label>
            <textarea
              value={note}
              onChange={(e) => setNote(e.target.value)}
              rows={3}
              className="w-full px-4 py-2 rounded-lg border border-slate-300 focus:outline-none focus:border-streak-500"
              placeholder="How are you feeling?"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-slate-700 mb-1">Emotion</label>
            <div className="flex gap-2 mb-2 flex-wrap">
              {EMOJIS.map((emoji) => (
                <button
                  key={emoji}
                  type="button"
                  onClick={() => setEmotionEmoji(emotionEmoji === emoji ? '' : emoji)}
                  className={`text-2xl p-1 rounded transition-colors ${
                    emotionEmoji === emoji ? 'bg-streak-100 ring-2 ring-streak-500' : 'hover:bg-slate-100'
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
              className="w-full px-4 py-2 rounded-lg border border-slate-300 focus:outline-none focus:border-streak-500"
              placeholder="Describe your emotion (optional)"
            />
          </div>

          <div className="flex gap-2 pt-2">
            <button
              type="button"
              onClick={onClose}
              className="flex-1 py-2 rounded-lg border border-slate-300 text-slate-700 hover:bg-slate-50"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={saving}
              className="flex-1 py-2 rounded-lg bg-streak-500 text-white font-medium hover:bg-streak-600 disabled:opacity-50"
            >
              {saving ? 'Saving...' : 'Save'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
