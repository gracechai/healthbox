import { useState, useCallback, useRef } from 'react';
import { api } from '../api.js';
import EventCard from './EventCard.jsx';

export default function SearchView({ selectedPerson, onSelectEvent, selectedEventId }) {
  const [query,    setQuery]    = useState('');
  const [results,  setResults]  = useState([]);
  const [loading,  setLoading]  = useState(false);
  const [searched, setSearched] = useState(false);
  const debounceRef = useRef(null);
  const inputRef    = useRef(null);

  const runSearch = useCallback(async (q) => {
    if (!q.trim()) { setResults([]); setSearched(false); return; }
    setLoading(true);
    const data = await api.events.search(q.trim(), selectedPerson || undefined).catch(() => []);
    setResults(data);
    setSearched(true);
    setLoading(false);
  }, [selectedPerson]);

  const handleChange = (e) => {
    const q = e.target.value;
    setQuery(q);
    clearTimeout(debounceRef.current);
    debounceRef.current = setTimeout(() => runSearch(q), 350);
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    clearTimeout(debounceRef.current);
    const q = inputRef.current?.value || query;
    runSearch(q);
  };

  const handleChipClick = (term) => {
    setQuery(term);
    if (inputRef.current) inputRef.current.value = term;
    clearTimeout(debounceRef.current);
    runSearch(term);
  };

  return (
    <div className="p-4 max-w-2xl mx-auto flex flex-col gap-4">
      {/* Search bar */}
      <form onSubmit={handleSubmit} className="relative">
        <div className="absolute inset-y-0 left-3.5 flex items-center pointer-events-none text-slate-400">
          <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-4.35-4.35M17 11A6 6 0 105 11a6 6 0 0012 0z" />
          </svg>
        </div>
        <input
          ref={inputRef}
          autoFocus
          type="search"
          defaultValue={query}
          onChange={handleChange}
          placeholder='Search events — try "cardiology", "blood work", "Dr. Martinez"…'
          className="w-full pl-10 pr-4 py-3 text-sm border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-indigo-300 bg-white shadow-sm"
        />
        {loading && (
          <div className="absolute inset-y-0 right-3.5 flex items-center">
            <svg className="w-4 h-4 animate-spin text-indigo-400" fill="none" viewBox="0 0 24 24">
              <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
              <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8v4l3-3-3-3v4a8 8 0 00-8 8h4z" />
            </svg>
          </div>
        )}
      </form>

      {/* Quick-search chips */}
      {!query && (
        <div className="flex flex-wrap gap-2">
          {['cardiology', 'lab results', 'MRI', 'prescription', 'follow-up', 'wellness'].map((term) => (
            <button
              key={term}
              onClick={() => handleChipClick(term)}
              className="text-xs px-3 py-1.5 rounded-full bg-white border border-slate-200 text-slate-600 hover:border-indigo-300 hover:text-indigo-700 transition-colors"
            >
              {term}
            </button>
          ))}
        </div>
      )}

      {/* Results */}
      {searched && !loading && (
        <div className="flex items-center justify-between">
          <p className="text-xs text-slate-500">
            {results.length === 0
              ? `No results for "${query}"`
              : `${results.length} result${results.length !== 1 ? 's' : ''} for "${query}"`}
          </p>
        </div>
      )}

      {results.length > 0 && (
        <div className="flex flex-col gap-2">
          {results.map((ev) => (
            <EventCard
              key={ev.id}
              event={ev}
              isSelected={ev.id === selectedEventId}
              onClick={() => onSelectEvent(ev)}
            />
          ))}
        </div>
      )}

      {searched && results.length === 0 && !loading && query && (
        <div className="flex flex-col items-center py-12 gap-3 text-center">
          <span className="text-4xl">🔍</span>
          <p className="text-slate-500 text-sm">No events matched.</p>
          <p className="text-slate-400 text-xs">Try a doctor name, event type, or date.</p>
        </div>
      )}

      {!searched && !query && (
        <div className="flex flex-col items-center py-12 gap-3 text-center">
          <span className="text-4xl">🔍</span>
          <p className="text-slate-600 font-medium">Search all health events</p>
          <p className="text-slate-400 text-sm max-w-xs">
            Find any appointment, lab, or medication across all emails and people.
          </p>
        </div>
      )}
    </div>
  );
}
