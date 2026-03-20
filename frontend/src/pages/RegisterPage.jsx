import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useDispatch, useSelector } from 'react-redux';
import { motion } from 'framer-motion';
import { Mail, Lock, User, Zap, ArrowRight, Eye, EyeOff } from 'lucide-react';
import { registerUser, clearError } from '../store/slices/authSlice.js';
import { registerSchema } from '../lib/validations.js';
import { Input, Button, Divider } from '../components/ui/index.jsx';
import toast from 'react-hot-toast';

export default function RegisterPage() {
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const { loading, error } = useSelector((s) => s.auth);

  const [form, setForm] = useState({ username: '', email: '', password: '', confirmPassword: '' });
  const [errors, setErrors] = useState({});
  const [showPass, setShowPass] = useState(false);

  const handleChange = (e) => {
    setForm((p) => ({ ...p, [e.target.name]: e.target.value }));
    if (errors[e.target.name]) setErrors((p) => ({ ...p, [e.target.name]: '' }));
    if (error) dispatch(clearError());
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    const result = registerSchema.safeParse(form);
    if (!result.success) {
      const fieldErrors = {};
      result.error.errors.forEach((e) => { fieldErrors[e.path[0]] = e.message; });
      setErrors(fieldErrors);
      return;
    }
    const action = await dispatch(registerUser({ username: form.username, email: form.email, password: form.password }));
    if (registerUser.fulfilled.match(action)) {
      toast.success('Account created! Welcome to QuizBattle 🎉');
      navigate('/dashboard');
    } else {
      toast.error(action.payload || 'Registration failed');
    }
  };

  return (
    <div className="page-bg min-h-screen flex items-center justify-center px-4 py-12">
      <div className="absolute top-1/3 right-1/4 w-80 h-80 bg-accent-500/10 rounded-full blur-3xl pointer-events-none" />
      <div className="absolute bottom-1/3 left-1/4 w-64 h-64 bg-brand-600/15 rounded-full blur-3xl pointer-events-none" />

      <motion.div
        initial={{ opacity: 0, y: 30 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
        className="w-full max-w-md relative"
      >
        <div className="text-center mb-8">
          <Link to="/" className="inline-flex items-center gap-2 mb-6">
            <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-brand-500 to-accent-500 flex items-center justify-center">
              <Zap size={20} className="text-white" />
            </div>
            <span className="font-display font-800 text-2xl gradient-text">QuizBattle</span>
          </Link>
          <h1 className="font-display font-800 text-3xl text-white">Create your account</h1>
          <p className="text-white/50 mt-2 text-sm">Join thousands of quiz champions</p>
        </div>

        <div className="glass rounded-2xl border border-white/10 p-8">
          <form onSubmit={handleSubmit} className="space-y-4">
            <Input
              label="Username"
              name="username"
              value={form.username}
              onChange={handleChange}
              placeholder="coolplayer123"
              icon={User}
              error={errors.username}
              required
            />
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
                  placeholder="Minimum 6 characters"
                  className={`input-base w-full rounded-xl px-4 py-3 pl-10 pr-12 text-sm ${errors.password ? 'border-danger-500/60' : ''}`}
                />
                <button type="button" onClick={() => setShowPass(!showPass)} className="absolute right-3 top-1/2 -translate-y-1/2 text-white/40 hover:text-white/70 transition-colors">
                  {showPass ? <EyeOff size={16} /> : <Eye size={16} />}
                </button>
              </div>
              {errors.password && <p className="text-xs text-danger-400">⚠ {errors.password}</p>}
            </div>

            <div className="flex flex-col gap-1.5">
              <label className="text-sm font-medium text-white/70">
                Confirm Password <span className="text-brand-400">*</span>
              </label>
              <div className="relative">
                <Lock size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-white/40" />
                <input
                  name="confirmPassword"
                  type={showPass ? 'text' : 'password'}
                  value={form.confirmPassword}
                  onChange={handleChange}
                  placeholder="Repeat password"
                  className={`input-base w-full rounded-xl px-4 py-3 pl-10 text-sm ${errors.confirmPassword ? 'border-danger-500/60' : ''}`}
                />
              </div>
              {errors.confirmPassword && <p className="text-xs text-danger-400">⚠ {errors.confirmPassword}</p>}
            </div>

            {error && (
              <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="glass rounded-xl border border-danger-500/30 px-4 py-3 text-danger-400 text-sm">
                ⚠ {error}
              </motion.div>
            )}

            <Button type="submit" loading={loading} className="w-full" size="lg" icon={ArrowRight}>
              Create Account
            </Button>
          </form>

          <Divider className="my-6" />

          <p className="text-center text-white/50 text-sm">
            Already have an account?{' '}
            <Link to="/login" className="text-brand-400 hover:text-brand-300 font-medium transition-colors">
              Sign in
            </Link>
          </p>
        </div>
      </motion.div>
    </div>
  );
}
