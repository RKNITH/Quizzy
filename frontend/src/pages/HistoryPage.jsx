import { useEffect } from 'react';
import { Link } from 'react-router-dom';
import { useDispatch, useSelector } from 'react-redux';
import { motion } from 'framer-motion';
import { History, CheckCircle, XCircle, SkipForward, Trophy, Clock, ChevronRight, RefreshCw } from 'lucide-react';
import { fetchHistory } from '../store/slices/historySlice.js';
import { PageLoader, EmptyState, Badge } from '../components/ui/index.jsx';
import { formatScore, getCategoryIcon } from '../utils/helpers.js';

const container = { hidden: {}, show: { transition: { staggerChildren: 0.07 } } };
const item = { hidden: { opacity: 0, y: 18 }, show: { opacity: 1, y: 0, transition: { duration: 0.35 } } };

function AccuracyRing({ value }) {
    const r = 20;
    const circ = 2 * Math.PI * r;
    const offset = circ - (value / 100) * circ;
    const color = value >= 70 ? '#34d399' : value >= 40 ? '#fbbf24' : '#f87171';
    return (
        <svg width="56" height="56" className="flex-shrink-0">
            <circle cx="28" cy="28" r={r} fill="none" stroke="rgba(255,255,255,0.08)" strokeWidth="4" />
            <circle
                cx="28" cy="28" r={r} fill="none"
                stroke={color} strokeWidth="4"
                strokeDasharray={circ} strokeDashoffset={offset}
                strokeLinecap="round"
                transform="rotate(-90 28 28)"
                style={{ transition: 'stroke-dashoffset 0.8s ease' }}
            />
            <text x="28" y="33" textAnchor="middle" fontSize="11" fontWeight="700" fill={color}>
                {value}%
            </text>
        </svg>
    );
}

export default function HistoryPage() {
    const dispatch = useDispatch();
    const { list, loading, pagination } = useSelector((s) => s.history);

    useEffect(() => { dispatch(fetchHistory({ page: 1, limit: 15 })); }, [dispatch]);

    const loadMore = () => {
        if (pagination && pagination.page < pagination.pages) {
            dispatch(fetchHistory({ page: pagination.page + 1, limit: 15 }));
        }
    };

    return (
        <div className="max-w-4xl mx-auto px-4 sm:px-6 py-8">
            {/* Header */}
            <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="mb-8">
                <div className="flex items-center justify-between flex-wrap gap-3">
                    <div>
                        <h1 className="font-display font-800 text-3xl text-white flex items-center gap-3">
                            <History className="text-brand-400" size={28} />
                            Quiz इतिहास
                        </h1>
                        <p className="text-white/50 mt-1 text-sm">
                            आपके सभी पूर्ण quiz — गलतियाँ देखें और AI से सुधार सुझाव पाएं
                        </p>
                    </div>
                    <button
                        onClick={() => dispatch(fetchHistory({ page: 1, limit: 15 }))}
                        className="btn-ghost p-3 rounded-xl"
                        title="Refresh"
                    >
                        <RefreshCw size={16} />
                    </button>
                </div>
            </motion.div>

            {loading && list.length === 0 ? (
                <PageLoader />
            ) : list.length === 0 ? (
                <EmptyState
                    icon="📋"
                    title="अभी कोई इतिहास नहीं"
                    description="कोई quiz पूरी करने के बाद यहाँ दिखेगी"
                    action={
                        <Link to="/quizzes" className="btn-primary px-6 py-3 rounded-xl text-sm inline-flex items-center gap-2">
                            Quiz खेलें
                        </Link>
                    }
                />
            ) : (
                <motion.div variants={container} initial="hidden" animate="show" className="space-y-4">
                    {list.map((record) => (
                        <motion.div key={record._id} variants={item}>
                            <Link
                                to={`/history/${record._id}`}
                                className="block glass rounded-2xl border border-white/8 p-5 card-hover group"
                            >
                                <div className="flex items-center gap-4">
                                    {/* Accuracy ring */}
                                    <AccuracyRing value={record.accuracy} />

                                    {/* Info */}
                                    <div className="flex-1 min-w-0">
                                        <div className="flex items-center gap-2 flex-wrap mb-1">
                                            <span className="text-lg">{getCategoryIcon(record.quizCategory)}</span>
                                            <h3 className="font-display font-700 text-white text-sm leading-snug truncate group-hover:text-brand-300 transition-colors">
                                                {record.quizTitle}
                                            </h3>
                                            {record.examName && (
                                                <Badge color="brand" className="text-xs">{record.examName}</Badge>
                                            )}
                                        </div>

                                        {/* Stats row */}
                                        <div className="flex items-center gap-4 flex-wrap mt-2">
                                            <span className="flex items-center gap-1 text-success-400 text-xs font-medium">
                                                <CheckCircle size={12} /> {record.correctCount} सही
                                            </span>
                                            <span className="flex items-center gap-1 text-danger-400 text-xs font-medium">
                                                <XCircle size={12} /> {record.incorrectCount} गलत
                                            </span>
                                            {record.skippedCount > 0 && (
                                                <span className="flex items-center gap-1 text-white/40 text-xs">
                                                    <SkipForward size={12} /> {record.skippedCount} छोड़े
                                                </span>
                                            )}
                                            <span className="flex items-center gap-1 text-white/40 text-xs">
                                                <Clock size={12} />
                                                {new Date(record.createdAt).toLocaleDateString('hi-IN', {
                                                    day: '2-digit', month: 'short', year: 'numeric',
                                                })}
                                            </span>
                                        </div>
                                    </div>

                                    {/* Score + rank */}
                                    <div className="text-right flex-shrink-0">
                                        <div className="flex items-center gap-1 justify-end text-gold-400 mb-1">
                                            <Trophy size={13} />
                                            <span className="font-display font-800 text-base">{formatScore(record.finalScore)}</span>
                                        </div>
                                        <div className="text-white/40 text-xs">
                                            रैंक #{record.rank} / {record.totalPlayers}
                                        </div>
                                        {record.aiSuggestion && (
                                            <div className="text-indigo-400 text-xs mt-1 font-medium">🤖 सुझाव उपलब्ध</div>
                                        )}
                                    </div>

                                    <ChevronRight size={16} className="text-white/20 group-hover:text-brand-400 transition-colors flex-shrink-0" />
                                </div>
                            </Link>
                        </motion.div>
                    ))}
                </motion.div>
            )}

            {/* Load more */}
            {pagination && pagination.page < pagination.pages && (
                <div className="text-center mt-8">
                    <button onClick={loadMore} disabled={loading} className="btn-ghost px-8 py-3 rounded-xl text-sm">
                        {loading ? 'लोड हो रहा है...' : 'और देखें'}
                    </button>
                </div>
            )}
        </div>
    );
}