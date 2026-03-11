import { useEffect, useState } from 'react';
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { onAuthStateChanged } from 'firebase/auth';
import { auth } from './firebase';
import Landing from './pages/Landing';
import Onboarding from './pages/Onboarding';
import World from './pages/World';
import Profile from './pages/Profile';
import Dashboard from './pages/Dashboard';
import AgentHouse from './pages/AgentHouse';
import { supabase } from './supabase';

function ProtectedRoute({ user, children }) {
  if (!user) return <Navigate to="/" replace />;
  return children;
}

export default function App() {
  const [user, setUser] = useState(null);
  const [authLoading, setAuthLoading] = useState(true);
  const [isOnboarded, setIsOnboarded] = useState(null);

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, async (firebaseUser) => {
      setUser(firebaseUser);

      if (firebaseUser) {
        // Check if user exists in Supabase
        const { data } = await supabase
          .from('users')
          .select('id, agent_name')
          .eq('id', firebaseUser.uid)
          .maybeSingle();

        setIsOnboarded(!!(data && data.agent_name));
      } else {
        setIsOnboarded(null);
      }

      setAuthLoading(false);
    });

    return () => unsubscribe();
  }, []);

  if (authLoading) {
    return (
      <div className="fixed inset-0 flex items-center justify-center" style={{ background: '#050510' }}>
        <div className="text-center">
          <div className="text-4xl font-display font-black neon-cyan mb-4 animate-pulse">AIOME</div>
          <div className="text-white/40 text-sm font-body">Connecting to the metaverse...</div>
        </div>
      </div>
    );
  }

  return (
    <BrowserRouter>
      <Routes>
        <Route
          path="/"
          element={
            user
              ? isOnboarded
                ? <Navigate to="/world" replace />
                : <Navigate to="/onboarding" replace />
              : <Landing />
          }
        />
        <Route
          path="/onboarding"
          element={
            <ProtectedRoute user={user}>
              <Onboarding user={user} onComplete={() => setIsOnboarded(true)} />
            </ProtectedRoute>
          }
        />
        <Route
          path="/world"
          element={
            <ProtectedRoute user={user}>
              <World user={user} />
            </ProtectedRoute>
          }
        />
        <Route
          path="/profile"
          element={
            <ProtectedRoute user={user}>
              <Profile user={user} />
            </ProtectedRoute>
          }
        />
        <Route path="/dashboard" element={<Dashboard />} />
        <Route path="/agents" element={<AgentHouse />} />
        <Route path="*" element={<Navigate to="/" replace />} />
      </Routes>
    </BrowserRouter>
  );
}
