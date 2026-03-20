import { useEffect } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import { useDispatch, useSelector } from 'react-redux';
import { motion } from 'framer-motion';
import { Trophy, RotateCcw, Home, Star, Target, Zap } from 'lucide-react';
import { fetchRoomLeaderboard } from '../store/slices/leaderboardSlice.js';
import { clearRoom } from '../store/slices/roomSlice.js';
import { clearGame } from '../store/slices/gameSlice.js';
import { getRankEmoji, formatScore } from '../utils/helpers.js';

const container = { hidden: {}, show: { transition: { staggerChildren: 0.08 } } };
const item = { hidden: { opacity: 0, x: -20 }, show: { opacity: 1, x: 0 } };

export default function ResultsPage() {
  const { id } = useParams();
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const { room: leaderboard } = useSelector((s) => s.leaderboard);
  const { gameResult } = useSelector((s) => s.room);
  const { user } = useSelector((s) => s.auth);
  const { score, answers, totalQuestions } = useSelector((s) => s.game);

  const finalLeaderboard = gameResult?.leaderboard || leaderboard;
  const myResult = finalLeaderboard.find((p) => p.user === user?.id || p.userId === user?.id || p.username === user?.username);
  const myRank = myResult?.finalRank || myResult?.rank || 1;
  const correctCount = answers.filter((a) => a.isCorrect).length;
  const accuracy = totalQuestions > 0 ? Math.round((correctCount / totalQuestions) * 100) : 0;
  const isWinner = myRank === 1;

  useEffect(() => {
    dispatch(fetchRoomLeaderboard(id));
  }, [id, dispatch]);

  const handlePlayAgain = () => {
    dispatch(clearRoom());
    dispatch(clearGame());
    navigate('/quizzes');
  };

  return (
    <div className="max-w-2xl mx-auto px-4 sm:px-6 py-8">
      {/* Winner banner */}
      <motion.div
        initial={{ opacity: 0, scale: 0.8 }}
        animate={{ opacity: 1, scale: 1 }}
        transition={{ duration: 0.6, type: 'spring' }}
        className="text-center mb-8"
      >
        <div className="text-7xl mb-4 animate-float">
          {isWinner ? '🏆' : myRank === 2 ? '🥈' : myRank === 3 ? '🥉' : '🎮'}
        </div>
        <h1 className="font-display font-800 text-4xl text-white mb-2">
          {isWinner ? (
            <span className="gradient-text">You Won! 🎉</span>
          ) : (
            `Rank #${myRank}`
          )}
        </h1>
        <p className="text-white/50">
          {isWinner ? 'Congratulations, Champion!' : 'Great battle! Keep practicing!'}
        </p>
      </motion.div>

      {/* Personal stats */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.2 }}
        className="grid grid-cols-3 gap-4 mb-8"
      >
        <div className="glass rounded-2xl border border-gold-500/20 p-4 text-center">
          <Trophy size={20} className="text-gold-400 mx-auto mb-2" />
          <div className="font-display font-800 text-xl text-gold-400">{formatScore(myResult?.finalScore || score)}</div>
          <div className="text-white/40 text-xs mt-1">Final Score</div>
        </div>
        <div className="glass rounded-2xl border border-success-500/20 p-4 text-center">
          <Target size={20} className="text-success-400 mx-auto mb-2" />
          <div className="font-display font-800 text-xl text-success-400">{accuracy}%</div>
          <div className="text-white/40 text-xs mt-1">Accuracy</div>
        </div>
        <div className="glass rounded-2xl border border-brand-500/20 p-4 text-center">
          <Star size={20} className="text-brand-400 mx-auto mb-2" />
          <div className="font-display font-800 text-xl text-brand-400">{correctCount}/{totalQuestions || answers.length}</div>
          <div className="text-white/40 text-xs mt-1">Correct</div>
        </div>
      </motion.div>

      {/* Leaderboard */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.3 }}
        className="glass rounded-2xl border border-white/10 p-6 mb-8"
      >
        <h2 className="font-display font-700 text-lg text-white flex items-center gap-2 mb-5">
          <Trophy size={16} className="text-gold-400" />
          Final Leaderboard
        </h2>

        <motion.div variants={container} initial="hidden" animate="show" className="space-y-3">
          {(finalLeaderboard.length > 0 ? finalLeaderboard : [myResult].filter(Boolean)).map((player, i) => {
            const isMe = player.username === user?.username;
            const rank = player.finalRank || player.rank || i + 1;
            return (
              <motion.div
                key={player.userId || player.username || i}
                variants={item}
                className={`flex items-center gap-3 rounded-xl p-3.5 border transition-all ${
                  isMe
                    ? 'bg-brand-600/15 border-brand-500/30'
                    : rank === 1
                      ? 'bg-gold-500/10 border-gold-500/20'
                      : 'glass border-white/5'
                }`}
              >
                <div className={`w-8 h-8 rounded-lg flex items-center justify-center font-display font-800 text-sm ${
                  rank === 1 ? 'rank-badge-1' : rank === 2 ? 'rank-badge-2' : rank === 3 ? 'rank-badge-3' : 'bg-white/10'
                }`}>
                  <span className={rank <= 3 ? 'text-white' : 'text-white/60'}>
                    {rank <= 3 ? getRankEmoji(rank) : rank}
                  </span>
                </div>
                <span className="text-lg">{player.avatar || '🦊'}</span>
                <div className="flex-1">
                  <span className={`font-medium text-sm ${isMe ? 'text-brand-300' : 'text-white'}`}>
                    {player.username}
                    {isMe && <span className="ml-1 text-xs text-brand-400">(You)</span>}
                  </span>
                  {player.correctAnswers !== undefined && (
                    <div className="text-white/40 text-xs">{player.correctAnswers} correct</div>
                  )}
                </div>
                <span className="font-display font-700 text-sm text-gold-400">
                  {formatScore(player.finalScore || player.score || 0)}
                </span>
              </motion.div>
            );
          })}
        </motion.div>
      </motion.div>

      {/* Actions */}
      <div className="flex flex-col sm:flex-row gap-3">
        <button
          onClick={handlePlayAgain}
          className="btn-primary flex-1 py-3.5 rounded-xl flex items-center justify-center gap-2"
        >
          <RotateCcw size={16} />
          Play Again
        </button>
        <Link
          to="/dashboard"
          onClick={() => { dispatch(clearRoom()); dispatch(clearGame()); }}
          className="btn-ghost flex-1 py-3.5 rounded-xl flex items-center justify-center gap-2"
        >
          <Home size={16} />
          Dashboard
        </Link>
      </div>
    </div>
  );
}
