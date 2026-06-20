import { useState } from 'react';
import { api } from '../api.js';

const PERSON_COLORS = {
  self:   '#6366f1',
  mom:    '#ec4899',
  dad:    '#3b82f6',
};

const TYPE_ICONS = {
  appointment:       '📅',
  lab:               '🧪',
  medication:        '💊',
  visit:             '🩺',
  unstructured_event: '📄',
};

export default function PeopleSelector({ people, selectedPerson, onSelectPerson, onRefresh }) {
  const [showAdd, setShowAdd] = useState(false);
  const [newName, setNewName] = useState('');
  const [newRel,  setNewRel]  = useState('');
  const [adding,  setAdding]  = useState(false);

  const total = people.reduce((s, p) => s + p.event_count, 0);

  const handleAdd = async (e) => {
    e.preventDefault();
    if (!newName.trim() || !newRel.trim()) return;
    setAdding(true);
    await api.people.create({ name: newName.trim(), relationship: newRel.trim() }).catch(() => {});
    setNewName('');
    setNewRel('');
    setShowAdd(false);
    setAdding(false);
    onRefresh();
  };

  return (
    <div className="p-3 flex flex-col gap-1">
      <p className="text-xs font-semibold uppercase tracking-wider text-slate-400 px-2 py-1">People</p>

      {/* All */}
      <button
        onClick={() => onSelectPerson(null)}
        className={`w-full flex items-center justify-between px-3 py-2 rounded-lg text-sm transition-colors ${
          selectedPerson === null
            ? 'bg-indigo-50 text-indigo-700 font-medium'
            : 'text-slate-600 hover:bg-slate-50'
        }`}
      >
        <span className="flex items-center gap-2">
          <span className="w-2 h-2 rounded-full bg-slate-400 inline-block" />
          All People
        </span>
        <span className="text-xs text-slate-400">{total}</span>
      </button>

      {/* Individual people */}
      {people.map((p) => {
        const color = p.color || PERSON_COLORS[p.id] || '#6b7280';
        const isSelected = selectedPerson === p.id;
        return (
          <button
            key={p.id}
            onClick={() => onSelectPerson(p.id)}
            className={`w-full flex items-center justify-between px-3 py-2 rounded-lg text-sm transition-colors ${
              isSelected
                ? 'bg-indigo-50 text-indigo-700 font-medium'
                : 'text-slate-600 hover:bg-slate-50'
            }`}
          >
            <span className="flex items-center gap-2">
              <span
                className="w-2.5 h-2.5 rounded-full flex-shrink-0"
                style={{ backgroundColor: color }}
              />
              <span>{p.name}</span>
            </span>
            <span className="text-xs text-slate-400">{p.event_count}</span>
          </button>
        );
      })}

      <div className="mt-2 border-t border-slate-100 pt-2">
        {!showAdd ? (
          <button
            onClick={() => setShowAdd(true)}
            className="w-full text-left text-xs text-slate-400 hover:text-slate-600 px-3 py-1.5 rounded-lg hover:bg-slate-50 transition-colors"
          >
            + Add person
          </button>
        ) : (
          <form onSubmit={handleAdd} className="flex flex-col gap-1.5 px-1">
            <input
              autoFocus
              value={newName}
              onChange={(e) => setNewName(e.target.value)}
              placeholder="Name (e.g. Grandma)"
              className="text-xs border border-slate-200 rounded-lg px-2.5 py-1.5 focus:outline-none focus:ring-2 focus:ring-indigo-300"
            />
            <input
              value={newRel}
              onChange={(e) => setNewRel(e.target.value)}
              placeholder="Relationship (e.g. grandmother)"
              className="text-xs border border-slate-200 rounded-lg px-2.5 py-1.5 focus:outline-none focus:ring-2 focus:ring-indigo-300"
            />
            <div className="flex gap-1">
              <button
                type="submit"
                disabled={adding}
                className="flex-1 text-xs bg-indigo-600 text-white rounded-lg py-1.5 hover:bg-indigo-700 disabled:opacity-50 transition-colors"
              >
                Add
              </button>
              <button
                type="button"
                onClick={() => setShowAdd(false)}
                className="flex-1 text-xs border border-slate-200 rounded-lg py-1.5 hover:bg-slate-50 transition-colors"
              >
                Cancel
              </button>
            </div>
          </form>
        )}
      </div>
    </div>
  );
}
