# 🔒 Configuración de RLS (Row Level Security) para Supabase

## ⚠️ Situación Actual

Tu proyecto de Supabase muestra **10 mensajes críticos** indicando que RLS está deshabilitado en las siguientes tablas:

1. `public.activity_logs`
2. `public.appointments`
3. `public.auth_identities`
4. `public.contact_submissions`
5. `public.documents`
6. `public.messages`
7. `public.password_reset_tokens`
8. `public.sessions`
9. `public.tax_cases`
10. `public.users`

## 🎯 Solución

He creado el archivo `enable-rls-policies.sql` con todas las políticas RLS necesarias. Sin embargo, **hay un desafío importante**:

### ⚠️ Desafío: Autenticación Personalizada

Tu proyecto usa **autenticación JWT personalizada** (no Supabase Auth), lo que significa que las políticas RLS de Supabase no pueden acceder directamente a tu JWT.

### 📋 Opciones para Resolver Esto

#### Opción 1: Usar Service Role Key (Recomendado para Desarrollo)

Si tu aplicación usa el **Service Role Key** de Supabase para todas las consultas, las políticas RLS se pueden omitir temporalmente, pero esto **NO es seguro para producción**.

#### Opción 2: Configurar JWT Personalizado en Supabase

1. Ve a **Settings** → **API** en Supabase
2. Configura el **JWT Secret** para que coincida con tu `SESSION_SECRET`
3. Asegúrate de que tu JWT incluya el `user_id` en los claims
4. Las funciones en `enable-rls-policies.sql` deberían funcionar

#### Opción 3: Usar Cliente de Supabase con JWT

Modifica tu aplicación para usar el cliente de Supabase y pasar el JWT en cada petición:

```typescript
import { createClient } from '@supabase/supabase-js'

const supabase = createClient(
  SUPABASE_URL,
  SUPABASE_ANON_KEY,
  {
    global: {
      headers: {
        Authorization: `Bearer ${tuJWTToken}`
      }
    }
  }
)
```

#### Opción 4: Políticas Basadas en Variables de Sesión (Avanzado)

Crear una función que obtenga el `user_id` de una tabla de sesiones activas en lugar del JWT.

## 🚀 Pasos para Aplicar las Políticas

### Paso 1: Ejecutar el Script SQL

1. Abre el **SQL Editor** en Supabase Dashboard
2. Copia y pega el contenido de `enable-rls-policies.sql`
3. Ejecuta el script
4. Verifica que no haya errores

### Paso 2: Verificar que RLS Está Habilitado

1. Ve a **Table Editor** en Supabase
2. Selecciona cada tabla
3. Verifica que muestre **"RLS Enabled"** en lugar de **"RLS Disabled"**

### Paso 3: Probar las Políticas

1. Intenta hacer consultas desde tu aplicación
2. Verifica que los usuarios solo puedan acceder a sus propios datos
3. Verifica que los admins puedan acceder a todo

## 🔧 Ajustes Necesarios

### Si tu JWT usa un claim diferente

Si tu JWT almacena el `user_id` en un claim diferente (no `user_id`), ajusta la función `auth.user_id()` en el script SQL:

```sql
CREATE OR REPLACE FUNCTION auth.user_id()
RETURNS INTEGER AS $$
BEGIN
  -- Cambia 'user_id' por el nombre de tu claim
  RETURN (current_setting('request.jwt.claims', true)::json->>'id')::INTEGER;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;
```

### Si usas Service Role Key

Si tu aplicación usa el Service Role Key, las políticas RLS se omiten automáticamente. Esto significa que:

- ✅ Las políticas no bloquearán tus consultas
- ⚠️ Pero tampoco proporcionarán seguridad adicional
- ⚠️ **NO es recomendado para producción**

## 📝 Notas Importantes

1. **Desarrollo vs Producción**: En desarrollo, puedes deshabilitar RLS temporalmente si es necesario:
   ```sql
   ALTER TABLE public.users DISABLE ROW LEVEL SECURITY;
   ```

2. **Testing**: Después de aplicar las políticas, prueba todos los flujos de tu aplicación para asegurarte de que funcionan correctamente.

3. **Backup**: Antes de ejecutar el script, asegúrate de tener un backup de tu base de datos.

4. **Logs**: Si algo falla, revisa los logs de Supabase para ver qué políticas están bloqueando las consultas.

## 🆘 Solución de Problemas

### Error: "function auth.user_id() does not exist"

- Asegúrate de ejecutar todo el script SQL, incluyendo las funciones auxiliares al principio.

### Las políticas bloquean todas las consultas

- Verifica que tu JWT esté configurado correctamente en Supabase
- Verifica que el `user_id` esté presente en el JWT
- Temporalmente deshabilita RLS para debugging:
  ```sql
  ALTER TABLE public.tabla_name DISABLE ROW LEVEL SECURITY;
  ```

### Los mensajes críticos no desaparecen

- Espera unos minutos, a veces Supabase tarda en actualizar el estado
- Refresca la página del dashboard
- Verifica que RLS esté realmente habilitado en cada tabla

## 📚 Recursos Adicionales

- [Documentación de RLS en Supabase](https://supabase.com/docs/guides/auth/row-level-security)
- [Políticas RLS con JWT personalizado](https://supabase.com/docs/guides/auth/row-level-security#using-custom-jwt-claims)

---

**Después de aplicar estas políticas, los mensajes críticos deberían desaparecer del dashboard de Supabase.**


