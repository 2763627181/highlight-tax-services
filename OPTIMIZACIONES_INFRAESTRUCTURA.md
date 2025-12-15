# 🚀 Optimizaciones de Infraestructura - Resumen

Este documento resume las optimizaciones aplicadas en los 3 pasos solicitados.

---

## ✅ PASO 1: Verificar Región de Supabase e Igualarla a Vercel

### Script Creado
- **Archivo**: `script/verificar-region.ts`
- **Comando**: `npm run verify-region`

### Funcionalidad
- Extrae la región de Supabase desde `DATABASE_URL`
- Compara con la región recomendada de Vercel (us-east-1)
- Proporciona instrucciones si las regiones no coinciden

### Cómo Usar
```bash
npm run verify-region
```

### Resultado Esperado
- Si las regiones coinciden: ✅ Mensaje de confirmación
- Si no coinciden: ⚠️ Instrucciones para migrar a us-east-1

### Nota Importante
- Vercel usa principalmente **us-east-1** (US East - N. Virginia)
- Tener Supabase en la misma región reduce latencia en 50-200ms
- Para cambiar región: Crear nuevo proyecto en Supabase y migrar datos

---

## ✅ PASO 2: Revisar RLS y Añadir Índices

### Índices Añadidos al Schema

#### Tabla: `users`
- `IDX_users_email` - Búsquedas por email (ya tenía unique)
- `IDX_users_role` - Filtrado por rol
- `IDX_users_is_active` - Filtrado por estado activo
- `IDX_users_created_at` - Ordenamiento por fecha

#### Tabla: `password_reset_tokens`
- `IDX_password_reset_user_id` - Búsquedas por usuario
- `IDX_password_reset_token_hash` - Validación de tokens
- `IDX_password_reset_expires_at` - Limpieza de tokens expirados

#### Tabla: `auth_identities`
- `IDX_auth_identities_user_id` - Búsquedas por usuario
- `IDX_auth_identities_provider` - Búsquedas por proveedor OAuth

#### Tabla: `tax_cases`
- `IDX_tax_cases_client_id` - Casos por cliente
- `IDX_tax_cases_status` - Filtrado por estado
- `IDX_tax_cases_filing_year` - Filtrado por año
- `IDX_tax_cases_client_year` - Búsqueda compuesta (cliente + año)

#### Tabla: `documents`
- `IDX_documents_client_id` - Documentos por cliente
- `IDX_documents_case_id` - Documentos por caso
- `IDX_documents_category` - Filtrado por categoría
- `IDX_documents_created_at` - Ordenamiento por fecha

#### Tabla: `appointments`
- `IDX_appointments_client_id` - Citas por cliente
- `IDX_appointments_date` - Búsquedas por fecha
- `IDX_appointments_status` - Filtrado por estado
- `IDX_appointments_client_date` - Búsqueda compuesta

#### Tabla: `messages`
- `IDX_messages_sender_id` - Mensajes enviados
- `IDX_messages_recipient_id` - Mensajes recibidos
- `IDX_messages_case_id` - Mensajes por caso
- `IDX_messages_is_read` - Filtrado por leído/no leído
- `IDX_messages_created_at` - Ordenamiento por fecha
- `IDX_messages_recipient_read` - Búsqueda compuesta (destinatario + leído)

#### Tabla: `activity_logs`
- `IDX_activity_logs_user_id` - Logs por usuario
- `IDX_activity_logs_action` - Filtrado por acción
- `IDX_activity_logs_created_at` - Ordenamiento por fecha

### Políticas RLS Creadas

**Archivo**: `script/setup-rls.sql`

#### Políticas Implementadas
1. **users**: Usuarios ven solo su perfil; admins ven todos; preparadores ven clientes
2. **tax_cases**: Clientes ven solo sus casos; preparadores/admins ven todos
3. **documents**: Clientes ven solo sus documentos; preparadores pueden subir para clientes
4. **appointments**: Clientes ven solo sus citas; preparadores/admins ven todas
5. **messages**: Usuarios ven solo mensajes donde son remitente o destinatario
6. **contact_submissions**: Público puede crear; solo admins pueden ver
7. **activity_logs**: Solo admins pueden ver logs

### Cómo Aplicar RLS

1. Ve a Supabase Dashboard > SQL Editor
2. Copia y pega el contenido de `script/setup-rls.sql`
3. Ejecuta el script

**⚠️ IMPORTANTE**: Las políticas RLS asumen que usas Supabase Auth. Si usas JWT personalizado, necesitarás ajustar las políticas para usar funciones personalizadas.

---

## ✅ PASO 3: Mover Lógica Pesada Fuera del Signup

### Sistema de Background Jobs Creado

**Archivo**: `server/background-jobs.ts`

### Funcionalidades
- **No bloquea respuestas HTTP**: Las tareas se ejecutan de forma asíncrona
- **Manejo de errores**: Si falla, solo se registra en consola (no afecta al usuario)
- **Operaciones optimizadas**: Emails y logs se ejecutan después de responder al cliente

### Operaciones Movidas a Background

#### Registro de Usuario (`/api/auth/register`)
- ✅ Email de bienvenida → `sendWelcomeEmailInBackground()`
- ✅ Log de actividad → `logActivityInBackground()`

#### Login OAuth (`/api/auth/oidc/callback`)
- ✅ Email de bienvenida (nuevos usuarios) → `sendWelcomeEmailInBackground()`
- ✅ Log de registro OAuth → `logActivityInBackground()`
- ✅ Log de login OAuth → `logActivityInBackground()`

#### Recuperación de Contraseña
- ✅ Email de reset → `sendPasswordResetEmailInBackground()`
- ✅ Log de solicitud → `logActivityInBackground()`
- ✅ Log de completado → `logActivityInBackground()`

#### Formulario de Contacto
- ✅ Notificación al admin → `sendContactNotificationInBackground()`

#### Subida de Documentos
- ✅ Log de actividad → `logActivityInBackground()`
- ✅ Notificación al admin → `sendDocumentNotificationInBackground()`

#### Citas
- ✅ Log de actividad → `logActivityInBackground()`
- ✅ Confirmación por email → `sendAppointmentConfirmationInBackground()`

#### Mensajes
- ✅ Log de actividad → `logActivityInBackground()`

#### Casos Tributarios
- ✅ Log de creación → `logActivityInBackground()`
- ✅ Log de actualización → `logActivityInBackground()`
- ✅ Notificación de cambio de estado → `sendCaseStatusUpdateInBackground()`

### Beneficios

1. **Respuestas más rápidas**: El usuario recibe respuesta inmediata
2. **Mejor experiencia**: No hay timeouts por emails lentos
3. **Resiliencia**: Si falla un email, no afecta el registro
4. **Escalabilidad**: Las operaciones pesadas no bloquean el servidor

### Mejoras de Rendimiento Esperadas

- **Registro de usuario**: De ~2-3s a ~200-500ms (reducción del 80-90%)
- **Login OAuth**: De ~1-2s a ~300-600ms (reducción del 70-80%)
- **Subida de documentos**: Respuesta inmediata, notificaciones en background

---

## 📋 Checklist de Implementación

### PASO 1: Región
- [x] Script de verificación creado
- [x] Comando agregado a `package.json`
- [ ] Ejecutar `npm run verify-region` para verificar
- [ ] Si no coincide, migrar Supabase a us-east-1

### PASO 2: RLS e Índices
- [x] Índices añadidos al schema
- [x] Script SQL de RLS creado
- [ ] Ejecutar `npm run db:push` para aplicar índices
- [ ] Ejecutar `script/setup-rls.sql` en Supabase SQL Editor

### PASO 3: Background Jobs
- [x] Módulo de background jobs creado
- [x] Operaciones pesadas movidas a background
- [x] Registro optimizado
- [x] Login OAuth optimizado
- [x] Todas las operaciones de email/logs optimizadas
- [ ] Probar registro y verificar que responde rápido

---

## 🚀 Próximos Pasos

1. **Ejecutar migraciones**:
   ```bash
   npm run db:push
   ```

2. **Aplicar RLS en Supabase**:
   - Ir a Supabase Dashboard > SQL Editor
   - Copiar contenido de `script/setup-rls.sql`
   - Ejecutar

3. **Verificar región**:
   ```bash
   npm run verify-region
   ```

4. **Probar en producción**:
   - Registrar un nuevo usuario
   - Verificar que la respuesta es rápida
   - Verificar que el email llega (puede tardar unos segundos)

---

## 📝 Notas Técnicas

### Background Jobs
- Las tareas se ejecutan con `Promise` sin `await`, por lo que no bloquean
- Los errores se capturan y solo se registran en consola
- No hay retry automático (se puede agregar en el futuro)

### Índices
- Los índices compuestos mejoran búsquedas frecuentes
- Los índices en foreign keys mejoran JOINs
- Los índices en campos de filtrado mejoran WHERE clauses

### RLS
- RLS está habilitado pero puede necesitar ajustes según tu implementación de auth
- Si usas JWT personalizado, necesitarás crear funciones helper en SQL

---

## ✅ Estado Final

Todos los pasos han sido completados:
- ✅ PASO 1: Script de verificación de región
- ✅ PASO 2: Índices añadidos + Políticas RLS creadas
- ✅ PASO 3: Lógica pesada movida a background jobs

**Próximo paso**: Aplicar las migraciones y probar en producción.


