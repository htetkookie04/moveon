/**
 * AdminNoticesPage - create and manage notices (broadcast to all users)
 */
import { useState, useEffect } from 'react';
import { adminApi } from '../api/admin.js';
import { useToast } from '../context/ToastContext.jsx';

const TYPES = [
  { value: 'INFO', label: 'Info', color: 'bg-blue-100 text-blue-800' },
  { value: 'WARNING', label: 'Warning', color: 'bg-amber-100 text-amber-800' },
  { value: 'SUCCESS', label: 'Success', color: 'bg-green-100 text-green-800' },
  { value: 'DANGER', label: 'Danger', color: 'bg-red-100 text-red-800' },
];

export default function AdminNoticesPage() {
  const [notices, setNotices] = useState([]);
  const [loading, setLoading] = useState(true);
  const [sending, setSending] = useState(false);
  const [form, setForm] = useState({
    title: '',
    message: '',
    type: 'INFO',
    linkUrl: '',
  });
  const { toast } = useToast();

  const fetchNotices = async () => {
    try {
      setLoading(true);
      const { data } = await adminApi.getNotices();
      setNotices(data);
    } catch (err) {
      toast(err.response?.data?.error || 'Failed to load notices', 'error');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchNotices();
  }, []);

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!form.title.trim() || !form.message.trim()) {
      toast('Title and message are required', 'error');
      return;
    }
    try {
      setSending(true);
      await adminApi.createNotice({
        title: form.title.trim(),
        message: form.message.trim(),
        type: form.type,
        linkUrl: form.linkUrl.trim() || undefined,
      });
      toast('Notice sent to all users', 'success');
      setForm({ title: '', message: '', type: 'INFO', linkUrl: '' });
      fetchNotices();
    } catch (err) {
      toast(err.response?.data?.error || 'Failed to send notice', 'error');
    } finally {
      setSending(false);
    }
  };

  const handleDelete = async (id) => {
    if (!confirm('Delete this notice? It will be removed for all users.')) return;
    try {
      await adminApi.deleteNotice(id);
      toast('Notice deleted', 'success');
      fetchNotices();
    } catch (err) {
      toast(err.response?.data?.error || 'Failed to delete', 'error');
    }
  };

  return (
    <div className="space-y-8">
      <h1 className="text-2xl font-bold text-slate-800">Notices</h1>

      <section className="bg-white rounded-xl border border-slate-200 p-6 shadow-sm">
        <h2 className="text-lg font-semibold text-slate-800 mb-4">Create Notice</h2>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-slate-700 mb-1">Title *</label>
            <input
              type="text"
              value={form.title}
              onChange={(e) => setForm((f) => ({ ...f, title: e.target.value }))}
              className="w-full px-4 py-2 rounded-lg border border-slate-300 focus:outline-none focus:border-streak-500"
              placeholder="Notice title"
              maxLength={200}
              required
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-slate-700 mb-1">Message *</label>
            <textarea
              value={form.message}
              onChange={(e) => setForm((f) => ({ ...f, message: e.target.value }))}
              className="w-full px-4 py-2 rounded-lg border border-slate-300 focus:outline-none focus:border-streak-500 min-h-[120px]"
              placeholder="Notice message (supports multiple lines)"
              maxLength={10000}
              required
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-slate-700 mb-1">Type</label>
            <select
              value={form.type}
              onChange={(e) => setForm((f) => ({ ...f, type: e.target.value }))}
              className="w-full px-4 py-2 rounded-lg border border-slate-300 focus:outline-none focus:border-streak-500"
            >
              {TYPES.map((t) => (
                <option key={t.value} value={t.value}>
                  {t.label}
                </option>
              ))}
            </select>
          </div>
          <div>
            <label className="block text-sm font-medium text-slate-700 mb-1">
              Link URL (optional)
            </label>
            <input
              type="url"
              value={form.linkUrl}
              onChange={(e) => setForm((f) => ({ ...f, linkUrl: e.target.value }))}
              className="w-full px-4 py-2 rounded-lg border border-slate-300 focus:outline-none focus:border-streak-500"
              placeholder="https://..."
            />
          </div>
          <button
            type="submit"
            disabled={sending}
            className="px-4 py-2 rounded-lg bg-streak-500 text-white font-medium hover:bg-streak-600 disabled:opacity-50"
          >
            {sending ? 'Sending…' : 'Send to All Users'}
          </button>
        </form>
      </section>

      <section className="bg-white rounded-xl border border-slate-200 p-6 shadow-sm">
        <h2 className="text-lg font-semibold text-slate-800 mb-4">Sent Notices</h2>
        {loading ? (
          <div className="flex justify-center py-8">
            <div className="animate-spin w-10 h-10 border-2 border-streak-500 border-t-transparent rounded-full" />
          </div>
        ) : notices.length === 0 ? (
          <p className="text-slate-500 py-4">No notices sent yet.</p>
        ) : (
          <ul className="divide-y divide-slate-200">
            {notices.map((n) => (
              <li key={n.id} className="py-4 first:pt-0">
                <div className="flex justify-between gap-4">
                  <div className="min-w-0 flex-1">
                    <p className="font-medium text-slate-800">{n.title}</p>
                    <p className="text-sm text-slate-500 mt-1 truncate">
                      {n.message.length > 100 ? n.message.slice(0, 100) + '…' : n.message}
                    </p>
                    <p className="text-xs text-slate-400 mt-2">
                      {new Date(n.createdAt).toLocaleString()} · {n.recipientCount} recipients
                    </p>
                  </div>
                  <button
                    onClick={() => handleDelete(n.id)}
                    className="shrink-0 text-sm text-red-600 hover:text-red-700"
                  >
                    Delete
                  </button>
                </div>
              </li>
            ))}
          </ul>
        )}
      </section>
    </div>
  );
}
