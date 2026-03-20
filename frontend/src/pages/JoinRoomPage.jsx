import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useDispatch, useSelector } from 'react-redux';
import { motion } from 'framer-motion';
import { Hash, ArrowRight, LogIn } from 'lucide-react';
import { joinRoom } from '../store/slices/roomSlice.js';
import { joinRoomSchema } from '../lib/validations.js';
import { Button } from '../components/ui/index.jsx';
import toast from 'react-hot-toast';

export default function JoinRoomPage() {
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const { loading, error } = useSelector((s) => s.room);
  const [code, setCode] = useState('');
  const [codeError, setCodeError] = useState('');

  const handleChange = (e) => {
    const val = e.target.value.toUpperCase().replace(/[^A-Z0-9]/g, '').slice(0, 6);
    setCode(val);
    if (codeError) setCodeError('');
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    const result = joinRoomSchema.safeParse({ code });
    if (!result.success) {
      setCodeError(result.error.errors[0].message);
      return;
    }
    const action = await dispatch(joinRoom(code));
    if (joinRoom.fulfilled.match(action)) {
      toast.success('Joined room! 🎮');
      navigate(`/rooms/${action.payload._id}/waiting`);
    } else {
      toast.error(action.payload || 'Failed to join room');
    }
  };

  return (
    <div className="max-w-md mx-auto px-4 sm:px-6 py-16 flex flex-col items-center">
      <motion.div
        initial={{ opacity: 0, y: 30 }}
        animate={{ opacity: 1, y: 0 }}
        className="w-full"
      >
        <div className="text-center mb-10">
          <div className="w-16 h-16 rounded-2xl bg-gradient-to-br from-accent-500 to-pink-600 flex items-center justify-center mx-auto mb-4 shadow-lg animate-float">
            <LogIn size={28} className="text-white" />
          </div>
          <h1 className="font-display font-800 text-3xl text-white">Join a Room</h1>
          <p className="text-white/50 mt-2">Enter the 6-character room code from your host</p>
        </div>

        <form onSubmit={handleSubmit}>
          <div className="glass rounded-2xl border border-white/10 p-8 mb-5">
            {/* Code input */}
            <div className="flex flex-col gap-3 mb-6">
              <label className="text-sm font-medium text-white/70 flex items-center gap-2">
                <Hash size={14} className="text-brand-400" />
                Room Code
              </label>
              <input
                value={code}
                onChange={handleChange}
                placeholder="ABC123"
                maxLength={6}
                className={`input-base w-full rounded-xl px-6 py-5 text-3xl text-center font-display font-800 tracking-widest uppercase ${
                  codeError ? 'border-danger-500/60' : code.length === 6 ? 'border-success-500/40' : ''
                }`}
              />
              {codeError && (
                <motion.p initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="text-xs text-danger-400 text-center">
                  ⚠ {codeError}
                </motion.p>
              )}
              {/* Character dots */}
              <div className="flex justify-center gap-2">
                {[...Array(6)].map((_, i) => (
                  <div
                    key={i}
                    className={`w-8 h-1 rounded-full transition-all duration-200 ${
                      i < code.length ? 'bg-brand-500' : 'bg-white/10'
                    }`}
                  />
                ))}
              </div>
            </div>

            {error && (
              <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="glass rounded-xl border border-danger-500/30 px-4 py-3 text-danger-400 text-sm mb-5 text-center">
                ⚠ {error}
              </motion.div>
            )}

            <Button
              type="submit"
              loading={loading}
              disabled={code.length !== 6}
              size="lg"
              className="w-full"
              icon={ArrowRight}
            >
              Join Battle
            </Button>
          </div>
        </form>

        <div className="glass rounded-xl border border-white/5 p-4 text-center">
          <p className="text-white/40 text-xs">
            Ask your host for the 6-character room code.<br />
            Codes are case-insensitive.
          </p>
        </div>
      </motion.div>
    </div>
  );
}
