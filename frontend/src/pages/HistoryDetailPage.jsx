import { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useDispatch, useSelector } from 'react-redux';
import { motion, AnimatePresence } from 'framer-motion';
import {
    ArrowLeft, CheckCircle, XCircle, SkipForward, Trophy,
    Brain, Sparkles, ChevronDown, ChevronUp, Clock, Target,
    Trash2, AlertTriangle,
} from 'lucide-react';
import { fetchHistoryDetail, fetchAISuggestion, deleteHistoryRecord, clearDetail } from '../store/slices/historySlice.js';
import { PageLoader, Badge } from '../components/ui/index.jsx';
import { formatScore, getCategoryIcon } from '../utils/helpers.js';
import toast from 'react-hot-toast';
import MathText from '../components/ui/MathText.jsx';

const optionLabels = ['क', 'ख', 'ग', 'घ'];

// ── Markdown-lite renderer (bold **text**, numbered lists, headers ##) ─────────
function RenderSuggestion({ text }) {
    const lines = text.split('\n');
    return (
        <div className="space-y-2 text-sm leading-relaxed text-white/80">
            {lines.map((line, i) => {
                if (!line.trim()) return <div key={i} className="h-2" />;
                if (line.startsWith('## ') || line.startsWith('# ')) {
                    return (
                        <h3 key={i} className="font-display font-700 text-white text-base mt-4 mb-1">
                            {line.replace(/^#+\s*/, '')}
                        </h3>
                    );
                }
                if (line.startsWith('**') && line.endsWith('**')) {
                    return (
                        <p key={i} className="font-display font-700 text-brand-300 mt-3">
                            {line.replace(/\*\*/g, '')}
                        </p>
                    );
                }
                // Bold inline **text**
                const parts = line.split(/(\*\*[^*]+\*\*)/g);
                return (
                    <p key={i}>
                        {parts.map((part, j) =>
                            part.startsWith('**') ? (
                                <strong key={j} className="text-white font-600">{part.replace(/\*\*/g, '')}</strong>
                            ) : part
                        )}
                    </p>
                );
            })}
        </div>
    );
}

// ── Single question card ───────────────────────────────────────────────────────
function QuestionCard({ attempt, index }) {
    const [open, setOpen] = useState(false);
    const statusColor =
        attempt.isSkipped ? 'border-white/10 bg-white/3'
            : attempt.isCorrect ? 'border-success-500/25 bg-success-500/5'
                : 'border-danger-500/25 bg-danger-500/5';

    return (
        <motion.div
            initial={{ opacity: 0, y: 12 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: index * 0.04 }}
            className={`glass rounded-2xl border ${statusColor} overflow-hidden`}
        >
            {/* Question header */}
            <button
                onClick={() => setOpen(!open)}
                className="w-full flex items-start gap-3 p-4 text-left"
            >
                {/* Status icon */}
                <div className="flex-shrink-0 mt-0.5">
                    {attempt.isSkipped ? (
                        <SkipForward size={18} className="text-white/30" />
                    ) : attempt.isCorrect ? (
                        <CheckCircle size={18} className="text-success-400" />
                    ) : (
                        <XCircle size={18} className="text-danger-400" />
                    )}
                </div>

                <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2 flex-wrap mb-1">
                        <span className="text-white/40 text-xs font-medium">Q{index + 1}</span>
                        <Badge color={attempt.difficulty === 'easy' ? 'easy' : attempt.difficulty === 'hard' ? 'hard' : 'medium'}>
                            {attempt.difficulty}
                        </Badge>
                        {!attempt.isSkipped && (
                            <span className={`text-xs font-medium ${attempt.isCorrect ? 'text-success-400' : 'text-danger-400'}`}>
                                {attempt.isCorrect ? `+${formatScore(attempt.earnedScore)} pts` : '0 pts'}
                            </span>
                        )}
                    </div>
                    <p className="text-white/85 text-sm leading-snug"><MathText text={attempt.questionText} /></p>
                </div>

                <div className="flex-shrink-0 text-white/30 ml-2 mt-0.5">
                    {open ? <ChevronUp size={16} /> : <ChevronDown size={16} />}
                </div>
            </button>

            {/* Expanded options + explanation */}
            <AnimatePresence>
                {open && (
                    <motion.div
                        initial={{ height: 0, opacity: 0 }}
                        animate={{ height: 'auto', opacity: 1 }}
                        exit={{ height: 0, opacity: 0 }}
                        transition={{ duration: 0.25 }}
                        className="overflow-hidden"
                    >
                        <div className="px-4 pb-4 space-y-2">
                            {attempt.options.map((opt, i) => {
                                const isCorrect = i === attempt.correctAnswer;
                                const isSelected = i === attempt.selectedOption;
                                const base = 'flex items-center gap-3 rounded-xl px-3 py-2.5 text-sm transition-all';
                                const style =
                                    isCorrect && isSelected ? `${base} bg-success-500/20 border border-success-500/40`
                                        : isCorrect ? `${base} bg-success-500/10 border border-success-500/25`
                                            : isSelected ? `${base} bg-danger-500/15 border border-danger-500/30`
                                                : `${base} bg-white/3 border border-white/5`;

                                return (
                                    <div key={i} className={style}>
                                        <span className={`w-7 h-7 rounded-lg flex items-center justify-center text-xs font-display font-700 flex-shrink-0 ${isCorrect ? 'bg-success-500/30 text-success-300'
                                                : isSelected ? 'bg-danger-500/30 text-danger-300'
                                                    : 'bg-white/8 text-white/40'
                                            }`}>
                                            {optionLabels[i]}
                                        </span>
                                        <span className={isCorrect ? 'text-success-300' : isSelected ? 'text-danger-300' : 'text-white/60'}>
                                            <MathText text={opt} />
                                        </span>
                                        {isCorrect && <CheckCircle size={14} className="text-success-400 ml-auto flex-shrink-0" />}
                                        {isSelected && !isCorrect && <XCircle size={14} className="text-danger-400 ml-auto flex-shrink-0" />}
                                    </div>
                                );
                            })}

                            {/* Status label for skipped */}
                            {attempt.isSkipped && (
                                <div className="flex items-center gap-2 rounded-xl px-3 py-2 bg-white/5 border border-white/8 text-white/40 text-xs">
                                    <SkipForward size={12} /> यह प्रश्न छोड़ा गया था
                                </div>
                            )}

                            {/* Explanation */}
                            {attempt.explanation && (
                                <div className="mt-2 glass rounded-xl border border-brand-500/20 px-4 py-3">
                                    <p className="text-xs font-medium text-brand-400 mb-1">💡 व्याख्या</p>
                                    <p className="text-white/60 text-xs leading-relaxed">{attempt.explanation}</p>
                                </div>
                            )}
                        </div>
                    </motion.div>
                )}
            </AnimatePresence>
        </motion.div>
    );
}

// ── Main page ─────────────────────────────────────────────────────────────────
export default function HistoryDetailPage() {
    const { id } = useParams();
    const dispatch = useDispatch();
    const navigate = useNavigate();
    const { detail: record, detailLoading, suggestionLoading } = useSelector((s) => s.history);
    const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);
    const [activeTab, setActiveTab] = useState('questions'); // questions | suggestion

    useEffect(() => {
        dispatch(fetchHistoryDetail(id));
        return () => dispatch(clearDetail());
    }, [id, dispatch]);

    const handleGetSuggestion = async () => {
        setActiveTab('suggestion');
        if (record?.aiSuggestion) return; // already fetched
        const toastId = toast.loading('🤖 AI सुझाव तैयार हो रहे हैं...', { duration: 35000 });
        const action = await dispatch(fetchAISuggestion(id));
        toast.dismiss(toastId);
        if (fetchAISuggestion.rejected.match(action)) {
            toast.error(action.payload || 'सुझाव नहीं मिला');
        }
    };

    const handleDelete = async () => {
        const action = await dispatch(deleteHistoryRecord(id));
        if (deleteHistoryRecord.fulfilled.match(action)) {
            toast.success('History हटाई गई');
            navigate('/history');
        }
    };

    if (detailLoading || !record) return <PageLoader />;

    const wrongAttempts = record.attempts.filter((a) => !a.isCorrect && !a.isSkipped);
    const correctAttempts = record.attempts.filter((a) => a.isCorrect);
    const skippedAttempts = record.attempts.filter((a) => a.isSkipped);

    return (
        <div className="max-w-3xl mx-auto px-4 sm:px-6 py-8">
            {/* Back */}
            <button
                onClick={() => navigate('/history')}
                className="flex items-center gap-2 text-white/50 hover:text-white text-sm mb-6 transition-colors"
            >
                <ArrowLeft size={16} /> Quiz इतिहास पर वापस
            </button>

            {/* Title card */}
            <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                className="glass rounded-2xl border border-white/10 p-6 mb-6"
            >
                <div className="flex items-start gap-3 flex-wrap">
                    <span className="text-3xl">{getCategoryIcon(record.quizCategory)}</span>
                    <div className="flex-1 min-w-0">
                        <h1 className="font-display font-800 text-xl text-white leading-snug">{record.quizTitle}</h1>
                        <div className="flex flex-wrap gap-2 mt-2">
                            {record.examName && <Badge color="brand">{record.examName}</Badge>}
                            {record.topicName && <Badge color="gray">{record.topicName}</Badge>}
                            <Badge color="gray">
                                {new Date(record.createdAt).toLocaleDateString('hi-IN', { day: '2-digit', month: 'long', year: 'numeric' })}
                            </Badge>
                        </div>
                    </div>
                </div>

                {/* Stats grid */}
                <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 mt-5">
                    <div className="glass rounded-xl border border-gold-500/20 p-3 text-center">
                        <Trophy size={16} className="text-gold-400 mx-auto mb-1" />
                        <div className="font-display font-800 text-lg text-gold-400">{formatScore(record.finalScore)}</div>
                        <div className="text-white/40 text-xs">अंक</div>
                    </div>
                    <div className="glass rounded-xl border border-white/10 p-3 text-center">
                        <Target size={16} className="text-brand-400 mx-auto mb-1" />
                        <div className="font-display font-800 text-lg text-white">{record.accuracy}%</div>
                        <div className="text-white/40 text-xs">सटीकता</div>
                    </div>
                    <div className="glass rounded-xl border border-white/10 p-3 text-center">
                        <CheckCircle size={16} className="text-success-400 mx-auto mb-1" />
                        <div className="font-display font-800 text-lg text-success-400">{record.correctCount}</div>
                        <div className="text-white/40 text-xs">सही उत्तर</div>
                    </div>
                    <div className="glass rounded-xl border border-white/10 p-3 text-center">
                        <XCircle size={16} className="text-danger-400 mx-auto mb-1" />
                        <div className="font-display font-800 text-lg text-danger-400">{record.incorrectCount}</div>
                        <div className="text-white/40 text-xs">गलत उत्तर</div>
                    </div>
                </div>

                {/* Rank */}
                <div className="mt-3 glass rounded-xl border border-white/5 px-4 py-2 flex items-center gap-2">
                    <Clock size={13} className="text-white/30" />
                    <span className="text-white/50 text-xs">
                        रैंक: <strong className="text-white">{record.rank}</strong> / {record.totalPlayers} खिलाड़ी
                    </span>
                    {record.skippedCount > 0 && (
                        <>
                            <span className="text-white/20 mx-1">•</span>
                            <SkipForward size={13} className="text-white/30" />
                            <span className="text-white/50 text-xs">{record.skippedCount} छोड़े गए</span>
                        </>
                    )}
                </div>
            </motion.div>

            {/* Tabs */}
            <div className="flex gap-2 mb-5">
                <button
                    onClick={() => setActiveTab('questions')}
                    className={`flex-1 py-3 rounded-xl text-sm font-display font-700 transition-all ${activeTab === 'questions'
                            ? 'bg-brand-600/30 text-brand-300 border border-brand-500/40'
                            : 'glass text-white/60 border border-white/10 hover:text-white'
                        }`}
                >
                    📋 प्रश्न समीक्षा ({record.attempts.length})
                </button>
                <button
                    onClick={handleGetSuggestion}
                    className={`flex-1 py-3 rounded-xl text-sm font-display font-700 transition-all flex items-center justify-center gap-2 ${activeTab === 'suggestion'
                            ? 'bg-indigo-600/30 text-indigo-300 border border-indigo-500/40'
                            : 'glass text-white/60 border border-white/10 hover:text-white'
                        }`}
                >
                    {suggestionLoading ? (
                        <><Sparkles size={14} className="animate-spin" /> बना रहे हैं...</>
                    ) : (
                        <><Brain size={14} /> AI सुझाव</>
                    )}
                </button>
            </div>

            {/* Tab: Questions */}
            <AnimatePresence mode="wait">
                {activeTab === 'questions' && (
                    <motion.div key="questions" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}>
                        {/* Wrong answers first, then correct, then skipped */}
                        {wrongAttempts.length > 0 && (
                            <div className="mb-6">
                                <h2 className="font-display font-700 text-danger-400 text-sm flex items-center gap-2 mb-3">
                                    <XCircle size={15} /> गलत उत्तर ({wrongAttempts.length})
                                </h2>
                                <div className="space-y-3">
                                    {wrongAttempts.map((a) => (
                                        <QuestionCard key={a.questionIndex} attempt={a} index={a.questionIndex} />
                                    ))}
                                </div>
                            </div>
                        )}

                        {skippedAttempts.length > 0 && (
                            <div className="mb-6">
                                <h2 className="font-display font-700 text-white/40 text-sm flex items-center gap-2 mb-3">
                                    <SkipForward size={15} /> छोड़े गए ({skippedAttempts.length})
                                </h2>
                                <div className="space-y-3">
                                    {skippedAttempts.map((a) => (
                                        <QuestionCard key={a.questionIndex} attempt={a} index={a.questionIndex} />
                                    ))}
                                </div>
                            </div>
                        )}

                        {correctAttempts.length > 0 && (
                            <div className="mb-6">
                                <h2 className="font-display font-700 text-success-400 text-sm flex items-center gap-2 mb-3">
                                    <CheckCircle size={15} /> सही उत्तर ({correctAttempts.length})
                                </h2>
                                <div className="space-y-3">
                                    {correctAttempts.map((a) => (
                                        <QuestionCard key={a.questionIndex} attempt={a} index={a.questionIndex} />
                                    ))}
                                </div>
                            </div>
                        )}
                    </motion.div>
                )}

                {/* Tab: AI Suggestion */}
                {activeTab === 'suggestion' && (
                    <motion.div key="suggestion" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}>
                        {suggestionLoading ? (
                            <div className="glass rounded-2xl border border-indigo-500/30 p-8 text-center">
                                <div className="text-5xl mb-4 animate-bounce">🤖</div>
                                <p className="text-white/70 font-medium">Gemini AI आपके लिए सुझाव तैयार कर रहा है...</p>
                                <p className="text-white/40 text-sm mt-1">थोड़ा इंतजार करें</p>
                                <div className="flex justify-center gap-1.5 mt-5">
                                    {[0, 1, 2].map((i) => (
                                        <motion.div
                                            key={i}
                                            className="w-2 h-2 bg-indigo-400 rounded-full"
                                            animate={{ y: [-4, 4, -4] }}
                                            transition={{ duration: 0.8, repeat: Infinity, delay: i * 0.15 }}
                                        />
                                    ))}
                                </div>
                            </div>
                        ) : record.aiSuggestion ? (
                            <motion.div
                                initial={{ opacity: 0, scale: 0.97 }}
                                animate={{ opacity: 1, scale: 1 }}
                                className="glass rounded-2xl border border-indigo-500/30 bg-indigo-500/5 p-6"
                            >
                                <div className="flex items-center gap-3 mb-5 pb-4 border-b border-indigo-500/20">
                                    <div className="w-10 h-10 rounded-xl bg-indigo-600/30 flex items-center justify-center">
                                        <Brain size={20} className="text-indigo-300" />
                                    </div>
                                    <div>
                                        <h3 className="font-display font-700 text-indigo-300">AI शिक्षक का सुझाव</h3>
                                        <p className="text-white/40 text-xs">Gemini AI द्वारा हिंदी में विश्लेषण</p>
                                    </div>
                                </div>
                                <RenderSuggestion text={record.aiSuggestion} />

                                {/* Regenerate */}
                                <button
                                    onClick={() => {
                                        // Force regenerate by clearing cached value in UI and re-fetching
                                        dispatch(fetchAISuggestion(id));
                                    }}
                                    className="mt-5 text-indigo-400 hover:text-indigo-300 text-xs flex items-center gap-1 transition-colors"
                                >
                                    <Sparkles size={11} /> नया सुझाव पाएं
                                </button>
                            </motion.div>
                        ) : (
                            <div className="glass rounded-2xl border border-white/10 p-8 text-center">
                                <Brain size={36} className="text-indigo-400 mx-auto mb-3 opacity-60" />
                                <p className="text-white/50">AI सुझाव पाने के लिए ऊपर "AI सुझाव" बटन दबाएं</p>
                            </div>
                        )}
                    </motion.div>
                )}
            </AnimatePresence>

            {/* Delete section */}
            <div className="mt-8 pt-6 border-t border-white/5">
                {!showDeleteConfirm ? (
                    <button
                        onClick={() => setShowDeleteConfirm(true)}
                        className="flex items-center gap-2 text-white/30 hover:text-danger-400 text-xs transition-colors"
                    >
                        <Trash2 size={13} /> यह record हटाएं
                    </button>
                ) : (
                    <motion.div
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        className="glass rounded-xl border border-danger-500/30 p-4 flex items-center gap-4 flex-wrap"
                    >
                        <AlertTriangle size={16} className="text-danger-400 flex-shrink-0" />
                        <span className="text-white/70 text-sm flex-1">क्या आप यह history record हमेशा के लिए हटाना चाहते हैं?</span>
                        <div className="flex gap-2">
                            <button onClick={handleDelete} className="px-4 py-2 rounded-lg bg-danger-500/20 text-danger-400 border border-danger-500/30 text-sm font-medium hover:bg-danger-500/30 transition-all">
                                हाँ, हटाएं
                            </button>
                            <button onClick={() => setShowDeleteConfirm(false)} className="px-4 py-2 rounded-lg glass text-white/60 border border-white/10 text-sm hover:text-white transition-all">
                                रद्द करें
                            </button>
                        </div>
                    </motion.div>
                )}
            </div>
        </div>
    );
}