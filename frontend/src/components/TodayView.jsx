import { useState, useEffect } from 'react';
import { api } from '../api.js';
import EventCard from './EventCard.jsx';

function formatDate(dateStr) {
  if (!dateStr) return '';
  const d = new Date(dateStr + 'T00:00:00');
  return d.toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' });
}

function daysUntil(dateStr) {
  if (!dateStr) return null;
  const today = new Date();
  today.setHours(0, 0, 0, 0);
  const target = new Date(dateStr + 'T00:00:00');
  const diff = Math.round((target - today) / 86400000);
  if (diff === 0) return 'Today';
  if (diff === 1) return 'Tomorrow';
  return `In ${diff} days`;
}

export default function TodayView({ selectedPerson, onSelectEvent, selectedEventId, refreshKey }) {
  const [data,    setData]    = useState({ today: [], upcoming: [], recent: [] });
  const [meds,    setMeds]    = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    setLoading(true);
    const params = selectedPerson ? { person: selectedPerson } : {};
    Promise.all([
      api.events.today(params),
      api.medications.list(params),
    ])
      .then(([evData, medData]) => {
        setData(evData);
        setMeds(medData);
      })
      .catch(() => {})
      .finally(() => setLoading(false));
  }, [selectedPerson, refreshKey]);

  const todayLabel = new Date().toLocaleDateString('en-US', {
    weekday: 'long', month: 'long', day: 'numeric', year: 'numeric',
  });

  if (loading) return <LoadingState />;

  const empty = data.today.length === 0 && data.upcoming.length === 0 && data.recent.length === 0;

  if (empty) return <EmptyState />;

  return (
    <div className="p-4 max-w-2xl mx-auto flex flex-col gap-6">
      {/* Today */}
      <section>
        <SectionHeader label={`Today — ${todayLabel}`} count={data.today.length} />
        {data.today.length === 0 ? (
          <p className="text-sm text-slate-400 px-1 py-2">No events today.</p>
        ) : (
          <div className="flex flex-col gap-2">
            {data.today.map((ev) => (
              <EventCard
                key={ev.id}
                event={ev}
                isSelected={ev.id === selectedEventId}
                onClick={() => onSelectEvent(ev)}
              />
            ))}
          </div>
        )}
      </section>

      {/* Upcoming */}
      {data.upcoming.length > 0 && (
        <section>
          <SectionHeader label="Upcoming — next 30 days" count={data.upcoming.length} />
          <div className="flex flex-col gap-2">
            {data.upcoming.map((ev) => (
              <div key={ev.id} className="relative">
                <div className="absolute -left-0.5 top-3.5 flex items-center gap-1 -translate-x-full pr-2 hidden sm:flex">
                  <span className="text-xs font-medium text-amber-600 whitespace-nowrap">{daysUntil(ev.date)}</span>
                </div>
                <EventCard
                  event={ev}
                  isSelected={ev.id === selectedEventId}
                  onClick={() => onSelectEvent(ev)}
                />
              </div>
            ))}
          </div>
        </section>
      )}

      {/* Medications */}
      {meds.length > 0 && (
        <section>
          <SectionHeader label="Current Medications" count={meds.length} />
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
            {meds.map((m) => (
              <div key={m.id} className="flex items-center gap-3 bg-white border border-violet-200 rounded-xl p-3">
                <span className="text-lg">💊</span>
                <div className="min-w-0">
                  <p className="text-sm font-medium text-slate-800 truncate">{m.name}</p>
                  {m.dosage && <p className="text-xs text-slate-500">{m.dosage}</p>}
                  {m.person_name && (
                    <p className="text-xs mt-0.5" style={{ color: m.person_color || '#94a3b8' }}>
                      {m.person_name}
                    </p>
                  )}
                </div>
              </div>
            ))}
          </div>
        </section>
      )}

      {/* Recent past */}
      {data.recent.length > 0 && (
        <section>
          <SectionHeader label="Recent Past Events" count={data.recent.length} muted />
          <div className="flex flex-col gap-2 opacity-70">
            {data.recent.map((ev) => (
              <EventCard
                key={ev.id}
                event={ev}
                isSelected={ev.id === selectedEventId}
                onClick={() => onSelectEvent(ev)}
              />
            ))}
          </div>
        </section>
      )}
    </div>
  );
}

function SectionHeader({ label, count, muted }) {
  return (
    <div className="flex items-center justify-between mb-2">
      <h2 className={`text-xs font-semibold uppercase tracking-wider ${muted ? 'text-slate-400' : 'text-slate-500'}`}>
        {label}
      </h2>
      {count > 0 && (
        <span className="text-xs text-slate-400 bg-slate-100 rounded-full px-2 py-0.5">{count}</span>
      )}
    </div>
  );
}

function LoadingState() {
  return (
    <div className="p-8 flex flex-col gap-3">
      {[1,2,3].map((i) => (
        <div key={i} className="h-16 bg-slate-100 rounded-xl animate-pulse" />
      ))}
    </div>
  );
}

function EmptyState() {
  return (
    <div className="flex flex-col items-center justify-center h-full gap-4 p-12 text-center">
      <span className="text-4xl">📭</span>
      <div>
        <p className="text-slate-600 font-medium">No events yet</p>
        <p className="text-slate-400 text-sm mt-1">Connect Gmail and sync, or load demo data to get started.</p>
      </div>
    </div>
  );
}
