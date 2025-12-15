/**
 * Script para verificar la región de Supabase y compararla con Vercel
 * Ejecuta: tsx script/verificar-region.ts
 */

const supabaseUrl = process.env.VITE_SUPABASE_URL || 'https://pfqzfretadqjzjbimvkv.supabase.co';
const databaseUrl = process.env.DATABASE_URL || '';

async function verificarRegion() {
  console.log('🔍 Verificando región de Supabase y Vercel...\n');

  // Extraer región de Supabase desde DATABASE_URL
  let supabaseRegion = 'Desconocida';
  let regionSource = '';
  
  if (databaseUrl) {
    // Intentar extraer desde DATABASE_URL (formato pooler)
    const regionMatch = databaseUrl.match(/aws-0-([^.]+)\.pooler\.supabase\.com/);
    if (regionMatch) {
      supabaseRegion = regionMatch[1];
      regionSource = 'DATABASE_URL (pooler)';
    } else {
      // Intentar formato directo
      const directMatch = databaseUrl.match(/aws-0-([^.]+)\.supabase\.com/);
      if (directMatch) {
        supabaseRegion = directMatch[1];
        regionSource = 'DATABASE_URL (directo)';
      }
    }
  }
  
  // Si no se encontró en DATABASE_URL, intentar desde Supabase URL
  if (supabaseRegion === 'Desconocida' && supabaseUrl) {
    // Hacer una petición a la API de Supabase para obtener información del proyecto
    try {
      const response = await fetch(`${supabaseUrl}/rest/v1/`, {
        headers: {
          'apikey': process.env.VITE_SUPABASE_ANON_KEY || '',
        }
      });
      // La región generalmente está en el header o podemos inferirla
      // Por ahora, verificamos si la URL contiene información
    } catch (error) {
      // Ignorar errores de fetch
    }
  }
  
  // Si no se detectó, pedir verificación manual
  if (supabaseRegion === 'Desconocida') {
    console.log('⚠️  No se pudo detectar la región automáticamente desde DATABASE_URL.\n');
    console.log('📋 Verificación manual necesaria:\n');
    console.log('   1. Ve a Supabase Dashboard:');
    console.log('      https://supabase.com/dashboard/project/pfqzfretadqjzjbimvkv/settings/infrastructure\n');
    console.log('   2. Verifica la región del proyecto en "Primary Database" > "Region"\n');
    console.log('   3. Compara con la región de Vercel (us-east-1 es la recomendada)\n');
    console.log('   4. Si la región es diferente a us-east-1, considera migrar para mejor rendimiento\n');
    
    // No asumir región, dejar que el usuario verifique
    return;
  }

  // Mapeo de regiones de Supabase a nombres legibles
  const regionMap: Record<string, string> = {
    'us-east-1': 'US East (N. Virginia)',
    'us-east-2': 'US East (Ohio)',
    'us-west-1': 'US West (N. California)',
    'us-west-2': 'US West (Oregon)',
    'eu-west-1': 'EU West (Ireland)',
    'eu-west-2': 'EU West (London)',
    'eu-west-3': 'EU West (Paris)',
    'eu-central-1': 'EU Central (Frankfurt)',
    'ap-southeast-1': 'Asia Pacific (Singapore)',
    'ap-southeast-2': 'Asia Pacific (Sydney)',
    'ap-northeast-1': 'Asia Pacific (Tokyo)',
  };

  const regionName = regionMap[supabaseRegion] || supabaseRegion;

  console.log('📊 Información de Regiones:\n');
  console.log(`   Supabase URL: ${supabaseUrl}`);
  console.log(`   Supabase Región: ${regionName} (${supabaseRegion})`);
  if (regionSource) {
    console.log(`   Fuente: ${regionSource}`);
  }
  console.log(`   Vercel Región Recomendada: US East (N. Virginia) - us-east-1\n`);

  // Verificar si coinciden
  const vercelRecommendedRegion = 'us-east-1';
  if (supabaseRegion === vercelRecommendedRegion) {
    console.log('✅ Las regiones coinciden! Supabase está en la misma región que Vercel.\n');
  } else {
    console.log('⚠️  ADVERTENCIA: Las regiones NO coinciden.\n');
    console.log('   Para optimizar la latencia, deberías:');
    console.log('   1. Ir a Supabase Dashboard: https://supabase.com/dashboard/project/pfqzfretadqjzjbimvkv/settings/infrastructure');
    console.log('   2. Crear un nuevo proyecto en la región us-east-1 (US East)');
    console.log('   3. Migrar los datos al nuevo proyecto');
    console.log('   4. Actualizar DATABASE_URL en Vercel con la nueva URL\n');
  }

  // Información adicional
  console.log('📝 Notas:');
  console.log('   - Vercel usa principalmente us-east-1 para funciones serverless');
  console.log('   - Tener Supabase en la misma región reduce latencia significativamente');
  console.log('   - La latencia entre regiones puede ser 50-200ms adicionales\n');

  // Verificar si DATABASE_URL está configurada (solo advertencia, no error fatal)
  if (!databaseUrl) {
    console.log('⚠️  ADVERTENCIA: DATABASE_URL no está configurada localmente.');
    console.log('   Esto es normal si solo estás verificando la configuración.');
    console.log('   En Vercel, DATABASE_URL debe estar configurada en Environment Variables.\n');
  } else {
    console.log('✅ DATABASE_URL está configurada localmente.\n');
  }

  console.log('📝 Próximos pasos:\n');
  console.log('   1. Verifica en Supabase Dashboard que la región sea us-east-1');
  console.log('   2. Verifica en Vercel que DATABASE_URL contenga aws-0-us-east-1');
  console.log('   3. Si las regiones coinciden, ¡todo está optimizado! 🎉\n');
  
  console.log('✅ Verificación completada.\n');
}

verificarRegion().catch(console.error);


