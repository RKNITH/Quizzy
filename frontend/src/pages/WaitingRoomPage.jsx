import { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useDispatch, useSelector } from 'react-redux';
import { motion, AnimatePresence } from 'framer-motion';
import { Copy, Play, Users, Clock, Zap, CheckCircle, Share2 } from 'lucide-react';
import { fetchRoom, startGame } from '../store/slices/roomSlice.js';
import { initGame } from '../store/slices/gameSlice.js';
import { joinRoomSocket, leaveRoomSocket, getSocket, emitGameStarted } from '../services/socket.js';
import { Button, Spinner } from '../components/ui/index.jsx';
import { getCategoryIcon } from '../utils/helpers.js';
import toast from 'react-hot-toast';

export default function WaitingRoomPage() {
  const { id } = useParams();
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const { current: room, loading } = useSelector((s) => s.room);
  const { user } = useSelector((s) => s.auth);
  const [participants, setParticipants] = useState([]);
  const [copied, setCopied] = useState(false);

  const isHost = room?.host === user?.id || room?.host?._id === user?.id ||
    (room?.participants?.[0]?.user === user?.id);

  useEffect(() => {
    dispatch(fetchRoom(id));
    joinRoomSocket(id);

    const socket = getSocket();
    if (socket) {
      socket.on('room_state', (data) => setParticipants(data.participants || []));
      socket.on('player_joined', () => dispatch(fetchRoom(id)));
      socket.on('player_left', () => dispatch(fetchRoom(id)));
      socket.on('game_starting', () => {
        toast.success('Game is starting! 🚀');
        setTimeout(() => navigate(`/rooms/${id}/game`), 1000);
      });
    }

    return () => {
      leaveRoomSocket(id);
      if (socket) {
        socket.off('room_state');
        socket.off('player_joined');
        socket.off('player_left');
        socket.off('game_starting');
      }
    };
  }, [id, dispatch, navigate]);

  useEffect(() => {
    if (room?.participants) setParticipants(room.participants);
  }, [room]);

  const handleCopyCode = () => {
    navigator.clipboard.writeText(room?.code || '');
    setCopied(true);
    toast.success('Room code copied!');
    setTimeout(() => setCopied(false), 2000);
  };

  const handleStart = async () => {
    const action = await dispatch(startGame(id));
    if (startGame.fulfilled.match(action)) {
      // Init game state
      dispatch(initGame({
        totalQuestions: room.quiz?.questions?.length || 0,
        timePerQuestion: room.quiz?.timePerQuestion || 30,
        powerUps: user?.powerUps || { skip: 3, doubleScore: 2 },
      }));
      emitGameStarted(id);
      navigate(`/rooms/${id}/game`);
    } else {
      toast.error('Failed to start game');
    }
  };

  if (!room) return (
    <div className="flex items-center justify-center min-h-[60vh]">
      <Spinner size={36} />
    </div>
  );

  return (
    <div className="max-w-2xl mx-auto px-4 sm:px-6 py-8">
      <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}>
        {/* Room info header */}
        <div className="glass rounded-2xl border border-white/10 p-6 mb-6">
          <div className="flex items-start justify-between flex-wrap gap-4">
            <div>
              <div className="flex items-center gap-2 mb-1">
                <div className="w-2 h-2 rounded-full bg-success-400 animate-pulse" />
                <span className="text-success-400 text-xs font-medium uppercase tracking-wider">Waiting for players</span>
              </div>
              <h1 className="font-display font-800 text-2xl text-white">{room.name}</h1>
              <div className="flex items-center gap-3 mt-2 text-white/50 text-sm">
                <span>{getCategoryIcon(room.quiz?.category)} {room.quiz?.category}</span>
                <span>•</span>
                <span><Clock size={12} className="inline mr-1" />{room.quiz?.timePerQuestion}s/question</span>
                <span>•</span>
                <span>{room.quiz?.questions?.length} questions</span>
              </div>
            </div>

            {/* Room code */}
            <div className="flex flex-col items-end gap-2">
              <span className="text-white/40 text-xs">Room Code</span>
              <div className="flex items-center gap-2">
                <div className="glass px-5 py-2 rounded-xl border border-brand-500/30">
                  <span className="font-display font-800 text-2xl text-brand-300 tracking-widest">{room.code}</span>
                </div>
                <button
                  onClick={handleCopyCode}
                  className={`btn-ghost p-2.5 rounded-xl transition-all ${copied ? 'text-success-400 border-success-500/30' : ''}`}
                >
                  {copied ? <CheckCircle size={18} /> : <Copy size={18} />}
                </button>
              </div>
            </div>
          </div>
        </div>

        {/* Participants */}
        <div className="glass rounded-2xl border border-white/10 p-6 mb-6">
          <h2 className="font-display font-700 text-lg text-white flex items-center gap-2 mb-5">
            <Users size={16} className="text-brand-400" />
            Players ({participants.length}/{room.maxParticipants})
          </h2>

          <div className="space-y-3">
            <AnimatePresence>
              {participants.map((p, i) => (
                <motion.div
                  key={p.user || p.userId || i}
                  initial={{ opacity: 0, x: -20 }}
                  animate={{ opacity: 1, x: 0 }}
                  exit={{ opacity: 0, x: 20 }}
                  transition={{ delay: i * 0.05 }}
                  className="flex items-center gap-3 glass rounded-xl p-3 border border-white/5"
                >
                  <span className="text-xl">{p.avatar || '🦊'}</span>
                  <div className="flex-1">
                    <span className="text-white font-medium text-sm">{p.username}</span>
                    {i === 0 && (
                      <span className="ml-2 text-xs text-gold-400 font-medium">👑 Host</span>
                    )}
                  </div>
                  <div className="flex items-center gap-1.5">
                    <div className="w-2 h-2 rounded-full bg-success-400" />
                    <span className="text-success-400 text-xs">Ready</span>
                  </div>
                </motion.div>
              ))}
            </AnimatePresence>

            {/* Empty slots */}
            {[...Array(Math.max(0, Math.min(3, room.maxParticipants - participants.length)))].map((_, i) => (
              <div key={`empty-${i}`} className="flex items-center gap-3 rounded-xl p-3 border border-white/5 border-dashed opacity-30">
                <div className="w-8 h-8 rounded-full bg-white/5 flex items-center justify-center">
                  <span className="text-white/20 text-sm">?</span>
                </div>
                <span className="text-white/30 text-sm">Waiting for player...</span>
              </div>
            ))}
          </div>
        </div>

        {/* Share */}
        <div className="glass rounded-xl border border-white/5 p-4 mb-6 flex items-center gap-3">
          <Share2 size={16} className="text-white/40" />
          <span className="text-white/50 text-sm flex-1">Share code <strong className="text-brand-300">{room.code}</strong> with friends to join</span>
          <button onClick={handleCopyCode} className="text-brand-400 hover:text-brand-300 text-xs font-medium transition-colors">
            Copy
          </button>
        </div>

        {/* Start button (host only) */}
        {isHost ? (
          <Button
            onClick={handleStart}
            loading={loading}
            disabled={participants.length < 1}
            size="lg"
            className="w-full"
            icon={Play}
          >
            Start Battle ({participants.length} player{participants.length !== 1 ? 's' : ''})
          </Button>
        ) : (
          <div className="glass rounded-2xl border border-white/10 p-5 text-center">
            <Zap size={20} className="text-brand-400 mx-auto mb-2 animate-bounce" />
            <p className="text-white/60 text-sm">Waiting for the host to start the game...</p>
          </div>
        )}
      </motion.div>
    </div>
  );
}
