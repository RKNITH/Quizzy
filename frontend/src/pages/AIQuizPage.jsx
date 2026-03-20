import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useDispatch, useSelector } from 'react-redux';
import { motion, AnimatePresence } from 'framer-motion';
import { Brain, Zap, Sparkles, ArrowRight, CheckCircle, BookOpen, Hash, Clock, GraduationCap } from 'lucide-react';
import { generateAIQuiz } from '../store/slices/quizSlice.js';
import { Button } from '../components/ui/index.jsx';
import { z } from 'zod';
import toast from 'react-hot-toast';

const formSchema = z.object({
  examName: z.string().min(2, 'परीक्षा का नाम कम से कम 2 अक्षर का होना चाहिए').max(100, 'नाम बहुत लंबा है'),
  topic: z.string().min(3, 'विषय कम से कम 3 अक्षर का होना चाहिए').max(100, 'विषय बहुत लंबा है'),
  numQuestions: z
    .number({ invalid_type_error: 'प्रश्नों की संख्या दर्ज करें' })
    .min(3, 'कम से कम 3 प्रश्न होने चाहिए')
    .max(20, 'अधिकतम 20 प्रश्न हो सकते हैं'),
});

export default function AIQuizPage() {
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const { aiLoading, generatedQuiz } = useSelector((s) => s.quiz);

  const [form, setForm] = useState({ examName: '', topic: '', numQuestions: '' });
  const [errors, setErrors] = useState({});

  const handleChange = (e) => {
    const { name, value } = e.target;
    setForm((p) => ({ ...p, [name]: name === 'numQuestions' ? (value === '' ? '' : Number(value)) : value }));
    if (errors[name]) setErrors((p) => ({ ...p, [name]: '' }));
  };

  const handleGenerate = async (e) => {
    e.preventDefault();

    const parsed = formSchema.safeParse({
      ...form,
      numQuestions: form.numQuestions === '' ? NaN : Number(form.numQuestions),
    });

    if (!parsed.success) {
      const fieldErrors = {};
      parsed.error.errors.forEach((err) => { fieldErrors[err.path[0]] = err.message; });
      setErrors(fieldErrors);
      return;
    }

    const combinedTopic = `${form.examName} परीक्षा — ${form.topic}`;

    const toastId = toast.loading('🤖 Gemini AI प्रश्न बना रहा है...', { duration: 40000 });
    const action = await dispatch(
      generateAIQuiz({
        topic: combinedTopic,
        difficulty: 'mixed',
        numQuestions: Number(form.numQuestions),
      })
    );
    toast.dismiss(toastId);

    if (generateAIQuiz.fulfilled.match(action)) {
      toast.success('Quiz तैयार है! 🎉');
    } else {
      toast.error(action.payload || 'Quiz बनाने में समस्या आई, दोबारा कोशिश करें');
    }
  };

  const handleUseQuiz = () => {
    navigate('/rooms/create', {
      state: { quizId: generatedQuiz._id, quizTitle: generatedQuiz.title },
    });
  };

  const isFormValid =
    form.examName.trim().length >= 2 &&
    form.topic.trim().length >= 3 &&
    form.numQuestions !== '' &&
    Number(form.numQuestions) >= 3 &&
    Number(form.numQuestions) <= 20;

  return (
    <div className="max-w-2xl mx-auto px-4 sm:px-6 py-8">
      <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}>

        {/* Header */}
        <div className="text-center mb-10">
          <div className="w-16 h-16 rounded-2xl bg-gradient-to-br from-indigo-500 to-violet-600 flex items-center justify-center mx-auto mb-4 shadow-lg animate-float">
            <Brain size={30} className="text-white" />
          </div>
          <h1 className="font-display font-800 text-3xl text-white mb-2">AI Quiz Generator</h1>
          <p className="text-white/50 text-sm">
            परीक्षा का नाम और टॉपिक भरें — AI हिंदी में प्रश्न तैयार करेगा
          </p>
        </div>

        {/* Form */}
        <form onSubmit={handleGenerate}>
          <div className="glass rounded-2xl border border-white/10 p-6 mb-5 space-y-5">

            {/* Exam Name */}
            <div className="flex flex-col gap-1.5">
              <label className="text-sm font-medium text-white/70 flex items-center gap-2">
                <GraduationCap size={14} className="text-brand-400" />
                परीक्षा का नाम <span className="text-brand-400">*</span>
              </label>
              <input
                name="examName"
                value={form.examName}
                onChange={handleChange}
                placeholder="जैसे: SSC CGL, UPSC, JEE, NEET, Class 10 Board..."
                className={`input-base w-full rounded-xl px-4 py-3 text-sm ${errors.examName ? 'border-danger-500/60' : ''}`}
              />
              {errors.examName && (
                <motion.p initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="text-xs text-danger-400">
                  ⚠ {errors.examName}
                </motion.p>
              )}
            </div>

            {/* Topic Name */}
            <div className="flex flex-col gap-1.5">
              <label className="text-sm font-medium text-white/70 flex items-center gap-2">
                <BookOpen size={14} className="text-brand-400" />
                टॉपिक का नाम <span className="text-brand-400">*</span>
              </label>
              <input
                name="topic"
                value={form.topic}
                onChange={handleChange}
                placeholder="जैसे: भारतीय इतिहास, Trigonometry, Carbon Compounds..."
                className={`input-base w-full rounded-xl px-4 py-3 text-sm ${errors.topic ? 'border-danger-500/60' : ''}`}
              />
              {errors.topic && (
                <motion.p initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="text-xs text-danger-400">
                  ⚠ {errors.topic}
                </motion.p>
              )}
            </div>

            {/* Number of Questions */}
            <div className="flex flex-col gap-1.5">
              <label className="text-sm font-medium text-white/70 flex items-center gap-2">
                <Hash size={14} className="text-brand-400" />
                प्रश्नों की संख्या <span className="text-brand-400">*</span>
                <span className="text-white/30 text-xs font-normal">(3 से 20 के बीच)</span>
              </label>
              <input
                name="numQuestions"
                type="number"
                min={3}
                max={20}
                value={form.numQuestions}
                onChange={handleChange}
                placeholder="जैसे: 10"
                className={`input-base w-full rounded-xl px-4 py-3 text-sm ${errors.numQuestions ? 'border-danger-500/60' : ''}`}
              />
              {errors.numQuestions && (
                <motion.p initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="text-xs text-danger-400">
                  ⚠ {errors.numQuestions}
                </motion.p>
              )}
            </div>

            {/* Fixed timer info */}
            <div className="flex items-center gap-3 glass rounded-xl border border-gold-500/20 px-4 py-3">
              <Clock size={16} className="text-gold-400 flex-shrink-0" />
              <div>
                <p className="text-gold-400 text-sm font-medium">प्रति प्रश्न समय: 30 सेकंड (निश्चित)</p>
                <p className="text-white/40 text-xs mt-0.5">सभी प्रश्नों के लिए timer 30 सेकंड का रहेगा</p>
              </div>
            </div>
          </div>

          <Button
            type="submit"
            loading={aiLoading}
            disabled={!isFormValid}
            size="lg"
            className="w-full mb-4"
          >
            {aiLoading ? (
              <>
                <Sparkles size={16} className="animate-spin" />
                प्रश्न बना रहे हैं...
              </>
            ) : (
              <>
                <Zap size={16} />
                AI Quiz बनाएं
              </>
            )}
          </Button>
        </form>

        {/* Loading animation */}
        <AnimatePresence>
          {aiLoading && (
            <motion.div
              initial={{ opacity: 0, height: 0 }}
              animate={{ opacity: 1, height: 'auto' }}
              exit={{ opacity: 0, height: 0 }}
              className="glass rounded-2xl border border-indigo-500/30 p-6 text-center mb-4"
            >
              <div className="text-4xl mb-3 animate-bounce">🤖</div>
              <p className="text-white/70 font-medium">
                <span className="text-brand-300">{form.examName}</span> के लिए{' '}
                <span className="text-accent-400">{form.topic}</span> पर प्रश्न बन रहे हैं...
              </p>
              <p className="text-white/40 text-sm mt-1">इसमें लगभग 15–20 सेकंड लगेंगे</p>
              <div className="flex justify-center gap-1.5 mt-4">
                {[0, 1, 2].map((i) => (
                  <motion.div
                    key={i}
                    className="w-2 h-2 bg-indigo-400 rounded-full"
                    animate={{ y: [-4, 4, -4] }}
                    transition={{ duration: 0.8, repeat: Infinity, delay: i * 0.15 }}
                  />
                ))}
              </div>
            </motion.div>
          )}
        </AnimatePresence>

        {/* Generated quiz result */}
        <AnimatePresence>
          {generatedQuiz && !aiLoading && (
            <motion.div
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              className="glass rounded-2xl border border-success-500/30 bg-success-500/5 p-6"
            >
              <div className="flex items-start gap-4 mb-5">
                <CheckCircle size={24} className="text-success-400 flex-shrink-0 mt-0.5" />
                <div>
                  <h3 className="font-display font-700 text-white text-lg leading-snug">
                    {generatedQuiz.title}
                  </h3>
                  <div className="flex flex-wrap items-center gap-3 mt-1.5">
                    <span className="flex items-center gap-1 text-white/50 text-xs">
                      <Hash size={11} />
                      {generatedQuiz.questions?.length} प्रश्न
                    </span>
                    <span className="flex items-center gap-1 text-white/50 text-xs">
                      <Clock size={11} />
                      30 सेकंड / प्रश्न
                    </span>
                    <span className="text-xs px-2 py-0.5 rounded-full bg-indigo-500/20 text-indigo-300 border border-indigo-500/30">
                      🤖 AI निर्मित • हिंदी
                    </span>
                  </div>
                </div>
              </div>

              {/* Preview first 3 questions */}
              <div className="space-y-2 mb-5">
                <p className="text-white/40 text-xs font-medium mb-2">प्रश्नों की झलक:</p>
                {generatedQuiz.questions?.slice(0, 3).map((q, i) => (
                  <div key={i} className="glass rounded-xl border border-white/5 px-4 py-3">
                    <p className="text-white/70 text-sm leading-relaxed">
                      <span className="text-brand-400 font-medium mr-1">{i + 1}.</span>
                      {q.question}
                    </p>
                  </div>
                ))}
                {generatedQuiz.questions?.length > 3 && (
                  <p className="text-white/30 text-xs text-center pt-1">
                    + {generatedQuiz.questions.length - 3} और प्रश्न...
                  </p>
                )}
              </div>

              <Button onClick={handleUseQuiz} size="lg" className="w-full" icon={ArrowRight}>
                यह Quiz उपयोग करें — Room बनाएं
              </Button>
            </motion.div>
          )}
        </AnimatePresence>

      </motion.div>
    </div>
  );
}