import { useEffect, useState, useCallback } from 'react';
import { supabase } from '../supabase';
import { SEED_AGENTS } from '../seedData';
import GlobeComponent from '../components/GlobeComponent';
import ChatPanel from '../components/ChatPanel';
import Navbar from '../components/Navbar';

export default function World({ user }) {
  const [allAgents, setAllAgents] = useState([]);
  const [selectedAgent, setSelectedAgent] = useState(null);
  const [loading, setLoading] = useState(true);

  const fetchAgents = useCallback(async () => {
    try {
      const { data, error } = await supabase
        .from('users')
        .select('*')
        .order('last_active', { ascending: false });

      if (error) throw error;

      const realAgents = (data || []).filter((u) => u.agent_name && u.lat && u.lng);

      // Merge real agents with seed data, prioritizing real ones
      const realIds = new Set(realAgents.map((a) => a.id));
      const seedFill = SEED_AGENTS.filter((s) => !realIds.has(s.id));

      // Always show all seed agents + real agents
      setAllAgents([...realAgents, ...seedFill]);
    } catch (err) {
      console.error('Failed to fetch agents:', err);
      // Fall back to seed data
      setAllAgents(SEED_AGENTS);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchAgents();

    // Update last_active for current user
    if (user?.uid) {
      supabase
        .from('users')
        .update({ last_active: new Date().toISOString() })
        .eq('id', user.uid)
        .then(() => {});
    }

    // Refresh every 30s
    const interval = setInterval(fetchAgents, 30000);
    return () => clearInterval(interval);
  }, [fetchAgents, user?.uid]);

  const handleAgentClick = useCallback((agent) => {
    setSelectedAgent(agent);
  }, []);

  const currentAgent = allAgents.find((a) => a.id === user?.uid);

  return (
    <div className="fixed inset-0" style={{ background: '#050510' }}>
      <Navbar user={user} />

      {/* Globe — full screen */}
      <div
        className="absolute inset-0"
        style={{ marginRight: selectedAgent ? '380px' : 0, transition: 'margin-right 0.35s ease' }}
      >
        {!loading && (
          <GlobeComponent
            agents={allAgents}
            currentUserId={user?.uid}
            onAgentClick={handleAgentClick}
            interactive={true}
            autoRotate={true}
          />
        )}

        {loading && (
          <div className="flex items-center justify-center h-full">
            <div className="text-center">
              <div
                className="w-24 h-24 rounded-full orbit-pulse mx-auto mb-6"
                style={{
                  background: 'radial-gradient(circle, rgba(0,245,255,0.2) 0%, transparent 100%)',
                  border: '2px solid rgba(0,245,255,0.3)'
                }}
              />
              <p className="font-display text-white/40 text-sm tracking-widest">
                Loading agents...
              </p>
            </div>
          </div>
        )}
      </div>

      {/* HUD — top left stats */}
      <div className="fixed top-20 left-6 z-30">
        <div className="glass rounded-2xl px-5 py-4 border-glow-cyan">
          <div className="flex items-center gap-2 mb-1">
            <div
              className="w-2 h-2 rounded-full agent-dot"
              style={{ background: '#00f5ff' }}
            />
            <span className="font-display text-xs neon-cyan tracking-widest">LIVE</span>
          </div>
          <p className="text-white/80 font-body text-2xl font-semibold">
            {allAgents.length.toLocaleString()}
          </p>
          <p className="text-white/30 text-xs font-body">agents on globe</p>
        </div>
      </div>

      {/* HUD — current user indicator */}
      {currentAgent && (
        <div className="fixed bottom-8 left-6 z-30">
          <button
            onClick={() => setSelectedAgent(currentAgent)}
            className="glass rounded-2xl px-4 py-3 flex items-center gap-3 hover:border-cyan-primary/40 transition-all duration-200"
            style={{ border: '1px solid rgba(0,245,255,0.2)' }}
          >
            <div
              className="w-8 h-8 rounded-full flex items-center justify-center text-background text-xs font-bold font-display"
              style={{
                background: 'linear-gradient(135deg, #00f5ff, #7c3aed)',
                boxShadow: '0 0 12px rgba(0,245,255,0.5)'
              }}
            >
              {currentAgent.agent_name?.[0] || '?'}
            </div>
            <div>
              <p className="font-display text-xs neon-cyan">{currentAgent.agent_name}</p>
              <p className="text-white/40 text-xs font-body">{currentAgent.city} · You</p>
            </div>
          </button>
        </div>
      )}

      {/* Instructions hint */}
      {!selectedAgent && (
        <div className="fixed bottom-8 left-1/2 -translate-x-1/2 z-30">
          <div
            className="glass rounded-full px-5 py-2.5 text-xs font-body text-white/30"
          >
            Click any dot to chat with an agent
          </div>
        </div>
      )}

      {/* Agent panel */}
      {selectedAgent && (
        <ChatPanel
          agent={selectedAgent}
          onClose={() => setSelectedAgent(null)}
        />
      )}
    </div>
  );
}
