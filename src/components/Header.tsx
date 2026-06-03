import React, { memo } from 'react';
import { Plane, Languages, Moon, Sun, User, LogOut } from 'lucide-react';

interface HeaderProps {
  currentView: string;
  onNavigate: (view: string) => void;
  lang: 'en' | 'ar';
  setLang: (lang: 'en' | 'ar') => void;
  theme: 'light' | 'dark';
  setTheme: (theme: 'light' | 'dark') => void;
  user: any;
  onLogOut: () => void;
}

function Header({
  currentView,
  onNavigate,
  lang,
  setLang,
  theme,
  setTheme,
  user,
  onLogOut
}: HeaderProps) {
  const toggleTheme = () => {
    const nextTheme = theme === 'light' ? 'dark' : 'light';
    setTheme(nextTheme);
    if (nextTheme === 'dark') {
      document.body.classList.add('dark');
    } else {
      document.body.classList.remove('dark');
    }
  };

  const navs = [
    { label: { en: 'Home', ar: 'الرئيسية' }, view: 'home' },
    { label: { en: 'Flights', ar: 'الرحلات' }, view: 'results' },
    { label: { en: 'Offers', ar: 'العروض الحصرية' }, view: 'offers' },
    { label: { en: 'Dashboard', ar: 'لوحة التحكم' }, view: 'dashboard' },
    { label: { en: 'Support', ar: 'الدعم الفوري' }, view: 'support' },
    { label: { en: 'Experience', ar: 'خبرتنا الفاخرة' }, view: 'about' }
  ];

  return (
    <header className="sticky top-0 z-50 bg-[#fdfdfc]/95 dark:bg-[#121211]/95 backdrop-blur-md border-b border-[#ecece8] dark:border-[#2a2a28] transition-colors duration-300">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-20">
          {/* Logo */}
          <div className="flex items-center gap-3 cursor-pointer" onClick={() => onNavigate('home')}>
            <svg className="w-9 h-9 text-[#D4A24C] shrink-0" fill="currentColor" viewBox="0 0 24 24">
              <path d="M1.5 5 C5 5 10 9 21.5 3 C17 10 11 13 1.5 5 Z" />
              <path d="M2.5 10 C6 10 11 13.5 22.5 7.5 C18 14.5 12 17.5 2.5 10 Z" />
              <path d="M3.5 15 C7 15 12 18 23.5 12 C19 19 13 22 3.5 15 Z" />
            </svg>
            <div>
              <span className="font-serif text-2xl font-bold tracking-tight text-slate-900 dark:text-white leading-none">
                Aether<span className="text-[#D4A24C]">Fly</span>
              </span>
              <span className="hidden sm:block text-[8px] tracking-[0.25em] text-[#D4A24C] uppercase font-bold mt-1">
                A NEW HORIZON IN LUXURY TRAVEL
              </span>
            </div>
          </div>

          {/* Navigation Links */}
          <nav className="hidden md:flex space-x-1 lg:space-x-4 items-center">
            {navs.map((nav) => (
              <button
                key={nav.view}
                onClick={() => onNavigate(nav.view)}
                className={`px-3.5 py-2 text-xs font-semibold tracking-wide transition-all duration-200 cursor-pointer ${
                  currentView === nav.view
                    ? 'text-[#D4A24C] border-b-2 border-[#D4A24C]'
                    : 'text-slate-600 dark:text-slate-300 hover:text-[#D4A24C] dark:hover:text-[#D4A24C]'
                }`}
              >
                {lang === 'en' ? nav.label.en : nav.label.ar}
              </button>
            ))}
          </nav>

          {/* Controls & Account */}
          <div className="flex items-center gap-2 sm:gap-4">
            {/* Theme Toggle */}
            <button
              onClick={toggleTheme}
              className="p-2 text-slate-500 dark:text-slate-400 hover:text-[#D4A24C] dark:hover:text-[#D4A24C] transition-colors cursor-pointer"
              title="Toggle theme"
            >
              {theme === 'light' ? <Moon size={18} /> : <Sun size={18} />}
            </button>

            {/* Language Selection */}
            <div className="relative group">
              <button
                onClick={() => setLang(lang === 'en' ? 'ar' : 'en')}
                className="flex items-center gap-1.5 px-3 py-1.5 text-xs font-bold text-slate-700 dark:text-slate-200 border border-slate-200 dark:border-slate-800 hover:border-[#D4A24C] dark:hover:border-[#D4A24C] rounded-xl transition-all cursor-pointer"
              >
                <Languages size={14} />
                <span>{lang === 'en' ? 'English' : 'عربي'}</span>
              </button>
            </div>

            {/* User Account / Join Auth Actions */}
            {user ? (
              <div className="flex items-center gap-3">
                <button
                  onClick={() => onNavigate('dashboard')}
                  className="hidden sm:flex items-center gap-1.5 px-3 py-1.5 text-xs font-bold text-slate-700 dark:text-slate-200 hover:text-[#D4A24C] transition-colors cursor-pointer"
                >
                  <User size={14} />
                  <span>{user.name.split(' ')[0]}</span>
                </button>
                <button
                  onClick={onLogOut}
                  className="p-2 text-slate-400 hover:text-red-500 transition-colors cursor-pointer"
                  title="Log out"
                >
                  <LogOut size={16} />
                </button>
              </div>
            ) : (
              <div className="flex items-center gap-2">
                <button
                  onClick={() => onNavigate('signin')}
                  className="px-3 py-2 text-xs font-bold text-slate-600 dark:text-slate-300 hover:text-[#D4A24C] transition-colors cursor-pointer"
                >
                  {lang === 'en' ? 'Sign In' : 'تسجيل الدخول'}
                </button>
                <button
                  onClick={() => onNavigate('signin')}
                  className="hidden sm:flex items-center gap-2 bg-[#D4A24C] text-slate-950 hover:bg-[#E0B15A] text-xs font-bold px-4 py-2.5 rounded-xl transition-all duration-200 cursor-pointer shadow-md hover:shadow-lg hover:-translate-y-0.5 shadow-amber-500/10"
                >
                  <span>{lang === 'en' ? 'Join AetherFly' : 'انضم إلينا'}</span>
                  <span>→</span>
                </button>
              </div>
            )}
          </div>
        </div>
      </div>
    </header>
  );
}

export default memo(Header);
