import { Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import { Home, ArrowLeft } from 'lucide-react';

export default function NotFoundPage() {
  return (
    <div className="page-bg min-h-screen flex items-center justify-center px-4">
      <motion.div
        initial={{ opacity: 0, scale: 0.9 }}
        animate={{ opacity: 1, scale: 1 }}
        transition={{ duration: 0.4 }}
        className="text-center max-w-md"
      >
        <div className="text-8xl mb-6 animate-float">🌀</div>
        <h1 className="font-display font-800 text-6xl gradient-text mb-4">404</h1>
        <h2 className="font-display font-700 text-2xl text-white mb-3">Page Not Found</h2>
        <p className="text-white/50 mb-8 leading-relaxed">
          Looks like you wandered into the void. This page doesn't exist in our dimension.
        </p>
        <div className="flex flex-col sm:flex-row gap-3 justify-center">
          <Link to="/" className="btn-primary px-6 py-3 rounded-xl inline-flex items-center gap-2">
            <Home size={16} />
            Go Home
          </Link>
          <button onClick={() => window.history.back()} className="btn-ghost px-6 py-3 rounded-xl inline-flex items-center gap-2">
            <ArrowLeft size={16} />
            Go Back
          </button>
        </div>
      </motion.div>
    </div>
  );
}
