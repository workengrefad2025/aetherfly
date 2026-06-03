import React, { useState } from 'react';
import { Mail, Lock, Award } from 'lucide-react';
import { validateEmail, validatePassword } from '../lib/validators';

interface SignInProps {
  onSignIn: (email: string, password: string) => Promise<void>;
  onSwitchToSignUp: () => void;
  lang: 'en' | 'ar';
  authError?: string | null;
}

export default function SignIn({ onSignIn, onSwitchToSignUp, lang, authError }: SignInProps) {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [localError, setLocalError] = useState<string | null>(null);

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    const emailError = validateEmail(email);
    const passwordError = validatePassword(password);
    if (emailError || passwordError) {
      setLocalError(emailError || passwordError);
      return;
    }

    setLocalError(null);
    setLoading(true);
    try {
      await onSignIn(email, password);
    } catch (err) {
      setLocalError((err as Error)?.message || 'Invalid credentials, please try again.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="max-w-md mx-auto px-4 py-16 space-y-8">
      <div className="bg-white dark:bg-slate-900 border border-amber-900/10 dark:border-amber-100/10 p-8 rounded-3xl shadow-2xl space-y-6">
        <div className="text-center space-y-2">
          <div className="inline-flex items-center justify-center p-3 bg-amber-500/10 text-[#D4A24C] rounded-full">
            <Award size={28} />
          </div>
          <h2 className="font-serif text-2xl font-bold text-slate-900 dark:text-slate-50">
            {lang === 'en' ? 'AetherFly Member Sign In' : 'تسجيل دخول أعضاء إيثر فلاي'}
          </h2>
          <p className="text-xs text-slate-400">
            {lang === 'en'
              ? 'Secure authentication with Supabase and premium booking persistence.'
              : 'تسجيل الدخول الآمن مع Supabase وحفظ الحجز الفاخر.'}
          </p>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4 text-xs font-semibold text-slate-600 dark:text-slate-350">
          <div className="space-y-1.5">
            <label className="text-slate-500 uppercase tracking-wide block">{lang === 'en' ? 'Email Address' : 'البريد الإلكتروني'}</label>
            <div className="relative">
              <input
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="juan.perez@example.com"
                className="w-full pl-10 pr-4 py-3 bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 focus:border-[#D4A24C] focus:outline-none rounded-xl text-sm transition-all"
              />
              <Mail size={15} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400" />
            </div>
          </div>

          <div className="space-y-1.5">
            <label className="text-slate-500 uppercase tracking-wide block">{lang === 'en' ? 'Password' : 'كلمة المرور'}</label>
            <div className="relative">
              <input
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="••••••••"
                className="w-full pl-10 pr-4 py-3 bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 focus:border-[#D4A24C] focus:outline-none rounded-xl text-sm transition-all"
              />
              <Lock size={15} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400" />
            </div>
          </div>

          {(localError || authError) && (
            <div className="text-rose-500 text-xs font-bold">{localError || authError}</div>
          )}

          <button
            type="submit"
            disabled={loading}
            className="w-full py-3.5 bg-gradient-to-r from-[#E0B15A] to-[#D4A24C] text-[#1E293B] font-extrabold rounded-xl shadow-lg transition-transform duration-200 hover:-translate-y-0.5 cursor-pointer text-sm text-center disabled:opacity-60"
          >
            {loading ? (lang === 'en' ? 'Signing In...' : 'جاري تسجيل الدخول...') : (lang === 'en' ? 'Sign In Securely' : 'تسجيل الدخول الآمن')}
          </button>

          <div className="text-center text-[11px] text-slate-500 dark:text-slate-400">
            {lang === 'en' ? 'New to AetherFly?' : 'جديد على إيثر فلاي؟'}{' '}
            <button type="button" onClick={onSwitchToSignUp} className="font-bold text-[#D4A24C] hover:underline">
              {lang === 'en' ? 'Create an Account' : 'إنشاء حساب'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
