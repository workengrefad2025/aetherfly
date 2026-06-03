import React from 'react';
import { Linkedin, Github, Facebook, MessageCircle, Sparkles } from 'lucide-react';

interface CreatorSectionProps {
  lang: 'en' | 'ar';
}

export default function CreatorSection({ lang }: CreatorSectionProps) {
  const socials = [
    {
      name: 'LinkedIn',
      url: 'https://www.linkedin.com/in/refad-saeed-31467b378',
      icon: <Linkedin size={20} />,
      color: 'hover:text-[#0077B5] hover:border-[#0077B5]/40 hover:bg-[#0077B5]/5',
      label: lang === 'en' ? 'Professional Network' : 'الشبكة المهنية',
    },
    {
      name: 'GitHub',
      url: 'https://github.com/workengrefad2025',
      icon: <Github size={20} />,
      color: 'hover:text-[#333] dark:hover:text-[#f0f6fc] hover:border-slate-400 dark:hover:border-slate-600 hover:bg-slate-500/5',
      label: lang === 'en' ? 'Source Architecture' : 'بنية الأكواد والبرمجة',
    },
    {
      name: 'Facebook',
      url: 'https://www.facebook.com/share/19haPVZn6Y/',
      icon: <Facebook size={20} />,
      color: 'hover:text-[#1877F2] hover:border-[#1877F2]/40 hover:bg-[#1877F2]/5',
      label: lang === 'en' ? 'Social Catalog' : 'التواصل الاجتماعي',
    },
    {
      name: 'WhatsApp',
      url: 'https://wa.me/60177738987',
      icon: <MessageCircle size={20} />,
      color: 'hover:text-[#25D366] hover:border-[#25D366]/40 hover:bg-[#25D366]/5',
      label: lang === 'en' ? 'Direct Consultation' : 'الاتصال المباشر والطلب',
    },
  ];

  return (
    <section className="relative overflow-hidden py-20 px-4 sm:px-6 lg:px-8 mt-12 mb-12">
      {/* Background radial soft light gradient for luxury depth */}
      <div className="absolute inset-0 bg-[#fbfbfa] dark:bg-[#141413] pointer-events-none transition-colors duration-300" />
      <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[500px] h-[500px] bg-[#D4A24C]/5 dark:bg-[#D4A24C]/3 rounded-full blur-3xl pointer-events-none" />

      <div className="max-w-5xl mx-auto relative">
        <div className="bg-white/80 dark:bg-stone-900/45 backdrop-blur-xl border border-stone-200/60 dark:border-stone-800/80 p-8 sm:p-12 rounded-[2.5rem] shadow-2xl shadow-stone-500/5">
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 items-center">
            
            {/* Creator Information Details Card */}
            <div className="lg:col-span-7 space-y-6 text-left">
              <span className="inline-flex items-center gap-1.5 text-[10px] font-mono tracking-[0.3em] font-extrabold text-[#D4A24C] uppercase bg-amber-500/10 px-3 py-1 rounded-full">
                <Sparkles size={11} />
                <span>{lang === 'en' ? 'Bespoke Digital Artistry' : 'الفخامة الرقمية المخصصة'}</span>
              </span>
              
              <div className="space-y-3">
                <p className="text-xs uppercase tracking-widest text-[#8b8b80] font-bold font-mono">
                  {lang === 'en' ? 'Designed & Developed by' : 'تصميم وتطوير المطور المتميز'}
                </p>
                <h2 className="font-serif text-3xl sm:text-5.55xl font-bold tracking-tight text-slate-900 dark:text-stone-50">
                  {lang === 'en' ? 'Refad Alameri' : 'رفاد العامري'}
                </h2>
              </div>
              
              <p className="text-sm text-slate-600 dark:text-stone-350 leading-relaxed font-light">
                {lang === 'en'
                  ? 'A bespoke blend of strict spatial geometry, refined typography, and highly responsive micro-interactions. Beautifully aligned to AetherFly’s signature prestige, this interface defines the peak of contemporary UI engineering and technical detail.'
                  : 'مزيج فريد من الهندسة الموزونة والخطوط الفاخرة والتفاعلات الدقيقة السلسة. صُممت وطُوّرت هذه المنصة خصيصاً بمستويات استثنائية تعزز الفخامة الرقمية وتبرز أعلى مستويات الهندسة التقنية العصرية لمشروع إيثر فلاي.'}
              </p>

              {/* Designer signature aesthetic stamp */}
              <div className="pt-4 border-t border-stone-100 dark:border-stone-800/80 max-w-sm flex items-center justify-between">
                <div>
                  <p className="text-[10px] uppercase tracking-widest font-mono text-[#D4A24C] font-extrabold">Refad Alameri</p>
                  <p className="text-[9px] text-[#8b8b80] uppercase tracking-wider">{lang === 'en' ? 'Lead Creator & Web Architect' : 'المهندس الرئيسي المبدع'}</p>
                </div>
                <div className="text-[#D4A24C] font-mono text-xs opacity-70 tracking-widest">
                  [ 2026 EDITION ]
                </div>
              </div>
            </div>

            {/* Social Glassmorphism Action Cards Grid */}
            <div className="lg:col-span-5 grid grid-cols-1 sm:grid-cols-2 gap-4">
              {socials.map((social) => (
                <a
                  key={social.name}
                  href={social.url}
                  target="_blank"
                  rel="noopener noreferrer"
                  className={`flex flex-col justify-between p-5 bg-white/40 dark:bg-stone-950/40 backdrop-blur-md border border-stone-100 dark:border-stone-800/50 rounded-2xl shadow-sm transition-all duration-300 hover:-translate-y-1 hover:shadow-lg hover:shadow-[#D4A24C]/5 hover:border-[#D4A24C]/40 cursor-pointer group ${social.color}`}
                >
                  <div className="flex items-center justify-between mb-4">
                    <span className="p-2 bg-stone-100 dark:bg-stone-900 text-stone-500 dark:text-stone-300 rounded-xl group-hover:bg-[#D4A24C] group-hover:text-slate-950 transition-all duration-300 shadow-inner">
                      {social.icon}
                    </span>
                    <span className="text-[9px] uppercase font-mono text-slate-400 group-hover:text-[#D4A24C] font-bold tracking-widest">
                      {social.name} →
                    </span>
                  </div>
                  <div>
                    <h4 className="font-bold text-xs text-slate-800 dark:text-stone-100 group-hover:text-[#D4A24C] transition-colors">
                      {social.name}
                    </h4>
                    <p className="text-[10px] text-slate-400 dark:text-stone-500 mt-1 truncate">
                      {social.label}
                    </p>
                  </div>
                </a>
              ))}
            </div>

          </div>
        </div>
      </div>
    </section>
  );
}
