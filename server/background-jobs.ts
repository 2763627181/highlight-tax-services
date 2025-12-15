/**
 * @fileoverview Background Jobs para operaciones asíncronas
 * 
 * Este módulo maneja tareas que no deben bloquear las respuestas HTTP,
 * como envío de emails, logging de actividades, etc.
 */

import { storage } from "./storage";
import { 
  sendWelcomeEmail, 
  sendContactFormNotification,
  sendDocumentUploadNotification,
  sendCaseStatusUpdate,
  sendAppointmentConfirmation,
  sendPasswordResetEmail
} from "./email";

/**
 * Ejecuta una tarea en background sin bloquear
 * Si falla, solo se registra en consola (no afecta al usuario)
 */
async function runBackgroundTask<T>(
  task: () => Promise<T>,
  taskName: string
): Promise<void> {
  try {
    await task();
  } catch (error) {
    console.error(`[Background Job] Error en ${taskName}:`, error);
    // No lanzamos el error - las tareas de background no deben afectar al usuario
  }
}

/**
 * Registra actividad de usuario en background
 */
export async function logActivityInBackground(
  userId: number,
  action: string,
  details: string
): Promise<void> {
  runBackgroundTask(
    async () => {
      if (storage) {
        await storage.createActivityLog({
          userId,
          action,
          details,
        });
      }
    },
    `logActivity(${action})`
  );
}

/**
 * Envía email de bienvenida en background
 */
export async function sendWelcomeEmailInBackground(
  name: string,
  email: string
): Promise<void> {
  runBackgroundTask(
    async () => {
      await sendWelcomeEmail({ name, email });
    },
    `sendWelcomeEmail(${email})`
  );
}

/**
 * Envía notificación de formulario de contacto en background
 */
export async function sendContactNotificationInBackground(
  data: { name: string; email: string; phone?: string; message: string }
): Promise<void> {
  runBackgroundTask(
    async () => {
      await sendContactFormNotification(data);
    },
    `sendContactNotification(${data.email})`
  );
}

/**
 * Envía notificación de documento subido en background
 */
export async function sendDocumentNotificationInBackground(
  data: { clientName: string; clientEmail: string; fileName: string; category?: string }
): Promise<void> {
  runBackgroundTask(
    async () => {
      await sendDocumentUploadNotification(data);
    },
    `sendDocumentNotification(${data.clientEmail})`
  );
}

/**
 * Envía notificación de actualización de caso en background
 */
export async function sendCaseStatusUpdateInBackground(
  data: { clientName: string; clientEmail: string; caseId: number; status: string; filingYear?: number }
): Promise<void> {
  runBackgroundTask(
    async () => {
      await sendCaseStatusUpdate({
        clientName: data.clientName,
        clientEmail: data.clientEmail,
        caseId: data.caseId,
        filingYear: data.filingYear || new Date().getFullYear(),
        newStatus: data.status,
      });
    },
    `sendCaseStatusUpdate(${data.caseId})`
  );
}

/**
 * Envía confirmación de cita en background
 */
export async function sendAppointmentConfirmationInBackground(
  data: { clientName: string; clientEmail: string; appointmentDate: Date }
): Promise<void> {
  runBackgroundTask(
    async () => {
      await sendAppointmentConfirmation(data);
    },
    `sendAppointmentConfirmation(${data.clientEmail})`
  );
}

/**
 * Envía email de recuperación de contraseña en background
 */
export async function sendPasswordResetEmailInBackground(
  data: { name: string; email: string; resetUrl: string }
): Promise<void> {
  runBackgroundTask(
    async () => {
      await sendPasswordResetEmail(data);
    },
    `sendPasswordResetEmail(${data.email})`
  );
}

