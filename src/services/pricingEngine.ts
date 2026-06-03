import { SeatClass } from '../types';

const seatClassMultipliers: Record<SeatClass, number> = {
  Economy: 1,
  'Premium Economy': 1.35,
  Business: 1.75,
  First: 2.5
};

const holidayDates = new Set([
  '2026-01-01',
  '2026-12-25',
  '2026-11-26',
  '2026-07-04',
  '2026-12-31'
]);

const formatPrice = (value: number): number => Number(value.toFixed(2));

const getDateKey = (input: string | Date): string => {
  const date = typeof input === 'string' ? new Date(input) : input;
  return date.toISOString().slice(0, 10);
};

const isWeekend = (input: string | Date): boolean => {
  const date = typeof input === 'string' ? new Date(input) : input;
  const day = date.getUTCDay();
  return day === 0 || day === 6;
};

const isHoliday = (input: string | Date): boolean => {
  return holidayDates.has(getDateKey(input));
};

const daysUntil = (input: string | Date): number => {
  const now = new Date();
  const target = typeof input === 'string' ? new Date(input) : input;
  const delta = target.getTime() - now.getTime();
  return Math.ceil(delta / (1000 * 60 * 60 * 24));
};

export const getSeatClassMultiplier = (seatClass: SeatClass): number => {
  return seatClassMultipliers[seatClass] ?? 1;
};

export const getPeakMultiplier = (travelDate?: string): number => {
  if (!travelDate) return 1;
  let multiplier = 1;
  if (isWeekend(travelDate)) multiplier += 0.12;
  if (isHoliday(travelDate)) multiplier += 0.20;
  const days = daysUntil(travelDate);
  if (days <= 3) multiplier += 0.25;
  else if (days <= 7) multiplier += 0.12;
  return multiplier;
};

export const getAvailabilityMultiplier = (totalSeats = 180, availableSeats = 180): number => {
  if (totalSeats <= 0) return 1;
  const soldRatio = Math.max(0, Math.min(1, 1 - availableSeats / totalSeats));
  if (soldRatio >= 0.90) return 1.45;
  if (soldRatio >= 0.80) return 1.30;
  if (soldRatio >= 0.65) return 1.18;
  if (soldRatio >= 0.50) return 1.08;
  return 1;
};

export const getRoutePopularityMultiplier = (routePopularity = 1): number => {
  return 1 + Math.min(0.65, Math.max(-0.05, (routePopularity - 1) * 0.35));
};

export interface PricingContext {
  baseFare: number;
  seatClass: SeatClass;
  totalSeats: number;
  availableSeats: number;
  routePopularity: number;
  travelDate?: string;
}

export const computeDynamicFare = ({
  baseFare,
  seatClass,
  totalSeats,
  availableSeats,
  routePopularity,
  travelDate
}: PricingContext): number => {
  const seatMultiplier = getSeatClassMultiplier(seatClass);
  const demandMultiplier = getPeakMultiplier(travelDate);
  const availabilityMultiplier = getAvailabilityMultiplier(totalSeats, availableSeats);
  const routeMultiplier = getRoutePopularityMultiplier(routePopularity);

  const price = baseFare * seatMultiplier * demandMultiplier * availabilityMultiplier * routeMultiplier;
  return formatPrice(Math.max(price, 75));
};

export const createSeatPrice = (
  baseFare: number,
  seatClass: SeatClass,
  totalSeats: number,
  availableSeats: number,
  routePopularity: number,
  travelDate?: string
): number => {
  return computeDynamicFare({
    baseFare,
    seatClass,
    totalSeats,
    availableSeats,
    routePopularity,
    travelDate
  });
};
