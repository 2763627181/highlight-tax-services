# Guía de Seguridad - Highlight Tax Services

Este documento describe las medidas de seguridad implementadas en el sistema de Highlight Tax Services.

## Índice

1. [Visión General](#visión-general)
2. [Autenticación y Autorización](#autenticación-y-autorización)
3. [Protección de Datos](#protección-de-datos)
4. [Seguridad de API](#seguridad-de-api)
5. [Seguridad de Archivos](#seguridad-de-archivos)
6. [Seguridad WebSocket](#seguridad-websocket)
7. [Configuración de Producción](#configuración-de-producción)
8. [Monitoreo y Auditoría](#monitoreo-y-auditoría)
9. [Manejo de Incidentes](#manejo-de-incidentes)

---

## Visión General

### Modelo de Amenazas

El sistema maneja información tributaria sensible (PII), por lo que está diseñado para proteger contra:

- **Acceso no autorizado**: Mediante autenticación JWT robusta
- **Ataques de fuerza bruta**: Rate limiting por endpoint
- **Inyección SQL**: ORM con consultas parametrizadas
- **XSS (Cross-Site Scripting)**: Sanitización de entrada y headers CSP
- **CSRF (Cross-Site Request Forgery)**: Cookies SameSite=strict
- **Exposición de datos sensibles**: Encriptación en tránsito (HTTPS)
- **Subida de archivos maliciosos**: Validación de tipo MIME y extensión

### Principios de Seguridad

1. **Defensa en profundidad**: Múltiples capas de seguridad
2. **Mínimo privilegio**: Usuarios solo acceden a sus propios datos
3. **Fail secure**: Los errores no exponen información sensible
4. **Validación de entrada**: Toda entrada del usuario es validada

---

## Autenticación y Autorización

### Sistema de Autenticación Híbrido

El sistema soporta dos métodos de autenticación:

#### 1. Email/Contraseña (JWT)

```typescript
// Flujo de autenticación
1. Usuario envía credenciales → POST /api/auth/login
2. Servidor valida contraseña con bcrypt (12 rondas)
3. Se genera token JWT firmado con SESSION_SECRET
4. Token se almacena en cookie httpOnly
5. Token expira en 7 días
```

**Requisitos de contraseña**:
- Mínimo 8 caracteres
- Al menos 1 letra mayúscula
- Al menos 1 letra minúscula
- Al menos 1 número

#### 2. OAuth (Replit Auth)

Soporta login con:
- Google
- GitHub
- Apple

Vincula cuentas OAuth a usuarios locales mediante tabla `authIdentities`.

### Tokens JWT

**Configuración**:
```typescript
{
  httpOnly: true,        // No accesible desde JavaScript
  secure: true,          // Solo HTTPS en producción
  sameSite: "strict",    // Protección CSRF
  maxAge: 7 días,        // Expiración automática
  path: "/"              // Toda la aplicación
}
```

### Control de Acceso por Roles

| Rol | Permisos |
|-----|----------|
| client | Ver/editar sus propios datos, subir documentos, agendar citas |
| preparer | Todo lo de client + ver todos los clientes, gestionar casos |
| admin | Todo lo de preparer + estadísticas, configuración del sistema |

---

## Protección de Datos

### Datos Sensibles Manejados

- **PII (Información Personal)**:
  - Nombres completos
  - Direcciones
  - Números de teléfono
  - Direcciones de email

- **Información Tributaria**:
  - Números de Seguro Social (SSN) - campo encriptado
  - Formularios W-2 y 1099
  - Estados de cuenta bancarios
  - Declaraciones anteriores

### Medidas de Protección

1. **En Tránsito**: HTTPS forzado en producción
2. **En Reposo**: PostgreSQL con cifrado de disco
3. **Contraseñas**: Hash bcrypt con 12 rondas de sal
4. **SSN**: Campo separado con consideraciones especiales de acceso

### Sanitización de Datos

- Emails normalizados a minúsculas
- Nombres sanitizados (trim)
- HTML escapado en respuestas JSON
- Números de ID validados como enteros

---

## Seguridad de API

### Rate Limiting

| Endpoint | Límite | Ventana |
|----------|--------|---------|
| /api/auth/* | 5 req | 15 min |
| /api/contact | 3 req | 1 hora |
| /api/documents/upload | 10 req | 15 min |
| /api/messages | 30 req | 15 min |
| Global (/api/*) | 100 req | 15 min |

### Headers de Seguridad (Helmet)

```
Content-Security-Policy: default-src 'self'; script-src 'self' 'unsafe-inline' 'unsafe-eval'
X-Content-Type-Options: nosniff
X-Frame-Options: DENY
X-XSS-Protection: 1; mode=block
Strict-Transport-Security: max-age=31536000; includeSubDomains
```

### Validación de Entrada

Todas las entradas se validan con **Zod schemas**:

```typescript
// Ejemplo: Esquema de registro
const registerSchema = z.object({
  email: z.string().email().max(255).transform(toLowerCase),
  password: z.string().min(8).max(128).regex(...),
  name: z.string().min(2).max(100).transform(trim),
});
```

### Protección contra HPP

HTTP Parameter Pollution protection está habilitada para prevenir ataques de parámetros duplicados.

---

## Seguridad de Archivos

### Validación de Subidas

**Tipos MIME permitidos**:
- application/pdf
- image/jpeg
- image/png
- application/msword
- application/vnd.openxmlformats-officedocument.wordprocessingml.document

**Extensiones permitidas**: .pdf, .jpg, .jpeg, .png, .doc, .docx

**Tamaño máximo**: 10 MB

### Almacenamiento Seguro

- Archivos almacenados fuera de la raíz web (`/uploads`)
- Nombres de archivo sanitizados (caracteres especiales removidos)
- Nombres únicos generados (timestamp + random suffix)
- Descarga solo mediante endpoint autenticado

### Control de Acceso a Archivos

```typescript
// Solo propietario o admin pueden descargar
const isAdmin = user.role === "admin" || user.role === "preparer";
const isOwner = document.clientId === user.id;

if (!isAdmin && !isOwner) {
  return res.status(403).json({ message: "Acceso denegado" });
}
```

---

## Seguridad WebSocket

### Autenticación

- Token JWT separado de corta duración (1 hora)
- Token enviado como query parameter al conectar
- Verificación en cada conexión

### Límites de Seguridad

| Configuración | Valor |
|---------------|-------|
| Max conexiones por usuario | 5 |
| Max tamaño de mensaje | 1 KB |
| Heartbeat interval | 30 segundos |
| Token expiry | 1 hora |

### Manejo de Conexiones

```typescript
// Detección de conexiones muertas
setInterval(() => {
  clients.forEach(ws => {
    if (!ws.isAlive) {
      ws.terminate();
      return;
    }
    ws.isAlive = false;
    ws.ping();
  });
}, 30000);
```

---

## Configuración de Producción

### Variables de Entorno Requeridas

```bash
# Requerido - Clave para firmar tokens JWT
SESSION_SECRET="[min 32 caracteres, generado aleatoriamente]"

# Base de datos
DATABASE_URL="postgresql://..."

# Resend API (email)
# Configurado via Replit Integrations
```

### Generación de SESSION_SECRET

```bash
# Generar clave segura
node -e "console.log(require('crypto').randomBytes(64).toString('hex'))"
```

**Requisitos**:
- Mínimo 32 caracteres
- Generado criptográficamente
- Nunca en código fuente
- Rotar periódicamente

### Checklist de Producción

- [ ] SESSION_SECRET configurado (min 32 chars)
- [ ] HTTPS habilitado
- [ ] Rate limiting activo
- [ ] Logs de seguridad habilitados
- [ ] Backups de base de datos configurados
- [ ] Monitoreo de errores activo

---

## Monitoreo y Auditoría

### Logging de Actividad

Todas las acciones importantes se registran en `activityLogs`:

| Acción | Descripción |
|--------|-------------|
| user_registered | Nuevo usuario registrado |
| user_login | Inicio de sesión |
| document_uploaded | Documento subido |
| case_created | Caso tributario creado |
| case_updated | Caso actualizado |
| message_sent | Mensaje enviado |
| appointment_scheduled | Cita agendada |

### Logs de Servidor

```typescript
// Formato de log
"5:24:31 PM [express] GET /api/auth/me 401 in 3ms"

// Categorías
[express] - Peticiones HTTP
[websocket] - Conexiones WebSocket
[error] - Errores del sistema
```

### Métricas a Monitorear

1. **Intentos de login fallidos**: Detectar ataques de fuerza bruta
2. **Rate limit hits**: Posible abuso o ataque
3. **Errores 500**: Problemas del sistema
4. **Conexiones WebSocket**: Uso normal vs anómalo

---

## Manejo de Incidentes

### Tipos de Incidentes

#### Nivel 1 - Crítico
- Brecha de datos confirmada
- Acceso no autorizado a admin
- Compromiso de SESSION_SECRET

**Acciones**:
1. Revocar todos los tokens (cambiar SESSION_SECRET)
2. Notificar a usuarios afectados
3. Preservar logs para análisis
4. Reportar según regulaciones aplicables

#### Nivel 2 - Alto
- Múltiples intentos de login fallidos
- Rate limit excedido consistentemente
- Subida de archivo sospechoso

**Acciones**:
1. Bloquear IP temporalmente
2. Revisar logs de actividad
3. Contactar al usuario si es legítimo

#### Nivel 3 - Medio
- Errores de validación inusuales
- Patrones de uso anómalos

**Acciones**:
1. Monitorear comportamiento
2. Revisar logs
3. Ajustar rate limits si necesario

### Contactos de Emergencia

- **Soporte Técnico**: servicestaxx@gmail.com
- **Teléfono**: +1 917-257-4554

---

## Actualizaciones de Seguridad

### Proceso de Actualización

1. Mantener dependencias actualizadas (`npm audit`)
2. Revisar vulnerabilidades conocidas semanalmente
3. Aplicar parches de seguridad inmediatamente
4. Documentar todos los cambios de seguridad

### Historial de Versiones

| Versión | Fecha | Cambios |
|---------|-------|---------|
| 1.0.0 | 2024-12 | Implementación inicial de seguridad |

---

## Recursos Adicionales

- [OWASP Top 10](https://owasp.org/Top10/)
- [Node.js Security Best Practices](https://nodejs.org/en/docs/guides/security/)
- [Express.js Security Best Practices](https://expressjs.com/en/advanced/best-practice-security.html)

---

*Este documento debe revisarse y actualizarse cada 6 meses o después de cualquier incidente de seguridad.*
