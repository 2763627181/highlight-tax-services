/**
 * @fileoverview Sistema de Caching Simple para Queries Frecuentes
 * 
 * Implementa un cache en memoria para queries que se repiten frecuentemente
 * y no cambian mucho, mejorando significativamente la velocidad de respuesta.
 * 
 * Estrategia: Cache con TTL (Time To Live) para invalidación automática
 */

interface CacheEntry<T> {
  data: T;
  expiresAt: number;
}

class SimpleCache {
  private cache = new Map<string, CacheEntry<any>>();
  private defaultTTL = 5 * 60 * 1000; // 5 minutos por defecto

  /**
   * Obtiene un valor del cache si existe y no ha expirado
   */
  get<T>(key: string): T | null {
    const entry = this.cache.get(key);
    
    if (!entry) {
      return null;
    }

    // Verificar si expiró
    if (Date.now() > entry.expiresAt) {
      this.cache.delete(key);
      return null;
    }

    return entry.data as T;
  }

  /**
   * Guarda un valor en el cache con TTL
   */
  set<T>(key: string, value: T, ttlMs?: number): void {
    const ttl = ttlMs || this.defaultTTL;
    this.cache.set(key, {
      data: value,
      expiresAt: Date.now() + ttl,
    });
  }

  /**
   * Invalida una entrada del cache
   */
  invalidate(key: string): void {
    this.cache.delete(key);
  }

  /**
   * Invalida todas las entradas que empiezan con un prefijo
   * Útil para invalidar grupos de cache relacionados
   */
  invalidatePattern(pattern: string): void {
    for (const key of this.cache.keys()) {
      if (key.startsWith(pattern)) {
        this.cache.delete(key);
      }
    }
  }

  /**
   * Limpia todo el cache
   */
  clear(): void {
    this.cache.clear();
  }

  /**
   * Limpia entradas expiradas (garbage collection)
   */
  cleanup(): void {
    const now = Date.now();
    for (const [key, entry] of this.cache.entries()) {
      if (now > entry.expiresAt) {
        this.cache.delete(key);
      }
    }
  }
}

// Instancia singleton del cache
export const cache = new SimpleCache();

// Limpiar cache expirado cada 5 minutos
if (typeof setInterval !== 'undefined') {
  setInterval(() => {
    cache.cleanup();
  }, 5 * 60 * 1000);
}

/**
 * Decorador para cachear resultados de funciones async
 * 
 * @example
 * const getUser = cacheAsync(
 *   async (id: number) => await storage.getUser(id),
 *   (id) => `user:${id}`,
 *   60000 // Cache por 1 minuto
 * );
 */
export function cacheAsync<TArgs extends any[], TReturn>(
  fn: (...args: TArgs) => Promise<TReturn>,
  keyGenerator: (...args: TArgs) => string,
  ttlMs?: number
): (...args: TArgs) => Promise<TReturn> {
  return async (...args: TArgs): Promise<TReturn> => {
    const key = keyGenerator(...args);
    
    // Intentar obtener del cache
    const cached = cache.get<TReturn>(key);
    if (cached !== null) {
      return cached;
    }

    // Ejecutar función y cachear resultado
    const result = await fn(...args);
    cache.set(key, result, ttlMs);
    
    return result;
  };
}

/**
 * Keys de cache comunes
 */
export const CacheKeys = {
  user: (id: number) => `user:${id}`,
  userByEmail: (email: string) => `user:email:${email.toLowerCase()}`,
  userClients: () => `users:clients`,
  userClientsWithDetails: () => `users:clients:details`,
  taxCases: (clientId: number) => `tax_cases:client:${clientId}`,
  taxCase: (id: number) => `tax_case:${id}`,
  documents: (clientId: number) => `documents:client:${clientId}`,
  appointments: (clientId: number) => `appointments:client:${clientId}`,
  unreadMessages: (userId: number) => `messages:unread:${userId}`,
  conversations: (userId: number) => `conversations:${userId}`,
  adminStats: () => `admin:stats`,
  analytics: () => `admin:analytics`,
} as const;


