# 🔐 Actualizar Contraseña de Base de Datos en Vercel

## ⚠️ IMPORTANTE: Nueva Contraseña

La contraseña de la base de datos ha sido actualizada a: `R0CnJK4mKx9Mfj68`

## 🔧 URLs Actualizadas

### Opción 1: Conexión Directa
```
postgresql://postgres:R0CnJK4mKx9Mfj68@db.pfqzfretadqjzjbimvkv.supabase.co:5432/postgres
```

### Opción 2: Pooler (Recomendado para Vercel)
```
postgresql://postgres.pfqzfretadqjzjbimvkv:R0CnJK4mKx9Mfj68@aws-0-us-east-1.pooler.supabase.com:6543/postgres
```

## 📋 Pasos para Actualizar en Vercel

1. **Ve a Vercel Dashboard:**
   - https://vercel.com/dashboard
   - Selecciona tu proyecto

2. **Settings → Environment Variables:**
   - Haz clic en **Settings**
   - Selecciona **Environment Variables**

3. **Editar DATABASE_URL:**
   - Busca la variable `DATABASE_URL`
   - Haz clic en los tres puntos (...) → **Edit**
   - Reemplaza la contraseña en la URL con: `R0CnJK4mKx9Mfj68`
   - O reemplaza toda la URL con una de las opciones de arriba
   - Asegúrate de que esté configurada para **Production, Preview, and Development**
   - Haz clic en **Save**

4. **Redeploy:**
   - Ve a **Deployments**
   - Selecciona el último deployment
   - Haz clic en los tres puntos (...) → **Redeploy**

## ✅ Verificación

Después del redeploy, verifica en los logs que:
- ✅ No hay errores de "Tenant or user not found"
- ✅ El login funciona correctamente
- ✅ Las consultas a la base de datos funcionan

## 🐛 Si Ves Error "Tenant or user not found"

Esto significa que la contraseña en `DATABASE_URL` no coincide con la nueva contraseña. Verifica que:
- ✅ La contraseña en la URL sea exactamente: `R0CnJK4mKx9Mfj68`
- ✅ No haya espacios extra en la URL
- ✅ La URL esté correctamente codificada (sin caracteres especiales mal codificados)



