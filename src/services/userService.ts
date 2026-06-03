import { DBService } from './dbService';
import { isSupabaseConfigured, supabase, mapProfileRow } from '../lib/supabase';
import { UserProfile } from '../types';

export const UserService = {
  async getProfile(userId: string): Promise<UserProfile | null> {
    return DBService.fetchUserProfile(userId);
  },

  async upsertProfile(profile: Partial<UserProfile>): Promise<UserProfile | null> {
    return DBService.createUserProfile(profile as any);
  },

  subscribeProfile(userId: string, cb: (row: any) => void) {
    if (!isSupabaseConfigured()) return () => {};
    const chan = supabase.channel(`public:user_profiles:user=${userId}`)
      .on('postgres_changes', { event: '*', schema: 'public', table: 'user_profiles', filter: `id=eq.${userId}` }, (payload) => {
        cb(payload.new ?? payload);
      })
      .subscribe();

    return () => { try { chan.unsubscribe(); } catch (e) {} };
  }
};

export default UserService;
