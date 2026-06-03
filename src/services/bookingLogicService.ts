import { supabase, isSupabaseConfigured } from '../lib/supabase';
import { Booking, SearchParams } from '../types';
import { createBoardingPass } from './boardingPassService';
import { SeatInventoryService } from './seatInventoryService';

const generateTicketNumber = (flightNo: string) => {
  const numeric = Math.floor(100000000 + Math.random() * 900000000);
  return `${flightNo.slice(0, 2).toUpperCase()}-${numeric}`;
};

const generateBookingId = () => {
  if (typeof crypto !== 'undefined' && 'randomUUID' in crypto) {
    return (crypto as any).randomUUID();
  }
  return `booking-${Math.floor(100000000 + Math.random() * 900000000)}`;
};

const mapBookingPayload = (booking: Booking, userId: string) => ({
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

const mapPaymentPayload = (booking: Booking, userId: string) => ({
  id: `pay-${Date.now()}-${Math.floor(Math.random() * 10000)}`,
  user_id: userId,
  booking_id: booking.id,
  booking_ref: booking.ref,
  provider: 'AetherPay',
  payment_method: 'card',
  currency: booking.currency ?? 'USD',
  amount: booking.price,
  tax_amount: booking.taxAmount ?? 0,
  fees: booking.fees ?? 0,
  discount_amount: booking.discountAmount ?? 0,
  converted_amount: booking.price * (booking.exchangeRate ?? 1),
  exchange_rate: booking.exchangeRate ?? 1,
  promo_code: booking.promoCode ?? null,
  fare_breakdown: booking.fareBreakdown ?? {
    baseFare: booking.baseFare ?? booking.price,
    taxes: booking.taxAmount ?? 0,
    fees: booking.fees ?? 0,
    discounts: booking.discountAmount ?? 0
  },
  receipt_url: `https://aetherfly.com/receipts/${booking.ref}`,
  metadata: {
    bookingRef: booking.ref,
    flightNo: booking.flight.flightNo,
    seatCode: booking.seatCode
  },
  status: 'paid',
  refunded_amount: 0
});

const mapTicketPayload = (booking: Booking) => ({
  id: `ticket-${Date.now()}-${Math.floor(Math.random() * 10000)}`,
  booking_id: booking.id,
  ticket_number: generateTicketNumber(booking.flight.flightNo),
  qr_code_url: `https://api.qrserver.com/v1/create-qr-code/?size=220x220&data=${encodeURIComponent(`${booking.ref}|${booking.flight.flightNo}|${booking.seatCode}`)}`,
  qr_payload: {
    bookingRef: booking.ref,
    flightNo: booking.flight.flightNo,
    seatCode: booking.seatCode,
    passengerEmail: booking.passengerEmail
  },
  boarding_group: booking.boardingGroup ?? '1',
  boarding_zone: `Zone ${Math.ceil(Math.random() * 4)}`,
  departure_gate: booking.flight.gate ?? 'A1',
  boarding_time: new Date(Date.now() + 45 * 60 * 1000).toISOString(),
  terminal: booking.flight.terminal ?? 'T1',
  seat_code: booking.seatCode,
  seat_class: booking.seatClass,
  cabin_class: booking.cabinClass ?? booking.seatClass,
  fare_type: booking.fareType ?? 'standard',
  aircraft_type: booking.aircraftType ?? booking.flight.aircraftType ?? booking.flight.planeType,
  flight_status: booking.flight.status ?? booking.flightStatus ?? 'scheduled',
  status_note: booking.statusNote ?? 'ticket issued',
  issued_at: new Date().toISOString(),
  status: 'issued'
});

const mapPassengerPayload = (booking: Booking) => ({
  id: `passenger-${Date.now()}-${Math.floor(Math.random() * 10000)}`,
  booking_id: booking.id,
  name: booking.passengerName,
  passport_number: booking.passportNumber,
  email: booking.passengerEmail ?? '',
  seat_code: booking.seatCode,
  seat_class: booking.seatClass,
  age_group: 'adult'
});

export const BookingLogicService = {
  async reserveSeatDuringCheckout(flightId: string, seatCode: string, userId?: string): Promise<boolean> {
    return SeatInventoryService.reserveSeat(flightId, seatCode, userId);
  },

  async confirmBooking(booking: Booking, userId: string): Promise<Booking | null> {
    if (!isSupabaseConfigured()) return null;
    try {
      const boardingPass = createBoardingPass(booking);
      const bookingPayload = mapBookingPayload(booking, userId);
      const paymentPayload = mapPaymentPayload(booking, userId);
      const ticketPayload = mapTicketPayload(booking);
      const boardingPayload = {
        id: `boarding-${Date.now()}-${Math.floor(Math.random() * 10000)}`,
        booking_id: booking.id,
        gate: boardingPass.gate,
        boarding_group: boardingPass.boardingGroup,
        boarding_zone: boardingPass.boardingZone,
        boarding_time: boardingPass.boardingTime,
        departure_gate: boardingPass.departureAt ? boardingPass.gate : booking.flight.gate,
        terminal: boardingPass.terminal ?? booking.flight.terminal ?? 'T1',
        seat_code: boardingPass.seatCode,
        seat_class: booking.seatClass,
        cabin_class: booking.cabinClass ?? booking.seatClass,
        fare_type: booking.fareType ?? 'standard',
        aircraft_type: booking.aircraftType ?? booking.flight.aircraftType ?? booking.flight.planeType,
        flight_status: booking.flight.status ?? booking.flightStatus ?? 'scheduled',
        status_note: booking.statusNote ?? 'ready for boarding',
        qr_payload: boardingPass.qrPayload ?? {
          bookingRef: booking.ref,
          seatCode: booking.seatCode,
          flightNo: booking.flight.flightNo
        },
        qr_code_url: boardingPass.qrCodeUrl,
        status: boardingPass.status
      };
      const passengerPayload = mapPassengerPayload(booking);

      // Ensure the seat has been reserved before confirming the booking.
      await SeatInventoryService.reserveSeat(booking.flight.id, booking.seatCode, userId);

      const { data, error } = await supabase.rpc('create_booking_transaction', {
        booking_payload: bookingPayload,
        payment_payload: paymentPayload,
        ticket_payload: ticketPayload,
        boarding_payload: boardingPayload,
        passenger_payload: passengerPayload
      });

      if (error) {
        console.warn('Booking transaction failed:', error.message);
        return null;
      }

      return booking;
    } catch (err) {
      console.warn('confirmBooking failed:', err);
      return null;
    }
  },

  createPendingBooking(flight: Booking['flight'], searchParams: SearchParams, passenger: { name: string; passport: string; email: string }, seatCode: string, price: number): Booking {
    const bookingId = generateBookingId();
    const ref = `AF-${Math.floor(100000 + Math.random() * 900000)}`;
    return {
      id: bookingId,
      ref,
      flight,
      flightId: flight.id,
      bookingReference: ref,
      passengerName: passenger.name,
      passengerEmail: passenger.email,
      passportNumber: passenger.passport,
      seatCode,
      status: 'pending',
      price,
      currency: 'USD',
      baseFare: price,
      taxAmount: 0,
      fees: 0,
      discountAmount: 0,
      exchangeRate: 1,
      fareBreakdown: {
        baseFare: price,
        taxes: 0,
        fees: 0,
        discounts: 0
      },
      date: searchParams.departDate,
      seatClass: searchParams.seatClass,
      cabinClass: searchParams.seatClass,
      fareType: 'standard',
      flightStatus: flight.status ?? 'scheduled',
      aircraftType: flight.aircraftType ?? flight.planeType,
      tripType: searchParams.tripType
    };
  }
};
