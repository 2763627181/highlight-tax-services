# Debug: Página en Blanco

## Pasos para diagnosticar

1. **Abre la consola del navegador (F12)**
   - Ve a la pestaña "Console"
   - Revisa si hay errores en rojo

2. **Revisa la pestaña "Network"**
   - Verifica que todos los archivos JavaScript se estén cargando correctamente
   - Busca archivos con status 404 o errores

3. **Revisa si los chunks se están cargando:**
   - `/assets/index-*.js` (debe ser 200 OK)
   - `/assets/vendor-*.js` (deben ser 200 OK)
   - `/assets/index-*.css` (debe ser 200 OK)

4. **Si ves errores en la consola, compártelos**

## Posibles causas

1. **Error de JavaScript**: Un error no capturado puede prevenir el renderizado
2. **Chunks no encontrados**: Si los chunks tienen nombres diferentes, no se cargarán
3. **Error de importación**: Un módulo que no se puede importar
4. **Error de Supabase**: El código de Supabase podría estar causando un error

## Cambios recientes revertidos

- ✅ Fuentes de Google: Revertidas a versión original
- ✅ Auth check: Revertido a ejecución inmediata
- ✅ Code splitting: Revertido a configuración original

