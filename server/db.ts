import { drizzle } from "drizzle-orm/node-postgres";
import pg from "pg";
import * as schema from "../shared/schema";

const { Pool } = pg;

/**
 * Obtiene la configuración del pool de conexiones
 * No lanza error si DATABASE_URL no está disponible (se validará al usar)
 */
function getPoolConfig(): pg.PoolConfig | null {
  const databaseUrl = process.env.DATABASE_URL;
  
  if (!databaseUrl) {
    console.warn('[DB] DATABASE_URL no está configurada. La conexión fallará al intentar usarse.');
    return null;
  }

  const poolConfig: pg.PoolConfig = {
    connectionString: databaseUrl,
    // Optimizaciones para serverless (Vercel)
    max: 1, // Máximo 1 conexión en serverless (no necesitamos pool grande)
    idleTimeoutMillis: 30000, // Cerrar conexiones inactivas después de 30s
    connectionTimeoutMillis: 10000, // Timeout de conexión de 10s
  };

  // Enable SSL for production/external databases (Supabase, Neon, etc.)
  if (process.env.NODE_ENV === 'production' || databaseUrl.includes('supabase')) {
    poolConfig.ssl = {
      rejectUnauthorized: false
    };
  }

  return poolConfig;
}

/**
 * Crea el pool de conexiones
 * Si DATABASE_URL no está disponible, crea un pool que fallará al intentar conectarse
 */
const poolConfig = getPoolConfig();
export const pool = poolConfig ? new Pool(poolConfig) : new Pool({ connectionString: 'invalid' });
export const db = drizzle(pool, { schema });

/**
 * Valida que la conexión a la base de datos esté disponible
 * Lanza un error descriptivo si no está configurada
 */
export async function validateDatabaseConnection(): Promise<void> {
  if (!process.env.DATABASE_URL) {
    throw new Error(
      "DATABASE_URL must be set. Did you forget to provision a database? " +
      "Please configure DATABASE_URL in your environment variables."
    );
  }

  try {
    await pool.query('SELECT 1');
  } catch (error) {
    const errorMessage = error instanceof Error ? error.message : String(error);
    throw new Error(
      `Failed to connect to database: ${errorMessage}. ` +
      `Please verify that DATABASE_URL is correct and the database is accessible.`
    );
  }
}
