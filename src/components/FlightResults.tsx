import React, { useState, useMemo } from 'react';
import { Flight, SearchParams } from '../types';
import { Plane, Star, Filter, SlidersHorizontal, Eye, ShieldCheck, Heart } from 'lucide-react';
import { AIRLINES } from '../data';

interface FlightResultsProps {
  flights: Flight[];
  searchParams: SearchParams | null;
  onSelectFlight: (flight: Flight) => void;
  lang: 'en' | 'ar';
}

export default function FlightResults({ flights, searchParams, onSelectFlight, lang }: FlightResultsProps) {
  const [sortMethod, setSortMethod] = useState<'cheap' | 'fast' | 'stops'>('cheap');
  const [filterStops, setFilterStops] = useState<number | 'all'>('all');
  const [filterAirline, setFilterAirline] = useState<string | 'all'>('all');
  const [maxPrice, setMaxPrice] = useState<number>(2000);
  const [expandedFlightId, setExpandedFlightId] = useState<string | null>(null);
  const [favorites, setFavorites] = useState<string[]>([]);

  // Toggle Favorite
  const toggleFavorite = (id: string, e: React.MouseEvent) => {
    e.stopPropagation();
    setFavorites(prev =>
      prev.includes(id) ? prev.filter(f => f !== id) : [...prev, id]
    );
  };

  // Extract unique high-price dynamically
  const maxPriceOfDataset = useMemo(() => {
    if (!flights.length) return 2000;
    return Math.max(...flights.map(f => f.price));
  }, [flights]);

  // Adjust maxPrice default dynamically
  React.useEffect(() => {
    if (maxPriceOfDataset > 0) {
      setMaxPrice(maxPriceOfDataset);
    }
  }, [maxPriceOfDataset]);

  // Handle Filter & Sort
  const processedFlights = useMemo(() => {
    let result = [...flights];

    // Filter Stops
    if (filterStops !== 'all') {
      result = result.filter(f => f.stops === filterStops);
    }

    // Filter Airline
    if (filterAirline !== 'all') {
      result = result.filter(f => f.airline === filterAirline);
    }

    // Filter budget price
    result = result.filter(f => f.price <= maxPrice);

    // Sort Method
    if (sortMethod === 'cheap') {
      result.sort((a, b) => a.price - b.price);
    } else if (sortMethod === 'fast') {
      const getMin = (dStr: string) => {
        const parts = dStr.split(' ');
        const h = parseInt(parts[0].replace('h', '')) || 0;
        const m = parseInt(parts[1]?.replace('m', '')) || 0;
        return h * 60 + m;
      };
      result.sort((a, b) => getMin(a.duration) - getMin(b.duration));
    } else if (sortMethod === 'stops') {
      result.sort((a, b) => a.stops - b.stops);
    }

    return result;
  }, [flights, sortMethod, filterStops, filterAirline, maxPrice]);

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
      {/* Header Summary */}
      <div className="flex flex-col md:flex-row md:items-center justify-between mb-8 pb-5 border-b border-[#ecece8] dark:border-[#2a2a28] gap-4">
        <div>
          <h2 className="text-2xl sm:text-3xl font-serif text-[#1a1a1a] dark:text-[#fdfdfc]">
            {searchParams
              ? `${searchParams.from.split('(')[0]} → ${searchParams.to.split('(')[0]}`
              : (lang === 'en' ? 'Available Flights' : 'الرحلات المتاحة')}
          </h2>
          <p className="text-xs text-[#8b8b80] dark:text-[#babab3] mt-1">
            {lang === 'en'
              ? `Showing ${processedFlights.length} luxurious options match your criteria`
              : `عرض ${processedFlights.length} من الرحلات الفاخرة المتاحة`}
          </p>
        </div>

        {/* Sorting Group */}
        <div className="flex flex-wrap items-center gap-2">
          <span className="text-[10px] font-bold text-[#8b8b80] dark:text-[#babab3] uppercase tracking-widest mr-2 flex items-center gap-1.5 font-mono">
            <SlidersHorizontal size={12} />
            {lang === 'en' ? 'Sort By' : 'فرز حسب'}
          </span>
          <button
            onClick={() => setSortMethod('cheap')}
            className={`px-4 py-2 text-xs font-bold rounded-full transition-all cursor-pointer border ${
              sortMethod === 'cheap'
                ? 'bg-gradient-to-r from-[#E0B15A] to-[#D4A24C] text-slate-950 border-transparent shadow-md'
                : 'text-slate-600 dark:text-slate-350 border-slate-200 dark:border-slate-800 hover:bg-slate-50 dark:hover:bg-slate-900/40'
            }`}
          >
            {lang === 'en' ? 'Best Price' : 'أفضل سعر'}
          </button>
          <button
            onClick={() => setSortMethod('fast')}
            className={`px-4 py-2 text-xs font-bold rounded-full transition-all cursor-pointer border ${
              sortMethod === 'fast'
                ? 'bg-gradient-to-r from-[#E0B15A] to-[#D4A24C] text-slate-950 border-transparent shadow-md'
                : 'text-slate-600 dark:text-slate-350 border-slate-200 dark:border-slate-800 hover:bg-slate-50 dark:hover:bg-slate-900/40'
            }`}
          >
            {lang === 'en' ? 'Fastest Route' : 'الأسرع زمنًا'}
          </button>
          <button
            onClick={() => setSortMethod('stops')}
            className={`px-4 py-2 text-xs font-bold rounded-full transition-all cursor-pointer border ${
              sortMethod === 'stops'
                ? 'bg-gradient-to-r from-[#E0B15A] to-[#D4A24C] text-slate-950 border-transparent shadow-md'
                : 'text-slate-600 dark:text-slate-350 border-slate-200 dark:border-slate-800 hover:bg-slate-50 dark:hover:bg-slate-900/40'
            }`}
          >
            {lang === 'en' ? 'Least Stops' : 'أقل توقفات'}
          </button>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-4 gap-8">
        {/* Left Side: Filter Options bar */}
        <div className="lg:col-span-1 space-y-6">
          <div className="bg-white dark:bg-slate-900 border border-slate-200/80 dark:border-slate-800 rounded-3xl p-6 shadow-xl">
            <h3 className="text-sm font-bold text-slate-900 dark:text-white uppercase tracking-wider flex items-center gap-2 mb-6 pb-4 border-b border-slate-100 dark:border-slate-800">
              <Filter size={15} className="text-[#D4A24C]" />
              <span>{lang === 'en' ? 'Filters' : 'تصفية النتائج'}</span>
            </h3>

            {/* Filter by Stops */}
            <div className="space-y-3 mb-6">
              <label className="text-[10px] font-bold text-slate-400 dark:text-slate-500 uppercase tracking-widest block font-mono">
                {lang === 'en' ? 'Stops' : 'التوقفات'}
              </label>
              <div className="flex flex-col gap-2">
                {[
                  { label: lang === 'en' ? 'All' : 'الكل', value: 'all' },
                  { label: lang === 'en' ? 'Non-stop Only' : 'مباشر فقط', value: 0 },
                  { label: lang === 'en' ? '1 Stop' : 'توقف واحد', value: 1 }
                ].map((stopOpt) => (
                  <button
                    key={stopOpt.label}
                    onClick={() => setFilterStops(stopOpt.value as any)}
                    className={`w-full text-left px-4 py-2.5 rounded-xl text-xs font-semibold transition-all cursor-pointer ${
                      filterStops === stopOpt.value
                        ? 'bg-[#D4A24C]/10 text-[#D4A24C] border-l-4 border-[#D4A24C] font-bold'
                        : 'text-slate-600 dark:text-slate-300 hover:bg-slate-50 dark:hover:bg-slate-800/40'
                    }`}
                  >
                    {stopOpt.label}
                  </button>
                ))}
              </div>
            </div>

            {/* Filter by Airline */}
            <div className="space-y-3 mb-6">
              <label className="text-[10px] font-bold text-slate-400 dark:text-slate-500 uppercase tracking-widest block font-mono">
                {lang === 'en' ? 'Airlines' : 'شركات الطيران'}
              </label>
              <div className="flex flex-col gap-2 max-h-48 overflow-y-auto pr-1">
                <button
                  onClick={() => setFilterAirline('all')}
                  className={`w-full text-left px-4 py-2.5 rounded-xl text-xs font-semibold transition-all cursor-pointer ${
                    filterAirline === 'all'
                      ? 'bg-[#D4A24C]/10 text-[#D4A24C] border-l-4 border-[#D4A24C] font-bold'
                      : 'text-slate-600 dark:text-slate-300 hover:bg-slate-50 dark:hover:bg-slate-800/40'
                  }`}
                >
                  {lang === 'en' ? 'All Carriers' : 'كل الشركات'}
                </button>
                {AIRLINES.map((air) => (
                  <button
                    key={air.name}
                    onClick={() => setFilterAirline(air.name)}
                    className={`w-full text-left px-4 py-2.5 rounded-xl text-xs font-semibold transition-all cursor-pointer ${
                      filterAirline === air.name
                        ? 'bg-[#D4A24C]/10 text-[#D4A24C] border-l-4 border-[#D4A24C] font-bold'
                        : 'text-slate-600 dark:text-slate-300 hover:bg-slate-50 dark:hover:bg-slate-800/40'
                    }`}
                  >
                    {air.name}
                  </button>
                ))}
              </div>
            </div>

            {/* Budget price range slider */}
            <div className="space-y-3">
              <label className="text-[10px] font-bold text-slate-400 dark:text-slate-500 uppercase tracking-widest block font-mono">
                {lang === 'en' ? 'Max Price' : 'الحد الأقصى للسعر'}
              </label>
              <input
                type="range"
                min="100"
                max={Math.max(maxPriceOfDataset, 1500)}
                step="50"
                value={maxPrice}
                onChange={e => setMaxPrice(Number(e.target.value))}
                className="w-full h-1 bg-slate-200 dark:bg-slate-800 appearance-none cursor-pointer accent-[#D4A24C]"
              />
              <div className="flex justify-between text-xs font-bold text-[#D4A24C] font-mono">
                <span>$100</span>
                <span>${maxPrice} USD</span>
              </div>
            </div>
          </div>
        </div>

        {/* Right Side: List of Rows */}
        <div className="lg:col-span-3 space-y-4">
          {processedFlights.length === 0 ? (
            <div className="text-center py-16 bg-[#fdfdfc] dark:bg-[#151514] border border-[#ecece8] dark:border-[#2a2a28] rounded-none p-8 space-y-4">
              <Plane size={48} className="mx-auto text-slate-300 dark:text-stone-700 stroke-[1]" />
              <h3 className="font-serif italic text-xl font-bold text-[#1a1a1a] dark:text-[#fdfdfc]">
                {lang === 'en' ? 'No Luxury Flights Match Your Filters' : 'لا توجد رحلات مطابقة للتصفية'}
              </h3>
              <p className="text-xs text-[#8b8b80] dark:text-[#babab3] max-w-sm mx-auto">
                {lang === 'en'
                  ? 'We suggest raising your budget slider or clearing specific airline settings.'
                  : 'نقترح توسيع نطاق الميزانية أو تصفية شركات أخرى.'}
              </p>
              <button
                onClick={() => {
                  setFilterStops('all');
                  setFilterAirline('all');
                  setMaxPrice(maxPriceOfDataset);
                }}
                className="px-5 py-2.5 bg-[#1a1a1a] text-white dark:bg-[#fdfdfc] dark:text-[#121211] font-bold text-xs uppercase tracking-wider rounded-none cursor-pointer hover:bg-stone-800 transition-colors"
              >
                {lang === 'en' ? 'Reset All Filters' : 'إعادة ضبط المصفاة'}
              </button>
            </div>
          ) : (
            processedFlights.map((flight) => {
              const itemAirline = AIRLINES.find(a => a.name === flight.airline);
              const isExpanded = expandedFlightId === flight.id;
              const isFavorite = favorites.includes(flight.id);

              return (
                <div
                  key={flight.id}
                  onClick={() => onSelectFlight(flight)}
                  className="group bg-white dark:bg-slate-900 border border-slate-100 dark:border-slate-800 rounded-3xl overflow-hidden hover:border-[#D4A24C] hover:shadow-xl transition-all duration-300 p-6 flex flex-col gap-6 cursor-pointer shadow-sm"
                >
                  <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-6">
                    {/* Airline Identity */}
                    <div className="flex items-center gap-4 min-w-[200px]">
                      <div className="p-3 bg-amber-500/10 dark:bg-amber-500/5 text-[#D4A24C] rounded-2xl group-hover:bg-[#D4A24C] group-hover:text-slate-950 transition-all duration-350">
                        <Plane size={20} className="transform rotate-45" />
                      </div>
                      <div>
                        <h4 className="font-serif italic text-base font-bold text-slate-900 dark:text-white">{flight.airline}</h4>
                        <div className="flex items-center gap-1.5 text-xs text-slate-400 mt-0.5">
                          <span className="text-[10px] uppercase font-bold text-[#D4A24C] tracking-wide bg-amber-500/10 px-2.5 py-0.5 rounded-md font-mono">
                            {flight.flightNo}
                          </span>
                          <span>•</span>
                          <span className="text-[11px] text-slate-550 dark:text-slate-400">{flight.planeType}</span>
                        </div>
                      </div>
                    </div>

                    {/* Timeline Path Display */}
                    <div className="flex-1 flex items-center justify-center gap-4 sm:gap-6">
                      <div className="text-right">
                        <p className="text-lg sm:text-xl font-bold text-slate-900 dark:text-white leading-none">{flight.departTime}</p>
                        <p className="text-[11px] text-[#D4A24C] font-mono tracking-widest font-extrabold mt-1">{flight.fromCode}</p>
                      </div>

                      {/* Flight Path Graphic with aircraft icon in middle */}
                      <div className="flex-1 relative flex flex-col items-center">
                        <p className="text-[9px] text-slate-400 text-center font-bold mb-1 uppercase tracking-wider font-mono">
                          {flight.duration}
                        </p>
                        <div className="w-full h-[1px] bg-slate-205 dark:bg-slate-800 relative">
                          <Plane
                            size={12}
                            className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 text-[#D4A24C] rotate-90"
                          />
                          {flight.stops > 0 && (
                            <div className="absolute top-1/2 left-1/3 w-2 h-2 rounded-full bg-[#D4A24C] border border-white dark:border-[#121211] transform -translate-y-1/2" title="Transit airport" />
                          )}
                        </div>
                        <p className="text-[9px] font-bold text-[#D4A24C] tracking-widest mt-1 uppercase">
                          {flight.stops === 0 ? (lang === 'en' ? 'Direct' : 'مباشر') : (lang === 'en' ? '1 Stop' : 'توقف واحد')}
                        </p>
                      </div>

                      <div className="text-left">
                        <p className="text-lg sm:text-xl font-bold text-slate-900 dark:text-white leading-none">{flight.arriveTime}</p>
                        <p className="text-[11px] text-[#D4A24C] font-mono tracking-widest font-extrabold mt-1">{flight.toCode}</p>
                      </div>
                    </div>

                    {/* Price and Action Section */}
                    <div className="flex sm:flex-col items-center sm:items-end justify-between sm:justify-center gap-3 pt-4 sm:pt-0 sm:pl-6 border-t sm:border-t-0 sm:border-l border-slate-100 dark:border-slate-800 min-w-[150px]">
                      <div>
                        <p className="text-[9px] font-bold text-slate-400 uppercase tracking-widest text-right sm:block hidden">
                          {lang === 'en' ? 'Starting From' : 'تبدأ من'}
                        </p>
                        <p className="text-2xl sm:text-3xl font-serif text-[#D4A24C] leading-none text-right font-extrabold">
                          <span className="text-sm font-sans font-medium align-top text-[#D4A24C]/80 mr-0.5">$</span>
                          {flight.price}
                        </p>
                      </div>

                      <div className="flex gap-2">
                        {/* Favorite button */}
                        <button
                          onClick={(e) => toggleFavorite(flight.id, e)}
                          className={`p-2 rounded-xl border transition-colors cursor-pointer ${
                            isFavorite
                              ? 'bg-rose-50/50 border-rose-200 text-rose-500 dark:bg-rose-950/25 dark:border-rose-900/40'
                              : 'border-slate-200 dark:border-slate-800 text-slate-400 dark:text-slate-500 hover:text-slate-600 dark:hover:text-slate-350'
                          }`}
                          title="Save flight"
                        >
                          <Heart size={14} fill={isFavorite ? 'currentColor' : 'none'} />
                        </button>

                        <button
                          type="button"
                          onClick={(e) => {
                            e.stopPropagation();
                            setExpandedFlightId(isExpanded ? null : flight.id);
                          }}
                          className="p-2 border border-slate-200 dark:border-slate-800 text-slate-500 hover:text-[#D4A24C] dark:hover:text-white rounded-xl transition-all cursor-pointer"
                          title="Details"
                        >
                          <Eye size={14} />
                        </button>
                      </div>
                    </div>
                  </div>

                  {/* Expanded Custom Cabin Perks Details Card */}
                  {isExpanded && (
                    <div
                      className="anim-fadeIn pt-5 border-t border-slate-100 dark:border-slate-800 grid grid-cols-1 md:grid-cols-3 gap-4 text-xs text-slate-500 dark:text-slate-400"
                      onClick={(e) => e.stopPropagation()}
                    >
                      <div className="bg-slate-50 dark:bg-slate-950 p-4 rounded-2xl border border-slate-100 dark:border-slate-800">
                        <p className="font-bold text-[#D4A24C] font-serif italic text-sm mb-1.5 flex items-center gap-1.5">
                          ✈️ Aircraft Specs
                        </p>
                        <p>Model: {flight.planeType}</p>
                        <p>Cruise Altitude: 39,000 ft</p>
                        <p>Features: Onboard Luxury Lounge, Fast WiFi</p>
                      </div>

                      <div className="bg-slate-50 dark:bg-slate-950 p-4 rounded-2xl border border-slate-100 dark:border-slate-800">
                        <p className="font-bold text-[#D4A24C] font-serif italic text-sm mb-1.5 flex items-center gap-1.5">
                          🍽️ Dining & Amenity
                        </p>
                        <p>Menu: Chef-curated high-cuisine</p>
                        <p>Amenities: Silk pillows, Noise-cancelling headsets</p>
                        <p>Baggage: 2 Complimentary bags included (32kg/each)</p>
                      </div>

                      <div className="bg-amber-500/5 dark:bg-amber-500/10 p-4 rounded-2xl border border-[#D4A24C]/20 flex flex-col justify-between">
                        <div>
                          <p className="font-extrabold text-[#D4A24C] text-[10px] mb-1 uppercase tracking-widest font-mono">
                            AetherFly Selection
                          </p>
                          <p className="text-[10px] leading-relaxed text-slate-600 dark:text-slate-350">
                            Includes priority fast-track security, premium lounge entry, and flexible ticket dates.
                          </p>
                        </div>
                        <button
                          onClick={() => onSelectFlight(flight)}
                          className="mt-3 w-full bg-[#D4A24C] text-slate-950 hover:bg-[#E0B15A] font-bold py-2.5 rounded-xl text-center cursor-pointer transition-all uppercase text-xs shadow-md shadow-amber-500/10"
                        >
                          Select Flight
                        </button>
                      </div>
                    </div>
                  )}
                </div>
              );
            })
          )}
        </div>
      </div>
    </div>
  );
}
