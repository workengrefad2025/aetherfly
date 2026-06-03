import React from 'react';
import { Booking } from '../types';
import { Download, CheckCircle2, ChevronRight, Printer, RefreshCw } from 'lucide-react';

interface BoardingPassProps {
  booking: Booking;
  onNavigateToDashboard: () => void;
  lang: 'en' | 'ar';
}

export default function BoardingPass({ booking, onNavigateToDashboard, lang }: BoardingPassProps) {
  const handlePrint = () => {
    window.print();
  };

  return (
    <div className="max-w-4xl mx-auto px-4 py-12 space-y-8">
      {/* Confirmed Banner */}
      <div className="text-center py-6">
        <div className="inline-flex items-center justify-center p-3 bg-stone-100 dark:bg-[#1e1e1d] text-stone-800 dark:text-stone-200 rounded-none border border-[#ecece8] dark:border-[#2a2a28]">
          <CheckCircle2 size={32} />
        </div>
        <h2 className="mt-4 font-serif text-3xl font-normal text-[#1a1a1a] dark:text-[#fdfdfc]">
          {lang === 'en' ? 'Booking Confirmed' : 'تم تأكيد حجزك الفاخر بنجاح'}
        </h2>
        <p className="text-sm text-[#8b8b80] dark:text-stone-400 mt-2">
          {lang === 'en'
            ? 'Your e-ticket is issued and has been synced with your AetherFly Member Portal.'
            : 'تم إصدار التذكرة وحفظها بنجاح في لوحة تحكم السفر الخاصة بك.'}
        </p>
        <span className="inline-block bg-stone-50 dark:bg-stone-900 border border-[#ecece8] dark:border-[#2a2a28] px-4 py-1.5 rounded-none text-[10px] font-mono text-stone-600 dark:text-stone-300 mt-3 uppercase tracking-wider">
          {lang === 'en' ? 'Flight status: Confirmed' : 'حالة الحجز: مؤكد'}
        </span>
      </div>

      {/* Boarding Pass Ticket layout */}
      <div className="bg-[#fdfdfc] dark:bg-[#151514] border border-[#ecece8] dark:border-[#2a2a28] shadow-none rounded-none overflow-hidden font-sans relative">
        <div className="absolute top-0 bottom-0 left-1/3 w-[1px] border-l border-dashed border-[#ecece8] dark:border-[#2a2a28] hidden md:block" />

        {/* Top Header */}
        <div className="bg-[#1a1a1a] p-6 flex items-center justify-between text-white border-b border-[#ecece8] dark:border-[#2a2a28]">
          <div className="flex items-center gap-3">
            <span className="font-serif text-lg font-bold tracking-tight text-white uppercase">
              Aether<span className="font-serif italic font-normal text-stone-300 lowercase">fly</span>
            </span>
            <span className="text-[9px] tracking-widest text-[#d4cfc3] uppercase font-bold border border-stone-700 px-1.5 py-0.5 rounded-none font-mono">
              Elite
            </span>
          </div>
          <p className="text-xs text-stone-400 font-mono">
            REF: <span className="font-bold text-[#d4cfc3]">{booking.ref}</span>
          </p>
        </div>

        {/* Main Pass Info Grid */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 p-6 sm:p-8">
          {/* Main Left Side - Flight Path */}
          <div className="md:col-span-2 space-y-6">
            <div className="flex justify-between items-center pb-5 border-b border-[#ecece8] dark:border-[#2a2a28]">
              <div>
                <p className="text-[9px] uppercase text-[#8b8b80] dark:text-stone-500 font-bold tracking-widest font-mono">{lang === 'en' ? 'Departure City' : 'مطار المغادرة'}</p>
                <h3 className="text-xl sm:text-2xl font-serif italic text-[#1a1a1a] dark:text-[#fdfdfc] leading-tight">
                  {booking.flight.fromName}
                </h3>
                <p className="text-3xl font-semibold text-[#1a1a1a] dark:text-stone-100 font-sans mt-1">{booking.flight.fromCode}</p>
              </div>

              <div className="flex flex-col items-center flex-1 px-4">
                <ChevronRight className="text-stone-300 dark:text-stone-700 rotate-90 md:rotate-0" size={24} />
              </div>

              <div className="text-right">
                <p className="text-[9px] uppercase text-[#8b8b80] dark:text-stone-500 font-bold tracking-widest font-mono">{lang === 'en' ? 'Arrival Destination' : 'مطار الوصول'}</p>
                <h3 className="text-xl sm:text-2xl font-serif italic text-[#1a1a1a] dark:text-[#fdfdfc] leading-tight">
                  {booking.flight.toName}
                </h3>
                <p className="text-3xl font-semibold text-[#1a1a1a] dark:text-stone-100 font-sans mt-1">{booking.flight.toCode}</p>
              </div>
            </div>

            {/* Traveler Details */}
            <div className="grid grid-cols-2 gap-4 text-xs font-semibold text-stone-600 dark:text-stone-300">
              <div className="space-y-1">
                <span className="text-[#8b8b80] dark:text-stone-500 block uppercase tracking-widest text-[9px] font-mono">{lang === 'en' ? 'PASSENGER NAME' : 'اسم الراكب'}</span>
                <span className="text-[#1a1a1a] dark:text-slate-100 text-sm font-serif font-bold block">{booking.passengerName}</span>
              </div>
              <div className="space-y-1">
                <span className="text-[#8b8b80] dark:text-stone-500 block uppercase tracking-widest text-[9px] font-mono">{lang === 'en' ? 'PASSPORT / IDENTITY' : 'الوثيقة الشخصية'}</span>
                <span className="text-[#1a1a1a] dark:text-slate-100 text-sm block font-mono truncate">{booking.passportNumber}</span>
              </div>
              <div className="space-y-1">
                <span className="text-[#8b8b80] dark:text-stone-500 block uppercase tracking-widest text-[9px] font-mono">{lang === 'en' ? 'DEPARTURE DATE' : 'تاريخ المغادرة'}</span>
                <span className="text-[#1a1a1a] dark:text-slate-100 font-mono block">{booking.date}</span>
              </div>
              <div className="space-y-1">
                <span className="text-[#8b8b80] dark:text-stone-500 block uppercase tracking-widest text-[9px] font-mono">{lang === 'en' ? 'BOARDING TIME' : 'موعد الصعود للطائرة'}</span>
                <span className="text-[#1a1a1a] dark:text-slate-100 font-mono block">
                  {parseInt(booking.flight.departTime.split(':')[0]) - 1}:15 (Zone 3)
                </span>
              </div>
            </div>
          </div>

          {/* Right Side - Auxiliary pass */}
          <div className="md:col-span-1 border-t md:border-t-0 md:border-l border-dashed border-[#ecece8] dark:border-[#2a2a28] md:pl-6 pt-6 md:pt-0 flex flex-col justify-between space-y-6">
            <div className="grid grid-cols-2 gap-3 text-xs font-semibold text-stone-600 dark:text-stone-300">
              <div className="space-y-1">
                <span className="text-[#8b8b80] dark:text-stone-400 text-[9px] uppercase tracking-widest font-mono block">{lang === 'en' ? 'AIRLINE' : 'الشركة الناقلة'}</span>
                <span className="text-[#1a1a1a] dark:text-stone-100 font-bold font-serif block">{booking.flight.airline}</span>
              </div>
              <div className="space-y-1">
                <span className="text-[#8b8b80] dark:text-stone-400 text-[9px] uppercase tracking-widest font-mono block">{lang === 'en' ? 'FLIGHT NO' : 'رقم الرحلة'}</span>
                <span className="text-[#1a1a1a] dark:text-stone-100 font-mono block">{booking.flight.flightNo}</span>
              </div>
              <div className="space-y-1">
                <span className="text-[#8b8b80] dark:text-stone-400 text-[9px] uppercase tracking-widest font-mono block">{lang === 'en' ? 'SUITE SEAT' : 'رقم المقعد'}</span>
                <span className="bg-[#1a1a1a] text-white dark:bg-[#fdfdfc] dark:text-stone-950 px-2 py-0.5 rounded-none font-mono font-bold text-xs inline-block">
                  {booking.seatCode || 'Auto'}
                </span>
              </div>
              <div className="space-y-1">
                <span className="text-[#8b8b80] dark:text-stone-400 text-[9px] uppercase tracking-widest font-mono block">{lang === 'en' ? 'CABIN CLASS' : 'درجة السفر'}</span>
                <span className="text-[#1a1a1a] dark:text-stone-100 block">{booking.seatClass}</span>
              </div>
            </div>

            {/* Simulating a realistic passenger barcode pattern */}
            <div className="space-y-1">
              <div className="w-full h-11 bg-stone-50 dark:bg-[#1e1e1d] flex items-center justify-between px-2 rounded-none overflow-hidden border border-[#ecece8] dark:border-[#2a2a28]">
                {Array.from({ length: 32 }).map((_, i) => (
                  <div
                    key={i}
                    className="h-full bg-stone-900 dark:bg-stone-300"
                    style={{
                      width: `${(i % 3 === 0 ? 3 : i % 5 === 0 ? 1 : 2)}px`,
                      opacity: i % 7 === 0 ? 0.3 : 1
                    }}
                  />
                ))}
              </div>
              <p className="text-[10px] text-center text-[#8b8b80] font-mono leading-none tracking-widest">{booking.ref}</p>
            </div>
          </div>
        </div>
      </div>

      {/* Actions buttons */}
      <div className="flex gap-4 justify-center">
        <button
          onClick={handlePrint}
          className="flex items-center gap-2 px-6 py-3 border border-[#ecece8] dark:border-[#2a2a28] rounded-none hover:border-[#1a1a1a] dark:hover:border-white font-semibold text-xs uppercase tracking-widest transition-all cursor-pointer text-[#1a1a1a] dark:text-[#fdfdfc]"
        >
          <Printer size={14} />
          <span>{lang === 'en' ? 'Print Boarding Pass' : 'طباعة التذكرة'}</span>
        </button>
        <button
          onClick={onNavigateToDashboard}
          className="flex items-center gap-2 px-6 py-3 bg-[#1a1a1a] text-white dark:bg-[#fdfdfc] dark:text-[#121211] font-bold rounded-none text-xs uppercase tracking-widest hover:bg-stone-850 dark:hover:bg-stone-150 transition-all cursor-pointer border border-transparent"
        >
          <RefreshCw size={14} />
          <span>{lang === 'en' ? 'Go to Member Dashboard' : 'الذهاب للوحة التحكم'}</span>
        </button>
      </div>
    </div>
  );
}
