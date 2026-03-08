import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { supabase } from '../supabase';
import AgentCard from '../components/AgentCard';
import Navbar from '../components/Navbar';

export default function Profile({ user }) {
  const navigate = useNavigate();
  const [profile, setProfile] = useState(null);
  const [loading, setLoading] = useState(true);
  const [editing, setEditing] = useState(false);
  const [editBio, setEditBio] = useState('');
  const [saving, setSaving] = useState(false);
  const [copied, setCopied] = useState(false);
  const [saveSuccess, setSaveSuccess] = useState(false);

  useEffect(() => {
    if (!user?.uid) return;

    const fetchProfile = async () => {
      const { data, error } = await supabase
        .from('users')
        .select('*')
        .eq('id', user.uid)
        .maybeSingle();

      if (error) console.error(error);
      setProfile(data);
      setEditBio(data?.agent_bio || '');
      setLoading(false);
    };

    fetchProfile();
  }, [user?.uid]);

  const handleSaveBio = async () => {
    if (!editBio.trim()) return;
    setSaving(true);

    const { error } = await supabase
      .from('users')
      .update({ agent_bio: editBio.trim() })
      .eq('id', user.uid);

    if (!error) {
      setProfile((p) => ({ ...p, agent_bio: editBio.trim() }));
      setSaveSuccess(true);
      setTimeout(() => setSaveSuccess(false), 2000);
    }

    setSaving(false);
    setEditing(false);
  };

  const handleCopyLink = () => {
    const url = `${window.location.origin}/world?agent=${user?.uid}`;
    navigator.clipboard.writeText(url).then(() => {
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    });
  };

  if (loading) {
    return (
      <div className="fixed inset-0 flex items-center justify-center" style={{ background: '#050510' }}>
        <div className="orbit-pulse w-16 h-16 rounded-full" style={{ border: '2px solid rgba(0,245,255,0.3)' }} />
      </div>
    );
  }

  if (!profile) {
    return (
      <div className="fixed inset-0 flex items-center justify-center" style={{ background: '#050510' }}>
        <div className="text-center">
          <p className="text-white/50 font-body mb-4">No profile found.</p>
          <button onClick={() => navigate('/onboarding')} className="btn-primary rounded-xl px-6 py-3 text-sm">
            Create Agent →
          </button>
        </div>
      </div>
    );
  }

  const specialties = Array.isArray(profile.agent_specialties)
    ? profile.agent_specialties
    : [];

  return (
    <div className="min-h-screen" style={{ background: '#050510' }}>
      <Navbar user={user} />

      {/* Stars */}
      <div className="stars-bg">
        {Array.from({ length: 60 }).map((_, i) => (
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

      <div className="relative z-10 max-w-2xl mx-auto px-6 pt-28 pb-16">
        {/* Header */}
        <div className="text-center mb-8 fade-in-up">
          <p className="text-white/30 text-xs font-body uppercase tracking-widest mb-2">
            Your Agent Profile
          </p>
          <h1 className="font-display font-black text-3xl neon-cyan">
            {profile.agent_name}
          </h1>
          <p className="text-white/40 font-body text-sm mt-1">
            {profile.city} · {profile.email}
          </p>
        </div>

        {/* Main card */}
        <div className="fade-in-up delay-100 mb-6">
          <AgentCard agent={profile} />
        </div>

        {/* Specialties */}
        {specialties.length > 0 && (
          <div className="glass rounded-2xl p-5 mb-6 fade-in-up delay-200">
            <p className="text-white/30 text-xs font-body uppercase tracking-widest mb-3">Specialties</p>
            <div className="flex flex-wrap gap-2">
              {specialties.map((s, i) => (
                <span key={i} className="specialty-tag">
                  {typeof s === 'string' ? s.replace(/[{}"]/g, '') : s}
                </span>
              ))}
            </div>
          </div>
        )}

        {/* Stats */}
        <div className="grid grid-cols-2 gap-4 mb-6 fade-in-up delay-200">
          <div className="glass rounded-2xl p-5 text-center">
            <p className="text-3xl font-display font-bold neon-cyan">0</p>
            <p className="text-white/30 text-xs font-body mt-1">Visitors today</p>
          </div>
          <div className="glass rounded-2xl p-5 text-center">
            <p className="text-3xl font-display font-bold" style={{ color: '#f0abfc' }}>
              {Math.floor((Date.now() - new Date(profile.created_at || Date.now()).getTime()) / (1000 * 60 * 60 * 24))}
            </p>
            <p className="text-white/30 text-xs font-body mt-1">Days active</p>
          </div>
        </div>

        {/* System prompt preview */}
        {profile.agent_system_prompt && (
          <div className="glass rounded-2xl p-5 mb-6 fade-in-up delay-300">
            <p className="text-white/30 text-xs font-body uppercase tracking-widest mb-3">
              Agent System Prompt
            </p>
            <p className="text-white/50 font-body text-sm leading-relaxed italic">
              "{profile.agent_system_prompt}"
            </p>
          </div>
        )}

        {/* Edit bio */}
        <div className="glass rounded-2xl p-5 mb-6 fade-in-up delay-300">
          <div className="flex items-center justify-between mb-3">
            <p className="text-white/30 text-xs font-body uppercase tracking-widest">Agent Bio</p>
            {!editing && (
              <button
                onClick={() => setEditing(true)}
                className="text-xs btn-ghost rounded-lg px-3 py-1.5 font-body"
              >
                Edit
              </button>
            )}
          </div>

          {editing ? (
            <div>
              <textarea
                value={editBio}
                onChange={(e) => setEditBio(e.target.value)}
                rows={4}
                className="input-field w-full rounded-xl px-4 py-3 text-sm resize-none mb-3"
                placeholder="Describe your agent..."
              />
              <div className="flex gap-3">
                <button
                  onClick={() => { setEditing(false); setEditBio(profile.agent_bio || ''); }}
                  className="btn-ghost rounded-xl px-4 py-2.5 text-sm flex-shrink-0"
                >
                  Cancel
                </button>
                <button
                  onClick={handleSaveBio}
                  disabled={saving}
                  className="btn-primary flex-1 rounded-xl py-2.5 text-sm"
                >
                  {saving ? 'Saving...' : saveSuccess ? '✓ Saved!' : 'Save'}
                </button>
              </div>
            </div>
          ) : (
            <p className="text-white/60 font-body text-sm leading-relaxed">
              {profile.agent_bio || 'No bio yet. Click Edit to add one.'}
            </p>
          )}
        </div>

        {/* Actions */}
        <div className="flex gap-3 fade-in-up delay-400">
          <button
            onClick={handleCopyLink}
            className="btn-ghost flex-1 rounded-xl py-4 text-sm font-display"
          >
            {copied ? '✓ Copied!' : 'Share Agent Link'}
          </button>
          <button
            onClick={() => navigate('/world')}
            className="btn-primary flex-1 rounded-xl py-4 text-sm"
          >
            Go to World →
          </button>
        </div>

        {/* Coordinates */}
        <p className="text-white/15 text-xs font-body text-center mt-6">
          Position: {profile.lat?.toFixed(2)}°, {profile.lng?.toFixed(2)}° · ID: {profile.id?.slice(0, 8)}...
        </p>
      </div>
    </div>
  );
}
