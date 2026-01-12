/**
 * Script para verificar si el usuario admin existe
 */

const { Pool } = require('pg');

const DATABASE_URL = 'postgresql://postgres.pfqzfretadqjzjbimvkv:R0CnJK4mKx9Mfj68@aws-0-us-east-1.pooler.supabase.com:6543/postgres';

async function verificarAdmin() {
  try {
    console.log('🔌 Conectando a Supabase...');
    const pool = new Pool({
      connectionString: DATABASE_URL,
      ssl: { rejectUnauthorized: false }
    });

    const client = await pool.connect();
    
    try {
      const result = await client.query(
        'SELECT id, email, name, role, created_at FROM users WHERE email = $1',
        ['servicestaxx@gmail.com']
      );

      if (result.rows.length > 0) {
        console.log('');
        console.log('✅ ¡Usuario admin encontrado!');
        console.log('');
        console.log('📋 Detalles:');
        console.log('   ID:', result.rows[0].id);
        console.log('   Email:', result.rows[0].email);
        console.log('   Nombre:', result.rows[0].name);
        console.log('   Rol:', result.rows[0].role);
        console.log('   Creado:', result.rows[0].created_at);
        console.log('');
      } else {
        console.log('');
        console.log('❌ Usuario admin NO encontrado');
        console.log('   Necesitas ejecutar crear-admin-auto.cjs');
        console.log('');
      }

    } finally {
      client.release();
    }

    await pool.end();
    process.exit(0);
  } catch (error) {
    console.error('');
    console.error('❌ Error:', error.message);
    if (error.code === '42P01') {
      console.error('💡 La tabla "users" no existe. Ejecuta create-tables.sql primero.');
    }
    process.exit(1);
  }
}

verificarAdmin();




