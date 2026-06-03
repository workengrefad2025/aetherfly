import { useEffect, useState } from 'react';
import { AirportOption } from '../types';
import { searchAirportDatabase } from '../services/airportDatabaseService';

export function useAirportAutocomplete(initialQuery = '') {
  const [query, setQuery] = useState(initialQuery);
  const [results, setResults] = useState<AirportOption[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    setQuery(initialQuery);
  }, [initialQuery]);

  useEffect(() => {
    const trimmed = query.trim();
    let active = true;
    let debounceHandle: number | undefined;

    const updateResults = async () => {
      setLoading(true);
      setError(null);

      try {
        const airports = await searchAirportDatabase(trimmed);
        if (!active) return;
        setResults(airports);
      } catch (err) {
        if (!active) return;
        console.warn('Airport autocomplete failed:', err);
        setResults([]);
        setError('Unable to load airport suggestions.');
      } finally {
        if (active) setLoading(false);
      }
    };

    if (trimmed.length > 0) {
      debounceHandle = window.setTimeout(updateResults, 250);
    } else {
      updateResults();
    }

    return () => {
      active = false;
      if (debounceHandle) {
        window.clearTimeout(debounceHandle);
      }
    };
  }, [query]);

  return { query, setQuery, results, loading, error };
}
