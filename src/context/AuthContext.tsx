import React, { createContext, useCallback, useContext, useEffect, useMemo, useState } from 'react';
import { AuthService } from '../services/authService';
import { DBService } from '../services/dbService';
import { UserProfile } from '../types';

interface AuthContextValue {
  user: UserProfile | null;
  authLoading: boolean;
  authError: string | null;
  signInWithPassword: (email: string, password: string) => Promise<UserProfile>;
  signUpWithPassword: (payload: { fullName: string; email: string; password: string; tier: string }) => Promise<UserProfile>;
  signOut: () => Promise<void>;
  refreshUser: () => Promise<void>;
}

const AuthContext = createContext<AuthContextValue | null>(null);

const LOCAL_STORAGE_KEY = 'aetherfly_user_profile';

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<UserProfile | null>(null);
  const [authLoading, setAuthLoading] = useState(true);
  const [authError, setAuthError] = useState<string | null>(null);

  const loadLocalProfile = useCallback(async () => {
    const cached = window.localStorage.getItem(LOCAL_STORAGE_KEY);
    if (cached) {
      try {
        const parsed = JSON.parse(cached) as UserProfile;
        setUser(parsed);
      } catch {
        window.localStorage.removeItem(LOCAL_STORAGE_KEY);
      }
    }
    setAuthLoading(false);
  }, []);

  const saveLocalProfile = useCallback((profile: UserProfile) => {
    try {
      window.localStorage.setItem(LOCAL_STORAGE_KEY, JSON.stringify(profile));
    } catch (error) {
      console.warn('AuthContext failed to persist profile locally:', error);
    }
  }, []);

  const refreshUser = useCallback(async () => {
    setAuthLoading(true);
    try {
      const activeProfile = await AuthService.getAuthenticatedProfile();
      if (activeProfile) {
        setUser(activeProfile);
        saveLocalProfile(activeProfile);
      } else {
        await loadLocalProfile();
      }
    } catch (error) {
      setAuthError((error as Error)?.message || 'Unable to refresh authentication state.');
      await loadLocalProfile();
    }
    setAuthLoading(false);
  }, [loadLocalProfile, saveLocalProfile]);

  useEffect(() => {
    refreshUser();
  }, [refreshUser]);

  const signInWithPassword = useCallback(
    async (email: string, password: string) => {
      setAuthLoading(true);
      setAuthError(null);
      try {
        const profile = await AuthService.signInWithPassword(email, password);
        setUser(profile);
        saveLocalProfile(profile);
        return profile;
      } catch (error) {
        const message = (error as Error)?.message || 'Invalid credentials. Please try again.';
        setAuthError(message);
        throw new Error(message);
      } finally {
        setAuthLoading(false);
      }
    },
    [saveLocalProfile],
  );

  const signUpWithPassword = useCallback(
    async (payload: { fullName: string; email: string; password: string; tier: string }) => {
      setAuthLoading(true);
      setAuthError(null);
      try {
        const profile = await AuthService.signUpWithPassword(payload);
        setUser(profile);
        saveLocalProfile(profile);
        return profile;
      } catch (error) {
        const message = (error as Error)?.message || 'Registration failed. Please try again.';
        setAuthError(message);
        throw new Error(message);
      } finally {
        setAuthLoading(false);
      }
    },
    [saveLocalProfile],
  );

  const signOut = useCallback(async () => {
    setAuthLoading(true);
    setAuthError(null);
    try {
      await AuthService.signOut();
      setUser(null);
      window.localStorage.removeItem(LOCAL_STORAGE_KEY);
    } catch (error) {
      setAuthError((error as Error)?.message || 'Unable to sign out.');
      throw error;
    } finally {
      setAuthLoading(false);
    }
  }, []);

  const value = useMemo(
    () => ({ user, authLoading, authError, signInWithPassword, signUpWithPassword, signOut, refreshUser }),
    [user, authLoading, authError, signInWithPassword, signUpWithPassword, signOut, refreshUser],
  );

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used inside AuthProvider');
  }
  return context;
}
