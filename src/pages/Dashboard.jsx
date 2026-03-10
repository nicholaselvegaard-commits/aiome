/**
 * Jordan Dashboard — Nicholas's live feed of what Jordan is doing.
 * No auth needed. Accessible at /dashboard.
 * Mobile-friendly. Auto-refreshes every 30s.
 */
import { useEffect, useState } from 'react';
import { supabase } from '../supabase';

const CATEGORY_COLORS = {
  idea: '#00f5ff',
  plan: '#7c3aed',
  observation: '#f59e0b',
  reminder: '#ef4444',
  money: '#22c55e',
  account: '#f97316',
  other: '#ffffff44',
};

const AGENT_COLORS = {
  jordan: '#00f5ff',
  manus: '#7c3aed',
  system: '#ffffff44',
};

function timeAgo(ts) {
  const diff = (Date.now() - new Date(ts)) / 1000;
  if (diff < 60) return `${Math.floor(diff)}s ago`;
  if (diff < 3600) return `${Math.floor(diff / 60)}m ago`;
  if (diff < 86400) return `${Math.floor(diff / 3600)}h ago`;
  return `${Math.floor(diff / 86400)}d ago`;
}

export default function Dashboard() {
  const [notes, setNotes] = useState([]);
  const [events, setEvents] = useState([]);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState('notes');
  const [lastRefresh, setLastRefresh] = useState(new Date());

  const fetchData = async () => {
    const [notesRes, eventsRes] = await Promise.all([
      supabase.from('agent_notes').select('*').order('created_at', { ascending: false }).limit(50),
      supabase.from('agent_events').select('*').order('created_at', { ascending: false }).limit(100),
    ]);
    if (notesRes.data) setNotes(notesRes.data);
    if (eventsRes.data) setEvents(eventsRes.data);
    setLoading(false);
    setLastRefresh(new Date());
  };

  useEffect(() => {
    fetchData();
    const interval = setInterval(fetchData, 30000);
    return () => clearInterval(interval);
  }, []);

  return (
    <div
      className="min-h-screen font-body"
      style={{ background: '#050510', color: '#fff' }}
    >
      {/* Header */}
      <div
        className="sticky top-0 z-10 px-4 py-3 flex items-center justify-between"
        style={{ background: 'rgba(5,5,16,0.95)', borderBottom: '1px solid rgba(0,245,255,0.15)' }}
      >
        <div>
          <div className="font-display font-black text-lg" style={{ color: '#00f5ff' }}>
            JORDAN LIVE
          </div>
          <div className="text-xs" style={{ color: 'rgba(255,255,255,0.3)' }}>
            Updated {timeAgo(lastRefresh)}
          </div>
        </div>
        <button
          onClick={fetchData}
          className="px-3 py-1 rounded-lg text-xs font-bold"
          style={{ background: 'rgba(0,245,255,0.1)', border: '1px solid rgba(0,245,255,0.3)', color: '#00f5ff' }}
        >
          REFRESH
        </button>
      </div>

      {/* Tabs */}
      <div className="flex px-4 pt-4 gap-2">
        {['notes', 'activity'].map((tab) => (
          <button
            key={tab}
            onClick={() => setActiveTab(tab)}
            className="px-4 py-2 rounded-lg text-sm font-bold capitalize"
            style={{
              background: activeTab === tab ? 'rgba(0,245,255,0.15)' : 'rgba(255,255,255,0.05)',
              border: `1px solid ${activeTab === tab ? 'rgba(0,245,255,0.4)' : 'rgba(255,255,255,0.1)'}`,
              color: activeTab === tab ? '#00f5ff' : 'rgba(255,255,255,0.5)',
            }}
          >
            {tab} {tab === 'notes' ? `(${notes.length})` : `(${events.length})`}
          </button>
        ))}
      </div>

      {loading ? (
        <div className="flex items-center justify-center py-20 text-white/30">
          Loading Jordan's brain...
        </div>
      ) : (
        <div className="px-4 py-4 space-y-3 pb-20">
          {activeTab === 'notes' && (
            notes.length === 0 ? (
              <div className="text-center py-16 text-white/20">
                <div className="text-4xl mb-3">📓</div>
                <div>No notes yet. Jordan is thinking...</div>
              </div>
            ) : (
              notes.map((note) => (
                <div
                  key={note.id}
                  className="rounded-xl p-4"
                  style={{
                    background: 'rgba(255,255,255,0.04)',
                    border: `1px solid ${CATEGORY_COLORS[note.category] || '#ffffff22'}33`,
                  }}
                >
                  <div className="flex items-center gap-2 mb-2">
                    <span
                      className="text-xs px-2 py-0.5 rounded-full font-bold uppercase"
                      style={{
                        background: `${CATEGORY_COLORS[note.category] || '#ffffff22'}22`,
                        color: CATEGORY_COLORS[note.category] || '#fff',
                      }}
                    >
                      {note.category}
                    </span>
                    <span
                      className="text-xs px-2 py-0.5 rounded-full"
                      style={{
                        background: `${AGENT_COLORS[note.agent_name] || '#ffffff22'}22`,
                        color: AGENT_COLORS[note.agent_name] || '#fff',
                      }}
                    >
                      {note.agent_name}
                    </span>
                    <span className="ml-auto text-xs" style={{ color: 'rgba(255,255,255,0.25)' }}>
                      {timeAgo(note.created_at)}
                    </span>
                  </div>
                  <div className="font-bold text-sm mb-1" style={{ color: '#fff' }}>
                    {note.title}
                  </div>
                  <div className="text-sm leading-relaxed" style={{ color: 'rgba(255,255,255,0.6)' }}>
                    {note.content}
                  </div>
                </div>
              ))
            )
          )}

          {activeTab === 'activity' && (
            events.length === 0 ? (
              <div className="text-center py-16 text-white/20">
                <div className="text-4xl mb-3">⚡</div>
                <div>No activity yet. Jordan is starting up...</div>
              </div>
            ) : (
              events.map((event) => (
                <div
                  key={event.id}
                  className="flex gap-3 items-start rounded-xl p-3"
                  style={{ background: 'rgba(255,255,255,0.03)', border: '1px solid rgba(255,255,255,0.06)' }}
                >
                  <div
                    className="w-2 h-2 rounded-full mt-1.5 flex-shrink-0"
                    style={{ background: AGENT_COLORS[event.agent_name] || '#fff' }}
                  />
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2">
                      <span className="text-xs font-bold" style={{ color: AGENT_COLORS[event.agent_name] || '#fff' }}>
                        {event.agent_name}
                      </span>
                      <span className="text-xs" style={{ color: 'rgba(255,255,255,0.3)' }}>
                        {event.event_type}
                      </span>
                      <span className="ml-auto text-xs flex-shrink-0" style={{ color: 'rgba(255,255,255,0.2)' }}>
                        {timeAgo(event.created_at)}
                      </span>
                    </div>
                    <div className="text-sm mt-0.5" style={{ color: 'rgba(255,255,255,0.7)' }}>
                      {event.title}
                    </div>
                    {event.details && (
                      <div className="text-xs mt-1" style={{ color: 'rgba(255,255,255,0.35)' }}>
                        {event.details}
                      </div>
                    )}
                  </div>
                </div>
              ))
            )
          )}
        </div>
      )}
    </div>
  );
}
