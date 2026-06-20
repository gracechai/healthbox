export default function ConnectScreen({ onConnect, isConfigured }) {
  return (
    <div className="flex flex-col items-center justify-center h-full gap-6 p-8 text-center">
      <div className="text-5xl">🏥</div>
      <div>
        <h1 className="text-2xl font-bold text-slate-800 mb-2">HealthBox</h1>
        <p className="text-slate-500 max-w-sm">
          Turn your healthcare emails into a searchable timeline for the whole family.
        </p>
      </div>
      <button
        onClick={onConnect}
        disabled={!isConfigured}
        className="flex items-center gap-2 px-6 py-3 bg-indigo-600 text-white rounded-xl font-medium hover:bg-indigo-700 disabled:opacity-50 transition-colors shadow-sm"
      >
        Connect Gmail to get started
      </button>
      {!isConfigured && (
        <p className="text-xs text-amber-600 bg-amber-50 border border-amber-200 rounded-lg px-4 py-2 max-w-sm">
          Gmail credentials not configured. Add <code>GMAIL_CLIENT_ID</code> and{' '}
          <code>GMAIL_CLIENT_SECRET</code> to <code>backend/.env</code>
        </p>
      )}
    </div>
  );
}
