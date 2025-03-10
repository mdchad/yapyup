import { type AuthError, type Session } from '@supabase/supabase-js';
import { create } from 'zustand';

import { createSelectors } from '../utils';
import { supabase } from '../utils';

// State type definition
type AuthState = {
  session: Session | null;
  email: string;
  status: 'idle' | 'signOut' | 'signIn' | 'awaitingOTP';
};

// Actions type definition
type AuthActions = {
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
};

// Initial state
const initialState: AuthState = {
  status: 'idle',
  session: null,
  email: '',
};

const _useAuth = create<AuthState & AuthActions>()((set, get) => ({
  ...initialState,

  signIn: async (email) => {
    try {
      const { error } = await supabase.auth.signInWithOtp({ email });
      if (error) return { error };

      set(() => ({
        status: 'awaitingOTP',
        email,
      }));

      return { error: null };
    } catch (error) {
      return { error: error as AuthError };
    }
  },

  verifyOTP: async (email, token) => {
    try {
      const { data, error } = await supabase.auth.verifyOtp({
        email: get().email,
        token,
        type: 'email',
      });

      if (error) return { error, session: null };

      set(() => ({
        status: 'signIn',
        session: data.session,
      }));

      return { error: null, session: data.session };
    } catch (error) {
      return { error: error as AuthError, session: null };
    }
  },

  signInApple: async (credential) => {
    const { error, data } = await supabase.auth.signInWithIdToken({
      provider: 'apple',
      token: credential,
    });

    if (data.session) {
      set(() => ({
        status: 'signIn',
        session: data.session,
      }));
    }

    if (error) throw error;
  },

  signOut: async () => {
    await supabase.auth.signOut();
    set(() => ({
      ...initialState,
      status: 'signOut',
    }));
  },

  hydrate: async () => {
    try {
      const {
        data: { session },
      } = await supabase.auth.getSession();

      if (session) {
        set(() => ({
          status: 'signIn',
          session,
        }));
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
