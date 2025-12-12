# 🚀 CONFIGURAR SUPABASE - PASO A PASO (MUY FÁCIL)

## ⚠️ IMPORTANTE: Esto SOLO se puede hacer desde el Dashboard de Supabase

No hay forma de hacerlo automáticamente. Debes hacerlo manualmente, pero es MUY fácil (2 minutos).

---

## 📍 PASO 1: Abrir la Configuración de URLs

**Haz clic en este enlace directo:**
👉 **https://supabase.com/dashboard/project/pfqzfretadqjzjbimvkv/auth/url-configuration**

O navega manualmente:
1. Ve a: https://supabase.com/dashboard
2. Inicia sesión si es necesario
3. Selecciona el proyecto: **2763627181's Project** (o el que corresponda)
4. En el menú lateral izquierdo, ve a: **Authentication** → **URL Configuration**

---

## 🔧 PASO 2: Cambiar Site URL (MUY IMPORTANTE)

### Lo que verás:
- Un campo de texto que dice **"Site URL"**
- Actualmente tiene: `http://localhost:3000` ❌

### Lo que debes hacer:
1. **Borra** el texto `http://localhost:3000`
2. **Escribe** exactamente esto:
   ```
   https://highlighttax.com
   ```
3. **NO** agregues una barra al final (`/`)
4. **NO** uses `http://`, solo `https://`

### Después:
- Haz clic en el botón verde **"Save changes"** que está debajo del campo

---

## 🔗 PASO 3: Agregar Redirect URLs

### Lo que verás:
- Una sección que dice **"Redirect URLs"**
- Probablemente dice **"No Redirect URLs"** o está vacía

### Lo que debes hacer:

#### Agregar Primera URL:
1. Haz clic en el botón verde **"Add URL"**
2. En el campo que aparece, escribe exactamente:
   ```
   https://highlighttax.com/auth/callback
   ```
3. Presiona **Enter** o haz clic fuera del campo
4. La URL debería aparecer en la lista

#### Agregar Segunda URL:
1. Haz clic en **"Add URL"** otra vez
2. Escribe exactamente:
   ```
   https://highlighttax.com/api/auth/oidc/callback
   ```
3. Presiona **Enter** o haz clic fuera del campo

### Después:
- Haz clic en **"Save changes"** (si hay un botón)

---

## ✅ PASO 4: Verificar que Todo Esté Correcto

### Deberías ver:

**Site URL:**
```
https://highlighttax.com
```

**Redirect URLs:**
```
✅ https://highlighttax.com/auth/callback
✅ https://highlighttax.com/api/auth/oidc/callback
```

---

## 🔐 PASO 5: Verificar Variables en Vercel

Asegúrate de que estas variables estén en Vercel:

### En Vercel Dashboard:
1. Ve a: https://vercel.com/dashboard
2. Selecciona tu proyecto
3. Ve a: **Settings** → **Environment Variables**

### Variables que DEBEN estar:

| Variable | Valor |
|----------|-------|
| `VITE_SUPABASE_URL` | `https://pfqzfretadqjzjbimvkv.supabase.co` |
| `VITE_SUPABASE_ANON_KEY` | `eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InBmcXpmcmV0YWRxanpqYmltdmt2Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3NjQ3MzE5MzksImV4cCI6MjA4MDMwNzkzOX0.0WqX6BqLXkTNwtuFcfwP9TSJvLGf9VKLSc7xRYIXMwM` |
| `VITE_APP_URL` | `https://highlighttax.com` |

### Si faltan:
- Haz clic en **"Add New"**
- Agrega cada una con los valores de arriba
- Marca ✅ **Production** y ✅ **Preview**
- Haz clic en **"Save"**

---

## 🚀 PASO 6: Hacer Redeploy en Vercel

**MUY IMPORTANTE**: Después de cambiar Supabase, haz redeploy:

1. Ve a: https://vercel.com/dashboard
2. Selecciona tu proyecto
3. Ve a la pestaña **"Deployments"**
4. Encuentra el último deployment
5. Haz clic en los **3 puntos** (⋯) a la derecha
6. Selecciona **"Redeploy"**
7. Espera a que termine (1-2 minutos)

---

## 🧪 PASO 7: Probar que Funciona

1. Ve a: **https://highlighttax.com/portal**
2. Haz clic en **"Continue with Google"** (o GitHub/Apple)
3. Deberías ser redirigido a Google para autenticación
4. Después de autenticarte, deberías volver a `https://highlighttax.com/auth/callback`
5. Finalmente, deberías ser redirigido a `/dashboard` o `/admin`

---

## ❌ Errores Comunes y Soluciones

### Error: "redirect_uri_mismatch"
**Causa**: La URL no está en la lista de Redirect URLs
**Solución**: Verifica que `https://highlighttax.com/auth/callback` esté agregada

### Error: Redirige a localhost:3000
**Causa**: Site URL todavía está en localhost
**Solución**: Cambia Site URL a `https://highlighttax.com`

### Error: "Invalid redirect URL"
**Causa**: URL mal escrita (espacios, http en vez de https, etc.)
**Solución**: Copia y pega exactamente las URLs de este documento

---

## 📋 Checklist Final

Antes de probar, verifica:

- [ ] Site URL en Supabase = `https://highlighttax.com`
- [ ] Redirect URL `https://highlighttax.com/auth/callback` agregada
- [ ] Redirect URL `https://highlighttax.com/api/auth/oidc/callback` agregada
- [ ] `VITE_SUPABASE_URL` configurada en Vercel
- [ ] `VITE_SUPABASE_ANON_KEY` configurada en Vercel
- [ ] `VITE_APP_URL` configurada en Vercel
- [ ] Redeploy hecho en Vercel
- [ ] Probaste OAuth y funciona

---

## 🆘 Si Tienes Problemas

1. **Verifica que copiaste las URLs exactamente** (sin espacios, con https://)
2. **Asegúrate de hacer "Save changes"** después de cada cambio
3. **Haz redeploy en Vercel** después de cambiar Supabase
4. **Espera 1-2 minutos** después de guardar cambios (puede tardar en propagarse)

---

## 🔗 Enlaces Directos

- **Configurar URLs en Supabase**: https://supabase.com/dashboard/project/pfqzfretadqjzjbimvkv/auth/url-configuration
- **Variables en Vercel**: https://vercel.com/dashboard (Settings → Environment Variables)
- **Tu Aplicación**: https://highlighttax.com

---

**⏱️ Tiempo estimado: 2-3 minutos**

¡Es muy fácil! Solo sigue los pasos uno por uno. 🚀


