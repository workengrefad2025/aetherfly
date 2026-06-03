import React, { useState } from 'react';
import { Flight, SearchParams } from '../types';
import { ShieldCheck, Info, CreditCard, Calendar, Lock } from 'lucide-react';

interface PaymentModalProps {
  flight: Flight;
  searchParams: SearchParams;
  selectedSeat: string;
  upgradeFee: number;
  onPaymentSuccess: (passenger: { name: string; passport: string; email: string }) => void;
  lang: 'en' | 'ar';
}

export default function PaymentModal({
  flight,
  searchParams,
  selectedSeat,
  upgradeFee,
  onPaymentSuccess,
  lang
}: PaymentModalProps) {
  const [passengerName, setPassengerName] = useState('');
  const [passportNumber, setPassportNumber] = useState('');
  const [emailAddress, setEmailAddress] = useState('');
  const [cardNumber, setCardNumber] = useState('');
  const [expiry, setExpiry] = useState('');
  const [cvc, setCvc] = useState('');
  const [errorText, setErrorText] = useState('');
  const [payingState, setPayingState] = useState(false);

  // Compute final fare
  const countFactor = searchParams.passengers === 'family' ? 4 : parseInt(searchParams.passengers) || 1;
  const rawBase = flight.price * countFactor;
  const upgradeCost = upgradeFee * countFactor;
  const finalPrice = rawBase + upgradeCost;

  const handlePay = (e: React.FormEvent) => {
    e.preventDefault();
    setErrorText('');

    if (!passengerName.trim() || !passportNumber.trim() || !emailAddress.trim()) {
      setErrorText('Please fill out all passenger details.');
      return;
    }

    if (!cardNumber.replace(/\s/g, '') || !expiry || !cvc) {
      setErrorText('Please provide all necessary credit card details.');
      return;
    }

    setPayingState(true);
    setTimeout(() => {
      setPayingState(false);
      onPaymentSuccess({
        name: passengerName,
        passport: passportNumber,
        email: emailAddress
      });
    }, 1500);
  };

  return (
    <div className="space-y-6">
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
        {/* Left Side: Passenger Forms & Credit Card Info Inputs */}
        <form onSubmit={handlePay} className="lg:col-span-8 bg-[#fdfdfc] dark:bg-[#151514] p-6 rounded-none border border-[#ecece8] dark:border-[#2a2a28] space-y-6">
          <div className="flex items-center gap-3 pb-4 border-b border-[#ecece8] dark:border-[#2a2a28]">
            <Lock className="text-stone-500" size={18} />
            <h3 className="font-serif italic text-lg font-bold text-[#1a1a1a] dark:text-[#fdfdfc]">
              {lang === 'en' ? 'Secure Checkout & Payment' : 'بوابة الدفع الآمنة'}
            </h3>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-1.5">
              <label className="text-[10px] font-bold text-[#8b8b80] uppercase tracking-widest font-mono">
                {lang === 'en' ? 'Full Name' : 'اسم الراكب الكامل'}
              </label>
              <input
                type="text"
                required
                value={passengerName}
                onChange={e => setPassengerName(e.target.value)}
                placeholder="Juan Perez"
                className="w-full px-4 py-3 bg-transparent text-[#1a1a1a] dark:text-[#fdfdfc] border border-[#ecece8] dark:border-[#2a2a28] focus:border-[#1a1a1a] dark:focus:border-white focus:outline-none rounded-none text-sm font-semibold transition-all"
              />
            </div>

            <div className="space-y-1.5">
              <label className="text-[10px] font-bold text-[#8b8b80] uppercase tracking-widest font-mono">
                {lang === 'en' ? 'Passport Number' : 'رقم جواز السفر'}
              </label>
              <input
                type="text"
                required
                value={passportNumber}
                onChange={e => setPassportNumber(e.target.value)}
                placeholder="A1234567"
                className="w-full px-4 py-3 bg-transparent text-[#1a1a1a] dark:text-[#fdfdfc] border border-[#ecece8] dark:border-[#2a2a28] focus:border-[#1a1a1a] dark:focus:border-white focus:outline-none rounded-none text-sm font-semibold transition-all"
              />
            </div>

            <div className="space-y-1.5 md:col-span-2">
              <label className="text-[10px] font-bold text-[#8b8b80] uppercase tracking-widest font-mono">
                {lang === 'en' ? 'Email Address' : 'البريد الإلكتروني'}
              </label>
              <input
                type="email"
                required
                value={emailAddress}
                onChange={e => setEmailAddress(e.target.value)}
                className="w-full px-4 py-3 bg-transparent text-[#1a1a1a] dark:text-[#fdfdfc] border border-[#ecece8] dark:border-[#2a2a28] focus:border-[#1a1a1a] dark:focus:border-white focus:outline-none rounded-none text-sm font-semibold transition-all"
                placeholder="juan.perez@example.com"
              />
            </div>
          </div>

          <div className="pt-4 border-t border-[#ecece8] dark:border-[#2a2a28] space-y-4">
            <h4 className="text-xs uppercase tracking-wider font-bold text-[#1a1a1a] dark:text-[#fdfdfc] font-mono">
              {lang === 'en' ? 'Credit / Debit Card Details' : 'تفاصيل بطاقة الائتمان'}
            </h4>

            <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
              <div className="md:col-span-2 space-y-1.5">
                <label className="text-[10px] font-bold text-[#8b8b80] uppercase tracking-widest font-mono">
                  {lang === 'en' ? 'Card Number' : 'رقم بطاقة الائتمان'}
                </label>
                <div className="relative">
                  <input
                    type="text"
                    required
                    value={cardNumber}
                    onChange={e => setCardNumber(e.target.value)}
                    placeholder="4000 1234 5678 9010"
                    className="w-full pl-10 pr-4 py-3 bg-transparent text-[#1a1a1a] dark:text-[#fdfdfc] border border-[#ecece8] dark:border-[#2a2a28] focus:border-[#1a1a1a] dark:focus:border-white focus:outline-none rounded-none text-sm font-semibold transition-all"
                  />
                  <CreditCard size={14} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-stone-400" />
                </div>
              </div>

              <div className="space-y-1.5">
                <label className="text-[10px] font-bold text-[#8b8b80] uppercase tracking-widest font-mono">
                  {lang === 'en' ? 'Expiry' : 'تاريخ الصلاحية'}
                </label>
                <input
                  type="text"
                  required
                  value={expiry}
                  onChange={e => setExpiry(e.target.value)}
                  placeholder="MM/YY"
                  className="w-full px-4 py-3 bg-transparent text-[#1a1a1a] dark:text-[#fdfdfc] border border-[#ecece8] dark:border-[#2a2a28] focus:border-[#1a1a1a] dark:focus:border-white focus:outline-none rounded-none text-sm font-semibold transition-all"
                />
              </div>

              <div className="space-y-1.5">
                <label className="text-[10px] font-bold text-[#8b8b80] uppercase tracking-widest font-mono">
                  {lang === 'en' ? 'CVC' : 'رمز التحقق'}
                </label>
                <input
                  type="password"
                  required
                  value={cvc}
                  onChange={e => setCvc(e.target.value)}
                  placeholder="•••"
                  className="w-full px-4 py-3 bg-transparent text-[#1a1a1a] dark:text-[#fdfdfc] border border-[#ecece8] dark:border-[#2a2a28] focus:border-[#1a1a1a] dark:focus:border-white focus:outline-none rounded-none text-sm font-semibold transition-all"
                  maxLength={4}
                />
              </div>
            </div>
          </div>

          {errorText && (
            <p className="text-xs font-bold text-rose-500 bg-rose-500/10 p-3 rounded-none">
              ⚠️ {errorText}
            </p>
          )}

          <button
            type="submit"
            disabled={payingState}
            className="w-full py-4 bg-[#1a1a1a] text-white dark:bg-[#fdfdfc] dark:text-[#121211] font-bold rounded-none shadow-none cursor-pointer text-center text-xs uppercase tracking-widest disabled:opacity-45 hover:bg-stone-850 dark:hover:bg-stone-150 transition-all duration-250 border border-transparent"
          >
            {payingState ? (lang === 'en' ? 'Processing Premium Payment...' : 'جاري معالجة الدفع الفاخر...') : (lang === 'en' ? `Confirm & Pay $${finalPrice} USD` : `تأكيد ودفع ${finalPrice} دولارات`)}
          </button>
        </form>

        {/* Right Side: Trip Summary Card Information */}
        <aside className="lg:col-span-4 bg-[#fdfdfc] dark:bg-[#151514] border border-[#ecece8] dark:border-[#2a2a28] rounded-none p-6 shadow-none space-y-6">
          <h4 className="font-serif italic text-base font-bold text-[#1a1a1a] dark:text-[#fdfdfc] pb-3 border-b border-[#ecece8] dark:border-[#2a2a28] flex items-center gap-2">
            <ShieldCheck size={18} className="text-stone-500" />
            <span>{lang === 'en' ? 'Review Booking' : 'مراجعة بيانات الرحلة'}</span>
          </h4>

          <div className="space-y-4 text-xs font-semibold text-stone-600 dark:text-stone-300">
            <div className="flex justify-between pb-3 border-b border-[#ecece8] dark:border-[#2a2a28]">
              <span className="text-[#8b8b80] font-medium">Carrier & Route:</span>
              <span className="text-[#1a1a1a] dark:text-[#fdfdfc]">{flight.airline} ({flight.flightNo})</span>
            </div>
            <div className="flex justify-between pb-3 border-b border-[#ecece8] dark:border-[#2a2a28]">
              <span className="text-[#8b8b80] font-medium">Path:</span>
              <span className="text-[#1a1a1a] dark:text-[#fdfdfc]">{flight.fromCode} → {flight.toCode}</span>
            </div>
            <div className="flex justify-between pb-3 border-b border-[#ecece8] dark:border-[#2a2a28]">
              <span className="text-[#8b8b80] font-medium">Date:</span>
              <span className="text-[#1a1a1a] dark:text-[#fdfdfc]">{searchParams.departDate}</span>
            </div>
            <div className="flex justify-between pb-3 border-b border-[#ecece8] dark:border-[#2a2a28]">
              <span className="text-[#8b8b80] font-medium">No. of Passengers:</span>
              <span className="bg-stone-100 dark:bg-stone-800 px-2 py-0.5 rounded-none text-[#1a1a1a] dark:text-[#fdfdfc] font-mono">{searchParams.passengers}</span>
            </div>
            <div className="flex justify-between pb-3 border-b border-[#ecece8] dark:border-[#2a2a28]">
              <span className="text-[#8b8b80] font-medium">Suite Class Selected:</span>
              <span className="text-[#1a1a1a] dark:text-[#fdfdfc]">{searchParams.seatClass} ({selectedSeat || 'Auto-assign'})</span>
            </div>
          </div>

          <div className="pt-4 border-t border-[#ecece8] dark:border-[#2a2a28]">
            <div className="flex justify-between text-xs text-[#8b8b80]">
              <span>Base Fare ({countFactor}x):</span>
              <span>${rawBase} USD</span>
            </div>
            {upgradeFee > 0 && (
              <div className="flex justify-between text-xs text-[#8b8b80] mt-2">
                <span>Class Upgrade:</span>
                <span className="text-stone-800 dark:text-stone-200 mt-0.5 font-bold font-mono">+${upgradeCost} USD</span>
              </div>
            )}
            <div className="flex justify-between text-base font-bold text-[#1a1a1a] dark:text-[#fdfdfc] mt-5 border-t border-dashed border-[#ecece8] dark:border-[#2a2a28] pt-4">
              <span>{lang === 'en' ? 'Total Paid' : 'المجموع الإجمالي'}:</span>
              <span className="text-2xl font-serif text-[#1a1a1a] dark:text-[#fdfdfc]">${finalPrice}</span>
            </div>
          </div>
        </aside>
      </div>
    </div>
  );
}
