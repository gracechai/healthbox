import PeopleSelector from './PeopleSelector.jsx';
import TodayView      from './TodayView.jsx';
import HistoryView    from './HistoryView.jsx';
import SearchView     from './SearchView.jsx';
import EventDetail    from './EventDetail.jsx';
import ConnectScreen  from './ConnectScreen.jsx';

export default function Layout(props) {
  const {
    isConnected, isConfigured, isSyncing, isSeeding,
    people, selectedPerson, onSelectPerson,
    view, onViewChange,
    selectedEvent, onSelectEvent,
    onSync, onSeed, onConnect, onDisconnect,
    syncResult, error, onDismissError, onRefreshPeople,
    refreshKey,
  } = props;

  return (
    <div className="flex flex-col h-screen overflow-hidden bg-slate-50">
      {/* Top bar */}
      <header className="flex-shrink-0 flex items-center justify-between px-5 h-14 bg-white border-b border-slate-200 z-10">
        <div className="flex items-center gap-2.5">
          <span className="text-xl">🏥</span>
          <span className="font-semibold text-slate-800 tracking-tight">HealthBox</span>
          <span className="text-xs bg-indigo-100 text-indigo-700 rounded-full px-2 py-0.5 font-medium">MVP</span>
        </div>

        <div className="flex items-center gap-2">
          {isConnected ? (
            <>
              <button
                onClick={onSync}
                disabled={isSyncing}
                className="flex items-center gap-1.5 text-sm px-3 py-1.5 rounded-lg bg-indigo-600 text-white hover:bg-indigo-700 disabled:opacity-60 transition-colors"
              >
                {isSyncing ? (
                  <><SpinIcon /><span>Syncing…</span></>
                ) : (
                  <><SyncIcon /><span>Sync Gmail</span></>
                )}
              </button>
              <button
                onClick={onDisconnect}
                className="text-xs text-slate-500 hover:text-slate-700 px-2 py-1.5 rounded-lg hover:bg-slate-100 transition-colors"
              >
                Disconnect
              </button>
            </>
          ) : (
            <button
              onClick={onConnect}
              className="flex items-center gap-1.5 text-sm px-3 py-1.5 rounded-lg border border-slate-300 text-slate-700 hover:bg-slate-50 transition-colors"
            >
              <GmailIcon />
              Connect Gmail
            </button>
          )}

          <button
            onClick={onSeed}
            disabled={isSeeding}
            title="Load demo data"
            className="text-xs text-slate-400 hover:text-slate-600 px-2 py-1.5 rounded-lg hover:bg-slate-100 transition-colors disabled:opacity-50"
          >
            {isSeeding ? 'Loading…' : 'Demo data'}
          </button>
        </div>
      </header>

      {/* Banners */}
      {syncResult && (
        <div className="flex-shrink-0 flex items-center justify-between px-5 py-2 bg-emerald-50 border-b border-emerald-200 text-sm text-emerald-800">
          <span>
            {syncResult.seeded
              ? `Demo data loaded — ${syncResult.newEvents} events across 3 people`
              : `Sync complete — ${syncResult.newEmails} emails, ${syncResult.newEvents} new events`}
          </span>
          <button onClick={() => {}} className="text-emerald-600 hover:text-emerald-800 font-medium">✕</button>
        </div>
      )}
      {error && (
        <div className="flex-shrink-0 flex items-center justify-between px-5 py-2 bg-red-50 border-b border-red-200 text-sm text-red-700">
          <span>{error}</span>
          <button onClick={onDismissError} className="text-red-500 hover:text-red-700 font-medium">✕</button>
        </div>
      )}

      {/* Main 3-column body */}
      <div className="flex flex-1 min-h-0">
        {/* Left: People selector */}
        <aside className="w-56 flex-shrink-0 bg-white border-r border-slate-200 overflow-y-auto scrollbar-thin hidden md:block">
          <PeopleSelector
            people={people}
            selectedPerson={selectedPerson}
            onSelectPerson={onSelectPerson}
            onRefresh={onRefreshPeople}
          />
        </aside>

        {/* Center: main content */}
        <main className="flex-1 flex flex-col min-w-0 overflow-hidden">
          {/* Tab bar */}
          <nav className="flex-shrink-0 flex items-center gap-1 px-4 pt-3 pb-0 bg-white border-b border-slate-200">
            {['today', 'history', 'search'].map((v) => (
              <button
                key={v}
                onClick={() => onViewChange(v)}
                className={`px-4 py-2 text-sm font-medium rounded-t-lg border-b-2 transition-colors ${
                  view === v
                    ? 'border-indigo-600 text-indigo-700 bg-indigo-50'
                    : 'border-transparent text-slate-500 hover:text-slate-700 hover:bg-slate-50'
                }`}
              >
                {v === 'today' ? '📅 Today' : v === 'history' ? '📋 History' : '🔍 Search'}
              </button>
            ))}

            {/* Mobile person switcher */}
            <div className="ml-auto md:hidden">
              <select
                className="text-sm border border-slate-200 rounded-lg px-2 py-1 text-slate-600"
                value={selectedPerson || ''}
                onChange={(e) => onSelectPerson(e.target.value || null)}
              >
                <option value="">All</option>
                {people.map((p) => (
                  <option key={p.id} value={p.id}>{p.name}</option>
                ))}
              </select>
            </div>
          </nav>

          <div className="flex-1 overflow-y-auto scrollbar-thin">
            {view === 'today'   && <TodayView   selectedPerson={selectedPerson} onSelectEvent={onSelectEvent} selectedEventId={selectedEvent?.id} refreshKey={refreshKey} />}
            {view === 'history' && <HistoryView selectedPerson={selectedPerson} onSelectEvent={onSelectEvent} selectedEventId={selectedEvent?.id} refreshKey={refreshKey} />}
            {view === 'search'  && <SearchView  selectedPerson={selectedPerson} onSelectEvent={onSelectEvent} selectedEventId={selectedEvent?.id} />}
          </div>
        </main>

        {/* Right: event detail */}
        <aside className="w-80 flex-shrink-0 bg-white border-l border-slate-200 overflow-y-auto scrollbar-thin hidden lg:block">
          <EventDetail event={selectedEvent} onUpdate={() => {}} />
        </aside>
      </div>
    </div>
  );
}

function SyncIcon() {
  return (
    <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
    </svg>
  );
}

function SpinIcon() {
  return (
    <svg className="w-3.5 h-3.5 animate-spin" fill="none" viewBox="0 0 24 24">
      <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
      <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8v4l3-3-3-3v4a8 8 0 00-8 8h4z" />
    </svg>
  );
}

function GmailIcon() {
  return (
    <svg className="w-3.5 h-3.5" viewBox="0 0 24 24" fill="currentColor">
      <path d="M24 5.457v13.909c0 .904-.732 1.636-1.636 1.636h-3.819V11.73L12 16.64l-6.545-4.91v9.273H1.636A1.636 1.636 0 010 19.366V5.457c0-2.023 2.309-3.178 3.927-1.964L5.455 4.64 12 9.548l6.545-4.910 1.528-1.145C21.69 2.28 24 3.434 24 5.457z" />
    </svg>
  );
}
