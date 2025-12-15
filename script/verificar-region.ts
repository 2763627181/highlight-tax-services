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
  if (databaseUrl) {
    const regionMatch = databaseUrl.match(/aws-0-([^.]+)\.pooler\.supabase\.com/);
    if (regionMatch) {
      supabaseRegion = regionMatch[1];
    }
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

  // Verificar si DATABASE_URL está configurada
  if (!databaseUrl) {
    console.log('❌ ERROR: DATABASE_URL no está configurada');
    console.log('   Configura DATABASE_URL en tus variables de entorno.\n');
    process.exit(1);
  }

  console.log('✅ Verificación completada.\n');
}

verificarRegion().catch(console.error);

