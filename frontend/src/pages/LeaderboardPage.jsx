import { useEffect } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { motion } from 'framer-motion';
import { Trophy, Medal, TrendingUp, RefreshCw } from 'lucide-react';
import { fetchGlobalLeaderboard } from '../store/slices/leaderboardSlice.js';
import { getRankEmoji, formatScore, getRankTitle } from '../utils/helpers.js';
import { PageLoader } from '../components/ui/index.jsx';

export default function LeaderboardPage() {
  const dispatch = useDispatch();
  const { global: leaderboard, loading } = useSelector((s) => s.leaderboard);
  const { user } = useSelector((s) => s.auth);

  useEffect(() => {
    dispatch(fetchGlobalLeaderboard());
  }, [dispatch]);

  const myEntry = leaderboard.find((p) => p.username === user?.username);

  return (
    <div className="max-w-3xl mx-auto px-4 sm:px-6 py-8">
      {/* Header */}
      <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="mb-8">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="font-display font-800 text-3xl text-white flex items-center gap-3">
              <Trophy className="text-gold-400" size={28} />
              Global Leaderboard
            </h1>
            <p className="text-white/50 mt-1">Top players ranked by total score</p>
          </div>
          <button
            onClick={() => dispatch(fetchGlobalLeaderboard())}
            className="btn-ghost p-3 rounded-xl"
          >
            <RefreshCw size={16} />
          </button>
        </div>
      </motion.div>

      {/* My rank card */}
      {myEntry && (
        <motion.div
          initial={{ opacity: 0, scale: 0.95 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ delay: 0.1 }}
          className="glass rounded-2xl border border-brand-500/30 p-5 mb-6 bg-brand-600/10"
        >
          <div className="flex items-center gap-4">
            <div className="w-12 h-12 rounded-xl bg-brand-600/30 flex items-center justify-center font-display font-800 text-xl text-brand-300">
              #{myEntry.rank}
            </div>
            <span className="text-3xl">{user?.avatar || '🦊'}</span>
            <div className="flex-1">
              <div className="font-display font-700 text-white">{user?.username} <span className="text-brand-400 text-sm">(You)</span></div>
              <div className="flex items-center gap-2 mt-0.5">
                <span className="text-xs" style={{ color: getRankTitle(user?.rank).color }}>
                  {getRankTitle(user?.rank).icon} {user?.rank}
                </span>
                <span className="text-white/30 text-xs">•</span>
                <span className="text-white/40 text-xs">{myEntry.winRate}% win rate</span>
              </div>
            </div>
            <div className="text-right">
              <div className="font-display font-800 text-xl text-gold-400">{formatScore(myEntry.totalScore)}</div>
              <div className="text-white/40 text-xs">{myEntry.gamesPlayed} games</div>
            </div>
          </div>
        </motion.div>
      )}

      {/* Top 3 podium */}
      {leaderboard.length >= 3 && (
        <motion.div
          initial={{ opacity: 0, y: 16 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.15 }}
          className="grid grid-cols-3 gap-3 mb-6"
        >
          {[leaderboard[1], leaderboard[0], leaderboard[2]].map((player, visualIdx) => {
            const actualRank = player?.rank;
            const heights = ['h-24', 'h-32', 'h-20'];
            const colors = ['bg-gray-400/20 border-gray-400/30', 'bg-gold-500/20 border-gold-500/30', 'bg-amber-700/20 border-amber-700/30'];
            return player ? (
              <div key={player.username} className={`glass rounded-2xl border ${colors[visualIdx]} flex flex-col items-center justify-end p-4 ${heights[visualIdx]}`}>
                <span className="text-2xl mb-1">{player.avatar || '🦊'}</span>
                <div className="font-display font-700 text-xs text-white text-center truncate w-full">{player.username}</div>
                <div className="text-xs text-gold-400 font-700">{formatScore(player.totalScore)}</div>
                <div className="text-lg mt-1">{getRankEmoji(actualRank)}</div>
              </div>
            ) : <div key={visualIdx} />;
          })}
        </motion.div>
      )}

      {/* Full list */}
      {loading ? (
        <PageLoader />
      ) : (
        <motion.div
          initial="hidden"
          animate="show"
          variants={{ hidden: {}, show: { transition: { staggerChildren: 0.04 } } }}
          className="glass rounded-2xl border border-white/10 overflow-hidden"
        >
          {/* Table header */}
          <div className="px-5 py-3 border-b border-white/5 flex items-center gap-4 text-white/40 text-xs font-medium uppercase tracking-wider">
            <span className="w-8 text-center">Rank</span>
            <span className="flex-1">Player</span>
            <span className="hidden sm:block w-20 text-right">Games</span>
            <span className="hidden sm:block w-20 text-right">Win Rate</span>
            <span className="w-24 text-right">Score</span>
          </div>

          {leaderboard.map((player, i) => {
            const isMe = player.username === user?.username;
            const rankInfo = getRankTitle(player.rank);
            return (
              <motion.div
                key={player.userId || player.username}
                variants={{ hidden: { opacity: 0, x: -16 }, show: { opacity: 1, x: 0 } }}
                className={`flex items-center gap-4 px-5 py-3.5 border-b border-white/5 last:border-0 transition-colors ${
                  isMe ? 'bg-brand-600/10' : 'hover:bg-white/3'
                }`}
              >
                <div className="w-8 text-center">
                  {i < 3 ? (
                    <span className="text-lg">{getRankEmoji(i + 1)}</span>
                  ) : (
                    <span className="font-display font-700 text-white/40 text-sm">#{i + 1}</span>
                  )}
                </div>

                <div className="flex items-center gap-2.5 flex-1 min-w-0">
                  <span className="text-xl">{player.avatar || '🦊'}</span>
                  <div className="min-w-0">
                    <div className={`font-medium text-sm truncate ${isMe ? 'text-brand-300' : 'text-white'}`}>
                      {player.username}
                      {isMe && <span className="text-brand-400 ml-1">(You)</span>}
                    </div>
                    <div className="text-xs" style={{ color: rankInfo.color }}>
                      {rankInfo.icon} {player.rank}
                    </div>
                  </div>
                </div>

                <span className="hidden sm:block w-20 text-right text-white/50 text-sm">{player.gamesPlayed}</span>
                <span className="hidden sm:block w-20 text-right text-white/50 text-sm">{player.winRate}%</span>
                <span className="w-24 text-right font-display font-700 text-gold-400 text-sm">{formatScore(player.totalScore)}</span>
              </motion.div>
            );
          })}

          {leaderboard.length === 0 && (
            <div className="py-16 text-center text-white/40">
              <Trophy size={40} className="mx-auto mb-3 opacity-20" />
              <p>No players yet. Be the first!</p>
            </div>
          )}
        </motion.div>
      )}
    </div>
  );
}
