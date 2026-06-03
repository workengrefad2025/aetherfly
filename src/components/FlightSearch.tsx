import React, { useState, useEffect, useRef } from 'react';
import { SearchParams } from '../types';
import { useAirportAutocomplete } from '../hooks/useAirportAutocomplete';
import { Calendar, User, Compass, Shield, HelpCircle, ArrowRightLeft, Sparkles } from 'lucide-react';

interface FlightSearchProps {
  onSearch: (params: SearchParams) => void;
  lang: 'en' | 'ar';
}

export default function FlightSearch({ onSearch, lang }: FlightSearchProps) {
  const [tripType, setTripType] = useState<'roundtrip' | 'oneway'>('roundtrip');
  const [fromQuery, setFromQuery] = useState('');
  const [toQuery, setToQuery] = useState('');
  const [showFromSuggestions, setShowFromSuggestions] = useState(false);
  const [showToSuggestions, setShowToSuggestions] = useState(false);
  const [departDate, setDepartDate] = useState('');
  const [returnDate, setReturnDate] = useState('');
  const [passengers, setPassengers] = useState('1');
  const [seatClass, setSeatClass] = useState<'Economy' | 'Business' | 'First'>('Economy');

  const fromRef = useRef<HTMLDivElement>(null);
  const toRef = useRef<HTMLDivElement>(null);

  // Set default dates
  useEffect(() => {
    const today = new Date();
    const nextWeek = new Date();
    nextWeek.setDate(today.getDate() + 7);

    setDepartDate(today.toISOString().split('T')[0]);
    setReturnDate(nextWeek.toISOString().split('T')[0]);
  }, []);

  // Handle outside clicks to close autocompletes
  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (fromRef.current && !fromRef.current.contains(event.target as Node)) {
        setShowFromSuggestions(false);
      }
      if (toRef.current && !toRef.current.contains(event.target as Node)) {
        setShowToSuggestions(false);
      }
    }
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const fromAirportSearch = useAirportAutocomplete(fromQuery);
  const toAirportSearch = useAirportAutocomplete(toQuery);

  const filteredFromCities = fromAirportSearch.results;
  const filteredToCities = toAirportSearch.results;

  const handleSwap = () => {
    const temp = fromQuery;
    setFromQuery(toQuery);
    setToQuery(temp);
    fromAirportSearch.setQuery(toQuery);
    toAirportSearch.setQuery(temp);
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!fromQuery.trim() || !toQuery.trim()) return;

    onSearch({
      from: fromQuery,
      to: toQuery,
      departDate,
      returnDate: tripType === 'roundtrip' ? returnDate : '',
      passengers,
      seatClass,
      tripType
    });
  };

  // Set specific popular query helper
  const selectQuery = (field: 'from' | 'to', val: string) => {
    if (field === 'from') {
      setFromQuery(val);
      fromAirportSearch.setQuery(val);
      setShowFromSuggestions(false);
    } else {
      setToQuery(val);
      toAirportSearch.setQuery(val);
      setShowToSuggestions(false);
    }
  };

  return (
    <div className="relative -mt-10 sm:-mt-24 z-10 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
      <div className="bg-white/95 dark:bg-slate-900/95 border border-slate-200/80 dark:border-slate-800 rounded-3xl p-6 sm:p-8 max-w-full shadow-2xl backdrop-blur-md">
        {/* Navigation Tabs (Round Trip, One Way, Multi-city) */}
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between border-b border-slate-100 dark:border-slate-800 pb-5 mb-6 gap-4">
          <div className="flex gap-2 p-1 bg-slate-100 dark:bg-slate-950 rounded-xl self-start">
            <button
              type="button"
              onClick={() => setTripType('roundtrip')}
              className={`px-4 py-2 text-xs font-bold rounded-lg transition-all cursor-pointer ${
                tripType === 'roundtrip'
                  ? 'bg-slate-900 text-white dark:bg-slate-50 dark:text-slate-950 shadow-sm'
                  : 'text-slate-500 hover:text-slate-800 dark:text-slate-400 dark:hover:text-slate-100'
              }`}
            >
              {lang === 'en' ? 'Round Trip' : 'ذهاب وعودة'}
            </button>
            <button
              type="button"
              onClick={() => setTripType('oneway')}
              className={`px-4 py-2 text-xs font-bold rounded-lg transition-all cursor-pointer ${
                tripType === 'oneway'
                  ? 'bg-slate-900 text-white dark:bg-slate-50 dark:text-slate-950 shadow-sm'
                  : 'text-slate-500 hover:text-slate-800 dark:text-slate-400 dark:hover:text-slate-100'
              }`}
            >
              {lang === 'en' ? 'One Way' : 'اتجاه واحد'}
            </button>
            <button
              type="button"
              onClick={() => alert('Multi-city is available inside the Custom Chart builder or Dashboard paths.')}
              className="px-4 py-2 text-xs font-bold rounded-lg text-slate-400 dark:text-slate-600 cursor-not-allowed"
            >
              {lang === 'en' ? 'Multi-city' : 'وجهات متعددة'}
            </button>
          </div>

          <div className="flex flex-wrap gap-4">
            {/* Passenger Count Selection */}
            <div className="flex items-center gap-2">
              <User size={15} className="text-[#3b3b30]" />
              <select
                value={passengers}
                onChange={e => setPassengers(e.target.value)}
                className="bg-transparent text-xs font-bold text-slate-700 dark:text-slate-300 border-none focus:ring-0 cursor-pointer"
              >
                <option value="1">1 {lang === 'en' ? 'Passenger' : 'مسافر'}</option>
                <option value="2">2 {lang === 'en' ? 'Passengers' : 'مسافرين'}</option>
                <option value="3">3 {lang === 'en' ? 'Passengers' : 'مسافرين'}</option>
                <option value="4">4 {lang === 'en' ? 'Passengers' : 'مسافرين'}</option>
                <option value="family">{lang === 'en' ? 'Family (4+ Pax)' : 'عائلة (أكثر من 4)'}</option>
              </select>
            </div>

            {/* Seat Class Selection */}
            <div className="flex items-center gap-2">
              <Compass size={15} className="text-[#3b3b30]" />
              <select
                value={seatClass}
                onChange={e => setSeatClass(e.target.value as any)}
                className="bg-transparent text-xs font-bold text-slate-700 dark:text-slate-300 border-none focus:ring-0 cursor-pointer"
              >
                <option value="Economy">{lang === 'en' ? 'Economy' : 'الدرجة السياحية'}</option>
                <option value="Business">{lang === 'en' ? 'Business Class' : 'أعمال'}</option>
                <option value="First">{lang === 'en' ? 'First Class' : 'الدرجة الأولى'}</option>
              </select>
            </div>
          </div>
        </div>

        {/* Input Forms */}
        <form onSubmit={handleSubmit} className="grid grid-cols-1 lg:grid-cols-12 gap-5 items-end">
          {/* From Destination */}
          <div ref={fromRef} className="lg:col-span-3 relative">
            <label className="block text-[10px] uppercase tracking-[0.25em] font-extrabold text-slate-400 dark:text-slate-500 mb-1.5 font-mono">
              {lang === 'en' ? 'From' : 'من'}
            </label>
            <div className="relative">
              <input
                type="text"
                value={fromQuery}
                placeholder={lang === 'en' ? 'Where from?' : 'مدينة المغادرة؟'}
                onFocus={() => setShowFromSuggestions(true)}
                onChange={e => {
                  const value = e.target.value;
                  setFromQuery(value);
                  fromAirportSearch.setQuery(value);
                  setShowFromSuggestions(true);
                }}
                className="w-full pl-5 pr-5 py-3.5 bg-slate-50 dark:bg-slate-950 text-slate-900 dark:text-white border border-slate-200 dark:border-slate-800 focus:border-[#D4A24C] dark:focus:border-[#D4A24C] focus:bg-white focus:outline-none rounded-2xl text-sm font-semibold transition-all"
              />
            </div>

            {showFromSuggestions && (
              <div className="absolute top-22 left-0 right-0 max-h-60 overflow-y-auto bg-white dark:bg-slate-950 border border-slate-200 dark:border-slate-800 rounded-2xl shadow-2xl z-50 p-2 space-y-1">
                {fromAirportSearch.loading ? (
                  <div className="px-4 py-3 text-xs text-slate-500 dark:text-slate-400">{lang === 'en' ? 'Searching airports...' : 'جارٍ البحث عن المطارات...'}</div>
                ) : filteredFromCities.length > 0 ? (
                  filteredFromCities.map((city) => (
                    <button
                      key={city.id}
                      type="button"
                      onClick={() => selectQuery('from', city.label)}
                      className="w-full text-left px-4 py-3 hover:bg-[#D4A24C]/10 dark:hover:bg-[#D4A24C]/15 rounded-xl transition-colors flex items-center justify-between text-sm cursor-pointer"
                    >
                      <div>
                        <span className="font-bold text-slate-800 dark:text-slate-100">{city.airportName ?? city.city}</span>
                        <span className="text-xs text-slate-400 dark:text-slate-500 block">{city.city} · {city.country}</span>
                      </div>
                      <span className="bg-[#D4A24C]/10 text-[#D4A24C] dark:bg-[#D4A24C]/20 px-2 py-1 rounded text-xs font-extrabold font-mono">{city.code}</span>
                    </button>
                  ))
                ) : (
                  <div className="px-4 py-3 text-xs text-slate-500 dark:text-slate-400">{lang === 'en' ? 'No matching airports found.' : 'لم يتم العثور على مطارات متطابقة.'}</div>
                )}
              </div>
            )}
          </div>

          {/* Swap Trigger */}
          <div className="lg:col-span-1 flex justify-center py-2 lg:py-0">
            <button
              type="button"
              onClick={handleSwap}
              className="p-3.5 bg-slate-50 dark:bg-slate-950 hover:bg-[#D4A24C]/10 hover:text-[#D4A24C] dark:hover:bg-[#D4A24C]/10 rounded-full transition-all cursor-pointer border border-[#ecece8] dark:border-slate-800 shadow-sm"
              title="Swap destinations"
            >
              <ArrowRightLeft size={16} className="text-slate-600 dark:text-slate-300" />
            </button>
          </div>

          {/* To Destination */}
          <div ref={toRef} className="lg:col-span-3 relative">
            <label className="block text-[10px] uppercase tracking-[0.25em] font-extrabold text-slate-400 dark:text-slate-500 mb-1.5 font-mono">
              {lang === 'en' ? 'To' : 'إلى'}
            </label>
            <div className="relative">
              <input
                type="text"
                value={toQuery}
                placeholder={lang === 'en' ? 'Where to?' : 'مدينة الوصول؟'}
                onFocus={() => setShowToSuggestions(true)}
                onChange={e => {
                  const value = e.target.value;
                  setToQuery(value);
                  toAirportSearch.setQuery(value);
                  setShowToSuggestions(true);
                }}
                className="w-full pl-5 pr-5 py-3.5 bg-slate-50 dark:bg-slate-950 text-slate-900 dark:text-white border border-slate-200 dark:border-slate-800 focus:border-[#D4A24C] dark:focus:border-[#D4A24C] focus:bg-white focus:outline-none rounded-2xl text-sm font-semibold transition-all"
              />
            </div>

            {showToSuggestions && (
              <div className="absolute top-22 left-0 right-0 max-h-60 overflow-y-auto bg-white dark:bg-slate-950 border border-slate-200 dark:border-slate-800 rounded-2xl shadow-2xl z-50 p-2 space-y-1">
                {toAirportSearch.loading ? (
                  <div className="px-4 py-3 text-xs text-slate-500 dark:text-slate-400">{lang === 'en' ? 'Searching airports...' : 'جارٍ البحث عن المطارات...'}</div>
                ) : filteredToCities.length > 0 ? (
                  filteredToCities.map((city) => (
                    <button
                      key={city.id}
                      type="button"
                      onClick={() => selectQuery('to', city.label)}
                      className="w-full text-left px-4 py-3 hover:bg-[#D4A24C]/10 dark:hover:bg-[#D4A24C]/15 rounded-xl transition-colors flex items-center justify-between text-sm cursor-pointer"
                    >
                      <div>
                        <span className="font-bold text-slate-800 dark:text-slate-100">{city.airportName ?? city.city}</span>
                        <span className="text-xs text-slate-400 dark:text-slate-500 block">{city.city} · {city.country}</span>
                      </div>
                      <span className="bg-[#D4A24C]/10 text-[#D4A24C] dark:bg-[#D4A24C]/20 px-2 py-1 rounded text-xs font-extrabold font-mono">{city.code}</span>
                    </button>
                  ))
                ) : (
                  <div className="px-4 py-3 text-xs text-slate-500 dark:text-slate-400">{lang === 'en' ? 'No matching airports found.' : 'لم يتم العثور على مطارات متطابقة.'}</div>
                )}
              </div>
            )}
          </div>

          {/* Depart Date */}
          <div className="col-span-1 lg:col-span-2">
            <label className="block text-[10px] uppercase tracking-[0.25em] font-extrabold text-slate-400 dark:text-slate-500 mb-1.5 font-mono">
              {lang === 'en' ? 'Depart' : 'المغادرة'}
            </label>
            <div className="relative">
              <input
                type="date"
                value={departDate}
                onChange={e => setDepartDate(e.target.value)}
                className="w-full pl-4 pr-4 py-3.5 bg-slate-50 dark:bg-slate-950 text-slate-900 dark:text-white border border-slate-200 dark:border-slate-800 focus:border-[#D4A24C] dark:focus:border-[#D4A24C] focus:bg-white focus:outline-none rounded-2xl text-sm font-medium transition-all cursor-pointer"
              />
            </div>
          </div>

          {/* Return Date */}
          <div className="col-span-1 lg:col-span-2">
            <label className="block text-[10px] uppercase tracking-[0.25em] font-extrabold text-slate-400 dark:text-slate-500 mb-1.5 font-mono">
              {lang === 'en' ? 'Return' : 'العودة'}
            </label>
            <div className="relative">
              <input
                type="date"
                value={returnDate}
                disabled={tripType === 'oneway'}
                onChange={e => setReturnDate(e.target.value)}
                className="w-full pl-4 pr-4 py-3.5 bg-slate-50 dark:bg-slate-950 text-slate-900 dark:text-white border border-slate-200 dark:border-slate-800 focus:border-[#D4A24C] dark:focus:border-[#D4A24C] focus:bg-white focus:outline-none rounded-2xl text-sm font-medium transition-all cursor-pointer disabled:opacity-30 disabled:cursor-not-allowed"
              />
            </div>
          </div>

          {/* Search Button */}
          <div className="col-span-1 lg:col-span-1 flex items-end">
            <button
              type="submit"
              className="w-full bg-gradient-to-r from-[#E0B15A] to-[#D4A24C] hover:from-amber-400 hover:to-amber-500 text-slate-950 hover:shadow-lg hover:-translate-y-0.5 shadow-amber-500/10 py-4 rounded-2xl transition-all duration-300 flex items-center justify-center gap-2 cursor-pointer font-bold"
              title="Search flights"
            >
              <Sparkles size={16} />
              <span className="uppercase text-xs font-extrabold tracking-wider">{lang === 'en' ? 'Search' : 'بحث'}</span>
            </button>
          </div>
        </form>
      </div>

      {/* Trust Badge Grid underneath search console */}
      <div className="grid grid-cols-2 md:grid-cols-5 gap-4 mt-12">
        {[
          { label: '500+ Airlines', sub: 'Global network', icon: '✈️' },
          { label: 'Best Prices', sub: 'Guaranteed', icon: '💎' },
          { label: 'Easy Booking', sub: 'Fast & Secure', icon: '⚡' },
          { label: 'Flexible Tickets', sub: 'Change with ease', icon: '📅' },
          { label: 'Trusted by Millions', sub: 'Happy travelers', icon: '⭐️' }
        ].map((badge, idx) => (
          <div
            key={idx}
            className="flex items-center gap-4 p-5 bg-white/90 dark:bg-slate-900/90 backdrop-blur-md rounded-2xl border border-slate-100 dark:border-slate-800/80 hover:border-[#D4A24C] dark:hover:border-[#D4A24C] shadow-lg hover:shadow-xl transition-all duration-300"
          >
            <span className="text-xl">{badge.icon}</span>
            <div>
              <p className="text-xs font-bold text-slate-900 dark:text-white leading-tight">
                {badge.label}
              </p>
              <p className="text-[10px] text-slate-400 dark:text-slate-500 mt-0.5 leading-tight">{badge.sub}</p>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
