import { Link, useNavigate } from 'react-router-dom';
import { signOutUser } from '../firebase';

export default function Navbar({ user }) {
  const navigate = useNavigate();

  const handleSignOut = async () => {
    await signOutUser();
    navigate('/');
  };

  return (
    <nav
      className="fixed top-0 left-0 right-0 z-50 flex items-center justify-between px-6 py-4"
      style={{
        background: 'linear-gradient(180deg, rgba(5,5,16,0.9) 0%, transparent 100%)',
        backdropFilter: 'blur(8px)'
      }}
    >
      {/* Logo */}
      <Link to="/world" className="font-display font-black text-xl tracking-widest neon-cyan">
        AIOME
      </Link>

      {/* Nav links */}
      <div className="flex items-center gap-4">
        <Link
          to="/world"
          className="text-white/60 hover:text-white text-sm font-body transition-colors duration-200"
        >
          World
        </Link>
        <Link
          to="/profile"
          className="text-white/60 hover:text-white text-sm font-body transition-colors duration-200"
        >
          My Profile
        </Link>

        {/* User avatar & sign out */}
        <div className="flex items-center gap-2 ml-2">
          {user?.photoURL ? (
            <img
              src={user.photoURL}
              alt="avatar"
              className="w-7 h-7 rounded-full border border-cyan-primary/40"
            />
          ) : (
            <div
              className="w-7 h-7 rounded-full flex items-center justify-center text-xs font-bold"
              style={{ background: 'linear-gradient(135deg, #00f5ff, #7c3aed)' }}
            >
              {user?.displayName?.[0] || '?'}
            </div>
          )}
          <button
            onClick={handleSignOut}
            className="text-white/40 hover:text-white/80 text-xs font-body transition-colors duration-200"
          >
            Sign out
          </button>
        </div>
      </div>
    </nav>
  );
}
