/**
 * Notes History table - entries with filters, pagination, detail modal
 */
import { useState, useEffect, useCallback } from 'react';
import { entriesApi } from '../api/entries.js';
import EntryDetailModal from './EntryDetailModal.jsx';

const STATUS_OPTIONS = [
  { value: '', label: 'All' },
  { value: 'NO_CONTACT', label: 'No Contact' },
  { value: 'CONTACT', label: 'Contact' },
  { value: 'RESET', label: 'Reset' },
  { value: 'EMPTY', label: 'Empty' },
];

const DATE_RANGE_OPTIONS = [
  { value: 'this_month', label: 'This month' },
  { value: 'last_30', label: 'Last 30 days' },
  { value: 'last_90', label: 'Last 90 days' },
  { value: 'all', label: 'All time' },
];

const STATUS_CLASS = {
  NO_CONTACT: 'bg-green-500',
  CONTACT: 'bg-red-500',
  RESET: 'bg-amber-500',
};

function truncate(str, max = 40) {
  if (!str) return '—';
  return str.length > max ? str.slice(0, max) + '…' : str;
}

function formatDate(d) {
  if (!d) return '—';
  return typeof d === 'string' ? d.slice(0, 10) : new Date(d).toISOString().slice(0, 10);
}

function getDateRange(value) {
  const now = new Date();
  let from, to;
  if (value === 'this_month') {
    from = new Date(now.getFullYear(), now.getMonth(), 1);
    to = new Date();
  } else if (value === 'last_30') {
    to = new Date();
    from = new Date(to);
    from.setDate(from.getDate() - 30);
  } else if (value === 'last_90') {
    to = new Date();
    from = new Date(to);
    from.setDate(from.getDate() - 90);
  }
  return {
    from: from ? from.toISOString().slice(0, 10) : undefined,
    to: to ? to.toISOString().slice(0, 10) : undefined,
  };
}

export default function NotesHistoryTable({
  targetId,
  onEditEntry,
  onRefresh,
  onToast,
  refreshTrigger,
}) {
  const [items, setItems] = useState([]);
  const [page, setPage] = useState(1);
  const [limit, setLimit] = useState(10);
  const [total, setTotal] = useState(0);
  const [loading, setLoading] = useState(false);
  const [searchInput, setSearchInput] = useState('');
  const [search, setSearch] = useState('');
  const [statusFilter, setStatusFilter] = useState('');
  const [dateRange, setDateRange] = useState('this_month');
  const [detailEntry, setDetailEntry] = useState(null);
  const [deleting, setDeleting] = useState(false);

  const fetchHistory = useCallback(async () => {
    if (!targetId) {
      setItems([]);
      setTotal(0);
      return;
    }
    setLoading(true);
    try {
      const { from, to } = getDateRange(dateRange);
      const { data } = await entriesApi.history({
        targetId,
        page,
        limit,
        q: search || undefined,
        status: statusFilter || undefined,
        from,
        to,
      });
      setItems(data.items);
      setTotal(data.total);
    } catch (err) {
      onToast?.(err.response?.data?.error || 'Failed to load history', 'error');
      setItems([]);
    } finally {
      setLoading(false);
    }
  }, [targetId, page, limit, search, statusFilter, dateRange, onToast, refreshTrigger]);

  useEffect(() => {
    fetchHistory();
  }, [fetchHistory]);

  useEffect(() => {
    const t = setTimeout(() => {
      setSearch(searchInput);
      setPage(1);
    }, 300);
    return () => clearTimeout(t);
  }, [searchInput]);

  const handleSearch = (e) => {
    setSearchInput(e.target.value);
  };

  const handleStatusChange = (e) => {
    setStatusFilter(e.target.value);
    setPage(1);
  };

  const handleDateRangeChange = (e) => {
    setDateRange(e.target.value);
    setPage(1);
  };

  const handleDelete = async (id) => {
    setDeleting(true);
    try {
      await entriesApi.delete(id);
      onToast?.('Entry deleted', 'success');
      fetchHistory();
      onRefresh?.();
    } catch (err) {
      onToast?.(err.response?.data?.error || 'Failed to delete', 'error');
    } finally {
      setDeleting(false);
    }
  };

  const handleEdit = (entry) => {
    setDetailEntry(null);
    onEditEntry?.(entry);
  };

  const totalPages = Math.ceil(total / limit) || 1;

  if (!targetId) {
    return (
      <div className="bg-white rounded-xl border border-slate-200 p-8 text-center text-slate-500">
        Select a target to view notes history
      </div>
    );
  }

  return (
    <>
      <div className="bg-white rounded-xl border border-slate-200 shadow-sm overflow-hidden">
        <h2 className="font-display text-lg font-semibold text-slate-800 p-4 border-b border-slate-200">
          Notes History
        </h2>

        {/* Filters */}
        <div className="p-4 border-b border-slate-200 space-y-3 sm:flex sm:flex-wrap sm:gap-3 sm:items-center">
          <input
            type="text"
            placeholder="Search in note & emotion..."
            value={searchInput}
            onChange={handleSearch}
            className="flex-1 min-w-[180px] px-4 py-2 rounded-lg border border-slate-300 focus:outline-none focus:border-streak-500 text-sm"
          />
          <select
            value={statusFilter}
            onChange={handleStatusChange}
            className="px-4 py-2 rounded-lg border border-slate-300 focus:outline-none focus:border-streak-500 text-sm"
          >
            {STATUS_OPTIONS.map((o) => (
              <option key={o.value || 'all'} value={o.value}>
                {o.label}
              </option>
            ))}
          </select>
          <select
            value={dateRange}
            onChange={handleDateRangeChange}
            className="px-4 py-2 rounded-lg border border-slate-300 focus:outline-none focus:border-streak-500 text-sm"
          >
            {DATE_RANGE_OPTIONS.map((o) => (
              <option key={o.value} value={o.value}>
                {o.value === 'all' ? 'All time' : o.label}
              </option>
            ))}
          </select>
        </div>

        {/* Table - desktop */}
        <div className="overflow-x-auto">
          {loading ? (
            <div className="p-12 flex justify-center">
              <div className="animate-spin w-10 h-10 border-2 border-streak-500 border-t-transparent rounded-full" />
            </div>
          ) : items.length === 0 ? (
            <div className="p-12 text-center text-slate-500">No entries found</div>
          ) : (
            <>
              <table className="w-full hidden sm:table">
                <thead>
                  <tr className="bg-slate-50 border-b border-slate-200">
                    <th className="px-4 py-3 text-left text-xs font-medium text-slate-500 uppercase">Date</th>
                    <th className="px-4 py-3 text-left text-xs font-medium text-slate-500 uppercase">Status</th>
                    <th className="px-4 py-3 text-left text-xs font-medium text-slate-500 uppercase">Emotion</th>
                    <th className="px-4 py-3 text-left text-xs font-medium text-slate-500 uppercase">Note</th>
                    <th className="px-4 py-3 text-right text-xs font-medium text-slate-500 uppercase">Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {items.map((entry) => (
                    <tr
                      key={entry.id}
                      className="border-b border-slate-100 hover:bg-slate-50 cursor-pointer"
                      onClick={() => setDetailEntry(entry)}
                    >
                      <td className="px-4 py-3 text-sm text-slate-700">{formatDate(entry.entryDate)}</td>
                      <td className="px-4 py-3">
                        {entry.status ? (
                          <span
                            className={`inline-block px-2 py-0.5 rounded text-xs font-medium text-white ${
                              STATUS_CLASS[entry.status] || 'bg-slate-400'
                            }`}
                          >
                            {entry.status.replace('_', ' ')}
                          </span>
                        ) : (
                          <span className="text-slate-400">—</span>
                        )}
                      </td>
                      <td className="px-4 py-3 text-sm">
                        <span className="flex items-center gap-1">
                          {entry.emotionEmoji && <span>{entry.emotionEmoji}</span>}
                          <span className="max-w-[120px] truncate">{truncate(entry.emotionText, 25)}</span>
                        </span>
                      </td>
                      <td className="px-4 py-3 text-sm text-slate-600 max-w-[200px] truncate">
                        {truncate(entry.note, 35)}
                      </td>
                      <td className="px-4 py-3 text-right" onClick={(e) => e.stopPropagation()}>
                        <button
                          onClick={() => setDetailEntry(entry)}
                          className="text-streak-600 hover:text-streak-700 text-sm font-medium mr-2"
                        >
                          View
                        </button>
                        <button
                          onClick={() => handleEdit(entry)}
                          className="text-streak-600 hover:text-streak-700 text-sm font-medium mr-2"
                        >
                          Edit
                        </button>
                        <button
                          onClick={(e) => {
                            e.stopPropagation();
                            if (window.confirm('Permanently delete this entry? This cannot be undone.')) {
                              handleDelete(entry.id);
                            }
                          }}
                          disabled={deleting}
                          className="text-red-600 hover:text-red-700 text-sm font-medium"
                        >
                          Delete
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>

              {/* Mobile cards */}
              <div className="sm:hidden divide-y divide-slate-200">
                {items.map((entry) => (
                  <div
                    key={entry.id}
                    className="p-4 hover:bg-slate-50 cursor-pointer"
                    onClick={() => setDetailEntry(entry)}
                  >
                    <div className="flex justify-between items-start mb-2">
                      <span className="font-medium text-slate-800">{formatDate(entry.entryDate)}</span>
                      {entry.status && (
                        <span
                          className={`px-2 py-0.5 rounded text-xs font-medium text-white ${
                            STATUS_CLASS[entry.status] || 'bg-slate-400'
                          }`}
                        >
                          {entry.status.replace('_', ' ')}
                        </span>
                      )}
                    </div>
                    <p className="text-sm text-slate-600 mb-2">
                      {entry.emotionEmoji && <span className="mr-1">{entry.emotionEmoji}</span>}
                      {truncate(entry.emotionText, 30)}
                    </p>
                    <p className="text-sm text-slate-500 truncate mb-2">{truncate(entry.note, 50)}</p>
                    <div className="flex gap-2" onClick={(e) => e.stopPropagation()}>
                      <button
                        onClick={() => setDetailEntry(entry)}
                        className="text-sm text-streak-600 font-medium"
                      >
                        View
                      </button>
                      <button
                        onClick={() => handleEdit(entry)}
                        className="text-sm text-streak-600 font-medium"
                      >
                        Edit
                      </button>
                      <button
                        onClick={() => {
                          if (window.confirm('Permanently delete this entry? This cannot be undone.')) {
                            handleDelete(entry.id);
                          }
                        }}
                        disabled={deleting}
                        className="text-sm text-red-600 font-medium"
                      >
                        Delete
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            </>
          )}
        </div>

        {/* Pagination */}
        {total > 0 && (
          <div className="p-4 border-t border-slate-200 flex flex-wrap items-center justify-between gap-2">
            <div className="text-sm text-slate-600">
              Showing {(page - 1) * limit + 1}–{Math.min(page * limit, total)} of {total}
            </div>
            <div className="flex items-center gap-2">
              <select
                value={limit}
                onChange={(e) => {
                  setLimit(Number(e.target.value));
                  setPage(1);
                }}
                className="px-2 py-1 rounded border border-slate-300 text-sm"
              >
                <option value={10}>10 per page</option>
                <option value={20}>20 per page</option>
              </select>
              <div className="flex gap-1">
                <button
                  onClick={() => setPage((p) => Math.max(1, p - 1))}
                  disabled={page <= 1}
                  className="px-3 py-1 rounded border border-slate-300 text-sm disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  Prev
                </button>
                <button
                  onClick={() => setPage((p) => Math.min(totalPages, p + 1))}
                  disabled={page >= totalPages}
                  className="px-3 py-1 rounded border border-slate-300 text-sm disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  Next
                </button>
              </div>
            </div>
          </div>
        )}
      </div>

      {detailEntry && (
        <EntryDetailModal
          entry={detailEntry}
          onClose={() => setDetailEntry(null)}
          onEdit={handleEdit}
          onDelete={handleDelete}
        />
      )}
    </>
  );
}
