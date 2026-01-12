# 🚨 Solución: Error ENOTFOUND en Vercel

## Error en los Logs

```
Error: getaddrinfo ENOTFOUND db.pfqzfretadqjzjbimvkv.supabase.co
```

## 🔍 Diagnóstico

El error `ENOTFOUND` significa que el sistema no puede resolver el hostname de la base de datos. Esto puede ocurrir porque:

1. El hostname `db.pfqzfretadqjzjbimvkv.supabase.co` no es accesible desde Vercel (puede estar bloqueado o no estar disponible para conexiones externas)
2. El proyecto de Supabase está pausado
3. La región o configuración del proyecto ha cambiado

### Opciones de Conexión

**Opción 1: Conexión Directa (Formato Clásico)**
```
postgresql://postgres:R0CnJK4mKx9Mfj68@db.pfqzfretadqjzjbimvkv.supabase.co:5432/postgres
```
⚠️ Si esta da error `ENOTFOUND`, usa la Opción 2.

**Opción 2: Pooler (Recomendado para Serverless)**
```
postgresql://postgres.pfqzfretadqjzjbimvkv:R0CnJK4mKx9Mfj68@aws-0-us-east-1.pooler.supabase.com:6543/postgres
```
✅ Esta es más confiable para entornos serverless como Vercel.

## 🔧 Solución Rápida

### Paso 1: Obtener la URL Correcta

**Si la conexión directa no funciona, usa el pooler:**

```
postgresql://postgres.pfqzfretadqjzjbimvkv:R0CnJK4mKx9Mfj68@aws-0-us-east-1.pooler.supabase.com:6543/postgres
```

**Componentes importantes:**
- Usuario: `postgres.pfqzfretadqjzjbimvkv` (con el project-ref)
- Contraseña: `R0CnJK4mKx9Mfj68` (tu contraseña de Supabase)
- Host: `aws-0-us-east-1.pooler.supabase.com` ⚠️ **CRÍTICO** (diferente al formato directo)
- Puerto: `6543` (pooler - recomendado) o `5432` (directo)
- Base de datos: `postgres`

**Nota:** Si prefieres usar la conexión directa (`db.pfqzfretadqjzjbimvkv.supabase.co`), pero da error `ENOTFOUND`, el hostname puede no estar disponible desde Vercel. En ese caso, el pooler es la solución.

### Paso 2: Actualizar en Vercel

1. **Ve a Vercel Dashboard:**
   - https://vercel.com/dashboard
   - Selecciona tu proyecto

2. **Settings → Environment Variables:**
   - Haz clic en **Settings**
   - Selecciona **Environment Variables**

3. **Editar DATABASE_URL:**
   - Busca `DATABASE_URL`
   - Haz clic en los tres puntos (...) → **Edit**
   - Reemplaza el valor con la URL correcta (arriba)
   - Asegúrate de que esté marcada para **Production, Preview, and Development**
   - Haz clic en **Save**

4. **Redeploy:**
   - Ve a **Deployments**
   - Selecciona el último deployment
   - Haz clic en los tres puntos (...) → **Redeploy**

### Paso 3: Verificar

Después del redeploy, verifica en los logs que:
- ✅ No aparece el error `ENOTFOUND`
- ✅ El login funciona correctamente
- ✅ Las consultas a la base de datos funcionan

## 📋 Checklist

- [ ] Si la conexión directa da `ENOTFOUND`, cambia al pooler (`aws-0-us-east-1.pooler.supabase.com`)
- [ ] El puerto es `6543` (pooler) o `5432` (directo)
- [ ] La contraseña es correcta
- [ ] El usuario incluye el project-ref si usas pooler (`postgres.pfqzfretadqjzjbimvkv`)
- [ ] La variable está configurada para Production, Preview y Development
- [ ] Se hizo un nuevo deploy después de actualizar

## 🔗 Obtener la URL desde Supabase Dashboard

Si no estás seguro de la URL correcta:

1. Ve a https://supabase.com/dashboard
2. Selecciona tu proyecto
3. Ve a **Settings** → **Database**
4. Scroll hasta **Connection string**
5. Selecciona la pestaña **URI**
6. Copia la URL y reemplaza `[YOUR-PASSWORD]` con tu contraseña
7. **Importante:** Usa el pooler (puerto 6543) para serverless como Vercel

## 💡 Diferencia entre Pooler y Directo

- **Pooler (puerto 6543):** Recomendado para serverless (Vercel, Netlify, etc.)
  - Maneja mejor las conexiones concurrentes
  - Más eficiente para funciones serverless
  - Formato: `aws-0-[region].pooler.supabase.com:6543`

- **Directo (puerto 5432):** Para conexiones persistentes
  - Mejor para servidores tradicionales
  - Formato: `aws-0-[region].pooler.supabase.com:5432` o `db.[project-ref].supabase.co:5432`

## 🆘 Si el Problema Persiste

1. **Verifica que el proyecto de Supabase esté activo:**
   - Ve a Supabase Dashboard
   - Asegúrate de que el proyecto no esté pausado

2. **Verifica la contraseña:**
   - La contraseña en `DATABASE_URL` debe coincidir con la de Supabase
   - Si olvidaste la contraseña, puedes resetearla en Settings → Database

3. **Verifica la región:**
   - El host debe coincidir con la región de tu proyecto
   - Si tu proyecto está en otra región, ajusta el host (ej: `aws-0-eu-west-1.pooler.supabase.com`)

4. **Revisa los logs de Vercel:**
   - Busca otros errores relacionados
   - Verifica que las variables de entorno estén cargadas correctamente

