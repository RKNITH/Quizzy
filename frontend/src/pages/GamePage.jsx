import { useEffect, useRef, useCallback } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useDispatch, useSelector } from 'react-redux';
import { motion, AnimatePresence } from 'framer-motion';
import { Zap, SkipForward, Star, Trophy, ChevronRight, AlertCircle } from 'lucide-react';
import { fetchRoom } from '../store/slices/roomSlice.js';
import { finishGame } from '../store/slices/roomSlice.js';
import {
  submitAnswer, skipQuestion,
  startQuestion, tickTimer, setGamePhase, toggleDoubleScore,
  useSkip, setLeaderboard, clearGame, initGame,
} from '../store/slices/gameSlice.js';
import { fetchRoomLeaderboard } from '../store/slices/leaderboardSlice.js';
import { emitNextQuestion, emitScoreUpdate, emitGameOver, getSocket } from '../services/socket.js';
import { getTimerColor, calculateTimeTaken, formatScore } from '../utils/helpers.js';
import toast from 'react-hot-toast';
import MathText from '../components/ui/MathText.jsx';

const optionLabels = ['A', 'B', 'C', 'D'];

export default function GamePage() {
  const { id } = useParams();
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const timerRef = useRef(null);
  const hasSubmittedRef = useRef(false);

  const { current: room } = useSelector((s) => s.room);
  const { user } = useSelector((s) => s.auth);
  const {
    currentQuestionIndex, totalQuestions, score, selectedOption,
    isAnswered, isCorrect, correctAnswer, explanation, earnedScore,
    timeLeft, timerActive, loading, gamePhase, powerUps, doubleScoreActive,
    questionStartTime,
  } = useSelector((s) => s.game);

  const questions = room?.quiz?.questions || [];
  const currentQ = questions[currentQuestionIndex];
  const isLastQuestion = currentQuestionIndex >= totalQuestions - 1;
  const timePerQuestion = room?.quiz?.timePerQuestion || 30;

  // Initialize game
  useEffect(() => {
    if (!room) {
      dispatch(fetchRoom(id)).then((action) => {
        if (fetchRoom.fulfilled.match(action)) {
          const r = action.payload;
          dispatch(initGame({
            totalQuestions: r.quiz?.questions?.length || 0,
            timePerQuestion: r.quiz?.timePerQuestion || 30,
            powerUps: user?.powerUps || { skip: 3, doubleScore: 2 },
          }));
          dispatch(startQuestion({ index: 0, timePerQuestion: r.quiz?.timePerQuestion || 30 }));
        }
      });
    } else if (gamePhase === 'idle') {
      dispatch(initGame({
        totalQuestions: questions.length,
        timePerQuestion,
        powerUps: user?.powerUps || { skip: 3, doubleScore: 2 },
      }));
      dispatch(startQuestion({ index: 0, timePerQuestion }));
    }
  }, [room, id, dispatch, user]);

  // Socket listeners
  useEffect(() => {
    const socket = getSocket();
    if (socket) {
      socket.on('game_finished', ({ leaderboard }) => {
        dispatch(setLeaderboard(leaderboard));
        navigate(`/rooms/${id}/results`);
      });
    }
    return () => { socket?.off('game_finished'); };
  }, [id, dispatch, navigate]);

  // Timer countdown
  useEffect(() => {
    if (timerActive && !isAnswered && gamePhase === 'question') {
      timerRef.current = setInterval(() => {
        dispatch(tickTimer());
      }, 1000);
    }
    return () => clearInterval(timerRef.current);
  }, [timerActive, isAnswered, gamePhase, dispatch]);

  // Auto-submit when timer hits 0
  useEffect(() => {
    if (timeLeft <= 0 && !isAnswered && !hasSubmittedRef.current && currentQ) {
      hasSubmittedRef.current = true;
      handleAutoSubmit();
    }
  }, [timeLeft, isAnswered]);

  const handleAutoSubmit = useCallback(() => {
    if (selectedOption !== null && !isAnswered) {
      handleSubmit(selectedOption);
    } else if (!isAnswered) {
      dispatch(setGamePhase('result'));
    }
  }, [selectedOption, isAnswered]);

  const handleSelect = (optionIndex) => {
    if (isAnswered || loading) return;
    dispatch({ type: 'game/setSelectedOption', payload: optionIndex });
  };

  const handleSubmit = async (optIndex = selectedOption) => {
    if (isAnswered || loading || optIndex === null || optIndex === undefined) return;
    clearInterval(timerRef.current);
    const timeTaken = calculateTimeTaken(questionStartTime);
    await dispatch(submitAnswer({
      roomId: id,
      data: {
        questionIndex: currentQuestionIndex,
        selectedOption: optIndex,
        timeTaken: Math.min(timeTaken, timePerQuestion),
        usedDoubleScore: doubleScoreActive,
      },
    }));
    emitScoreUpdate(id);
    dispatch(fetchRoomLeaderboard(id));
    hasSubmittedRef.current = false;
  };

  const handleSkip = async () => {
    if (isAnswered || powerUps.skip <= 0) return;
    clearInterval(timerRef.current);
    dispatch(useSkip());
    await dispatch(skipQuestion({ roomId: id, questionIndex: currentQuestionIndex }));
    toast('Question skipped ⏭️', { icon: '⚡' });
    hasSubmittedRef.current = false;
  };

  const handleNext = async () => {
    if (isLastQuestion) {
      // Finish game
      const action = await dispatch(finishGame(id));
      if (finishGame.fulfilled.match(action)) {
        const { leaderboard } = action.payload;
        emitGameOver(id, leaderboard);
        dispatch(setLeaderboard(leaderboard));
        dispatch(clearGame());
        navigate(`/rooms/${id}/results`);
      }
    } else {
      const nextIndex = currentQuestionIndex + 1;
      dispatch(startQuestion({ index: nextIndex, timePerQuestion }));
      emitNextQuestion(id, nextIndex);
    }
  };

  const timerColor = getTimerColor(timeLeft, timePerQuestion);
  const timerPct = (timeLeft / timePerQuestion) * 100;

  if (!room || !currentQ) {
    return (
      <div className="flex items-center justify-center min-h-[60vh]">
        <div className="text-center">
          <div className="text-4xl mb-4 animate-pulse">⚡</div>
          <p className="text-white/50">Loading game...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-3xl mx-auto px-4 sm:px-6 py-6">
      {/* Header bar */}
      <div className="flex items-center gap-3 mb-6">
        <div className="flex-1 glass rounded-full border border-white/10 px-4 py-2 flex items-center gap-3">
          <div className="text-white/50 text-xs font-medium">Q{currentQuestionIndex + 1}/{totalQuestions}</div>
          <div className="flex-1 h-1.5 bg-white/10 rounded-full overflow-hidden">
            <motion.div
              className="h-full bg-gradient-to-r from-brand-500 to-accent-500 rounded-full"
              animate={{ width: `${((currentQuestionIndex) / totalQuestions) * 100}%` }}
              transition={{ duration: 0.5 }}
            />
          </div>
        </div>
        <div className="glass rounded-full border border-gold-500/20 px-4 py-2 flex items-center gap-2">
          <Trophy size={13} className="text-gold-400" />
          <span className="font-display font-700 text-gold-400 text-sm">{formatScore(score)}</span>
        </div>
      </div>

      {/* Timer */}
      <div className="mb-5">
        <div className="flex items-center justify-between mb-2">
          <span className="text-white/50 text-xs font-medium">Time Remaining</span>
          <motion.span
            key={timeLeft}
            animate={{ scale: timeLeft <= 10 ? [1.3, 1] : 1 }}
            transition={{ duration: 0.2 }}
            className="font-display font-800 text-lg"
            style={{ color: timerColor }}
          >
            {timeLeft}s
          </motion.span>
        </div>
        <div className="h-2.5 bg-white/10 rounded-full overflow-hidden">
          <motion.div
            className="h-full rounded-full timer-bar"
            style={{ width: `${timerPct}%`, backgroundColor: timerColor }}
            transition={{ duration: 1, ease: 'linear' }}
          />
        </div>
      </div>

      {/* Question card */}
      <AnimatePresence mode="wait">
        <motion.div
          key={currentQuestionIndex}
          initial={{ opacity: 0, x: 40 }}
          animate={{ opacity: 1, x: 0 }}
          exit={{ opacity: 0, x: -40 }}
          transition={{ duration: 0.3 }}
          className="glass rounded-2xl border border-white/10 p-6 mb-5"
        >
          <div className="flex items-start gap-3 mb-6">
            <div className="w-8 h-8 rounded-lg bg-brand-600/30 flex items-center justify-center flex-shrink-0 mt-0.5">
              <span className="font-display font-700 text-brand-300 text-sm">{currentQuestionIndex + 1}</span>
            </div>
            <h2 className="font-display font-700 text-lg sm:text-xl text-white leading-snug">
              <MathText text={currentQ.question} />
            </h2>
          </div>

          {/* Options */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            {currentQ.options.map((option, i) => {
              let btnClass = 'option-btn';
              if (isAnswered) {
                if (i === correctAnswer) btnClass += ' correct';
                else if (i === selectedOption && !isCorrect) btnClass += ' incorrect';
              } else if (i === selectedOption) {
                btnClass += ' selected';
              }

              return (
                <motion.button
                  key={i}
                  onClick={() => handleSelect(i)}
                  disabled={isAnswered}
                  whileHover={!isAnswered ? { scale: 1.02 } : {}}
                  whileTap={!isAnswered ? { scale: 0.98 } : {}}
                  className={`${btnClass} glass rounded-xl border border-white/10 p-4 text-left flex items-center gap-3 w-full transition-all`}
                >
                  <div className={`w-8 h-8 rounded-lg flex items-center justify-center font-display font-700 text-sm flex-shrink-0 ${isAnswered && i === correctAnswer ? 'bg-success-500/30 text-success-300' :
                      isAnswered && i === selectedOption && !isCorrect ? 'bg-danger-500/30 text-danger-300' :
                        i === selectedOption ? 'bg-brand-500/30 text-brand-300' : 'bg-white/10 text-white/50'
                    }`}>
                    {optionLabels[i]}
                  </div>
                  <span className="text-sm text-white leading-tight"><MathText text={option} /></span>
                  {isAnswered && i === correctAnswer && (
                    <span className="ml-auto text-success-400 text-lg">✓</span>
                  )}
                  {isAnswered && i === selectedOption && !isCorrect && i !== correctAnswer && (
                    <span className="ml-auto text-danger-400 text-lg">✗</span>
                  )}
                </motion.button>
              );
            })}
          </div>
        </motion.div>
      </AnimatePresence>

      {/* Answer feedback */}
      <AnimatePresence>
        {isAnswered && (
          <motion.div
            initial={{ opacity: 0, y: 16 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0 }}
            className={`glass rounded-2xl border p-4 mb-5 ${isCorrect
                ? 'border-success-500/30 bg-success-500/10'
                : 'border-danger-500/30 bg-danger-500/10'
              }`}
          >
            <div className="flex items-start gap-3">
              <span className="text-2xl">{isCorrect ? '🎉' : '💡'}</span>
              <div>
                <div className="font-display font-700 text-sm mb-1">
                  {isCorrect ? (
                    <span className="text-success-400">
                      Correct! +{formatScore(earnedScore)} pts
                      {doubleScoreActive && <span className="ml-2 text-gold-400">×2 Double Score!</span>}
                    </span>
                  ) : selectedOption === null || selectedOption === -1 ? (
                    <span className="text-white/60">Time's up!</span>
                  ) : (
                    <span className="text-danger-400">Incorrect</span>
                  )}
                </div>
                {explanation && (
                  <p className="text-white/60 text-xs leading-relaxed"><MathText text={explanation} /></p>
                )}
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Controls */}
      <div className="flex items-center gap-3">
        {/* Power-ups */}
        {!isAnswered && (
          <>
            <button
              onClick={handleSkip}
              disabled={powerUps.skip <= 0 || isAnswered}
              className={`flex items-center gap-2 glass px-4 py-3 rounded-xl border text-sm font-medium transition-all ${powerUps.skip > 0 ? 'border-brand-500/30 text-brand-300 hover:bg-brand-500/10' : 'border-white/5 text-white/30 cursor-not-allowed'
                }`}
            >
              <SkipForward size={15} />
              Skip ({powerUps.skip})
            </button>

            <button
              onClick={() => dispatch(toggleDoubleScore())}
              disabled={powerUps.doubleScore <= 0}
              className={`flex items-center gap-2 glass px-4 py-3 rounded-xl border text-sm font-medium transition-all ${doubleScoreActive
                  ? 'border-gold-500/50 text-gold-300 bg-gold-500/10'
                  : powerUps.doubleScore > 0
                    ? 'border-gold-500/30 text-gold-400 hover:bg-gold-500/10'
                    : 'border-white/5 text-white/30 cursor-not-allowed'
                }`}
            >
              <Star size={15} />
              ×2 ({powerUps.doubleScore})
            </button>
          </>
        )}

        {/* Submit / Next */}
        {!isAnswered ? (
          <button
            onClick={() => handleSubmit()}
            disabled={selectedOption === null || loading}
            className={`btn-primary flex items-center gap-2 px-6 py-3 rounded-xl text-sm ml-auto ${selectedOption === null ? 'opacity-50 cursor-not-allowed' : ''
              }`}
          >
            {loading ? (
              <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
            ) : (
              <>Submit <Zap size={14} /></>
            )}
          </button>
        ) : (
          <button
            onClick={handleNext}
            className="btn-primary flex items-center gap-2 px-6 py-3 rounded-xl text-sm ml-auto"
          >
            {isLastQuestion ? (
              <><Trophy size={15} /> View Results</>
            ) : (
              <>Next <ChevronRight size={15} /></>
            )}
          </button>
        )}
      </div>

      {/* Difficulty badge */}
      {currentQ.difficulty && (
        <div className="mt-4 flex items-center gap-2 text-white/30 text-xs">
          <AlertCircle size={11} />
          Difficulty: <span className="capitalize">{currentQ.difficulty}</span>
          <span>•</span>
          Base points: {currentQ.points || 100}
        </div>
      )}
    </div>
  );
}