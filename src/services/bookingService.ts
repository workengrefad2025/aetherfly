import { DBService } from './dbService';
import { isSupabaseConfigured, supabase } from '../lib/supabase';
import { Booking } from '../types';
import { BookingLogicService } from './bookingLogicService';

export const BookingService = {
  async fetchBookings(userId: string): Promise<Booking[]> {
    return DBService.fetchBookings(userId);
  },

  async createBooking(booking: Booking, userId: string): Promise<Booking | null> {
    if (!isSupabaseConfigured()) return null;
    return BookingLogicService.confirmBooking(booking, userId);
  },

  async reserveSeatDuringPayment(flightId: string, seatCode: string, userId?: string): Promise<boolean> {
    return BookingLogicService.reserveSeatDuringCheckout(flightId, seatCode, userId);
  },

  // Real-time subscribe to bookings for a given userId
  subscribeBookings(userId: string, cb: (payload: any) => void) {
    if (!isSupabaseConfigured()) return () => {};
    const chan = supabase.channel(`public:bookings:user=${userId}`)
      .on('postgres_changes', { event: '*', schema: 'public', table: 'bookings', filter: `user_id=eq.${userId}` }, (payload: any) => {
        cb(payload);
      })
      .subscribe();

    return () => {
      try { chan.unsubscribe(); } catch (e) { /* noop */ }
    };
  }
};

export default BookingService;
