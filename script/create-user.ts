/**
 * Script para crear un usuario directamente en la base de datos
 * 
 * Uso:
 *   tsx script/create-user.ts <email> <password> <name> [phone]
 * 
 * Ejemplo:
 *   tsx script/create-user.ts servicestaxx@gmail.com SecurePass123 "Joel Paula" "8095305592"
 */

import { db } from '../server/db';
import { users } from '../shared/schema';
import { eq } from 'drizzle-orm';
import bcrypt from 'bcryptjs';

const BCRYPT_ROUNDS = 12;

async function createUser() {
  const args = process.argv.slice(2);
  
  if (args.length < 3) {
    console.error('Uso: tsx script/create-user.ts <email> <password> <name> [phone]');
    console.error('Ejemplo: tsx script/create-user.ts servicestaxx@gmail.com SecurePass123 "Joel Paula" "8095305592"');
    process.exit(1);
  }

  const [email, password, name, phone] = args;

  try {
    console.log('Conectando a la base de datos...');
    
    // Verificar si el usuario ya existe
    const existingUser = await db.select().from(users).where(eq(users.email, email.toLowerCase().trim())).limit(1);
    
    if (existingUser.length > 0) {
      console.error(`❌ El usuario con email ${email} ya existe.`);
      console.log('Usuario existente:', {
        id: existingUser[0].id,
        email: existingUser[0].email,
        name: existingUser[0].name,
        role: existingUser[0].role,
      });
      process.exit(1);
    }

    // Hashear contraseña
    console.log('Hasheando contraseña...');
    const hashedPassword = await bcrypt.hash(password, BCRYPT_ROUNDS);

    // Crear usuario
    console.log('Creando usuario...');
    const [newUser] = await db.insert(users).values({
      email: email.toLowerCase().trim(),
      password: hashedPassword,
      name: name.trim(),
      phone: phone || null,
      role: 'client',
    }).returning();

    console.log('✅ Usuario creado exitosamente!');
    console.log({
      id: newUser.id,
      email: newUser.email,
      name: newUser.name,
      phone: newUser.phone,
      role: newUser.role,
      createdAt: newUser.createdAt,
    });

    process.exit(0);
  } catch (error) {
    console.error('❌ Error al crear usuario:', error);
    process.exit(1);
  }
}

createUser();

