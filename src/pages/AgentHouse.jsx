/**
 * AgentHouse — Nicholas's private command center.
 * All agents visible in one place. Live data from Supabase.
 * No auth required — private URL.
 *
 * Route: /agents
 */
import { useEffect, useState, useCallback } from 'react';
import { supabase } from '../supabase';

// ─── Agent definitions ────────────────────────────────────────────────────────

const AGENTS = [
  { id: 'jarvis',    emoji: '🐺', name: 'Jarvis',    role: 'CEO / Orchestrator',    color: '#00f5ff', desc: 'Din co-founder. Orkestrerer alt, tar beslutninger.' },
  { id: 'curios',    emoji: '🔍', name: 'Curios',    role: 'CTO',                   color: '#a855f7', desc: 'Overvåker alle agenter og rapporterer status.' },
  { id: 'sales',     emoji: '💰', name: 'Sales',     role: 'Cold Outreach',         color: '#22c55e', desc: 'Finner leads og sender pitch-eposter autonomt.' },
  { id: 'research',  emoji: '📚', name: 'Research',  role: 'Intelligence',          color: '#3b82f6', desc: 'Deep web research → strukturerte rapporter.' },
  { id: 'finance',   emoji: '📈', name: 'Finance',   role: 'Trading Signals',       color: '#f59e0b', desc: 'Live markedsdata → BUY/SELL signaler.' },
  { id: 'content',   emoji: '✍️', name: 'Content',   role: 'Social Media',          color: '#ec4899', desc: 'Skriver Twitter/LinkedIn/Reddit innhold.' },
  { id: 'dev',       emoji: '⚡', name: 'Dev',       role: 'Builder',               color: '#06b6d4', desc: 'Bygger og deployer nettsider og apper.' },
  { id: 'scout',     emoji: '🛰️', name: 'Scout',     role: 'Opportunity Scanner',   color: '#84cc16', desc: 'Scanner internett 24/7 for muligheter og APIer.' },
  { id: 'crypto',    emoji: '🪙', name: 'Crypto',    role: 'On-chain Analytics',    color: '#f97316', desc: 'DeFi, Phantom wallet, on-chain data.' },
  { id: 'email',     emoji: '📧', name: 'Email',     role: 'Inbox Manager',         color: '#8b5cf6', desc: 'Leser innboks, klassifiserer og svarer eposter.' },
  { id: 'bodo',      emoji: '🏔️', name: 'Bodø',      role: 'Local Market',          color: '#14b8a6', desc: 'Norsk markedsspesialist — Bodø leads og priser.' },
  { id: 'growth',    emoji: '🚀', name: 'Growth',    role: 'Passive Income',        color: '#f43f5e', desc: 'Gumroad, Product Hunt, passive inntektsstrømmer.' },
  { id: 'architect', emoji: '🏗️', name: 'Architect', role: 'Agent Designer',        color: '#64748b', desc: 'Designer nye agent-specs på bestilling.' },
];

// ─── Helpers ─────────────────────────────────────────────────────────────────

function timeAgo(ts) {
  if (!ts) return 'aldri';
  const diff = (Date.now() - new Date(ts)) / 1000;
  if (diff < 60) return `${Math.floor(diff)}s`;
  if (diff < 3600) return `${Math.floor(diff / 60)}m`;
  if (diff < 86400) return `${Math.floor(diff / 3600)}t`;
  return `${Math.floor(diff / 86400)}d`;
}

function statusIcon(type) {
  if (type === 'task') return { icon: '●', color: '#22c55e' };
  if (type === 'error') return { icon: '●', color: '#ef4444' };
  if (type === 'alert') return { icon: '●', color: '#f59e0b' };
  return { icon: '○', color: '#ffffff30' };
}

// ─── Components ───────────────────────────────────────────────────────────────

function AgentCard({ agent, lastEvent, recentEvents, isSelected, onSelect }) {
  const status = lastEvent ? statusIcon(lastEvent.event_type) : { icon: '○', color: '#ffffff20' };
  const isActive = lastEvent && (Date.now() - new Date(lastEvent.created_at)) < 3600000 * 2; // active in last 2h

  return (
    <div
      onClick={() => onSelect(agent.id)}
      style={{
        background: isSelected
          ? `linear-gradient(135deg, ${agent.color}18, ${agent.color}08)`
          : 'rgba(255,255,255,0.03)',
        border: `1px solid ${isSelected ? agent.color + '60' : 'rgba(255,255,255,0.08)'}`,
        borderRadius: 16,
        padding: '18px 16px',
        cursor: 'pointer',
        transition: 'all 0.2s',
        position: 'relative',
        overflow: 'hidden',
      }}
    >
      {/* Active pulse */}
      {isActive && (
        <div style={{
          position: 'absolute',
          top: 12,
          right: 12,
          width: 8,
          height: 8,
          borderRadius: '50%',
          background: status.color,
          boxShadow: `0 0 8px ${status.color}`,
          animation: 'pulse 2s infinite',
        }} />
      )}

      {/* Emoji + name */}
      <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 10 }}>
        <span style={{ fontSize: 24 }}>{agent.emoji}</span>
        <div>
          <div style={{ fontWeight: 700, color: agent.color, fontSize: 15 }}>{agent.name}</div>
          <div style={{ color: 'rgba(255,255,255,0.35)', fontSize: 11 }}>{agent.role}</div>
        </div>
      </div>

      {/* Last action */}
      <div style={{
        fontSize: 12,
        color: 'rgba(255,255,255,0.55)',
        lineHeight: 1.4,
        minHeight: 34,
      }}>
        {lastEvent
          ? lastEvent.title.slice(0, 70)
          : <span style={{ color: 'rgba(255,255,255,0.2)', fontStyle: 'italic' }}>Aldri kjørt</span>
        }
      </div>

      {/* Time */}
      {lastEvent && (
        <div style={{ marginTop: 8, color: 'rgba(255,255,255,0.2)', fontSize: 11 }}>
          {timeAgo(lastEvent.created_at)} siden
        </div>
      )}
    </div>
  );
}


function AgentDetail({ agent, events, onClose }) {
  if (!agent) return null;

  return (
    <div style={{
      position: 'fixed',
      bottom: 0,
      left: 0,
      right: 0,
      background: '#0a0a1a',
      border: `1px solid ${agent.color}40`,
      borderRadius: '20px 20px 0 0',
      padding: '20px',
      maxHeight: '60vh',
      overflowY: 'auto',
      zIndex: 100,
    }}>
      {/* Header */}
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 16 }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
          <span style={{ fontSize: 32 }}>{agent.emoji}</span>
          <div>
            <div style={{ fontWeight: 800, color: agent.color, fontSize: 18 }}>{agent.name}</div>
            <div style={{ color: 'rgba(255,255,255,0.4)', fontSize: 12 }}>{agent.desc}</div>
          </div>
        </div>
        <button
          onClick={onClose}
          style={{
            background: 'rgba(255,255,255,0.08)',
            border: 'none',
            color: '#fff',
            borderRadius: 8,
            padding: '6px 12px',
            cursor: 'pointer',
            fontSize: 14,
          }}
        >
          ✕
        </button>
      </div>

      {/* Activity log */}
      <div style={{ fontSize: 13, color: 'rgba(255,255,255,0.5)', marginBottom: 10 }}>
        Siste aktivitet
      </div>

      {events.length === 0 ? (
        <div style={{
          padding: '24px',
          textAlign: 'center',
          color: 'rgba(255,255,255,0.2)',
          fontSize: 13,
          fontStyle: 'italic',
        }}>
          Ingen aktivitet logget ennå for {agent.name}.
        </div>
      ) : (
        <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
          {events.map((e) => {
            const s = statusIcon(e.event_type);
            return (
              <div
                key={e.id}
                style={{
                  background: 'rgba(255,255,255,0.03)',
                  border: '1px solid rgba(255,255,255,0.07)',
                  borderRadius: 10,
                  padding: '10px 12px',
                }}
              >
                <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 4 }}>
                  <span style={{ color: s.color, fontSize: 10 }}>{s.icon}</span>
                  <span style={{ color: 'rgba(255,255,255,0.35)', fontSize: 11 }}>{e.event_type}</span>
                  <span style={{ marginLeft: 'auto', color: 'rgba(255,255,255,0.2)', fontSize: 11 }}>
                    {timeAgo(e.created_at)}
                  </span>
                </div>
                <div style={{ color: 'rgba(255,255,255,0.75)', fontSize: 13 }}>{e.title}</div>
                {e.details && (
                  <div style={{ color: 'rgba(255,255,255,0.35)', fontSize: 12, marginTop: 4 }}>
                    {e.details.slice(0, 120)}
                  </div>
                )}
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}


// ─── Main page ────────────────────────────────────────────────────────────────

export default function AgentHouse() {
  const [events, setEvents] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selectedAgent, setSelectedAgent] = useState(null);
  const [lastRefresh, setLastRefresh] = useState(new Date());
  const [totalToday, setTotalToday] = useState(0);

  const fetchData = useCallback(async () => {
    const today = new Date();
    today.setHours(0, 0, 0, 0);

    const { data } = await supabase
      .from('agent_events')
      .select('*')
      .order('created_at', { ascending: false })
      .limit(200);

    if (data) {
      setEvents(data);
      setTotalToday(data.filter(e => new Date(e.created_at) >= today).length);
    }
    setLoading(false);
    setLastRefresh(new Date());
  }, []);

  useEffect(() => {
    fetchData();
    const interval = setInterval(fetchData, 30000);
    return () => clearInterval(interval);
  }, [fetchData]);

  // Build per-agent data
  const agentData = AGENTS.map(agent => {
    const agentEvents = events.filter(e => e.agent_name === agent.id);
    return {
      agent,
      lastEvent: agentEvents[0] || null,
      recentEvents: agentEvents.slice(0, 10),
    };
  });

  const selectedData = agentData.find(d => d.agent.id === selectedAgent);
  const activeCount = agentData.filter(d => d.lastEvent).length;

  return (
    <div style={{ background: '#050510', minHeight: '100vh', color: '#fff', fontFamily: 'DM Sans, sans-serif' }}>
      <style>{`
        @keyframes pulse {
          0%, 100% { opacity: 1; transform: scale(1); }
          50% { opacity: 0.5; transform: scale(1.3); }
        }
      `}</style>

      {/* Header */}
      <div style={{
        position: 'sticky',
        top: 0,
        zIndex: 10,
        background: 'rgba(5,5,16,0.97)',
        borderBottom: '1px solid rgba(0,245,255,0.12)',
        padding: '14px 16px',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'space-between',
      }}>
        <div>
          <div style={{ fontWeight: 900, fontSize: 18, color: '#00f5ff', letterSpacing: 1 }}>
            AGENT HOUSE
          </div>
          <div style={{ color: 'rgba(255,255,255,0.3)', fontSize: 12 }}>
            {activeCount}/{AGENTS.length} agenter aktive · oppdatert {timeAgo(lastRefresh)} siden
          </div>
        </div>
        <div style={{ textAlign: 'right' }}>
          <div style={{ fontSize: 22, fontWeight: 900, color: '#22c55e' }}>{totalToday}</div>
          <div style={{ fontSize: 11, color: 'rgba(255,255,255,0.3)' }}>tasks i dag</div>
        </div>
      </div>

      {/* Stats bar */}
      <div style={{
        display: 'flex',
        gap: 12,
        padding: '12px 16px',
        overflowX: 'auto',
        borderBottom: '1px solid rgba(255,255,255,0.05)',
      }}>
        {[
          { label: 'Aktive', value: activeCount, color: '#22c55e' },
          { label: 'Idle', value: AGENTS.length - activeCount, color: '#ffffff40' },
          { label: 'Feil', value: events.filter(e => e.event_type === 'error').length, color: '#ef4444' },
          { label: 'Totalt', value: events.length, color: '#00f5ff' },
        ].map(stat => (
          <div key={stat.label} style={{
            background: 'rgba(255,255,255,0.04)',
            border: '1px solid rgba(255,255,255,0.08)',
            borderRadius: 10,
            padding: '8px 16px',
            minWidth: 70,
            textAlign: 'center',
            flexShrink: 0,
          }}>
            <div style={{ fontSize: 18, fontWeight: 800, color: stat.color }}>{stat.value}</div>
            <div style={{ fontSize: 11, color: 'rgba(255,255,255,0.3)' }}>{stat.label}</div>
          </div>
        ))}
      </div>

      {/* Agent grid */}
      {loading ? (
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', height: 200, color: 'rgba(255,255,255,0.2)' }}>
          Kobler til imperiet...
        </div>
      ) : (
        <div style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(2, 1fr)',
          gap: 10,
          padding: '12px 16px 100px',
        }}>
          {agentData.map(({ agent, lastEvent, recentEvents }) => (
            <AgentCard
              key={agent.id}
              agent={agent}
              lastEvent={lastEvent}
              recentEvents={recentEvents}
              isSelected={selectedAgent === agent.id}
              onSelect={setSelectedAgent}
            />
          ))}
        </div>
      )}

      {/* Live feed strip */}
      {events.length > 0 && (
        <div style={{
          position: 'fixed',
          bottom: selectedAgent ? 'calc(60vh + 10px)' : 0,
          left: 0,
          right: 0,
          background: 'rgba(5,5,16,0.95)',
          borderTop: '1px solid rgba(255,255,255,0.08)',
          padding: '8px 16px',
          display: 'flex',
          gap: 16,
          overflowX: 'auto',
          fontSize: 12,
          transition: 'bottom 0.3s',
        }}>
          <span style={{ color: 'rgba(255,255,255,0.2)', flexShrink: 0 }}>LIVE</span>
          {events.slice(0, 8).map(e => {
            const agent = AGENTS.find(a => a.id === e.agent_name);
            return (
              <span key={e.id} style={{ flexShrink: 0, color: agent?.color || '#fff' }}>
                [{e.agent_name}] {e.title.slice(0, 40)}
              </span>
            );
          })}
        </div>
      )}

      {/* Agent detail panel */}
      {selectedAgent && selectedData && (
        <AgentDetail
          agent={selectedData.agent}
          events={selectedData.recentEvents}
          onClose={() => setSelectedAgent(null)}
        />
      )}
    </div>
  );
}
