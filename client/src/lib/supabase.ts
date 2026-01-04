import { createClient, SupabaseClient } from '@supabase/supabase-js';

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
// Esto previene errores de inicialización cuando Supabase no está configurado
let supabaseInstance: SupabaseClient | null = null;

function getSupabaseClient(): SupabaseClient {
  if (!isSupabaseConfigured) {
    throw new Error('Supabase no está configurado. Por favor, configura VITE_SUPABASE_URL y VITE_SUPABASE_ANON_KEY.');
  }
  
  if (!supabaseInstance) {
    try {
      supabaseInstance = createClient(supabaseUrl, supabaseAnonKey);
    } catch (error) {
      console.error('[Supabase] Error creating client:', error);
      throw new Error('No se pudo inicializar Supabase. Verifica las variables de entorno.');
    }
  }
  
  return supabaseInstance;
}

// Exportar un Proxy que SOLO se ejecuta cuando se accede a una propiedad
// Esto previene la inicialización temprana de Supabase
export const supabase = new Proxy({} as SupabaseClient, {
  get(_target, prop) {
    // Si no está configurado, retornar objetos/funciones que lanzan errores claros
    if (!isSupabaseConfigured) {
      // Para 'auth', retornar un Proxy que lanza error solo cuando se usa
      if (prop === 'auth') {
        return new Proxy({} as any, {
          get(_authTarget, authProp) {
            throw new Error('Supabase no está configurado. OAuth no está disponible. Configura VITE_SUPABASE_URL y VITE_SUPABASE_ANON_KEY.');
          }
        });
      }
      // Para cualquier otra propiedad, retornar función que lanza error
      if (typeof prop === 'string') {
        return () => {
          throw new Error(`Supabase no está configurado. La propiedad '${prop}' no está disponible.`);
        };
      }
      return undefined;
    }
    
    // Si está configurado, obtener el cliente y retornar la propiedad
    try {
      const client = getSupabaseClient();
      const value = (client as any)[prop];
      if (typeof value === 'function') {
        return value.bind(client);
      }
      return value;
    } catch (error) {
      // Si hay error, retornar función que lanza el error
      const errorMessage = error instanceof Error ? error.message : String(error);
      return () => {
        throw new Error(`Error accediendo a Supabase: ${errorMessage}`);
      };
    }
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
