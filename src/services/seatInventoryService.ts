import { supabase, isSupabaseConfigured } from '../lib/supabase';
import { SeatClass } from '../types';

export interface SeatInventorySummary {
  totalSeats: number;
  availableSeats: number;
  reservedSeats: number;
  occupancyRate: number;
  seatClassBreakdown: Record<string, { available: number; reserved: number }>;
}

export const SeatInventoryService = {
  async reserveSeat(flightId: string, seatCode: string, userId?: string): Promise<boolean> {
    if (!isSupabaseConfigured()) return true;
    try {
      const { data, error } = await supabase.rpc('reserve_flight_seat', {
        flight_id: flightId,
        seat_code: seatCode,
        user_id: userId ?? null
      });
      if (error) {
        console.warn('Seat reservation RPC failed:', error.message);
        return false;
      }
      return Boolean(data);
    } catch (e) {
      console.warn('SeatInventoryService.reserveSeat failed:', e);
      return false;
    }
  },

  async fetchSeatAvailability(flightId: string): Promise<SeatInventorySummary> {
    if (!isSupabaseConfigured()) {
      return {
        totalSeats: 180,
        availableSeats: 60,
        reservedSeats: 120,
        occupancyRate: 0.67,
        seatClassBreakdown: {
          Economy: { available: 20, reserved: 90 },
          'Premium Economy': { available: 15, reserved: 35 },
          Business: { available: 15, reserved: 20 },
          First: { available: 10, reserved: 15 }
        }
      };
    }

    const { data, error } = await supabase
      .from('flight_seats')
      .select('seat_class, seat_status')
      .eq('flight_id', flightId);

    if (error || !data) {
      console.warn('Failed to load flight seat availability:', error?.message);
      return {
        totalSeats: 180,
        availableSeats: 60,
        reservedSeats: 120,
        occupancyRate: 0.67,
        seatClassBreakdown: {}
      };
    }

    const summary: SeatInventorySummary = {
      totalSeats: data.length,
      availableSeats: 0,
      reservedSeats: 0,
      occupancyRate: 0,
      seatClassBreakdown: {}
    };

    for (const seat of data) {
      const seatClass = seat.seat_class || 'Economy';
      const classSummary = summary.seatClassBreakdown[seatClass] ?? { available: 0, reserved: 0 };
      if (seat.seat_status === 'available') {
        classSummary.available += 1;
        summary.availableSeats += 1;
      }
      if (seat.seat_status === 'reserved' || seat.seat_status === 'occupied') {
        classSummary.reserved += 1;
        summary.reservedSeats += 1;
      }
      summary.seatClassBreakdown[seatClass] = classSummary;
    }

    summary.occupancyRate = summary.totalSeats > 0 ? Number(((summary.reservedSeats / summary.totalSeats) * 100).toFixed(0)) : 0;
    return summary;
  },

  async initializeSeatInventory(flightId: string, seatClass?: SeatClass) {
    if (!isSupabaseConfigured()) return null;
    const defaultLayout = [
      { code: '1A', seat_class: 'First' },
      { code: '1D', seat_class: 'First' },
      { code: '2A', seat_class: 'First' },
      { code: '2D', seat_class: 'First' },
      ...Array.from({ length: 8 }).flatMap((_, idx) => [
        { code: `${3 + idx}A`, seat_class: 'Business' },
        { code: `${3 + idx}B`, seat_class: 'Business' },
        { code: `${3 + idx}E`, seat_class: 'Business' },
        { code: `${3 + idx}F`, seat_class: 'Business' }
      ]),
      ...Array.from({ length: 70 }).map((_, idx) => ({ code: `7${String(idx % 6 + 1)}${['A','B','C','D','E','F'][idx % 6]}`, seat_class: 'Economy' }))
    ];

    const payload = defaultLayout.map((seat) => ({
      flight_id: flightId,
      seat_code: seat.code,
      seat_class: seat.seat_class,
      cabin_class: seat.seat_class,
      fare_type: seat.seat_class === 'First' ? 'premium' : seat.seat_class === 'Business' ? 'flex' : seat.seat_class === 'Premium Economy' ? 'standard' : 'basic',
      price_multiplier: seat.seat_class === 'First' ? 2.5 : seat.seat_class === 'Business' ? 1.75 : seat.seat_class === 'Premium Economy' ? 1.35 : 1,
      base_fare: 0,
      actual_price: 0,
      seat_status: 'available',
      reserved_by: null,
      booking_id: null,
      reserved_at: null,
      lock_expires_at: null
    }));

    const { data, error } = await supabase.from('flight_seats').upsert(payload);
    if (error) {
      console.warn('Failed to initialize seat inventory:', error.message);
    }
    return data;
  }
};
