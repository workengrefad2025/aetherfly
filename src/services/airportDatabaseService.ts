import { supabase, isSupabaseConfigured } from '../lib/supabase';
import { searchAirports as searchAviationStackAirports, hasAviationStackKey } from './aviationService';
import { AirportOption } from '../types';
import { CITIES } from '../data';

const airportCache = new Map<string, AirportOption[]>();
const airportInflight = new Map<string, Promise<AirportOption[]>>();

function normalizeCityOption(city: { name: string; code: string; country: string }): AirportOption {
  return {
    id: `${city.code}-${city.name}`,
    label: `${city.name} (${city.code})`,
    name: city.name,
    code: city.code,
    city: city.name,
    country: city.country,
    countryCode: '',
    latitude: undefined,
    longitude: undefined,
    airportName: city.name,
    region: city.country
  };
}

function mapAirportRow(row: any): AirportOption {
  return {
    id: row.id,
    label: `${row.airport_name} (${row.iata_code})`,
    name: row.city,
    code: row.iata_code,
    city: row.city,
    country: row.country,
    countryCode: row.country_code,
    latitude: Number(row.latitude ?? 0) || undefined,
    longitude: Number(row.longitude ?? 0) || undefined,
    airportName: row.airport_name,
    region: row.country
  };
}

const defaultAirportResults = CITIES.map(normalizeCityOption);

function buildQueryPattern(value: string) {
  const trimmed = value.trim();
  if (!trimmed) return '';
  return `%${trimmed.replace(/\s+/g, '%')}%`;
}

async function querySupabaseAirports(query: string): Promise<AirportOption[]> {
  if (!isSupabaseConfigured()) {
    return [];
  }

  const trimmed = query.trim();
  if (!trimmed) return [];

  const q = buildQueryPattern(trimmed);
  const orClauses = [
    `iata_code.ilike.${q}`,
    `airport_name.ilike.${q}`,
    `city.ilike.${q}`,
    `country.ilike.${q}`,
    `country_code.ilike.${q}`
  ].join(',');

  const { data, error } = await supabase
    .from('airports')
    .select('id,iata_code,airport_name,city,country,country_code,latitude,longitude')
    .or(orClauses)
    .limit(12);

  if (error || !data) {
    console.warn('Airport database search failed:', error?.message);
    return [];
  }

  return data.map(mapAirportRow);
}

export async function searchAirportDatabase(query: string): Promise<AirportOption[]> {
  const normalized = query.trim().toLowerCase();
  if (!normalized) return defaultAirportResults;

  if (airportCache.has(normalized)) {
    return airportCache.get(normalized)!;
  }

  if (airportInflight.has(normalized)) {
    return airportInflight.get(normalized)!;
  }

  const promise = (async () => {
    const airportResults = await querySupabaseAirports(normalized);
    if (airportResults.length > 0) {
      airportCache.set(normalized, airportResults);
      return airportResults;
    }

    if (hasAviationStackKey()) {
      const fallback = await searchAviationStackAirports(normalized);
      airportCache.set(normalized, fallback.length ? fallback : defaultAirportResults);
      return fallback.length ? fallback : defaultAirportResults;
    }

    const fallback = defaultAirportResults.filter((option) =>
      option.label.toLowerCase().includes(normalized.toLowerCase()) ||
      option.country.toLowerCase().includes(normalized.toLowerCase())
    );
    airportCache.set(normalized, fallback);
    return fallback;
  })();

  airportInflight.set(normalized, promise);
  promise.finally(() => airportInflight.delete(normalized));
  return promise;
}

export async function findAirportByIata(code: string): Promise<AirportOption | null> {
  if (!isSupabaseConfigured()) return null;
  const normalized = code.trim().toUpperCase();
  if (!normalized) return null;

  const { data, error } = await supabase
    .from('airports')
    .select('id,iata_code,airport_name,city,country,country_code,latitude,longitude')
    .eq('iata_code', normalized)
    .single();

  if (error || !data) {
    return null;
  }
  return mapAirportRow(data);
}

export async function seedAirportDatabase(): Promise<number> {
  if (!isSupabaseConfigured()) return 0;
  const airportPayload = defaultAirportResults.map((airport) => ({
    id: airport.id,
    iata_code: airport.code,
    airport_name: airport.airportName,
    city: airport.city,
    country: airport.country,
    country_code: airport.countryCode ?? '',
    latitude: airport.latitude ?? 0,
    longitude: airport.longitude ?? 0
  }));

  const { data, error } = await supabase
    .from('airports')
    .upsert(airportPayload, { onConflict: 'id' })
    .select('id');

  if (error || !data) {
    console.warn('Failed to seed airport database:', error?.message);
    return 0;
  }

  return data.length;
}
