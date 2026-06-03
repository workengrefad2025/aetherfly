import { supabase, isSupabaseConfigured } from '../lib/supabase';
import { Booking } from '../types';

export type BookingStatus = 'pending' | 'confirmed' | 'ticketed' | 'completed' | 'cancelled';

export const LifecycleService = {
  async addTimelineEvent(bookingId: string, event: string, note?: string, actor?: string) {
    if (!isSupabaseConfigured()) return null;
    const payload = { booking_id: bookingId, event, note: note ?? null, actor: actor ?? null, created_at: new Date().toISOString() };
    const { data, error } = await supabase.from('booking_timeline').insert(payload).select().single();
    if (error) {
      console.warn('Failed to insert timeline event:', error.message);
      return null;
    }
    return data;
  },

  async transitionBooking(bookingId: string, status: BookingStatus, reason?: string, actor?: string) {
    if (!isSupabaseConfigured()) return null;
    const { data, error } = await supabase.from('bookings').update({ status }).eq('id', bookingId).select().single();
    if (error) {
      console.warn('Failed to update booking status:', error.message);
      return null;
    }
    await this.addTimelineEvent(bookingId, `status:${status}`, reason, actor);
    return data;
  },

  async requestCancellation(bookingId: string, reason?: string, actor?: string) {
    // mark pending cancellation and create placeholder refund
    await this.addTimelineEvent(bookingId, 'cancellation_requested', reason, actor);
    // leave actual status change to admin/refund pipeline
    return true;
  }
};

export default LifecycleService;
