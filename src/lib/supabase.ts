import { createClient, SupabaseClient } from '@supabase/supabase-js';

const getInitialConfig = () => {
  const envUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || '';
  const envKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || '';

  if (typeof window !== 'undefined') {
    const storedUrl = localStorage.getItem('my_work_os_supabase_url');
    const storedKey = localStorage.getItem('my_work_os_supabase_key');
    if (storedUrl && storedKey) {
      return { url: storedUrl, key: storedKey };
    }
  }

  return { url: envUrl, key: envKey };
};

const initial = getInitialConfig();

let clientInstance: SupabaseClient | null =
  initial.url && initial.key && !initial.url.includes('your-supabase')
    ? createClient(initial.url, initial.key)
    : null;

export const getSupabase = (): SupabaseClient | null => {
  if (clientInstance) return clientInstance;
  if (typeof window !== 'undefined') {
    const storedUrl = localStorage.getItem('my_work_os_supabase_url') || process.env.NEXT_PUBLIC_SUPABASE_URL || '';
    const storedKey = localStorage.getItem('my_work_os_supabase_key') || process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || '';
    if (storedUrl && storedKey && !storedUrl.includes('your-supabase')) {
      clientInstance = createClient(storedUrl, storedKey);
      return clientInstance;
    }
  }
  return null;
};

export const setSupabaseCredentials = (url: string, key: string): boolean => {
  try {
    const trimmedUrl = url.trim();
    const trimmedKey = key.trim();
    if (!trimmedUrl || !trimmedKey) {
      localStorage.removeItem('my_work_os_supabase_url');
      localStorage.removeItem('my_work_os_supabase_key');
      clientInstance = null;
      return false;
    }
    const testClient = createClient(trimmedUrl, trimmedKey);
    clientInstance = testClient;
    localStorage.setItem('my_work_os_supabase_url', trimmedUrl);
    localStorage.setItem('my_work_os_supabase_key', trimmedKey);
    return true;
  } catch (e) {
    console.error('Failed to initialize Supabase client:', e);
    return false;
  }
};

export const clearSupabaseCredentials = () => {
  if (typeof window !== 'undefined') {
    localStorage.removeItem('my_work_os_supabase_url');
    localStorage.removeItem('my_work_os_supabase_key');
  }
  clientInstance = null;
};

export const isSupabaseConfigured = (): boolean => {
  return getSupabase() !== null;
};

export const supabase = clientInstance;
