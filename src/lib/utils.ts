import { createClient, type SupportedStorage } from '@supabase/supabase-js';
import { MMKV } from 'react-native-mmkv';
import type { StoreApi, UseBoundStore } from 'zustand';
import Constants from 'expo-constants';

// Initialize MMKV
const storage = new MMKV({ id: 'supabase-storage' });

type WithSelectors<S> = S extends { getState: () => infer T }
  ? S & { use: { [K in keyof T]: () => T[K] } }
  : never;

export const createSelectors = <S extends UseBoundStore<StoreApi<object>>>(
  _store: S
) => {
  let store = _store as WithSelectors<typeof _store>;
  store.use = {};
  for (let k of Object.keys(store.getState())) {
    (store.use as any)[k] = () => store((s) => s[k as keyof typeof s]);
  }

  return store;
};

// Create custom storage adapter for Supabase using MMKV
const mmkvSupabaseSupportedStorage = {
  setItem: (key, data) => storage.set(key, data),
  getItem: (key) => storage.getString(key) ?? null,
  removeItem: (key) => storage.delete(key),
} satisfies SupportedStorage;

const supabaseUrl = process.env.EXPO_PUBLIC_SUPABASE_URL!;
const supabaseAnonKey = process.env.EXPO_PUBLIC_SUPABASE_ANON_KEY!;

export const supabase = createClient(supabaseUrl, supabaseAnonKey, {
  auth: {
    storage: mmkvSupabaseSupportedStorage,
    autoRefreshToken: true,
    persistSession: true,
    detectSessionInUrl: false,
  },
});

export const generateAPIUrl = (relativePath: string) => {
  const path = relativePath.startsWith('/') ? relativePath : `/${relativePath}`;

  if (process.env.NODE_ENV === 'development') {
    // Extract the IP/hostname part but use the Cloudflare Worker port
    const hostPart = Constants.expoConfig?.hostUri
      ?.split(':')[0];
    let a = `http://${hostPart}:8787${path}`;
    console.log(a)
    return a
  }

  if (!process.env.EXPO_PUBLIC_API_BASE_URL) {
    throw new Error(
      'EXPO_PUBLIC_API_BASE_URL environment variable is not defined',
    );
  }
  return process.env.EXPO_PUBLIC_API_BASE_URL.concat(path);
};
