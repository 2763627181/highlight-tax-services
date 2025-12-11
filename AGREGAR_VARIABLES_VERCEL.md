# 🔧 Agregar Variables de Entorno en Vercel - PASO A PASO

## ⚠️ IMPORTANTE: Las variables deben estar a nivel de PROYECTO, no solo de equipo

---

## 📍 Paso 1: Ir a la Configuración del Proyecto

1. Ve a: https://vercel.com/dashboard
2. **Selecciona tu proyecto** `highlight-tax-services` (haz clic en el nombre del proyecto)
3. En el menú superior del proyecto, haz clic en **"Settings"**
4. En el menú lateral izquierdo, haz clic en **"Environment Variables"**

---

## 📝 Paso 2: Agregar Cada Variable

Para cada variable, sigue estos pasos:

### Variable 1: DATABASE_URL

1. Haz clic en **"Add New"** (o en el campo "Key")
2. **Key:** `DATABASE_URL`
3. **Value:** 
   ```
   postgresql://postgres.pfqzfretadqjzjbimvkv:sethum-2zAbpe-bismek@aws-0-us-east-1.pooler.supabase.com:6543/postgres
   ```
4. **Environments:** Selecciona ✅ **Production**, ✅ **Preview**, ✅ **Development**
5. Haz clic en **"Save"**

### Variable 2: SESSION_SECRET

1. Haz clic en **"Add New"**
2. **Key:** `SESSION_SECRET`
3. **Value:**
   ```
   +3cirGDu6qjFGdz2vWLu2QmurGYO8gD6zoYm+VFaKqYDAllT7QwUaeN9EwEyCW1t
   ```
4. **Environments:** Selecciona ✅ **Production**, ✅ **Preview**, ✅ **Development**
5. Haz clic en **"Save"**

### Variable 3: NODE_ENV

1. Haz clic en **"Add New"**
2. **Key:** `NODE_ENV`
3. **Value:** `production`
4. **Environments:** Selecciona ✅ **Production**, ✅ **Preview**
5. Haz clic en **"Save"**

### Variable 4: VITE_SUPABASE_URL

1. Haz clic en **"Add New"**
2. **Key:** `VITE_SUPABASE_URL`
3. **Value:**
   ```
   https://pfqzfretadqjzjbimvkv.supabase.co
   ```
4. **Environments:** Selecciona ✅ **Production**, ✅ **Preview**, ✅ **Development**
5. Haz clic en **"Save"**

### Variable 5: VITE_SUPABASE_ANON_KEY

1. Haz clic en **"Add New"**
2. **Key:** `VITE_SUPABASE_ANON_KEY`
3. **Value:**
   ```
   eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InBmcXpmcmV0YWRxanpqYmltdmt2Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3NjQ3MzE5MzksImV4cCI6MjA4MDMwNzkzOX0.0WqX6BqLXkTNwtuFcfwP9TSJvLGf9VKLSc7xRYIXMwM
   ```
4. **Environments:** Selecciona ✅ **Production**, ✅ **Preview**, ✅ **Development**
5. Haz clic en **"Save"**

### Variable 6: VITE_APP_URL

1. Haz clic en **"Add New"**
2. **Key:** `VITE_APP_URL`
3. **Value:**
   ```
   https://highlighttax.com
   ```
4. **Environments:** Selecciona ✅ **Production**, ✅ **Preview**
5. Haz clic en **"Save"**

### Variable 7: RESEND_API_KEY (Opcional pero recomendado)

1. Haz clic en **"Add New"**
2. **Key:** `RESEND_API_KEY`
3. **Value:**
   ```
   re_MgFRgznk_GA3J5Xn9A4GSWjBx6qp2pB3G
   ```
4. **Environments:** Selecciona ✅ **Production**, ✅ **Preview**
5. Haz clic en **"Save"**

### Variable 8: RESEND_FROM_EMAIL (Opcional pero recomendado)

1. Haz clic en **"Add New"**
2. **Key:** `RESEND_FROM_EMAIL`
3. **Value:**
   ```
   noreply@highlighttax.com
   ```
4. **Environments:** Selecciona ✅ **Production**, ✅ **Preview**
5. Haz clic en **"Save"**

---

## ✅ Paso 3: Verificar que Todas las Variables Estén Configuradas

Después de agregar todas las variables, deberías ver una lista con:

- ✅ DATABASE_URL
- ✅ SESSION_SECRET
- ✅ NODE_ENV
- ✅ VITE_SUPABASE_URL
- ✅ VITE_SUPABASE_ANON_KEY
- ✅ VITE_APP_URL
- ✅ RESEND_API_KEY (opcional)
- ✅ RESEND_FROM_EMAIL (opcional)

---

## 🚀 Paso 4: Hacer Redeploy (MUY IMPORTANTE)

**⚠️ CRÍTICO:** Después de agregar o modificar variables de entorno, DEBES hacer un redeploy:

1. Ve a la pestaña **"Deployments"** (en el menú superior del proyecto)
2. Encuentra el último deployment
3. Haz clic en los **3 puntos** (⋯) a la derecha del deployment
4. Selecciona **"Redeploy"**
5. En el diálogo que aparece, asegúrate de que esté seleccionado **"Use existing Build Cache"** (opcional, pero más rápido)
6. Haz clic en **"Redeploy"**
7. **Espera** a que el deployment termine (puede tomar 2-5 minutos)

---

## 🔍 Paso 5: Verificar que Funciona

### Opción 1: Probar el Health Check

1. Abre tu navegador
2. Ve a: `https://highlighttax.com/api/health`
3. Deberías ver algo como:
   ```json
   {
     "status": "ok",
     "timestamp": "2025-12-11T...",
     "database": "connected",
     "environment": "production"
   }
   ```

### Opción 2: Probar el Registro

1. Ve a tu sitio: `https://highlighttax.com`
2. Intenta registrarte con un nuevo usuario
3. Si funciona, el error debería desaparecer

---

## 🐛 Si Sigue Fallando

### Revisar los Logs de Vercel

1. Ve a **Deployments**
2. Haz clic en el último deployment
3. Haz clic en **"Functions"** o **"Logs"**
4. Busca errores que mencionen:
   - `DATABASE_URL must be set`
   - `SESSION_SECRET debe estar configurada`
   - `No se pudo conectar a la base de datos`

### Verificar que las Variables Estén en el Entorno Correcto

- Asegúrate de que las variables estén marcadas para **Production**
- Si solo están en Development, no funcionarán en producción

### Verificar el Formato de DATABASE_URL

La URL debe ser exactamente:
```
postgresql://postgres.pfqzfretadqjzjbimvkv:sethum-2zAbpe-bismek@aws-0-us-east-1.pooler.supabase.com:6543/postgres
```

**Importante:** Debe usar el puerto **6543** (Transaction mode) para Vercel.

---

## 📋 Checklist Final

Antes de considerar que está listo:

- [ ] Todas las variables están agregadas
- [ ] Todas las variables están marcadas para **Production**
- [ ] Se hizo un **Redeploy** después de agregar las variables
- [ ] El deployment se completó sin errores
- [ ] El endpoint `/api/health` responde correctamente
- [ ] El registro funciona sin errores

---

**Última actualización:** 2025-12-11

