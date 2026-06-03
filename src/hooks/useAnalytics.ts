import { useState, useEffect } from 'react';
import { DBService } from '../services/dbService';
import { isSupabaseConfigured, supabase } from '../lib/supabase';

export default function useAnalytics() {
  const [loading, setLoading] = useState(true);
  const [data, setData] = useState<any>({});

  useEffect(() => {
    let mounted = true;
    const load = async () => {
      setLoading(true);
      const analytics = await DBService.fetchAnalytics();
      if (!mounted) return;
      setData(analytics);
      setLoading(false);
    };
    load();

    if (!isSupabaseConfigured()) return () => { mounted = false };

    const chan = supabase.channel('public:activity_logs').on('postgres_changes', { event: '*', schema: 'public', table: 'activity_logs' }, () => {
      // simple reload on activity
      load();
    }).subscribe();

    return () => { mounted = false; try { chan.unsubscribe(); } catch (e) {} };
  }, []);

  return { loading, data };
}
