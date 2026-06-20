import { useState, useEffect, useCallback } from 'react';
import { api } from './api.js';
import Layout from './components/Layout.jsx';
import ConnectScreen from './components/ConnectScreen.jsx';

export default function App() {
  const [isConnected,   setIsConnected]   = useState(false);
  const [isConfigured,  setIsConfigured]  = useState(true);
  const [isSyncing,     setIsSyncing]     = useState(false);
  const [isSeeding,     setIsSeeding]     = useState(false);
  const [people,        setPeople]        = useState([]);
  const [selectedPerson, setSelectedPerson] = useState(null); // null = all
  const [view,          setView]          = useState('today');
  const [selectedEvent, setSelectedEvent] = useState(null);
  const [syncResult,    setSyncResult]    = useState(null);
  const [error,         setError]         = useState(null);
  const [refreshKey,    setRefreshKey]    = useState(0);

  const loadPeople = useCallback(async () => {
    const data = await api.people.list().catch(() => []);
    setPeople(data);
  }, []);

  const checkStatus = useCallback(async () => {
    const s = await api.auth.status().catch(() => ({ connected: false, configured: false }));
    setIsConnected(s.connected);
    setIsConfigured(s.configured);
  }, []);

  useEffect(() => {
    checkStatus();
    loadPeople();

    const params = new URLSearchParams(window.location.search);
    if (params.get('auth_success')) {
      setIsConnected(true);
      window.history.replaceState({}, '', '/');
    }
    if (params.get('auth_error')) {
      setError(decodeURIComponent(params.get('auth_error')));
      window.history.replaceState({}, '', '/');
    }
  }, []);

  const handleSync = async () => {
    setIsSyncing(true);
    setSyncResult(null);
    setError(null);
    try {
      const result = await api.sync.run();
      setSyncResult(result);
      setRefreshKey(k => k + 1);
      loadPeople();
    } catch (e) {
      setError(e.message);
    } finally {
      setIsSyncing(false);
    }
  };

  const handleSeed = async () => {
    setIsSeeding(true);
    setError(null);
    try {
      await api.seed.run();
      setSyncResult({ newEmails: 8, newEvents: 8, seeded: true });
      setRefreshKey(k => k + 1);
      loadPeople();
    } catch (e) {
      setError(e.message);
    } finally {
      setIsSeeding(false);
    }
  };

  const handleDisconnect = async () => {
    await api.auth.disconnect().catch(() => {});
    setIsConnected(false);
    setSyncResult(null);
  };

  const handleSelectEvent = (event) => {
    setSelectedEvent(prev => prev?.id === event?.id ? null : event);
  };

  return (
    <Layout
      isConnected={isConnected}
      isConfigured={isConfigured}
      isSyncing={isSyncing}
      isSeeding={isSeeding}
      people={people}
      selectedPerson={selectedPerson}
      onSelectPerson={(id) => { setSelectedPerson(id); setSelectedEvent(null); }}
      view={view}
      onViewChange={(v) => { setView(v); setSelectedEvent(null); }}
      selectedEvent={selectedEvent}
      onSelectEvent={handleSelectEvent}
      refreshKey={refreshKey}
      onSync={handleSync}
      onSeed={handleSeed}
      onConnect={() => api.auth.connect()}
      onDisconnect={handleDisconnect}
      syncResult={syncResult}
      error={error}
      onDismissError={() => setError(null)}
      onRefreshPeople={loadPeople}
    />
  );
}
