import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { useDispatch, useSelector } from 'react-redux';
import { motion } from 'framer-motion';
import { Search, Filter, Clock, Users, Play } from 'lucide-react';
import { fetchQuizzes, setFilters, fetchCategories } from '../store/slices/quizSlice.js';
import { getCategoryIcon, getDifficultyColor, getCategoryColor } from '../utils/helpers.js';
import { PageLoader, EmptyState, Badge } from '../components/ui/index.jsx';

const CATEGORIES = ['', 'Math', 'GK', 'Coding', 'Science', 'History', 'Sports', 'AI-Generated'];
const DIFFICULTIES = ['', 'easy', 'medium', 'hard', 'mixed'];

export default function QuizzesPage() {
  const dispatch = useDispatch();
  const { list, loading, filters, pagination } = useSelector((s) => s.quiz);
  const [search, setSearch] = useState('');

  useEffect(() => {
    dispatch(fetchQuizzes({ ...filters, limit: 12 }));
    dispatch(fetchCategories());
  }, [filters, dispatch]);

  const handleFilter = (key, val) => dispatch(setFilters({ [key]: val, page: 1 }));

  const filtered = search
    ? list.filter((q) => q.title.toLowerCase().includes(search.toLowerCase()) || q.category.toLowerCase().includes(search.toLowerCase()))
    : list;

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 py-8">
      {/* Header */}
      <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="mb-8">
        <h1 className="font-display font-800 text-3xl text-white mb-2">Browse Quizzes</h1>
        <p className="text-white/50">Choose a quiz to create a battle room or join an existing one</p>
      </motion.div>

      {/* Filters */}
      <motion.div
        initial={{ opacity: 0, y: 16 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.1 }}
        className="glass rounded-2xl border border-white/10 p-4 mb-8 flex flex-wrap gap-3 items-center"
      >
        {/* Search */}
        <div className="relative flex-1 min-w-[200px]">
          <Search size={15} className="absolute left-3 top-1/2 -translate-y-1/2 text-white/40" />
          <input
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Search quizzes..."
            className="input-base w-full rounded-xl pl-9 pr-4 py-2.5 text-sm"
          />
        </div>

        {/* Category filter */}
        <div className="flex items-center gap-2 flex-wrap">
          <Filter size={14} className="text-white/40" />
          {CATEGORIES.map((cat) => (
            <button
              key={cat || 'all'}
              onClick={() => handleFilter('category', cat)}
              className={`px-3 py-1.5 rounded-lg text-xs font-medium transition-all ${
                filters.category === cat
                  ? 'bg-brand-600/30 text-brand-300 border border-brand-500/40'
                  : 'text-white/50 hover:text-white/80 hover:bg-white/5'
              }`}
            >
              {cat ? `${getCategoryIcon(cat)} ${cat}` : '🌐 All'}
            </button>
          ))}
        </div>

        {/* Difficulty filter */}
        <div className="flex items-center gap-2">
          {DIFFICULTIES.map((diff) => (
            <button
              key={diff || 'all-diff'}
              onClick={() => handleFilter('difficulty', diff)}
              className={`px-3 py-1.5 rounded-lg text-xs font-medium transition-all capitalize ${
                filters.difficulty === diff
                  ? 'bg-brand-600/30 text-brand-300 border border-brand-500/40'
                  : 'text-white/50 hover:text-white/80 hover:bg-white/5'
              }`}
            >
              {diff || 'Any Difficulty'}
            </button>
          ))}
        </div>
      </motion.div>

      {/* Grid */}
      {loading ? (
        <PageLoader />
      ) : filtered.length === 0 ? (
        <EmptyState
          icon="🔍"
          title="No quizzes found"
          description="Try different filters or create your own quiz"
          action={<Link to="/quizzes/ai" className="btn-primary px-6 py-3 rounded-xl text-sm inline-flex">Generate AI Quiz</Link>}
        />
      ) : (
        <motion.div
          initial="hidden"
          animate="show"
          variants={{ hidden: {}, show: { transition: { staggerChildren: 0.06 } } }}
          className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4"
        >
          {filtered.map((quiz) => (
            <motion.div
              key={quiz._id}
              variants={{ hidden: { opacity: 0, scale: 0.95 }, show: { opacity: 1, scale: 1 } }}
              className="group"
            >
              <div className="glass rounded-2xl border border-white/8 overflow-hidden card-hover h-full flex flex-col">
                {/* Category banner */}
                <div className={`h-2 bg-gradient-to-r ${getCategoryColor(quiz.category)}`} />

                <div className="p-5 flex-1 flex flex-col">
                  <div className="flex items-start gap-3 mb-3">
                    <span className="text-2xl flex-shrink-0">{getCategoryIcon(quiz.category)}</span>
                    <div className="flex-1 min-w-0">
                      <h3 className="font-display font-700 text-white text-sm leading-tight line-clamp-2 group-hover:text-brand-300 transition-colors">
                        {quiz.title}
                      </h3>
                      {quiz.description && (
                        <p className="text-white/40 text-xs mt-1 line-clamp-2">{quiz.description}</p>
                      )}
                    </div>
                  </div>

                  <div className="flex items-center gap-2 mb-4 flex-wrap">
                    <Badge color={quiz.difficulty === 'easy' ? 'easy' : quiz.difficulty === 'medium' ? 'medium' : quiz.difficulty === 'hard' ? 'hard' : 'brand'}>
                      {quiz.difficulty}
                    </Badge>
                    <span className="text-white/40 text-xs flex items-center gap-1">
                      <Clock size={11} />{quiz.timePerQuestion}s
                    </span>
                    <span className="text-white/40 text-xs ml-auto">{quiz.questions?.length || 0}Q</span>
                  </div>

                  <div className="flex items-center gap-2 mt-auto">
                    <span className="text-white/30 text-xs flex items-center gap-1">
                      <Users size={11} />{quiz.playCount || 0} plays
                    </span>
                    {quiz.aiGenerated && <Badge color="brand">🤖 AI</Badge>}
                  </div>
                </div>

                <div className="px-5 pb-5 pt-0">
                  <Link
                    to="/rooms/create"
                    state={{ quizId: quiz._id, quizTitle: quiz.title }}
                    className="btn-primary w-full py-2.5 rounded-xl text-xs flex items-center justify-center gap-2"
                  >
                    <Play size={13} />
                    Play Now
                  </Link>
                </div>
              </div>
            </motion.div>
          ))}
        </motion.div>
      )}

      {/* Pagination */}
      {pagination && pagination.pages > 1 && (
        <div className="flex justify-center gap-2 mt-8">
          {[...Array(pagination.pages)].map((_, i) => (
            <button
              key={i}
              onClick={() => dispatch(setFilters({ page: i + 1 }))}
              className={`w-9 h-9 rounded-lg text-sm font-medium transition-all ${
                filters.page === i + 1
                  ? 'bg-brand-600 text-white'
                  : 'glass text-white/60 hover:text-white border border-white/10'
              }`}
            >
              {i + 1}
            </button>
          ))}
        </div>
      )}
    </div>
  );
}
