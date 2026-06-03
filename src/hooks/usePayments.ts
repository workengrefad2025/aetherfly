import { useState, useEffect, useCallback } from 'react';
import PaymentService, { PaymentState } from '../services/paymentService';
import { PaymentRecord } from '../types';
import { isSupabaseConfigured, supabase } from '../lib/supabase';

export default function usePayments(userId?: string) {
  const [payments, setPayments] = useState<PaymentRecord[]>([]);
  const [loading, setLoading] = useState(false);

  const load = useCallback(async (page = 0) => {
    if (!userId) return;
    setLoading(true);
    const list = await PaymentService.fetchPaymentsByUser(userId, 50, page);
    setPayments(list);
    setLoading(false);
  }, [userId]);

  useEffect(() => {
    let mounted = true;
    if (!userId) return;

    const loadData = async () => {
      const list = await PaymentService.fetchPaymentsByUser(userId, 50, 0);
      if (mounted) {
        setPayments(list);
        setLoading(false);
      }
    };

    setLoading(true);
    loadData();

    if (!isSupabaseConfigured()) return () => { mounted = false; };

    const chan = supabase.channel(`public:payments:user=${userId}`)
      .on('postgres_changes', { event: '*', schema: 'public', table: 'payments', filter: `user_id=eq.${userId}` }, () => {
        if (mounted) {
          loadData();
        }
      })
      .subscribe();

    return () => {
      mounted = false;
      try {
        chan.unsubscribe();
      } catch (e) {
        console.warn('Failed to unsubscribe payments channel', e);
      }
    };
  }, [userId]);

  const create = async (opts: { id: string; bookingId: string; provider: string; currency: string; amount: number }) => {
    if (!userId) return null;
    const rec = await PaymentService.createPayment({ id: opts.id, booking_id: opts.bookingId, user_id: userId, provider: opts.provider, currency: opts.currency, amount: opts.amount, status: 'pending' });
    if (rec) setPayments(prev => [rec, ...prev]);
    return rec;
  };

  const updateStatus = async (paymentId: string, status: PaymentState) => {
    const updated = await PaymentService.updatePaymentStatus(paymentId, status);
    if (updated) setPayments(prev => prev.map(p => (p.id === updated.id ? updated : p)));
    return updated;
  };

  return { payments, loading, load, create, updateStatus };
}
