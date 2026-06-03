import { DBService } from './dbService';
import { isSupabaseConfigured, supabase } from '../lib/supabase';
import { Offer } from '../types';

export const OfferService = {
  async fetchOffers(): Promise<Offer[]> {
    return DBService.fetchOffers();
  },

  subscribeOffers(cb: (payload: any) => void) {
    if (!isSupabaseConfigured()) return () => {};
    const chan = supabase.channel('public:offers')
      .on('postgres_changes', { event: '*', schema: 'public', table: 'offers' }, (payload: any) => cb(payload))
      .subscribe();

    return () => { try { chan.unsubscribe(); } catch (e) {} };
  }
};

export default OfferService;
