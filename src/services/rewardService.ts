import { DBService } from './dbService';
import { isSupabaseConfigured, supabase } from '../lib/supabase';
import { LoyaltyReward } from '../types';

export const RewardService = {
  async fetchRewards(userId: string): Promise<LoyaltyReward[]> {
    return DBService.fetchLoyaltyRewards(userId);
  },

  subscribeRewards(userId: string, cb: (payload: any) => void) {
    if (!isSupabaseConfigured()) return () => {};
    const chan = supabase.channel(`public:loyalty_rewards:user=${userId}`)
      .on('postgres_changes', { event: '*', schema: 'public', table: 'loyalty_rewards', filter: `user_id=eq.${userId}` }, (payload: any) => cb(payload))
      .subscribe();

    return () => { try { chan.unsubscribe(); } catch (e) {} };
  }
};

export default RewardService;
