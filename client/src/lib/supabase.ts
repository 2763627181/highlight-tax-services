import { createClient, SupabaseClient } from '@supabase/supabase-js';

const supabaseUrl = import.meta.env.VITE_SUPABASE_URL || '';
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY || '';

// Validar que las variables de entorno estén configuradas
// Esto previene errores de "clientId must be a non-empty string" cuando Supabase no está configurado
const isSupabaseConfigured = supabaseUrl && supabaseAnonKey && 
                             supabaseUrl.length > 0 && supabaseAnonKey.length > 0 &&
                             supabaseUrl !== 'https://placeholder.supabase.co' &&
                             supabaseAnonKey !== 'placeholder-key';

if (!isSupabaseConfigured) {
  console.warn('Supabase URL or Anon Key not configured. OAuth login will not work.');
  console.warn('To enable OAuth, set VITE_SUPABASE_URL and VITE_SUPABASE_ANON_KEY in your environment variables.');
}

// Lazy initialization: solo crear el cliente cuando sea necesario y esté configurado
// Esto previene errores de inicialización cuando Supabase no está configurado
let supabaseInstance: SupabaseClient | null = null;

function getSupabaseClient(): SupabaseClient {
  if (!isSupabaseConfigured) {
    throw new Error('Supabase no está configurado. Por favor, configura VITE_SUPABASE_URL y VITE_SUPABASE_ANON_KEY.');
  }
  
  if (!supabaseInstance) {
    supabaseInstance = createClient(supabaseUrl, supabaseAnonKey);
  }
  
  return supabaseInstance;
}

// Exportar una función que retorna el cliente solo si está configurado
export const supabase = new Proxy({} as SupabaseClient, {
  get(_target, prop) {
    const client = getSupabaseClient();
    const value = (client as any)[prop];
    return typeof value === 'function' ? value.bind(client) : value;
  }
});

export type OAuthProvider = 'google' | 'github' | 'apple';

export async function signInWithOAuth(provider: OAuthProvider) {
  if (!isSupabaseConfigured) {
    throw new Error('OAuth no está configurado. Por favor, contacta al administrador o usa el registro con email y contraseña.');
  }
  
  const client = getSupabaseClient();
  const redirectUrl = `${window.location.origin}/auth/callback`;
  
  const { data, error } = await client.auth.signInWithOAuth({
    provider,
    options: {
      redirectTo: redirectUrl,
    },
  });

  if (error) {
    throw error;
  }

  return data;
}

export async function signOut() {
  if (!isSupabaseConfigured) {
    return; // No hacer nada si Supabase no está configurado
  }
  const client = getSupabaseClient();
  const { error } = await client.auth.signOut();
  if (error) {
    throw error;
  }
}

export async function getSession() {
  if (!isSupabaseConfigured) {
    return null; // Retornar null si Supabase no está configurado
  }
  const client = getSupabaseClient();
  const { data: { session }, error } = await client.auth.getSession();
  if (error) {
    throw error;
  }
  return session;
}

export async function getUser() {
  if (!isSupabaseConfigured) {
    return null; // Retornar null si Supabase no está configurado
  }
  const client = getSupabaseClient();
  const { data: { user }, error } = await client.auth.getUser();
  if (error) {
    throw error;
  }
  return user;
}
