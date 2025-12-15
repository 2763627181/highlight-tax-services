# Solución para Error de Certificado Fortinet - ERR_CERT_AUTHORITY_INVALID

## 🔴 Problema

**Error en Brave Browser:**
```
Se requiere un certificado raíz para "Fortinet", pero no está instalado.
Tu administrador de TI debe analizar las instrucciones de configuración de "Fortinet" 
para corregir este problema.

net::ERR_CERT_AUTHORITY_INVALID
```

**Causa:**
Fortinet (firewall/proxy corporativo) está interceptando las conexiones SSL/TLS hacia `highlighttax.com` pero su certificado raíz no está instalado en el navegador, causando que el navegador no confíe en la conexión.

---

## ✅ Solución 1: Instalar Certificado Raíz de Fortinet (Recomendado para Redes Corporativas)

### Paso 1: Obtener el Certificado Raíz

1. **Contacta a tu Administrador de TI** y solicita:
   - El certificado raíz de Fortinet (archivo `.crt` o `.pem`)
   - O las instrucciones para descargarlo desde el servidor Fortinet

2. **Si tienes acceso al servidor Fortinet:**
   - Accede al panel de administración de Fortinet
   - Ve a **System** > **Certificates** > **CA Certificates**
   - Descarga el certificado raíz de Fortinet

### Paso 2: Instalar en Windows

1. **Abre el archivo del certificado** (doble clic)
2. Haz clic en **"Install Certificate"**
3. Selecciona **"Current User"** o **"Local Machine"**
4. Selecciona **"Place all certificates in the following store"**
5. Haz clic en **"Browse"** y selecciona **"Trusted Root Certification Authorities"**
6. Haz clic en **"Next"** > **"Finish"**
7. Confirma con **"Yes"** en la advertencia de seguridad

### Paso 3: Instalar en Brave/Chrome

1. Abre Brave/Chrome
2. Ve a `brave://settings/security` o `chrome://settings/security`
3. Haz clic en **"Manage certificates"**
4. Ve a la pestaña **"Authorities"**
5. Haz clic en **"Import"**
6. Selecciona el archivo del certificado Fortinet
7. Marca **"Trust this certificate for identifying websites"**
8. Haz clic en **"OK"**

### Paso 4: Reiniciar Navegador

Cierra completamente Brave/Chrome y vuelve a abrirlo.

---

## ✅ Solución 2: Solicitar Whitelist del Dominio (Recomendado para Usuarios)

### Contactar Administrador de TI

**Email para enviar al Administrador de TI:**

```
Asunto: Solicitud de Whitelist para highlighttax.com

Estimado Administrador de TI,

Solicito que se agregue el dominio highlighttax.com a la lista blanca 
(whitelist) del firewall Fortinet.

Información del dominio:
- URL: https://highlighttax.com
- Tipo: Sitio web legítimo de servicios de impuestos
- Certificado SSL: Válido (emitido por Vercel/Let's Encrypt)
- IP: Configurada a través de Vercel DNS

El dominio está siendo bloqueado incorrectamente por Fortinet, causando 
el error ERR_CERT_AUTHORITY_INVALID. El sitio es legítimo y necesario 
para el trabajo.

Gracias por su atención.
```

---

## ✅ Solución 3: Usar Otra Red (Solución Temporal)

### Opciones:

1. **Usar datos móviles:**
   - Desconecta WiFi
   - Conecta datos móviles
   - Accede a `https://highlighttax.com`

2. **Usar red doméstica:**
   - Accede desde casa (fuera de la red corporativa)

3. **Usar VPN:**
   - Conecta a una VPN personal
   - Accede al sitio

---

## ✅ Solución 4: Configurar Excepción en Navegador (NO RECOMENDADO - Solo Temporal)

⚠️ **ADVERTENCIA:** Esta solución reduce la seguridad. Solo úsala como solución temporal.

### En Brave/Chrome:

1. Cuando veas el error, haz clic en **"Advanced"** o **"Avanzado"**
2. Haz clic en **"Proceed to highlighttax.com (unsafe)"** o **"Continuar al sitio"**
3. El navegador te advertirá - haz clic en **"Accept the Risk"**

**Nota:** Tendrás que hacer esto cada vez que accedas al sitio desde esta red.

---

## ✅ Solución 5: Verificar Configuración del Servidor

### Verificar en Vercel:

1. Ve a [Vercel Dashboard](https://vercel.com/dashboard)
2. Selecciona tu proyecto `highlight-tax-services`
3. Ve a **Settings** > **Domains**
4. Verifica que:
   - `highlighttax.com` esté listado
   - El certificado SSL esté **activo** (candado verde)
   - El estado sea **"Valid Configuration"**
   - No haya advertencias

### Verificar Certificado SSL:

1. Abre `https://highlighttax.com` en una red sin Fortinet
2. Haz clic en el **candado** en la barra de direcciones
3. Verifica que el certificado sea válido y emitido por:
   - **Let's Encrypt** (recomendado)
   - **Vercel**
   - O una autoridad certificadora reconocida

---

## 🔧 Configuración del Servidor para Mejorar Compatibilidad

### Headers SSL Mejorados

El servidor ya está configurado con:
- ✅ Helmet para headers de seguridad
- ✅ Content-Security-Policy
- ✅ Certificado SSL válido de Vercel
- ✅ HSTS (HTTP Strict Transport Security) configurado

### Verificar Headers SSL:

Puedes verificar los headers con:
```bash
curl -I https://highlighttax.com
```

Deberías ver:
```
Strict-Transport-Security: max-age=31536000; includeSubDomains; preload
Content-Security-Policy: ...
```

---

## 📋 Checklist de Verificación

- [ ] Certificado SSL activo en Vercel (candado verde)
- [ ] Dominio `highlighttax.com` configurado correctamente
- [ ] Sitio accesible desde otra red (verificar que funciona)
- [ ] Solicitud enviada al Administrador de TI para whitelist
- [ ] Certificado raíz de Fortinet instalado (si es necesario)

---

## 🆘 Si Nada Funciona

1. **Contacta al Administrador de TI:**
   - Solicita whitelist del dominio
   - Solicita instalación del certificado raíz de Fortinet
   - Proporciona esta documentación

2. **Verifica desde otra red:**
   - Si funciona en otra red, confirma que el problema es específico de Fortinet
   - Esto ayuda al Administrador de TI a entender el problema

3. **Contacta Soporte de Vercel:**
   - Si el certificado SSL no está activo en Vercel
   - Dashboard: https://vercel.com/dashboard

---

## 📝 Información Técnica para Administradores de TI

**Dominio:** `highlighttax.com`
**Tipo:** Sitio web legítimo de servicios profesionales
**Hosting:** Vercel (plataforma confiable)
**Certificado SSL:** Válido, emitido por Let's Encrypt/Vercel
**Categoría FortiGuard:** Debe ser "Business" o "Professional Services"
**IP:** Configurada dinámicamente por Vercel DNS

**Recomendación:**
- Agregar dominio a whitelist de Fortinet
- O configurar excepción SSL para este dominio específico
- Verificar que el certificado SSL del sitio no esté siendo interceptado incorrectamente

---

**Última actualización:** 2025-12-11



