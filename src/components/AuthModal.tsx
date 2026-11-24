'use client';

import React, { useState } from 'react';
import { X, Shield, Lock, Mail, User as UserIcon, ArrowRight, Loader2, Sparkles, CheckCircle2 } from 'lucide-react';
import { useAuth } from '@/lib/supabase/authContext';

interface AuthModalProps {
  isOpen: boolean;
  onClose: () => void;
  defaultTab?: 'signin' | 'signup';
}

export function AuthModal({ isOpen, onClose, defaultTab = 'signin' }: AuthModalProps) {
  const { signIn, signUp, signInWithGoogle, isConfigured } = useAuth();
  const [tab, setTab] = useState<'signin' | 'signup'>(defaultTab);
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [fullName, setFullName] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [successMsg, setSuccessMsg] = useState<string | null>(null);

  if (!isOpen) return null;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setIsLoading(true);

    if (tab === 'signin') {
      const { error: err } = await signIn(email, password);
      if (err) {
        setError(err);
        setIsLoading(false);
      } else {
        setSuccessMsg('Signed in successfully!');
        setTimeout(() => {
          setIsLoading(false);
          onClose();
        }, 800);
      }
    } else {
      const { error: err } = await signUp(email, password, fullName);
      if (err) {
        setError(err);
        setIsLoading(false);
      } else {
        setSuccessMsg(
          isConfigured
            ? 'Account created! Check your email to confirm registration.'
            : 'Welcome to Cyber Academy!'
        );
        setTimeout(() => {
          setIsLoading(false);
          onClose();
        }, 1200);
      }
    }
  };

  const handleDemoLogin = (role: 'student' | 'admin') => {
    const demoEmail = role === 'admin' ? 'admin@cyberacademy.org' : 'student@cyberacademy.org';
    signIn(demoEmail, 'cyber-pass-123');
    setSuccessMsg(`Logged in as Demo ${role.toUpperCase()}!`);
    setTimeout(() => {
      onClose();
    }, 800);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/85 backdrop-blur-sm animate-fade-in">
      <div className="bg-[#0E1524] border border-[#1F2937] rounded-2xl max-w-md w-full p-6 text-white shadow-2xl relative">
        <button
          onClick={onClose}
          className="absolute top-4 right-4 p-1 rounded-lg text-gray-400 hover:text-white hover:bg-gray-800 transition-colors"
        >
          <X className="w-5 h-5" />
        </button>

        {/* Modal Header */}
        <div className="flex items-center gap-3 mb-6">
          <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-emerald-500 to-cyan-600 flex items-center justify-center text-black font-black shadow-lg shadow-emerald-500/20">
            <Shield className="w-5 h-5 fill-current" />
          </div>
          <div>
            <h3 className="text-base font-bold text-white">Cyber Academy Portal</h3>
            <p className="text-xs text-gray-400">
              {tab === 'signin' ? 'Sign in to sync notes & progress' : 'Create your operative account'}
            </p>
          </div>
        </div>

        {/* Tab switch */}
        <div className="grid grid-cols-2 p-1 bg-black/50 rounded-xl border border-gray-800 mb-5">
          <button
            type="button"
            onClick={() => { setTab('signin'); setError(null); }}
            className={`py-1.5 text-xs font-semibold rounded-lg transition-all ${
              tab === 'signin'
                ? 'bg-emerald-500 text-black shadow'
                : 'text-gray-400 hover:text-white'
            }`}
          >
            Sign In
          </button>
          <button
            type="button"
            onClick={() => { setTab('signup'); setError(null); }}
            className={`py-1.5 text-xs font-semibold rounded-lg transition-all ${
              tab === 'signup'
                ? 'bg-emerald-500 text-black shadow'
                : 'text-gray-400 hover:text-white'
            }`}
          >
            Register
          </button>
        </div>

        {successMsg ? (
          <div className="py-8 flex flex-col items-center justify-center text-center">
            <CheckCircle2 className="w-12 h-12 text-emerald-400 mb-2 animate-bounce" />
            <h4 className="text-sm font-semibold text-white">{successMsg}</h4>
          </div>
        ) : (
          <>
            <form onSubmit={handleSubmit} className="space-y-3.5">
              {tab === 'signup' && (
                <div>
                  <label className="block text-[11px] font-mono text-gray-400 mb-1">Full Name</label>
                  <div className="relative">
                    <UserIcon className="w-4 h-4 absolute left-3 top-2.5 text-gray-500" />
                    <input
                      type="text"
                      required
                      placeholder="Alex Mercer"
                      value={fullName}
                      onChange={(e) => setFullName(e.target.value)}
                      className="w-full pl-9 pr-3 py-2 bg-[#090D16] border border-[#1F2937] rounded-xl text-xs text-white focus:outline-none focus:border-emerald-500 transition-colors"
                    />
                  </div>
                </div>
              )}

              <div>
                <label className="block text-[11px] font-mono text-gray-400 mb-1">Email Address</label>
                <div className="relative">
                  <Mail className="w-4 h-4 absolute left-3 top-2.5 text-gray-500" />
                  <input
                    type="email"
                    required
                    placeholder="operator@redteam.org"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    className="w-full pl-9 pr-3 py-2 bg-[#090D16] border border-[#1F2937] rounded-xl text-xs text-white focus:outline-none focus:border-emerald-500 transition-colors"
                  />
                </div>
              </div>

              <div>
                <label className="block text-[11px] font-mono text-gray-400 mb-1">Password</label>
                <div className="relative">
                  <Lock className="w-4 h-4 absolute left-3 top-2.5 text-gray-500" />
                  <input
                    type="password"
                    required
                    placeholder="••••••••••••"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    className="w-full pl-9 pr-3 py-2 bg-[#090D16] border border-[#1F2937] rounded-xl text-xs text-white focus:outline-none focus:border-emerald-500 transition-colors"
                  />
                </div>
              </div>

              {error && (
                <p className="text-xs text-red-400 bg-red-950/40 border border-red-900/50 p-2.5 rounded-xl">
                  {error}
                </p>
              )}

              <button
                type="submit"
                disabled={isLoading}
                className="w-full flex items-center justify-center gap-2 py-2.5 rounded-xl text-xs font-bold bg-emerald-500 hover:bg-emerald-400 text-black shadow-lg shadow-emerald-500/20 transition-all disabled:opacity-50 mt-2"
              >
                {isLoading ? (
                  <Loader2 className="w-4 h-4 animate-spin" />
                ) : (
                  <>
                    <span>{tab === 'signin' ? 'Sign In to LMS' : 'Create Account'}</span>
                    <ArrowRight className="w-3.5 h-3.5" />
                  </>
                )}
              </button>
            </form>

            {/* Google OAuth Button */}
            <div className="mt-4 pt-4 border-t border-gray-800">
              <button
                type="button"
                onClick={() => signInWithGoogle()}
                className="w-full flex items-center justify-center gap-2 py-2 px-4 rounded-xl text-xs font-semibold bg-[#111827] hover:bg-[#1A2337] border border-gray-700 text-gray-200 transition-colors"
              >
                <svg className="w-4 h-4" viewBox="0 0 24 24">
                  <path
                    fill="#4285F4"
                    d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"
                  />
                  <path
                    fill="#34A853"
                    d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"
                  />
                  <path
                    fill="#FBBC05"
                    d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.06H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.94l2.85-2.22.81-.63z"
                  />
                  <path
                    fill="#EA4335"
                    d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.06l3.66 2.84c.87-2.6 3.3-4.52 6.16-4.52z"
                  />
                </svg>
                <span>Continue with Google</span>
              </button>
            </div>

            {/* Quick Demo Mode Switches */}
            <div className="mt-4 p-3 bg-black/40 rounded-xl border border-gray-800 text-xs">
              <div className="flex items-center gap-1.5 text-gray-400 font-mono text-[10px] mb-2">
                <Sparkles className="w-3 h-3 text-cyan-400" />
                <span>Instant Demo Preview</span>
              </div>
              <div className="grid grid-cols-2 gap-2">
                <button
                  type="button"
                  onClick={() => handleDemoLogin('admin')}
                  className="px-2.5 py-1.5 rounded-lg bg-amber-500/10 border border-amber-500/30 text-amber-300 hover:bg-amber-500/20 text-[11px] font-mono transition-colors"
                >
                  ⚡ Demo Admin
                </button>
                <button
                  type="button"
                  onClick={() => handleDemoLogin('student')}
                  className="px-2.5 py-1.5 rounded-lg bg-cyan-500/10 border border-cyan-500/30 text-cyan-300 hover:bg-cyan-500/20 text-[11px] font-mono transition-colors"
                >
                  👤 Demo Student
                </button>
              </div>
            </div>
          </>
        )}
      </div>
    </div>
  );
}
