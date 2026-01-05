# 📦 Configuración de Cloudflare R2 para Almacenamiento de Archivos

Esta guía explica cómo configurar Cloudflare R2 para almacenar archivos en la nube en lugar de almacenamiento local.

## 🔑 Variables de Entorno Requeridas

Agrega estas variables a tu archivo `.env`:

```env
# Cloudflare R2 Configuration
R2_ACCOUNT_ID=tu-account-id-de-cloudflare
R2_ACCESS_KEY_ID=tu-access-key-id
R2_SECRET_ACCESS_KEY=tu-secret-access-key
R2_BUCKET_NAME=nombre-de-tu-bucket
R2_PUBLIC_URL=https://tu-bucket.r2.dev  # Opcional: URL pública del bucket
```

## 📋 Cómo Obtener las Credenciales de R2

### 1. Crear una Cuenta de Cloudflare R2

1. Ve a [Cloudflare Dashboard](https://dash.cloudflare.com/)
2. Inicia sesión o crea una cuenta
3. Ve a **R2** en el menú lateral

### 2. Crear un Bucket

1. Haz clic en **"Create bucket"**
2. Ingresa un nombre para tu bucket (ej: `highlight-tax-documents`)
3. Selecciona una ubicación (recomendado: cercana a tus usuarios)
4. Haz clic en **"Create bucket"**

### 3. Obtener las Credenciales

1. En el dashboard de R2, ve a **"Manage R2 API Tokens"**
2. Haz clic en **"Create API token"**
3. Configura:
   - **Token name**: `highlight-tax-services` (o el nombre que prefieras)
   - **Permissions**: `Object Read & Write`
   - **Bucket access**: Selecciona tu bucket
4. Haz clic en **"Create API token"**
5. **Copia inmediatamente** las credenciales:
   - **Access Key ID**
   - **Secret Access Key**
   - **Account ID** (se encuentra en la URL del dashboard)

### 4. Obtener el Account ID

El Account ID se encuentra en la URL del dashboard de Cloudflare:
- URL: `https://dash.cloudflare.com/[ACCOUNT_ID]/r2`
- O ve a **Settings** > **Account ID** en el dashboard

## 🔧 Configurar Variables de Entorno

Agrega las variables a tu archivo `.env`:

```env
# Cloudflare R2
R2_ACCOUNT_ID=abc123def456...
R2_ACCESS_KEY_ID=1234567890abcdef...
R2_SECRET_ACCESS_KEY=abcdef1234567890...
R2_BUCKET_NAME=highlight-tax-documents
R2_PUBLIC_URL=https://highlight-tax-documents.r2.dev  # Opcional
```

## ✅ Cómo Funciona

### Modo de Funcionamiento

El sistema funciona de dos formas:

1. **Con R2 configurado** (Recomendado para producción):
   - Los archivos se suben directamente a Cloudflare R2
   - Se guarda la "key" de R2 en la base de datos
   - Las descargas generan URLs firmadas (válidas por 1 hora)
   - Los archivos temporales se eliminan después de subir

2. **Sin R2 configurado** (Fallback para desarrollo):
   - Los archivos se guardan localmente en `uploads/`
   - Se guarda la ruta local en la base de datos
   - Las descargas se sirven directamente del sistema de archivos

### Ventajas de Usar R2

- ✅ **Escalable**: Sin límites de almacenamiento
- ✅ **Rápido**: CDN global de Cloudflare
- ✅ **Económico**: Sin costos por egress hasta cierto límite
- ✅ **Compatible con S3**: Usa la misma API
- ✅ **Seguro**: URLs firmadas para acceso temporal

## 🔄 Migración de Archivos Existentes

Si ya tienes archivos almacenados localmente y quieres migrarlos a R2:

1. **Configura R2** (sigue los pasos de arriba)
2. **Los nuevos archivos** se subirán automáticamente a R2
3. **Los archivos antiguos** seguirán funcionando desde almacenamiento local
4. Para migrar archivos antiguos, necesitarías un script personalizado

## 🧪 Probar la Configuración

1. **Configura las variables de entorno** en tu `.env`
2. **Reinicia el servidor**:
   ```bash
   npm run dev
   ```
3. **Verifica los logs**:
   - Deberías ver: `[R2] Cloudflare R2 configurado correctamente`
   - Si no está configurado: `[R2] Cloudflare R2 no está configurado. Se usará almacenamiento local.`

4. **Sube un archivo de prueba**:
   - Inicia sesión como cliente
   - Sube un documento
   - Verifica en los logs: `[R2] Archivo subido a R2: documents/...`

5. **Descarga el archivo**:
   - Intenta descargar el documento
   - Debería redirigir a una URL firmada de R2

## 🔒 Seguridad

- **No expongas tus credenciales** en el código
- **Usa variables de entorno** siempre
- **Rota las credenciales periódicamente**
- **Las URLs firmadas expiran** después de 1 hora por defecto
- **Solo usuarios autenticados** pueden generar URLs firmadas

## 📚 Documentación Adicional

- [Cloudflare R2 Documentation](https://developers.cloudflare.com/r2/)
- [AWS S3 SDK Documentation](https://docs.aws.amazon.com/AWSJavaScriptSDK/v3/latest/clients/client-s3/)

