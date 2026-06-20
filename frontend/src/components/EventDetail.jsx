import { useState, useEffect } from 'react';
import { api } from '../api.js';
import EmailPreview from './EmailPreview.jsx';

const TYPE_CONFIG = {
  appointment:        { icon: '📅', label: 'Appointment',  color: 'text-emerald-700 bg-emerald-50 border-emerald-200' },
  lab:                { icon: '🧪', label: 'Lab / Imaging', color: 'text-amber-700 bg-amber-50 border-amber-200' },
  medication:         { icon: '💊', label: 'Medication',    color: 'text-violet-700 bg-violet-50 border-violet-200' },
  visit:              { icon: '🩺', label: 'Visit',         color: 'text-sky-700 bg-sky-50 border-sky-200' },
  unstructured_event: { icon: '📄', label: 'Event',         color: 'text-slate-600 bg-slate-50 border-slate-200' },
};

function formatDate(dateStr) {
  if (!dateStr) return null;
  const d = new Date(dateStr + 'T00:00:00');
  return d.toLocaleDateString('en-US', { weekday: 'long', month: 'long', day: 'numeric', year: 'numeric' });
}

export default function EventDetail({ event, onUpdate }) {
  const [email,   setEmail]   = useState(null);
  const [loading, setLoading] = useState(false);
  const [people,  setPeople]  = useState([]);
  const [assigning, setAssigning] = useState(false);

  useEffect(() => {
    if (!event) { setEmail(null); return; }
    if (event.source_email_id) {
      setLoading(true);
      api.emails.get(event.source_email_id)
        .then(setEmail)
        .catch(() => setEmail(null))
        .finally(() => setLoading(false));
    } else {
      setEmail(null);
    }
  }, [event?.id]);

  useEffect(() => {
    api.people.list().then(setPeople).catch(() => {});
  }, []);

  const handleAssign = async (personId) => {
    if (!event) return;
    setAssigning(true);
    await api.events.update(event.id, { person_id: personId }).catch(() => {});
    setAssigning(false);
    onUpdate?.();
  };

  if (!event) {
    return (
      <div className="flex flex-col items-center justify-center h-full gap-3 p-8 text-center">
        <span className="text-4xl">👆</span>
        <p className="text-sm text-slate-400">Select an event to see details</p>
      </div>
    );
  }

  const cfg = TYPE_CONFIG[event.type] || TYPE_CONFIG.unstructured_event;

  return (
    <div className="flex flex-col h-full">
      {/* Header */}
      <div className="p-4 border-b border-slate-100">
        <div className="flex items-start gap-2 mb-3">
          <span className="text-xl mt-0.5">{cfg.icon}</span>
          <h2 className="text-sm font-semibold text-slate-800 leading-snug flex-1">{event.title}</h2>
        </div>
        <span className={`text-xs font-medium px-2 py-1 rounded-full border ${cfg.color}`}>
          {cfg.label}
        </span>
      </div>

      {/* Details */}
      <div className="flex-1 overflow-y-auto scrollbar-thin p-4 flex flex-col gap-4">
        <dl className="flex flex-col gap-3">
          {event.date && (
            <DetailRow label="Date" value={formatDate(event.date)} />
          )}
          {event.provider && (
            <DetailRow label="Provider" value={event.provider} />
          )}
          <DetailRow
            label="Person"
            value={
              <div className="flex items-center gap-2">
                {event.person_name ? (
                  <>
                    <span
                      className="w-2 h-2 rounded-full"
                      style={{ backgroundColor: event.person_color || '#94a3b8' }}
                    />
                    <span>{event.person_name}</span>
                  </>
                ) : (
                  <span className="text-amber-600">Unassigned</span>
                )}
              </div>
            }
          />
        </dl>

        {/* Assign person */}
        {!event.person_id && people.length > 0 && (
          <div className="rounded-xl border border-amber-200 bg-amber-50 p-3">
            <p className="text-xs font-medium text-amber-700 mb-2">Assign to a person</p>
            <div className="flex flex-wrap gap-1.5">
              {people.map((p) => (
                <button
                  key={p.id}
                  onClick={() => handleAssign(p.id)}
                  disabled={assigning}
                  className="text-xs px-2.5 py-1.5 rounded-lg border border-slate-200 bg-white text-slate-700 hover:bg-indigo-50 hover:border-indigo-300 hover:text-indigo-700 transition-colors disabled:opacity-50"
                >
                  {p.name}
                </button>
              ))}
            </div>
          </div>
        )}

        {/* Notes */}
        {event.notes && (
          <div>
            <p className="text-xs font-semibold text-slate-500 uppercase tracking-wider mb-1">Notes</p>
            <p className="text-sm text-slate-700 leading-relaxed">{event.notes}</p>
          </div>
        )}

        {/* Source email */}
        <div>
          <p className="text-xs font-semibold text-slate-500 uppercase tracking-wider mb-2">Source Email</p>
          {loading ? (
            <div className="h-24 bg-slate-100 rounded-xl animate-pulse" />
          ) : email ? (
            <EmailPreview email={email} />
          ) : (
            <p className="text-xs text-slate-400 italic">No linked email</p>
          )}
        </div>
      </div>
    </div>
  );
}

function DetailRow({ label, value }) {
  return (
    <div>
      <dt className="text-xs font-medium text-slate-400 uppercase tracking-wider mb-0.5">{label}</dt>
      <dd className="text-sm text-slate-700">{value}</dd>
    </div>
  );
}
