import React, { useState, useEffect, Suspense, memo } from 'react';
import { Booking } from '../types';
import { 
  User, ShieldAlert, Award, CreditCard, LayoutDashboard, Ticket, LogOut, Check, X, 
  ShieldCheck, Mail, Database, Terminal, Code, Copy, ChevronRight, ExternalLink, RefreshCw 
} from 'lucide-react';

const AnalyticsCharts = React.lazy(() => import('./DashboardAnalyticsCharts'));

interface DashboardProps {
  bookings: Booking[];
  onUpdateBooking: (updated: Booking) => void;
  onCancelBooking: (id: string, refund: number) => void;
  user: { name: string; email: string; tier: string; credits: string };
  lang: 'en' | 'ar';
}

function Dashboard({
  bookings,
  onUpdateBooking,
  onCancelBooking,
  user,
  lang
}: DashboardProps) {
  const [activeTab, setActiveTab] = useState<'overview' | 'bookings' | 'mailbox' | 'supabase' | 'profile' | 'security'>('overview');
  const [editingBookingId, setEditingBookingId] = useState<string | null>(null);
  const [editName, setEditName] = useState('');
  const [editPassport, setEditPassport] = useState('');

  // Profile forms
  const [profileName, setProfileName] = useState(user.name);
  const [profileEmail, setProfileEmail] = useState(user.email);
  const [profileSaved, setProfileSaved] = useState(false);

  // Security Toggles
  const [twoFactor, setTwoFactor] = useState(true);
  const [emailAlerts, setEmailAlerts] = useState(true);

  // E-mail simulation states
  const [sentEmails, setSentEmails] = useState<any[]>([]);
  const [selectedMailId, setSelectedMailId] = useState<string | null>(null);
  const [sqlCopied, setSqlCopied] = useState(false);

  const activeBookings = bookings.filter(b => b.status === 'Confirmed');

  // Load sent emails from simulation logs
  const reloadEmailsList = () => {
    try {
      const history = localStorage.getItem('aetherfly_sent_emails');
      const loaded = history ? JSON.parse(history) : [];
      setSentEmails(loaded);
      if (loaded.length > 0 && !selectedMailId) {
        setSelectedMailId(loaded[0].id);
      }
    } catch (e) {
      console.warn("Mailbox simulation reload failure:", e);
    }
  };

  useEffect(() => {
    reloadEmailsList();
  }, [activeTab, bookings]);

  // Trigger Booking Detail edit sub-form
  const handleStartEdit = (b: Booking) => {
    setEditingBookingId(b.id);
    setEditName(b.passengerName);
    setEditPassport(b.passportNumber);
  };

  const handleSaveEdit = (b: Booking) => {
    onUpdateBooking({
      ...b,
      passengerName: editName,
      passportNumber: editPassport
    });
    setEditingBookingId(null);
  };

  const handleCancelClick = (b: Booking) => {
    const today = new Date();
    const dep = new Date(b.date);
    const diffTime = Math.abs(dep.getTime() - today.getTime());
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));

    let refundRate = 0.5; // 50% refund closer to date
    if (diffDays > 7) refundRate = 0.90; // 90% refund if more than a week
    else if (diffDays >= 3) refundRate = 0.75;

    const penalty = Math.round(b.price * (1 - refundRate));
    const refund = b.price - penalty;

    const msg = lang === 'en'
      ? `Are you sure you want to cancel this booking? \nCancellation penalty: $${penalty} USD (${Math.round((1-refundRate)*100)}%). \nRefund amount to miles/credits: $${refund} USD.`
      : `هل أنت متأكد من إلغاء هذا الحجز؟ \nرسوم الإلغاء: ${penalty} دولار. \nالمبلغ المسترجع: ${refund} دولار.`;

    if (window.confirm(msg)) {
      onCancelBooking(b.id, refund);
    }
  };

  const handleSaveProfile = (e: React.FormEvent) => {
    e.preventDefault();
    setProfileSaved(true);
    setTimeout(() => setProfileSaved(false), 3000);
  };

  // SQL Copy trigger
  const handleCopySQL = () => {
    const ddl = `
-- USER PROFILES TABLE
create table public.user_profiles (
  id uuid references auth.users on delete cascade primary key,
  updated_at timestamp with time zone default timezone('utc'::text, now()) not null,
  full_name text not null,
  email text unique not null,
  tier text default 'Platinum'::text,
  credits numeric default 2500.00 not null,
  created_at timestamp with time zone default timezone('utc'::text, now()) not null
);

-- BOOKINGS HISTORY TABLE
create table public.bookings (
  id uuid default gen_random_uuid() primary key,
  ref_code text unique not null,
  user_id uuid references public.user_profiles(id) on delete set null,
  passenger_name text not null,
  passenger_email text not null,
  passport_number text not null,
  seat_code text not null,
  seat_class text,
  trip_type text,
  price numeric not null,
  flight_no text not null,
  airline text not null,
  depart_date text not null,
  status text default 'Confirmed'
);`;
    navigator.clipboard.writeText(ddl);
    setSqlCopied(true);
    setTimeout(() => setSqlCopied(false), 3000);
  };

  const activeMailDetail = sentEmails.find(m => m.id === selectedMailId) || sentEmails[0];

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
        
        {/* Left Side: Sidebar Menu controls */}
        <aside className="lg:col-span-3 bg-white dark:bg-stone-900 border border-amber-900/5 dark:border-stone-800/60 rounded-[2rem] p-6 shadow-xl space-y-6">
          <div className="flex items-center gap-3 pb-5 border-b border-slate-100 dark:border-stone-800/80">
            <div className="w-12 h-12 rounded-2xl bg-amber-500/10 text-[#D4A24C] flex items-center justify-center font-bold text-lg font-serif">
              {profileName.charAt(0)}
            </div>
            <div>
              <h3 className="font-serif text-base font-bold text-slate-900 dark:text-slate-50">{profileName}</h3>
              <p className="text-[10px] text-[#D4A24C] font-extrabold uppercase tracking-widest">{user.tier} Member</p>
            </div>
          </div>

          <nav className="flex flex-col gap-1">
            {[
              { id: 'overview', label: lang === 'en' ? 'Overview' : 'نظرة عامة', icon: <LayoutDashboard size={17} /> },
              { id: 'bookings', label: lang === 'en' ? 'My Bookings' : 'حجوزاتي', icon: <Ticket size={17} /> },
              { id: 'mailbox', label: lang === 'en' ? 'Simulated Inbox' : 'صندوق البريد المحاكي', icon: <Mail size={17} />, badge: sentEmails.length > 0 ? sentEmails.length : undefined },
              { id: 'supabase', label: lang === 'en' ? 'Supabase & Server' : 'إعدادات قاعدة البيانات', icon: <Database size={17} /> },
              { id: 'profile', label: lang === 'en' ? 'Personal Details' : 'بياناتي الشخصية', icon: <User size={17} /> },
              { id: 'security', label: lang === 'en' ? 'Secure Options' : 'الأمان والخصوصية', icon: <ShieldAlert size={17} /> }
            ].map(tab => (
              <button
                key={tab.id}
                onClick={() => {
                  setActiveTab(tab.id as any);
                  if (tab.id === 'mailbox') reloadEmailsList();
                }}
                className={`w-full flex items-center justify-between px-4 py-3 rounded-xl text-xs font-bold transition-all cursor-pointer ${
                  activeTab === tab.id
                    ? 'bg-gradient-to-r from-[#E0B15A]/10 to-[#D4A24C]/10 text-[#D4A24C] border-l-4 border-[#D4A24C]'
                    : 'text-slate-600 dark:text-stone-400 hover:bg-slate-50 dark:hover:bg-stone-900/50'
                }`}
              >
                <div className="flex items-center gap-3">
                  {tab.icon}
                  <span>{tab.label}</span>
                </div>
                {tab.badge !== undefined && (
                  <span className="bg-[#D4A24C] text-slate-950 font-bold text-[9px] px-2 py-0.5 rounded-full font-mono">
                    {tab.badge}
                  </span>
                )}
              </button>
            ))}
          </nav>
        </aside>

        {/* Right Side: Tab outlet panels */}
        <main className="lg:col-span-9 space-y-6">

          {/* OVERVIEW TAB */}
          {activeTab === 'overview' && (
            <div className="space-y-6 animate-fadeIn">
              {/* Top Row Cards */}
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                <div className="bg-white dark:bg-stone-900 p-5 rounded-2xl border border-slate-100 dark:border-stone-800/85">
                  <span className="text-2xl">👑</span>
                  <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest mt-2">{lang === 'en' ? 'Miles Tier' : 'فئة العضوية'}</p>
                  <p className="text-xl font-bold text-slate-900 dark:text-slate-50 mt-1">{user.tier}</p>
                </div>
                <div className="bg-white dark:bg-stone-900 p-5 rounded-2xl border border-slate-100 dark:border-stone-800/85">
                  <span className="text-2xl">💳</span>
                  <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest mt-2">{lang === 'en' ? 'Aether Credits' : 'الرصيد المتوفر'}</p>
                  <p className="text-xl font-extrabold text-[#D4A24C] mt-1 font-mono">{user.credits}</p>
                </div>
                <div className="bg-white dark:bg-stone-900 p-5 rounded-2xl border border-slate-100 dark:border-stone-800/85">
                  <span className="text-2xl">✈️</span>
                  <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest mt-2">{lang === 'en' ? 'Active Flights' : 'الرحلات النشطة'}</p>
                  <p className="text-xl font-bold text-slate-900 dark:text-slate-50 mt-1">{activeBookings.length} Flights</p>
                </div>
              </div>

              {/* Boarding Pass for Upcoming Travel */}
              {activeBookings.length > 0 && (
                <div className="bg-gradient-to-br from-slate-900 to-slate-950 text-white rounded-[2rem] p-6 border border-amber-500/10 space-y-4">
                  <div className="flex justify-between items-center">
                    <span className="text-xs font-semibold text-[#D4A24C] uppercase tracking-widest">
                      {lang === 'en' ? 'Next Boarding Departure' : 'الرحلة القادمة المغادرة'}
                    </span>
                    <span className="bg-emerald-500 text-slate-950 font-bold text-[10px] px-2.5 py-0.5 rounded-full uppercase">
                      ON TIME
                    </span>
                  </div>

                  <div className="flex justify-between items-center py-4 border-b border-dashed border-slate-800">
                    <div>
                      <h4 className="text-3xl font-bold text-white font-serif">{activeBookings[0].flight.fromCode}</h4>
                      <p className="text-xs text-slate-400 mt-1">{activeBookings[0].flight.fromName}</p>
                    </div>
                    <div className="flex-1 flex flex-col items-center px-4 relative">
                      <p className="text-[10px] text-[#D4A24C] font-extrabold mb-1 font-mono">{activeBookings[0].flight.duration}</p>
                      <div className="w-full h-[1px] bg-slate-800 relative">
                        <div className="absolute top-1/2 left-1/2 w-1.5 h-1.5 rounded-full bg-[#D4A24C] transform -translate-x-1/2 -translate-y-1/2" />
                      </div>
                      <p className="text-[9px] text-slate-500 mt-1 font-mono">{activeBookings[0].flight.flightNo}</p>
                    </div>
                    <div className="text-right">
                      <h4 className="text-3xl font-bold text-white font-serif">{activeBookings[0].flight.toCode}</h4>
                      <p className="text-xs text-slate-400 mt-1">{activeBookings[0].flight.toName}</p>
                    </div>
                  </div>

                  <div className="flex flex-wrap items-center justify-between gap-4 text-xs font-semibold text-slate-400 pt-2">
                    <p>{lang === 'en' ? 'Passenger:' : 'اسم الراكب:'} <strong className="text-white">{activeBookings[0].passengerName}</strong></p>
                    <p>{lang === 'en' ? 'Suite Seat:' : 'المقعد المختار:'} <strong className="text-[#D4A24C] bg-amber-500/10 px-2 py-0.5 rounded font-mono">{activeBookings[0].seatCode}</strong></p>
                    <p>{lang === 'en' ? 'Date:' : 'التاريخ:'} <strong className="text-white font-mono">{activeBookings[0].date}</strong></p>
                  </div>
                </div>
              )}

              {/* Dashboard analytics charts are split into a lazy-loaded chunk for bundle reduction. */}
              <Suspense fallback={<div className="grid grid-cols-1 gap-6"><div className="h-56 rounded-3xl bg-slate-100 dark:bg-stone-900 animate-pulse" /><div className="h-56 rounded-3xl bg-slate-100 dark:bg-stone-900 animate-pulse" /></div>}>
                <AnalyticsCharts lang={lang} />
              </Suspense>
            </div>
          )}

          {/* MY BOOKINGS TAB */}
          {activeTab === 'bookings' && (
            <div className="bg-white dark:bg-stone-900 border border-slate-100 dark:border-stone-800/85 rounded-3xl p-6 space-y-6 shadow-xl animate-fadeIn">
              <div>
                <h2 className="font-serif text-xl font-bold text-slate-900 dark:text-slate-50">
                  {lang === 'en' ? 'Manage Bookings' : 'إدارة حجوزاتي'}
                </h2>
                <p className="text-xs text-slate-400 mt-1 font-light">Review active passes, edit details, or request cancellations.</p>
              </div>

              {bookings.length === 0 ? (
                <div className="text-center py-12 text-[#8b8b80] space-y-2">
                  <p className="text-3xl">🎫</p>
                  <p className="font-bold text-sm">{lang === 'en' ? 'No Registered Bookings Found' : 'لا توجد حجوزات مسجلة'}</p>
                </div>
              ) : (
                <div className="space-y-4">
                  {bookings.map((b) => (
                    <div
                      key={b.id}
                      className={`p-5 rounded-2xl border transition-all ${
                        b.status === 'Cancelled'
                          ? 'border-slate-100 bg-slate-50/50 dark:border-stone-950/20 dark:bg-stone-950/20 opacity-60'
                          : 'border-slate-100 bg-white dark:border-stone-850 dark:bg-stone-950/30'
                      }`}
                    >
                      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                        <div>
                          <div className="flex items-center gap-2">
                            <span className="font-serif text-lg font-bold text-slate-800 dark:text-slate-100">
                              {b.flight.fromCode} → {b.flight.toCode}
                            </span>
                            <span className="text-[10px] bg-slate-100 dark:bg-stone-800 px-2 py-0.5 rounded text-slate-400 font-mono">
                              {b.flight.flightNo}
                            </span>
                          </div>
                          <p className="text-xs text-slate-400 mt-1 font-semibold">
                            {b.flight.airline} • {b.date} • {b.seatClass} (Seat {b.seatCode})
                          </p>
                        </div>

                        <div className="flex items-center gap-3">
                          <span className={`text-[10px] px-2.5 py-1 rounded-full font-bold uppercase ${
                            b.status === 'Confirmed'
                              ? 'bg-emerald-500/10 text-emerald-500'
                              : 'bg-rose-500/10 text-rose-500'
                          }`}>
                            {b.status === 'Confirmed' ? (lang === 'en' ? 'Confirmed' : 'مؤكد') : (lang === 'en' ? 'Cancelled' : 'ملغى')}
                          </span>

                          {b.status === 'Confirmed' && (
                            <div className="flex gap-2">
                              <button
                                onClick={() => handleStartEdit(b)}
                                className="px-3 py-1.5 bg-slate-100 dark:bg-stone-800 hover:bg-slate-200 dark:hover:bg-stone-700 rounded-xl text-[11px] font-bold text-slate-700 dark:text-slate-200 transition-colors cursor-pointer"
                              >
                                {lang === 'en' ? 'Edit Details' : 'تحديث البيانات'}
                              </button>
                              <button
                                onClick={() => handleCancelClick(b)}
                                className="px-3 py-1.5 bg-rose-500/10 hover:bg-rose-500 hover:text-white rounded-xl text-[11px] font-bold text-rose-500 transition-colors cursor-pointer"
                              >
                                {lang === 'en' ? 'Cancel' : 'إلغاء'}
                              </button>
                            </div>
                          )}
                        </div>
                      </div>

                      {/* Editing Sub-form */}
                      {editingBookingId === b.id && (
                        <div className="mt-4 pt-4 border-t border-dashed border-slate-100 dark:border-stone-800 grid grid-cols-1 md:grid-cols-2 gap-4">
                          <div className="space-y-1">
                            <label className="text-[10px] text-slate-400 uppercase font-bold block">Traveler Name</label>
                            <input
                              type="text"
                              value={editName}
                              onChange={e => setEditName(e.target.value)}
                              className="w-full px-3 py-2 bg-slate-50 dark:bg-stone-950 text-xs font-semibold rounded-xl border border-slate-200 dark:border-stone-800 focus:outline-none focus:border-[#D4A24C]"
                            />
                          </div>
                          <div className="space-y-1">
                            <label className="text-[10px] text-slate-400 uppercase font-bold block">Passport Number</label>
                            <input
                              type="text"
                              value={editPassport}
                              onChange={e => setEditPassport(e.target.value)}
                              className="w-full px-3 py-2 bg-slate-50 dark:bg-stone-950 text-xs font-semibold rounded-xl border border-slate-200 dark:border-stone-800 focus:outline-none focus:border-[#D4A24C]"
                            />
                          </div>
                          <div className="md:col-span-2 flex gap-2 justify-end pt-2">
                            <button
                              onClick={() => setEditingBookingId(null)}
                              className="p-1 px-3 bg-slate-205 hover:bg-slate-350 dark:bg-stone-800 dark:hover:bg-stone-700 text-xs rounded-xl font-bold text-slate-600 dark:text-stone-300 transition-colors cursor-pointer"
                            >
                              Cancel
                            </button>
                            <button
                              onClick={() => handleSaveEdit(b)}
                              className="p-1 px-3 bg-[#D4A24C] hover:bg-amber-500 text-xs rounded-xl font-bold text-slate-950 transition-colors cursor-pointer"
                            >
                              Save Changes
                            </button>
                          </div>
                        </div>
                      )}
                    </div>
                  ))}
                </div>
              )}
            </div>
          )}

          {/* SIMULATED INBOX (MAILBOX) TAB */}
          {activeTab === 'mailbox' && (
            <div className="bg-white dark:bg-stone-900 border border-slate-105 dark:border-stone-800/85 rounded-3xl p-6 space-y-6 shadow-xl animate-fadeIn">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                <div>
                  <h2 className="font-serif text-xl font-bold text-slate-900 dark:text-slate-50 flex items-center gap-2">
                    <Mail size={22} className="text-[#D4A24C]" />
                    <span>{lang === 'en' ? 'Simulated Inbox & Verification Hub' : 'صندوق بريد تأكيد التذاكر المحاكي'}</span>
                  </h2>
                  <p className="text-xs text-slate-400 mt-1 font-light">
                    {lang === 'en' 
                      ? 'Every completed checkout auto-generates a full HTML ticket confirmation sent here to verify SMTP/Edge service rendering.' 
                      : 'كل حجز ناجح يُرسل تلقائيًا نسخة تأكيد متكاملة لصندوق البريد لفحص جودة التصاميم والأكواد قبل الربط بالسيرفر.'}
                  </p>
                </div>
                <button
                  onClick={reloadEmailsList}
                  className="flex items-center gap-1.5 px-3 py-1.5 bg-slate-100 hover:bg-slate-200 dark:bg-stone-800 dark:hover:bg-stone-700 rounded-xl text-xs font-bold text-slate-700 dark:text-stone-200 transition-colors cursor-pointer align-self-start sm:align-self-auto"
                >
                  <RefreshCw size={13} />
                  <span>{lang === 'en' ? 'Refresh Inbox' : 'تحديث البريد'}</span>
                </button>
              </div>

              {sentEmails.length === 0 ? (
                <div className="text-center py-20 border border-dashed border-slate-200 dark:border-stone-800 rounded-2xl text-[#8b8b80] space-y-4">
                  <p className="text-5xl">📨</p>
                  <div>
                    <p className="font-serif font-semibold text-base text-slate-855 dark:text-stone-205">
                      {lang === 'en' ? 'Your Mailbox is Empty' : 'صندوق البريد خالٍ حاليًا'}
                    </p>
                    <p className="text-xs text-slate-400 mt-1 max-w-md mx-auto leading-relaxed">
                      {lang === 'en'
                        ? 'Search for flights, custom packages, or honeymoon deals. Complete a ticket payment booking with any email address, and view the fully formatted HTML receipt immediately!'
                        : 'جرب البحث عن رحلة أو باقات الفواخير، وأتمم الحجز بأي بريد إلكتروني، ثم ارجع لتشاهد التفاصيل وتصميم البريد المرسل فور الحجز!'}
                    </p>
                  </div>
                </div>
              ) : (
                <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
                  
                  {/* Left Column: Email Sidebar List */}
                  <div className="lg:col-span-5 space-y-2 max-h-[500px] overflow-y-auto pr-1">
                    {sentEmails.map((mail, idx) => (
                      <div
                        key={mail.id}
                        onClick={() => setSelectedMailId(mail.id)}
                        className={`p-4 rounded-xl border text-left transition-all duration-200 cursor-pointer ${
                          selectedMailId === mail.id
                            ? 'border-[#D4A24C] bg-[#D4A24C]/5'
                            : 'border-slate-100 dark:border-stone-850 hover:border-slate-300 dark:hover:border-stone-700'
                        }`}
                      >
                        <div className="flex justify-between items-center gap-2">
                          <span className="inline-block bg-emerald-500/15 text-emerald-600 dark:text-emerald-400 text-[8px] font-extrabold tracking-wider px-2 py-0.5 rounded uppercase font-mono">
                            {mail.status}
                          </span>
                          <span className="text-[9px] text-slate-400 font-mono">
                            {new Date(mail.sentAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                          </span>
                        </div>
                        <h4 className="font-bold text-xs text-slate-800 dark:text-stone-100 mt-2 truncate">
                          {mail.subject}
                        </h4>
                        <p className="text-[10px] text-slate-400 dark:text-stone-500 mt-1 truncate">
                          To: {mail.to}
                        </p>
                        <p className="text-[10px] text-[#D4A24C] font-mono font-medium mt-1 uppercase">
                          REF: {mail.ticketRef}
                        </p>
                      </div>
                    ))}
                  </div>

                  {/* Right Column: HTML Template Viewer View */}
                  <div className="lg:col-span-7 bg-white dark:bg-stone-950 border border-slate-105 dark:border-stone-850 rounded-2xl overflow-hidden shadow-inner flex flex-col min-h-[500px]">
                    <div className="bg-slate-50 dark:bg-stone-900 px-5 py-4 border-b border-slate-100 dark:border-stone-850 space-y-1 text-left">
                      <p className="text-[10px] text-[#D4A24C] font-mono font-extrabold tracking-widest uppercase">dispatched html render</p>
                      <h4 className="text-xs font-bold text-slate-800 dark:text-stone-100">
                        {activeMailDetail?.subject}
                      </h4>
                      <p className="text-[10px] text-slate-400">
                        Sender: <strong className="text-slate-600 dark:text-stone-300">concierge@aetherfly.com</strong> • Recipient: <strong className="text-slate-600 dark:text-stone-300">{activeMailDetail?.to}</strong>
                      </p>
                    </div>

                    {/* Renders HTML inside secure sandboxed iframe for absolute compliance */}
                    <div className="flex-1 bg-white p-2">
                      {activeMailDetail && (
                        <iframe
                          title="Email HTML Preview"
                          srcDoc={activeMailDetail.htmlContent}
                          className="w-full h-[380px] border-0"
                          sandbox="allow-same-origin"
                        />
                      )}
                    </div>
                  </div>

                </div>
              )}
            </div>
          )}

          {/* SUPABASE & ADVANCED ARCHITECTURE TAB */}
          {activeTab === 'supabase' && (
            <div className="bg-white dark:bg-stone-900 border border-slate-105 dark:border-stone-800/85 rounded-3xl p-6 space-y-6 shadow-xl animate-fadeIn text-left">
              <div className="space-y-2">
                <h2 className="font-serif text-xl font-bold text-slate-900 dark:text-slate-50 flex items-center gap-2">
                  <Database size={22} className="text-[#D4A24C]" />
                  <span>{lang === 'en' ? 'Supabase & Resend API Architecture' : 'قاعدة البيانات وتهيئة السيرفرات'}</span>
                </h2>
                <p className="text-xs text-slate-400 font-light">
                  {lang === 'en'
                    ? 'The entire project architecture is pre-configured and ready to connect to Supabase database Tables and Resend/SendGrid edge mailing functions.'
                    : 'تم إعداد وتهيئة المشروع كلي الصياغة البرمجية، ولم يتبقَ سوى إدخال روابط مفاتيح Supabase ليتحول تلقائياً من التخزين المؤقت إلى السحابي.'}
                </p>
              </div>

              {/* Status Section */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="p-4 bg-slate-50 dark:bg-stone-950 border border-slate-200/50 dark:border-stone-800 rounded-xl space-y-3">
                  <div className="flex items-center justify-between">
                    <span className="text-xs font-bold text-slate-700 dark:text-stone-300 uppercase tracking-wider">Database Link (Supabase)</span>
                    <span className="inline-flex items-center gap-1 text-[10px] font-bold text-amber-500 bg-amber-500/10 px-2 py-0.5 rounded font-mono">
                      <Terminal size={11} />
                      READY TO BIND
                    </span>
                  </div>
                  <p className="text-[11px] text-slate-555 dark:text-stone-400">
                    Reads from <code className="font-mono bg-slate-205 dark:bg-stone-900 px-1 py-0.5 rounded text-[10px]">VITE_SUPABASE_URL</code>. Fallback uses local storage proxies if empty to prevent startup crash or blank states.
                  </p>
                </div>

                <div className="p-4 bg-slate-50 dark:bg-stone-950 border border-slate-200/50 dark:border-stone-800 rounded-xl space-y-3">
                  <div className="flex items-center justify-between">
                    <span className="text-xs font-bold text-slate-700 dark:text-stone-300 uppercase tracking-wider">Mailer Edge (Resend API)</span>
                    <span className="inline-flex items-center gap-1 text-[10px] font-bold text-amber-500 bg-amber-500/10 px-2 py-0.5 rounded font-mono">
                      <Mail size={11} />
                      READY TO MAIL
                    </span>
                  </div>
                  <p className="text-[11px] text-slate-555 dark:text-stone-400">
                    Uses <code className="font-mono bg-slate-205 dark:bg-stone-900 px-1 py-0.5 rounded text-[10px]">VITE_RESEND_API_KEY</code>. Falls back to generating beautifully structured templates inside the Sim Sandbox.
                  </p>
                </div>
              </div>

              {/* SQL Creator Panel */}
              <div className="border border-slate-200/60 dark:border-stone-800 rounded-2xl overflow-hidden bg-slate-950 text-stone-200">
                <div className="bg-slate-900 px-5 py-3 flex items-center justify-between border-b border-stone-800">
                  <span className="text-xs uppercase font-mono tracking-widest text-[#D4A24C] font-extrabold flex items-center gap-2">
                    <Code size={13} />
                    <span>Supabase DB SQL Schema (DDL)</span>
                  </span>
                  <button
                    onClick={handleCopySQL}
                    className="flex items-center gap-1.5 px-3 py-1 bg-stone-800 hover:bg-stone-750 text-xs font-bold text-[#D4A24C] border border-[#D4A24C]/20 rounded-xl transition-colors cursor-pointer"
                  >
                    <Copy size={12} />
                    <span>{sqlCopied ? 'Copied!' : 'Copy Schema'}</span>
                  </button>
                </div>
                <div className="p-5 max-h-56 overflow-y-auto text-left">
                  <pre className="text-[10px] font-mono leading-relaxed text-[#b4b4a9] whitespace-pre-wrap">
                    {`-- Create User Profiles
create table public.user_profiles (
  id uuid references auth.users on delete cascade primary key,
  updated_at timestamp with time zone default timezone('utc'::text, now()) not null,
  full_name text not null,
  email text unique not null,
  tier text default 'Platinum'::text check (tier in ('Classic', 'Gold', 'Platinum', 'Royal Centurion')),
  credits numeric default 2500.00 not null,
  created_at timestamp with time zone default timezone('utc'::text, now()) not null
);

-- Create Bookings History Table
create table public.bookings (
  id uuid default gen_random_uuid() primary key,
  ref_code text unique not null,
  created_at timestamp with time zone default timezone('utc'::text, now()) not null,
  user_id uuid references public.user_profiles(id) on delete set null,
  passenger_name text not null,
  passenger_email text not null,
  passport_number text not null,
  seat_code text not null,
  seat_class text check (seat_class in ('Economy', 'Business', 'First')),
  trip_type text check (trip_type in ('roundtrip', 'oneway')),
  price numeric not null,
  flight_no text not null,
  airline text not null,
  depart_date text not null,
  status text default 'Confirmed' check (status in ('Confirmed', 'Cancelled'))
);`}
                  </pre>
                </div>
              </div>

              {/* Vercel Deployment Instructions */}
              <div className="p-6 bg-slate-50 dark:bg-stone-900/40 border border-slate-200/50 dark:border-stone-800 rounded-2xl space-y-4">
                <span className="text-[10px] uppercase font-mono tracking-widest text-[#D4A24C] font-extrabold block">Vercel Deployment & Optimization Instructions</span>
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 text-xs">
                  <div className="space-y-1">
                    <h4 className="font-bold text-slate-800 dark:text-stone-100">1. Build Configs</h4>
                    <p className="text-slate-400 font-light text-[11px]">Deploy directly on Vercel without tweaking package scripts. Outputs static content into the SPA Router seamlessly.</p>
                  </div>
                  <div className="space-y-1">
                    <h4 className="font-bold text-slate-800 dark:text-stone-100">2. Env Variables</h4>
                    <p className="text-slate-400 font-light text-[11px]">Set database credentials in Vercel. Vercel automatically links variables to your live edge server.</p>
                  </div>
                  <div className="space-y-1">
                    <h4 className="font-bold text-slate-800 dark:text-stone-100">3. Speed Optimization</h4>
                    <p className="text-slate-400 font-light text-[11px]">Images use responsive Unsplash sizes, fonts are bundled via preconnections, maximizing Lighthouse speeds.</p>
                  </div>
                </div>
              </div>

            </div>
          )}

          {/* PERSONAL DETAILS TAB */}
          {activeTab === 'profile' && (
            <div className="bg-white dark:bg-stone-900 border border-slate-105 rounded-3xl p-6 space-y-6 shadow-xl animate-fadeIn">
              <div>
                <h2 className="font-serif text-xl font-bold text-slate-900 dark:text-slate-50">
                  {lang === 'en' ? 'Personal Profile Details' : 'البيانات الشخصية'}
                </h2>
                <p className="text-xs text-slate-400 mt-1 font-light">Keep your profile polished and ready for elite charter deviations.</p>
              </div>

              <form onSubmit={handleSaveProfile} className="space-y-4">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-left">
                  <div className="space-y-1.5">
                    <label className="text-xs font-bold text-slate-400 uppercase tracking-wide">Full Name</label>
                    <input
                      type="text"
                      value={profileName}
                      onChange={e => setProfileName(e.target.value)}
                      className="w-full px-4 py-3 bg-slate-50 dark:bg-stone-950 border border-slate-200/60 dark:border-stone-800 focus:border-[#D4A24C] focus:outline-none rounded-xl text-sm font-semibold transition-all"
                    />
                  </div>
                  <div className="space-y-1.5">
                    <label className="text-xs font-bold text-slate-400 uppercase tracking-wide">Email Address</label>
                    <input
                      type="email"
                      value={profileEmail}
                      onChange={e => setProfileEmail(e.target.value)}
                      className="w-full px-4 py-3 bg-slate-50 dark:bg-stone-950 border border-slate-200/60 dark:border-stone-800 focus:border-[#D4A24C] focus:outline-none rounded-xl text-sm font-semibold transition-all"
                    />
                  </div>
                </div>

                <div className="flex items-center gap-1.5">
                  <button
                    type="submit"
                    className="px-5 py-2.5 bg-gradient-to-r from-[#E0B15A] to-[#D4A24C] text-slate-950 font-bold text-sm rounded-xl cursor-pointer hover:shadow-md transition-shadow"
                  >
                    Save Changes
                  </button>
                  {profileSaved && (
                    <p className="text-xs text-emerald-400 font-bold ml-3 flex items-center gap-1">
                      <Check size={14} />
                      <span>Saved successfully!</span>
                    </p>
                  )}
                </div>
              </form>
            </div>
          )}

          {/* SECURITY TAB */}
          {activeTab === 'security' && (
            <div className="bg-white dark:bg-stone-900 border border-slate-105 rounded-3xl p-6 space-y-6 shadow-xl animate-fadeIn text-left">
              <div>
                <h2 className="font-serif text-xl font-bold text-slate-900 dark:text-slate-50">
                  {lang === 'en' ? 'Security & Preferences' : 'الأمان وتفضيلات الدخول'}
                </h2>
                <p className="text-xs text-slate-400 mt-1 font-light">Configure advanced authentication tiers and communication Cadences.</p>
              </div>

              <div className="space-y-4">
                <div className="flex items-center justify-between p-4 bg-slate-50 dark:bg-stone-950/40 rounded-2xl border border-slate-100 dark:border-stone-850">
                  <div>
                    <h4 className="text-sm font-bold text-slate-800 dark:text-stone-100">Two-Factor Authentication</h4>
                    <p className="text-xs text-slate-400 mt-0.5">Enrich account security by sending secure OTP codes on login entry.</p>
                  </div>
                  <button
                    onClick={() => setTwoFactor(!twoFactor)}
                    className={`w-12 h-6 rounded-full p-1 transition-colors cursor-pointer ${
                      twoFactor ? 'bg-[#D4A24C]' : 'bg-slate-200 dark:bg-slate-850'
                    }`}
                  >
                    <div className={`w-4 h-4 rounded-full bg-white transition-transform ${twoFactor ? 'translate-x-6' : ''}`} />
                  </button>
                </div>

                <div className="flex items-center justify-between p-4 bg-slate-50 dark:bg-slate-950/40 rounded-2xl border border-slate-100 dark:border-stone-850">
                  <div>
                    <h4 className="text-sm font-bold text-slate-800 dark:text-slate-100">Live Flight Status SMS Alerts</h4>
                    <p className="text-xs text-slate-400 mt-0.5">Send immediate SMS alerts of gate deviation or time changes.</p>
                  </div>
                  <button
                    onClick={() => setEmailAlerts(!emailAlerts)}
                    className={`w-12 h-6 rounded-full p-1 transition-colors cursor-pointer ${
                      emailAlerts ? 'bg-[#D4A24C]' : 'bg-slate-200 dark:bg-slate-850'
                    }`}
                  >
                    <div className={`w-4 h-4 rounded-full bg-white transition-transform ${emailAlerts ? 'translate-x-6' : ''}`} />
                  </button>
                </div>
              </div>
            </div>
          )}

        </main>
      </div>
    </div>
  );
}

export default memo(Dashboard);
