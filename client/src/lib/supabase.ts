// IMPORTACIÓN DINÁMICA: Solo importar Supabase cuando realmente se necesite
// Esto previene que @supabase/supabase-js se cargue si no está configurado
// y evita el error "clientId must be a non-empty string"

// NO inicializar nada al importar el módulo
// Solo leer las variables de entorno, pero NO crear el cliente todavía
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
// Usar importación dinámica para evitar cargar @supabase/supabase-js si no está configurado
let supabaseInstance: any = null;
let SupabaseClientType: any = null;

async function getSupabaseClient(): Promise<any> {
  if (!isSupabaseConfigured) {
    throw new Error('Supabase no está configurado. Por favor, configura VITE_SUPABASE_URL y VITE_SUPABASE_ANON_KEY.');
  }
  
  if (!supabaseInstance) {
    try {
      // Importación dinámica: solo cargar cuando realmente se necesite
      const { createClient } = await import('@supabase/supabase-js');
      supabaseInstance = createClient(supabaseUrl, supabaseAnonKey);
    } catch (error) {
      console.error('[Supabase] Error creating client:', error);
      throw new Error('No se pudo inicializar Supabase. Verifica las variables de entorno.');
    }
  }
  
  return supabaseInstance;
}

// NO exportar supabase directamente - usar solo las funciones exportadas
// Esto previene que se intente acceder a supabase antes de que esté configurado
// Si necesitas acceder a supabase directamente, usa getSupabaseClient() (pero es async)

export type OAuthProvider = 'google' | 'github' | 'apple';

export async function signInWithOAuth(provider: OAuthProvider) {
  if (!isSupabaseConfigured) {
    throw new Error('OAuth no está configurado. Por favor, contacta al administrador o usa el registro con email y contraseña.');
  }
  
  const client = await getSupabaseClient();
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
  const client = await getSupabaseClient();
  const { error } = await client.auth.signOut();
  if (error) {
    throw error;
  }
}

export async function getSession() {
  if (!isSupabaseConfigured) {
    return null; // Retornar null si Supabase no está configurado
  }
  const client = await getSupabaseClient();
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
  const client = await getSupabaseClient();
  const { data: { user }, error } = await client.auth.getUser();
  if (error) {
    throw error;
  }
  return user;
}
