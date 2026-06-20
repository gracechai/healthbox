import { useState } from 'react';

function formatEmailDate(dateStr) {
  if (!dateStr) return '';
  return new Date(dateStr).toLocaleDateString('en-US', {
    month: 'short', day: 'numeric', year: 'numeric',
  });
}

function fromName(from) {
  if (!from) return '';
  const m = from.match(/^([^<]+)</);
  return m ? m[1].trim() : from.split('@')[0];
}

export default function EmailPreview({ email }) {
  const [expanded, setExpanded] = useState(false);

  const bodyText = email.body_text || '';
  const preview  = bodyText.slice(0, 300).trim();
  const hasMore  = bodyText.length > 300;

  return (
    <div className="rounded-xl border border-slate-200 bg-slate-50 overflow-hidden">
      {/* Email header */}
      <div className="px-3 py-2.5 bg-white border-b border-slate-100">
        <p className="text-xs font-semibold text-slate-700 leading-snug line-clamp-2">{email.subject}</p>
        <div className="flex items-center justify-between mt-1">
          <p className="text-xs text-slate-400">{fromName(email.from_address)}</p>
          <p className="text-xs text-slate-400">{formatEmailDate(email.date)}</p>
        </div>
      </div>

      {/* Body preview */}
      <div className="px-3 py-2.5">
        <p className="text-xs text-slate-600 leading-relaxed whitespace-pre-wrap">
          {expanded ? bodyText : (preview + (hasMore ? '…' : ''))}
        </p>
        {hasMore && (
          <button
            onClick={() => setExpanded(!expanded)}
            className="text-xs text-indigo-600 hover:text-indigo-800 mt-2 font-medium transition-colors"
          >
            {expanded ? 'Show less' : 'Read full email'}
          </button>
        )}
      </div>
    </div>
  );
}
