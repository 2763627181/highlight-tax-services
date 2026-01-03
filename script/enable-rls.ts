/**
 * Script para habilitar RLS y aplicar políticas de seguridad en Supabase
 * 
 * Este script lee el archivo enable-rls-policies.sql y lo ejecuta directamente
 * en la base de datos usando la conexión de Supabase.
 * 
 * Uso:
 *   DATABASE_URL="tu-connection-string" tsx script/enable-rls.ts
 * 
 * O configura DATABASE_URL en .env
 */

import { readFileSync } from 'fs';
import { resolve } from 'path';
import pg from 'pg';

const { Pool } = pg;

// Intentar cargar .env manualmente si existe
try {
  const envPath = resolve(process.cwd(), '.env');
  const envFile = readFileSync(envPath, 'utf-8');
  envFile.split('\n').forEach(line => {
    const trimmed = line.trim();
    if (trimmed && !trimmed.startsWith('#')) {
      const [key, ...values] = trimmed.split('=');
      if (key && values.length > 0) {
        const value = values.join('=').replace(/^["']|["']$/g, '');
        if (!process.env[key]) {
          process.env[key] = value;
        }
      }
    }
  });
} catch (error) {
  // .env no existe o no se puede leer, usar variables de entorno del sistema
}

async function enableRLS() {
  try {
    // Verificar DATABASE_URL
    const databaseUrl = process.env.DATABASE_URL;
    if (!databaseUrl) {
      console.error('❌ Error: DATABASE_URL no está configurada');
      console.error('');
      console.error('Por favor, configura DATABASE_URL:');
      console.error('  1. Crea un archivo .env en la raíz del proyecto');
      console.error('  2. Agrega: DATABASE_URL="tu-connection-string-de-supabase"');
      console.error('');
      console.error('O ejecuta:');
      console.error('  DATABASE_URL="tu-url" tsx script/enable-rls.ts');
      process.exit(1);
    }

    console.log('🔌 Conectando a Supabase...');
    console.log(`   Base de datos: ${databaseUrl.replace(/:[^:@]+@/, ':****@')}`);
    console.log('');

    // Crear pool de conexiones
    const pool = new Pool({
      connectionString: databaseUrl,
      ssl: databaseUrl.includes('supabase') ? { rejectUnauthorized: false } : false,
    });

    // Leer el archivo SQL
    const sqlPath = resolve(process.cwd(), 'enable-rls-policies.sql');
    console.log('📖 Leyendo archivo SQL de políticas RLS...');
    
    if (!readFileSync(sqlPath, { encoding: 'utf-8', flag: 'r' })) {
      throw new Error(`No se pudo leer el archivo: ${sqlPath}`);
    }
    
    const sql = readFileSync(sqlPath, 'utf-8');
    console.log('');

    // Ejecutar el SQL completo (las funciones y políticas necesitan ejecutarse juntas)
    console.log('🚀 Aplicando políticas RLS...');
    console.log('   Esto puede tomar unos momentos...');
    console.log('');

    const client = await pool.connect();
    try {
      // Ejecutar el SQL completo
      await client.query(sql);
      console.log('✅ Políticas RLS aplicadas exitosamente!');
      console.log('');
    } catch (error: any) {
      // Si hay errores, intentar ejecutar por partes
      console.log('⚠️  Error al ejecutar SQL completo, intentando por partes...');
      console.log('');
      
      // Dividir en bloques por funciones y políticas
      const blocks = sql.split(/-- =+.*?=+/).filter(block => block.trim().length > 0);
      
      for (let i = 0; i < blocks.length; i++) {
        const block = blocks[i].trim();
        if (block.length < 10) continue;
        
        try {
          await client.query(block);
          const progress = Math.round(((i + 1) / blocks.length) * 100);
          process.stdout.write(`\r   Progreso: ${progress}% (${i + 1}/${blocks.length})`);
        } catch (blockError: any) {
          // Ignorar errores de "ya existe" para funciones y políticas
          if (blockError.message.includes('already exists') || 
              blockError.message.includes('duplicate') ||
              blockError.code === '42P07' || // duplicate_table
              blockError.code === '42710' || // duplicate_object
              blockError.code === '42723') { // duplicate_function
            // Continuar silenciosamente
          } else {
            console.error(`\n⚠️  Error en bloque ${i + 1}:`, blockError.message);
            // Continuar con el siguiente bloque
          }
        }
      }
      console.log('');
      console.log('');
      console.log('✅ Políticas RLS aplicadas (algunas pueden haber sido ignoradas si ya existían)');
      console.log('');
    } finally {
      client.release();
    }

    // Verificar que RLS está habilitado
    console.log('🔍 Verificando que RLS está habilitado...');
    const checkResult = await pool.query(`
      SELECT tablename, rowsecurity 
      FROM pg_tables 
      WHERE schemaname = 'public' 
      AND tablename IN (
        'users', 'tax_cases', 'documents', 'appointments', 
        'messages', 'contact_submissions', 'activity_logs', 
        'auth_identities', 'password_reset_tokens', 'sessions'
      )
      ORDER BY tablename;
    `);

    console.log('');
    console.log('📊 Estado de RLS por tabla:');
    console.log('');
    
    const tablesWithRLS = checkResult.rows.filter(row => row.rowsecurity === true);
    const tablesWithoutRLS = checkResult.rows.filter(row => row.rowsecurity === false);
    
    if (tablesWithRLS.length > 0) {
      console.log('✅ Tablas con RLS habilitado:');
      tablesWithRLS.forEach(row => {
        console.log(`   ✓ ${row.tablename}`);
      });
      console.log('');
    }
    
    if (tablesWithoutRLS.length > 0) {
      console.log('⚠️  Tablas sin RLS habilitado:');
      tablesWithoutRLS.forEach(row => {
        console.log(`   ✗ ${row.tablename}`);
      });
      console.log('');
    }

    // Verificar políticas creadas
    const policiesResult = await pool.query(`
      SELECT schemaname, tablename, policyname 
      FROM pg_policies 
      WHERE schemaname = 'public'
      ORDER BY tablename, policyname;
    `);

    console.log(`📋 Políticas creadas: ${policiesResult.rows.length}`);
    if (policiesResult.rows.length > 0) {
      const tablesWithPolicies = new Set(policiesResult.rows.map(r => r.tablename));
      console.log(`   En ${tablesWithPolicies.size} tablas`);
      console.log('');
    }

    await pool.end();

    console.log('✅ ¡Proceso completado!');
    console.log('');
    console.log('🔍 Verifica en Supabase Dashboard:');
    console.log('   1. Ve al Table Editor');
    console.log('   2. Selecciona cada tabla');
    console.log('   3. Verifica que muestre "RLS Enabled"');
    console.log('   4. Los mensajes críticos deberían desaparecer');
    console.log('');

    process.exit(0);
  } catch (error) {
    console.error('');
    console.error('❌ Error al ejecutar SQL:', error);
    console.error('');
    if (error instanceof Error) {
      console.error('Detalles:', error.message);
    }
    process.exit(1);
  }
}

enableRLS();

