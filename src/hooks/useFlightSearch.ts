import { useCallback, useState } from 'react';
import { Flight, SearchParams } from '../types';
import { FlightService } from '../services/flightService';
import { hasAviationStackKey, searchFlights as aviationSearchFlights } from '../services/aviationService';
import { generateMockFlights } from '../data';

export function useFlightSearch() {
  const [flights, setFlights] = useState<Flight[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const search = useCallback(async (params: SearchParams): Promise<Flight[]> => {
    setLoading(true);
    setError(null);

    try {
      let results: Flight[] = [];

      if (hasAviationStackKey()) {
        results = await aviationSearchFlights(params);
      }

      if (!results.length && FlightService) {
        results = await FlightService.fetchFlights(params);
      }

      if (!results.length) {
        results = generateMockFlights(params.from, params.to, params.departDate);
      }

      setFlights(results);
      return results;
    } catch (err) {
      console.warn('Flight search failed:', err);
      const fallback = generateMockFlights(params.from, params.to, params.departDate);
      setFlights(fallback);
      setError('Unable to load live flight data right now. Showing curated availability.');
      return fallback;
    } finally {
      setLoading(false);
    }
  }, []);

  return { flights, loading, error, search };
}
