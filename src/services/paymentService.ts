import { supabase, isSupabaseConfigured } from '../lib/supabase';
import type { PaymentRecord } from '../types';

export type PaymentState = 'pending' | 'processing' | 'paid' | 'failed' | 'refunded';

const mapPaymentRow = (row: any): PaymentRecord => ({
  id: row.id,
  bookingId: row.booking_id,
  bookingRef: row.booking_ref,
  userId: row.user_id,
  provider: row.provider,
  paymentMethod: row.provider,
  currency: row.currency,
  amount: Number(row.amount),
  status: row.status,
  chargedAt: row.charged_at,
  receiptUrl: row.receipt_url,
  metadata: row.metadata,
  createdAt: row.created_at,
  updatedAt: row.updated_at
});

export const PaymentService = {
  async createPayment(payload: {
    id: string;
    booking_id: string;
    booking_ref?: string;
    user_id: string;
    provider: string;
    currency: string;
    amount: number;
    status?: PaymentState;
    metadata?: Record<string, any>;
  }): Promise<PaymentRecord | null> {
    if (!isSupabaseConfigured()) return null;
    const record = {
      id: payload.id,
      booking_id: payload.booking_id,
      booking_ref: payload.booking_ref ?? null,
      user_id: payload.user_id,
      provider: payload.provider,
      currency: payload.currency,
      amount: payload.amount,
      status: payload.status ?? 'pending',
      charged_at: new Date().toISOString(),
      metadata: payload.metadata ?? {}
    };

    const { data, error } = await supabase.from('payments').insert(record).select().single();
    if (error || !data) {
      console.warn('Failed to create payment record:', error?.message);
      return null;
    }

    await supabase.from('payment_logs').insert({ payment_id: data.id, status: data.status, message: 'created', meta: {} });
    return mapPaymentRow(data);
  },

  async updatePaymentStatus(paymentId: string, status: PaymentState, meta: Record<string, any> = {}) {
    if (!isSupabaseConfigured()) return null;
    const { data, error } = await supabase.from('payments').update({ status, updated_at: new Date().toISOString() }).eq('id', paymentId).select().single();
    if (error || !data) {
      console.warn('Failed to update payment status:', error?.message);
      return null;
    }
    await supabase.from('payment_logs').insert({ payment_id: paymentId, status, message: 'status_update', meta });
    return mapPaymentRow(data);
  },

  async fetchPaymentsByUser(userId: string, limit = 50, page = 0): Promise<PaymentRecord[]> {
    if (!isSupabaseConfigured()) return [];
    const { data, error } = await supabase.from('payments').select('*').eq('user_id', userId).order('charged_at', { ascending: false }).range(page * limit, page * limit + limit - 1);
    if (error || !data) {
      console.warn('Failed to fetch payments:', error?.message);
      return [];
    }
    return data.map(mapPaymentRow);
  },

  async createRefundPlaceholder(paymentId: string, amount: number, reason?: string) {
    if (!isSupabaseConfigured()) return null;
    await supabase.from('payment_logs').insert({ payment_id: paymentId, status: 'refunded', message: `refund_requested: ${reason ?? 'n/a'}`, meta: { amount } });
    return this.updatePaymentStatus(paymentId, 'refunded', { amount, reason });
  }
};

export default PaymentService;
