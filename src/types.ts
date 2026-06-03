export type FlightStatus = 'scheduled' | 'boarding' | 'departed' | 'delayed' | 'landed' | 'cancelled';

export type SeatClass = 'Economy' | 'Premium Economy' | 'Business' | 'First';

export interface Layover {
  location: string;
  duration: string;
}

export interface Flight {
  id: string;
  airline: string;
  flightNo: string;
  fromCode: string;
  fromName: string;
  toCode: string;
  toName: string;
  departTime: string;
  arriveTime: string;
  duration: string;
  flightDuration?: string;
  price: number;
  baseFare?: number;
  taxRate?: number;
  currency?: string;
  fareType?: string;
  cabinClasses?: string[];
  aircraftType?: string;
  stops: number;
  planeType: string;
  terminal?: string;
  gate?: string;
  baggageAllowance?: string;
  status?: FlightStatus;
  totalSeats?: number;
  availableSeats?: number;
  occupancy?: number;
  distanceKm?: number;
  routePopularity?: number;
  departureAt?: string;
  arrivalAt?: string;
  layovers?: Layover[];
}

export interface AirportOption {
  id: string;
  label: string;
  name: string;
  code: string;
  city: string;
  country: string;
  countryCode?: string;
  latitude?: number;
  longitude?: number;
  region?: string;
  airportName?: string;
}

export type BookingStatus = 'pending' | 'confirmed' | 'ticketed' | 'completed' | 'cancelled' | 'Confirmed' | 'Cancelled';

export interface Booking {
  id: string;
  ref: string;
  flight: Flight;
  flightId?: string;
  bookingReference?: string;
  passengerName: string;
  passengerEmail?: string;
  passportNumber: string;
  seatCode: string;
  seatClass: SeatClass;
  cabinClass?: SeatClass;
  fareType?: string;
  aircraftType?: string;
  flightStatus?: FlightStatus;
  statusNote?: string;
  boardingGroup?: string;
  currency?: string;
  baseFare?: number;
  taxAmount?: number;
  fees?: number;
  discountAmount?: number;
  promoCode?: string;
  exchangeRate?: number;
  fareBreakdown?: Record<string, unknown>;
  status: BookingStatus;
  price: number;
  date: string;
  tripType: 'roundtrip' | 'oneway' | 'multi-city';
}

export interface FlightSegment {
  from: string;
  to: string;
  departDate: string;
  seatClass: SeatClass;
}

export interface SearchParams {
  from: string;
  to: string;
  departDate: string;
  returnDate: string;
  passengers: string;
  seatClass: SeatClass;
  tripType: 'roundtrip' | 'oneway' | 'multi-city';
  segments?: FlightSegment[];
}

export interface BoardingPass {
  id: string;
  bookingId: string;
  gate: string;
  boardingGroup: string;
  boardingZone?: string;
  boardingTime: string;
  seatCode: string;
  terminal?: string;
  departureAt: string;
  qrCodeUrl: string;
  qrPayload?: Record<string, unknown>;
  status: 'issued' | 'cancelled';
  seatClass?: SeatClass;
  cabinClass?: SeatClass;
  fareType?: string;
  aircraftType?: string;
  flightStatus?: FlightStatus;
  statusNote?: string;
}

export interface BookingPassenger {
  id: string;
  bookingId: string;
  name: string;
  passportNumber: string;
  email: string;
  seatCode: string;
  seatClass: SeatClass;
  ageGroup: 'adult' | 'child' | 'infant';
}

export interface PricingRule {
  id: string;
  name: string;
  description: string;
  seatClass: SeatClass;
  routePattern: string;
  multiplier: number;
  startDate: string;
  endDate: string;
  holidayRule: boolean;
}

export interface TicketInventory {
  id: string;
  ticketNumber: string;
  bookingId: string;
  issuedAt: string;
  qrCodeUrl: string;
  status: 'available' | 'issued' | 'cancelled';
}

export interface SupportTicket {
  id: string;
  subject: string;
  category: string;
  message: string;
  status: 'Open' | 'Resolved';
  date: string;
  customerName?: string;
  customerEmail?: string;
  bookingRef?: string;
}

export interface UserProfile {
  id: string;
  fullName: string;
  email: string;
  tier: 'Classic' | 'Gold' | 'Platinum' | 'Royal Centurion';
  credits: number;
  avatarUrl?: string;
  createdAt?: string;
}

export type PaymentState = 'pending' | 'processing' | 'paid' | 'completed' | 'failed' | 'refunded';

export interface PaymentRecord {
  id: string;
  bookingId: string;
  bookingRef?: string;
  userId: string;
  provider: string;
  paymentMethod?: string;
  currency: string;
  amount: number;
  taxAmount?: number;
  fees?: number;
  discountAmount?: number;
  convertedAmount?: number;
  exchangeRate?: number;
  promoCode?: string;
  fareBreakdown?: Record<string, unknown>;
  refundedAmount?: number;
  status: PaymentState;
  chargedAt: string;
  receiptUrl?: string;
  metadata?: Record<string, unknown>;
  createdAt?: string;
  updatedAt?: string;
}

export interface TicketRecord {
  id: string;
  bookingId: string;
  ticketNumber: string;
  qrCodeUrl: string;
  qrPayload?: Record<string, unknown>;
  boardingGroup?: string;
  boardingZone?: string;
  departureGate?: string;
  boardingTime?: string;
  terminal?: string;
  seatCode?: string;
  seatClass?: SeatClass;
  cabinClass?: SeatClass;
  fareType?: string;
  aircraftType?: string;
  flightStatus?: FlightStatus;
  statusNote?: string;
  issuedAt: string;
  updatedAt?: string;
  status: 'issued' | 'cancelled';
}

export interface LoyaltyReward {
  id: string;
  userId: string;
  title: string;
  description: string;
  value: number;
  status: 'active' | 'redeemed';
  expiresAt: string;
}

export interface Destination {
  id: string;
  name: string;
  code: string;
  country: string;
  region: string;
  description: string;
  featuredImage: string;
}

export interface Offer {
  id: string;
  title: string;
  subtitle: string;
  discountPercent: number;
  validFrom: string;
  validUntil: string;
  destinationIds: string[];
  active: boolean;
}
