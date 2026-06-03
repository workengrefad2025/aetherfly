import React, { useState } from 'react';
import { Sofa, Shield, Info, CheckCircle2 } from 'lucide-react';

interface SeatMapProps {
  seatClass: 'Economy' | 'Premium Economy' | 'Business' | 'First';
  selectedSeat: string;
  onSelectSeat: (seatCode: string, upgradeFee: number) => void;
  lang: 'en' | 'ar';
}

export default function SeatMap({ seatClass, selectedSeat, onSelectSeat, lang }: SeatMapProps) {
  // Generate a schema of seat rows.
  // First Class: Rows 1-2. Structure: A - C - D (luxury spacious)
  // Business Class: Rows 3-6. Structure: A, B - D, E
  // Economy Class: Rows 7-16. Structure: A, B, C - D, E, F
  const rows = Array.from({ length: 16 }).map((_, idx) => {
    const rowNum = idx + 1;
    let type: 'first' | 'business' | 'economy' = 'economy';
    let label = 'Economy';
    let letters = ['A', 'B', 'C', 'D', 'E', 'F'];
    let baseUpgrade = 0;

    if (rowNum <= 2) {
      type = 'first';
      label = 'First Class Su';
      letters = ['A', 'D', 'F'];
      baseUpgrade = 250;
    } else if (rowNum <= 6) {
      type = 'business';
      label = 'Business Suite';
      letters = ['A', 'B', 'E', 'F'];
      baseUpgrade = 120;
    }

    return { rowNum, type, label, letters, baseUpgrade };
  });

  // Mock taking some seats deterministically to make it look active
  const isSeatTaken = (row: number, letter: string) => {
    const codeVal = `${row}${letter}`;
    // Exclude selected seat
    if (codeVal === selectedSeat) return false;
    // Pseudo-deterministic taken seats based on hash
    const hash = (row * 7 + letter.charCodeAt(0)) % 10;
    return hash < 4; // Roughly 40% seats are taken
  };

  const handleSeatClick = (code: string, rowType: 'first' | 'business' | 'economy', baseFee: number) => {
    onSelectSeat(code, baseFee);
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row items-center justify-between gap-4 p-4 bg-[#fdfdfc] dark:bg-[#151514] border border-[#ecece8] dark:border-[#2a2a28] rounded-none">
        <div className="flex items-start gap-3">
          <Info className="text-stone-500 shrink-0 mt-0.5" size={16} />
          <div className="text-xs sm:text-sm text-[#8b8b80] dark:text-stone-300">
            <p className="font-bold text-[#1a1a1a] dark:text-[#fdfdfc] uppercase tracking-wider text-xs">
              {lang === 'en' ? 'Select Your Boarding Suite' : 'اختر جناحك المفضل'}
            </p>
            <p className="text-stone-400 mt-0.5">
              {lang === 'en'
                ? `You selected seat class in ${seatClass}. Upgrading to Business or First rows dynamically updates fare.`
                : 'التبديل بين الدرجات الفاخرة يقوم بتحديث الفاتورة تلقائيًا.'}
            </p>
          </div>
        </div>

        {selectedSeat && (
          <div className="flex items-center gap-2 bg-[#1a1a1a] text-white dark:bg-[#fdfdfc] dark:text-[#121211] px-4 py-2 rounded-none text-xs font-mono font-bold tracking-wider">
            <CheckCircle2 size={14} />
            <span>{selectedSeat}</span>
          </div>
        )}
      </div>

      <div className="grid grid-cols-1 md:grid-cols-12 gap-8">
        {/* Seating Map Legend Indicators */}
        <div className="md:col-span-3 space-y-4">
          <div className="bg-[#fdfdfc] dark:bg-[#151514] p-5 rounded-none border border-[#ecece8] dark:border-[#2a2a28] shadow-none">
            <h4 className="text-[10px] font-bold text-[#8b8b80] uppercase tracking-widest mb-4 font-mono">
              {lang === 'en' ? 'Seat Legend' : 'دليل المقاعد'}
            </h4>
            <div className="space-y-3">
              <div className="flex items-center gap-2.5 text-xs text-slate-600 dark:text-slate-300 font-medium">
                <div className="w-5 h-5 rounded-none bg-stone-100 border border-[#ecece8] dark:bg-stone-900 dark:border-stone-850" />
                <span>{lang === 'en' ? 'Available Suite' : 'مقعد مغادر متاح'}</span>
              </div>
              <div className="flex items-center gap-2.5 text-xs text-slate-600 dark:text-slate-300 font-medium">
                <div className="w-5 h-5 rounded-none bg-[#1a1a1a] text-white dark:bg-[#fdfdfc] dark:text-stone-950 font-bold flex items-center justify-center text-[10px]">
                  ✓
                </div>
                <span>{lang === 'en' ? 'Your Selected Seat' : 'مقعدك المختار'}</span>
              </div>
              <div className="flex items-center gap-2.5 text-xs text-slate-600 dark:text-slate-300 font-medium">
                <div className="w-5 h-5 rounded-none bg-stone-200 dark:bg-stone-800 text-slate-400 flex items-center justify-center text-[10px]" />
                <span>{lang === 'en' ? 'Reserved (Taken)' : 'مقعد محجوز مسبقًا'}</span>
              </div>
            </div>

            <div className="mt-6 pt-5 border-t border-[#ecece8] dark:border-[#2a2a28] space-y-3">
              <label className="text-[10px] font-bold text-[#8b8b80] uppercase tracking-widest block font-mono">
                {lang === 'en' ? 'Cabin Upgrades' : 'أقسام الطائرة'}
              </label>
              <div className="space-y-1 text-[11px] text-[#8b8b80] font-mono">
                <p className="flex justify-between">
                  <span className="font-bold text-[#1a1a1a] dark:text-[#fdfdfc]">First Cabin:</span>
                  <span>+$250 USD</span>
                </p>
                <p className="flex justify-between">
                  <span className="font-bold text-[#1a1a1a] dark:text-[#fdfdfc]">Business:</span>
                  <span>+$120 USD</span>
                </p>
                <p className="flex justify-between">
                  <span className="font-bold text-[#8b8b80]">Standard:</span>
                  <span>+$0 USD</span>
                </p>
              </div>
            </div>
          </div>
        </div>

        {/* Aircraft seating Grid map */}
        <div className="md:col-span-9 flex flex-col items-center">
          {/* Plane Header / Nose */}
          <div className="w-56 h-16 bg-stone-150 dark:bg-stone-900 rounded-t-none border-t border-x border-[#ecece8] dark:border-[#2a2a28] flex items-end justify-center pb-2 text-[10px] uppercase font-bold tracking-widest text-[#8b8b80]">
            👑 {lang === 'en' ? 'Cockpit' : 'كابينة القيادة'}
          </div>

          {/* Aircraft Fuselage Body */}
          <div className="w-full max-w-sm px-4 sm:px-8 py-10 bg-[#fdfdfc] dark:bg-[#151514] border-x border-b border-[#ecece8] dark:border-[#2a2a28] shadow-none rounded-b-none space-y-3">
            {rows.map((row) => (
              <div key={row.rowNum} className="flex items-center gap-1.5 sm:gap-3 justify-center">
                {/* Row Number Identifier */}
                <div className="w-6 text-[10px] font-extrabold text-[#8b8b80] text-center font-mono">
                  {row.rowNum}
                </div>

                {/* Left Side seats group */}
                <div className="flex gap-1.5 sm:gap-2">
                  {row.letters.slice(0, Math.ceil(row.letters.length / 2)).map((letter) => {
                    const code = `${row.rowNum}${letter}`;
                    const taken = isSeatTaken(row.rowNum, letter);
                    const selected = selectedSeat === code;

                    let btnClass = 'bg-transparent text-stone-600 border border-[#ecece8] hover:bg-stone-50 dark:text-stone-300 dark:border-[#2a2a28] dark:hover:bg-stone-900/40';
                    if (row.type === 'first') {
                      btnClass = 'bg-stone-100/50 text-stone-800 border border-[#ecece8] hover:bg-stone-100 dark:bg-[#1a1a19] dark:text-stone-200 dark:border-[#2a2a28]';
                    } else if (row.type === 'business') {
                      btnClass = 'bg-transparent text-stone-700 border border-[#ecece8] hover:bg-stone-100/50 dark:text-stone-300 dark:border-[#2a2a28]';
                    }

                    if (taken) {
                      btnClass = 'bg-stone-100 text-slate-300 dark:bg-[#1e1e1d] dark:text-stone-800 cursor-not-allowed border-transparent';
                    }
                    if (selected) {
                      btnClass = 'bg-[#1a1a1a] text-white border-transparent font-bold dark:bg-[#fdfdfc] dark:text-[#121211]';
                    }

                    return (
                      <button
                        key={letter}
                        disabled={taken}
                        onClick={() => handleSeatClick(code, row.type, row.baseUpgrade)}
                        className={`w-9 sm:w-11 h-9 sm:h-11 rounded-none text-xs font-semibold flex items-center justify-center transition-all cursor-pointer ${btnClass}`}
                      >
                        {letter}
                      </button>
                    );
                  })}
                </div>

                {/* Aisle Space gap */}
                <div className="w-1 md:w-3" />

                {/* Right Side seats group */}
                <div className="flex gap-1.5 sm:gap-2">
                  {row.letters.slice(Math.ceil(row.letters.length / 2)).map((letter) => {
                    const code = `${row.rowNum}${letter}`;
                    const taken = isSeatTaken(row.rowNum, letter);
                    const selected = selectedSeat === code;

                    let btnClass = 'bg-transparent text-stone-600 border border-[#ecece8] hover:bg-stone-50 dark:text-stone-300 dark:border-[#2a2a28] dark:hover:bg-stone-900/40';
                    if (row.type === 'first') {
                      btnClass = 'bg-stone-100/50 text-stone-800 border border-[#ecece8] hover:bg-stone-100 dark:bg-[#1a1a19] dark:text-stone-200 dark:border-[#2a2a28]';
                    } else if (row.type === 'business') {
                      btnClass = 'bg-transparent text-stone-700 border border-[#ecece8] hover:bg-stone-100/50 dark:text-stone-300 dark:border-[#2a2a28]';
                    }

                    if (taken) {
                      btnClass = 'bg-stone-100 text-slate-300 dark:bg-[#1e1e1d] dark:text-stone-800 cursor-not-allowed border-transparent';
                    }
                    if (selected) {
                      btnClass = 'bg-[#1a1a1a] text-white border-transparent font-bold dark:bg-[#fdfdfc] dark:text-[#121211]';
                    }

                    return (
                      <button
                        key={letter}
                        disabled={taken}
                        onClick={() => handleSeatClick(code, row.type, row.baseUpgrade)}
                        className={`w-9 sm:w-11 h-9 sm:h-11 rounded-none text-xs font-semibold flex items-center justify-center transition-all cursor-pointer ${btnClass}`}
                      >
                        {letter}
                      </button>
                    );
                  })}
                </div>
              </div>
            ))}
          </div>

          <div className="w-[120px] h-[8px] bg-stone-300 dark:bg-stone-850 rounded-b-none mt-2" />
        </div>
      </div>
    </div>
  );
}
