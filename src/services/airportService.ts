import { AirportOption } from '../types';
import { CITIES } from '../data';
import { searchAirports, hasAviationStackKey } from './aviationService';

function normalizeCityOption(city: { name: string; code: string; country: string }): AirportOption {
  return {
    id: `${city.code}-${city.name}`,
    label: `${city.name} (${city.code})`,
    name: city.name,
    code: city.code,
    city: city.name,
    country: city.country,
    region: city.country,
    airportName: city.name
  };
}

export async function queryAirportSuggestions(query: string): Promise<AirportOption[]> {
  const trimmed = query.trim();
  const localFallback = CITIES.map(normalizeCityOption);

  if (!trimmed) {
    return localFallback;
  }

  if (!hasAviationStackKey()) {
    return localFallback.filter((option) =>
      option.label.toLowerCase().includes(trimmed.toLowerCase()) ||
      option.country.toLowerCase().includes(trimmed.toLowerCase())
    );
  }

  const apiResults = await searchAirports(trimmed);
  if (apiResults.length > 0) {
    return apiResults;
  }

  return localFallback.filter((option) =>
    option.label.toLowerCase().includes(trimmed.toLowerCase()) ||
    option.country.toLowerCase().includes(trimmed.toLowerCase())
  );
}

export default {
  queryAirportSuggestions
};
