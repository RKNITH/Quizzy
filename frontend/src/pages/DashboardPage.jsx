import { useEffect } from 'react';
import { Link } from 'react-router-dom';
import { useDispatch, useSelector } from 'react-redux';
import { motion } from 'framer-motion';
import { Plus, LogIn, Trophy, Brain, BookOpen, Users, Zap, TrendingUp } from 'lucide-react';
import { fetchQuizzes, seedQuizzes } from '../store/slices/quizSlice.js';
import { StatsCard, Card } from '../components/ui/index.jsx';
import { formatScore, getCategoryIcon, getRankTitle, getDifficultyColor } from '../utils/helpers.js';

const container = { hidden: {}, show: { transition: { staggerChildren: 0.08 } } };
const item = { hidden: { opacity: 0, y: 20 }, show: { opacity: 1, y: 0, transition: { duration: 0.4 } } };

const quickActions = [
  { to: '/rooms/create', icon: Plus, label: 'Create Room', desc: 'Host your own quiz battle', color: 'from-brand-600 to-brand-700', glow: 'hover:shadow-[0_0_30px_rgba(124,58,237,0.5)]' },
  { to: '/rooms/join', icon: LogIn, label: 'Join Room', desc: 'Enter a room code to play', color: 'from-accent-500 to-pink-600', glow: 'hover:shadow-[0_0_30px_rgba(236,72,153,0.5)]' },
  { to: '/quizzes/ai', icon: Brain, label: 'AI Quiz', desc: 'Generate quiz on any topic', color: 'from-indigo-500 to-violet-600', glow: 'hover:shadow-[0_0_30px_rgba(99,102,241,0.5)]' },
  { to: '/leaderboard', icon: Trophy, label: 'Leaderboard', desc: 'See global rankings', color: 'from-gold-500 to-amber-600', glow: 'hover:shadow-[0_0_30px_rgba(245,158,11,0.5)]' },
];

export default function DashboardPage() {
  const dispatch = useDispatch();
  const { user } = useSelector((s) => s.auth);
  const { list: quizzes, loading } = useSelector((s) => s.quiz);
  const rankInfo = getRankTitle(user?.rank);

  useEffect(() => {
    dispatch(fetchQuizzes({ limit: 6 }));
    dispatch(seedQuizzes()); // seed on first visit
  }, [dispatch]);

  const winRate = user?.gamesPlayed > 0
    ? Math.round((user.gamesWon / user.gamesPlayed) * 100)
    : 0;

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 py-8">
      {/* Header */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="mb-8"
      >
        <div className="flex items-center gap-4 mb-2">
          <span className="text-4xl animate-float">{user?.avatar || '🦊'}</span>
          <div>
            <h1 className="font-display font-800 text-2xl sm:text-3xl text-white">
              Welcome back, <span className="gradient-text">{user?.username}</span>!
            </h1>
            <div className="flex items-center gap-2 mt-1">
              <span className="text-lg">{rankInfo.icon}</span>
              <span className="text-sm font-medium" style={{ color: rankInfo.color }}>{user?.rank}</span>
              <span className="text-white/30">•</span>
              <span className="text-white/50 text-sm">{user?.gamesPlayed || 0} games played</span>
            </div>
          </div>
        </div>
      </motion.div>

      {/* Stats */}
      <motion.div
        variants={container}
        initial="hidden"
        animate="show"
        className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-8"
      >
        <motion.div variants={item}>
          <StatsCard icon="🏆" label="Total Score" value={formatScore(user?.totalScore)} color="gold" />
        </motion.div>
        <motion.div variants={item}>
          <StatsCard icon="🎮" label="Games Played" value={user?.gamesPlayed || 0} color="brand" />
        </motion.div>
        <motion.div variants={item}>
          <StatsCard icon="👑" label="Victories" value={user?.gamesWon || 0} color="success" />
        </motion.div>
        <motion.div variants={item}>
          <StatsCard icon="📈" label="Win Rate" value={`${winRate}%`} color="accent" />
        </motion.div>
      </motion.div>

      {/* Power-ups */}
      <motion.div
        initial={{ opacity: 0, y: 16 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.3 }}
        className="glass rounded-2xl border border-white/10 p-5 mb-8 flex flex-wrap gap-4"
      >
        <div className="flex items-center gap-2">
          <Zap size={14} className="text-white/40" />
          <span className="text-white/60 text-sm font-medium">Power-Ups Available:</span>
        </div>
        <div className="flex items-center gap-2 glass px-3 py-1.5 rounded-full border border-brand-500/20">
          <span>⏭️</span>
          <span className="text-sm font-display font-700 text-brand-300">Skip × {user?.powerUps?.skip ?? 3}</span>
        </div>
        <div className="flex items-center gap-2 glass px-3 py-1.5 rounded-full border border-gold-500/20">
          <span>✖️2</span>
          <span className="text-sm font-display font-700 text-gold-300">Double Score × {user?.powerUps?.doubleScore ?? 2}</span>
        </div>
        <span className="text-white/30 text-xs self-center ml-auto">Power-ups reset each game</span>
      </motion.div>

      {/* Quick Actions */}
      <motion.div
        variants={container}
        initial="hidden"
        animate="show"
        className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-10"
      >
        {quickActions.map((action) => (
          <motion.div key={action.to} variants={item}>
            <Link
              to={action.to}
              className={`block glass rounded-2xl border border-white/10 p-5 transition-all duration-300 ${action.glow} hover:-translate-y-1`}
            >
              <div className={`w-12 h-12 rounded-xl bg-gradient-to-br ${action.color} flex items-center justify-center mb-3 shadow-lg`}>
                <action.icon size={22} className="text-white" />
              </div>
              <div className="font-display font-700 text-white mb-1">{action.label}</div>
              <div className="text-white/50 text-xs">{action.desc}</div>
            </Link>
          </motion.div>
        ))}
      </motion.div>

      {/* Recent quizzes */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.4 }}
      >
        <div className="flex items-center justify-between mb-5">
          <h2 className="font-display font-700 text-xl text-white flex items-center gap-2">
            <BookOpen size={18} className="text-brand-400" />
            Featured Quizzes
          </h2>
          <Link to="/quizzes" className="text-brand-400 hover:text-brand-300 text-sm font-medium transition-colors flex items-center gap-1">
            View all <TrendingUp size={13} />
          </Link>
        </div>

        {loading ? (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
            {[...Array(6)].map((_, i) => (
              <div key={i} className="glass rounded-2xl border border-white/5 p-5 animate-pulse h-32" />
            ))}
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
            {quizzes.slice(0, 6).map((quiz, i) => (
              <motion.div
                key={quiz._id}
                initial={{ opacity: 0, y: 16 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.05 * i }}
              >
                <Link to="/rooms/create" state={{ quizId: quiz._id }} className="block glass rounded-2xl border border-white/8 p-5 card-hover group">
                  <div className="flex items-start gap-3 mb-3">
                    <span className="text-2xl">{getCategoryIcon(quiz.category)}</span>
                    <div className="flex-1 min-w-0">
                      <div className="font-display font-700 text-white text-sm leading-tight truncate group-hover:text-brand-300 transition-colors">
                        {quiz.title}
                      </div>
                      <div className="text-white/40 text-xs mt-0.5">{quiz.category}</div>
                    </div>
                  </div>
                  <div className="flex items-center gap-2">
                    <span className={`text-xs px-2 py-0.5 rounded-full font-medium ${getDifficultyColor(quiz.difficulty)}`}>
                      {quiz.difficulty}
                    </span>
                    <span className="text-white/30 text-xs">{quiz.questions?.length || 0} questions</span>
                    <span className="text-white/30 text-xs ml-auto">
                      {quiz.playCount > 0 ? `${quiz.playCount} plays` : 'New'}
                    </span>
                  </div>
                </Link>
              </motion.div>
            ))}
          </div>
        )}
      </motion.div>
    </div>
  );
}
