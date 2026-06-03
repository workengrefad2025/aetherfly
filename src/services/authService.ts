import { supabase, isSupabaseConfigured, getSession, buildAuthProfile } from '../lib/supabase';
import { UserProfile } from '../types';
import { DBService } from './dbService';

export const AuthService = {
  async getAuthenticatedProfile(): Promise<UserProfile | null> {
    if (!isSupabaseConfigured()) return null;
    const session = await getSession();
    const user = session?.user;
    if (!user) return null;
    const profile = await DBService.fetchUserProfile(user.id);
    if (profile) return profile;
    return buildAuthProfile(user, { email: user.email ?? '' });
  },

  async signInWithPassword(email: string, password: string): Promise<UserProfile> {
    if (!isSupabaseConfigured()) {
      throw new Error('Supabase authentication is not configured for this environment.');
    }
    const { data, error } = await supabase.auth.signInWithPassword({ email, password });
    if (error || !data.session || !data.user) {
      throw new Error(error?.message || 'Unable to sign in with those credentials.');
    }
    const profile = await DBService.fetchUserProfile(data.user.id);
    if (profile) return profile;
    return buildAuthProfile(data.user, { email });
  },

  async signUpWithPassword(payload: { fullName: string; email: string; password: string; tier: string }): Promise<UserProfile> {
    if (!isSupabaseConfigured()) {
      throw new Error('Supabase authentication is not configured for this environment.');
    }
    const { data, error } = await supabase.auth.signUp({
      email: payload.email,
      password: payload.password,
      options: {
        data: {
          full_name: payload.fullName,
          tier: payload.tier
        }
      }
    });

    if (error || !data.user) {
      throw new Error(error?.message || 'Unable to create a new account.');
    }

    const profile = await DBService.createUserProfile({
      id: data.user.id,
      fullName: payload.fullName,
      email: payload.email,
      tier: payload.tier as UserProfile['tier'],
      credits: 2500
    });

    if (profile) return profile;
    return buildAuthProfile(data.user, { fullName: payload.fullName, email: payload.email, tier: payload.tier as UserProfile['tier'] });
  },

  async signOut(): Promise<void> {
    if (!isSupabaseConfigured()) return;
    const { error } = await supabase.auth.signOut();
    if (error) {
      throw new Error(error.message || 'Unable to sign out.');
    }
  }
};
