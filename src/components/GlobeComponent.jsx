import { useEffect, useRef, useState } from 'react';

export default function GlobeComponent({
  agents = [],
  currentUserId = null,
  onAgentClick = null,
  interactive = true,
  autoRotate = true,
  size = null
}) {
  const globeRef = useRef(null);
  const mountRef = useRef(null);
  const [isLoaded, setIsLoaded] = useState(false);
  const [hovered, setHovered] = useState(null);

  useEffect(() => {
    if (!mountRef.current) return;

    let globe = null;
    let animFrame = null;

    const initGlobe = async () => {
      const GlobeGL = (await import('globe.gl')).default;

      const width = size || mountRef.current.offsetWidth || window.innerWidth;
      const height = size || mountRef.current.offsetHeight || window.innerHeight;

      globe = GlobeGL()(mountRef.current);

      globe
        .width(width)
        .height(height)
        .backgroundColor('rgba(0,0,0,0)')
        .showGlobe(true)
        .showAtmosphere(true)
        .atmosphereColor('#00f5ff')
        .atmosphereAltitude(0.12)
        // Globe texture — dark ocean
        .globeImageUrl(null)
        .globeMaterial(
          (() => {
            const THREE = window.THREE || null;
            return undefined; // Let globe.gl use default, we'll style via atmosphere
          })()
        );

      // Style the globe surface
      globe.onGlobeReady(() => {
        const scene = globe.scene();
        if (scene) {
          // Dark teal globe
          scene.traverse((obj) => {
            if (obj.isMesh && obj.geometry?.type === 'SphereGeometry') {
              if (obj.material) {
                obj.material.color?.setStyle('#0a0f2e');
                obj.material.emissive?.setStyle('#050510');
              }
            }
          });
        }

        setIsLoaded(true);
      });

      // Points data
      const buildPoints = (agentList) =>
        agentList.map((a) => ({
          lat: a.lat || 0,
          lng: a.lng || 0,
          agent: a,
          isCurrentUser: a.id === currentUserId,
          size: a.id === currentUserId ? 0.6 : 0.4,
          color: a.id === currentUserId ? '#00f5ff' : '#7c3aed'
        }));

      globe
        .pointsData(buildPoints(agents))
        .pointLat('lat')
        .pointLng('lng')
        .pointColor('color')
        .pointRadius('size')
        .pointAltitude(0.01)
        .pointResolution(12)
        .pointsMerge(false);

      if (interactive && onAgentClick) {
        globe.onPointClick((point) => {
          if (point?.agent) onAgentClick(point.agent);
        });

        globe.onPointHover((point) => {
          setHovered(point?.agent || null);
          mountRef.current.style.cursor = point ? 'pointer' : 'default';
        });
      }

      // Controls
      const controls = globe.controls();
      if (controls) {
        controls.autoRotate = autoRotate;
        controls.autoRotateSpeed = autoRotate ? 0.4 : 0;
        controls.enableZoom = interactive;
        controls.enablePan = false;
        controls.minDistance = 180;
        controls.maxDistance = 500;
        // Start zoomed in nicely
        globe.pointOfView({ lat: 20, lng: 0, altitude: 2.5 });
      }

      globeRef.current = globe;

      // Handle resize
      const handleResize = () => {
        if (!mountRef.current || !globe) return;
        globe.width(mountRef.current.offsetWidth);
        globe.height(mountRef.current.offsetHeight);
      };
      window.addEventListener('resize', handleResize);

      return () => {
        window.removeEventListener('resize', handleResize);
      };
    };

    initGlobe();

    return () => {
      if (animFrame) cancelAnimationFrame(animFrame);
      if (globeRef.current) {
        // Cleanup
        try {
          const container = mountRef.current;
          if (container) container.innerHTML = '';
        } catch {}
        globeRef.current = null;
      }
    };
  }, []); // Only init once

  // Update points when agents change
  useEffect(() => {
    if (!globeRef.current || !isLoaded) return;

    const buildPoints = (agentList) =>
      agentList.map((a) => ({
        lat: a.lat || 0,
        lng: a.lng || 0,
        agent: a,
        isCurrentUser: a.id === currentUserId,
        size: a.id === currentUserId ? 0.6 : 0.4,
        color: a.id === currentUserId ? '#00f5ff' : '#7c3aed'
      }));

    try {
      globeRef.current.pointsData(buildPoints(agents));
    } catch {}
  }, [agents, currentUserId, isLoaded]);

  return (
    <div className="relative w-full h-full">
      <div ref={mountRef} className="w-full h-full globe-container" />

      {/* Hover tooltip */}
      {hovered && (
        <div
          className="absolute bottom-8 left-1/2 -translate-x-1/2 glass rounded-xl px-4 py-3 text-center pointer-events-none"
          style={{ minWidth: '180px' }}
        >
          <p className="font-display text-sm neon-cyan">{hovered.agent_name}</p>
          <p className="text-white/50 text-xs font-body mt-0.5">{hovered.city}</p>
          <p className="text-white/30 text-xs font-body mt-0.5">Click to chat</p>
        </div>
      )}

      {/* Loading overlay */}
      {!isLoaded && (
        <div className="absolute inset-0 flex items-center justify-center">
          <div className="text-center">
            <div
              className="w-20 h-20 rounded-full orbit-pulse mx-auto mb-4"
              style={{
                background: 'radial-gradient(circle, rgba(0,245,255,0.2) 0%, rgba(124,58,237,0.1) 70%, transparent 100%)',
                border: '2px solid rgba(0,245,255,0.3)'
              }}
            />
            <p className="text-white/40 text-sm font-body">Loading globe...</p>
          </div>
        </div>
      )}
    </div>
  );
}
