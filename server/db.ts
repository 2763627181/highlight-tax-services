// Nota: dotenv se carga en server/index.ts ANTES de importar este módulo
// Si DATABASE_URL no está disponible aquí, verifica que index.ts cargue dotenv correctamente

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
  } catch (error: any) {
    console.error('[DB] Database connection test: FAILED');
    
    // Proporcionar información más detallada sobre el error
    if (error.code === 'XX000' || error.message?.includes('Tenant or user not found')) {
      console.error('[DB] Error: "Tenant or user not found"');
      console.error('[DB] Posibles causas:');
      console.error('[DB]   1. La contraseña en DATABASE_URL es incorrecta');
      console.error('[DB]   2. El proyecto de Supabase está pausado');
      console.error('[DB]   3. La URL de conexión tiene el formato incorrecto');
      console.error('[DB]');
      console.error('[DB] Para conexión directa, usa el formato:');
      console.error('[DB]   postgresql://postgres:[PASSWORD]@aws-0-us-east-1.pooler.supabase.com:5432/postgres');
      console.error('[DB] O verifica en Supabase Dashboard → Settings → Database → Connection string');
    } else {
      console.error('[DB] Error:', error.message || error);
      if (error.code) {
        console.error('[DB] Error code:', error.code);
      }
    }
    
    return false;
  }
}
