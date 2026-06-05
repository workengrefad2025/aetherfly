/// <reference types="vite/client" />
import { createClient, SupabaseClient, Session, User } from '@supabase/supabase-js';
import EmailService from '../services/emailService';
import { Booking, Destination, LoyaltyReward, Offer, PaymentRecord, TicketRecord, UserProfile } from '../types';

const SUPABASE_URL = import.meta.env.VITE_SUPABASE_URL ?? '';
const SUPABASE_ANON_KEY = import.meta.env.VITE_SUPABASE_ANON_KEY ?? '';

export const isSupabaseConfigured = (): boolean => {
  return SUPABASE_URL.trim().length > 0 && SUPABASE_ANON_KEY.trim().length > 0;
};

// Only create the Supabase client if env vars are configured
let supabaseInstance: SupabaseClient | null = null;
if (isSupabaseConfigured()) {
  supabaseInstance = createClient(SUPABASE_URL, SUPABASE_ANON_KEY, {
    auth: {
      persistSession: true,
      storage: typeof window !== 'undefined' ? window.localStorage : undefined
    }
  });
}

export const supabase: SupabaseClient = supabaseInstance as any;

export const getSession = async (): Promise<Session | null> => {
  if (!isSupabaseConfigured()) return null;
  const { data, error } = await supabase.auth.getSession();
  if (error) {
    console.warn('Supabase session fetch failed:', error.message);
    return null;
  }
  return data.session;
};

export type AuthStateChangeHandler = (event: string, session: Session | null) => void;

export const onAuthStateChanged = (callback: AuthStateChangeHandler) => {
  if (!isSupabaseConfigured()) return () => null;
  const subscription = supabase.auth.onAuthStateChange(callback);
  return () => subscription.data.subscription?.unsubscribe?.();
};

export const mapProfileRow = (row: any): UserProfile => ({
  id: row.id,
  fullName: row.full_name || row.name || 'AetherFly Member',
  email: row.email,
  tier: (row.tier as UserProfile['tier']) || 'Platinum',
  credits: Number(row.credits ?? 2500),
  avatarUrl: row.avatar_url ?? undefined,
  createdAt: row.created_at ?? undefined
});

export const formatBookingPayload = (booking: Booking, userId: string) => ({
  id: booking.id,
  booking_reference: booking.bookingReference ?? booking.ref,
  ref_code: booking.ref,
  user_id: userId,
  flight_id: booking.flight.id,
  passenger_name: booking.passengerName,
  passenger_email: booking.passengerEmail ?? '',
  passport_number: booking.passportNumber,
  seat_code: booking.seatCode,
  seat_class: booking.seatClass,
  cabin_class: booking.cabinClass ?? booking.seatClass,
  trip_type: booking.tripType,
  status: booking.status,
  price: booking.price,
  currency: booking.currency ?? 'USD',
  base_fare: booking.baseFare ?? booking.price,
  tax_amount: booking.taxAmount ?? 0,
  fees: booking.fees ?? 0,
  discount_amount: booking.discountAmount ?? 0,
  promo_code: booking.promoCode ?? null,
  exchange_rate: booking.exchangeRate ?? 1,
  fare_breakdown: booking.fareBreakdown ?? {
    baseFare: booking.baseFare ?? booking.price,
    taxes: booking.taxAmount ?? 0,
    fees: booking.fees ?? 0,
    discounts: booking.discountAmount ?? 0
  },
  flight_no: booking.flight.flightNo,
  airline: booking.flight.airline,
  from_code: booking.flight.fromCode,
  from_name: booking.flight.fromName,
  to_code: booking.flight.toCode,
  to_name: booking.flight.toName,
  depart_time: booking.flight.departTime,
  arrive_time: booking.flight.arriveTime,
  depart_date: booking.date,
  baggage_allowance: booking.flight.baggageAllowance ?? null,
  terminal: booking.flight.terminal ?? null,
  gate: booking.flight.gate ?? null,
  flight_duration: booking.flight.flightDuration ?? booking.flight.duration,
  boarding_group: booking.boardingGroup ?? null,
  flight_status: booking.flight.status ?? booking.flightStatus ?? 'scheduled',
  fare_type: booking.fareType ?? 'standard',
  aircraft_type: booking.aircraftType ?? booking.flight.aircraftType ?? booking.flight.planeType,
  status_note: booking.statusNote ?? booking.flight.status ?? 'scheduled'
});

export const AetherPlatformAPI = {
  async dispatchTicketEmail(booking: Booking, customerEmail: string) {
    const result = await EmailService.dispatchBookingEmail(booking, customerEmail);
    return {
      delivered: true,
      message: `Sent booking confirmation and e-ticket to ${customerEmail}`,
      result
    };
  }
};

export const buildAuthProfile = (user: User, metadata: Partial<UserProfile> & Record<string, any> & Record<string, any> = {}): UserProfile => ({
  id: user.id,
  fullName: metadata.fullName ?? metadata.full_name ?? user.email?.split('@')[0] ?? 'AetherFly Guest',
  email: user.email ?? 'unknown@aetherfly.com',
  tier: (metadata.tier as UserProfile['tier']) || 'Platinum',
  credits: Number(metadata.credits ?? 2500),
  avatarUrl: metadata.avatarUrl ?? metadata.avatar_url
});
