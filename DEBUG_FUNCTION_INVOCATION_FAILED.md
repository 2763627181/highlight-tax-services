# 🐛 Debug: FUNCTION_INVOCATION_FAILED en /admin

## 🔍 Cómo Diagnosticar el Error

### Paso 1: Revisar Logs en Vercel

1. Ve a: https://vercel.com/dashboard
2. Selecciona tu proyecto `highlight-tax-services`
3. Ve a la pestaña **"Deployments"**
4. Haz clic en el último deployment
5. Haz clic en **"Functions"** o **"Logs"**
6. Busca errores que empiecen con `[API]`

### Paso 2: Buscar Estos Errores Específicos

#### Error: "SESSION_SECRET debe estar configurada"
**Solución**: Agregar `SESSION_SECRET` en Vercel Environment Variables

#### Error: "DATABASE_URL must be set"
**Solución**: Agregar `DATABASE_URL` en Vercel Environment Variables

#### Error: "Cannot connect to database"
**Solución**: Verificar que `DATABASE_URL` sea correcta y que Supabase esté activo

#### Error: "Storage no está inicializado"
**Solución**: Problema con la inicialización de la base de datos

---

## ✅ Checklist de Variables de Entorno

Verifica que TODAS estas variables estén en Vercel:

- [ ] `DATABASE_URL` - URL de Supabase
- [ ] `SESSION_SECRET` - Secret para JWT (mínimo 32 caracteres)
- [ ] `NODE_ENV` - Debe ser `production`
- [ ] `VITE_SUPABASE_URL` - URL de Supabase
- [ ] `VITE_SUPABASE_ANON_KEY` - Anon key de Supabase
- [ ] `VITE_APP_URL` - `https://highlighttax.com`

---

## 🔧 Solución Rápida

### Si el error es por variables faltantes:

1. Ve a: **Vercel Dashboard** → **Settings** → **Environment Variables**
2. Agrega las variables faltantes
3. Haz **Redeploy** (3 puntos del último deployment → Redeploy)

### Si el error es por inicialización:

1. Revisa los logs completos en Vercel
2. Busca el mensaje de error específico
3. Comparte el error completo para debugging

---

## 📋 Información que Necesito para Ayudarte

Si el problema persiste, comparte:

1. **Logs completos** de Vercel (copia todo el error)
2. **Variables configuradas** (solo los nombres, no los valores)
3. **Cuándo empezó** el error (¿después de algún cambio?)

---

## 🚀 Próximos Pasos

1. Revisa los logs en Vercel
2. Identifica el error específico
3. Si es por variables faltantes, agrégalas y haz redeploy
4. Si es otro error, comparte los logs para debugging


