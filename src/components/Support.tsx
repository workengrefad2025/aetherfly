import React, { useState } from 'react';
import { FAQS } from '../data';
import { HelpCircle, ChevronDown, MessageSquare, Send, Check } from 'lucide-react';
import { SupportTicket } from '../types';
import { validateEmail } from '../lib/validators';
import { SupportRequestPayload } from '../services/supportService';

interface SupportProps {
  tickets: SupportTicket[];
  onSubmitTicket: (ticket: SupportRequestPayload) => Promise<void>;
  lang: 'en' | 'ar';
}

export default function Support({ tickets, onSubmitTicket, lang }: SupportProps) {
  const [activeFaqIdx, setActiveFaqIdx] = useState<number | null>(null);
  const [fullName, setFullName] = useState('');
  const [emailAddress, setEmailAddress] = useState('');
  const [bookingRef, setBookingRef] = useState('');
  const [subject, setSubject] = useState('');
  const [category, setCategory] = useState('Booking Inquiries');
  const [message, setMessage] = useState('');
  const [success, setSuccess] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [formError, setFormError] = useState<string | null>(null);

  const handleToggleFaq = (idx: number) => {
    setActiveFaqIdx(activeFaqIdx === idx ? null : idx);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    const emailValidation = validateEmail(emailAddress);
    if (!fullName.trim()) {
      setFormError(lang === 'en' ? 'Please provide your full name.' : 'يرجى إدخال الاسم الكامل.');
      return;
    }
    if (emailValidation) {
      setFormError(emailValidation);
      return;
    }
    if (!subject.trim() || !message.trim()) {
      setFormError(lang === 'en' ? 'Please fill in the subject and message fields.' : 'يرجى تعبئة الموضوع والرسالة.');
      return;
    }

    setFormError(null);
    setSubmitting(true);

    try {
      await onSubmitTicket({
        fullName: fullName.trim(),
        email: emailAddress.trim(),
        bookingRef: bookingRef.trim() || undefined,
        subject: subject.trim(),
        category,
        message: message.trim(),
        submittedAt: new Date().toISOString()
      });

      setFullName('');
      setEmailAddress('');
      setBookingRef('');
      setSubject('');
      setMessage('');
      setSuccess(true);
      setTimeout(() => setSuccess(false), 5000);
    } catch (error) {
      setFormError(lang === 'en' ? 'Unable to submit right now. Please try again shortly.' : 'لا يمكن إرسال الطلب حالياً. حاول مرة أخرى لاحقاً.');
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="max-w-4xl mx-auto px-4 py-12 space-y-12">
      {/* Intro Heading */}
      <div className="text-center space-y-4">
        <h1 className="font-serif text-3xl sm:text-4xl font-extrabold text-slate-900 dark:text-slate-55 flex items-center justify-center gap-2">
          <HelpCircle className="text-[#D4A24C]" size={28} />
          <span>{lang === 'en' ? 'AetherFly Luxury Support' : 'مركز الدعم والمساعدة الكونسيرج'}</span>
        </h1>
        <p className="text-sm text-slate-500 max-w-lg mx-auto">
          {lang === 'en'
            ? 'Our dedicated travel experts are standing by 24/7 to assist with your private booking, routing, or premier rewards account.'
            : 'مستشارو السفر الفاخر لدينا متاحون على مدار الساعة لمساعدتك في تخصيص رحلاتك.'}
        </p>
      </div>

      {/* FAQs Section */}
      <div className="bg-white dark:bg-slate-900 border border-amber-900/5 dark:border-amber-100/5 rounded-3xl p-6 sm:p-8 shadow-xl space-y-4">
        <h3 className="font-serif text-lg font-bold text-slate-800 dark:text-slate-100 pb-3 border-b border-slate-100 dark:border-slate-800">
          {lang === 'en' ? 'Frequently Asked Questions' : 'الأسئلة الأكثر شيوعًا'}
        </h3>

        <div className="divide-y divide-slate-100 dark:divide-slate-850">
          {FAQS.map((faq, idx) => {
            const isOpen = activeFaqIdx === idx;
            return (
              <div key={idx} className="py-4">
                <button
                  onClick={() => handleToggleFaq(idx)}
                  className="w-full flex items-center justify-between font-bold text-sm text-slate-800 dark:text-slate-300 text-left cursor-pointer hover:text-[#D4A24C] dark:hover:text-[#D4A24C] gap-4"
                >
                  <span>{faq.question}</span>
                  <ChevronDown
                    size={16}
                    className={`transform transition-transform text-slate-400 ${isOpen ? 'rotate-180' : ''}`}
                  />
                </button>
                {isOpen && (
                  <p className="anim-fadeIn mt-3 text-xs sm:text-sm text-slate-500 dark:text-slate-400 leading-relaxed pl-1">
                    {faq.answer}
                  </p>
                )}
              </div>
            );
          })}
        </div>
      </div>

      {/* Ticket form & submitted status grid */}
      <div className="grid grid-cols-1 md:grid-cols-12 gap-8">
        
        {/* Form to submit tickets */}
        <div className="md:col-span-7 bg-slate-50 dark:bg-slate-950/40 border border-slate-100 dark:border-slate-900 p-6 rounded-3xl space-y-4">
          <div className="flex items-center gap-2 pb-3 border-b border-slate-100 dark:border-slate-800">
            <MessageSquare className="text-[#D4A24C]" size={20} />
            <h4 className="font-serif text-base font-bold text-slate-800 dark:text-slate-100">
              {lang === 'en' ? 'Submit Support Request' : 'إنشاء تذكرة دعم'}
            </h4>
          </div>

          <form onSubmit={handleSubmit} className="space-y-4 text-xs">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-1.5">
                <label className="font-bold text-slate-500 uppercase tracking-wide">{lang === 'en' ? 'Full Name' : 'الاسم الكامل'}</label>
                <input
                  type="text"
                  value={fullName}
                  onChange={e => setFullName(e.target.value)}
                  placeholder={lang === 'en' ? 'Your full name' : 'الاسم الكامل'}
                  className="w-full px-4 py-2.5 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 focus:border-[#D4A24C] focus:outline-none rounded-xl font-semibold text-xs"
                />
              </div>
              <div className="space-y-1.5">
                <label className="font-bold text-slate-500 uppercase tracking-wide">Email Address</label>
                <input
                  type="email"
                  value={emailAddress}
                  onChange={e => setEmailAddress(e.target.value)}
                  placeholder={lang === 'en' ? 'you@domain.com' : 'البريد الإلكتروني'}
                  className="w-full px-4 py-2.5 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 focus:border-[#D4A24C] focus:outline-none rounded-xl font-semibold text-xs"
                />
              </div>
            </div>

            <div className="space-y-1.5">
              <label className="font-bold text-slate-500 uppercase tracking-wide">{lang === 'en' ? 'Booking Reference' : 'مرجع الحجز'} <span className="text-[10px] text-slate-400">({lang === 'en' ? 'optional' : 'اختياري'})</span></label>
              <input
                type="text"
                value={bookingRef}
                onChange={e => setBookingRef(e.target.value)}
                placeholder={lang === 'en' ? 'e.g., AF-102345' : 'مثال: AF-102345'}
                className="w-full px-4 py-2.5 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 focus:border-[#D4A24C] focus:outline-none rounded-xl font-semibold text-xs"
              />
            </div>

            <div className="space-y-1.5">
              <label className="font-bold text-slate-500 uppercase tracking-wide">Category / Service</label>
              <select
                value={category}
                onChange={e => setCategory(e.target.value)}
                className="w-full px-3 py-2.5 bg-white dark:bg-slate-900 text-slate-800 dark:text-slate-200 border border-slate-200 dark:border-slate-800 focus:border-[#D4A24C] focus:outline-none rounded-xl font-semibold cursor-pointer"
              >
                <option value="Booking Inquiries">{lang === 'en' ? 'Booking Inquiries' : 'استفسارات الحجز'}</option>
                <option value="Elite Miles Awards">{lang === 'en' ? 'Elite Miles Awards' : 'مكافآت الأميال الفاخرة'}</option>
                <option value="Baggage & Dining VIP">{lang === 'en' ? 'Baggage & Dining VIP' : 'الأطعمة والأمتعة الخاصة'}</option>
                <option value="Technical Support">{lang === 'en' ? 'Technical Support' : 'الدعم الفني للموقع'}</option>
              </select>
            </div>

            <div className="space-y-1.5">
              <label className="font-bold text-slate-500 uppercase tracking-wide">Subject Description</label>
              <input
                type="text"
                required
                value={subject}
                onChange={e => setSubject(e.target.value)}
                placeholder={lang === 'en' ? 'e.g., Upgrading seat class on flight AF102' : 'مثال: مشكلة ترقية المقعد'}
                className="w-full px-4 py-2.5 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 focus:border-[#D4A24C] focus:outline-none rounded-xl font-semibold text-xs"
              />
            </div>

            <div className="space-y-1.5">
              <label className="font-bold text-slate-500 uppercase tracking-wide">Detailed Message</label>
              <textarea
                required
                rows={4}
                value={message}
                onChange={e => setMessage(e.target.value)}
                placeholder={lang === 'en' ? 'Provide booking reference if applicable...' : 'كيف يمكن لمستشاري السفر مساعدتك؟'}
                className="w-full px-4 py-2.5 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 focus:border-[#D4A24C] focus:outline-none rounded-xl font-semibold text-xs resize-none"
              />
            </div>

            <button
              type="submit"
              disabled={submitting}
              className="w-full bg-gradient-to-r from-[#E0B15A] to-[#D4A24C] text-slate-950 font-bold py-3 rounded-xl flex items-center justify-center gap-2 hover:shadow-md transition-shadow cursor-pointer text-sm disabled:cursor-not-allowed disabled:opacity-60"
            >
              <Send size={14} />
              <span>{lang === 'en' ? 'Submit Ticket' : 'إرسال الطلب'}</span>
            </button>

            {formError && (
              <p className="text-xs font-bold text-rose-500 bg-rose-500/10 p-3 rounded-xl">{formError}</p>
            )}

            {success && (
              <p className="text-xs font-bold text-emerald-500 bg-emerald-500/10 p-3 rounded-xl flex items-center gap-1.5 anim-fadeIn">
                <Check size={16} />
                <span>{lang === 'en' ? 'Support request submitted. Our luxury concierge team is on it.' : 'تم إرسال طلب الدعم. فريق الكونسيرج لدينا سيتعامل معه.'}</span>
              </p>
            )}
          </form>
        </div>

        {/* List of active submitted ticket tracker */}
        <div className="md:col-span-5 bg-white dark:bg-slate-900 border border-amber-900/5 dark:border-amber-100/5 p-6 rounded-3xl space-y-4 flex flex-col">
          <h4 className="font-serif text-sm font-bold text-slate-850 dark:text-slate-100 pb-3 border-b border-slate-100 dark:border-slate-800">
            {lang === 'en' ? 'Support Ticket Tracker' : 'متابعة طلباتك النشطة'}
          </h4>

          {tickets.length === 0 ? (
            <div className="flex-1 flex flex-col items-center justify-center text-center text-slate-400 py-12">
              <MessageSquare size={36} className="text-slate-200 dark:text-slate-800 mb-2 stroke-[1.5]" />
              <p className="text-xs font-bold">{lang === 'en' ? 'No support tickets yet' : 'لا توجد طلبات مسجلة بعد'}</p>
            </div>
          ) : (
            <div className="space-y-3 flex-1 overflow-y-auto max-h-[300px] pr-1">
              {tickets.map(ticket => (
                <div key={ticket.id} className="p-3.5 bg-slate-50 dark:bg-slate-950/20 border border-slate-100 dark:border-slate-850 rounded-xl space-y-2 text-xs">
                  <div className="flex items-center justify-between">
                    <span className="font-bold text-slate-800 dark:text-slate-200 leading-tight block truncate pr-2 max-w-[120px]" title={ticket.subject}>
                      {ticket.subject}
                    </span>
                    <span className={`text-[9px] px-2 py-0.5 rounded-full font-bold uppercase shrink-0 ${
                      ticket.status === 'Open' ? 'bg-amber-100/40 text-amber-600' : 'bg-emerald-50/50 text-emerald-500'
                    }`}>
                      {ticket.status}
                    </span>
                  </div>
                  <p className="text-[10px] text-slate-400 mt-1">
                    {ticket.category} • {ticket.date}{ticket.bookingRef ? ` • ${ticket.bookingRef}` : ''}
                  </p>
                </div>
              ))}
            </div>
          )}
        </div>

      </div>
    </div>
  );
}
