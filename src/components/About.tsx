import React from 'react';
import { Sparkles, Trophy, Star, ShieldCheck } from 'lucide-react';

interface AboutProps {
  lang: 'en' | 'ar';
}

export default function About({ lang }: AboutProps) {
  return (
    <div className="max-w-6xl mx-auto px-4 py-16 space-y-20" id="about">
      <div className="text-center space-y-5">
        <span className="inline-block text-[10px] font-bold text-stone-600 dark:text-stone-300 tracking-widest uppercase bg-stone-50 dark:bg-stone-900 border border-[#ecece8] dark:border-[#2a2a28] px-3 py-1 rounded-xl font-mono">
          {lang === 'en' ? 'Bespoke Aviation Charter' : 'رائدو الطيران المدني الفاخر'}
        </span>
        <h1 className="font-serif text-3xl sm:text-5xl font-normal text-[#1a1a1a] dark:text-[#fdfdfc] leading-tight">
          {lang === 'en' ? 'The Art of Flight, Elevated' : 'فلسفة جديدة للسفر الراقي'}
        </h1>
        <p className="text-sm text-[#8b8b80] max-w-2xl mx-auto leading-relaxed">
          {lang === 'en'
            ? 'At AetherFly, every detail is designed to make your journey extraordinary. From private lounge concierge to bespoke cabin service, your travel is curated for the rarest moments.'
            : 'في إيثر فلاي، يتم تصميم كل عنصر من عناصر رحلتك لتصبح تجربة فريدة من نوعها. من الكونسيرج الخاص إلى الخدمة الاستثنائية داخل المقصورة، نسافر بك إلى أعلى مستويات الرفاهية.'}
        </p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {[
          {
            title: lang === 'en' ? 'Private Departure Experience' : 'تجربة انطلاق خاصة',
            copy: lang === 'en'
              ? 'Begin with private terminal access, personal concierge escorts, and curated arrival transfers designed for privacy and pace.'
              : 'ابدأ من صالة خاصة، مرافق كونسيرج شخصية، وخدمات نقل مصممة للخصوصية والراحة.',
            icon: <Sparkles size={24} />
          },
          {
            title: lang === 'en' ? 'Elevated Cabin Living' : 'تجربة المقصورة الفاخرة',
            copy: lang === 'en'
              ? 'Choose from fully enclosed suites, stellar dining menus, and on-demand entertainment that feels crafted just for you.'
              : 'اختر من بين أجنحة مغلقة بالكامل، قوائم طعام مميزة، وترفيه حسب الطلب صُمِّم من أجلك.',
            icon: <Star size={24} />
          },
          {
            title: lang === 'en' ? 'Concierge by Design' : 'كونسيرج مصمم بعناية',
            copy: lang === 'en'
              ? 'Our travel team is available 24/7 to book experiences, accommodate requests, and make every transition seamless.'
              : 'فريق السفر الخاص بنا متاح على مدار الساعة لحجز التجارب وتنفيذ الطلبات وجعل كل خطوة سلسة.',
            icon: <Trophy size={24} />
          }
        ].map((feature, idx) => (
          <div key={idx} className="rounded-3xl border border-[#ecece8] dark:border-[#2a2a28] bg-white dark:bg-slate-950 p-7 shadow-xl">
            <div className="inline-flex h-12 w-12 items-center justify-center rounded-2xl bg-[#f9edd4] text-[#b87f06] mb-4">
              {feature.icon}
            </div>
            <h2 className="text-xl font-serif font-semibold text-[#111827] dark:text-[#f8fafc] mb-3">{feature.title}</h2>
            <p className="text-sm text-[#6b7280] dark:text-[#cbd5e1] leading-7">{feature.copy}</p>
          </div>
        ))}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-center">
        <div className="space-y-6">
          <h2 className="font-serif text-3xl font-light text-[#1a1a1a] dark:text-[#fdfdfc]">
            {lang === 'en' ? 'AetherFly Fleet & Wellness' : 'أسطول إيثر فلاي والعافية'}
          </h2>
          <p className="text-sm text-[#8b8b80] dark:text-stone-400 leading-relaxed">
            {lang === 'en'
              ? 'Our flagship cabins combine wellness rituals, sleep systems, and curated dining so that you arrive refreshed and inspired.'
              : 'تجمع مقصوراتنا المميزة بين طقوس العافية وأنظمة النوم المريحة وقوائم الطعام المميزة لتصل منتعشاً ومفعماً بالإلهام.'}
          </p>
          <div className="grid grid-cols-2 gap-4 text-[10px] uppercase tracking-widest text-[#8b8b80] font-mono">
            <p className="flex items-center gap-2">✓ Concierge sleep kit</p>
            <p className="flex items-center gap-2">✓ Seasonal tasting menus</p>
            <p className="flex items-center gap-2">✓ Bespoke wellness menus</p>
            <p className="flex items-center gap-2">✓ Silent cabin ambience</p>
          </div>
        </div>
        <div className="rounded-3xl overflow-hidden border border-[#ecece8] dark:border-[#2a2a28] bg-[#f8fafc] dark:bg-[#121212]">
          <img
            src="https://images.unsplash.com/photo-1500530855697-b586d89ba3ee?auto=format&fit=crop&w=900&q=80"
            alt="AetherFly luxury cabin interior"
            referrerPolicy="no-referrer"
            className="w-full h-full min-h-[360px] object-cover"
          />
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-center">
        <div className="rounded-3xl border border-[#ecece8] dark:border-[#2a2a28] bg-white dark:bg-slate-950 p-8 shadow-xl">
          <div className="flex items-center gap-3 mb-4">
            <ShieldCheck className="text-[#D4A24C]" size={24} />
            <span className="text-xs uppercase tracking-[0.3em] text-[#8b8b80]">{lang === 'en' ? 'Our Promise' : 'وعد إيثر فلاي'}</span>
          </div>
          <h2 className="font-serif text-3xl font-light text-[#1a1a1a] dark:text-[#fdfdfc] mb-4">
            {lang === 'en' ? 'Privacy, Precision, Perfection' : 'الخصوصية والدقة والكمال'}
          </h2>
          <p className="text-sm text-[#6b7280] dark:text-[#cbd5e1] leading-7">
            {lang === 'en'
              ? 'From digital ticket delivery to transparent concierge service, every touchpoint is designed to feel discreet, effortless, and exceptionally polished.'
              : 'من تسليم التذكرة الرقمية إلى خدمات الكونسيرج الواضحة، تم تصميم كل لمسة لتبدو راقية وسهلة ومتميزة.'}
          </p>
        </div>

        <div className="rounded-3xl border border-[#ecece8] dark:border-[#2a2a28] bg-white dark:bg-slate-950 p-8 shadow-xl">
          <h2 className="font-serif text-3xl font-light text-[#1a1a1a] dark:text-[#fdfdfc] mb-4">
            {lang === 'en' ? 'Global Destinations' : 'وجهات عالمية'}
          </h2>
          <p className="text-sm text-[#6b7280] dark:text-[#cbd5e1] leading-7 mb-6">
            {lang === 'en'
              ? 'We pair private sky travel with hidden resorts, cultural expeditions, and premium arrivals for journeys that feel curated, not commercial.'
              : 'نحن نربط السفر الجوي الخاص بوجهات مخفية وتجارب ثقافية ووصوليات فاخرة لرحلات ترسخ الطابع الخاص بعيداً عن الصخب.'}
          </p>
          <div className="space-y-4 text-sm text-[#475569] dark:text-[#cbd5e1]">
            <p>• Maldives Private Villas with sunset transfers.</p>
            <p>• Kyoto cultural immersion with private temple breakfasts.</p>
            <p>• Switzerland alpine escapes with groomed chalet arrival.</p>
            <p>• Dubai nocturnal skyline experiences in a VIP jet.</p>
          </div>
        </div>
      </div>
    </div>
  );
}
