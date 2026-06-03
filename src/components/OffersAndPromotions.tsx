import React, { useState, useEffect } from 'react';
import { Sparkles, Clock, Compass, ShieldCheck, Heart, Plane, Gift, Percent, CreditCard, ChevronRight, Send, Check } from 'lucide-react';

interface OffersAndPromotionsProps {
  lang: 'en' | 'ar';
  onBookOffer: (destName: string, destCode: string, offerPrice: number) => void;
}

export default function OffersAndPromotions({ lang, onBookOffer }: OffersAndPromotionsProps) {
  const [activeTab, setActiveTab] = useState<'all' | 'flights' | 'packages' | 'vip' | 'cards'>('all');
  const [successToast, setSuccessToast] = useState<string | null>(null);
  
  // Custom Live Countdowns
  const [timeRemaining, setTimeRemaining] = useState({
    flash: { days: 2, hours: 14, minutes: 22, seconds: 45 },
    seasonal: { days: 12, hours: 8, minutes: 47, seconds: 12 },
    space: { days: 45, hours: 19, minutes: 5, seconds: 33 }
  });

  useEffect(() => {
    const timer = setInterval(() => {
      setTimeRemaining(prev => {
        const tick = (t: { days: number; hours: number; minutes: number; seconds: number }) => {
          let s = t.seconds - 1;
          let m = t.minutes;
          let h = t.hours;
          let d = t.days;

          if (s < 0) {
            s = 59;
            m -= 1;
            if (m < 0) {
              m = 59;
              h -= 1;
              if (h < 0) {
                h = 23;
                d = Math.max(0, d - 1);
              }
            }
          }
          return { days: d, hours: h, minutes: m, seconds: s };
        };

        return {
          flash: tick(prev.flash),
          seasonal: tick(prev.seasonal),
          space: tick(prev.space)
        };
      });
    }, 1000);

    return () => clearInterval(timer);
  }, []);

  const triggerSignupToast = (pkgName: string) => {
    setSuccessToast(lang === 'en' ? `Inquiry submitted for: ${pkgName}. A personal concierge agent will contact you shortly!` : `تم تسجيل طلبك لـ: ${pkgName}. سيتصل بك فريق الكونسيرج قريبًا!`);
    setTimeout(() => setSuccessToast(null), 5000);
  };

  const offerList = [
    // 1. LIMITED-TIME DEAL (FLASH)
    {
      id: 'flash-discount',
      category: 'flights',
      tag: lang === 'en' ? 'Limited Time Deal' : 'عروض حصرية محدودة',
      title: lang === 'en' ? 'Elite Centurion Flight Discount' : 'خصومات كينتوريون المحدودة',
      desc: lang === 'en' ? 'An exclusive 22% rate discount on customized transcontinental routes. Valid on any customized non-stop flight booked this week.' : 'خصم استثنائي بقيمة 22% على الخطوط الفريدة العابرة للقارات. صالح لأي خط يتم حجزه هذا الأسبوع.',
      price: 1850,
      orignalPrice: 2400,
      badge: lang === 'en' ? 'Save 22%' : 'خصم ٢٢٪',
      image: 'https://images.unsplash.com/photo-1540962351504-03099e0a754b?auto=format&fit=crop&w=800&q=80',
      countdownKey: 'flash' as const,
      features: [
        lang === 'en' ? 'Complimentary limo airport transfers' : 'توصيل مجاني بليموزين فاخرة',
        lang === 'en' ? 'Flexible ticket rebooking rights' : 'إمكانية تغيير مجاني للرحلة',
        lang === 'en' ? 'First Class Lounge priority access' : 'دخول مجاني لصالة كبار الشخصيات'
      ],
      actionLabel: lang === 'en' ? 'Lock In Flight Discount' : 'تأكيد الحجز الفوري',
      destCode: 'HND',
      destName: 'Tokyo'
    },
    // 2. SEASONAL OFFER
    {
      id: 'autumn-alpine',
      category: 'packages',
      tag: lang === 'en' ? 'Seasonal Experience' : 'عروض المواسم الفاخرة',
      title: lang === 'en' ? 'St. Moritz Autumn Alpine Private Escape' : 'موسم جبال الألب في سانت موريتز لليخوت',
      desc: lang === 'en' ? 'Fly directly to the Engadin airport. Package includes business jet transport, luxury resort suite overlooking Lake St. Moritz, and personal butler service.' : 'رحلة طيران مباشرة إلى مطار إنجادين. تشمل طائرة نفاثة خاصة، وإقامة خمسة نجوم مطلة على البحيرة مع كونسيرج خاص.',
      price: 8400,
      badge: lang === 'en' ? 'Seasonal' : 'موسمي فاخر',
      image: 'https://images.unsplash.com/photo-1502602898657-3e91760cbb34?auto=format&fit=crop&w=800&q=80',
      countdownKey: 'seasonal' as const,
      features: [
        lang === 'en' ? 'Chef-curated gourmet chalet dinner' : 'عشاء فاخر مجهز على يد كبار الطهاة',
        lang === 'en' ? 'Private helicopter peak flight tour' : 'جولة خاصة بطائرة الهليكوبتر فوق جبال الألب',
        lang === 'en' ? 'AetherFly member milestone points' : 'نقاط أميال إضافية مضاعفة'
      ],
      actionLabel: lang === 'en' ? 'Secure Alpine Package' : 'احجز الباقة الجبلية الفاخرة',
      destCode: 'ZRH',
      destName: 'St. Moritz Alpine'
    },
    // 3. HONEYMOON PACKAGE
    {
      id: 'honeymoon-overwater',
      category: 'packages',
      tag: lang === 'en' ? 'Honeymoon Bundle' : 'باقات ومقاصد شهر العسل',
      title: lang === 'en' ? 'Maldives Lagoon Serenity Sanctuary' : 'ملاذ الصفاء الرومانسي في جزر المالديف',
      desc: lang === 'en' ? 'The ultimate luxury getaway. Round-trip First Class flights, 7 nights in an ultra-luxuorious Maldives overwater glass-floor villa, and private sunset yacht charter.' : 'جولة النقاء المطلق. طيران للدرجة الأولى، إقامة 7 ليالٍ في فيلا مائية ذات أرضية زجاجية فاخرة ويخت كونسيرج خاص.',
      price: 12900,
      badge: lang === 'en' ? 'Romantic' : 'باقة العشاق',
      image: 'https://images.unsplash.com/photo-1514282401047-d79a71a590e8?auto=format&fit=crop&w=800&q=80',
      features: [
        lang === 'en' ? 'Private sunset lagoon caviar & champagne' : 'كافيار وحفل عشاء خاص باليخت عند الغروب',
        lang === 'en' ? 'Signature couples ocean deep spa session' : 'جلسة رعاية صحية متكاملة للزوجين مطلة على البحر',
        lang === 'en' ? 'Floating private breakfast service daily' : 'إفطار عائم يومي في مسبح الفيلا الخاص'
      ],
      actionLabel: lang === 'en' ? 'Book Romantic Escape' : 'احجز الملاذ الرومانسي المالديفي',
      destCode: 'MLE',
      destName: 'Maldives Overwater'
    },
    // 4. BUSINESS CLASS OFFER
    {
      id: 'business-chef-class',
      category: 'flights',
      tag: lang === 'en' ? 'Premium Cabin Upgrade' : 'أفضل ترقيات درجة الأعمال',
      title: lang === 'en' ? 'Ultimate Signature Business Upgrade' : 'ترقية ممتازة للأعمال الشاملة',
      desc: lang === 'en' ? 'Enjoy a flat-bed cocoon suite with our Chef-On-Call service. Flights include personal sliding doors, designer sleepwear, and ultimate quiet-zone pods.' : 'تمتع بجناح درجة الأعمال المسطح بالكامل مع خدمات الطباخ عند الطلب ومقصورات عازلة للصوت.',
      price: 2950,
      badge: lang === 'en' ? 'Exclusive Bed Suite' : 'مقصورة فاخرة مغلقة',
      image: 'https://images.unsplash.com/photo-1436491865332-7a61a109cc05?auto=format&fit=crop&w=800&q=80',
      features: [
        lang === 'en' ? 'Individual private sliding doors' : 'أبواب انزلاقية خاصة للأجنحة',
        lang === 'en' ? 'Five-star dine on demand champagne menu' : 'قائمة فرنسية فاخرة متوفرة طوال الرحلة',
        lang === 'en' ? 'Complimentary high-speed WiFi plus power hubs' : 'إنترنت فائق السرعة مفتوح ومنافذ متعددة'
      ],
      actionLabel: lang === 'en' ? 'Explore Business Upgrade' : 'اختر وباشر حجز الترقية',
      destCode: 'CDG',
      destName: 'Paris Charles de Gaulle'
    },
    // 5. LUXURY TRAVEL EXOTIC EXPERIENCE
    {
      id: 'suborbital-space',
      category: 'packages',
      tag: lang === 'en' ? 'Exotic Exploration' : 'رحلات الاستكشاف العالمية الفائقة',
      title: lang === 'en' ? 'Voyager Orbit Suborbital Jet Experience' : 'باقة رغد الفضاء واستكشاف الهباء الجوي',
      desc: lang === 'en' ? 'Experience zero gravity at the edge of the atmosphere. Includes specialized aerospace training, zero-g pre-departure suite, and private launch pad flight transfers.' : 'تمتع بتجربة انعدام الجاذبية في حدود الغلاف الجوي العليا. تشمل التدريب المتخصص والإقامة الفائقة مع نقل طائرة خاصة.',
      price: 49500,
      badge: lang === 'en' ? 'Aether Ultimate' : 'آفاق المطلق',
      image: 'https://images.unsplash.com/photo-1451187580459-43490279c0fa?auto=format&fit=crop&w=800&q=80',
      countdownKey: 'space' as const,
      features: [
        lang === 'en' ? 'Official astronaut wings insignia' : 'شارة رائد الفضاء الطامح المعتمدة',
        lang === 'en' ? 'Custom pressurized suit and training' : 'بدلة الضغط المخصصة الفخمة',
        lang === 'en' ? 'HD video and multi-angle camera logging' : 'تسجيلات فيديو مذهلة بكاميرات ذكية مجهزة'
      ],
      actionLabel: lang === 'en' ? 'Inquire for Space Ticket' : 'اطلب استشارة الرحلة الفضائية',
      isInquireOnly: true
    }
  ];

  const filteredOffers = activeTab === 'all' 
    ? offerList 
    : offerList.filter(o => o.category === activeTab);

  return (
    <div className="py-24 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 space-y-16">
      
      {/* Toast Alert Indicator */}
      {successToast && (
        <div className="fixed top-24 left-1/2 -translate-x-1/2 bg-slate-900 border border-[#D4A24C] text-stone-100 px-6 py-4 rounded-2xl shadow-2xl z-50 flex items-center gap-3 anim-fadeIn">
          <span className="p-1.5 bg-[#D4A24C]/20 text-[#D4A24C] rounded-full">
            <Check size={16} />
          </span>
          <p className="text-xs font-bold leading-tight max-w-sm">{successToast}</p>
        </div>
      )}

      {/* Intro Header Title Banner */}
      <div className="text-center space-y-4 max-w-3xl mx-auto">
        <span className="inline-flex items-center gap-2 text-[10px] uppercase tracking-[0.3em] font-extrabold text-[#D4A24C] bg-amber-500/10 px-4 py-1.5 rounded-full font-mono">
          <Sparkles size={11} />
          <span>{lang === 'en' ? 'AetherFly Exclusive Portfolios' : 'المحفظة الاستثنائية لامتيازات السفر'}</span>
        </span>
        <h1 className="font-serif text-4xl sm:text-6xl font-light text-slate-900 dark:text-[#fdfdfc]">
          {lang === 'en' ? 'Cinematic Promos & ' : 'عروض ومزايا الكونسيرج '} 
          <span className="text-[#D4A24C] italic font-normal">{lang === 'en' ? 'Luxury Escapes' : 'الفاخرة'}</span>
        </h1>
        <p className="text-sm text-[#8b8b80] dark:text-stone-400 max-w-xl mx-auto leading-relaxed font-light">
          {lang === 'en'
            ? 'Discover curated global promotions, high-prestige cabin upgrade discounts, honeymoon packages, and elite suborbital exploration details tailored to your high-end schedule.'
            : 'استكشف المزايا الفريدة كترقبات المقصورة وتخفيضات العطلات الفاخرة المنسقة وتفاصيل السفر الطليعي للطلبات الخاصة من طائراتنا.'}
        </p>
      </div>

      {/* Tabs Filter Categories */}
      <div className="flex justify-center gap-2 p-1.5 bg-slate-100 dark:bg-stone-950/80 rounded-2xl max-w-lg mx-auto border border-slate-200/50 dark:border-stone-900">
        {[
          { id: 'all', en: 'All Offers', ar: 'كل العروض' },
          { id: 'flights', en: 'Flights & Upgrades', ar: 'الترقيات والرحلات' },
          { id: 'packages', en: 'Luxury Packages', ar: 'الباقات السياحية' },
          { id: 'vip', en: 'VIP Lounge', ar: 'نادي الـ VIP' },
          { id: 'cards', en: 'Prestige Cards', ar: 'بطاقات النخبة' }
        ].map(tab => (
          <button
            key={tab.id}
            onClick={() => setActiveTab(tab.id as any)}
            className={`px-3.5 py-2.5 text-[11px] font-bold rounded-xl transition-all duration-300 cursor-pointer text-center flex-1 ${
              activeTab === tab.id
                ? 'bg-gradient-to-r from-[#E0B15A] to-[#D4A24C] text-slate-950 shadow-md shadow-amber-500/10'
                : 'text-slate-600 dark:text-stone-400 hover:text-[#D4A24C]'
            }`}
          >
            {lang === 'en' ? tab.en : tab.ar}
          </button>
        ))}
      </div>

      {/* Offers Display Layout */}
      {activeTab === 'vip' || activeTab === 'cards' ? (
        
        /* SPECIAL CATEGORY: VIP LOUNGE AND BLACK CARDS SERVICES */
        <div className="grid grid-cols-1 md:grid-cols-2 gap-8 w-full">
          
          {/* Black Card Display Card */}
          <div className="bg-gradient-to-br from-slate-950 via-stone-900 to-slate-950 border border-[#D4A24C]/25 p-8 sm:p-12 rounded-[2rem] shadow-2xl relative overflow-hidden group">
            <div className="absolute top-0 right-0 w-80 h-80 bg-gradient-to-br from-[#D4A24C]/10 to-transparent rounded-full blur-3xl pointer-events-none" />
            
            <div className="space-y-6 relative">
              <span className="p-3 bg-amber-500/10 border border-[#D4A24C]/20 text-[#D4A24C] rounded-2xl inline-block">
                <CreditCard size={28} />
              </span>
              
              <div className="space-y-2">
                <h3 className="font-serif text-2xl text-stone-50 font-bold tracking-tight">
                  {lang === 'en' ? 'AetherFly Sovereign Centurion Card' : 'بطاقة كينتوريون السيادية المعدنية'}
                </h3>
                <p className="text-xs text-stone-400 font-mono tracking-widest uppercase">
                  {lang === 'en' ? 'Limited Edition Crafted Pure Titanium' : 'إصدار محدود مصنع من التيتانيوم النقي'}
                </p>
              </div>

              {/* Visual render of Card */}
              <div className="bg-gradient-to-r from-stone-900 via-stone-800 to-stone-950 border border-stone-800 p-6 rounded-2xl shadow-xl space-y-8 max-w-sm">
                <div className="flex justify-between items-center">
                  <span className="font-serif italic font-bold text-[#D4A24C] text-[13px] tracking-widest">AETHERFLY</span>
                  <Sparkles size={16} className="text-[#D4A24C]" />
                </div>
                <div className="space-y-1">
                  <p className="text-xs text-stone-500 font-mono tracking-wider">SOVEREIGN ROYAL CLUB</p>
                  <p className="text-base text-stone-200 font-medium tracking-[0.2em] font-mono">**** **** **** 8987</p>
                </div>
                <div className="flex justify-between items-end">
                  <div>
                    <p className="text-[8px] text-stone-500 font-mono">MEMBER SINCE</p>
                    <p className="text-xs text-stone-300 font-mono">2026</p>
                  </div>
                  <div className="text-right">
                    <p className="text-[8px] text-stone-500 font-mono">CARDHOLDER</p>
                    <p className="text-xs text-stone-300 font-mono font-medium tracking-wide uppercase">REFAD ALAMERI</p>
                  </div>
                </div>
              </div>

              <p className="text-xs text-stone-400 leading-relaxed font-light">
                {lang === 'en'
                  ? 'Your passport to absolute borderless prestige. Automatically receives $5,000 yearly booking credits, personal concierge desk access on WhatsApp, and fast-track custom clearance globally.'
                  : 'جواز سفرك للفخامة والرفاهية المطلقة. تمنحك البطاقة تلقائيًا رصيدًا سنويًا، وكونسيرج خاص فوري مع إنهاء سريع لإجراءات الموانئ.'}
              </p>

              <div className="space-y-2 pt-2 text-xs text-stone-300">
                <p className="flex items-center gap-2">✓ {lang === 'en' ? '$5,000 Complimentary Flight Credits' : 'رصيد حجز مجاني للرحلات'}</p>
                <p className="flex items-center gap-2">✓ {lang === 'en' ? 'Unlimited access to 1,200 VIP Airport lounges' : 'دخول مجاني لصالات انتظار النخبة'}</p>
                <p className="flex items-center gap-2">✓ {lang === 'en' ? 'Private airport transfer via luxury limousine' : 'توصيل عبر ليموزين فاخرة مجانية'}</p>
              </div>

              <button
                onClick={() => triggerSignupToast(lang === 'en' ? 'Sovereign Metal Card' : 'البطاقة السيادية المعدنية')}
                className="w-full bg-[#D4A24C] text-slate-950 font-bold py-3.5 rounded-2xl hover:bg-[#E0B15A] transition-all duration-300 text-xs tracking-wider uppercase cursor-pointer"
              >
                {lang === 'en' ? 'Apply For Sovereign Membership' : 'تقدم بطلب الانضمام كعضو معتمد'}
              </button>
            </div>
          </div>

          {/* Lounge VIP Concierge Premium Services */}
          <div className="bg-white dark:bg-stone-900 border border-slate-200/65 dark:border-stone-800/80 p-8 sm:p-12 rounded-[2rem] shadow-2xl relative overflow-hidden group">
            <div className="absolute top-0 right-0 w-80 h-80 bg-gradient-to-br from-[#D4A24C]/5 to-transparent rounded-full blur-3xl pointer-events-none" />
            
            <div className="space-y-6 relative">
              <span className="p-3 bg-[#D4A24C]/10 border border-[#D4A24C]/25 text-[#D4A24C] rounded-2xl inline-block">
                <Compass size={28} />
              </span>
              
              <div className="space-y-2">
                <h3 className="font-serif text-2xl text-slate-900 dark:text-stone-50 font-bold tracking-tight">
                  {lang === 'en' ? 'Global Private Concierge Lounge Network' : 'شبكة صالات كونسيرج الطيران الاستثنائية'}
                </h3>
                <p className="text-xs text-[#D4A24C] font-mono tracking-widest uppercase">
                  {lang === 'en' ? 'Premium Oasis Gateways on 6 Continents' : 'واحات هادئة فاخرة في ست قارات حول العالم'}
                </p>
              </div>

              <div className="aspect-video w-full rounded-2xl overflow-hidden relative">
                <img
                  src="https://images.unsplash.com/photo-1540555700478-4be289fbecef?auto=format&fit=crop&w=800&q=80"
                  alt="Airport Lounge Premium Caviar Dining Room"
                  className="w-full h-full object-cover grayscale brightness-95 group-hover:grayscale-0 transition-all duration-700"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-black/60 to-transparent" />
                <span className="absolute bottom-4 left-4 bg-slate-950/80 border border-white/10 px-3 py-1 text-[9px] text-white tracking-widest uppercase font-mono font-bold">
                  {lang === 'en' ? 'Private Lounge Core' : 'صالات النواة الرئاسية الموحدة'}
                </span>
              </div>

              <p className="text-xs text-slate-600 dark:text-stone-400 leading-relaxed font-light">
                {lang === 'en'
                  ? 'Step away from the crowd. Our designated VIP Lounges offer rain-fall shower private suites, designer quiet workpods, fine French vintage Champagnes, and curated Beluga caviar on demand.'
                  : 'تجنب صخب المطارات المعتاد. صالاتنا تمنحك استراحة نوم فائقة ومصممة بعزل تام، ومشروبات باردة وكافيار بيلوجا فاخر مجهز لك.'}
              </p>

              <div className="space-y-2 pt-2 text-xs text-slate-700 dark:text-stone-300">
                <p className="flex items-center gap-2">✓ {lang === 'en' ? 'Express Customs & Passport Fast-track Control' : 'التخليص والترانزيت السريع الفوري للأوراق'}</p>
                <p className="flex items-center gap-2">✓ {lang === 'en' ? 'Walk-in rainfall shower suites with designer spa items' : 'حمامات استرخاء مجهزة بمنتجات العناية الاستثنائية'}</p>
                <p className="flex items-center gap-2">✓ {lang === 'en' ? 'Pre-flight customized Chef dining tasting menu' : 'أطباق طعام حصرية ومصممة من الشيف الخاص بك'}</p>
              </div>

              <button
                onClick={() => triggerSignupToast(lang === 'en' ? 'VIP Gateway Access' : 'باقة خدمات الصالات')}
                className="w-full bg-slate-950 text-white dark:bg-[#fbfbfa] dark:text-slate-950 font-bold py-3.5 rounded-2xl hover:bg-slate-800 dark:hover:bg-amber-100 transition-all duration-300 text-xs tracking-wider uppercase cursor-pointer"
              >
                {lang === 'en' ? 'Access Pass Portfolio' : 'استعراض الصالات الشريكة'}
              </button>
            </div>
          </div>

        </div>

      ) : (

        /* STANDARD AND HOLIDAY PACKAGES CARDS GRID WITH DYNAMIC TIMERS */
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
          {filteredOffers.map((offer) => {
            const hasTimer = 'countdownKey' in offer;
            const timer = hasTimer && offer.countdownKey ? timeRemaining[offer.countdownKey] : null;

            return (
              <div
                key={offer.id}
                className="group bg-white dark:bg-stone-900 border border-slate-205/85 dark:border-stone-800/80 rounded-[2rem] overflow-hidden hover:border-[#D4A24C] hover:shadow-2xl transition-all duration-300 flex flex-col justify-between shadow-sm relative"
              >
                {/* Visual Image Header */}
                <div className="h-60 relative overflow-hidden bg-slate-100 dark:bg-stone-950">
                  <img
                    src={offer.image}
                    alt={offer.title}
                    className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-700"
                    referrerPolicy="no-referrer"
                  />
                  
                  {/* Decorative Gradients */}
                  <div className="absolute inset-0 bg-gradient-to-t from-slate-950/70 via-transparent to-slate-950/20" />
                  
                  {/* Offer Badge upper right */}
                  <span className="absolute top-4 right-4 bg-gradient-to-r from-[#E0B15A] to-[#D4A24C] text-slate-950 text-[10px] font-extrabold tracking-widest px-3 py-1.5 rounded-xl uppercase shadow-md">
                    {offer.badge}
                  </span>

                  {/* Tag on upper left */}
                  <span className="absolute top-4 left-4 bg-slate-950/80 border border-white/15 text-stone-100 text-[9px] font-mono tracking-widest px-3 py-1.5 rounded-xl uppercase">
                    {offer.tag}
                  </span>

                  {/* Visual Price Indicator */}
                  <div className="absolute bottom-4 left-4 right-4 flex items-end justify-between text-white">
                    <div className="space-y-0.5">
                      <p className="text-[9px] text-[#D4A24C] uppercase tracking-widest font-mono font-extrabold">AetherFly Curation</p>
                      <h4 className="font-serif text-lg font-bold tracking-tight text-white leading-tight truncate max-w-[200px]">
                        {offer.title}
                      </h4>
                    </div>
                    <div className="text-right">
                      {offer.orignalPrice && (
                        <p className="text-xs text-stone-400 line-through leading-none">${offer.orignalPrice}</p>
                      )}
                      <p className="text-xl font-serif text-[#D4A24C] font-bold leading-none mt-1">
                        ${offer.price.toLocaleString()} <span className="text-[9px] font-sans text-stone-300 font-light">USD</span>
                      </p>
                    </div>
                  </div>
                </div>

                {/* Body Content */}
                <div className="p-6 space-y-6 flex-1 flex flex-col justify-between">
                  <div className="space-y-4">
                    <p className="text-xs text-slate-600 dark:text-stone-400 leading-relaxed font-light">
                      {offer.desc}
                    </p>

                    {/* Features checklist */}
                    <div className="space-y-2 border-t border-slate-100 dark:border-stone-850 pt-4">
                      {offer.features.map((feature, index) => (
                        <div key={index} className="flex items-center gap-2 text-[11px] text-slate-600 dark:text-stone-300">
                          <span className="text-[#D4A24C]">•</span>
                          <span>{feature}</span>
                        </div>
                      ))}
                    </div>
                  </div>

                  {/* Countdown Timer if applicable */}
                  <div className="space-y-4">
                    {hasTimer && timer && (
                      <div className="bg-amber-500/5 dark:bg-amber-500/10 border border-[#D4A24C]/20 p-3 rounded-2xl flex items-center justify-between text-center">
                        <span className="text-[10px] uppercase tracking-widest font-mono font-extrabold text-[#D4A24C] flex items-center gap-1.5 pl-1.5">
                          <Clock size={12} />
                          <span>DEAL ENDS:</span>
                        </span>
                        <div className="flex gap-3 text-stone-800 dark:text-[#fdfdfc] font-mono font-extrabold">
                          <div>
                            <span className="text-xs">{timer.days}</span>
                            <span className="text-[8px] text-stone-400 block font-sans">D</span>
                          </div>
                          <span className="text-stone-400">:</span>
                          <div>
                            <span className="text-xs">{timer.hours}</span>
                            <span className="text-[8px] text-stone-400 block font-sans">H</span>
                          </div>
                          <span className="text-stone-400">:</span>
                          <div>
                            <span className="text-xs">{timer.minutes}</span>
                            <span className="text-[8px] text-stone-400 block font-sans">M</span>
                          </div>
                          <span className="text-stone-400">:</span>
                          <div>
                            <span className="text-xs text-[#D4A24C]">{timer.seconds}</span>
                            <span className="text-[8px] text-stone-400 block font-sans">S</span>
                          </div>
                        </div>
                      </div>
                    )}

                    {/* CTA Button */}
                    {offer.isInquireOnly ? (
                      <button
                        onClick={() => triggerSignupToast(offer.title)}
                        className="w-full bg-[#1a1a1a] text-white dark:bg-stone-50 dark:text-stone-900 font-bold py-3 rounded-xl hover:bg-stone-800 dark:hover:bg-stone-200 transition-all text-xs tracking-wider uppercase cursor-pointer"
                      >
                        {offer.actionLabel}
                      </button>
                    ) : (
                      <button
                        onClick={() => {
                          if (offer.destName && offer.destCode) {
                            onBookOffer(offer.destName, offer.destCode, offer.price);
                          }
                        }}
                        className="w-full bg-[#D4A24C] hover:bg-[#E0B15A] text-slate-950 font-extrabold py-3 rounded-xl transition-all text-xs tracking-wider uppercase cursor-pointer shadow-md shadow-amber-500/5 hover:-translate-y-0.5"
                      >
                        {offer.actionLabel}
                      </button>
                    )}
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* Trust & Guarantee highlights row */}
      <div className="border-t border-slate-205 dark:border-stone-800 pt-16 grid grid-cols-1 md:grid-cols-3 gap-8">
        {[
          {
            icon: <ShieldCheck className="text-[#D4A24C]" size={22} />,
            title: lang === 'en' ? 'Bespoke Custom Flight Planning' : 'تخطيط وتنسيق متميز للمسارات',
            sub: lang === 'en' ? 'Modify route, departures, catering layout or crew staffing instantly up to 6 hours pre-departure.' : 'عدل مسار رحلتك أو طاقم الضيافة أو تفاصيل الطهي بكل أريحية قبل السفر بست ساعات.'
          },
          {
            icon: <Compass className="text-[#D4A24C]" size={22} />,
            title: lang === 'en' ? 'Complete Discretion Guaranteed' : 'السرية والخصوصية التامة المطلقة',
            sub: lang === 'en' ? 'No public airport check-in queues. Terminal paths optimized for secure diplomatic privacy.' : 'لا داعي لانتظار صالات المطار العامة. وفرنا بوابات خاصة لتأمين الخصوصية والراحة الدبلوماسية.'
          },
          {
            icon: <Sparkles className="text-[#D4A24C]" size={22} />,
            title: lang === 'en' ? 'Luxury Financial Integration' : 'إدارة مالية متميزة للمدفوعات',
            sub: lang === 'en' ? 'Incorporate corporate ledger codes, multiple payment cards, or pre-paid credits seamlessly.' : 'تضمين رصيد مالي للشركة متعدد الحسابات بأسلوب متكامل ومريح لإدارتها.'
          }
        ].map((item, id) => (
          <div key={id} className="flex gap-4 p-6 bg-slate-50/50 dark:bg-stone-900/35 border border-slate-200/50 dark:border-stone-800/50 rounded-2xl">
            <span className="shrink-0">{item.icon}</span>
            <div className="space-y-1">
              <h4 className="font-bold text-sm text-slate-900 dark:text-stone-100">{item.title}</h4>
              <p className="text-xs text-[#8b8b80] dark:text-stone-400 leading-relaxed">{item.sub}</p>
            </div>
          </div>
        ))}
      </div>

    </div>
  );
}
