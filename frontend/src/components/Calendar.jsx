/**
 * Calendar component - marks days with NO_CONTACT, CONTACT, RESET
 * Uses react-calendar
 */
import { useState, useEffect } from 'react';
import ReactCalendar from 'react-calendar';
import 'react-calendar/dist/Calendar.css';
import DayEntryModal from './DayEntryModal.jsx';

const STATUS_CLASS = {
  NO_CONTACT: 'bg-green-500',
  CONTACT: 'bg-red-500',
  RESET: 'bg-amber-500',
};

/** Get YYYY-MM-DD in local timezone (avoids toISOString() UTC shift bug) */
function toLocalDateString(date) {
  const d = new Date(date);
  const y = d.getFullYear();
  const m = String(d.getMonth() + 1).padStart(2, '0');
  const day = String(d.getDate()).padStart(2, '0');
  return `${y}-${m}-${day}`;
}

function tileClassName({ date, view }) {
  if (view !== 'month') return null;
  return 'relative';
}

export default function Calendar({ entries, targetId, onSaveEntry, onEntrySaved, openForEntry, onOpenForEntryUsed }) {
  const [selectedDate, setSelectedDate] = useState(null);
  const [modalOpen, setModalOpen] = useState(false);
  const [entryOverride, setEntryOverride] = useState(null);

  useEffect(() => {
    if (openForEntry?.entry) {
      const d = openForEntry.date ? new Date(openForEntry.date) : new Date(openForEntry.entry.entryDate + 'T12:00:00Z');
      setSelectedDate(d);
      setEntryOverride(openForEntry.entry);
      setModalOpen(true);
      onOpenForEntryUsed?.();
    }
  }, [openForEntry, onOpenForEntryUsed]);

  const entriesByDate = new Map();
  for (const e of entries || []) {
    const key = typeof e.entryDate === 'string' ? e.entryDate.slice(0, 10) : toLocalDateString(e.entryDate);
    entriesByDate.set(key, e);
  }

  const tileContent = ({ date, view }) => {
    if (view !== 'month') return null;
    const key = toLocalDateString(date);
    const entry = entriesByDate.get(key);
    if (!entry) return null;
    return (
      <div
        className={`absolute bottom-1 left-1/2 -translate-x-1/2 w-2 h-2 rounded-full ${STATUS_CLASS[entry.status] || 'bg-slate-400'}`}
        title={entry.status}
      />
    );
  };

  const handleSelect = (date) => {
    setSelectedDate(date);
    setModalOpen(true);
  };

  const handleSave = async (data) => {
    if (!targetId || !selectedDate) return;
    await onSaveEntry({
      targetId,
      entryDate: toLocalDateString(selectedDate),
      ...data,
    });
    onEntrySaved?.();
  };

  const selectedEntry = selectedDate
    ? (entryOverride ?? entriesByDate.get(toLocalDateString(selectedDate)))
    : null;

  const handleModalClose = () => {
    setModalOpen(false);
    setEntryOverride(null);
  };

  return (
    <>
      <div className="bg-white rounded-xl border border-slate-200 p-4 sm:p-6 shadow-sm">
        <ReactCalendar
          onChange={handleSelect}
          value={selectedDate}
          tileClassName={tileClassName}
          tileContent={tileContent}
          className="react-calendar w-full"
        />
        <div className="flex gap-4 mt-4 flex-wrap">
          <span className="flex items-center gap-2 text-sm">
            <span className="w-2 h-2 rounded-full bg-green-500" /> No Contact
          </span>
          <span className="flex items-center gap-2 text-sm">
            <span className="w-2 h-2 rounded-full bg-red-500" /> Contact
          </span>
          <span className="flex items-center gap-2 text-sm">
            <span className="w-2 h-2 rounded-full bg-amber-500" /> Reset
          </span>
        </div>
      </div>

      {modalOpen && selectedDate && (
        <DayEntryModal
          date={selectedDate}
          entry={selectedEntry}
          onSave={handleSave}
          onClose={handleModalClose}
        />
      )}
    </>
  );
}
