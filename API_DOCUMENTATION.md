# API Documentation - Highlight Tax Services

Documentación completa de la API REST del sistema de servicios tributarios.

## Base URL

```
https://[your-domain]/api
```

## Autenticación

El sistema utiliza autenticación híbrida:
- **JWT (JSON Web Tokens)**: Para login con email/contraseña
- **OAuth 2.0**: Para login social (Google, GitHub, Apple)

### Headers de Autenticación

```http
Authorization: Bearer <token>
Cookie: token=<jwt_token>
```

---

## Tabla de Contenidos

1. [Autenticación](#autenticación-1)
2. [Clientes - Casos](#casos-tributarios)
3. [Clientes - Documentos](#documentos)
4. [Clientes - Citas](#citas)
5. [Clientes - Mensajes](#mensajes)
6. [Administración](#administración)
7. [Público](#endpoints-públicos)
8. [Códigos de Error](#códigos-de-error)
9. [Rate Limiting](#rate-limiting)

---

## Autenticación

### Registrar Usuario

Registra un nuevo usuario cliente en el sistema.

```http
POST /api/auth/register
```

**Rate Limit**: 5 intentos / 15 minutos

**Request Body**:
```json
{
  "email": "usuario@ejemplo.com",
  "password": "SecurePass123",
  "name": "Juan Pérez",
  "phone": "+1 917-555-0123"
}
```

| Campo | Tipo | Requerido | Validación |
|-------|------|-----------|------------|
| email | string | Sí | Email válido, máx 255 chars |
| password | string | Sí | Mín 8 chars, 1 mayúscula, 1 minúscula, 1 número |
| name | string | Sí | Mín 2 chars, máx 100 chars |
| phone | string | No | Máx 20 chars |

**Response (200)**:
```json
{
  "user": {
    "id": 1,
    "email": "usuario@ejemplo.com",
    "role": "client",
    "name": "Juan Pérez"
  }
}
```

**Cookies Set**:
- `token`: JWT válido por 7 días (httpOnly, secure, sameSite=strict)

**Errores**:
- `400`: Email ya registrado o validación fallida
- `429`: Demasiados intentos
- `500`: Error del servidor

---

### Iniciar Sesión

Autentica un usuario existente.

```http
POST /api/auth/login
```

**Rate Limit**: 5 intentos / 15 minutos

**Request Body**:
```json
{
  "email": "usuario@ejemplo.com",
  "password": "SecurePass123"
}
```

**Response (200)**:
```json
{
  "user": {
    "id": 1,
    "email": "usuario@ejemplo.com",
    "role": "client",
    "name": "Juan Pérez"
  }
}
```

**Cookies Set**:
- `token`: JWT válido por 7 días

**Errores**:
- `400`: Datos de validación inválidos
- `401`: Credenciales inválidas
- `429`: Demasiados intentos

---

### Obtener Usuario Actual

Obtiene información del usuario autenticado.

```http
GET /api/auth/me
```

**Requiere**: Autenticación

**Response (200)**:
```json
{
  "user": {
    "id": 1,
    "email": "usuario@ejemplo.com",
    "role": "client",
    "name": "Juan Pérez"
  }
}
```

**Errores**:
- `401`: Token no proporcionado
- `403`: Token inválido o expirado

---

### Cerrar Sesión

Cierra la sesión del usuario actual.

```http
POST /api/auth/logout
```

**Response (200)**:
```json
{
  "message": "Sesión cerrada exitosamente"
}
```

**Cookies Cleared**:
- `token`

---

### Token WebSocket

Obtiene un token de corta duración para conexión WebSocket.

```http
GET /api/auth/ws-token
```

**Requiere**: Autenticación

**Response (200)**:
```json
{
  "token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9..."
}
```

**Nota**: Token válido por 1 hora, solo para WebSocket.

---

## Casos Tributarios

### Listar Casos del Cliente

Obtiene todos los casos tributarios del cliente autenticado.

```http
GET /api/cases
```

**Requiere**: Autenticación (cliente)

**Response (200)**:
```json
[
  {
    "id": 1,
    "clientId": 5,
    "filingYear": 2024,
    "filingStatus": "married_filing_jointly",
    "dependents": 2,
    "status": "in_process",
    "finalAmount": null,
    "notes": "En revisión de documentos",
    "createdAt": "2024-01-15T10:30:00Z",
    "updatedAt": "2024-01-20T14:00:00Z"
  }
]
```

**Estados de Caso**:
| Estado | Descripción |
|--------|-------------|
| pending | Pendiente - Esperando documentos |
| in_process | En proceso de preparación |
| sent_to_irs | Enviado al IRS |
| approved | Aprobado por el IRS |
| refund_issued | Reembolso emitido |

---

## Documentos

### Listar Documentos del Cliente

Obtiene todos los documentos del cliente autenticado.

```http
GET /api/documents
```

**Requiere**: Autenticación (cliente)

**Response (200)**:
```json
[
  {
    "id": 1,
    "caseId": 1,
    "clientId": 5,
    "fileName": "w2_2024.pdf",
    "filePath": "/uploads/1704123456789-w2_2024.pdf",
    "fileType": "application/pdf",
    "fileSize": 102400,
    "category": "w2",
    "description": "W-2 de empleador principal",
    "uploadedById": 5,
    "isFromPreparer": false,
    "createdAt": "2024-01-15T10:30:00Z"
  }
]
```

**Categorías de Documentos**:
| Categoría | Descripción |
|-----------|-------------|
| id_document | Documento de identificación |
| w2 | Formulario W-2 |
| form_1099 | Formularios 1099 |
| bank_statement | Estados de cuenta bancarios |
| receipt | Recibos y comprobantes |
| previous_return | Declaraciones anteriores |
| social_security | Tarjeta de seguro social |
| proof_of_address | Comprobante de domicilio |
| other | Otros documentos |

---

### Subir Documento

Sube un nuevo documento al sistema.

```http
POST /api/documents/upload
Content-Type: multipart/form-data
```

**Rate Limit**: 10 archivos / 15 minutos

**Requiere**: Autenticación (cliente)

**Form Data**:
| Campo | Tipo | Requerido | Descripción |
|-------|------|-----------|-------------|
| file | File | Sí | Archivo a subir |
| category | string | No | Categoría del documento |
| description | string | No | Descripción opcional |
| caseId | number | No | ID del caso asociado |

**Tipos de Archivo Permitidos**:
- PDF (application/pdf)
- JPEG (image/jpeg)
- PNG (image/png)
- Word (application/msword, application/vnd.openxmlformats-officedocument.wordprocessingml.document)

**Tamaño Máximo**: 10 MB

**Response (200)**:
```json
{
  "id": 1,
  "fileName": "w2_2024.pdf",
  "category": "w2",
  "message": "Documento subido exitosamente"
}
```

**Errores**:
- `400`: Tipo de archivo no permitido o sin archivo
- `413`: Archivo demasiado grande
- `429`: Límite de subida alcanzado

---

### Descargar Documento

Descarga un documento específico.

```http
GET /api/documents/:id/download
```

**Requiere**: Autenticación (cliente dueño o admin)

**Parámetros URL**:
| Parámetro | Tipo | Descripción |
|-----------|------|-------------|
| id | number | ID del documento |

**Response**: Archivo binario con headers apropiados

**Headers de Respuesta**:
```http
Content-Type: application/pdf
Content-Disposition: attachment; filename="documento.pdf"
```

**Errores**:
- `403`: No tiene permiso para este documento
- `404`: Documento no encontrado

---

## Citas

### Listar Citas del Cliente

Obtiene todas las citas del cliente autenticado.

```http
GET /api/appointments
```

**Requiere**: Autenticación (cliente)

**Response (200)**:
```json
[
  {
    "id": 1,
    "clientId": 5,
    "appointmentDate": "2024-02-15T14:00:00Z",
    "status": "scheduled",
    "notes": "Consulta inicial de impuestos 2023",
    "createdAt": "2024-01-10T10:00:00Z"
  }
]
```

**Estados de Cita**:
| Estado | Descripción |
|--------|-------------|
| scheduled | Cita programada |
| completed | Cita completada |
| cancelled | Cita cancelada |

---

### Agendar Cita

Programa una nueva cita.

```http
POST /api/appointments
```

**Requiere**: Autenticación (cliente)

**Request Body**:
```json
{
  "appointmentDate": "2024-02-15T14:00:00Z",
  "notes": "Consulta para declaración 2023"
}
```

**Validación**:
- La fecha debe ser futura
- No puede haber conflicto con citas existentes (±30 minutos)
- Horario de oficina recomendado: 9 AM - 6 PM

**Response (200)**:
```json
{
  "id": 1,
  "clientId": 5,
  "appointmentDate": "2024-02-15T14:00:00Z",
  "status": "scheduled",
  "notes": "Consulta para declaración 2023",
  "createdAt": "2024-01-10T10:00:00Z"
}
```

**Errores**:
- `400`: Fecha inválida o en el pasado
- `409`: Conflicto de horario con otra cita

---

## Mensajes

### Listar Mensajes

Obtiene los mensajes del usuario autenticado.

```http
GET /api/messages
```

**Requiere**: Autenticación

**Query Parameters**:
| Parámetro | Tipo | Descripción |
|-----------|------|-------------|
| caseId | number | Filtrar por caso específico |

**Response (200)**:
```json
[
  {
    "id": 1,
    "caseId": 1,
    "senderId": 5,
    "recipientId": 1,
    "message": "Hola, tengo una pregunta sobre mi W-2",
    "isRead": false,
    "createdAt": "2024-01-15T10:30:00Z"
  }
]
```

---

### Enviar Mensaje

Envía un mensaje a otro usuario.

```http
POST /api/messages
```

**Rate Limit**: 30 mensajes / 15 minutos

**Requiere**: Autenticación

**Request Body**:
```json
{
  "recipientId": 1,
  "message": "Hola, tengo una pregunta sobre mi declaración",
  "caseId": 1
}
```

| Campo | Tipo | Requerido | Validación |
|-------|------|-----------|------------|
| recipientId | number | Sí | ID de usuario válido |
| message | string | Sí | Mín 1 char, máx 5000 chars |
| caseId | number | No | ID de caso válido |

**Response (200)**:
```json
{
  "id": 1,
  "senderId": 5,
  "recipientId": 1,
  "message": "Hola, tengo una pregunta sobre mi declaración",
  "caseId": 1,
  "isRead": false,
  "createdAt": "2024-01-15T10:30:00Z"
}
```

**Side Effects**:
- Envía notificación WebSocket al destinatario
- Registra actividad en log

---

### Marcar Mensaje como Leído

Marca un mensaje específico como leído.

```http
PATCH /api/messages/:id/read
```

**Requiere**: Autenticación (destinatario del mensaje)

**Response (200)**:
```json
{
  "message": "Mensaje marcado como leído"
}
```

---

## Administración

Todos los endpoints de administración requieren rol `admin` o `preparer`.

### Estadísticas del Dashboard

Obtiene estadísticas generales del sistema.

```http
GET /api/admin/stats
```

**Requiere**: Admin/Preparer

**Response (200)**:
```json
{
  "totalClients": 150,
  "totalCases": 320,
  "pendingCases": 45,
  "completedCases": 200,
  "totalAppointments": 89,
  "upcomingAppointments": 12,
  "totalDocuments": 1500,
  "recentContacts": 5
}
```

---

### Listar Clientes

Obtiene lista de todos los clientes con conteos.

```http
GET /api/admin/clients
```

**Requiere**: Admin/Preparer

**Response (200)**:
```json
[
  {
    "id": 5,
    "email": "cliente@ejemplo.com",
    "name": "María García",
    "phone": "+1 917-555-0123",
    "createdAt": "2024-01-01T00:00:00Z",
    "documentCount": 8,
    "caseCount": 2
  }
]
```

---

### Detalle de Cliente

Obtiene información completa de un cliente específico.

```http
GET /api/admin/clients/:id
```

**Requiere**: Admin/Preparer

**Response (200)**:
```json
{
  "client": {
    "id": 5,
    "email": "cliente@ejemplo.com",
    "name": "María García",
    "phone": "+1 917-555-0123",
    "address": "123 Main St",
    "city": "New York",
    "state": "NY",
    "zipCode": "10001"
  },
  "documents": [...],
  "cases": [...],
  "appointments": [...]
}
```

---

### Listar Todos los Casos

Obtiene todos los casos tributarios del sistema.

```http
GET /api/admin/cases
```

**Requiere**: Admin/Preparer

**Response (200)**:
```json
[
  {
    "id": 1,
    "clientId": 5,
    "filingYear": 2024,
    "status": "in_process",
    "clientName": "María García",
    "clientEmail": "cliente@ejemplo.com"
  }
]
```

---

### Crear Caso

Crea un nuevo caso tributario para un cliente.

```http
POST /api/admin/cases
```

**Requiere**: Admin/Preparer

**Request Body**:
```json
{
  "clientId": 5,
  "filingYear": "2024",
  "filingStatus": "married_filing_jointly",
  "dependents": 2
}
```

**Response (200)**:
```json
{
  "id": 1,
  "clientId": 5,
  "filingYear": 2024,
  "status": "pending"
}
```

---

### Actualizar Caso

Actualiza el estado o notas de un caso.

```http
PATCH /api/admin/cases/:id
```

**Requiere**: Admin/Preparer

**Request Body**:
```json
{
  "status": "in_process",
  "notes": "Documentos recibidos, iniciando preparación",
  "finalAmount": 2500.00
}
```

| Campo | Tipo | Valores Permitidos |
|-------|------|-------------------|
| status | string | pending, in_progress, review, completed, filed |
| notes | string | Máx 2000 caracteres |
| finalAmount | number | Monto del reembolso/pago |

**Response (200)**:
```json
{
  "id": 1,
  "status": "in_process",
  "notes": "Documentos recibidos, iniciando preparación",
  "updatedAt": "2024-01-20T14:00:00Z"
}
```

**Side Effects**:
- Envía email de actualización al cliente
- Envía notificación WebSocket

---

### Listar Todas las Citas

Obtiene todas las citas programadas.

```http
GET /api/admin/appointments
```

**Requiere**: Admin/Preparer

**Response (200)**:
```json
[
  {
    "id": 1,
    "clientId": 5,
    "clientName": "María García",
    "appointmentDate": "2024-02-15T14:00:00Z",
    "status": "scheduled",
    "notes": "Consulta inicial"
  }
]
```

---

### Listar Todos los Documentos

Obtiene todos los documentos del sistema.

```http
GET /api/admin/documents
```

**Requiere**: Admin/Preparer

**Response (200)**:
```json
[
  {
    "id": 1,
    "clientId": 5,
    "clientName": "María García",
    "fileName": "w2_2024.pdf",
    "category": "w2",
    "createdAt": "2024-01-15T10:30:00Z"
  }
]
```

---

### Listar Contactos

Obtiene envíos del formulario de contacto público.

```http
GET /api/admin/contacts
```

**Requiere**: Admin/Preparer

**Response (200)**:
```json
[
  {
    "id": 1,
    "name": "Juan Pérez",
    "email": "juan@ejemplo.com",
    "phone": "+1 917-555-0123",
    "service": "Impuestos Personales",
    "message": "Me interesa información sobre sus servicios",
    "createdAt": "2024-01-15T10:30:00Z"
  }
]
```

---

## Endpoints Públicos

### Enviar Formulario de Contacto

Envía un mensaje desde el formulario de contacto público.

```http
POST /api/contact
```

**Rate Limit**: 3 envíos / hora

**No requiere autenticación**

**Request Body**:
```json
{
  "name": "Juan Pérez",
  "email": "juan@ejemplo.com",
  "phone": "+1 917-555-0123",
  "service": "Impuestos Personales",
  "message": "Me interesa información sobre sus servicios de preparación de impuestos"
}
```

| Campo | Tipo | Requerido |
|-------|------|-----------|
| name | string | Sí |
| email | string | Sí |
| phone | string | No |
| service | string | No |
| message | string | Sí |

**Response (200)**:
```json
{
  "message": "Gracias por contactarnos. Responderemos pronto."
}
```

**Side Effects**:
- Envía notificación por email al administrador
- Almacena en base de datos

---

## OAuth Endpoints

### Iniciar Login OAuth

Redirige al proveedor OAuth seleccionado.

```http
GET /api/login
```

**Proveedores Soportados**: Google, GitHub, Apple

**Redirect**: Al proveedor OAuth para autenticación

---

### Callback OAuth

Procesa el callback del proveedor OAuth.

```http
GET /api/callback
```

**Parámetros**: Proporcionados por el proveedor OAuth

**Resultado**: Redirección a `/portal` o `/admin` según el rol

---

### Obtener Usuario OAuth

Obtiene información del usuario autenticado vía OAuth.

```http
GET /api/@me
```

**Response (200)**:
```json
{
  "id": 5,
  "email": "usuario@gmail.com",
  "name": "Juan Pérez",
  "role": "client",
  "provider": "google"
}
```

---

## Códigos de Error

| Código | Descripción |
|--------|-------------|
| 400 | Bad Request - Datos de entrada inválidos |
| 401 | Unauthorized - Token no proporcionado |
| 403 | Forbidden - Token inválido o permisos insuficientes |
| 404 | Not Found - Recurso no encontrado |
| 409 | Conflict - Conflicto (ej: email duplicado, horario ocupado) |
| 413 | Payload Too Large - Archivo demasiado grande |
| 429 | Too Many Requests - Rate limit excedido |
| 500 | Internal Server Error - Error del servidor |

**Formato de Error**:
```json
{
  "message": "Descripción del error",
  "errors": ["Detalle 1", "Detalle 2"]
}
```

---

## Rate Limiting

El sistema implementa rate limiting por endpoint para proteger contra abuso:

| Endpoint | Límite | Ventana |
|----------|--------|---------|
| /api/auth/* | 5 intentos | 15 minutos |
| /api/documents/upload | 10 archivos | 15 minutos |
| /api/contact | 3 envíos | 1 hora |
| /api/messages | 30 mensajes | 15 minutos |

**Headers de Rate Limit**:
```http
X-RateLimit-Limit: 5
X-RateLimit-Remaining: 3
X-RateLimit-Reset: 1704123456
```

**Respuesta cuando se excede**:
```json
{
  "message": "Demasiados intentos. Intente de nuevo en 15 minutos.",
  "retryAfter": 15
}
```

---

## WebSocket API

### Conexión

```javascript
const ws = new WebSocket('wss://[domain]/ws?token=<ws_token>');
```

**Autenticación**: Token obtenido de `/api/auth/ws-token`

### Eventos Recibidos

```json
{
  "type": "new_message",
  "data": {
    "id": 1,
    "senderId": 5,
    "message": "Nuevo mensaje"
  }
}
```

```json
{
  "type": "case_update",
  "data": {
    "caseId": 1,
    "status": "approved"
  }
}
```

### Límites WebSocket

- Máximo 5 conexiones por usuario
- Tamaño máximo de mensaje: 1 KB
- Heartbeat cada 30 segundos

---

## Ejemplos de Uso

### cURL - Registro

```bash
curl -X POST https://example.com/api/auth/register \
  -H "Content-Type: application/json" \
  -d '{
    "email": "usuario@ejemplo.com",
    "password": "SecurePass123",
    "name": "Juan Pérez"
  }'
```

### cURL - Subir Documento

```bash
curl -X POST https://example.com/api/documents/upload \
  -H "Cookie: token=eyJhbGciOiJIUzI1..." \
  -F "file=@/path/to/w2.pdf" \
  -F "category=w2" \
  -F "description=W-2 del año 2024"
```

### JavaScript - Fetch

```javascript
// Login
const response = await fetch('/api/auth/login', {
  method: 'POST',
  headers: { 'Content-Type': 'application/json' },
  credentials: 'include',
  body: JSON.stringify({
    email: 'usuario@ejemplo.com',
    password: 'SecurePass123'
  })
});

const data = await response.json();
console.log(data.user);
```

---

*Documentación generada para Highlight Tax Services v1.0.0*
*Última actualización: Diciembre 2024*
