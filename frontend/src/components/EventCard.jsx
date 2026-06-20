const TYPE_CONFIG = {
  appointment:        { icon: '📅', bg: 'bg-emerald-50',  text: 'text-emerald-700',  border: 'border-emerald-200',  label: 'Appointment' },
  lab:                { icon: '🧪', bg: 'bg-amber-50',    text: 'text-amber-700',    border: 'border-amber-200',    label: 'Lab / Imaging' },
  medication:         { icon: '💊', bg: 'bg-violet-50',   text: 'text-violet-700',   border: 'border-violet-200',   label: 'Medication' },
  visit:              { icon: '🩺', bg: 'bg-sky-50',      text: 'text-sky-700',      border: 'border-sky-200',      label: 'Visit' },
  unstructured_event: { icon: '📄', bg: 'bg-slate-50',    text: 'text-slate-600',    border: 'border-slate-200',    label: 'Event' },
};

function formatDate(dateStr) {
  if (!dateStr) return null;
  const d = new Date(dateStr + 'T00:00:00');
  return d.toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' });
}

function isToday(dateStr) {
  if (!dateStr) return false;
  return dateStr === new Date().toISOString().split('T')[0];
}

function isUpcoming(dateStr) {
  if (!dateStr) return false;
  return dateStr > new Date().toISOString().split('T')[0];
}

export default function EventCard({ event, onClick, isSelected }) {
  const cfg = TYPE_CONFIG[event.type] || TYPE_CONFIG.unstructured_event;
  const today = isToday(event.date);
  const upcoming = !today && isUpcoming(event.date);

  return (
    <button
      onClick={onClick}
      className={`w-full text-left rounded-xl border p-3.5 transition-all group ${
        isSelected
          ? 'border-indigo-300 bg-indigo-50 shadow-sm'
          : 'border-slate-200 bg-white hover:border-slate-300 hover:shadow-sm'
      }`}
    >
      <div className="flex items-start gap-3">
        {/* Type icon */}
        <div className={`flex-shrink-0 w-8 h-8 rounded-lg flex items-center justify-center text-base ${cfg.bg}`}>
          {cfg.icon}
        </div>

        <div className="flex-1 min-w-0">
          {/* Title */}
          <p className={`text-sm font-medium leading-snug truncate ${isSelected ? 'text-indigo-900' : 'text-slate-800'}`}>
            {event.title}
          </p>

          {/* Meta row */}
          <div className="flex flex-wrap items-center gap-x-2 gap-y-0.5 mt-1">
            {event.date && (
              <span className={`text-xs font-medium ${today ? 'text-emerald-600' : upcoming ? 'text-amber-600' : 'text-slate-500'}`}>
                {today ? 'Today' : formatDate(event.date)}
              </span>
            )}
            {event.provider && (
              <span className="text-xs text-slate-400">· {event.provider}</span>
            )}
          </div>
        </div>

        {/* Right: person dot + type badge */}
        <div className="flex-shrink-0 flex flex-col items-end gap-1">
          {event.person_name && (
            <span
              className="w-2 h-2 rounded-full"
              style={{ backgroundColor: event.person_color || '#94a3b8' }}
              title={event.person_name}
            />
          )}
          <span className={`text-[10px] font-medium px-1.5 py-0.5 rounded-full border ${cfg.bg} ${cfg.text} ${cfg.border}`}>
            {cfg.label}
          </span>
        </div>
      </div>

      {/* Unassigned warning */}
      {!event.person_id && (
        <div className="mt-2 text-[11px] text-amber-600 bg-amber-50 rounded px-2 py-1 flex items-center gap-1">
          ⚠ Tap to assign to a person
        </div>
      )}
    </button>
  );
}
