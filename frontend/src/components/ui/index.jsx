import { motion } from 'framer-motion';
import { Loader2 } from 'lucide-react';

// ── Button ────────────────────────────────────────────────────────────────────
export function Button({
  children, onClick, type = 'button', variant = 'primary',
  size = 'md', disabled = false, loading = false, className = '', icon: Icon,
}) {
  const sizes = { sm: 'px-4 py-2 text-sm', md: 'px-6 py-3 text-sm', lg: 'px-8 py-4 text-base' };
  const base = `inline-flex items-center justify-center gap-2 rounded-xl font-display font-600 transition-all duration-200 ${sizes[size]} ${className}`;
  const variants = {
    primary: 'btn-primary',
    ghost: 'btn-ghost',
    danger: 'bg-danger-500/20 border border-danger-500/40 text-danger-400 hover:bg-danger-500/30 cursor-pointer',
    success: 'bg-success-500/20 border border-success-500/40 text-success-400 hover:bg-success-500/30 cursor-pointer',
    gold: 'bg-gradient-to-r from-gold-500 to-gold-400 text-surface-900 hover:shadow-glow-gold font-700 cursor-pointer',
  };

  return (
    <button
      type={type}
      onClick={onClick}
      disabled={disabled || loading}
      className={`${base} ${variants[variant]}`}
    >
      {loading ? <Loader2 size={16} className="animate-spin" /> : Icon ? <Icon size={16} /> : null}
      {children}
    </button>
  );
}

// ── Input ─────────────────────────────────────────────────────────────────────
export function Input({
  label, name, type = 'text', value, onChange, placeholder,
  error, required = false, icon: Icon, className = '', ...props
}) {
  return (
    <div className={`flex flex-col gap-1.5 ${className}`}>
      {label && (
        <label htmlFor={name} className="text-sm font-medium text-white/70">
          {label} {required && <span className="text-brand-400">*</span>}
        </label>
      )}
      <div className="relative">
        {Icon && (
          <div className="absolute left-3 top-1/2 -translate-y-1/2 text-white/40">
            <Icon size={16} />
          </div>
        )}
        <input
          id={name}
          name={name}
          type={type}
          value={value}
          onChange={onChange}
          placeholder={placeholder}
          className={`input-base w-full rounded-xl px-4 py-3 text-sm ${Icon ? 'pl-10' : ''} ${
            error ? 'border-danger-500/60 focus:border-danger-500' : ''
          }`}
          {...props}
        />
      </div>
      {error && (
        <motion.p
          initial={{ opacity: 0, y: -4 }}
          animate={{ opacity: 1, y: 0 }}
          className="text-xs text-danger-400 flex items-center gap-1"
        >
          ⚠ {error}
        </motion.p>
      )}
    </div>
  );
}

// ── Select ────────────────────────────────────────────────────────────────────
export function Select({ label, name, value, onChange, options, error, className = '' }) {
  return (
    <div className={`flex flex-col gap-1.5 ${className}`}>
      {label && <label htmlFor={name} className="text-sm font-medium text-white/70">{label}</label>}
      <select
        id={name}
        name={name}
        value={value}
        onChange={onChange}
        className="input-base w-full rounded-xl px-4 py-3 text-sm appearance-none cursor-pointer"
        style={{ backgroundImage: `url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='12' height='12' viewBox='0 0 24 24' fill='none' stroke='rgba(255,255,255,0.4)' stroke-width='2'%3E%3Cpath d='m6 9 6 6 6-6'/%3E%3C/svg%3E")`, backgroundRepeat: 'no-repeat', backgroundPosition: 'right 14px center' }}
      >
        {options.map((opt) => (
          <option key={opt.value} value={opt.value} style={{ background: '#1a1030' }}>
            {opt.label}
          </option>
        ))}
      </select>
      {error && <p className="text-xs text-danger-400">⚠ {error}</p>}
    </div>
  );
}

// ── Card ──────────────────────────────────────────────────────────────────────
export function Card({ children, className = '', hover = false, glow = false }) {
  return (
    <div
      className={`glass rounded-2xl border border-white/8 ${hover ? 'card-hover cursor-pointer' : ''} ${
        glow ? 'animate-pulse-glow' : ''
      } ${className}`}
    >
      {children}
    </div>
  );
}

// ── Badge ─────────────────────────────────────────────────────────────────────
export function Badge({ children, color = 'brand', className = '' }) {
  const colors = {
    brand: 'bg-brand-500/20 text-brand-300 border-brand-500/30',
    gold: 'bg-gold-500/20 text-gold-300 border-gold-500/30',
    success: 'bg-success-500/20 text-success-300 border-success-500/30',
    danger: 'bg-danger-500/20 text-danger-300 border-danger-500/30',
    gray: 'bg-white/10 text-white/60 border-white/10',
    easy: 'bg-emerald-500/20 text-emerald-300 border-emerald-500/30',
    medium: 'bg-amber-500/20 text-amber-300 border-amber-500/30',
    hard: 'bg-rose-500/20 text-rose-300 border-rose-500/30',
  };
  return (
    <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium border ${colors[color] || colors.brand} ${className}`}>
      {children}
    </span>
  );
}

// ── Spinner ───────────────────────────────────────────────────────────────────
export function Spinner({ size = 24, className = '' }) {
  return <Loader2 size={size} className={`animate-spin text-brand-400 ${className}`} />;
}

// ── PageLoader ────────────────────────────────────────────────────────────────
export function PageLoader() {
  return (
    <div className="flex flex-col items-center justify-center min-h-[60vh] gap-4">
      <div className="relative">
        <div className="w-16 h-16 rounded-2xl bg-gradient-to-br from-brand-500 to-accent-500 flex items-center justify-center animate-pulse">
          <span className="text-2xl">⚡</span>
        </div>
      </div>
      <p className="text-white/50 text-sm font-medium">Loading...</p>
    </div>
  );
}

// ── EmptyState ────────────────────────────────────────────────────────────────
export function EmptyState({ icon = '📭', title, description, action }) {
  return (
    <div className="flex flex-col items-center justify-center py-16 gap-4 text-center">
      <span className="text-5xl">{icon}</span>
      <div>
        <h3 className="font-display font-700 text-lg text-white/80">{title}</h3>
        {description && <p className="text-white/50 text-sm mt-1 max-w-xs mx-auto">{description}</p>}
      </div>
      {action}
    </div>
  );
}

// ── ProgressBar ───────────────────────────────────────────────────────────────
export function ProgressBar({ value, max, color = '#8b5cf6', className = '' }) {
  const pct = Math.min(100, Math.max(0, (value / max) * 100));
  return (
    <div className={`h-2 bg-white/10 rounded-full overflow-hidden ${className}`}>
      <motion.div
        className="h-full rounded-full"
        style={{ background: color }}
        initial={{ width: 0 }}
        animate={{ width: `${pct}%` }}
        transition={{ duration: 0.5, ease: 'easeOut' }}
      />
    </div>
  );
}

// ── Divider ───────────────────────────────────────────────────────────────────
export function Divider({ label }) {
  return (
    <div className="flex items-center gap-3">
      <div className="flex-1 h-px bg-white/10" />
      {label && <span className="text-xs text-white/30 font-medium px-2">{label}</span>}
      <div className="flex-1 h-px bg-white/10" />
    </div>
  );
}

// ── StatsCard ─────────────────────────────────────────────────────────────────
export function StatsCard({ icon, label, value, sub, color = 'brand' }) {
  const colors = {
    brand: 'from-brand-600/20 to-brand-800/20 border-brand-500/20',
    gold: 'from-gold-500/20 to-amber-800/20 border-gold-500/20',
    success: 'from-success-500/20 to-emerald-800/20 border-success-500/20',
    accent: 'from-accent-500/20 to-pink-800/20 border-accent-500/20',
  };
  return (
    <div className={`glass rounded-2xl p-5 bg-gradient-to-br border ${colors[color]}`}>
      <div className="flex items-start justify-between">
        <div>
          <p className="text-white/50 text-xs font-medium uppercase tracking-wider mb-1">{label}</p>
          <p className="font-display font-800 text-2xl text-white">{value}</p>
          {sub && <p className="text-white/40 text-xs mt-1">{sub}</p>}
        </div>
        <div className="text-2xl">{icon}</div>
      </div>
    </div>
  );
}
