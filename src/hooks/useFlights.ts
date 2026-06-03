import { useEffect, useState } from 'react';
import FlightService from '../services/flightService';
import { Flight, SearchParams } from '../types';

export function useFlights(initialParams?: Partial<SearchParams>) {
  const [flights, setFlights] = useState<Flight[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const load = async (params?: Partial<SearchParams>) => {
    setLoading(true);
    setError(null);
    try {
      const rows = await FlightService.fetchFlights(params ?? initialParams ?? {});
      setFlights(rows);
    } catch (e: any) {
      setError(e?.message || 'Failed to load flights');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { load(initialParams); /* eslint-disable-next-line */ }, []);

  return { flights, loading, error, reload: load, setFlights } as const;
}

export default useFlights;
