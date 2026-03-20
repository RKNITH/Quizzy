import { useState, useEffect } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { useDispatch, useSelector } from 'react-redux';
import { motion } from 'framer-motion';
import { Users, BookOpen, Settings, ArrowRight, Plus } from 'lucide-react';
import { createRoom } from '../store/slices/roomSlice.js';
import { fetchQuizzes } from '../store/slices/quizSlice.js';
import { createRoomSchema } from '../lib/validations.js';
import { Input, Button, Select, Card } from '../components/ui/index.jsx';
import { getCategoryIcon } from '../utils/helpers.js';
import toast from 'react-hot-toast';

export default function CreateRoomPage() {
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const location = useLocation();
  const { loading, error } = useSelector((s) => s.room);
  const { list: quizzes } = useSelector((s) => s.quiz);

  const preselectedQuizId = location.state?.quizId || '';

  const [form, setForm] = useState({
    name: '',
    quizId: preselectedQuizId,
    maxParticipants: 10,
  });
  const [errors, setErrors] = useState({});

  useEffect(() => {
    dispatch(fetchQuizzes({ limit: 50 }));
  }, [dispatch]);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setForm((p) => ({ ...p, [name]: name === 'maxParticipants' ? Number(value) : value }));
    if (errors[name]) setErrors((p) => ({ ...p, [name]: '' }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    const result = createRoomSchema.safeParse(form);
    if (!result.success) {
      const fieldErrors = {};
      result.error.errors.forEach((e) => { fieldErrors[e.path[0]] = e.message; });
      setErrors(fieldErrors);
      return;
    }
    const action = await dispatch(createRoom(form));
    if (createRoom.fulfilled.match(action)) {
      toast.success('Room created! 🎉');
      navigate(`/rooms/${action.payload._id}/waiting`);
    } else {
      toast.error(action.payload || 'Failed to create room');
    }
  };

  const selectedQuiz = quizzes.find((q) => q._id === form.quizId);

  const quizOptions = [
    { value: '', label: '— Select a Quiz —' },
    ...quizzes.map((q) => ({ value: q._id, label: `${getCategoryIcon(q.category)} ${q.title}` })),
  ];

  return (
    <div className="max-w-2xl mx-auto px-4 sm:px-6 py-8">
      <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}>
        <div className="mb-8">
          <h1 className="font-display font-800 text-3xl text-white flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-brand-500 to-brand-700 flex items-center justify-center">
              <Plus size={20} className="text-white" />
            </div>
            Create Battle Room
          </h1>
          <p className="text-white/50 mt-2">Set up your quiz room and invite players</p>
        </div>

        <form onSubmit={handleSubmit} className="space-y-6">
          {/* Room settings card */}
          <Card className="p-6">
            <h2 className="font-display font-700 text-lg text-white flex items-center gap-2 mb-5">
              <Settings size={16} className="text-brand-400" />
              Room Settings
            </h2>
            <div className="space-y-4">
              <Input
                label="Room Name"
                name="name"
                value={form.name}
                onChange={handleChange}
                placeholder="Epic Quiz Showdown"
                error={errors.name}
                required
              />

              <Select
                label="Quiz"
                name="quizId"
                value={form.quizId}
                onChange={handleChange}
                options={quizOptions}
                error={errors.quizId}
              />

              {selectedQuiz && (
                <motion.div
                  initial={{ opacity: 0, height: 0 }}
                  animate={{ opacity: 1, height: 'auto' }}
                  className="glass rounded-xl border border-brand-500/20 p-4"
                >
                  <div className="flex items-center gap-3">
                    <span className="text-2xl">{getCategoryIcon(selectedQuiz.category)}</span>
                    <div>
                      <div className="text-white font-medium text-sm">{selectedQuiz.title}</div>
                      <div className="text-white/50 text-xs">{selectedQuiz.questions?.length} questions • {selectedQuiz.timePerQuestion}s per question</div>
                    </div>
                  </div>
                </motion.div>
              )}

              <Select
                label="Max Participants"
                name="maxParticipants"
                value={String(form.maxParticipants)}
                onChange={handleChange}
                options={[2, 5, 10, 15, 20, 30, 50].map((n) => ({ value: String(n), label: `${n} players` }))}
              />
            </div>
          </Card>

          {/* Quiz preview */}
          {!form.quizId && (
            <div className="glass rounded-2xl border border-white/5 p-6 flex flex-col items-center gap-3 text-center">
              <BookOpen size={30} className="text-white/20" />
              <p className="text-white/40 text-sm">Select a quiz to preview it here</p>
            </div>
          )}

          {error && (
            <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="glass rounded-xl border border-danger-500/30 p-4 text-danger-400 text-sm">
              ⚠ {error}
            </motion.div>
          )}

          <Button
            type="submit"
            loading={loading}
            disabled={!form.name || !form.quizId}
            size="lg"
            className="w-full"
            icon={ArrowRight}
          >
            Create Room & Get Code
          </Button>
        </form>
      </motion.div>
    </div>
  );
}
