import { useEffect, useState } from 'react';
import { queryAirportSuggestions } from '../services/airportService';
import { AirportOption } from '../types';
import { CITIES } from '../data';

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

const defaultAirportResults = CITIES.map(normalizeCityOption);

export function useAirportSearch(initialQuery = '') {
  const [query, setQuery] = useState(initialQuery);
  const [results, setResults] = useState<AirportOption[]>(defaultAirportResults);
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
      if (!trimmed) {
        setResults(defaultAirportResults);
        setLoading(false);
        setError(null);
        return;
      }

      setLoading(true);
      setError(null);

      try {
        const airports = await queryAirportSuggestions(trimmed);
        if (!active) return;
        setResults(airports.length ? airports : defaultAirportResults.filter((option) =>
          option.label.toLowerCase().includes(trimmed.toLowerCase()) ||
          option.country.toLowerCase().includes(trimmed.toLowerCase())
        ));
      } catch (err) {
        if (!active) return;
        setError('Unable to load airport suggestions.');
        setResults(defaultAirportResults.filter((option) =>
          option.label.toLowerCase().includes(trimmed.toLowerCase()) ||
          option.country.toLowerCase().includes(trimmed.toLowerCase())
        ));
      } finally {
        if (active) {
          setLoading(false);
        }
      }
    };

    if (trimmed) {
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
