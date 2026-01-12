# 📊 ANÁLISIS COMPLETO DE VARIABLES DE ENTORNO - VERCEL

## ✅ Variables OBLIGATORIAS (Sin estas, la app NO funciona)

| Variable | Estado | Descripción | Dónde se usa |
|----------|--------|-------------|--------------|
| `DATABASE_URL` | ✅ **VERIFICAR** | String de conexión a Supabase PostgreSQL | `server/db.ts`, `server/routes.ts` |
| `SESSION_SECRET` | ✅ **VERIFICAR** | Secret para JWT (mínimo 32 caracteres) | `server/routes.ts`, `server/replitAuth.ts` |
| `NODE_ENV` | ✅ **VERIFICAR** | Debe ser `production` en Vercel | Múltiples archivos |

---

## ⚠️ Variables OPCIONALES (Para funcionalidad completa)

### Email (Resend)
| Variable | Estado | Descripción | Dónde se usa |
|----------|--------|-------------|--------------|
| `RESEND_API_KEY` | ⚠️ **RECOMENDADA** | API Key de Resend para emails | `server/email.ts` |
| `RESEND_FROM_EMAIL` | ⚠️ Opcional | Email remitente (default: noreply@highlighttax.com) | `server/email.ts` |
| `VITE_APP_URL` | ⚠️ Opcional | URL de la app para links en emails | `server/email.ts` |

### OAuth (Supabase) - Solo si usas login con Google/GitHub
| Variable | Estado | Descripción | Dónde se usa |
|----------|--------|-------------|--------------|
| `VITE_SUPABASE_URL` | ⚠️ Solo si usas OAuth | URL del proyecto Supabase | `client/src/lib/supabase.ts` |
| `VITE_SUPABASE_ANON_KEY` | ⚠️ Solo si usas OAuth | Anon Key de Supabase | `client/src/lib/supabase.ts` |

### Almacenamiento (Cloudflare R2) - Solo si usas R2
| Variable | Estado | Descripción | Dónde se usa |
|----------|--------|-------------|--------------|
| `R2_ACCOUNT_ID` | ⚠️ Solo si usas R2 | ID de cuenta Cloudflare | `server/r2.ts` |
| `R2_ACCESS_KEY_ID` | ⚠️ Solo si usas R2 | Access Key de R2 | `server/r2.ts` |
| `R2_SECRET_ACCESS_KEY` | ⚠️ Solo si usas R2 | Secret Key de R2 | `server/r2.ts` |
| `R2_BUCKET_NAME` | ⚠️ Solo si usas R2 | Nombre del bucket | `server/r2.ts` |
| `R2_PUBLIC_URL` | ⚠️ Opcional | URL pública del bucket | `server/r2.ts` |

---

## ❌ Variables QUE NO NECESITAS (Puedes ELIMINARLAS)

### Variables de Next.js (Este proyecto usa React + Vite, NO Next.js)
- ❌ `NEXT_PUBLIC_SUPABASE_URL` 
- ❌ `NEXT_PUBLIC_SUPABASE_ANON_KEY`
- ❌ `NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY`

**Razón:** Este proyecto usa `VITE_*` no `NEXT_PUBLIC_*`. Si quieres OAuth, usa `VITE_SUPABASE_URL` y `VITE_SUPABASE_ANON_KEY`.

### Variables de PostgreSQL separadas (Usa solo DATABASE_URL)
- ❌ `POSTGRES_URL`
- ❌ `POSTGRES_PRISMA_URL`
- ❌ `POSTGRES_URL_NON_POOLING`
- ❌ `POSTGRES_USER`
- ❌ `POSTGRES_HOST`
- ❌ `POSTGRES_PASSWORD`
- ❌ `POSTGRES_DATABASE`

**Razón:** El código usa `DATABASE_URL` directamente. Las variables separadas no se usan.

### Variables de Supabase que no se usan en el código
- ❌ `SUPABASE_SECRET_KEY`
- ❌ `SUPABASE_SERVICE_ROLE_KEY`
- ❌ `SUPABASE_JWT_SECRET`
- ❌ `SUPABASE_PUBLISHABLE_KEY`

**Razón:** Estas variables no aparecen en ningún archivo del código. Si las necesitas para algo específico, dímelo.

---

## 🔍 VERIFICACIÓN ESPECÍFICA DE VARIABLES CRÍTICAS

### 1. DATABASE_URL ⚠️ CRÍTICA
**Formato correcto:**
```
postgresql://postgres.pfqzfretadqjzjbimvkv:R0CnJK4mKx9Mfj68@aws-0-us-east-1.pooler.supabase.com:6543/postgres
```

**Verificar:**
- ✅ Debe empezar con `postgresql://`
- ✅ Host debe ser `aws-0-us-east-1.pooler.supabase.com` (NO `db.pfqzfretadqjzjbimvkv.supabase.co`)
- ✅ Puerto debe ser `6543` (pooler) o `5432` (directo)
- ✅ Base de datos debe ser `postgres`

**Error común encontrado:**
- ❌ Host incorrecto: `db.pfqzfretadqjzjbimvkv.supabase.co` (esto causa `ENOTFOUND`)

### 2. SESSION_SECRET ⚠️ CRÍTICA
**Requisitos:**
- ✅ Mínimo 32 caracteres
- ✅ Debe ser aleatorio y seguro
- ✅ Debe ser la misma en todos los entornos (Production, Preview, Development)

**Cómo generar:**
```bash
node -e "console.log(require('crypto').randomBytes(32).toString('hex'))"
```

### 3. NODE_ENV
**Valor correcto en Vercel:**
- Production: `production`
- Preview: `production` o `preview`
- Development: `development`

---

## 📋 CHECKLIST DE ACCIÓN

### Paso 1: Verificar Variables Obligatorias
- [ ] `DATABASE_URL` está configurada y tiene el host correcto (`aws-0-us-east-1.pooler.supabase.com`)
- [ ] `SESSION_SECRET` está configurada y tiene al menos 32 caracteres
- [ ] `NODE_ENV` está configurada como `production` en Production

### Paso 2: Limpiar Variables No Necesarias
- [ ] Eliminar todas las variables `NEXT_PUBLIC_*`
- [ ] Eliminar todas las variables `POSTGRES_*` (excepto si las necesitas para otra cosa)
- [ ] Eliminar `SUPABASE_SECRET_KEY`, `SUPABASE_SERVICE_ROLE_KEY`, `SUPABASE_JWT_SECRET`, `SUPABASE_PUBLISHABLE_KEY`

### Paso 3: Configurar Variables Opcionales (Si las necesitas)
- [ ] Si usas OAuth: Configurar `VITE_SUPABASE_URL` y `VITE_SUPABASE_ANON_KEY`
- [ ] Si quieres emails: Configurar `RESEND_API_KEY`
- [ ] Si usas R2: Verificar que todas las `R2_*` estén configuradas

---

## 🎯 RECOMENDACIÓN FINAL

**Variables mínimas necesarias para que funcione:**
```env
DATABASE_URL=postgresql://postgres.pfqzfretadqjzjbimvkv:R0CnJK4mKx9Mfj68@aws-0-us-east-1.pooler.supabase.com:6543/postgres
SESSION_SECRET=tu-secret-de-32-caracteres-minimo
NODE_ENV=production
```

**Variables recomendadas para funcionalidad completa:**
```env
# Las 3 anteriores +
RESEND_API_KEY=re_xxxxx
VITE_APP_URL=https://highlighttax.com
```

**Variables opcionales (solo si las usas):**
```env
# OAuth
VITE_SUPABASE_URL=https://pfqzfretadqjzjbimvkv.supabase.co
VITE_SUPABASE_ANON_KEY=eyJhbG...

# R2 Storage
R2_ACCOUNT_ID=xxx
R2_ACCESS_KEY_ID=xxx
R2_SECRET_ACCESS_KEY=xxx
R2_BUCKET_NAME=xxx
R2_PUBLIC_URL=https://xxx.r2.cloudflarestorage.com
```

---

## 🚨 PROBLEMA ACTUAL IDENTIFICADO

**Error en logs:**
```
Error: getaddrinfo ENOTFOUND db.pfqzfretadqjzjbimvkv.supabase.co
```

**Causa:** La `DATABASE_URL` en Vercel tiene un host incorrecto. Debe usar `aws-0-us-east-1.pooler.supabase.com` no `db.pfqzfretadqjzjbimvkv.supabase.co`.

**Solución:** Verifica y corrige `DATABASE_URL` en Vercel → Settings → Environment Variables.

