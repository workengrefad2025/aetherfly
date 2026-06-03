import React, { useState, useEffect, Suspense, useMemo, useCallback } from 'react';
import Header from './components/Header';
import Footer from './components/Footer';
import FlightSearch from './components/FlightSearch';
const FlightResults = React.lazy(() => import('./components/FlightResults'));
const SeatMap = React.lazy(() => import('./components/SeatMap'));
const PaymentModal = React.lazy(() => import('./components/PaymentModal'));
const BoardingPass = React.lazy(() => import('./components/BoardingPass'));
const Dashboard = React.lazy(() => import('./components/Dashboard'));
const Support = React.lazy(() => import('./components/Support'));
const About = React.lazy(() => import('./components/About'));
const SignIn = React.lazy(() => import('./components/SignIn'));
const SignUp = React.lazy(() => import('./components/SignUp'));
const CreatorSection = React.lazy(() => import('./components/CreatorSection'));
const OffersAndPromotions = React.lazy(() => import('./components/OffersAndPromotions'));
import { ProtectedRoute } from './components/ProtectedRoute';
import { AuthLoadingSkeleton } from './components/AuthLoadingSkeleton';
import { useAuth } from './hooks/useAuth';
import { useToast } from './hooks/useToast';
import useBookings from './hooks/useBookings';
import { isSupabaseConfigured, AetherPlatformAPI } from './lib/supabase';
import { useFlightSearch } from './hooks/useFlightSearch';

import SupportService, { SupportRequestPayload } from './services/supportService';
import { Flight, Booking, SearchParams, SupportTicket } from './types';
import { generateMockFlights, DESTINATIONS, POPULAR_ROUTES } from './data';
import { motion, AnimatePresence } from 'motion/react';
import { Heart, Sparkles, Star, MapPin, ShieldCheck, Headphones, Lock, ArrowRight } from 'lucide-react';

export default function App() {
  const [currentView, setCurrentView] = useState<string>('home');
  const [lang, setLang] = useState<'en' | 'ar'>('en');
  const [theme, setTheme] = useState<'light' | 'dark'>('light');

  // Search Context states
  const [searchParams, setSearchParams] = useState<SearchParams | null>(null);
  const { flights: flightsList, search: searchFlights } = useFlightSearch();
  const [selectedFlight, setSelectedFlight] = useState<Flight | null>(null);
  const [selectedSeat, setSelectedSeat] = useState<string>('');
  const [seatUpgradeFee, setSeatUpgradeFee] = useState<number>(0);
  const [mostRecentBooking, setMostRecentBooking] = useState<Booking | null>(null);

  // Storage synced states
  const [tickets, setTickets] = useState<SupportTicket[]>([]);
  const [fallbackUser, setFallbackUser] = useState<any>(null);

  const { user: authUser, authLoading, authError, signInWithPassword, signUpWithPassword, signOut } = useAuth();
  const { bookings, loading: bookingsLoading, reload: reloadBookings, createBooking, setBookings } = useBookings(authUser?.id);
  const { notify } = useToast();

  const currentUser = useMemo(
    () =>
      authUser
        ? {
            name: authUser.fullName,
            email: authUser.email,
            tier: authUser.tier,
            credits: `$${authUser.credits.toLocaleString()}`
          }
        : fallbackUser,
    [authUser, fallbackUser]
  );

  // Synchronize on bootstrap entry
  useEffect(() => {
    try {
      const cachedTickets = localStorage.getItem('aetherfly_tickets');
      if (cachedTickets) setTickets(JSON.parse(cachedTickets));

      const cachedUser = localStorage.getItem('aetherfly_user');
      if (cachedUser) {
        setFallbackUser(JSON.parse(cachedUser));
      } else {
        const defaultUser = {
          name: 'Juan Perez',
          email: 'juan.perez@example.com',
          tier: 'Platinum',
          credits: '$2,500'
        };
        setFallbackUser(defaultUser);
        localStorage.setItem('aetherfly_user', JSON.stringify(defaultUser));
      }
    } catch (e) {
      console.warn('Local storage cache failure:', e);
    }
  }, []);

  // Sync state mutations
  const updateBookings = useCallback((newBookings: Booking[]) => {
    setBookings(newBookings);
    localStorage.setItem('aetherfly_bookings', JSON.stringify(newBookings));
  }, [setBookings]);

  const updateTickets = useCallback((newTickets: SupportTicket[]) => {
    setTickets(newTickets);
    localStorage.setItem('aetherfly_tickets', JSON.stringify(newTickets));
  }, []);

  const handleSignIn = useCallback(async (email: string, password: string) => {
    if (isSupabaseConfigured()) {
      await signInWithPassword(email, password);
      notify('Signed in successfully.', 'success');
      setCurrentView('home');
      return;
    }

    const fallback = {
      name: 'AetherFly Member',
      email,
      tier: 'Platinum',
      credits: '$2,500'
    };
    setFallbackUser(fallback);
    localStorage.setItem('aetherfly_user', JSON.stringify(fallback));
    notify('Signed in locally. Supabase is not configured.', 'info');
    setCurrentView('home');
  }, [notify, signInWithPassword]);

  const handleSignUp = useCallback(async (payload: { fullName: string; email: string; password: string; tier: string }) => {
    if (isSupabaseConfigured()) {
      await signUpWithPassword(payload);
      notify('Account created successfully. Welcome aboard!', 'success');
      setCurrentView('home');
      return;
    }

    const fallback = {
      name: payload.fullName,
      email: payload.email,
      tier: payload.tier,
      credits: '$2,500'
    };
    setFallbackUser(fallback);
    localStorage.setItem('aetherfly_user', JSON.stringify(fallback));
    notify('Local account created. Connect Supabase for real persistence.', 'info');
    setCurrentView('home');
  }, [notify, signUpWithPassword]);

  const handleLogOut = useCallback(async () => {
    if (isSupabaseConfigured()) {
      await signOut();
      notify('Signed out securely.', 'info');
    }
    setFallbackUser(null);
    localStorage.removeItem('aetherfly_user');
    setCurrentView('home');
  }, [notify, signOut]);

  // Launch global flight query
  const handleQueryFlights = useCallback((params: SearchParams) => {
    setSearchParams(params);
    setCurrentView('results');

    searchFlights(params).catch((err) => {
      console.warn('Flight search failed:', err);
    });
  }, [searchFlights]);

  const selectFlight = useCallback((flight: Flight) => {
    setSelectedFlight(flight);
    setSelectedSeat('');
    setSeatUpgradeFee(0);
    setCurrentView('details');
  }, []);

  // Handles dynamic seat map clicking
  const handleSelectSeat = useCallback((seatCode: string, upgradeFee: number) => {
    setSelectedSeat(seatCode);
    setSeatUpgradeFee(upgradeFee);
  }, []);

  const handlePayTrigger = useCallback(() => {
    if (!selectedSeat) {
      alert(lang === 'en' ? 'Please select a seat code before proceeding.' : 'يرجى تحديد مقعد أولًا.');
      return;
    }
    setCurrentView('payment');
  }, [selectedSeat, lang]);

  // On successful flight checkout payment registration
  const handleCheckoutSuccess = (passenger: { name: string; passport: string; email: string }) => {
    if (!selectedFlight || !searchParams) return;

    const refNo = `AF-${Math.floor(100000 + Math.random() * 900000)}`;
    const finalPrice = selectedFlight.price + seatUpgradeFee;

    const newBooking: Booking = {
      id: `${refNo}-${Date.now()}`,
      ref: refNo,
      flight: selectedFlight,
      passengerName: passenger.name,
      passportNumber: passenger.passport,
      seatCode: selectedSeat,
      status: 'confirmed',
      price: finalPrice,
      date: searchParams.departDate,
      seatClass: searchParams.seatClass,
      tripType: searchParams.tripType
    };

    // Persist booking (optimistic handled by hook)
    createBooking(newBooking, authUser?.id).catch(err => {
      console.warn('Failed to persist booking to Supabase:', err);
    });

    // Dedicate credit limits
    if (currentUser) {
      const rawCredits = parseInt(currentUser.credits.replace('$', '').replace(',', '')) || 0;
      const remains = Math.max(0, rawCredits - finalPrice);
      const updatedUser = { ...currentUser, credits: `$${remains.toLocaleString()}` };
      setFallbackUser(updatedUser);
      localStorage.setItem('aetherfly_user', JSON.stringify(updatedUser));
    }

    // DBService.createBooking is called inside createBooking when configured

    // Trigger transactional ticket confirmation email dispatch
    const customerEmail = passenger.email || (currentUser ? currentUser.email : 'passenger@aetherfly.com');
    AetherPlatformAPI.dispatchTicketEmail(newBooking, customerEmail)
      .then(dispatch => {
        console.log("[Email Trigger] Automatic ticket confirmation dispatched successfully:", dispatch);
      })
      .catch(err => {
        console.error("Mailing trigger failed:", err);
      });

    setMostRecentBooking(newBooking);
    setCurrentView('ticket');
  };

  // Booking details modifier / cancellations inside Member Center Dashboard
  const handleUpdateBooking = (updated: Booking) => {
    const list = bookings.map(b => b.id === updated.id ? updated : b);
    updateBookings(list);
  };

  const handleCancelBooking = (bookingId: string, refundAmount: number) => {
    const list: Booking[] = bookings.map((b): Booking =>
      b.id === bookingId ? { ...b, status: 'cancelled' } : b
    );
    updateBookings(list);

    // Refund credits back
    if (currentUser) {
      const rawCredits = parseInt(currentUser.credits.replace('$', '').replace(',', '')) || 0;
      const outcome = rawCredits + refundAmount;
      const updatedUser = { ...currentUser, credits: `$${outcome.toLocaleString()}` };
      setFallbackUser(updatedUser);
      localStorage.setItem('aetherfly_user', JSON.stringify(updatedUser));
    }
  };

  // Customer ticketing requests submission
  const handleSubmitTicket = useCallback(async (ticketFields: SupportRequestPayload) => {
    const newTicket: SupportTicket = {
      id: `TKT-${Math.floor(1000 + Math.random() * 90) * 11}`,
      subject: ticketFields.subject,
      category: ticketFields.category,
      message: ticketFields.message,
      status: 'Open',
      date: new Date().toISOString().split('T')[0],
      customerName: ticketFields.fullName,
      customerEmail: ticketFields.email,
      bookingRef: ticketFields.bookingRef
    };

    const nextTickets = [newTicket, ...tickets];
    updateTickets(nextTickets);

    try {
      await SupportService.submitSupportRequest(ticketFields);
      notify('Support ticket submitted. Our concierge team has your request.', 'success');
    } catch (error) {
      console.error('Support submission failed:', error);
      notify('Unable to send support request. Please try again later.', 'error');
    }
  }, [tickets, updateTickets, notify]);

  // Preset destination click trigger
  const handlePresetSelect = useCallback((cityName: string, cityCode: string) => {
    const today = new Date();
    const nextWeek = new Date();
    nextWeek.setDate(today.getDate() + 7);

    const presetParams: SearchParams = {
      from: "Kuala Lumpur (KUL)",
      to: `${cityName} (${cityCode})`,
      departDate: today.toISOString().split('T')[0],
      returnDate: nextWeek.toISOString().split('T')[0],
      passengers: '1',
      seatClass: 'Business',
      tripType: 'roundtrip'
    };

    handleQueryFlights(presetParams);
  }, [handleQueryFlights]);

  const handleNavigate = useCallback((view: string) => {
    if (view === 'destinations') {
      setCurrentView('home');
      setTimeout(() => {
        document.getElementById('destinations')?.scrollIntoView({ behavior: 'smooth', block: 'start' });
      }, 150);
      return;
    }

    setCurrentView(view);
  }, []);

  return (
    <div className={`min-h-screen bg-[#fdfdfc] dark:bg-[#121211] text-[#1a1a1a] dark:text-[#fdfdfc] flex flex-col font-sans transition-colors duration-300`}>
      <Header
        currentView={currentView}
        onNavigate={handleNavigate}
        lang={lang}
        setLang={setLang}
        theme={theme}
        setTheme={setTheme}
        user={currentUser}
        onLogOut={handleLogOut}
      />

      {/* Primary Transition View Container */}
      <div className="flex-1">
        <Suspense fallback={<div className="min-h-[400px]" />}>
          <AnimatePresence mode="wait">
          {currentView === 'home' && (
            <motion.div
              key="home"
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -10 }}
              transition={{ duration: 0.35 }}
              className="space-y-4"
            >
              {/* Premium Hero section with airliner sunset and golden highlight curation */}
              <div className="relative overflow-hidden bg-slate-950 pt-32 pb-44 text-center border-b border-amber-500/10">
                <img
                  src="https://images.unsplash.com/photo-1436491865332-7a61a109cc05?auto=format&fit=crop&w=1600&q=80"
                  alt="AetherFly Golden Flight Cruiser Jet"
                  referrerPolicy="no-referrer"
                  className="absolute inset-0 w-full h-full object-cover opacity-60 filter saturate-100 dark:opacity-40"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-[#fdfdfc] dark:from-[#121211] via-slate-950/20 to-slate-950/30 pointer-events-none" />

                <div className="max-w-4xl mx-auto px-4 relative space-y-8">
                  <span className="inline-flex items-center gap-1.5 text-xs font-bold tracking-[0.2em] text-[#D4A24C] bg-white/90 dark:bg-slate-900/90 border border-[#D4A24C]/20 px-4 py-1.5 rounded-full shadow-sm">
                    <Sparkles size={12} className="text-[#D4A24C]" />
                    <span>A NEW HORIZON IN LUXURY TRAVEL</span>
                  </span>
                  
                  <h1 className="font-serif text-5xl sm:text-7xl font-extrabold tracking-tight text-white drop-shadow-md">
                    Elevate Your <span className="text-[#D4A24C] font-serif">Journey</span>
                  </h1>
                  
                  <p className="max-w-2xl mx-auto text-sm sm:text-base tracking-wide text-white/90 font-medium drop-shadow-sm leading-relaxed">
                    {lang === 'en'
                      ? 'Experience the pinnacle of international travel. From booking to arrival, every detail is curated for your comfort.'
                      : 'أهلاً بك في خدمات إيثر فلاي العالمية. احجز رحلات لجميع وجهاتك المفضلة واستمتع بامتيازات حصرية وهدوء لا يضاهى.'}
                  </p>

                  {/* Horizontal row of three high-end trust badges */}
                  <div className="flex flex-wrap justify-center gap-4 pt-4">
                    <div className="flex items-center gap-2 bg-white/95 dark:bg-slate-900/95 border border-[#D4A24C]/25 px-4 py-2.5 rounded-2xl shadow-md text-xs font-bold text-slate-800 dark:text-slate-100 hover:translate-y-[-1px] transition-transform">
                      <ShieldCheck className="text-[#D4A24C]" size={16} />
                      <span>{lang === 'en' ? 'Best Price Guarantee' : 'ضمان أفضل الأسعار'}</span>
                    </div>

                    <div className="flex items-center gap-2 bg-white/95 dark:bg-slate-900/95 border border-[#D4A24C]/25 px-4 py-2.5 rounded-2xl shadow-md text-xs font-bold text-slate-800 dark:text-slate-100 hover:translate-y-[-1px] transition-transform">
                      <Headphones className="text-[#D4A24C]" size={16} />
                      <span>{lang === 'en' ? '24/7 Support' : 'دعم طوال اليوم'}</span>
                    </div>

                    <div className="flex items-center gap-2 bg-white/95 dark:bg-slate-900/95 border border-[#D4A24C]/25 px-4 py-2.5 rounded-2xl shadow-md text-xs font-bold text-slate-800 dark:text-slate-100 hover:translate-y-[-1px] transition-transform">
                      <Lock className="text-[#D4A24C]" size={16} />
                      <span>{lang === 'en' ? 'Secure Booking' : 'حجز آمن بالكامل'}</span>
                    </div>
                  </div>
                </div>
              </div>

              {/* The core interactive search card */}
              <FlightSearch onSearch={handleQueryFlights} lang={lang} />

              {/* Popular Routes section */}
              <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-24 space-y-12">
                <div className="text-center md:text-left space-y-3">
                  <span className="text-[10px] uppercase tracking-[0.3em] text-[#8b8b80] dark:text-[#b4b4a9] block">Design Narrative No. 14</span>
                  <h2 className="font-serif text-3xl sm:text-5xl font-light italic text-[#1a1a1a] dark:text-[#fdfdfc]">
                    {lang === 'en' ? 'Bespoke Curations' : 'مسارات السفر الفاخرة المنسقة'}
                  </h2>
                  <p className="text-xs text-[#8b8b80] dark:text-[#b4b4a9] tracking-wider max-w-xl">
                    {lang === 'en' ? 'Select a signature curated route matching our top five-star flights.' : 'اضغط على أي وجهة لتحميل الرحلة الخاصة فورًا.'}
                  </p>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
                  {POPULAR_ROUTES.map((route, index) => (
                    <div
                      key={index}
                      onClick={() => handlePresetSelect(route.to.split('(')[0].trim(), route.toCode)}
                      className="group bg-[#fdfdfc] dark:bg-[#1a1a19] border border-[#ecece8] dark:border-[#2a2a28] rounded-none overflow-hidden hover:border-[#1a1a1a] dark:hover:border-white transition-all duration-300 cursor-pointer"
                    >
                      <div className="h-56 relative overflow-hidden bg-[#e8e6e1]">
                        <img
                          src={route.image}
                          alt={route.from}
                          referrerPolicy="no-referrer"
                          className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500 opacity-90 mix-blend-multiply dark:mix-blend-normal"
                        />
                        <div className="absolute top-4 right-4 bg-[#1a1a1a] text-white dark:bg-[#fdfdfc] dark:text-[#121211] px-3 py-1 text-[9px] font-mono tracking-widest uppercase font-bold">
                          From ${route.price} USD
                        </div>
                      </div>
                      <div className="p-6 space-y-2">
                        <p className="text-[10px] uppercase font-bold text-[#8b8b80] dark:text-[#b4b4a9] tracking-[0.2em]">AetherFly Suite Preferred</p>
                        <h4 className="font-serif text-base font-medium text-[#1a1a1a] dark:text-[#fdfdfc] italic">{route.from} ➔ {route.to}</h4>
                        <p className="text-xs text-[#5a5a54] dark:text-[#babab3] font-light leading-relaxed">{route.desc}</p>
                      </div>
                    </div>
                  ))}
                </div>
              </section>

              {/* Premium Destination Grid */}
              <section id="destinations" className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pb-32 space-y-12">
                <div className="text-center space-y-3">
                  <span className="text-[10px] uppercase tracking-[0.3em] text-[#8b8b80] dark:text-[#b4b4a9] block">Worldwide Manifest</span>
                  <h2 className="font-serif text-3xl sm:text-5xl font-light italic text-[#1a1a1a] dark:text-[#fdfdfc]">
                    {lang === 'en' ? 'Sacred Landscapes' : 'وجهاتنا العالمية الأكثر شهرة'}
                  </h2>
                  <p className="text-xs text-[#8b8b80] dark:text-[#b4b4a9] tracking-wider max-w-sm mx-auto">
                    {lang === 'en' ? 'Explore breathtaking private suites across five-star global capitals.' : 'استكشف الوجهات الأكثر صفاءً وهدوءًا حول العالم.'}
                  </p>
                </div>

                <div className="grid grid-cols-2 md:grid-cols-5 gap-6">
                  {DESTINATIONS.map((dest, i) => (
                    <div
                      key={i}
                      onClick={() => handlePresetSelect(dest.city, dest.city === 'Maldives' ? 'MLE' : dest.city.slice(0,3).toUpperCase())}
                      className="group relative h-80 rounded-none overflow-hidden cursor-pointer border border-[#ecece8] dark:border-[#2a2a28] hover:border-[#1a1a1a] dark:hover:border-white transition-all duration-300"
                    >
                      <img
                        src={dest.image}
                        alt={dest.city}
                        referrerPolicy="no-referrer"
                        className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500 opacity-95"
                      />
                      <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/10 to-transparent" />
                      <button className="absolute top-3 right-3 p-2 bg-black/40 hover:bg-black/60 text-white rounded-none transition-colors border border-white/10">
                        <Heart size={13} />
                      </button>
                      <div className="absolute bottom-5 left-5 right-5 text-white">
                        <p className="text-xs font-mono uppercase tracking-widest text-[#d4cfc3]">{dest.country}</p>
                        <p className="text-base font-serif italic font-medium mt-1">{dest.city}</p>
                        <span className="inline-block text-[10px] uppercase tracking-[0.15em] font-bold text-white/90 border-b border-white/20 mt-2 pb-0.5">
                          From ${dest.price} USD
                        </span>
                      </div>
                    </div>
                  ))}
                </div>
              </section>

              {/* Developer & Creator Showcase Section */}
              <CreatorSection lang={lang} />
            </motion.div>
          )}

          {currentView === 'offers' && (
            <motion.div
              key="offers"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="space-y-4 animate-fadeIn"
            >
              <OffersAndPromotions
                lang={lang}
                onBookOffer={(destName, destCode, offerPrice) => {
                  const today = new Date();
                  const nextWeek = new Date();
                  nextWeek.setDate(today.getDate() + 7);

                  const presetParams: SearchParams = {
                    from: "Kuala Lumpur (KUL)",
                    to: `${destName} (${destCode})`,
                    departDate: today.toISOString().split('T')[0],
                    returnDate: nextWeek.toISOString().split('T')[0],
                    passengers: '1',
                    seatClass: 'Business',
                    tripType: 'roundtrip'
                  };

                  handleQueryFlights(presetParams);
                }}
              />
            </motion.div>
          )}

          {currentView === 'results' && (
            <motion.div
              key="results"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="space-y-4"
            >
              <FlightResults
                flights={flightsList}
                searchParams={searchParams}
                onSelectFlight={selectFlight}
                lang={lang}
              />
            </motion.div>
          )}

          {currentView === 'details' && selectedFlight && searchParams && (
            <motion.div
              key="details"
              initial={{ opacity: 0, scale: 0.98 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0 }}
              className="max-w-5xl mx-auto px-4 py-12 space-y-6"
            >
              <div className="flex justify-between items-center pb-4 border-b border-slate-100 dark:border-slate-800">
                <button
                  onClick={() => setCurrentView('results')}
                  className="text-sm font-bold text-[#D4A24C] hover:text-amber-500 cursor-pointer"
                >
                  ← {lang === 'en' ? 'Back to Flight Results' : 'العودة لقائمة الرحلات'}
                </button>
                <span className="text-xs font-semibold text-slate-400">STEP 2 OF 3</span>
              </div>

              <div className="bg-white dark:bg-slate-900 border border-amber-900/5 dark:border-amber-100/5 p-6 rounded-3xl shadow-xl space-y-5">
                <div>
                  <h2 className="font-serif text-2xl font-bold text-slate-800 dark:text-white">
                    {lang === 'en' ? 'Custom Cabin Mapping' : 'مخطط أجنحة كابينة الطائرة'}
                  </h2>
                  <p className="text-xs text-slate-450 mt-1">Select your private suite pod below to continue booking.</p>
                </div>
                <SeatMap
                  seatClass={searchParams.seatClass}
                  selectedSeat={selectedSeat}
                  onSelectSeat={handleSelectSeat}
                  lang={lang}
                />
              </div>

              {selectedSeat && (
                <div className="flex justify-between items-center p-5 bg-gradient-to-r from-slate-900 to-slate-950 text-white rounded-2xl animate-pulse">
                  <div>
                    <p className="text-xs text-[#D4A24C] font-bold">Suite Confirmed: {selectedSeat}</p>
                    <p className="text-[10px] text-slate-400">Total upgrade surcharge of ${seatUpgradeFee} USD</p>
                  </div>
                  <button
                    onClick={handlePayTrigger}
                    className="bg-gradient-to-r from-[#E0B15A] to-[#D4A24C] text-slate-900 font-extrabold text-xs px-5 py-3 rounded-xl cursor-pointer"
                  >
                    {lang === 'en' ? 'Proceed to Payment' : 'متابعة الدفع الفاخر'} →
                  </button>
                </div>
              )}
            </motion.div>
          )}

          {currentView === 'payment' && selectedFlight && searchParams && (
            <motion.div
              key="payment"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="max-w-5xl mx-auto px-4 py-12 space-y-4"
            >
              <button
                onClick={() => setCurrentView('details')}
                className="text-sm font-bold text-[#D4A24C] hover:text-amber-500 cursor-pointer mb-2 inline-block"
              >
                ← {lang === 'en' ? 'Back to Seat Map' : 'العودة لمخطط المقاعد'}
              </button>
              <PaymentModal
                flight={selectedFlight}
                searchParams={searchParams}
                selectedSeat={selectedSeat}
                upgradeFee={seatUpgradeFee}
                onPaymentSuccess={handleCheckoutSuccess}
                lang={lang}
              />
            </motion.div>
          )}

          {currentView === 'ticket' && mostRecentBooking && (
            <motion.div
              key="ticket"
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0 }}
            >
              <BoardingPass
                booking={mostRecentBooking}
                onNavigateToDashboard={() => setCurrentView('dashboard')}
                lang={lang}
              />
            </motion.div>
          )}

          {currentView === 'dashboard' && (
            <ProtectedRoute
              user={currentUser}
              fallback={
                <SignIn
                  onSignIn={handleSignIn}
                  onSwitchToSignUp={() => setCurrentView('signup')}
                  lang={lang}
                  authError={authError}
                />
              }
            >
              <motion.div
                key="dashboard"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
              >
                <Dashboard
                  bookings={bookings}
                  onUpdateBooking={handleUpdateBooking}
                  onCancelBooking={handleCancelBooking}
                  user={currentUser || { name: 'Juan Perez', email: 'member@aetherfly.com', tier: 'Gold', credits: '$2,500' }}
                  lang={lang}
                />
              </motion.div>
            </ProtectedRoute>
          )}

          {currentView === 'support' && (
            <motion.div
              key="support"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
            >
              <Support
                tickets={tickets}
                onSubmitTicket={handleSubmitTicket}
                lang={lang}
              />
            </motion.div>
          )}

          {currentView === 'about' && (
            <motion.div
              key="about"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
            >
              <About lang={lang} />
            </motion.div>
          )}

          {currentView === 'signin' && (
            <motion.div
              key="signin"
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0 }}
            >
              {authLoading ? (
                <AuthLoadingSkeleton />
              ) : (
                <SignIn
                  onSignIn={handleSignIn}
                  onSwitchToSignUp={() => setCurrentView('signup')}
                  lang={lang}
                  authError={authError}
                />
              )}
            </motion.div>
          )}

          {currentView === 'signup' && (
            <motion.div
              key="signup"
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0 }}
            >
              {authLoading ? (
                <AuthLoadingSkeleton />
              ) : (
                <SignUp
                  onSignUp={handleSignUp}
                  onSwitchToSignIn={() => setCurrentView('signin')}
                  lang={lang}
                />
              )}
            </motion.div>
          )}
        </AnimatePresence>
        </Suspense>
      </div>

      <Footer lang={lang} onNavigate={handleNavigate} />
    </div>
  );
}
