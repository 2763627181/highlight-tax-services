# 🔧 Configurar Supabase para OAuth y Producción

## ⚠️ IMPORTANTE: Configuración Requerida en Supabase Dashboard

Para que OAuth funcione correctamente y los usuarios se registren en tu base de datos, necesitas configurar las URLs correctas en Supabase.

---

## 📍 Paso 1: Acceder a URL Configuration en Supabase

1. Ve a: **https://supabase.com/dashboard/project/pfqzfretadqjzjbimvkv/auth/url-configuration**
2. O navega: **Authentication** → **URL Configuration** (en el menú lateral)

---

## 🔧 Paso 2: Configurar Site URL

### Cambiar Site URL de `localhost:3000` a la URL de producción:

1. En la sección **"Site URL"**, encontrarás un campo de texto con: `http://localhost:3000`
2. **Reemplázalo** con:
   ```
   https://highlighttax.com
   ```
3. Haz clic en **"Save changes"** (botón verde)

**¿Por qué?** Esta es la URL por defecto que Supabase usa cuando no se especifica una redirect URL. Debe ser tu dominio de producción.

---

## 🔗 Paso 3: Agregar Redirect URLs

### Agregar las URLs permitidas para OAuth:

1. En la sección **"Redirect URLs"**, haz clic en el botón **"Add URL"** (verde)
2. Agrega estas URLs **una por una**:

#### URL 1: Callback de OAuth (Supabase)
```
https://highlighttax.com/auth/callback
```
- Esta es la URL a la que Supabase redirige después de autenticación OAuth
- Usada por: Google, GitHub, Apple login

#### URL 2: Callback de OIDC (si usas Replit Auth)
```
https://highlighttax.com/api/auth/oidc/callback
```
- Esta es la URL para OAuth con Replit Auth (OIDC)
- Solo necesaria si usas Replit Auth además de Supabase OAuth

#### URL 3: Para desarrollo local (opcional)
```
http://localhost:5000/auth/callback
```
- Solo si quieres probar OAuth localmente
- Puedes omitirla si solo pruebas en producción

3. Después de agregar cada URL, haz clic en **"Save changes"**

---

## ✅ Paso 4: Verificar Configuración

Después de configurar, deberías ver:

### Site URL:
```
https://highlighttax.com
```

### Redirect URLs:
```
✅ https://highlighttax.com/auth/callback
✅ https://highlighttax.com/api/auth/oidc/callback (si aplica)
```

---

## 🔐 Paso 5: Verificar Variables de Entorno en Vercel

Asegúrate de que estas variables estén configuradas en Vercel:

### Variables Requeridas:

1. **VITE_SUPABASE_URL**
   - Key: `VITE_SUPABASE_URL`
   - Value: `https://pfqzfretadqjzjbimvkv.supabase.co`
   - Environments: ✅ Production, ✅ Preview

2. **VITE_SUPABASE_ANON_KEY**
   - Key: `VITE_SUPABASE_ANON_KEY`
   - Value: `eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InBmcXpmcmV0YWRxanpqYmltdmt2Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3NjQ3MzE5MzksImV4cCI6MjA4MDMwNzkzOX0.0WqX6BqLXkTNwtuFcfwP9TSJvLGf9VKLSc7xRYIXMwM`
   - Environments: ✅ Production, ✅ Preview

3. **VITE_APP_URL**
   - Key: `VITE_APP_URL`
   - Value: `https://highlighttax.com`
   - Environments: ✅ Production, ✅ Preview

### Cómo verificar en Vercel:

1. Ve a: **https://vercel.com/dashboard**
2. Selecciona tu proyecto **highlight-tax-services**
3. Ve a **Settings** → **Environment Variables**
4. Verifica que las 3 variables estén listadas

---

## 🚀 Paso 6: Hacer Redeploy en Vercel

**IMPORTANTE**: Después de cambiar la configuración en Supabase, haz un redeploy en Vercel:

1. Ve a **Deployments** en Vercel
2. Haz clic en los **3 puntos** (⋯) del último deployment
3. Selecciona **"Redeploy"**
4. Espera a que termine

---

## 🧪 Paso 7: Probar OAuth

Después de configurar todo:

1. Ve a: **https://highlighttax.com/portal**
2. Haz clic en **"Continue with Google"** (o GitHub/Apple)
3. Deberías ser redirigido a Google para autenticación
4. Después de autenticarte, deberías volver a `https://highlighttax.com/auth/callback`
5. Finalmente, deberías ser redirigido a `/dashboard` o `/admin` según tu rol

---

## 🐛 Solución de Problemas

### Error: "redirect_uri_mismatch"

**Causa**: La URL de redirect no está en la lista de Redirect URLs permitidas en Supabase.

**Solución**:
1. Verifica que `https://highlighttax.com/auth/callback` esté en la lista de Redirect URLs
2. Asegúrate de que no haya espacios o caracteres extra
3. Haz clic en "Save changes" después de agregar

### Error: Redirige a `localhost:3000`

**Causa**: El Site URL en Supabase está configurado como `localhost:3000`.

**Solución**:
1. Cambia el Site URL a `https://highlighttax.com`
2. Haz clic en "Save changes"
3. Haz redeploy en Vercel

### Error: "Invalid redirect URL"

**Causa**: La URL de redirect no coincide exactamente con las configuradas.

**Solución**:
1. Verifica que la URL sea exactamente: `https://highlighttax.com/auth/callback`
2. No uses `http://` en producción, solo `https://`
3. No agregues trailing slash (`/`) al final

---

## 📋 Resumen de URLs a Configurar

### En Supabase Dashboard:

**Site URL:**
```
https://highlighttax.com
```

**Redirect URLs:**
```
https://highlighttax.com/auth/callback
https://highlighttax.com/api/auth/oidc/callback
```

### En Vercel Environment Variables:

```
VITE_SUPABASE_URL=https://pfqzfretadqjzjbimvkv.supabase.co
VITE_SUPABASE_ANON_KEY=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InBmcXpmcmV0YWRxanpqYmltdmt2Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3NjQ3MzE5MzksImV4cCI6MjA4MDMwNzkzOX0.0WqX6BqLXkTNwtuFcfwP9TSJvLGf9VKLSc7xRYIXMwM
VITE_APP_URL=https://highlighttax.com
```

---

## ✅ Checklist Final

Antes de probar OAuth, verifica:

- [ ] Site URL en Supabase está configurado como `https://highlighttax.com`
- [ ] Redirect URL `https://highlighttax.com/auth/callback` está agregada en Supabase
- [ ] `VITE_SUPABASE_URL` está configurada en Vercel
- [ ] `VITE_SUPABASE_ANON_KEY` está configurada en Vercel
- [ ] `VITE_APP_URL` está configurada en Vercel
- [ ] Se hizo redeploy en Vercel después de los cambios
- [ ] Probaste OAuth y funciona correctamente

---

## 🔗 Enlaces Útiles

- **Supabase Dashboard**: https://supabase.com/dashboard/project/pfqzfretadqjzjbimvkv
- **URL Configuration**: https://supabase.com/dashboard/project/pfqzfretadqjzjbimvkv/auth/url-configuration
- **Vercel Dashboard**: https://vercel.com/dashboard
- **Tu Aplicación**: https://highlighttax.com


