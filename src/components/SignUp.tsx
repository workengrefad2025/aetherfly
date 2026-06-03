import React, { useState } from 'react';
import { User, Mail, Lock, Award } from 'lucide-react';
import { validateEmail, validateFullName, validatePassword } from '../lib/validators';

interface SignUpProps {
  onSignUp: (payload: { fullName: string; email: string; password: string; tier: string }) => Promise<void>;
  onSwitchToSignIn: () => void;
  lang: 'en' | 'ar';
}

export default function SignUp({ onSignUp, onSwitchToSignIn, lang }: SignUpProps) {
  const [fullName, setFullName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [tier, setTier] = useState('Platinum');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleSubmit = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    const fullNameError = validateFullName(fullName);
    const emailError = validateEmail(email);
    const passwordError = validatePassword(password);

    if (fullNameError || emailError || passwordError) {
      setError(fullNameError || emailError || passwordError);
      return;
    }

    setError(null);
    setLoading(true);
    try {
      await onSignUp({ fullName, email, password, tier });
    } catch (err) {
      setError((err as Error).message || 'Unable to register. Please try again.');
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
            {lang === 'en' ? 'Create Your AetherFly Account' : 'إنشاء حساب إيثر فلاي'}
          </h2>
          <p className="text-xs text-slate-400">
            {lang === 'en'
              ? 'Secure your luxury travel profile with Supabase authentication, email recovery, and instant booking persistence.'
              : 'أنشئ حسابك الآن لتفعيل الحجز وتتبع تذاكر السفر بطريقة آمنة.'}
          </p>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4 text-xs font-semibold text-slate-600 dark:text-slate-350">
          <div className="space-y-1.5">
            <label className="text-slate-500 uppercase tracking-wide block">{lang === 'en' ? 'Full Name' : 'الاسم الكامل'}</label>
            <div className="relative">
              <input
                type="text"
                value={fullName}
                onChange={(event) => setFullName(event.target.value)}
                placeholder="Juan Perez"
                className="w-full pl-10 pr-4 py-3 bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 focus:border-[#D4A24C] focus:outline-none rounded-xl text-sm transition-all"
              />
              <User size={15} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400" />
            </div>
          </div>

          <div className="space-y-1.5">
            <label className="text-slate-500 uppercase tracking-wide block">{lang === 'en' ? 'Email Address' : 'البريد الإلكتروني'}</label>
            <div className="relative">
              <input
                type="email"
                value={email}
                onChange={(event) => setEmail(event.target.value)}
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
                onChange={(event) => setPassword(event.target.value)}
                placeholder="••••••••"
                className="w-full pl-10 pr-4 py-3 bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 focus:border-[#D4A24C] focus:outline-none rounded-xl text-sm transition-all"
              />
              <Lock size={15} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400" />
            </div>
          </div>

          <div className="space-y-1.5">
            <label className="text-slate-500 uppercase tracking-wide block">{lang === 'en' ? 'Membership Tier' : 'فئة العضوية'}</label>
            <select
              value={tier}
              onChange={(event) => setTier(event.target.value)}
              className="w-full px-4 py-3 bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 focus:border-[#D4A24C] focus:outline-none rounded-xl text-sm transition-all cursor-pointer text-slate-800 dark:text-slate-200"
            >
              <option value="Bronze">Bronze (Standard Member)</option>
              <option value="Silver">Silver Suite Club</option>
              <option value="Gold">Gold Jetsetter Class</option>
              <option value="Platinum">Platinum Royal Elite</option>
            </select>
          </div>

          {error && <div className="text-rose-500 text-xs font-bold">{error}</div>}

          <button
            type="submit"
            disabled={loading}
            className="w-full py-3.5 bg-gradient-to-r from-[#E0B15A] to-[#D4A24C] text-[#1E293B] font-extrabold rounded-xl shadow-lg transition-transform duration-200 hover:-translate-y-0.5 cursor-pointer text-sm text-center disabled:opacity-60"
          >
            {loading ? (lang === 'en' ? 'Creating Account...' : 'جارٍ إنشاء الحساب...') : (lang === 'en' ? 'Create Account' : 'إنشاء الحساب')}
          </button>

          <div className="text-center text-[11px] text-slate-500 dark:text-slate-400">
            {lang === 'en' ? 'Already have an account?' : 'لديك حساب مسبقًا؟'}{' '}
            <button type="button" onClick={onSwitchToSignIn} className="font-bold text-[#D4A24C] hover:underline">
              {lang === 'en' ? 'Sign In' : 'تسجيل الدخول'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
