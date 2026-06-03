import { AirportOption, Flight, SearchParams } from '../types';

const API_KEY = import.meta.env.VITE_AVIATIONSTACK_API_KEY as string | undefined;
const BASE_URL = 'https://api.aviationstack.com/v1';

const airportCache = new Map<string, AirportOption[]>();
const airportInflight = new Map<string, Promise<AirportOption[]>>();

export function hasAviationStackKey(): boolean {
  return Boolean(API_KEY && API_KEY.trim().length > 0);
}

function safeLabel(name: string, code: string) {
  return `${name}${code ? ` (${code})` : ''}`.trim();
}

function normalizeCode(value: string) {
  return value.trim().toUpperCase();
}

function formatTime(value?: string) {
  if (!value) return '—';
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return value;
  return date.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
}

function mapAirportRecord(record: any): AirportOption {
  const city = record.city_name || record.name || '';
  const country = record.country_name || record.country || '';
  const code = record.iata_code || record.icao_code || '';
  const airportName = record.airport_name || record.name || city;

  return {
    id: `${code || airportName}-${city}-${country}`,
    label: safeLabel(`${airportName}${city && airportName !== city ? `, ${city}` : ''}`, code),
    name: city,
    code,
    city,
    country,
    region: record.timezone || record.city_iata || record.country_iso2,
    airportName
  };
}

async function fetchAirportMatches(query: string): Promise<AirportOption[]> {
  if (!hasAviationStackKey()) return [];
  const normalizedQuery = query.trim();
  if (!normalizedQuery) return [];
  const url = `${BASE_URL}/airports?access_key=${encodeURIComponent(API_KEY!)}&search=${encodeURIComponent(normalizedQuery)}&limit=10`;

  const response = await fetch(url);
  if (!response.ok) {
    throw new Error(`AviationStack airport search failed with ${response.status}`);
  }

  const payload = await response.json();
  if (!payload || !Array.isArray(payload.data)) {
    return [];
  }

  return payload.data
    .filter((record: any) => record && (record.iata_code || record.icao_code))
    .map(mapAirportRecord)
    .filter((airport: AirportOption) => airport.code.length > 0)
    .slice(0, 10);
}

export async function searchAirports(query: string): Promise<AirportOption[]> {
  const normalizedQuery = query.trim();
  if (!normalizedQuery) return [];

  if (airportCache.has(normalizedQuery)) {
    return airportCache.get(normalizedQuery)!;
  }

  if (airportInflight.has(normalizedQuery)) {
    return airportInflight.get(normalizedQuery)!;
  }

  const promise = fetchAirportMatches(normalizedQuery)
    .then((result) => {
      airportCache.set(normalizedQuery, result);
      airportInflight.delete(normalizedQuery);
      return result;
    })
    .catch((error) => {
      airportInflight.delete(normalizedQuery);
      console.warn('AviationStack airport search error:', error);
      return [];
    });

  airportInflight.set(normalizedQuery, promise);
  return promise;
}

function parseAirportCode(text: string) {
  const matched = text.match(/\(([^)]+)\)/);
  return matched ? normalizeCode(matched[1]) : normalizeCode(text);
}

async function fetchFlightMatches(params: SearchParams): Promise<Flight[]> {
  if (!hasAviationStackKey()) return [];
  const departure = parseAirportCode(params.from);
  const arrival = parseAirportCode(params.to);
  const date = params.departDate.trim();

  if (!departure || !arrival) return [];

  const searchParams = new URLSearchParams({
    access_key: API_KEY!,
    dep_iata: departure,
    arr_iata: arrival,
    limit: '12'
  });

  if (date) {
    searchParams.set('flight_date', date);
  }

  const url = `${BASE_URL}/flights?${searchParams.toString()}`;
  const response = await fetch(url);
  if (!response.ok) {
    throw new Error(`AviationStack flight search failed with ${response.status}`);
  }

  const payload = await response.json();
  if (!payload || !Array.isArray(payload.data)) {
    return [];
  }

  return payload.data.map((record: any, index: number) => {
    const departureInfo = record.departure || {};
    const arrivalInfo = record.arrival || {};
    const airlineInfo = record.airline || {};
    const flightInfo = record.flight || {};
    const airlineName = airlineInfo.name || airlineInfo.iata || airlineInfo.icao || 'AetherFly Partner';
    const flightNumber = flightInfo.iata || flightInfo.number || `${airlineInfo.iata || 'AF'}${100 + index}`;
    const fromName = departureInfo.airport || departureInfo.city || params.from.split('(')[0].trim();
    const toName = arrivalInfo.airport || arrivalInfo.city || params.to.split('(')[0].trim();
    const departTime = formatTime(departureInfo.scheduled || departureInfo.estimated || departureInfo.actual);
    const arriveTime = formatTime(arrivalInfo.scheduled || arrivalInfo.estimated || arrivalInfo.actual);
    const duration = record.flight?.duration || record.flight?.terminal || '—';

    const classMultiplier = params.seatClass === 'First' ? 1.55 : params.seatClass === 'Business' ? 1.25 : 1;
    const basePrice = 180 + index * 40 + (record.stops ? Number(record.stops) * 60 : 0);
    const price = Math.round(Math.max(basePrice, 150) * classMultiplier);

    return {
      id: `${flightNumber}-${index}-${departure}-${arrival}`,
      airline: airlineName,
      flightNo: flightNumber,
      fromCode: departure,
      fromName,
      toCode: arrival,
      toName,
      departTime,
      arriveTime,
      duration: typeof duration === 'string' ? duration : '—',
      price,
      stops: Number(record.stops || 0),
      planeType: record.aircraft?.icao_code || record.flight?.icao || 'A320neo'
    };
  });
}

export async function searchFlights(params: SearchParams): Promise<Flight[]> {
  try {
    return await fetchFlightMatches(params);
  } catch (error) {
    console.warn('AviationStack flight search error:', error);
    return [];
  }
}
