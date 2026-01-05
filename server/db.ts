// Cargar variables de entorno desde .env antes de cualquier otra cosa
// Solo cargar dotenv en desarrollo (Vercel inyecta variables automáticamente)
if (process.env.NODE_ENV !== 'production' && !process.env.VERCEL) {
  import("dotenv").then(({ config }) => config());
}

import { drizzle } from "drizzle-orm/node-postgres";
import { sql } from "drizzle-orm";
import pg from "pg";
import * as schema from "../shared/schema";

const { Pool } = pg;

if (!process.env.DATABASE_URL) {
  throw new Error(
    "DATABASE_URL must be set. Did you forget to provision a database?",
  );
}

/**
 * Database connection pool configuration
 * SSL is enabled for external databases like Supabase
 * rejectUnauthorized is set to false to allow self-signed certificates
 */
const poolConfig: pg.PoolConfig = {
  connectionString: process.env.DATABASE_URL,
};

// Enable SSL for production/external databases (Supabase, Neon, etc.)
if (process.env.NODE_ENV === 'production' || process.env.DATABASE_URL?.includes('supabase')) {
  poolConfig.ssl = {
    rejectUnauthorized: false
  };
}

export const pool = new Pool(poolConfig);

// Agregar logging para conexiones de base de datos
pool.on('connect', () => {
  console.log('[DB] New database connection established');
});

pool.on('error', (err) => {
  console.error('[DB] Database pool error:', err);
});

pool.on('acquire', () => {
  console.log('[DB] Connection acquired from pool');
});

pool.on('release', () => {
  console.log('[DB] Connection released back to pool');
});

export const db = drizzle(pool, { schema });

// Función para verificar conexión a la base de datos
export async function testConnection() {
  try {
    await db.execute(sql`SELECT 1`);
    console.log('[DB] Database connection test: OK');
    return true;
  } catch (error) {
    console.error('[DB] Database connection test: FAILED', error);
    return false;
  }
}
