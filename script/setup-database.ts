/**
 * Script para crear todas las tablas en Supabase
 * 
 * Este script ejecuta drizzle-kit push para crear todas las tablas
 * definidas en shared/schema.ts en la base de datos de Supabase.
 * 
 * Uso:
 *   tsx script/setup-database.ts
 * 
 * Requiere:
 *   - DATABASE_URL en las variables de entorno
 *   - Conexión a Supabase configurada
 */

import { execSync } from 'child_process';
import { config } from 'dotenv';
import { resolve } from 'path';

// Cargar variables de entorno
config({ path: resolve(process.cwd(), '.env') });

async function setupDatabase() {
  try {
    if (!process.env.DATABASE_URL) {
      console.error('❌ Error: DATABASE_URL no está configurada en las variables de entorno');
      console.error('');
      console.error('Por favor, configura DATABASE_URL en tu archivo .env o variables de entorno');
      console.error('Ejemplo: DATABASE_URL=postgresql://user:password@host:port/database');
      process.exit(1);
    }

    console.log('📊 Verificando conexión a la base de datos...');
    console.log(`   Base de datos: ${process.env.DATABASE_URL.replace(/:[^:@]+@/, ':****@')}`);
    console.log('');

    console.log('🚀 Creando tablas en Supabase...');
    console.log('   Esto puede tomar unos momentos...');
    console.log('');

    // Ejecutar drizzle-kit push
    execSync('npm run db:push', {
      stdio: 'inherit',
      cwd: process.cwd(),
    });

    console.log('');
    console.log('✅ ¡Tablas creadas exitosamente en Supabase!');
    console.log('');
    console.log('📋 Tablas creadas:');
    console.log('   - users (usuarios: clientes, preparadores, admins)');
    console.log('   - tax_cases (casos tributarios)');
    console.log('   - documents (documentos)');
    console.log('   - appointments (citas)');
    console.log('   - messages (mensajes)');
    console.log('   - contact_submissions (formularios de contacto)');
    console.log('   - activity_logs (logs de actividad)');
    console.log('   - auth_identities (identidades OAuth)');
    console.log('   - password_reset_tokens (tokens de recuperación)');
    console.log('   - sessions (sesiones OAuth)');
    console.log('');
    console.log('🔍 Puedes verificar las tablas en el dashboard de Supabase:');
    console.log('   https://supabase.com/dashboard/project/[tu-proyecto]/editor');
    console.log('');

    process.exit(0);
  } catch (error) {
    console.error('');
    console.error('❌ Error al crear las tablas:', error);
    console.error('');
    console.error('Verifica que:');
    console.error('   1. DATABASE_URL esté correctamente configurada');
    console.error('   2. Tengas acceso a la base de datos de Supabase');
    console.error('   3. Las credenciales sean correctas');
    process.exit(1);
  }
}

setupDatabase();



