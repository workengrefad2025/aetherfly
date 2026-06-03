import { useEffect, useState } from 'react';
import OfferService from '../services/offerService';
import { Offer } from '../types';

export function useOffers() {
  const [offers, setOffers] = useState<Offer[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const load = async () => {
    setLoading(true);
    setError(null);
    try {
      const rows = await OfferService.fetchOffers();
      setOffers(rows);
    } catch (e: any) {
      setError(e?.message || 'Failed to load offers');
    } finally { setLoading(false); }
  };

  useEffect(() => { load(); /* eslint-disable-next-line */ }, []);

  return { offers, loading, error, reload: load } as const;
}

export default useOffers;
