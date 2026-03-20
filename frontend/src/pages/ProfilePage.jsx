import { useSelector } from 'react-redux';
import { motion } from 'framer-motion';
import { Trophy, Target, Gamepad2, Award, Star } from 'lucide-react';
import { formatScore, getRankTitle } from '../utils/helpers.js';
import { StatsCard } from '../components/ui/index.jsx';

const AVATARS = ['🦊', '🐺', '🦁', '🐯', '🦄', '🐉', '🦅', '🐬', '🦋', '🔥', '⚡', '🌟', '🎯', '🧠', '🤖', '👾'];

export default function ProfilePage() {
  const { user } = useSelector((s) => s.auth);
  const rankInfo = getRankTitle(user?.rank);
  const winRate = user?.gamesPlayed > 0 ? Math.round((user.gamesWon / user.gamesPlayed) * 100) : 0;

  return (
    <div className="max-w-2xl mx-auto px-4 sm:px-6 py-8">
      <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}>
        {/* Profile hero */}
        <div className="glass rounded-2xl border border-white/10 p-8 mb-6 text-center relative overflow-hidden">
          <div className="absolute inset-0 bg-gradient-to-br from-brand-600/10 to-accent-500/5 pointer-events-none" />
          <div className="relative">
            <div className="text-7xl mb-4 animate-float">{user?.avatar || '🦊'}</div>
            <h1 className="font-display font-800 text-3xl text-white mb-1">{user?.username}</h1>
            <p className="text-white/50 text-sm mb-3">{user?.email}</p>
            <div
              className="inline-flex items-center gap-2 glass px-4 py-2 rounded-full border"
              style={{ borderColor: `${rankInfo.color}40` }}
            >
              <span className="text-lg">{rankInfo.icon}</span>
              <span className="font-display font-700" style={{ color: rankInfo.color }}>{user?.rank}</span>
            </div>
          </div>
        </div>

        {/* Stats grid */}
        <div className="grid grid-cols-2 gap-4 mb-6">
          <StatsCard icon="🏆" label="Total Score" value={formatScore(user?.totalScore)} color="gold" />
          <StatsCard icon="🎮" label="Games Played" value={user?.gamesPlayed || 0} color="brand" />
          <StatsCard icon="👑" label="Victories" value={user?.gamesWon || 0} color="success" />
          <StatsCard icon="📈" label="Win Rate" value={`${winRate}%`} color="accent" />
        </div>

        {/* Power-ups */}
        <div className="glass rounded-2xl border border-white/10 p-6 mb-6">
          <h2 className="font-display font-700 text-lg text-white mb-4 flex items-center gap-2">
            <Star size={16} className="text-gold-400" />
            Power-Ups
          </h2>
          <div className="grid grid-cols-2 gap-4">
            <div className="glass rounded-xl border border-brand-500/20 p-4 text-center">
              <div className="text-3xl mb-2">⏭️</div>
              <div className="font-display font-700 text-2xl text-brand-300">{user?.powerUps?.skip ?? 3}</div>
              <div className="text-white/50 text-sm">Skip remaining</div>
            </div>
            <div className="glass rounded-xl border border-gold-500/20 p-4 text-center">
              <div className="text-3xl mb-2">✖️2️</div>
              <div className="font-display font-700 text-2xl text-gold-300">{user?.powerUps?.doubleScore ?? 2}</div>
              <div className="text-white/50 text-sm">Double Score remaining</div>
            </div>
          </div>
          <p className="text-white/30 text-xs text-center mt-3">Power-ups are per game session</p>
        </div>

        {/* Avatar selector */}
        <div className="glass rounded-2xl border border-white/10 p-6">
          <h2 className="font-display font-700 text-lg text-white mb-4 flex items-center gap-2">
            <Award size={16} className="text-brand-400" />
            Your Avatar
          </h2>
          <div className="grid grid-cols-8 gap-2">
            {AVATARS.map((av) => (
              <div
                key={av}
                className={`w-10 h-10 rounded-xl flex items-center justify-center text-xl cursor-default transition-all ${
                  av === user?.avatar
                    ? 'bg-brand-600/30 border border-brand-500/50 scale-110'
                    : 'glass border border-white/5 opacity-60'
                }`}
              >
                {av}
              </div>
            ))}
          </div>
          <p className="text-white/30 text-xs text-center mt-3">Avatar is assigned at registration</p>
        </div>
      </motion.div>
    </div>
  );
}
