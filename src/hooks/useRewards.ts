import { useEffect, useState } from 'react';
import RewardService from '../services/rewardService';
import { LoyaltyReward } from '../types';

export function useRewards(userId?: string) {
  const [rewards, setRewards] = useState<LoyaltyReward[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const load = async () => {
    if (!userId) return;
    setLoading(true);
    setError(null);
    try {
      const rows = await RewardService.fetchRewards(userId);
      setRewards(rows);
    } catch (e: any) {
      setError(e?.message || 'Failed to load rewards');
    } finally { setLoading(false); }
  };

  useEffect(() => { if (userId) load(); /* eslint-disable-next-line */ }, [userId]);

  return { rewards, loading, error, reload: load } as const;
}

export default useRewards;
