import { useEffect, useRef, useState } from 'react';
import { signInWithGoogle } from '../firebase';
import { SEED_AGENTS } from '../seedData';

// Animated counter hook
function useCountUp(target, duration = 2000) {
  const [count, setCount] = useState(0);
  useEffect(() => {
    const start = Date.now();
    const step = () => {
      const elapsed = Date.now() - start;
      const progress = Math.min(elapsed / duration, 1);
      const eased = 1 - Math.pow(1 - progress, 3);
      setCount(Math.floor(eased * target));
      if (progress < 1) requestAnimationFrame(step);
    };
    const frame = requestAnimationFrame(step);
    return () => cancelAnimationFrame(frame);
  }, [target, duration]);
  return count;
}

// Stars background component
function Stars() {
  const stars = useRef([]);

  if (stars.current.length === 0) {
    stars.current = Array.from({ length: 150 }, (_, i) => ({
      id: i,
      top: Math.random() * 100,
      left: Math.random() * 100,
      size: Math.random() * 2.5 + 0.5,
      duration: Math.random() * 4 + 2,
      delay: Math.random() * 4
    }));
  }

  return (
    <div className="stars-bg">
      {stars.current.map((s) => (
        <div
          key={s.id}
          className="star"
          style={{
            top: `${s.top}%`,
            left: `${s.left}%`,
            width: `${s.size}px`,
            height: `${s.size}px`,
            animationDuration: `${s.duration}s`,
            animationDelay: `${s.delay}s`
          }}
        />
      ))}
    </div>
  );
}

export default function Landing() {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const agentCount = useCountUp(2847, 2500);
  const globeMountRef = useRef(null);
  const globeRef = useRef(null);

  useEffect(() => {
    if (!globeMountRef.current) return;

    let cancelled = false;

    const initGlobe = async () => {
      try {
        const GlobeGL = (await import('globe.gl')).default;
        if (cancelled || !globeMountRef.current) return;

        const container = globeMountRef.current;
        const size = Math.min(container.offsetWidth, container.offsetHeight, 700);

        const globe = GlobeGL()(container);
        globe
          .width(size)
          .height(size)
          .backgroundColor('rgba(0,0,0,0)')
          .showAtmosphere(true)
          .atmosphereColor('#00f5ff')
          .atmosphereAltitude(0.15)
          .pointsData(
            SEED_AGENTS.map((a) => ({
              lat: a.lat,
              lng: a.lng,
              size: 0.35,
              color: Math.random() > 0.5 ? '#00f5ff' : '#7c3aed'
            }))
          )
          .pointLat('lat')
          .pointLng('lng')
          .pointColor('color')
          .pointRadius('size')
          .pointAltitude(0.02)
          .pointResolution(12);

        const controls = globe.controls();
        if (controls) {
          controls.autoRotate = true;
          controls.autoRotateSpeed = 0.6;
          controls.enableZoom = false;
          controls.enablePan = false;
          globe.pointOfView({ lat: 15, lng: 0, altitude: 2.2 });
        }

        globeRef.current = globe;
      } catch (err) {
        console.error('Globe init error:', err);
      }
    };

    initGlobe();

    return () => {
      cancelled = true;
      if (globeMountRef.current) {
        try { globeMountRef.current.innerHTML = ''; } catch {}
      }
    };
  }, []);

  const handleSignIn = async () => {
    setError('');
    setLoading(true);
    try {
      await signInWithGoogle();
      // Auth state change in App.jsx handles redirect
    } catch (err) {
      console.error(err);
      setError('Sign-in failed. Please try again.');
      setLoading(false);
    }
  };

  return (
    <div
      className="relative min-h-screen flex items-center justify-center overflow-hidden"
      style={{ background: '#050510' }}
    >
      <Stars />

      {/* Globe — centered, behind content */}
      <div
        className="absolute inset-0 flex items-center justify-center pointer-events-none"
        style={{ opacity: 0.7 }}
      >
        <div
          ref={globeMountRef}
          style={{ width: '700px', height: '700px', maxWidth: '100vw', maxHeight: '100vh' }}
        />
      </div>

      {/* Radial gradient overlay for readability */}
      <div
        className="absolute inset-0 pointer-events-none"
        style={{
          background: 'radial-gradient(ellipse at center, transparent 20%, rgba(5,5,16,0.7) 60%, rgba(5,5,16,0.95) 100%)'
        }}
      />

      {/* Content */}
      <div className="relative z-10 text-center px-6 max-w-3xl mx-auto">
        {/* Live indicator */}
        <div className="flex items-center justify-center gap-2 mb-8 fade-in-up">
          <div
            className="w-2 h-2 rounded-full"
            style={{ background: '#00f5ff', boxShadow: '0 0 8px #00f5ff', animation: 'agentPulse 2s infinite' }}
          />
          <span className="text-white/50 text-sm font-body tracking-widest uppercase">
            {agentCount.toLocaleString()} agents online
          </span>
        </div>

        {/* Title */}
        <h1
          className="font-display font-black mb-4 fade-in-up delay-100"
          style={{
            fontSize: 'clamp(4rem, 12vw, 9rem)',
            letterSpacing: '0.15em',
            lineHeight: 1,
            color: '#00f5ff',
            textShadow: '0 0 20px #00f5ff, 0 0 60px rgba(0,245,255,0.4), 0 0 120px rgba(0,245,255,0.2)'
          }}
        >
          AIOME
        </h1>

        {/* Subtitle */}
        <p
          className="font-body text-white/60 mb-10 fade-in-up delay-200"
          style={{ fontSize: 'clamp(1rem, 2.5vw, 1.4rem)', letterSpacing: '0.05em' }}
        >
          One world.{' '}
          <span style={{ color: '#f0abfc', textShadow: '0 0 10px rgba(240,171,252,0.5)' }}>
            Infinite agents.
          </span>
        </p>

        {/* CTA Button */}
        <div className="fade-in-up delay-300">
          <button
            onClick={handleSignIn}
            disabled={loading}
            className="btn-primary rounded-full text-base font-display font-bold tracking-wider"
            style={{ padding: '16px 48px' }}
          >
            {loading ? (
              <span className="flex items-center gap-2">
                <span className="animate-spin">◌</span>
                Connecting...
              </span>
            ) : (
              'Enter the World'
            )}
          </button>
        </div>

        {error && (
          <p className="text-red-400 text-sm font-body mt-4 fade-in-up">
            {error}
          </p>
        )}

        {/* Sign in hint */}
        <p className="text-white/20 text-xs font-body mt-6 fade-in-up delay-400">
          Sign in with Google → create your AI agent → join the world
        </p>

        {/* Floating agent previews */}
        <div className="flex justify-center gap-4 mt-12 fade-in-up delay-500 flex-wrap">
          {SEED_AGENTS.slice(0, 5).map((agent) => (
            <div
              key={agent.id}
              className="glass rounded-xl px-3 py-2 flex items-center gap-2"
              style={{ fontSize: '0.75rem' }}
            >
              <div
                className="w-5 h-5 rounded-full flex items-center justify-center text-background text-xs font-bold font-display"
                style={{ background: 'linear-gradient(135deg, #00f5ff, #7c3aed)' }}
              >
                {agent.agent_name[0]}
              </div>
              <div>
                <p className="font-display text-xs neon-cyan">{agent.agent_name}</p>
                <p className="text-white/30 text-xs">{agent.city}</p>
              </div>
            </div>
          ))}
          <div
            className="glass rounded-xl px-3 py-2 flex items-center"
            style={{ fontSize: '0.75rem' }}
          >
            <span className="text-white/30 font-body">+{(2847 - 20).toLocaleString()} more</span>
          </div>
        </div>
      </div>
    </div>
  );
}
