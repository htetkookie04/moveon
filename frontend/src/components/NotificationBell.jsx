/**
 * NotificationBell - bell icon with unread badge and dropdown
 */
import { useState, useEffect, useRef } from 'react';
import { noticesApi } from '../api/notices.js';
import { useToast } from '../context/ToastContext.jsx';
import NoticeModal from './NoticeModal.jsx';

const PREVIEW_LEN = 80;
const typeColors = {
  INFO: 'border-l-blue-500',
  WARNING: 'border-l-amber-500',
  SUCCESS: 'border-l-green-500',
  DANGER: 'border-l-red-500',
};

export default function NotificationBell() {
  const [open, setOpen] = useState(false);
  const [notices, setNotices] = useState([]);
  const [unreadCount, setUnreadCount] = useState(0);
  const [loading, setLoading] = useState(false);
  const [selectedNotice, setSelectedNotice] = useState(null);
  const [fullModal, setFullModal] = useState(false);
  const panelRef = useRef(null);
  const { toast } = useToast();

  const fetchNotices = async () => {
    try {
      setLoading(true);
      const { data } = await noticesApi.getNotices({ limit: 15 });
      setNotices(data.notices);
    } catch (err) {
      toast(err.response?.data?.error || 'Failed to load notices', 'error');
    } finally {
      setLoading(false);
    }
  };

  const fetchUnreadCount = async () => {
    try {
      const { data } = await noticesApi.getUnreadCount();
      setUnreadCount(data.count);
    } catch {
      // ignore
    }
  };

  useEffect(() => {
    fetchUnreadCount();
  }, []);

  useEffect(() => {
    if (open) {
      fetchNotices();
      fetchUnreadCount();
    }
  }, [open]);

  useEffect(() => {
    const handleClickOutside = (e) => {
      if (panelRef.current && !panelRef.current.contains(e.target)) {
        setOpen(false);
      }
    };
    if (open) {
      document.addEventListener('click', handleClickOutside);
    }
    return () => document.removeEventListener('click', handleClickOutside);
  }, [open]);

  const handleMarkRead = async (id) => {
    try {
      await noticesApi.markRead(id);
      setNotices((prev) =>
        prev.map((n) => (n.id === id ? { ...n, isRead: true, readAt: new Date().toISOString() } : n))
      );
      setUnreadCount((c) => Math.max(0, c - 1));
    } catch {
      toast('Failed to mark as read', 'error');
    }
  };

  const handleMarkAllRead = async () => {
    try {
      await noticesApi.markAllRead();
      setNotices((prev) =>
        prev.map((n) => ({ ...n, isRead: true, readAt: new Date().toISOString() }))
      );
      setUnreadCount(0);
      toast('All marked as read', 'success');
    } catch {
      toast('Failed to mark all as read', 'error');
    }
  };

  const handleNoticeClick = (notice) => {
    setSelectedNotice(notice);
    if (window.innerWidth < 640) setFullModal(true);
  };

  const isMobile = typeof window !== 'undefined' && window.innerWidth < 640;

  return (
    <div className="relative" ref={panelRef}>
      <button
        onClick={() => setOpen((o) => !o)}
        className="relative p-2 rounded-lg text-slate-600 hover:bg-slate-100 hover:text-slate-800 transition-colors"
        aria-label="Notifications"
      >
        <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            strokeWidth={2}
            d="M15 17h5l-1.405-1.405A2.032 2.032 0 0118 14.158V11a6.002 6.002 0 00-4-5.659V5a2 2 0 10-4 0v.341C7.67 6.165 6 8.388 6 11v3.159c0 .538-.214 1.055-.595 1.436L4 17h5m6 0v1a3 3 0 11-6 0v-1m6 0H9"
          />
        </svg>
        {unreadCount > 0 && (
          <span className="absolute -top-0.5 -right-0.5 flex h-4 min-w-[1rem] items-center justify-center rounded-full bg-red-500 px-1 text-[10px] font-bold text-white">
            {unreadCount > 99 ? '99+' : unreadCount}
          </span>
        )}
      </button>

      {(open || fullModal) && (
        <div
          className={`${
            fullModal
              ? 'fixed inset-0 z-50 flex flex-col bg-white sm:bg-transparent sm:relative'
              : 'absolute right-0 top-full mt-1 z-50'
          }`}
        >
          <div
            className={`bg-white rounded-xl shadow-xl border border-slate-200 min-w-[320px] max-w-[380px] sm:max-h-[400px] flex flex-col ${
              fullModal ? 'flex-1 sm:flex-initial sm:max-h-[400px]' : 'max-h-[400px]'
            }`}
          >
            <div className="flex items-center justify-between px-4 py-3 border-b border-slate-200">
              <h3 className="font-semibold text-slate-800">Notices</h3>
              {unreadCount > 0 && (
                <button
                  onClick={handleMarkAllRead}
                  className="text-sm text-streak-600 hover:text-streak-700 font-medium"
                >
                  Mark all as read
                </button>
              )}
            </div>
            <div className="flex-1 overflow-y-auto">
              {loading ? (
                <div className="p-6 flex justify-center">
                  <div className="animate-spin w-8 h-8 border-2 border-streak-500 border-t-transparent rounded-full" />
                </div>
              ) : notices.length === 0 ? (
                <p className="p-6 text-slate-500 text-center text-sm">No notices</p>
              ) : (
                <ul className="divide-y divide-slate-100">
                  {notices.map((n) => (
                    <li key={n.id}>
                      <button
                        onClick={() => handleNoticeClick(n)}
                        className={`w-full text-left px-4 py-3 hover:bg-slate-50 transition-colors border-l-4 ${
                          n.isRead ? 'border-l-transparent' : typeColors[n.type] || typeColors.INFO
                        } ${!n.isRead ? 'bg-streak-50/30' : ''}`}
                      >
                        <p className="font-medium text-slate-800 truncate">{n.title}</p>
                        <p className="text-sm text-slate-500 truncate mt-0.5">
                          {n.message.length > PREVIEW_LEN
                            ? n.message.slice(0, PREVIEW_LEN) + '…'
                            : n.message}
                        </p>
                        <p className="text-xs text-slate-400 mt-1">
                          {new Date(n.createdAt).toLocaleString()}
                        </p>
                      </button>
                    </li>
                  ))}
                </ul>
              )}
            </div>
          </div>
          {fullModal && (
            <div
              className="flex-1 bg-black/20 sm:hidden"
              onClick={() => setFullModal(false)}
            />
          )}
        </div>
      )}

      {selectedNotice && (
        <NoticeModal
          notice={selectedNotice}
          onClose={() => {
            setSelectedNotice(null);
            setFullModal(false);
          }}
          onMarkRead={handleMarkRead}
        />
      )}
    </div>
  );
}
