export default function AgentCard({ agent, compact = false }) {
  if (!agent) return null;

  const personalityList =
    typeof agent.agent_personality === 'string'
      ? agent.agent_personality.split(',').map((s) => s.trim())
      : Array.isArray(agent.agent_personality)
      ? agent.agent_personality
      : [];

  const specialties = Array.isArray(agent.agent_specialties)
    ? agent.agent_specialties
    : typeof agent.agent_specialties === 'string'
    ? agent.agent_specialties.replace(/[{}]/g, '').split(',').map((s) => s.trim())
    : [];

  return (
    <div className={`glass rounded-2xl ${compact ? 'p-4' : 'p-6'} border-glow-cyan`}>
      {/* Header */}
      <div className="flex items-start gap-3 mb-4">
        {/* Avatar circle */}
        <div
          className="flex-shrink-0 rounded-full flex items-center justify-center font-display font-bold text-background"
          style={{
            width: compact ? 40 : 52,
            height: compact ? 40 : 52,
            background: 'linear-gradient(135deg, #00f5ff 0%, #7c3aed 100%)',
            boxShadow: '0 0 20px rgba(0, 245, 255, 0.4)'
          }}
        >
          {agent.agent_name?.[0] || '?'}
        </div>

        <div className="flex-1 min-w-0">
          <h3
            className="font-display font-bold neon-cyan truncate"
            style={{ fontSize: compact ? '0.9rem' : '1.1rem' }}
          >
            {agent.agent_name}
          </h3>
          <p className="text-white/50 text-xs font-body mt-0.5">
            {agent.city || 'Unknown location'}
          </p>
          {agent.display_name && (
            <p className="text-white/30 text-xs font-body">
              {agent.display_name}
            </p>
          )}
        </div>

        {/* Online indicator */}
        <div className="flex items-center gap-1.5 flex-shrink-0">
          <div
            className="w-2 h-2 rounded-full agent-dot"
            style={{ background: '#00f5ff' }}
          />
          <span className="text-xs text-white/40 font-body">online</span>
        </div>
      </div>

      {/* Personality tags */}
      {personalityList.length > 0 && (
        <div className="flex flex-wrap gap-1.5 mb-3">
          {personalityList.map((p, i) => (
            <span key={i} className="personality-tag">
              {p}
            </span>
          ))}
        </div>
      )}

      {/* Bio */}
      {agent.agent_bio && (
        <p
          className="text-white/60 font-body mb-4 leading-relaxed"
          style={{ fontSize: compact ? '0.8rem' : '0.85rem' }}
        >
          {agent.agent_bio}
        </p>
      )}

      {/* Specialties */}
      {specialties.length > 0 && !compact && (
        <div>
          <p className="text-white/30 text-xs font-body uppercase tracking-widest mb-2">
            Specialties
          </p>
          <div className="flex flex-wrap gap-2">
            {specialties.map((s, i) => (
              <span key={i} className="specialty-tag">
                {s}
              </span>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
