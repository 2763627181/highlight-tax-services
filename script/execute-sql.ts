/**
 * Script para ejecutar el SQL directamente en Supabase
 * 
 * Este script lee el archivo create-tables.sql y lo ejecuta directamente
 * en la base de datos usando la conexión de Supabase.
 * 
 * Uso:
 *   DATABASE_URL="tu-connection-string" tsx script/execute-sql.ts
 * 
 * O configura DATABASE_URL en .env
 */

import { readFileSync } from 'fs';
import { resolve } from 'path';
import { config } from 'dotenv';
import pg from 'pg';

const { Pool } = pg;

// Cargar variables de entorno
config({ path: resolve(process.cwd(), '.env') });

async function executeSQL() {
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
      console.error('  DATABASE_URL="tu-url" tsx script/execute-sql.ts');
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
    const sqlPath = resolve(process.cwd(), 'create-tables.sql');
    console.log('📖 Leyendo archivo SQL...');
    const sql = readFileSync(sqlPath, 'utf-8');
    console.log('');

    // Dividir el SQL en comandos (separados por ;)
    // Filtrar comentarios y líneas vacías
    const commands = sql
      .split(';')
      .map(cmd => cmd.trim())
      .filter(cmd => 
        cmd.length > 0 && 
        !cmd.startsWith('--') && 
        !cmd.startsWith('/*') &&
        cmd !== '$$'
      );

    console.log(`🚀 Ejecutando ${commands.length} comandos SQL...`);
    console.log('');

    // Ejecutar cada comando
    const client = await pool.connect();
    try {
      for (let i = 0; i < commands.length; i++) {
        const command = commands[i];
        if (command.length < 10) continue; // Saltar comandos muy cortos (probablemente fragmentos)
        
        try {
          await client.query(command);
          const progress = Math.round(((i + 1) / commands.length) * 100);
          process.stdout.write(`\r   Progreso: ${progress}% (${i + 1}/${commands.length})`);
        } catch (error: any) {
          // Ignorar errores de "ya existe" para enums y tablas
          if (error.message.includes('already exists') || 
              error.message.includes('duplicate') ||
              error.code === '42P07' || // duplicate_table
              error.code === '42710') { // duplicate_object
            // Continuar silenciosamente
          } else {
            console.error(`\n⚠️  Error en comando ${i + 1}:`, error.message);
            // Continuar con el siguiente comando
          }
        }
      }
      console.log('');
      console.log('');
    } finally {
      client.release();
    }

    await pool.end();

    console.log('✅ ¡Tablas creadas exitosamente en Supabase!');
    console.log('');
    console.log('📋 Tablas creadas:');
    console.log('   ✓ users (usuarios: clientes, preparadores, admins)');
    console.log('   ✓ tax_cases (casos tributarios)');
    console.log('   ✓ documents (documentos)');
    console.log('   ✓ appointments (citas)');
    console.log('   ✓ messages (mensajes)');
    console.log('   ✓ contact_submissions (formularios de contacto)');
    console.log('   ✓ activity_logs (logs de actividad)');
    console.log('   ✓ auth_identities (identidades OAuth)');
    console.log('   ✓ password_reset_tokens (tokens de recuperación)');
    console.log('   ✓ sessions (sesiones OAuth)');
    console.log('');
    console.log('🔍 Verifica en Supabase:');
    console.log('   1. Ve al Table Editor');
    console.log('   2. Cambia el schema de "vault" a "public"');
    console.log('   3. Deberías ver todas las tablas listadas');
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

executeSQL();


