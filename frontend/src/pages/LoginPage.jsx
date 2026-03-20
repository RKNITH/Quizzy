import { useState } from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import { useDispatch, useSelector } from 'react-redux';
import { motion } from 'framer-motion';
import { Mail, Lock, Zap, ArrowRight, Eye, EyeOff } from 'lucide-react';
import { loginUser, clearError } from '../store/slices/authSlice.js';
import { loginSchema } from '../lib/validations.js';
import { Input, Button, Divider } from '../components/ui/index.jsx';
import toast from 'react-hot-toast';

export default function LoginPage() {
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const location = useLocation();
  const { loading, error } = useSelector((s) => s.auth);
  const from = location.state?.from?.pathname || '/dashboard';

  const [form, setForm] = useState({ email: '', password: '' });
  const [errors, setErrors] = useState({});
  const [showPass, setShowPass] = useState(false);

  const handleChange = (e) => {
    setForm((p) => ({ ...p, [e.target.name]: e.target.value }));
    if (errors[e.target.name]) setErrors((p) => ({ ...p, [e.target.name]: '' }));
    if (error) dispatch(clearError());
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    const result = loginSchema.safeParse(form);
    if (!result.success) {
      const fieldErrors = {};
      result.error.errors.forEach((e) => { fieldErrors[e.path[0]] = e.message; });
      setErrors(fieldErrors);
      return;
    }
    const action = await dispatch(loginUser(form));
    if (loginUser.fulfilled.match(action)) {
      toast.success('Welcome back! 🎉');
      navigate(from, { replace: true });
    } else {
      toast.error(action.payload || 'Login failed');
    }
  };

  return (
    <div className="page-bg min-h-screen flex items-center justify-center px-4 py-12">
      <div className="absolute top-1/4 left-1/3 w-80 h-80 bg-brand-600/15 rounded-full blur-3xl pointer-events-none" />
      <div className="absolute bottom-1/4 right-1/3 w-60 h-60 bg-accent-500/10 rounded-full blur-3xl pointer-events-none" />

      <motion.div
        initial={{ opacity: 0, y: 30 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
        className="w-full max-w-md relative"
      >
        {/* Logo */}
        <div className="text-center mb-8">
          <Link to="/" className="inline-flex items-center gap-2 mb-6">
            <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-brand-500 to-accent-500 flex items-center justify-center shadow-lg">
              <Zap size={20} className="text-white" />
            </div>
            <span className="font-display font-800 text-2xl gradient-text">QuizBattle</span>
          </Link>
          <h1 className="font-display font-800 text-3xl text-white">Welcome back</h1>
          <p className="text-white/50 mt-2 text-sm">Sign in to continue your battle</p>
        </div>

        <div className="glass rounded-2xl border border-white/10 p-8">
          <form onSubmit={handleSubmit} className="space-y-5">
            <Input
              label="Email address"
              name="email"
              type="email"
              value={form.email}
              onChange={handleChange}
              placeholder="you@example.com"
              icon={Mail}
              error={errors.email}
              required
            />

            <div className="flex flex-col gap-1.5">
              <label className="text-sm font-medium text-white/70">
                Password <span className="text-brand-400">*</span>
              </label>
              <div className="relative">
                <Lock size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-white/40" />
                <input
                  name="password"
                  type={showPass ? 'text' : 'password'}
                  value={form.password}
                  onChange={handleChange}
                  placeholder="Your password"
                  className={`input-base w-full rounded-xl px-4 py-3 pl-10 pr-12 text-sm ${errors.password ? 'border-danger-500/60' : ''}`}
                />
                <button
                  type="button"
                  onClick={() => setShowPass(!showPass)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-white/40 hover:text-white/70 transition-colors"
                >
                  {showPass ? <EyeOff size={16} /> : <Eye size={16} />}
                </button>
              </div>
              {errors.password && (
                <motion.p initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="text-xs text-danger-400">
                  ⚠ {errors.password}
                </motion.p>
              )}
            </div>

            {error && (
              <motion.div
                initial={{ opacity: 0, scale: 0.95 }}
                animate={{ opacity: 1, scale: 1 }}
                className="glass rounded-xl border border-danger-500/30 px-4 py-3 text-danger-400 text-sm"
              >
                ⚠ {error}
              </motion.div>
            )}

            <Button type="submit" loading={loading} className="w-full" size="lg" icon={ArrowRight}>
              Sign In
            </Button>
          </form>

          <Divider label="or" className="my-6" />

          {/* Demo credentials */}
          <div className="glass rounded-xl border border-gold-500/20 p-4 mb-4">
            <p className="text-xs text-gold-400 font-medium mb-2">🎮 Demo Account</p>
            <p className="text-xs text-white/50">Email: <span className="text-white/70">demo@quizbattle.com</span></p>
            <p className="text-xs text-white/50">Password: <span className="text-white/70">demo1234</span></p>
          </div>

          <p className="text-center text-white/50 text-sm">
            Don't have an account?{' '}
            <Link to="/register" className="text-brand-400 hover:text-brand-300 font-medium transition-colors">
              Create one free
            </Link>
          </p>
        </div>
      </motion.div>
    </div>
  );
}
