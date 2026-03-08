import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { supabase, cityToCoords } from '../supabase';
import AgentCard from '../components/AgentCard';

const STEPS = ['location', 'identity', 'generating', 'reveal'];

export default function Onboarding({ user, onComplete }) {
  const navigate = useNavigate();
  const [step, setStep] = useState(0);
  const [formData, setFormData] = useState({ city: '', name: '', job: '', bio: '' });
  const [agent, setAgent] = useState(null);
  const [error, setError] = useState('');

  const updateField = (field, value) => setFormData((p) => ({ ...p, [field]: value }));

  const handleLocationNext = () => {
    if (!formData.city.trim()) {
      setError('Please enter your city.');
      return;
    }
    setError('');
    setStep(1);
  };

  const handleIdentityNext = async () => {
    if (!formData.name.trim() || !formData.job.trim() || !formData.bio.trim()) {
      setError('Please fill in all fields.');
      return;
    }
    setError('');
    setStep(2); // generating
    await generateAgent();
  };

  const generateAgent = async () => {
    try {
      const response = await fetch('/api/generate-agent', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          name: formData.name,
          job: formData.job,
          bio: formData.bio,
          city: formData.city
        })
      });

      if (!response.ok) throw new Error('API error');
      const agentData = await response.json();

      // Get coordinates for city
      const [lat, lng] = cityToCoords(formData.city);

      // Save to Supabase
      const userRecord = {
        id: user.uid,
        display_name: formData.name,
        email: user.email,
        city: formData.city,
        lat,
        lng,
        agent_name: agentData.agent_name,
        agent_personality: Array.isArray(agentData.personality)
          ? agentData.personality.join(', ')
          : agentData.personality,
        agent_specialties: Array.isArray(agentData.specialties)
          ? agentData.specialties
          : [agentData.specialties],
        agent_bio: agentData.bio,
        agent_system_prompt: agentData.system_prompt,
        last_active: new Date().toISOString()
      };

      const { error: dbError } = await supabase.from('users').upsert(userRecord);
      if (dbError) console.error('Supabase error:', dbError);

      setAgent({ ...userRecord, ...agentData });
      setStep(3); // reveal
    } catch (err) {
      console.error('Generation failed:', err);
      // Fallback agent
      const [lat, lng] = cityToCoords(formData.city);
      const fallbackAgent = {
        id: user.uid,
        display_name: formData.name,
        email: user.email,
        city: formData.city,
        lat,
        lng,
        agent_name: `${formData.name.split(' ')[0].toUpperCase()}.AI`,
        agent_personality: 'analytical, creative, precise',
        agent_specialties: [formData.job, 'problem-solving', 'innovation'],
        agent_bio: `An advanced AI agent from ${formData.city}, specializing in ${formData.job}. Built for the future.`,
        agent_system_prompt: `You are ${formData.name.split(' ')[0].toUpperCase()}.AI from ${formData.city}. You specialize in ${formData.job} and help people with related challenges.`,
        last_active: new Date().toISOString()
      };

      await supabase.from('users').upsert(fallbackAgent);
      setAgent(fallbackAgent);
      setStep(3);
    }
  };

  const handleEnterWorld = () => {
    onComplete?.();
    navigate('/world');
  };

  return (
    <div
      className="min-h-screen flex items-center justify-center px-6"
      style={{ background: '#050510' }}
    >
      {/* Stars */}
      <div className="stars-bg">
        {Array.from({ length: 80 }).map((_, i) => (
          <div
            key={i}
            className="star"
            style={{
              top: `${Math.random() * 100}%`,
              left: `${Math.random() * 100}%`,
              width: `${Math.random() * 2 + 0.5}px`,
              height: `${Math.random() * 2 + 0.5}px`,
              animationDuration: `${Math.random() * 4 + 2}s`,
              animationDelay: `${Math.random() * 4}s`
            }}
          />
        ))}
      </div>

      <div className="relative z-10 w-full max-w-lg">
        {/* Logo */}
        <div className="text-center mb-8">
          <p className="font-display font-black text-2xl neon-cyan tracking-widest">AIOME</p>
        </div>

        {/* Step: Location */}
        {step === 0 && (
          <div className="glass rounded-3xl p-8 border-glow-cyan fade-in-up">
            <div className="flex items-center gap-3 mb-6">
              <span className="text-3xl">🌍</span>
              <div>
                <p className="text-white/40 text-xs font-body uppercase tracking-widest">Step 1 of 2</p>
                <h2 className="font-display font-bold text-white text-xl">Where are you from?</h2>
              </div>
            </div>

            <p className="text-white/50 font-body text-sm mb-6">
              Your agent will appear at your real-world location on the global map.
            </p>

            <input
              type="text"
              placeholder="Enter your city (e.g. Oslo, Tokyo, Lagos)"
              value={formData.city}
              onChange={(e) => updateField('city', e.target.value)}
              onKeyDown={(e) => e.key === 'Enter' && handleLocationNext()}
              className="input-field w-full rounded-xl px-5 py-4 text-base mb-2"
              autoFocus
            />

            {error && <p className="text-red-400 text-sm font-body mb-4">{error}</p>}

            <button
              onClick={handleLocationNext}
              className="btn-primary w-full rounded-xl py-4 mt-4 text-sm"
            >
              Continue →
            </button>
          </div>
        )}

        {/* Step: Identity */}
        {step === 1 && (
          <div className="glass rounded-3xl p-8 border-glow-cyan fade-in-up">
            <div className="flex items-center gap-3 mb-6">
              <span className="text-3xl">🤖</span>
              <div>
                <p className="text-white/40 text-xs font-body uppercase tracking-widest">Step 2 of 2</p>
                <h2 className="font-display font-bold text-white text-xl">Who are you?</h2>
              </div>
            </div>

            <p className="text-white/50 font-body text-sm mb-6">
              Claude AI will use this to generate your unique agent personality.
            </p>

            <div className="space-y-4">
              <div>
                <label className="text-white/40 text-xs font-body uppercase tracking-widest block mb-2">
                  Your name
                </label>
                <input
                  type="text"
                  placeholder="Nicholas Elvegård"
                  value={formData.name}
                  onChange={(e) => updateField('name', e.target.value)}
                  className="input-field w-full rounded-xl px-5 py-3.5 text-sm"
                />
              </div>

              <div>
                <label className="text-white/40 text-xs font-body uppercase tracking-widest block mb-2">
                  What do you do?
                </label>
                <input
                  type="text"
                  placeholder="AI developer, designer, trader..."
                  value={formData.job}
                  onChange={(e) => updateField('job', e.target.value)}
                  className="input-field w-full rounded-xl px-5 py-3.5 text-sm"
                />
              </div>

              <div>
                <label className="text-white/40 text-xs font-body uppercase tracking-widest block mb-2">
                  One sentence about yourself
                </label>
                <textarea
                  placeholder="I build AI systems that make money while I sleep."
                  value={formData.bio}
                  onChange={(e) => updateField('bio', e.target.value)}
                  rows={3}
                  className="input-field w-full rounded-xl px-5 py-3.5 text-sm resize-none"
                />
              </div>
            </div>

            {error && <p className="text-red-400 text-sm font-body mt-3">{error}</p>}

            <div className="flex gap-3 mt-6">
              <button
                onClick={() => setStep(0)}
                className="btn-ghost rounded-xl px-6 py-4 text-sm flex-shrink-0"
              >
                ← Back
              </button>
              <button
                onClick={handleIdentityNext}
                className="btn-primary flex-1 rounded-xl py-4 text-sm"
              >
                Generate my agent →
              </button>
            </div>
          </div>
        )}

        {/* Step: Generating */}
        {step === 2 && (
          <div className="text-center fade-in-up">
            {/* Animated globe */}
            <div className="relative mx-auto mb-8" style={{ width: 120, height: 120 }}>
              <div
                className="absolute inset-0 rounded-full orbit-pulse"
                style={{
                  background: 'radial-gradient(circle, rgba(0,245,255,0.15) 0%, rgba(124,58,237,0.1) 50%, transparent 100%)',
                  border: '2px solid rgba(0,245,255,0.3)'
                }}
              />
              <div
                className="absolute inset-4 rounded-full orbit-pulse"
                style={{
                  background: 'radial-gradient(circle, rgba(0,245,255,0.25) 0%, transparent 100%)',
                  border: '1px solid rgba(0,245,255,0.5)',
                  animationDelay: '0.5s'
                }}
              />
              <div
                className="absolute inset-8 rounded-full orbit-pulse"
                style={{
                  background: 'rgba(0,245,255,0.3)',
                  animationDelay: '1s'
                }}
              />
            </div>

            <h2 className="font-display font-bold text-xl text-white mb-3">
              Generating your agent...
            </h2>
            <p className="text-white/40 font-body text-sm mb-2">
              Claude AI is crafting your unique personality
            </p>
            <p className="text-white/25 font-body text-xs">
              City: {formData.city} · Identity: {formData.name}
            </p>

            {/* Progress dots */}
            <div className="flex justify-center gap-2 mt-6">
              {['Analyzing identity', 'Crafting personality', 'Building agent'].map((label, i) => (
                <div key={i} className="flex items-center gap-1.5">
                  <div
                    className="w-1.5 h-1.5 rounded-full animate-bounce"
                    style={{
                      background: '#00f5ff',
                      animationDelay: `${i * 200}ms`
                    }}
                  />
                  <span className="text-white/30 text-xs font-body hidden sm:block">{label}</span>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Step: Reveal */}
        {step === 3 && agent && (
          <div className="fade-in-up">
            <div className="text-center mb-6">
              <h2 className="font-display font-bold text-2xl text-white mb-2">
                Your agent is{' '}
                <span className="neon-cyan">live</span>!
              </h2>
              <p className="text-white/50 font-body text-sm">
                {agent.agent_name} is now online in {formData.city}
              </p>
            </div>

            <AgentCard agent={agent} />

            {/* Specialties */}
            {(agent.agent_specialties || agent.specialties) && (
              <div className="mt-4 glass rounded-2xl p-4">
                <p className="text-white/30 text-xs font-body uppercase tracking-widest mb-3">
                  Specialties
                </p>
                <div className="flex flex-wrap gap-2">
                  {(agent.agent_specialties || agent.specialties || []).map((s, i) => (
                    <span key={i} className="specialty-tag">
                      {typeof s === 'string' ? s.replace(/[{}"]/g, '') : s}
                    </span>
                  ))}
                </div>
              </div>
            )}

            <button
              onClick={handleEnterWorld}
              className="btn-primary w-full rounded-xl py-4 mt-6 text-base"
            >
              Enter the World →
            </button>
          </div>
        )}

        {/* Step indicator */}
        {step < 2 && (
          <div className="flex justify-center gap-2 mt-6">
            {[0, 1].map((i) => (
              <div
                key={i}
                className="rounded-full transition-all duration-300"
                style={{
                  width: step === i ? 24 : 8,
                  height: 8,
                  background: step === i ? '#00f5ff' : 'rgba(255,255,255,0.15)'
                }}
              />
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
