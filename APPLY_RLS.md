# 🔒 Aplicar Políticas RLS en Supabase

## ⚠️ Importante

Para ejecutar las políticas RLS, necesitas la **Connection String** correcta de tu proyecto de Supabase.

## 📋 Pasos para Obtener la Connection String

1. **Ve a tu proyecto en Supabase Dashboard:**
   - https://supabase.com/dashboard/project/pfqzfretadqjzjbimvkv

2. **Ve a Settings → Database**

3. **Copia la "Connection String" (URI mode)**
   - Debe verse así: `postgresql://postgres.[ref]:[password]@[host]:[port]/postgres`

## 🚀 Opción 1: Ejecutar desde Terminal (Recomendado)

```powershell
# En PowerShell
$env:DATABASE_URL="tu-connection-string-aqui"
npx tsx script/enable-rls.ts
```

O si tienes un archivo `.env`:

```powershell
# Crea un archivo .env en la raíz del proyecto con:
DATABASE_URL=tu-connection-string-aqui

# Luego ejecuta:
npx tsx script/enable-rls.ts
```

## 🚀 Opción 2: Ejecutar desde Supabase SQL Editor (Más Fácil)

1. **Abre el SQL Editor en Supabase:**
   - https://supabase.com/dashboard/project/pfqzfretadqjzjbimvkv/sql/new

2. **Abre el archivo `enable-rls-policies.sql`** en tu editor

3. **Copia TODO el contenido** (Ctrl+A, Ctrl+C)

4. **Pega en el SQL Editor de Supabase** (Ctrl+V)

5. **Ejecuta** (haz clic en "Run" o presiona Ctrl+Enter)

6. **Verifica** que no haya errores

7. **Verifica en Table Editor** que todas las tablas muestren "RLS Enabled"

## ✅ Verificación

Después de ejecutar, verifica:

1. Ve al **Table Editor** en Supabase
2. Selecciona cada tabla una por una
3. Deberías ver **"RLS Enabled"** en lugar de **"RLS Disabled"**
4. Los **mensajes críticos deberían desaparecer** del dashboard

## 🆘 Si hay errores

- **"Tenant or user not found"**: La Connection String es incorrecta, obtén una nueva
- **"function already exists"**: Normal, las funciones ya existen, continúa
- **"policy already exists"**: Normal, las políticas ya existen, continúa

---

**Nota:** La Opción 2 (SQL Editor) es la más fácil y no requiere configuración local.


