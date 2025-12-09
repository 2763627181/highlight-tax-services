/**
 * @fileoverview Servicio de Email de Highlight Tax Services
 * 
 * Este módulo proporciona funcionalidades de envío de correos electrónicos
 * transaccionales usando la integración de Resend con Replit.
 * 
 * @module server/email
 * @version 1.0.0
 * 
 * ## Tipos de Emails
 * - Notificaciones de formulario de contacto
 * - Emails de bienvenida a nuevos usuarios
 * - Notificaciones de documentos subidos
 * - Actualizaciones de estado de casos
 * - Confirmaciones de citas
 * 
 * ## Características
 * - Integración con Resend via Replit Connectors
 * - Plantillas HTML bilingües (inglés/español)
 * - Manejo de errores no bloqueante
 * - Notificación dual (cliente + admin) donde aplica
 * 
 * ## Configuración
 * La API key de Resend se obtiene automáticamente de Replit Connectors.
 * No requiere configuración manual de credenciales.
 * 
 * @example
 * import { sendWelcomeEmail } from './email';
 * 
 * // Enviar email de bienvenida
 * await sendWelcomeEmail({
 *   name: 'Juan Pérez',
 *   email: 'juan@example.com'
 * });
 */

import { Resend } from 'resend';

// =============================================================================
// CONFIGURACIÓN
// =============================================================================

/**
 * Almacena temporalmente la configuración de conexión
 * Se obtiene de Replit Connectors o de variables de entorno
 */
let connectionSettings: {
  settings: {
    api_key: string;
    from_email?: string;
  };
} | null = null;

/**
 * Email del administrador para recibir notificaciones
 * Todas las alertas del sistema se envían a esta dirección
 */
const ADMIN_EMAIL = 'servicestaxx@gmail.com';

/**
 * Email remitente por defecto (dominio verificado en Resend)
 */
const DEFAULT_FROM_EMAIL = 'noreply@highlighttax.com';

/**
 * Información de contacto de la empresa para plantillas
 */
const COMPANY_INFO = {
  name: 'Highlight Tax Services',
  phone: '+1 917-257-4554',
  email: 'servicestaxx@gmail.com',
  address: '84 West 188th Street, Apt 3C, Bronx, NY 10468',
  year: new Date().getFullYear(),
};

// =============================================================================
// UTILIDADES DE CONEXIÓN
// =============================================================================

/**
 * Obtiene las credenciales de Resend desde variables de entorno o Replit Connectors
 * 
 * Esta función primero intenta obtener la API key desde RESEND_API_KEY,
 * y si no está disponible, intenta usar Replit Connectors.
 * 
 * @returns Objeto con apiKey y fromEmail
 * @throws Error si no se pueden obtener las credenciales
 * 
 * @security Las credenciales se obtienen del entorno seguro
 * @internal
 */
async function getCredentials(): Promise<{ apiKey: string; fromEmail: string }> {
  // Opción 1: Usar variable de entorno directa (para Vercel y otros hosting)
  if (process.env.RESEND_API_KEY) {
    return {
      apiKey: process.env.RESEND_API_KEY,
      fromEmail: process.env.RESEND_FROM_EMAIL || DEFAULT_FROM_EMAIL
    };
  }

  // Opción 2: Usar Replit Connectors
  const hostname = process.env.REPLIT_CONNECTORS_HOSTNAME;
  
  // Construir token de autenticación según el contexto
  const xReplitToken = process.env.REPL_IDENTITY 
    ? 'repl ' + process.env.REPL_IDENTITY 
    : process.env.WEB_REPL_RENEWAL 
    ? 'depl ' + process.env.WEB_REPL_RENEWAL 
    : null;

  if (!xReplitToken || !hostname) {
    throw new Error('RESEND_API_KEY no configurada. Agregue la variable de entorno.');
  }

  // Obtener configuración del conector
  try {
    connectionSettings = await fetch(
      'https://' + hostname + '/api/v2/connection?include_secrets=true&connector_names=resend',
      {
        headers: {
          'Accept': 'application/json',
          'X_REPLIT_TOKEN': xReplitToken
        }
      }
    ).then(res => res.json()).then(data => data.items?.[0]);

    if (!connectionSettings || !connectionSettings.settings.api_key) {
      throw new Error('Resend no está conectado. Configure la integración en Replit o agregue RESEND_API_KEY.');
    }

    return {
      apiKey: connectionSettings.settings.api_key,
      fromEmail: connectionSettings.settings.from_email || DEFAULT_FROM_EMAIL
    };
  } catch (error) {
    throw new Error('No se pudo obtener la API key de Resend. Configure RESEND_API_KEY como variable de entorno.');
  }
}

/**
 * Obtiene cliente de Resend configurado
 * 
 * Wrapper que inicializa el cliente con las credenciales
 * obtenidas del entorno de Replit.
 * 
 * @returns Objeto con cliente Resend y email remitente
 * @internal
 */
async function getResendClient(): Promise<{ client: Resend; fromEmail: string }> {
  const credentials = await getCredentials();
  return {
    client: new Resend(credentials.apiKey),
    fromEmail: credentials.fromEmail
  };
}

// =============================================================================
// PLANTILLAS DE EMAIL
// =============================================================================

/**
 * Genera el header estándar de los emails
 * 
 * @returns HTML del header con logo y nombre de la empresa
 */
function getEmailHeader(): string {
  return `
    <div style="background: #0A3D62; padding: 30px; text-align: center;">
      <h1 style="color: white; margin: 0; font-size: 24px;">${COMPANY_INFO.name}</h1>
    </div>
  `;
}

/**
 * Genera el footer estándar de los emails
 * 
 * @returns HTML del footer con copyright
 */
function getEmailFooter(): string {
  return `
    <div style="background: #f5f5f5; padding: 20px; text-align: center; font-size: 12px; color: #666;">
      <p>&copy; ${COMPANY_INFO.year} ${COMPANY_INFO.name}. All rights reserved.</p>
    </div>
  `;
}

/**
 * Genera información de contacto para los emails
 * 
 * @returns HTML con información de contacto
 */
function getContactInfo(): string {
  return `
    <p>
      <strong>Phone / Teléfono:</strong> ${COMPANY_INFO.phone}<br>
      <strong>Email:</strong> ${COMPANY_INFO.email}<br>
      <strong>Address / Dirección:</strong> ${COMPANY_INFO.address}
    </p>
  `;
}

/**
 * Mapeo de categorías de documentos a etiquetas legibles
 * Bilingüe inglés/español
 */
const CATEGORY_LABELS: Record<string, string> = {
  'id_document': 'ID Document / Cédula',
  'w2': 'W-2 Form',
  'form_1099': '1099 Form',
  'bank_statement': 'Bank Statement / Estado de Cuenta',
  'receipt': 'Receipt / Recibo',
  'previous_return': 'Previous Tax Return / Declaración Anterior',
  'social_security': 'Social Security Card / Seguro Social',
  'proof_of_address': 'Proof of Address / Comprobante de Domicilio',
  'other': 'Other Document / Otro Documento'
};

/**
 * Mapeo de estados de casos a etiquetas con colores
 * Bilingüe inglés/español
 */
const STATUS_LABELS: Record<string, { en: string; es: string; color: string }> = {
  'pending': { en: 'Pending', es: 'Pendiente', color: '#f39c12' },
  'in_process': { en: 'In Process', es: 'En Proceso', color: '#3498db' },
  'sent_to_irs': { en: 'Sent to IRS', es: 'Enviado al IRS', color: '#9b59b6' },
  'approved': { en: 'Approved', es: 'Aprobado', color: '#2ECC71' },
  'refund_issued': { en: 'Refund Issued', es: 'Reembolso Emitido', color: '#27ae60' },
};

// =============================================================================
// FUNCIONES PÚBLICAS DE ENVÍO
// =============================================================================

/**
 * Envía notificación de nuevo formulario de contacto al administrador
 * 
 * Cuando un visitante envía el formulario de contacto,
 * esta función notifica al administrador con los detalles.
 * 
 * @param data - Datos del formulario de contacto
 * @param data.name - Nombre del contacto
 * @param data.email - Email del contacto
 * @param data.phone - Teléfono opcional
 * @param data.message - Mensaje del formulario
 * @param data.service - Servicio de interés opcional
 * 
 * @returns true si se envió correctamente, false si hubo error
 * 
 * @example
 * await sendContactFormNotification({
 *   name: 'María García',
 *   email: 'maria@example.com',
 *   message: 'Necesito ayuda con mis impuestos'
 * });
 */
export async function sendContactFormNotification(data: {
  name: string;
  email: string;
  phone?: string;
  message: string;
  service?: string;
}): Promise<boolean> {
  try {
    const { client, fromEmail } = await getResendClient();
    
    await client.emails.send({
      from: fromEmail,
      to: ADMIN_EMAIL,
      subject: `New Contact Form Submission - ${data.name}`,
      html: `
        <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
          <h2 style="color: #0A3D62;">New Contact Form Submission</h2>
          <div style="background: #f5f5f5; padding: 20px; border-radius: 8px;">
            <p><strong>Name:</strong> ${data.name}</p>
            <p><strong>Email:</strong> ${data.email}</p>
            ${data.phone ? `<p><strong>Phone:</strong> ${data.phone}</p>` : ''}
            ${data.service ? `<p><strong>Service:</strong> ${data.service}</p>` : ''}
            <p><strong>Message:</strong></p>
            <p style="background: white; padding: 15px; border-radius: 4px;">${data.message}</p>
          </div>
          <p style="color: #666; font-size: 12px; margin-top: 20px;">
            This email was sent from the ${COMPANY_INFO.name} website contact form.
          </p>
        </div>
      `,
    });
    
    console.log('[email] Contact form notification sent');
    return true;
  } catch (error) {
    console.error('[email] Failed to send contact form notification:', error);
    return false;
  }
}

/**
 * Envía email de bienvenida a nuevos usuarios registrados
 * 
 * Se envía automáticamente cuando un usuario completa el registro.
 * Incluye información sobre los próximos pasos y contacto.
 * 
 * @param data - Datos del nuevo usuario
 * @param data.name - Nombre del usuario
 * @param data.email - Email del usuario
 * 
 * @returns true si se envió correctamente, false si hubo error
 * 
 * @example
 * await sendWelcomeEmail({
 *   name: 'Juan Pérez',
 *   email: 'juan@example.com'
 * });
 */
export async function sendWelcomeEmail(data: { 
  name: string; 
  email: string 
}): Promise<boolean> {
  try {
    const { client, fromEmail } = await getResendClient();
    
    await client.emails.send({
      from: fromEmail,
      to: data.email,
      subject: 'Bienvenido a Highlight Tax Services / Welcome to Highlight Tax Services',
      html: `
        <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
          ${getEmailHeader()}
          
          <div style="padding: 30px;">
            <h2 style="color: #0A3D62;">Welcome / Bienvenido, ${data.name}!</h2>
            
            <p>Thank you for registering with ${COMPANY_INFO.name}. Your account has been created successfully.</p>
            <p>Gracias por registrarse en ${COMPANY_INFO.name}. Su cuenta ha sido creada exitosamente.</p>
            
            <div style="background: #f5f5f5; padding: 20px; border-radius: 8px; margin: 20px 0;">
              <h3 style="color: #2ECC71; margin-top: 0;">What's Next? / ¿Qué sigue?</h3>
              <ul style="line-height: 1.8;">
                <li>Upload your tax documents through the client portal</li>
                <li>Schedule an appointment with our tax preparers</li>
                <li>Track your case status in real-time</li>
              </ul>
            </div>
            
            <p>If you have any questions, contact us at:</p>
            ${getContactInfo()}
          </div>
          
          ${getEmailFooter()}
        </div>
      `,
    });
    
    console.log('[email] Welcome email sent to:', data.email);
    return true;
  } catch (error) {
    console.error('[email] Failed to send welcome email:', error);
    return false;
  }
}

/**
 * Envía notificación de documento subido al administrador
 * 
 * Cuando un cliente sube un documento, esta función notifica
 * al administrador para que pueda revisarlo.
 * 
 * @param data - Datos del documento subido
 * @param data.clientName - Nombre del cliente
 * @param data.clientEmail - Email del cliente
 * @param data.fileName - Nombre del archivo
 * @param data.category - Categoría del documento
 * 
 * @returns true si se envió correctamente, false si hubo error
 */
export async function sendDocumentUploadNotification(data: {
  clientName: string;
  clientEmail: string;
  fileName: string;
  category: string;
}): Promise<boolean> {
  try {
    const { client, fromEmail } = await getResendClient();
    
    await client.emails.send({
      from: fromEmail,
      to: ADMIN_EMAIL,
      subject: `New Document Upload - ${data.clientName}`,
      html: `
        <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
          <h2 style="color: #0A3D62;">New Document Uploaded</h2>
          <div style="background: #f5f5f5; padding: 20px; border-radius: 8px;">
            <p><strong>Client:</strong> ${data.clientName}</p>
            <p><strong>Email:</strong> ${data.clientEmail}</p>
            <p><strong>File Name:</strong> ${data.fileName}</p>
            <p><strong>Category:</strong> ${CATEGORY_LABELS[data.category] || data.category}</p>
          </div>
          <p style="color: #666; font-size: 12px; margin-top: 20px;">
            Log in to the admin dashboard to view and download this document.
          </p>
        </div>
      `,
    });
    
    console.log('[email] Document upload notification sent for:', data.fileName);
    return true;
  } catch (error) {
    console.error('[email] Failed to send document upload notification:', error);
    return false;
  }
}

/**
 * Envía notificación de actualización de estado de caso al cliente
 * 
 * Cuando el estado de un caso cambia, esta función notifica
 * al cliente con los detalles de la actualización.
 * 
 * @param data - Datos de la actualización
 * @param data.clientName - Nombre del cliente
 * @param data.clientEmail - Email del cliente
 * @param data.caseId - ID del caso
 * @param data.filingYear - Año fiscal del caso
 * @param data.newStatus - Nuevo estado del caso
 * @param data.notes - Notas adicionales opcionales
 * 
 * @returns true si se envió correctamente, false si hubo error
 */
export async function sendCaseStatusUpdate(data: {
  clientName: string;
  clientEmail: string;
  caseId: number;
  filingYear: number;
  newStatus: string;
  notes?: string;
}): Promise<boolean> {
  try {
    const { client, fromEmail } = await getResendClient();
    
    const status = STATUS_LABELS[data.newStatus] || { 
      en: data.newStatus, 
      es: data.newStatus, 
      color: '#666' 
    };
    
    await client.emails.send({
      from: fromEmail,
      to: data.clientEmail,
      subject: `Case Status Update - ${status.en} / Actualización de Caso - ${status.es}`,
      html: `
        <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
          ${getEmailHeader()}
          
          <div style="padding: 30px;">
            <h2 style="color: #0A3D62;">Case Status Update / Actualización de Estado</h2>
            
            <p>Hello / Hola, ${data.clientName}!</p>
            
            <div style="background: #f5f5f5; padding: 20px; border-radius: 8px; margin: 20px 0;">
              <p><strong>Tax Year / Año Fiscal:</strong> ${data.filingYear}</p>
              <p><strong>Case ID:</strong> #${data.caseId}</p>
              <p>
                <strong>New Status / Nuevo Estado:</strong> 
                <span style="background: ${status.color}; color: white; padding: 4px 12px; border-radius: 20px; font-weight: bold;">
                  ${status.en} / ${status.es}
                </span>
              </p>
              ${data.notes ? `<p><strong>Notes / Notas:</strong> ${data.notes}</p>` : ''}
            </div>
            
            <p>Log in to your client portal to view more details about your case.</p>
            <p>Inicie sesión en su portal de cliente para ver más detalles sobre su caso.</p>
            
            <p style="margin-top: 30px;">Questions? Contact us:</p>
            ${getContactInfo()}
          </div>
          
          ${getEmailFooter()}
        </div>
      `,
    });
    
    console.log('[email] Case status update sent to:', data.clientEmail);
    return true;
  } catch (error) {
    console.error('[email] Failed to send case status update:', error);
    return false;
  }
}

/**
 * Envía confirmación de cita al cliente y notificación al administrador
 * 
 * Cuando se agenda una cita, esta función:
 * 1. Envía confirmación al cliente con detalles de la cita
 * 2. Notifica al administrador de la nueva cita
 * 
 * @param data - Datos de la cita
 * @param data.clientName - Nombre del cliente
 * @param data.clientEmail - Email del cliente
 * @param data.appointmentDate - Fecha y hora de la cita
 * @param data.notes - Notas de la cita opcionales
 * 
 * @returns true si se enviaron los emails correctamente, false si hubo error
 */
/**
 * Envía email de recuperación de contraseña
 * 
 * Envía un enlace seguro de un solo uso para restablecer
 * la contraseña del usuario.
 * 
 * @param data - Datos para el email de recuperación
 * @param data.name - Nombre del usuario
 * @param data.email - Email del usuario
 * @param data.resetToken - Token único de recuperación
 * @param data.expiresInMinutes - Tiempo de expiración en minutos
 * 
 * @returns true si se envió correctamente, false si hubo error
 */
export async function sendPasswordResetEmail(data: {
  name: string;
  email: string;
  resetToken: string;
  expiresInMinutes: number;
}): Promise<boolean> {
  try {
    const { client, fromEmail } = await getResendClient();
    
    const baseUrl = process.env.VITE_APP_URL || process.env.VERCEL_URL 
      ? `https://${process.env.VERCEL_URL}` 
      : 'https://highlighttax.com';
    
    const resetLink = `${baseUrl}/reset-password?token=${data.resetToken}`;
    
    await client.emails.send({
      from: fromEmail,
      to: data.email,
      subject: 'Password Reset Request / Solicitud de Restablecimiento de Contraseña',
      html: `
        <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
          ${getEmailHeader()}
          
          <div style="padding: 30px;">
            <h2 style="color: #0A3D62;">Password Reset / Restablecer Contraseña</h2>
            
            <p>Hello / Hola, ${data.name}!</p>
            
            <p>You requested to reset your password. Click the button below to set a new password.</p>
            <p>Has solicitado restablecer tu contraseña. Haz clic en el botón de abajo para establecer una nueva contraseña.</p>
            
            <div style="text-align: center; margin: 30px 0;">
              <a href="${resetLink}" style="background: #0A3D62; color: white; padding: 15px 30px; text-decoration: none; border-radius: 8px; font-weight: bold; display: inline-block;">
                Reset Password / Restablecer Contraseña
              </a>
            </div>
            
            <div style="background: #fff3cd; padding: 15px; border-radius: 8px; margin: 20px 0;">
              <p style="margin: 0; color: #856404;">
                <strong>This link expires in ${data.expiresInMinutes} minutes.</strong><br>
                <strong>Este enlace expira en ${data.expiresInMinutes} minutos.</strong>
              </p>
            </div>
            
            <p style="color: #666; font-size: 14px;">
              If you didn't request this password reset, you can safely ignore this email.<br>
              Si no solicitaste este restablecimiento de contraseña, puedes ignorar este email de forma segura.
            </p>
            
            <p style="color: #666; font-size: 12px; margin-top: 20px;">
              If the button doesn't work, copy and paste this link into your browser:<br>
              <a href="${resetLink}" style="color: #0A3D62;">${resetLink}</a>
            </p>
            
            ${getContactInfo()}
          </div>
          
          ${getEmailFooter()}
        </div>
      `,
    });
    
    console.log('[email] Password reset email sent to:', data.email);
    return true;
  } catch (error) {
    console.error('[email] Failed to send password reset email:', error);
    return false;
  }
}

export async function sendAppointmentConfirmation(data: {
  clientName: string;
  clientEmail: string;
  appointmentDate: Date;
  notes?: string;
}): Promise<boolean> {
  try {
    const { client, fromEmail } = await getResendClient();
    
    // Formatear fechas en ambos idiomas
    const dateOptions: Intl.DateTimeFormatOptions = {
      weekday: 'long',
      year: 'numeric',
      month: 'long',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    };
    
    const formattedDateEn = data.appointmentDate.toLocaleDateString('en-US', dateOptions);
    const formattedDateEs = data.appointmentDate.toLocaleDateString('es-ES', dateOptions);
    
    // Email al cliente
    await client.emails.send({
      from: fromEmail,
      to: data.clientEmail,
      subject: 'Appointment Confirmation / Confirmación de Cita - Highlight Tax Services',
      html: `
        <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
          ${getEmailHeader()}
          
          <div style="padding: 30px;">
            <h2 style="color: #2ECC71;">Appointment Confirmed / Cita Confirmada!</h2>
            
            <p>Hello / Hola, ${data.clientName}!</p>
            
            <p>Your appointment has been scheduled successfully.</p>
            <p>Su cita ha sido programada exitosamente.</p>
            
            <div style="background: #f5f5f5; padding: 20px; border-radius: 8px; margin: 20px 0; text-align: center;">
              <p style="font-size: 18px; margin: 0;">
                <strong>${formattedDateEn}</strong>
              </p>
              <p style="color: #666; margin: 5px 0 0 0;">
                ${formattedDateEs}
              </p>
              ${data.notes ? `<p style="margin-top: 15px;"><strong>Notes:</strong> ${data.notes}</p>` : ''}
            </div>
            
            <div style="background: #e8f5e9; padding: 20px; border-radius: 8px; margin: 20px 0;">
              <h3 style="color: #2ECC71; margin-top: 0;">Office Location / Ubicación</h3>
              <p style="margin-bottom: 0;">
                ${COMPANY_INFO.address}
              </p>
            </div>
            
            <p>If you need to reschedule, please contact us at least 24 hours before your appointment.</p>
            <p>Si necesita reprogramar, contáctenos al menos 24 horas antes de su cita.</p>
            
            ${getContactInfo()}
          </div>
          
          ${getEmailFooter()}
        </div>
      `,
    });
    
    // Email al administrador
    await client.emails.send({
      from: fromEmail,
      to: ADMIN_EMAIL,
      subject: `New Appointment - ${data.clientName} - ${formattedDateEn}`,
      html: `
        <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
          <h2 style="color: #0A3D62;">New Appointment Scheduled</h2>
          <div style="background: #f5f5f5; padding: 20px; border-radius: 8px;">
            <p><strong>Client:</strong> ${data.clientName}</p>
            <p><strong>Email:</strong> ${data.clientEmail}</p>
            <p><strong>Date/Time:</strong> ${formattedDateEn}</p>
            ${data.notes ? `<p><strong>Notes:</strong> ${data.notes}</p>` : ''}
          </div>
        </div>
      `,
    });
    
    console.log('[email] Appointment confirmation emails sent');
    return true;
  } catch (error) {
    console.error('[email] Failed to send appointment confirmation:', error);
    return false;
  }
}
