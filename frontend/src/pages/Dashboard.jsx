import { useState, useEffect, useCallback } from 'react';
import { useStats } from '../hooks/useStats.js';
import { useToast } from '../context/ToastContext.jsx';
import { targetsApi } from '../api/targets.js';
import { entriesApi } from '../api/entries.js';
import DayCounterWidget from '../components/DayCounterWidget.jsx';
import Calendar from '../components/Calendar.jsx';
import StatsCards from '../components/StatsCards.jsx';
import NotesHistoryTable from '../components/NotesHistoryTable.jsx';
import DashboardBanner from '../components/DashboardBanner.jsx';

function toLocalDateString(date) {
  const d = new Date(date);
  const y = d.getFullYear();
  const m = String(d.getMonth() + 1).padStart(2, '0');
  const day = String(d.getDate()).padStart(2, '0');
  return `${y}-${m}-${day}`;
}

export default function Dashboard() {
  const [targets, setTargets] = useState([]);
  const [selectedTargetId, setSelectedTargetId] = useState(null);
  const [entries, setEntries] = useState([]);
  const [loadingTargets, setLoadingTargets] = useState(true);
  const [loadingEntries, setLoadingEntries] = useState(false);
  const [error, setError] = useState('');

  const { stats, loading: statsLoading, refetch: refetchStats } = useStats(selectedTargetId);
  const { toast } = useToast();

  const [openForEntry, setOpenForEntry] = useState(null);
  const [historyRefreshTrigger, setHistoryRefreshTrigger] = useState(0);

  const selectedTarget = targets.find((t) => t.id === selectedTargetId);

  const fetchTargets = useCallback(async () => {
    try {
      const { data } = await targetsApi.list();
      if (data.length === 0) {
        const { data: newTarget } = await targetsApi.create('My Journey');
        setTargets([newTarget]);
        setSelectedTargetId(newTarget.id);
      } else {
        setTargets(data);
        setSelectedTargetId(data[0].id);
      }
      setError('');
    } catch (err) {
      setError(err.response?.data?.error || 'Failed to load');
    } finally {
      setLoadingTargets(false);
    }
  }, []);

  const fetchEntries = useCallback(async () => {
    if (!selectedTargetId) {
      setEntries([]);
      return;
    }
    setLoadingEntries(true);
    try {
      const now = new Date();
      const from = new Date(now.getFullYear(), now.getMonth() - 1, 1);
      const to = new Date(now.getFullYear(), now.getMonth() + 2, 0);
      const { data } = await entriesApi.list({
        targetId: selectedTargetId,
        from: toLocalDateString(from),
        to: toLocalDateString(to),
      });
      setEntries(data);
      setError('');
    } catch (err) {
      setError(err.response?.data?.error || 'Failed to load entries');
    } finally {
      setLoadingEntries(false);
    }
  }, [selectedTargetId]);

  useEffect(() => {
    fetchTargets();
  }, [fetchTargets]);

  useEffect(() => {
    fetchEntries();
  }, [fetchEntries]);

  const handleSaveEntry = async (data) => {
    try {
      const res = await entriesApi.create(data);
      fetchEntries();
      setHistoryRefreshTrigger((t) => t + 1);
      if (res.data?.deleted) {
        toast('Entry cleared', 'success');
      } else {
        toast('Saved', 'success');
      }
    } catch (err) {
      toast(err.response?.data?.error || 'Failed to save', 'error');
      throw err;
    }
  };

  const handleEntrySaved = () => {
    refetchStats();
  };

  const handleEditFromHistory = (entry) => {
    setOpenForEntry({
      entry,
      date: new Date(entry.entryDate + 'T12:00:00Z'),
    });
  };

  const handleHistoryRefresh = () => {
    setHistoryRefreshTrigger((t) => t + 1);
    fetchEntries();
    refetchStats();
  };

  if (loadingTargets) {
    return (
      <div className="flex justify-center py-12">
        <div className="animate-spin w-10 h-10 border-2 border-streak-500 border-t-transparent rounded-full" />
      </div>
    );
  }

  return (
    <div className="space-y-8">
      <h1 className="font-display text-2xl font-bold text-slate-800">Dashboard</h1>

      {error && (
        <div className="p-3 rounded-lg bg-red-50 text-red-700 text-sm">{error}</div>
      )}

      {selectedTargetId && (
        <>
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            <div className="lg:col-span-2">
              <DayCounterWidget
                targetId={selectedTargetId}
                stats={stats}
                loading={statsLoading}
                error={null}
              />
            </div>
            <div className="space-y-6">
              <StatsCards stats={stats} targetName={selectedTarget?.displayName || 'My Journey'} />
              <DashboardBanner />
            </div>
          </div>

          <div>
            <h2 className="font-display text-lg font-semibold text-slate-800 mb-4">Calendar</h2>
            <Calendar
              entries={entries}
              targetId={selectedTargetId}
              onSaveEntry={handleSaveEntry}
              onEntrySaved={handleEntrySaved}
              openForEntry={openForEntry}
              onOpenForEntryUsed={() => setOpenForEntry(null)}
            />
          </div>

          <div>
            <NotesHistoryTable
              targetId={selectedTargetId}
              onEditEntry={handleEditFromHistory}
              onRefresh={handleHistoryRefresh}
              onToast={toast}
              refreshTrigger={historyRefreshTrigger}
            />
          </div>
        </>
      )}
    </div>
  );
}
