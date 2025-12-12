# 🔍 Cómo Revisar los Logs de Runtime en Vercel

## ⚠️ IMPORTANTE: Los logs de BUILD no muestran errores de runtime

El build se completó exitosamente, pero el error `FUNCTION_INVOCATION_FAILED` ocurre cuando la función se **ejecuta**, no durante el build.

---

## 📋 Pasos para Ver los Logs de Runtime

### Opción 1: Desde el Deployment (Recomendado)

1. Ve a: **Vercel Dashboard** → **Deployments**
2. Haz clic en el **último deployment** (el que tiene el commit `77d6831`)
3. En la parte superior, verás varias pestañas:
   - **"Build Logs"** ← Este es el que ya viste (solo muestra el build)
   - **"Function Logs"** ← **ESTE es el que necesitas** (muestra errores de runtime)
   - **"Runtime Logs"** ← También útil
4. Haz clic en **"Function Logs"** o **"Runtime Logs"**
5. Busca errores que empiecen con:
   - `[API]`
   - `[Routes]`
   - `[App]`
   - `Error`
   - `FUNCTION_INVOCATION_FAILED`

### Opción 2: Desde Observability

1. Ve a: **Vercel Dashboard** → **Observability** (en el menú superior)
2. Selecciona tu proyecto
3. Ve a **"Logs"**
4. Filtra por:
   - **Function**: `api/index`
   - **Level**: `Error` o `All`
5. Busca los errores más recientes

---

## 🔍 Qué Buscar en los Logs

### Errores Comunes:

1. **"DATABASE_URL is required but not set"**
   - Aunque está configurada, puede que no se esté leyendo correctamente

2. **"SESSION_SECRET is required but not set"**
   - Similar al anterior

3. **"Cannot connect to database"**
   - Problema con la conexión a Supabase

4. **"Error initializing Express app"**
   - Error durante la inicialización

5. **"Error registering routes"**
   - Error al registrar las rutas

6. **"Storage no está inicializado"**
   - Problema con la inicialización del storage

---

## 📸 Qué Compartir

Si encuentras errores, comparte:

1. **El mensaje de error completo** (copia todo el bloque de error)
2. **El stack trace** (las líneas que dicen `at ...`)
3. **El timestamp** (hora del error)

Ejemplo de lo que necesito:
```
[API] ========== CRITICAL ERROR ==========
[API] Error initializing Express app: Cannot connect to database
[API] Error stack: 
  at Pool.connect (...)
  at ...
[API] Environment at error: {
  hasDatabaseUrl: true
  hasSessionSecret: true
  ...
}
```

---

## 🚀 Próximos Pasos

1. **Revisa los Function Logs** (no los Build Logs)
2. **Intenta acceder a `/admin` o hacer un registro** para generar un error reciente
3. **Copia el error completo** de los logs
4. **Compártelo** para que pueda ayudarte a solucionarlo

---

## 💡 Tip

Los logs de runtime se actualizan en tiempo real. Si haces una petición ahora (intenta acceder a `/admin`), deberías ver el error aparecer en los logs inmediatamente.

