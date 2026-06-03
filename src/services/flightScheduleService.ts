import { Flight, SearchParams } from '../types';
import { createSeatPrice } from './pricingEngine';

const airportTimezones: Record<string, string> = {
  KUL: 'Asia/Kuala_Lumpur',
  DXB: 'Asia/Dubai',
  LHR: 'Europe/London',
  JFK: 'America/New_York',
  HND: 'Asia/Tokyo',
  IST: 'Europe/Istanbul',
  CDG: 'Europe/Paris',
  SIN: 'Asia/Singapore',
  MLE: 'Indian/Maldives'
};

const routeDistanceLookup: Record<string, number> = {
  'KUL-DXB': 5675,
  'KUL-LHR': 6240,
  'DXB-JFK': 11000,
  'LHR-JFK': 5540,
  'SIN-CDG': 10800,
  'IST-JFK': 8110,
  'DXB-HND': 7930,
  'KUL-MLE': 2980
};

const buildTimezoneLabel = (airportCode: string): string => airportTimezones[airportCode] ?? 'UTC';

const formatLocalTime = (date: Date, timeZone: string): string => {
  try {
    return new Intl.DateTimeFormat('en-US', {
      hour: '2-digit',
      minute: '2-digit',
      hour12: false,
      timeZone
    }).format(date);
  } catch {
    return date.toISOString().slice(11, 16);
  }
};

const buildDuration = (distanceKm: number, stops: number): string => {
  const baseMinutes = Math.max(120, Math.round(distanceKm / 12));
  const stopPenalty = stops * 65;
  const totalMinutes = baseMinutes + stopPenalty;
  const hours = Math.floor(totalMinutes / 60);
  const minutes = totalMinutes % 60;
  return `${hours}h ${minutes.toString().padStart(2, '0')}m`;
};

const buildGate = (airportCode: string): string => {
  const terminal = airportCode[0] ?? 'A';
  const gateNum = 1 + Math.floor(Math.random() * 16);
  return `${terminal}${gateNum}`;
};

const buildBaggageAllowance = (seatClass: string): string => {
  switch (seatClass) {
    case 'First':
      return '3 checked bags • 18kg each';
    case 'Business':
      return '2 checked bags • 18kg each';
    case 'Premium Economy':
      return '2 checked bags • 23kg each';
    default:
      return '1 checked bag • 23kg';
  }
};

export function buildFlightSchedule(row: any, params: Partial<SearchParams>): Flight {
  const schedule = Array.isArray(row.flight_schedules) && row.flight_schedules.length > 0 ? row.flight_schedules[0] : null;
  const departDate = row.depart_date ?? params.departDate ?? new Date().toISOString().slice(0, 10);
  const departTime = schedule?.departure_at
    ? new Date(schedule.departure_at)
    : new Date(`${departDate}T${row.depart_time ?? '09:00'}:00Z`);

  const routeKey = `${row.from_code}-${row.to_code}`;
  const distanceKm = row.distance_km ?? routeDistanceLookup[routeKey] ?? 5400;
  const stops = Number(row.stops ?? 0);
  const duration = schedule?.duration ?? buildDuration(distanceKm, stops);

  const arriveTime = schedule?.arrival_at
    ? new Date(schedule.arrival_at)
    : new Date(departTime.getTime() + (Math.max(120, Math.round(distanceKm / 12)) + stops * 65) * 60_000);

  const departTimezone = buildTimezoneLabel(row.from_code);
  const arriveTimezone = buildTimezoneLabel(row.to_code);
  const departDisplay = formatLocalTime(departTime, departTimezone);
  const arriveDisplay = formatLocalTime(arriveTime, arriveTimezone);
  const terminal = row.terminal ?? (stops === 0 ? 'A' : 'B');
  const gate = row.gate ?? buildGate(row.from_code);
  const status = row.status ?? 'scheduled';
  const totalSeats = Number(row.total_seats ?? 180);
  const availableSeats = Number(row.available_seats ?? Math.max(0, totalSeats - (row.booked_seats ?? 0)));
  const occupancy = totalSeats > 0 ? Number(((totalSeats - availableSeats) / totalSeats).toFixed(2)) : 0;
  const seatClass = params.seatClass ?? 'Economy';
  const baseFare = Number(row.base_fare ?? row.price ?? 250);
  const routePopularity = Number(row.route_popularity ?? 1);

  const price = createSeatPrice(baseFare, seatClass, totalSeats, availableSeats, routePopularity, departDate);

  return {
    id: row.id || `${row.flight_no}-${departDate}`,
    airline: row.airline,
    flightNo: row.flight_no,
    fromCode: row.from_code,
    fromName: row.from_name,
    toCode: row.to_code,
    toName: row.to_name,
    departTime: departDisplay,
    arriveTime: arriveDisplay,
    duration,
    price,
    stops,
    planeType: row.plane_type ?? 'Aether Suite',
    terminal,
    gate,
    baggageAllowance: buildBaggageAllowance(seatClass),
    status,
    distanceKm,
    routePopularity,
    totalSeats,
    availableSeats,
    occupancy,
    baseFare,
    departureAt: departTime.toISOString(),
    arrivalAt: arriveTime.toISOString(),
    layovers: row.layovers ?? []
  } as Flight;
}

export function generateFallbackFlightSchedule(from: string, to: string, date: string, flightNo: string, airline: string, index: number, seatClass: string): Flight {
  const fromCode = from.includes('(') ? from.split('(')[1].replace(')', '') : from;
  const toCode = to.includes('(') ? to.split('(')[1].replace(')', '') : to;
  const depart = new Date(`${date}T${8 + index * 3}:00:00Z`);
  const distanceKm = routeDistanceLookup[`${fromCode}-${toCode}`] ?? 5400;
  const stops = index % 3 === 0 ? 0 : 1;
  const duration = buildDuration(distanceKm, stops);
  const arrive = new Date(depart.getTime() + (Math.round(distanceKm / 12) + stops * 65) * 60_000);
  const departTimezone = buildTimezoneLabel(fromCode);
  const arriveTimezone = buildTimezoneLabel(toCode);

  return {
    id: `${flightNo}-${date}`,
    airline,
    flightNo,
    fromCode,
    fromName: from,
    toCode,
    toName: to,
    departTime: formatLocalTime(depart, departTimezone),
    arriveTime: formatLocalTime(arrive, arriveTimezone),
    duration,
    price: createSeatPrice(250 + index * 120, seatClass as any, 180, 60, 1.1, date),
    stops,
    planeType: index % 2 === 0 ? 'Boeing 787 Dreamliner' : 'Airbus A380',
    terminal: buildGate(fromCode).slice(0, 1),
    gate: buildGate(fromCode),
    baggageAllowance: buildBaggageAllowance(seatClass),
    status: 'scheduled',
    distanceKm,
    routePopularity: 1,
    totalSeats: 180,
    availableSeats: 68,
    occupancy: 0.62,
    baseFare: 250,
    departureAt: depart.toISOString(),
    arrivalAt: arrive.toISOString(),
    layovers: stops > 0 ? [{ location: 'DXB', duration: '1h 20m' }] : []
  } as Flight;
}
