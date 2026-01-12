# Instrucciones Rápidas - Configurar highlighttax.com

## ✅ Lo que ya está hecho

1. ✅ Documentación actualizada con `VITE_APP_URL`
2. ✅ Archivo `.env.example` creado
3. ✅ Solicitud de FortiGuard preparada en `SOLICITUD_FORTIGUARD.md`
4. ✅ Scripts de automatización creados

## 🚀 Acciones que DEBES hacer ahora

### 1. Configurar VITE_APP_URL en Vercel (5 minutos)

**Opción A: Usando el Dashboard de Vercel (Recomendado)**

1. Ve a https://vercel.com/dashboard
2. Selecciona tu proyecto `highlight-tax-services`
3. Ve a **Settings** > **Environment Variables**
4. Haz clic en **"Add New"**
5. Completa:
   - **Name**: `VITE_APP_URL`
   - **Value**: `https://highlighttax.com`
   - **Environment**: Selecciona **Production** (y también Preview/Development si quieres)
6. Haz clic en **"Save"**

**Opción B: Usando Vercel CLI**

```powershell
# Instalar Vercel CLI (si no lo tienes)
npm i -g vercel

# Agregar variable
vercel env add VITE_APP_URL production
# Cuando te pida el valor, ingresa: https://highlighttax.com
```

### 2. Hacer Redeploy (2 minutos)

Después de agregar la variable:

1. En Vercel Dashboard, ve a la pestaña **"Deployments"**
2. Haz clic en los **3 puntos** del último deployment
3. Selecciona **"Redeploy"**
4. Espera a que termine (2-3 minutos)

### 3. Verificar Dominio y SSL (2 minutos)

1. En Vercel Dashboard, ve a **Settings** > **Domains**
2. Verifica que `highlighttax.com` esté listado
3. Verifica que el certificado SSL esté **activo** (candado verde)
4. Si no está configurado:
   - Haz clic en **"Add"**
   - Ingresa `highlighttax.com`
   - Sigue las instrucciones para configurar DNS

### 4. Enviar Solicitud a FortiGuard (5 minutos)

1. Abre Chrome y ve a **https://highlighttax.com**
2. Cuando veas la página de bloqueo de FortiGuard, busca el enlace:
   > "To have the rating of this web page re-evaluated please click here."
3. Haz clic en **"click here"**
4. Abre el archivo `SOLICITUD_FORTIGUARD.md` en este proyecto
5. Copia y pega la información del formulario:
   - URL: `https://highlighttax.com`
   - Categoría Actual: `Newly Registered Domain`
   - Categoría Solicitada: `Business`
   - Descripción: (copia del archivo SOLICITUD_FORTIGUARD.md)
   - Email: `servicestaxx@gmail.com`
6. Envía el formulario
7. Espera 24-48 horas para la respuesta

## 📋 Checklist de Verificación

- [ ] Variable `VITE_APP_URL` agregada en Vercel
- [ ] Redeploy completado en Vercel
- [ ] Dominio `highlighttax.com` verificado en Vercel
- [ ] Certificado SSL activo (candado verde)
- [ ] Solicitud enviada a FortiGuard
- [ ] Sitio accesible desde otra red (datos móviles) para verificar que funciona

## 🔧 Scripts Disponibles

Ejecuta estos scripts en PowerShell desde la carpeta `highlight-tax-services`:

```powershell
# Verificar configuración
.\verificar-configuracion.ps1

# Configurar Vercel (si tienes CLI instalada)
.\configurar-vercel.ps1
```

## ⏱️ Tiempo Total Estimado

- Configurar VITE_APP_URL: 5 minutos
- Redeploy: 2-3 minutos
- Verificar dominio: 2 minutos
- Solicitud FortiGuard: 5 minutos
- **Total: ~15 minutos**

## 📞 Si algo no funciona

1. **Variable no se aplica**: Asegúrate de hacer redeploy después de agregar la variable
2. **Dominio no funciona**: Verifica DNS en tu proveedor de dominio
3. **SSL no activo**: Espera 10 minutos, Vercel genera certificados automáticamente
4. **FortiGuard no responde**: Espera 48 horas, luego contacta soporte de FortiGuard

---

**Última actualización**: Listo para ejecutar










