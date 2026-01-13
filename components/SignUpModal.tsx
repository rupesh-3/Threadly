import React, { useState } from 'react';
import { X, Mail, Lock, User, UserPlus } from 'lucide-react';

interface SignUpModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSignUp: (email: string, password: string, name: string) => Promise<boolean>;
  onSwitchToLogin: () => void;
}

const SignUpModal: React.FC<SignUpModalProps> = ({ isOpen, onClose, onSignUp, onSwitchToLogin }) => {
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  if (!isOpen) return null;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');

    if (password.length < 6) {
      setError('Password must be at least 6 characters');
      return;
    }

    if (password !== confirmPassword) {
      setError('Passwords do not match');
      return;
    }

    setLoading(true);

    try {
      const success = await onSignUp(email.trim(), password, name.trim());
      if (success) {
        setName('');
        setEmail('');
        setPassword('');
        setConfirmPassword('');
        onClose();
      } else {
        setError('Email already exists. Please sign in instead.');
      }
    } catch (err) {
      setError('Sign up failed. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm">
      <div className="bg-[#0f172a] border border-white/10 rounded-2xl w-full max-w-md p-8 relative animate-slide-up">
        <button
          onClick={onClose}
          className="absolute top-4 right-4 text-slate-500 hover:text-white transition-colors p-2 rounded-lg hover:bg-white/5"
          aria-label="Close sign up modal"
        >
          <X size={20} />
        </button>

        <div className="mb-6">
          <h2 className="text-2xl font-display font-bold text-white mb-2">Create Account</h2>
          <p className="text-slate-400 text-sm">Join Threadly and start analyzing conversations</p>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4">
          {error && (
            <div className="p-3 bg-red-950/30 border border-red-900/50 text-red-400 rounded-lg text-sm">
              {error}
            </div>
          )}

          <div>
            <label htmlFor="signup-name" className="text-xs font-bold uppercase tracking-widest text-slate-500 block mb-2">
              Full Name
            </label>
            <div className="relative">
              <User size={18} className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-500" />
              <input
                id="signup-name"
                type="text"
                value={name}
                onChange={(e) => setName(e.target.value)}
                placeholder="John Doe"
                required
                autoComplete="name"
                className="w-full pl-10 pr-4 py-3 rounded-xl bg-[#020617] border border-white/10 text-white placeholder:text-slate-700 focus:border-white/30 focus:ring-2 focus:ring-white/20 focus:outline-none transition-all"
              />
            </div>
          </div>

          <div>
            <label htmlFor="signup-email" className="text-xs font-bold uppercase tracking-widest text-slate-500 block mb-2">
              Email Address
            </label>
            <div className="relative">
              <Mail size={18} className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-500" />
              <input
                id="signup-email"
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="your@email.com"
                required
                autoComplete="email"
                className="w-full pl-10 pr-4 py-3 rounded-xl bg-[#020617] border border-white/10 text-white placeholder:text-slate-700 focus:border-white/30 focus:ring-2 focus:ring-white/20 focus:outline-none transition-all"
              />
            </div>
          </div>

          <div>
            <label htmlFor="signup-password" className="text-xs font-bold uppercase tracking-widest text-slate-500 block mb-2">
              Password
            </label>
            <div className="relative">
              <Lock size={18} className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-500" />
              <input
                id="signup-password"
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="At least 6 characters"
                required
                minLength={6}
                autoComplete="new-password"
                className="w-full pl-10 pr-4 py-3 rounded-xl bg-[#020617] border border-white/10 text-white placeholder:text-slate-700 focus:border-white/30 focus:ring-2 focus:ring-white/20 focus:outline-none transition-all"
              />
            </div>
          </div>

          <div>
            <label htmlFor="signup-confirm-password" className="text-xs font-bold uppercase tracking-widest text-slate-500 block mb-2">
              Confirm Password
            </label>
            <div className="relative">
              <Lock size={18} className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-500" />
              <input
                id="signup-confirm-password"
                type="password"
                value={confirmPassword}
                onChange={(e) => setConfirmPassword(e.target.value)}
                placeholder="Confirm your password"
                required
                minLength={6}
                autoComplete="new-password"
                className="w-full pl-10 pr-4 py-3 rounded-xl bg-[#020617] border border-white/10 text-white placeholder:text-slate-700 focus:border-white/30 focus:ring-2 focus:ring-white/20 focus:outline-none transition-all"
              />
            </div>
          </div>

          <button
            type="submit"
            disabled={loading || !name.trim() || !email.trim() || !password || !confirmPassword}
            className={`w-full py-3 rounded-xl font-display font-bold text-lg tracking-wide transition-all duration-200 flex items-center justify-center gap-3 ${
              loading || !name.trim() || !email.trim() || !password || !confirmPassword
                ? 'bg-slate-800 text-slate-600 cursor-not-allowed'
                : 'bg-white text-black hover:bg-slate-200'
            }`}
          >
            {loading ? (
              <>
                <div className="w-4 h-4 border-2 border-slate-400 border-t-black rounded-full animate-spin"></div>
                <span>Creating account...</span>
              </>
            ) : (
              <>
                <UserPlus size={20} />
                <span>Sign Up</span>
              </>
            )}
          </button>
        </form>

        <div className="mt-6 text-center">
          <p className="text-slate-500 text-sm">
            Already have an account?{' '}
            <button
              onClick={onSwitchToLogin}
              className="text-white hover:text-blue-400 underline font-semibold transition-colors"
            >
              Sign in
            </button>
          </p>
        </div>
      </div>
    </div>
  );
};

export default SignUpModal;

