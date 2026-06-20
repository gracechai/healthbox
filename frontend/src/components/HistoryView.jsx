import { useState, useEffect, useRef, useCallback } from 'react';
import { api } from '../api.js';
import EventCard from './EventCard.jsx';

function monthKey(dateStr) {
  if (!dateStr) return 'No Date';
  const d = new Date(dateStr + 'T00:00:00');
  return d.toLocaleDateString('en-US', { month: 'long', year: 'numeric' });
}

function groupByMonth(events) {
  const groups = {};
  for (const ev of events) {
    const key = monthKey(ev.date);
    if (!groups[key]) groups[key] = [];
    groups[key].push(ev);
  }
  return groups;
}

const TYPE_FILTERS = [
  { value: '',            label: 'All types' },
  { value: 'appointment', label: 'Appointments' },
  { value: 'lab',         label: 'Labs' },
  { value: 'medication',  label: 'Medications' },
  { value: 'visit',       label: 'Visits' },
];

export default function HistoryView({ selectedPerson, onSelectEvent, selectedEventId, refreshKey }) {
  const [events,     setEvents]     = useState([]);
  const [typeFilter, setTypeFilter] = useState('');
  const [loading,    setLoading]    = useState(true);
  const [page,       setPage]       = useState(0);
  const [hasMore,    setHasMore]    = useState(true);
  const PAGE_SIZE = 50;

  const loadEvents = useCallback(async (reset = false) => {
    setLoading(true);
    const params = { limit: PAGE_SIZE };
    if (selectedPerson) params.person = selectedPerson;
    if (typeFilter)     params.type   = typeFilter;

    const data = await api.events.list(params).catch(() => []);
    if (reset) {
      setEvents(data);
      setPage(0);
    } else {
      setEvents(data);
    }
    setHasMore(data.length === PAGE_SIZE);
    setLoading(false);
  }, [selectedPerson, typeFilter, refreshKey]);

  useEffect(() => { loadEvents(true); }, [selectedPerson, typeFilter]);

  const grouped = groupByMonth(events);
  const months  = Object.keys(grouped).sort((a, b) => {
    if (a === 'No Date') return 1;
    if (b === 'No Date') return -1;
    return new Date(b) - new Date(a);
  });

  if (loading) return <LoadingState />;

  return (
    <div className="p-4 max-w-2xl mx-auto flex flex-col gap-4">
      {/* Filter row */}
      <div className="flex items-center gap-2 flex-wrap">
        {TYPE_FILTERS.map((f) => (
          <button
            key={f.value}
            onClick={() => setTypeFilter(f.value)}
            className={`text-xs px-3 py-1.5 rounded-full border transition-colors ${
              typeFilter === f.value
                ? 'bg-indigo-600 text-white border-indigo-600'
                : 'bg-white text-slate-600 border-slate-200 hover:border-slate-300'
            }`}
          >
            {f.label}
          </button>
        ))}
        <span className="text-xs text-slate-400 ml-auto">{events.length} event{events.length !== 1 ? 's' : ''}</span>
      </div>

      {events.length === 0 ? (
        <EmptyState />
      ) : (
        months.map((month) => (
          <section key={month}>
            <div className="flex items-center gap-3 mb-2">
              <h2 className="text-xs font-semibold uppercase tracking-wider text-slate-500 whitespace-nowrap">{month}</h2>
              <div className="flex-1 h-px bg-slate-200" />
              <span className="text-xs text-slate-400">{grouped[month].length}</span>
            </div>
            <div className="flex flex-col gap-2">
              {grouped[month].map((ev) => (
                <EventCard
                  key={ev.id}
                  event={ev}
                  isSelected={ev.id === selectedEventId}
                  onClick={() => onSelectEvent(ev)}
                />
              ))}
            </div>
          </section>
        ))
      )}
    </div>
  );
}

function LoadingState() {
  return (
    <div className="p-4 flex flex-col gap-3 max-w-2xl mx-auto">
      <div className="h-4 w-24 bg-slate-100 rounded animate-pulse" />
      {[1,2,3,4].map((i) => (
        <div key={i} className="h-16 bg-slate-100 rounded-xl animate-pulse" />
      ))}
    </div>
  );
}

function EmptyState() {
  return (
    <div className="flex flex-col items-center justify-center py-16 gap-3 text-center">
      <span className="text-4xl">📋</span>
      <p className="text-slate-500">No events found.</p>
    </div>
  );
}
