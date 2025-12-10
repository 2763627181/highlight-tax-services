/**
 * Script para crear usuario admin automáticamente
 * Ejecuta: node crear-admin-auto.cjs
 */

import pg from 'pg';
import bcrypt from 'bcryptjs';
import dotenv from 'dotenv';

dotenv.config();
const { Pool } = pg;

const DATABASE_URL = process.env.DATABASE_URL || 'postgresql://postgres.pfqzfretadqjzjbimvkv:sethum-2zAbpe-bismek@aws-0-us-east-1.pooler.supabase.com:6543/postgres';

async function crearAdmin() {
  try {
    console.log('🔌 Conectando a Supabase...');
    const pool = new Pool({
      connectionString: DATABASE_URL,
      ssl: { rejectUnauthorized: false }
    });

    console.log('🔐 Generando hash de contraseña...');
    const hash = await bcrypt.hash('Admin123!', 12);

    console.log('👤 Creando usuario admin...');
    const client = await pool.connect();
    
    try {
      // Insertar o actualizar usuario
      await client.query(`
        INSERT INTO users (email, password, name, phone, role)
        VALUES ($1, $2, $3, $4, $5)
        ON CONFLICT (email) DO UPDATE 
        SET role = $5, password = $2
      `, [
        'servicestaxx@gmail.com',
        hash,
        'Joel Paula',
        '8095305592',
        'admin'
      ]);

      // Verificar que se creó
      const result = await client.query(
        'SELECT id, email, name, role, created_at FROM users WHERE email = $1',
        ['servicestaxx@gmail.com']
      );

      console.log('');
      console.log('✅ ¡Usuario admin creado exitosamente!');
      console.log('');
      console.log('📋 Detalles:');
      console.log('   ID:', result.rows[0].id);
      console.log('   Email:', result.rows[0].email);
      console.log('   Nombre:', result.rows[0].name);
      console.log('   Rol:', result.rows[0].role);
      console.log('   Creado:', result.rows[0].created_at);
      console.log('');
      console.log('🔑 Credenciales:');
      console.log('   Email: servicestaxx@gmail.com');
      console.log('   Password: Admin123!');
      console.log('');

    } finally {
      client.release();
    }

    await pool.end();
    process.exit(0);
  } catch (error) {
    console.error('');
    console.error('❌ Error al crear usuario admin:', error.message);
    console.error('');
    if (error.code === '42P01') {
      console.error('💡 Error: La tabla "users" no existe.');
      console.error('   Primero debes crear las tablas ejecutando create-tables.sql en Supabase');
    } else if (error.code === '23505') {
      console.error('⚠️  El usuario ya existe. Se actualizó el rol a admin.');
    }
    process.exit(1);
  }
}

crearAdmin();

