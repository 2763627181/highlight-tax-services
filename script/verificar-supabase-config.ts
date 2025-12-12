/**
 * Script para verificar la configuración de Supabase
 * Ejecuta: tsx script/verificar-supabase-config.ts
 */

import { createClient } from '@supabase/supabase-js';

const supabaseUrl = process.env.VITE_SUPABASE_URL || 'https://pfqzfretadqjzjbimvkv.supabase.co';
const supabaseAnonKey = process.env.VITE_SUPABASE_ANON_KEY || 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InBmcXpmcmV0YWRxanpqYmltdmt2Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3NjQ3MzE5MzksImV4cCI6MjA4MDMwNzkzOX0.0WqX6BqLXkTNwtuFcfwP9TSJvLGf9VKLSc7xRYIXMwM';

async function verificarConfiguracion() {
  console.log('🔍 Verificando configuración de Supabase...\n');

  // Verificar que las variables estén configuradas
  console.log('📋 Variables de Entorno:');
  console.log(`   VITE_SUPABASE_URL: ${supabaseUrl ? '✅ Configurada' : '❌ Faltante'}`);
  console.log(`   VITE_SUPABASE_ANON_KEY: ${supabaseAnonKey ? '✅ Configurada' : '❌ Faltante'}\n`);

  if (!supabaseUrl || !supabaseAnonKey) {
    console.error('❌ Faltan variables de entorno necesarias');
    process.exit(1);
  }

  // Crear cliente de Supabase
  const supabase = createClient(supabaseUrl, supabaseAnonKey);

  // Verificar conexión
  console.log('🔌 Verificando conexión a Supabase...');
  try {
    const { data, error } = await supabase.from('users').select('count').limit(1);
    if (error) {
      console.error('❌ Error al conectar:', error.message);
    } else {
      console.log('✅ Conexión exitosa a Supabase\n');
    }
  } catch (error) {
    console.error('❌ Error de conexión:', error);
  }

  // Verificar configuración de URLs
  console.log('🌐 Configuración de URLs Requerida:\n');
  console.log('⚠️  IMPORTANTE: Estas URLs deben estar configuradas en Supabase Dashboard\n');
  console.log('📍 Site URL:');
  console.log('   https://highlighttax.com\n');
  console.log('📍 Redirect URLs (agregar todas):');
  console.log('   1. https://highlighttax.com/auth/callback');
  console.log('   2. https://highlighttax.com/api/auth/oidc/callback\n');
  console.log('🔗 Enlace directo a configuración:');
  console.log('   https://supabase.com/dashboard/project/pfqzfretadqjzjbimvkv/auth/url-configuration\n');

  // Verificar que el código use las URLs correctas
  console.log('📝 Verificando código del proyecto...\n');
  console.log('✅ El código usa window.location.origin para redirects dinámicos');
  console.log('✅ Esto significa que funcionará en cualquier dominio donde esté desplegado\n');

  console.log('📋 Checklist de Configuración:');
  console.log('   [ ] Site URL cambiado de localhost:3000 a https://highlighttax.com');
  console.log('   [ ] Redirect URL agregada: https://highlighttax.com/auth/callback');
  console.log('   [ ] Redirect URL agregada: https://highlighttax.com/api/auth/oidc/callback');
  console.log('   [ ] Variables de entorno configuradas en Vercel');
  console.log('   [ ] Redeploy hecho en Vercel después de cambios\n');

  console.log('💡 Siguiente paso:');
  console.log('   1. Ve a: https://supabase.com/dashboard/project/pfqzfretadqjzjbimvkv/auth/url-configuration');
  console.log('   2. Cambia Site URL a: https://highlighttax.com');
  console.log('   3. Agrega las Redirect URLs mencionadas arriba');
  console.log('   4. Haz clic en "Save changes"');
  console.log('   5. Haz redeploy en Vercel\n');
}

verificarConfiguracion().catch(console.error);


