# 🔍 Cómo Obtener la URL de Conexión Directa de Supabase

## Supabase tiene 2 tipos de conexión:

### 1. **Pooler (Recomendado para Vercel/Serverless)**
- **Puerto:** `6543` (Transaction mode) o `6544` (Session mode)
- **Host:** `aws-0-us-east-1.pooler.supabase.com`
- **Formato:** 
  ```
  postgresql://postgres.pfqzfretadqjzjbimvkv:[PASSWORD]@aws-0-us-east-1.pooler.supabase.com:6543/postgres
  ```

### 2. **Conexión Directa**
- **Puerto:** `5432`
- **Host:** `aws-0-us-east-1.pooler.supabase.com` (puede ser diferente)
- **Formato:**
  ```
  postgresql://postgres:[PASSWORD]@aws-0-us-east-1.pooler.supabase.com:5432/postgres
  ```
  O también:
  ```
  postgresql://postgres:[PASSWORD]@db.pfqzfretadqjzjbimvkv.supabase.co:5432/postgres
  ```

## 📍 Cómo Obtener la URL Correcta en Supabase

1. **Ve a Supabase Dashboard:**
   - https://supabase.com/dashboard/project/pfqzfretadqjzjbimvkv

2. **Settings → Database:**
   - Haz clic en tu proyecto
   - Ve a **Settings** (configuración)
   - Selecciona **Database**

3. **Connection String:**
   - Busca la sección **Connection string**
   - Verás diferentes opciones:
     - **URI** - Para uso general
     - **Transaction mode** - Para serverless (puerto 6543)
     - **Session mode** - Para conexiones persistentes (puerto 6544)
     - **Direct connection** - Para conexión directa (puerto 5432)

4. **Para Conexión Directa:**
   - Selecciona la pestaña **"Direct connection"** o **"Connection pooling: Direct connection"**
   - Copia la URL que aparece
   - Reemplaza `[YOUR-PASSWORD]` con tu contraseña real

## 🔧 Si el Error es "Tenant or user not found"

Esto puede significar:

1. **Contraseña incorrecta** - Verifica que la contraseña en la URL sea correcta
2. **Proyecto pausado** - Supabase pausa proyectos inactivos en el plan gratuito
3. **URL incorrecta** - El formato de la URL puede estar mal

## ✅ Verificar la Conexión

Para probar si la conexión funciona, ejecuta esto en tu terminal:

```bash
# Windows PowerShell
$env:DATABASE_URL="tu-url-aqui"
npm run db:check
```

Si funciona, la conexión está bien. Si no, verifica:
- ✅ La contraseña es correcta
- ✅ El proyecto no está pausado
- ✅ El formato de la URL es correcto

