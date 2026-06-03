import { supabase, isSupabaseConfigured, mapProfileRow, formatBookingPayload } from '../lib/supabase';
import { Booking, Destination, LoyaltyReward, Offer, PaymentRecord, TicketRecord, UserProfile } from '../types';

export const DBService = {
  async testConnection(): Promise<{ success: boolean; message: string }> {
    if (!isSupabaseConfigured()) {
      return { success: false, message: 'Supabase is not configured.' };
    }
    const { data, error } = await supabase.from('user_profiles').select('id').limit(1);
    if (error) {
      return { success: false, message: error.message };
    }
    return { success: true, message: 'Supabase connection is healthy.' };
  },

  async fetchUserProfile(userId: string): Promise<UserProfile | null> {
    if (!isSupabaseConfigured()) return null;
    const { data, error } = await supabase.from('user_profiles').select('*').eq('id', userId).single();
    if (error || !data) {
      console.warn('Failed to fetch user profile from Supabase:', error?.message);
      return null;
    }
    return mapProfileRow(data);
  },

  async createUserProfile(profile: Partial<UserProfile>): Promise<UserProfile | null> {
    if (!isSupabaseConfigured()) return null;
    const payload = {
      id: profile.id,
      full_name: profile.fullName,
      email: profile.email,
      tier: profile.tier,
      credits: profile.credits ?? 2500,
      avatar_url: profile.avatarUrl ?? null
    };
    const { data, error } = await supabase.from('user_profiles').upsert(payload).select().single();
    if (error || !data) {
      console.warn('Failed to create or update user profile:', error?.message);
      return null;
    }
    return mapProfileRow(data);
  },

  async fetchBookings(userId: string): Promise<Booking[]> {
    if (!isSupabaseConfigured()) return [];
    const { data, error } = await supabase
      .from('bookings')
      .select('*')
      .eq('user_id', userId)
      .order('created_at', { ascending: false });

    if (error || !data) {
      console.warn('Failed to fetch bookings from Supabase:', error?.message);
      return [];
    }

    return data.map((row: any) => ({
      id: row.id,
      ref: row.ref_code,
      flight: {
        id: row.flight_no,
        airline: row.airline,
        flightNo: row.flight_no,
        fromCode: row.from_code,
        fromName: row.from_name,
        toCode: row.to_code,
        toName: row.to_name,
        departTime: row.depart_time,
        arriveTime: row.arrive_time,
        duration: row.duration ?? '—',
        price: Number(row.price),
        stops: Number(row.stops ?? 0),
        planeType: row.plane_type ?? 'Aether Suite'
      },
      passengerName: row.passenger_name,
      passportNumber: row.passport_number,
      seatCode: row.seat_code,
      status: row.status,
      price: Number(row.price),
      date: row.depart_date,
      seatClass: row.seat_class,
      tripType: row.trip_type
    }));
  },

  async createBooking(booking: Booking, userId: string): Promise<Booking | null> {
    if (!isSupabaseConfigured()) return null;
    const payload = formatBookingPayload(booking, userId);
    const { data, error } = await supabase.from('bookings').insert(payload).select().single();
    if (error || !data) {
      console.warn('Failed to create booking in Supabase:', error?.message);
      return null;
    }
    return booking;
  },

  async fetchDestinations(): Promise<Destination[]> {
    if (!isSupabaseConfigured()) {
      return [
        { id: 'dest-1', name: 'Paris', code: 'CDG', country: 'France', region: 'Europe', description: 'Timeless luxury escapes and art-filled journeys.', featuredImage: 'https://images.unsplash.com/photo-1511739001486-6bfe10ce785f' },
        { id: 'dest-2', name: 'Maldives', code: 'MLE', country: 'Maldives', region: 'Indian Ocean', description: 'Private villas over turquoise lagoons.', featuredImage: 'https://images.unsplash.com/photo-1507525428034-b723cf961d3e' }
      ];
    }
    const { data, error } = await supabase.from('destinations').select('*').order('name');
    if (error || !data) {
      console.warn('Failed to load destinations:', error?.message);
      return [];
    }
    return data;
  },

  async fetchOffers(): Promise<Offer[]> {
    if (!isSupabaseConfigured()) {
      return [
        { id: 'offer-1', title: 'Platinum Route Upgrade', subtitle: 'Gain 20% bonus credits on your next first class booking.', discountPercent: 20, validFrom: new Date().toISOString(), validUntil: new Date(Date.now() + 1000 * 60 * 60 * 24 * 30).toISOString(), destinationIds: ['dest-1', 'dest-2'], active: true },
        { id: 'offer-2', title: 'Executive Escape', subtitle: 'Complimentary lounge access for every booking above $3,500.', discountPercent: 0, validFrom: new Date().toISOString(), validUntil: new Date(Date.now() + 1000 * 60 * 60 * 24 * 45).toISOString(), destinationIds: ['dest-1'], active: true }
      ];
    }
    const { data, error } = await supabase.from('offers').select('*').order('valid_from', { ascending: false });
    if (error || !data) {
      console.warn('Failed to load offers:', error?.message);
      return [];
    }
    return data;
  },

  async fetchLoyaltyRewards(userId: string): Promise<LoyaltyReward[]> {
    if (!isSupabaseConfigured()) return [];
    const { data, error } = await supabase.from('loyalty_rewards').select('*').eq('user_id', userId).order('expires_at', { ascending: true });
    if (error || !data) {
      console.warn('Failed to load loyalty rewards:', error?.message);
      return [];
    }
    return data;
  },

  async fetchPayments(userId: string): Promise<PaymentRecord[]> {
    if (!isSupabaseConfigured()) return [];
    const { data, error } = await supabase.from('payments').select('*').eq('user_id', userId).order('charged_at', { ascending: false });
    if (error || !data) {
      console.warn('Failed to load payments:', error?.message);
      return [];
    }
    return data.map((row: any) => ({
      id: row.id,
      bookingId: row.booking_id,
      bookingRef: row.booking_ref,
      userId: row.user_id,
      provider: row.provider,
      currency: row.currency,
      amount: Number(row.amount),
      status: row.status,
      chargedAt: row.charged_at,
      receiptUrl: row.receipt_url,
      metadata: row.metadata,
      createdAt: row.created_at,
      updatedAt: row.updated_at
    }));
  },

  async createPaymentRecord(payload: { id: string; booking_id: string; booking_ref?: string; user_id: string; provider: string; currency: string; amount: number; status?: string; metadata?: any; }) {
    if (!isSupabaseConfigured()) return null;
    const record = { ...payload, charged_at: new Date().toISOString(), booking_ref: payload.booking_ref ?? null };
    const { data, error } = await supabase.from('payments').insert(record).select().single();
    if (error || !data) {
      console.warn('Failed to create payment record:', error?.message);
      return null;
    }
    await supabase.from('payment_logs').insert({ payment_id: data.id, status: data.status, message: 'created_via_dbservice', meta: {} });
    return {
      id: data.id,
      bookingId: data.booking_id,
      bookingRef: data.booking_ref,
      userId: data.user_id,
      provider: data.provider,
      paymentMethod: data.provider,
      currency: data.currency,
      amount: Number(data.amount),
      status: data.status,
      chargedAt: data.charged_at,
      receiptUrl: data.receipt_url,
      metadata: data.metadata,
      createdAt: data.created_at,
      updatedAt: data.updated_at
    };
  },

  async updatePaymentStatus(paymentId: string, status: string, meta: any = {}) {
    if (!isSupabaseConfigured()) return null;
    const { data, error } = await supabase.from('payments').update({ status, updated_at: new Date().toISOString() }).eq('id', paymentId).select().single();
    if (error) {
      console.warn('Failed to update payment status via DBService:', error?.message);
      return null;
    }
    await supabase.from('payment_logs').insert({ payment_id: paymentId, status, message: 'updated_via_dbservice', meta });
    if (!data) return null;
    return {
      id: data.id,
      bookingId: data.booking_id,
      bookingRef: data.booking_ref,
      userId: data.user_id,
      provider: data.provider,
      currency: data.currency,
      amount: Number(data.amount),
      status: data.status,
      chargedAt: data.charged_at,
      receiptUrl: data.receipt_url,
      metadata: data.metadata,
      createdAt: data.created_at,
      updatedAt: data.updated_at
    };
  },

  async fetchAnalytics(): Promise<{ totalBookings: number; activeTrips: number; totalSpending: number; loyaltyPoints: number; recentActivity: Array<Record<string, unknown>> }> {
    if (!isSupabaseConfigured()) {
      return {
        totalBookings: 0,
        activeTrips: 0,
        totalSpending: 0,
        loyaltyPoints: 0,
        recentActivity: []
      };
    }

    const [{ data: totalBookings }, { data: activeTrips }, { data: payments }] = await Promise.all([
      supabase.from('bookings').select('id', { count: 'exact' }),
      supabase.from('bookings').select('id', { count: 'exact' }).in('status', ['confirmed', 'ticketed']),
      supabase.from('payments').select('amount')
    ]);

    const totalSpending = (payments || []).reduce((sum: number, p: any) => sum + Number(p.amount ?? 0), 0);

    return {
      totalBookings: totalBookings?.length ?? 0,
      activeTrips: activeTrips?.length ?? 0,
      totalSpending,
      loyaltyPoints: 0,
      recentActivity: []
    };
  },

  async createSupportTicket(ticket: TicketRecord, userId: string): Promise<TicketRecord | null> {
    if (!isSupabaseConfigured()) return null;
    const payload = {
      id: ticket.id,
      booking_id: ticket.bookingId,
      ticket_number: ticket.ticketNumber,
      qr_code_url: ticket.qrCodeUrl,
      issued_at: ticket.issuedAt,
      status: ticket.status,
      user_id: userId
    };
    const { data, error } = await supabase.from('tickets').insert(payload).select().single();
    if (error || !data) {
      console.warn('Failed to create support ticket:', error?.message);
      return null;
    }
    return ticket;
  }
};
