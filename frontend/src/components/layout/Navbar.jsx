import { useState } from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import { useDispatch, useSelector } from 'react-redux';
import { motion, AnimatePresence } from 'framer-motion';
import { Zap, Trophy, LayoutDashboard, LogOut, User, Menu, X, Brain, BookOpen, History } from 'lucide-react';
import { logout } from '../../store/slices/authSlice.js';
import { formatScore } from '../../utils/helpers.js';
import toast from 'react-hot-toast';

const navLinks = [
  { to: '/dashboard', icon: LayoutDashboard, label: 'Dashboard' },
  { to: '/quizzes', icon: BookOpen, label: 'Quizzes' },
  { to: '/quizzes/ai', icon: Brain, label: 'AI Quiz' },
  { to: '/history', icon: History, label: 'History' },
  { to: '/leaderboard', icon: Trophy, label: 'Leaderboard' },
];

export default function Navbar() {
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const location = useLocation();
  const { user } = useSelector((s) => s.auth);
  const [menuOpen, setMenuOpen] = useState(false);

  const handleLogout = () => {
    dispatch(logout());
    navigate('/');
    toast.success('Logged out successfully');
    setMenuOpen(false);
  };

  const isActive = (path) => location.pathname === path || location.pathname.startsWith(path + '/');

  return (
    <nav className="fixed top-0 left-0 right-0 z-50 glass-heavy border-b border-white/10">
      <div className="max-w-7xl mx-auto px-4 sm:px-6">
        <div className="flex items-center justify-between h-16">
          {/* Logo */}
          <Link to="/" className="flex items-center gap-2 group">
            <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-brand-500 to-accent-500 flex items-center justify-center shadow-lg group-hover:shadow-glow-brand transition-shadow">
              <Zap size={16} className="text-white" />
            </div>
            <span className="font-display font-800 text-lg gradient-text hidden sm:block">QuizBattle</span>
          </Link>

          {/* Desktop nav */}
          <div className="hidden md:flex items-center gap-1">
            {navLinks.map(({ to, icon: Icon, label }) => (
              <Link
                key={to}
                to={to}
                className={`flex items-center gap-2 px-3 py-2 rounded-lg text-sm font-medium transition-all ${isActive(to)
                  ? 'bg-brand-600/20 text-brand-300 border border-brand-500/30'
                  : 'text-white/60 hover:text-white hover:bg-white/5'
                  }`}
              >
                <Icon size={15} />
                {label}
              </Link>
            ))}
          </div>

          {/* User section */}
          <div className="flex items-center gap-3">
            {/* Score badge */}
            <div className="hidden sm:flex items-center gap-1.5 glass px-3 py-1.5 rounded-full border border-gold-500/20">
              <Trophy size={13} className="text-gold-400" />
              <span className="text-gold-400 font-display font-700 text-sm">{formatScore(user?.totalScore)}</span>
            </div>

            {/* Avatar */}
            <Link
              to="/profile"
              className="flex items-center gap-2 glass px-3 py-1.5 rounded-full border border-white/10 hover:border-brand-500/40 transition-all"
            >
              <span className="text-base">{user?.avatar || '🦊'}</span>
              <span className="hidden sm:block text-sm font-medium text-white/80 max-w-[100px] truncate">
                {user?.username}
              </span>
            </Link>

            {/* Logout desktop */}
            <button
              onClick={handleLogout}
              className="hidden md:flex items-center gap-2 btn-ghost px-3 py-2 rounded-lg text-sm"
            >
              <LogOut size={15} />
            </button>

            {/* Mobile menu toggle */}
            <button
              onClick={() => setMenuOpen(!menuOpen)}
              className="md:hidden btn-ghost p-2 rounded-lg"
            >
              {menuOpen ? <X size={20} /> : <Menu size={20} />}
            </button>
          </div>
        </div>
      </div>

      {/* Mobile menu */}
      <AnimatePresence>
        {menuOpen && (
          <motion.div
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: 'auto' }}
            exit={{ opacity: 0, height: 0 }}
            className="md:hidden overflow-hidden border-t border-white/10"
          >
            <div className="px-4 py-3 space-y-1 bg-surface-800/90 backdrop-blur-xl">
              {navLinks.map(({ to, icon: Icon, label }) => (
                <Link
                  key={to}
                  to={to}
                  onClick={() => setMenuOpen(false)}
                  className={`flex items-center gap-3 px-4 py-3 rounded-xl text-sm font-medium transition-all ${isActive(to)
                    ? 'bg-brand-600/20 text-brand-300'
                    : 'text-white/70 hover:text-white hover:bg-white/5'
                    }`}
                >
                  <Icon size={17} />
                  {label}
                </Link>
              ))}
              <button
                onClick={handleLogout}
                className="flex items-center gap-3 px-4 py-3 rounded-xl text-sm font-medium text-red-400 hover:bg-red-500/10 w-full transition-all"
              >
                <LogOut size={17} />
                Logout
              </button>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </nav>
  );
}