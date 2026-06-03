import React, { memo, useState } from 'react';

interface FooterProps {
  lang: 'en' | 'ar';
  onNavigate: (view: string) => void;
}

function Footer({ lang, onNavigate }: FooterProps) {
  const [email, setEmail] = useState('');
  const [status, setStatus] = useState<'idle' | 'success'>('idle');

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (email.trim()) {
      setStatus('success');
      setEmail('');
      setTimeout(() => setStatus('idle'), 4000);
    }
  };

  return (
    <footer className="bg-[#121211] text-[#9a9a90] pt-16 pb-12 transition-colors border-t border-[#2a2a28]">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-12">
          {/* Logo & Slogan */}
          <div className="md:col-span-1 space-y-4">
            <div className="flex items-center gap-3">
              <span className="font-serif text-2xl font-bold tracking-tighter text-[#fdfdfc] flex items-center">
                AETHER<span className="italic font-serif font-light text-[#8b8b80] dark:text-[#d4cfc3] ml-1">Fly</span>
              </span>
            </div>
            <p className="text-xs text-[#8b8b80] leading-relaxed font-sans">
              {lang === 'en'
                ? 'Where travel meets the sublime. Fly on ultra-modern aircraft to the world’s most elite destinations.'
                : 'حيث يلتقي السفر بالرفاهية المطلقة. طيران فاخر طليعي إلى أكثر الوجهات صفاءً حول العالم.'}
            </p>
          </div>

          {/* Quick Links Group 1 */}
          <div className="space-y-4">
            <h4 className="text-[#fdfdfc] font-serif text-[13px] uppercase tracking-wider font-bold">
              {lang === 'en' ? 'Company' : 'الشركة'}
            </h4>
            <ul className="space-y-2 text-[11px] uppercase tracking-wide">
              <li>
                <a
                  href="#about"
                  onClick={(e) => {
                    e.preventDefault();
                    onNavigate('about');
                  }}
                  className="hover:text-white transition-colors"
                >
                  {lang === 'en' ? 'About Us' : 'من نحن'}
                </a>
              </li>
              <li>
                <a href="#careers" className="hover:text-white transition-colors">
                  {lang === 'en' ? 'Careers' : 'الوظائف'}
                </a>
              </li>
              <li>
                <a href="#press" className="hover:text-white transition-colors">
                  {lang === 'en' ? 'Press & Media' : 'الصحافة والإعلام'}
                </a>
              </li>
            </ul>
          </div>

          {/* Quick Links Group 2 */}
          <div className="space-y-4">
            <h4 className="text-[#fdfdfc] font-serif text-[13px] uppercase tracking-wider font-bold">
              {lang === 'en' ? 'Services' : 'الخدمات الفاخرة'}
            </h4>
            <ul className="space-y-2 text-[11px] uppercase tracking-wide">
              <li>
                <a
                  href="#support"
                  onClick={(e) => {
                    e.preventDefault();
                    onNavigate('support');
                  }}
                  className="hover:text-white transition-colors"
                >
                  {lang === 'en' ? 'Support' : 'الدعم'}
                </a>
              </li>
              <li>
                <a
                  href="#offers"
                  onClick={(e) => {
                    e.preventDefault();
                    onNavigate('offers');
                  }}
                  className="hover:text-white transition-colors"
                >
                  {lang === 'en' ? 'Offers' : 'العروض'}
                </a>
              </li>
              <li>
                <a
                  href="#destinations"
                  onClick={(e) => {
                    e.preventDefault();
                    onNavigate('destinations');
                  }}
                  className="hover:text-white transition-colors"
                >
                  {lang === 'en' ? 'Destinations' : 'الوجهات'}
                </a>
              </li>
            </ul>
          </div>

          {/* Newsletter Box */}
          <div className="space-y-4">
            <h4 className="text-[#fdfdfc] font-serif text-[13px] uppercase tracking-wider font-bold">
              {lang === 'en' ? 'Stay Updated' : 'النشرة البريدية الرائدة'}
            </h4>
            <p className="text-xs text-[#8b8b80]">
              {lang === 'en'
                ? 'Join our private mailing list to receive exclusive offers.'
                : 'انضم لطلب السفر الكونسيرج ومزايا نادي النخبة.'}
            </p>
            <form onSubmit={handleSubmit} className="flex gap-2">
              <input
                type="email"
                required
                placeholder={lang === 'en' ? 'Email Address' : 'البريد الإلكتروني'}
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="flex-1 bg-transparent border border-slate-800 focus:border-[#D4A24C] text-white rounded-xl px-4 py-2.5 text-xs focus:outline-none transition-colors placeholder-[#8b8b80]"
              />
              <button
                type="submit"
                className="bg-[#D4A24C] text-slate-950 font-bold px-4 py-2.5 rounded-xl text-xs tracking-wider uppercase hover:bg-[#E0B15A] transition-all duration-200 cursor-pointer"
              >
                {lang === 'en' ? 'Join' : 'انضم'}
              </button>
            </form>
            {status === 'success' && (
              <p className="text-xs text-white/95 transition-opacity">
                {lang === 'en'
                  ? '✓ Welcome to our elite list.'
                  : '✓ مرحبًا بك في النخبة الخاصة بنا.'}
              </p>
            )}
          </div>
        </div>

        <div className="border-t border-[#2a2a28] mt-12 pt-8 flex flex-col sm:flex-row items-center justify-between text-[11px] uppercase tracking-widest text-[#8b8b80] gap-4">
          <div className="space-y-2 text-center sm:text-left">
            <p>© 2026 AetherFly Charter Ltd. Crafted for elite experiences worldwide.</p>
            <p className="text-[10px] sm:text-[11px] tracking-[0.2em] transition-all">
              <span className="text-[#8b8b80] font-light">
                {lang === 'en' ? 'DESIGNED & DEVELOPED BY ' : 'تم التصميم والتطوير بواسطة '}
              </span>
              <a
                href="https://www.linkedin.com/in/refad-saeed-31467b378"
                target="_blank"
                rel="noopener noreferrer"
                className="text-[#D4A24C] hover:text-amber-305 font-bold tracking-[0.25em] transition-colors"
              >
                REFAD ALAMERI
              </a>
            </p>
          </div>
          <div className="flex gap-6">
            <a href="#terms" className="hover:text-white transition-colors">
              {lang === 'en' ? 'Terms of Use' : 'شروط الخدمة'}
            </a>
            <a href="#privacy" className="hover:text-white transition-colors">
              {lang === 'en' ? 'Privacy Policy' : 'نهج الخصوصية'}
            </a>
          </div>
        </div>
      </div>
    </footer>
  );
}

export default memo(Footer);
