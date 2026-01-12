# 🔧 Configurar TODAS las Variables de Entorno en Vercel

## 📋 Lista Completa de Variables

### ✅ OBLIGATORIAS (Sin estas, la app NO funciona)

Agrega estas 3 variables primero:

#### 1. DATABASE_URL
**Name:** `DATABASE_URL`  
**Value:**
```
postgresql://postgres.pfqzfretadqjzjbimvkv:R0CnJK4mKx9Mfj68@aws-0-us-east-1.pooler.supabase.com:6543/postgres
```
**Environment:** ✅ Production, ✅ Preview, ✅ Development

> ⚠️ **IMPORTANTE:** Usa el pooler (`aws-0-us-east-1.pooler.supabase.com`) NO la conexión directa (`db.pfqzfretadqjzjbimvkv.supabase.co`)

#### 2. SESSION_SECRET
**Name:** `SESSION_SECRET`  
**Value:** Genera uno nuevo con este comando:
```bash
node -e "console.log(require('crypto').randomBytes(32).toString('hex'))"
```
O usa este ejemplo (cámbialo por uno único):
```
a1b2c3d4e5f6789012345678901234567890abcdef1234567890abcdef123456
```
**Requisitos:** Mínimo 32 caracteres (64 caracteres hex es ideal)  
**Environment:** ✅ Production, ✅ Preview, ✅ Development

#### 3. NODE_ENV
**Name:** `NODE_ENV`  
**Value:** `production`  
**Environment:** ✅ Production, ✅ Preview, ✅ Development

---

### ⚠️ RECOMENDADAS (Para funcionalidad completa)

#### 4. RESEND_API_KEY
**Name:** `RESEND_API_KEY`  
**Value:** Tu API Key de Resend (formato: `re_xxxxx`)  
**Dónde obtenerla:** https://resend.com/api-keys  
**Para qué:** Envío de emails (formulario de contacto, notificaciones)  
**Environment:** ✅ Production, ✅ Preview, ✅ Development

#### 5. VITE_APP_URL
**Name:** `VITE_APP_URL`  
**Value:** URL completa de tu aplicación en Vercel  
**Ejemplo:** `https://highlighttax.com` o `https://tu-proyecto.vercel.app`  
**Para qué:** Links en emails, redirecciones  
**Environment:** ✅ Production, ✅ Preview, ✅ Development

#### 6. RESEND_FROM_EMAIL
**Name:** `RESEND_FROM_EMAIL`  
**Value:** Email remitente (debe estar verificado en Resend)  
**Ejemplo:** `noreply@highlighttax.com`  
**Opcional:** Si no está, usa el default `noreply@highlighttax.com`  
**Environment:** ✅ Production, ✅ Preview, ✅ Development

---

### 🔐 OPCIONALES (Solo si usas estas funcionalidades)

#### 7. VITE_SUPABASE_URL
**Name:** `VITE_SUPABASE_URL`  
**Value:** `https://pfqzfretadqjzjbimvkv.supabase.co`  
**Dónde obtenerla:** Supabase Dashboard → Settings → API → Project URL  
**Para qué:** Login con Google/GitHub/Apple (OAuth)  
**Environment:** ✅ Production, ✅ Preview, ✅ Development

#### 8. VITE_SUPABASE_ANON_KEY
**Name:** `VITE_SUPABASE_ANON_KEY`  
**Value:** Tu Anon Key de Supabase (formato: `eyJhbG...`)  
**Dónde obtenerla:** Supabase Dashboard → Settings → API → anon public key  
**Para qué:** Login con Google/GitHub/Apple (OAuth)  
**Environment:** ✅ Production, ✅ Preview, ✅ Development

---

### ☁️ CLOUDFLARE R2 (Solo si usas R2 para almacenamiento)

#### 9. R2_ACCOUNT_ID
**Name:** `R2_ACCOUNT_ID`  
**Value:** Tu Account ID de Cloudflare  
**Dónde obtenerla:** Cloudflare Dashboard → R2 → Account ID

#### 10. R2_ACCESS_KEY_ID
**Name:** `R2_ACCESS_KEY_ID`  
**Value:** Tu Access Key ID de R2  
**Dónde obtenerla:** Cloudflare Dashboard → R2 → Manage R2 API Tokens

#### 11. R2_SECRET_ACCESS_KEY
**Name:** `R2_SECRET_ACCESS_KEY`  
**Value:** Tu Secret Access Key de R2  
**Dónde obtenerla:** Cloudflare Dashboard → R2 → Manage R2 API Tokens

#### 12. R2_BUCKET_NAME
**Name:** `R2_BUCKET_NAME`  
**Value:** Nombre de tu bucket R2  
**Ejemplo:** `highlight-tax-uploads`

#### 13. R2_PUBLIC_URL
**Name:** `R2_PUBLIC_URL`  
**Value:** URL pública de tu bucket (opcional)  
**Ejemplo:** `https://xxx.r2.cloudflarestorage.com`

**Environment para todas las R2:** ✅ Production, ✅ Preview, ✅ Development

---

## 📝 Pasos para Agregar en Vercel

### Paso 1: Acceder a Environment Variables

1. Ve a https://vercel.com/dashboard
2. Selecciona tu proyecto `highlight-tax-services`
3. Ve a **Settings** → **Environment Variables**

### Paso 2: Agregar Variables Obligatorias

Para cada variable obligatoria:

1. Haz clic en **Add New**
2. Ingresa el **Name** (ej: `DATABASE_URL`)
3. Pega el **Value** completo
4. Selecciona los **Environments**: ✅ Production, ✅ Preview, ✅ Development
5. Haz clic en **Save**

**Repite para:**
- ✅ `DATABASE_URL`
- ✅ `SESSION_SECRET`
- ✅ `NODE_ENV`

### Paso 3: Agregar Variables Recomendadas

Repite el proceso para:
- ⚠️ `RESEND_API_KEY` (si quieres emails)
- ⚠️ `VITE_APP_URL` (si quieres links en emails)
- ⚠️ `RESEND_FROM_EMAIL` (opcional, tiene default)

### Paso 4: Agregar Variables Opcionales

Solo si las necesitas:
- 🔐 `VITE_SUPABASE_URL` y `VITE_SUPABASE_ANON_KEY` (si usas OAuth)
- ☁️ Variables `R2_*` (si usas Cloudflare R2)

### Paso 5: Redeploy

Después de agregar todas las variables:

1. Ve a **Deployments**
2. Selecciona el último deployment
3. Haz clic en los tres puntos (...) → **Redeploy**
4. O ejecuta: `vercel --prod --yes`

---

## ✅ Checklist de Verificación

Después de configurar, verifica:

- [ ] `DATABASE_URL` está configurada con el pooler (`aws-0-us-east-1.pooler.supabase.com`)
- [ ] `SESSION_SECRET` tiene al menos 32 caracteres
- [ ] `NODE_ENV` está en `production`
- [ ] Todas las variables están asignadas a Production, Preview y Development
- [ ] Se hizo un redeploy después de agregar las variables
- [ ] Los logs de Vercel no muestran errores

---

## 🚨 Errores Comunes

### Error: "ENOTFOUND db.pfqzfretadqjzjbimvkv.supabase.co"
**Causa:** `DATABASE_URL` usa la conexión directa en lugar del pooler  
**Solución:** Cambia el host a `aws-0-us-east-1.pooler.supabase.com`

### Error: "SESSION_SECRET must be set"
**Causa:** `SESSION_SECRET` no está configurada o es muy corta  
**Solución:** Agrega `SESSION_SECRET` con al menos 32 caracteres

### Error: "Tenant or user not found"
**Causa:** Contraseña incorrecta en `DATABASE_URL`  
**Solución:** Verifica que la contraseña sea `R0CnJK4mKx9Mfj68`

---

## 📊 Resumen Rápido

**Mínimo necesario (3 variables):**
```
DATABASE_URL=postgresql://postgres.pfqzfretadqjzjbimvkv:R0CnJK4mKx9Mfj68@aws-0-us-east-1.pooler.supabase.com:6543/postgres
SESSION_SECRET=tu-secret-de-64-caracteres-hex
NODE_ENV=production
```

**Recomendado (6 variables):**
```
Las 3 anteriores +
RESEND_API_KEY=re_xxxxx
VITE_APP_URL=https://tu-dominio.com
RESEND_FROM_EMAIL=noreply@highlighttax.com
```

---

## 🔗 Enlaces Útiles

- **Vercel Dashboard**: https://vercel.com/dashboard
- **Supabase Dashboard**: https://supabase.com/dashboard/project/pfqzfretadqjzjbimvkv
- **Resend Dashboard**: https://resend.com/api-keys
- **Cloudflare R2**: https://dash.cloudflare.com



