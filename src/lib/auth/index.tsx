import { type AuthError, type Session } from '@supabase/supabase-js';
import { create } from 'zustand';

import { createSelectors } from '../utils';
import { supabase } from '../utils';

interface AuthState {
  session: Session | null;
  email: string;
  status: 'idle' | 'signOut' | 'signIn' | 'awaitingOTP';
  signIn: (email: string) => Promise<{ error: AuthError | null }>;
  verifyOTP: (
    email: string,
    token: string
  ) => Promise<{
    error: AuthError | null;
    session: Session | null;
  }>;
  signInApple: (credential: string) => Promise<void>;
  signOut: () => Promise<void>;
  hydrate: () => Promise<void>;
}

const authMethods = {
  signIn: async (email: string, set: (state: Partial<AuthState>) => void) => {
    try {
      const { error } = await supabase.auth.signInWithOtp({ email });
      if (error) return { error };
      set({ status: 'awaitingOTP', email });
      return { error: null };
    } catch (error) {
      return { error: error as AuthError };
    }
  },

  verifyOTP: async (
    token: string,
    set: (state: Partial<AuthState>) => void
  ) => {
    const email = _useAuth.getState().email;

    try {
      const { data, error } = await supabase.auth.verifyOtp({
        email,
        token,
        type: 'email',
      });
      if (error) return { error, session: null };
      set({ status: 'signIn', session: data.session });
      return { error: null, session: data.session };
    } catch (error) {
      return { error: error as AuthError, session: null };
    }
  },

  signInApple: async (
    credential: string,
    set: (state: Partial<AuthState>) => void
  ) => {
    const { error, data } = await supabase.auth.signInWithIdToken({
      provider: 'apple',
      token: credential,
    });
    if (data.session) {
      set({ status: 'signIn', session: data.session });
    }
    if (error) throw error;
  },
};

const _useAuth = create<AuthState>((set, get) => ({
  status: 'idle',
  session: null,
  email: '',
  signIn: (email) => authMethods.signIn(email, set),
  verifyOTP: (email, token) => authMethods.verifyOTP(token, set),
  signInApple: (credential) => authMethods.signInApple(credential, set),
  signOut: async () => {
    await supabase.auth.signOut();
    set({ status: 'signOut', session: null });
  },
  hydrate: async () => {
    try {
      const {
        data: { session },
      } = await supabase.auth.getSession();
      if (session) {
        set({ status: 'signIn', session });
      } else {
        get().signOut();
      }
    } catch (e) {
      get().signOut();
    }
  },
}));

export const useAuth = createSelectors(_useAuth);

// Export actions that can be used without hooks
export const signOut = () => _useAuth.getState().signOut();
export const signIn = (email: string) => _useAuth.getState().signIn(email);
export const verifyOTP = (email: string, token: string) =>
  _useAuth.getState().verifyOTP(email, token);
export const signInApple = (credential: string) =>
  _useAuth.getState().signInApple(credential);
export const hydrateAuth = () => _useAuth.getState().hydrate();
