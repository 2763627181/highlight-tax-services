import { drizzle } from "drizzle-orm/node-postgres";
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
export const db = drizzle(pool, { schema });
