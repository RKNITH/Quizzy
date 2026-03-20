import { Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import { Zap, Trophy, Brain, Users, ArrowRight, Star, Shield } from 'lucide-react';
import { useSelector } from 'react-redux';

const features = [
  { icon: '⚡', title: 'Real-Time Battles', desc: 'Compete live with players worldwide in head-to-head quiz showdowns' },
  { icon: '🤖', title: 'AI-Powered Quizzes', desc: 'Generate custom quizzes on any topic using advanced AI in seconds' },
  { icon: '🏆', title: 'Live Leaderboards', desc: 'Watch rankings update in real-time as every point is scored' },
  { icon: '⏱️', title: 'Timer Pressure', desc: 'Race against the clock — faster answers mean bigger rewards' },
  { icon: '🎯', title: 'Power-Ups', desc: 'Use skip and double-score power-ups to gain a strategic edge' },
  { icon: '📊', title: 'Deep Analytics', desc: 'Track your progress, win rate, and performance across categories' },
];

const stats = [
  { value: '50K+', label: 'Active Players' },
  { value: '10K+', label: 'Quiz Questions' },
  { value: '1M+', label: 'Games Played' },
  { value: '99.9%', label: 'Uptime' },
];

const container = { hidden: {}, show: { transition: { staggerChildren: 0.1 } } };
const item = { hidden: { opacity: 0, y: 30 }, show: { opacity: 1, y: 0, transition: { duration: 0.5 } } };

export default function LandingPage() {
  const { isAuthenticated } = useSelector((s) => s.auth);

  return (
    <div className="page-bg min-h-screen">
      {/* Navbar */}
      <nav className="fixed top-0 left-0 right-0 z-50 glass-heavy border-b border-white/10">
        <div className="max-w-7xl mx-auto px-6 h-16 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-brand-500 to-accent-500 flex items-center justify-center">
              <Zap size={16} className="text-white" />
            </div>
            <span className="font-display font-800 text-lg gradient-text">QuizBattle</span>
          </div>
          <div className="flex items-center gap-3">
            {isAuthenticated ? (
              <Link to="/dashboard" className="btn-primary px-5 py-2.5 rounded-xl text-sm inline-flex items-center gap-2">
                Dashboard <ArrowRight size={14} />
              </Link>
            ) : (
              <>
                <Link to="/login" className="btn-ghost px-4 py-2 rounded-xl text-sm">Sign In</Link>
                <Link to="/register" className="btn-primary px-5 py-2.5 rounded-xl text-sm inline-flex items-center gap-2">
                  Get Started <ArrowRight size={14} />
                </Link>
              </>
            )}
          </div>
        </div>
      </nav>

      {/* Hero */}
      <section className="pt-32 pb-20 px-6 relative overflow-hidden">
        {/* BG orbs */}
        <div className="absolute top-20 left-1/4 w-96 h-96 bg-brand-600/20 rounded-full blur-3xl pointer-events-none" />
        <div className="absolute top-40 right-1/4 w-64 h-64 bg-accent-500/15 rounded-full blur-3xl pointer-events-none" />

        <div className="max-w-5xl mx-auto text-center relative">
          <motion.div
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ duration: 0.5 }}
            className="inline-flex items-center gap-2 glass px-4 py-2 rounded-full border border-brand-500/30 mb-8"
          >
            <Star size={12} className="text-gold-400 fill-gold-400" />
            <span className="text-sm text-white/70">The #1 Real-Time Quiz Platform</span>
            <Star size={12} className="text-gold-400 fill-gold-400" />
          </motion.div>

          <motion.h1
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.1 }}
            className="font-display font-800 text-5xl sm:text-7xl leading-none mb-6"
          >
            Battle Brains.
            <br />
            <span className="gradient-text">Win Glory.</span>
          </motion.h1>

          <motion.p
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.2 }}
            className="text-white/60 text-lg sm:text-xl max-w-2xl mx-auto mb-10 leading-relaxed"
          >
            Real-time multiplayer quiz battles powered by AI. Create rooms, challenge friends,
            and race the clock across Math, Science, Coding, and more.
          </motion.p>

          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.3 }}
            className="flex flex-col sm:flex-row gap-4 justify-center"
          >
            <Link
              to={isAuthenticated ? '/dashboard' : '/register'}
              className="btn-primary px-8 py-4 rounded-2xl text-base inline-flex items-center gap-2 justify-center"
            >
              <Zap size={18} />
              Start Playing Free
              <ArrowRight size={16} />
            </Link>
            <Link
              to="/login"
              className="btn-ghost px-8 py-4 rounded-2xl text-base inline-flex items-center gap-2 justify-center"
            >
              Sign In
            </Link>
          </motion.div>
        </div>
      </section>

      {/* Stats */}
      <section className="py-12 border-y border-white/5">
        <div className="max-w-5xl mx-auto px-6">
          <motion.div
            variants={container}
            initial="hidden"
            whileInView="show"
            viewport={{ once: true }}
            className="grid grid-cols-2 md:grid-cols-4 gap-6"
          >
            {stats.map((s) => (
              <motion.div key={s.label} variants={item} className="text-center">
                <div className="font-display font-800 text-3xl sm:text-4xl gradient-text">{s.value}</div>
                <div className="text-white/50 text-sm mt-1">{s.label}</div>
              </motion.div>
            ))}
          </motion.div>
        </div>
      </section>

      {/* Features */}
      <section className="py-20 px-6">
        <div className="max-w-6xl mx-auto">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            className="text-center mb-14"
          >
            <h2 className="font-display font-800 text-4xl mb-4">Everything You Need to <span className="gradient-text">Dominate</span></h2>
            <p className="text-white/50 max-w-xl mx-auto">Built for competitive minds who want to learn, challenge, and win.</p>
          </motion.div>

          <motion.div
            variants={container}
            initial="hidden"
            whileInView="show"
            viewport={{ once: true }}
            className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5"
          >
            {features.map((f) => (
              <motion.div
                key={f.title}
                variants={item}
                className="glass rounded-2xl border border-white/8 p-6 card-hover"
              >
                <div className="text-3xl mb-4">{f.icon}</div>
                <h3 className="font-display font-700 text-lg text-white mb-2">{f.title}</h3>
                <p className="text-white/50 text-sm leading-relaxed">{f.desc}</p>
              </motion.div>
            ))}
          </motion.div>
        </div>
      </section>

      {/* CTA */}
      <section className="py-20 px-6">
        <div className="max-w-3xl mx-auto text-center">
          <motion.div
            initial={{ opacity: 0, scale: 0.95 }}
            whileInView={{ opacity: 1, scale: 1 }}
            viewport={{ once: true }}
            className="glass rounded-3xl border border-brand-500/30 p-10 relative overflow-hidden"
            style={{ boxShadow: '0 0 60px rgba(139,92,246,0.15)' }}
          >
            <div className="absolute inset-0 bg-gradient-to-br from-brand-600/10 to-accent-500/10 pointer-events-none" />
            <div className="relative">
              <Shield className="mx-auto text-brand-400 mb-4" size={40} />
              <h2 className="font-display font-800 text-3xl sm:text-4xl mb-4">
                Ready to <span className="gradient-text">Battle?</span>
              </h2>
              <p className="text-white/60 mb-8">Join thousands of players. No credit card needed.</p>
              <Link
                to="/register"
                className="btn-primary px-10 py-4 rounded-2xl text-base inline-flex items-center gap-2"
              >
                Create Free Account <ArrowRight size={16} />
              </Link>
            </div>
          </motion.div>
        </div>
      </section>

      {/* Footer */}
      <footer className="border-t border-white/5 py-8 px-6 text-center">
        <div className="flex items-center justify-center gap-2 mb-3">
          <Zap size={14} className="text-brand-400" />
          <span className="font-display font-700 text-sm gradient-text">QuizBattle</span>
        </div>
        <p className="text-white/30 text-xs">© 2026 QuizBattle. Built with ⚡ for competitive minds.</p>
      </footer>
    </div>
  );
}
