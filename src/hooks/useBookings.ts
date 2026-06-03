import { useEffect, useState, useRef } from 'react';
import BookingService from '../services/bookingService';
import { Booking } from '../types';
import { useToast } from './useToast';
import { isSupabaseConfigured } from '../lib/supabase';

export function useBookings(userId?: string) {
  const [bookings, setBookings] = useState<Booking[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const toast = useToast();
  const unsubscribeRef = useRef<() => void>(() => {});

  const load = async () => {
    if (!userId) return;
    setLoading(true);
    setError(null);
    try {
      const rows = await BookingService.fetchBookings(userId);
      setBookings(rows);
    } catch (e: any) {
      setError(e?.message || 'Failed to load bookings');
    } finally { setLoading(false); }
  };

  useEffect(() => {
    if (!userId) return;
    load();

    if (isSupabaseConfigured()) {
      const unsub = BookingService.subscribeBookings(userId, (payload) => {
        // simple reconcile strategy
        const ev = payload.event;
        const newRow = payload.new;
        if (ev === 'INSERT' && newRow) setBookings(prev => [
          {
            id: newRow.id || `${newRow.ref_code}-${Date.now()}`,
            ref: newRow.ref_code,
            flight: {
              id: newRow.flight_no,
              airline: newRow.airline,
              flightNo: newRow.flight_no,
              fromCode: newRow.from_code,
              fromName: newRow.from_name,
              toCode: newRow.to_code,
              toName: newRow.to_name,
              departTime: newRow.depart_time,
              arriveTime: newRow.arrive_time,
              duration: newRow.duration ?? '—',
              price: Number(newRow.price),
              stops: Number(newRow.stops ?? 0),
              planeType: newRow.plane_type ?? 'Aether Suite'
            },
            passengerName: newRow.passenger_name,
            passportNumber: newRow.passport_number,
            seatCode: newRow.seat_code,
            status: newRow.status,
            price: Number(newRow.price),
            date: newRow.depart_date,
            seatClass: newRow.seat_class,
            tripType: newRow.trip_type
          },
          ...prev
        ]);

        if (ev === 'UPDATE' && newRow) setBookings(prev => prev.map(b => (b.ref === newRow.ref_code ? { ...b, status: newRow.status } : b)));
        if (ev === 'DELETE' && payload.old) setBookings(prev => prev.filter(b => b.ref !== payload.old.ref_code));
      });

      unsubscribeRef.current = unsub;
      return () => { try { unsub(); } catch (e) {} };
    }
    // eslint-disable-next-line
  }, [userId]);

  const createBooking = async (booking: Booking, userIdParam?: string) => {
    // optimistic UI update
    setBookings(prev => [booking, ...prev]);
    try {
      if (isSupabaseConfigured() && userIdParam) {
        const created = await BookingService.createBooking(booking, userIdParam);
        if (!created) throw new Error('Failed to persist booking');
        toast.notify('Booking saved to your account.', 'success');
      } else {
        toast.notify('Saved booking locally. Connect Supabase for persistence.', 'info');
      }
    } catch (e: any) {
      // rollback
      setBookings(prev => prev.filter(b => b.id !== booking.id));
      toast.notify(e?.message || 'Booking failed', 'error');
      throw e;
    }
  };

  return { bookings, loading, error, reload: load, createBooking, setBookings } as const;
}

export default useBookings;
