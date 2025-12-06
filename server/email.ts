import { Resend } from 'resend';

let connectionSettings: any;

async function getCredentials() {
  const hostname = process.env.REPLIT_CONNECTORS_HOSTNAME;
  const xReplitToken = process.env.REPL_IDENTITY 
    ? 'repl ' + process.env.REPL_IDENTITY 
    : process.env.WEB_REPL_RENEWAL 
    ? 'depl ' + process.env.WEB_REPL_RENEWAL 
    : null;

  if (!xReplitToken) {
    throw new Error('X_REPLIT_TOKEN not found for repl/depl');
  }

  connectionSettings = await fetch(
    'https://' + hostname + '/api/v2/connection?include_secrets=true&connector_names=resend',
    {
      headers: {
        'Accept': 'application/json',
        'X_REPLIT_TOKEN': xReplitToken
      }
    }
  ).then(res => res.json()).then(data => data.items?.[0]);

  if (!connectionSettings || (!connectionSettings.settings.api_key)) {
    throw new Error('Resend not connected');
  }
  return {apiKey: connectionSettings.settings.api_key, fromEmail: connectionSettings.settings.from_email};
}

async function getResendClient() {
  const credentials = await getCredentials();
  return {
    client: new Resend(credentials.apiKey),
    fromEmail: credentials.fromEmail || 'noreply@highlighttaxservices.com'
  };
}

const ADMIN_EMAIL = 'servicestaxx@gmail.com';

export async function sendContactFormNotification(data: {
  name: string;
  email: string;
  phone?: string;
  message: string;
  service?: string;
}) {
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
            This email was sent from the Highlight Tax Services website contact form.
          </p>
        </div>
      `,
    });
    
    console.log('Contact form notification email sent');
    return true;
  } catch (error) {
    console.error('Failed to send contact form notification:', error);
    return false;
  }
}

export async function sendWelcomeEmail(data: { name: string; email: string }) {
  try {
    const { client, fromEmail } = await getResendClient();
    
    await client.emails.send({
      from: fromEmail,
      to: data.email,
      subject: 'Bienvenido a Highlight Tax Services / Welcome to Highlight Tax Services',
      html: `
        <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
          <div style="background: #0A3D62; padding: 30px; text-align: center;">
            <h1 style="color: white; margin: 0;">Highlight Tax Services</h1>
          </div>
          
          <div style="padding: 30px;">
            <h2 style="color: #0A3D62;">Welcome / Bienvenido, ${data.name}!</h2>
            
            <p>Thank you for registering with Highlight Tax Services. Your account has been created successfully.</p>
            <p>Gracias por registrarse en Highlight Tax Services. Su cuenta ha sido creada exitosamente.</p>
            
            <div style="background: #f5f5f5; padding: 20px; border-radius: 8px; margin: 20px 0;">
              <h3 style="color: #2ECC71; margin-top: 0;">What's Next? / ¿Qué sigue?</h3>
              <ul>
                <li>Upload your tax documents through the client portal</li>
                <li>Schedule an appointment with our tax preparers</li>
                <li>Track your case status in real-time</li>
              </ul>
            </div>
            
            <p>If you have any questions, contact us at:</p>
            <p>
              <strong>Phone / Teléfono:</strong> +1 917-257-4554<br>
              <strong>Email:</strong> servicestaxx@gmail.com<br>
              <strong>Address / Dirección:</strong> 84 West 188th Street, Apt 3C, Bronx, NY 10468
            </p>
          </div>
          
          <div style="background: #f5f5f5; padding: 20px; text-align: center; font-size: 12px; color: #666;">
            <p>&copy; 2024 Highlight Tax Services. All rights reserved.</p>
          </div>
        </div>
      `,
    });
    
    console.log('Welcome email sent to:', data.email);
    return true;
  } catch (error) {
    console.error('Failed to send welcome email:', error);
    return false;
  }
}

export async function sendDocumentUploadNotification(data: {
  clientName: string;
  clientEmail: string;
  fileName: string;
  category: string;
}) {
  try {
    const { client, fromEmail } = await getResendClient();
    
    const categoryLabels: Record<string, string> = {
      'id_document': 'ID Document / Cédula',
      'w2': 'W-2 Form',
      'form_1099': '1099 Form',
      'bank_statement': 'Bank Statement',
      'receipt': 'Receipt',
      'previous_return': 'Previous Tax Return',
      'social_security': 'Social Security Card',
      'proof_of_address': 'Proof of Address',
      'other': 'Other Document'
    };
    
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
            <p><strong>Category:</strong> ${categoryLabels[data.category] || data.category}</p>
          </div>
          <p style="color: #666; font-size: 12px; margin-top: 20px;">
            Log in to the admin dashboard to view and download this document.
          </p>
        </div>
      `,
    });
    
    console.log('Document upload notification sent for:', data.fileName);
    return true;
  } catch (error) {
    console.error('Failed to send document upload notification:', error);
    return false;
  }
}

export async function sendCaseStatusUpdate(data: {
  clientName: string;
  clientEmail: string;
  caseId: number;
  filingYear: number;
  newStatus: string;
  notes?: string;
}) {
  try {
    const { client, fromEmail } = await getResendClient();
    
    const statusLabels: Record<string, { en: string; es: string; color: string }> = {
      'pending': { en: 'Pending', es: 'Pendiente', color: '#f39c12' },
      'in_process': { en: 'In Process', es: 'En Proceso', color: '#3498db' },
      'sent_to_irs': { en: 'Sent to IRS', es: 'Enviado al IRS', color: '#9b59b6' },
      'approved': { en: 'Approved', es: 'Aprobado', color: '#2ECC71' },
      'refund_issued': { en: 'Refund Issued', es: 'Reembolso Emitido', color: '#27ae60' },
    };
    
    const status = statusLabels[data.newStatus] || { en: data.newStatus, es: data.newStatus, color: '#666' };
    
    await client.emails.send({
      from: fromEmail,
      to: data.clientEmail,
      subject: `Case Status Update - ${status.en} / Actualización de Caso - ${status.es}`,
      html: `
        <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
          <div style="background: #0A3D62; padding: 30px; text-align: center;">
            <h1 style="color: white; margin: 0;">Highlight Tax Services</h1>
          </div>
          
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
            <p>
              <strong>Phone / Teléfono:</strong> +1 917-257-4554<br>
              <strong>Email:</strong> servicestaxx@gmail.com
            </p>
          </div>
          
          <div style="background: #f5f5f5; padding: 20px; text-align: center; font-size: 12px; color: #666;">
            <p>&copy; 2024 Highlight Tax Services. All rights reserved.</p>
          </div>
        </div>
      `,
    });
    
    console.log('Case status update email sent to:', data.clientEmail);
    return true;
  } catch (error) {
    console.error('Failed to send case status update email:', error);
    return false;
  }
}

export async function sendAppointmentConfirmation(data: {
  clientName: string;
  clientEmail: string;
  appointmentDate: Date;
  notes?: string;
}) {
  try {
    const { client, fromEmail } = await getResendClient();
    
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
    
    await client.emails.send({
      from: fromEmail,
      to: data.clientEmail,
      subject: 'Appointment Confirmation / Confirmación de Cita - Highlight Tax Services',
      html: `
        <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
          <div style="background: #0A3D62; padding: 30px; text-align: center;">
            <h1 style="color: white; margin: 0;">Highlight Tax Services</h1>
          </div>
          
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
                84 West 188th Street, Apt 3C<br>
                Bronx, NY 10468
              </p>
            </div>
            
            <p>If you need to reschedule, please contact us at least 24 hours before your appointment.</p>
            <p>Si necesita reprogramar, contáctenos al menos 24 horas antes de su cita.</p>
            
            <p>
              <strong>Phone / Teléfono:</strong> +1 917-257-4554<br>
              <strong>Email:</strong> servicestaxx@gmail.com
            </p>
          </div>
          
          <div style="background: #f5f5f5; padding: 20px; text-align: center; font-size: 12px; color: #666;">
            <p>&copy; 2024 Highlight Tax Services. All rights reserved.</p>
          </div>
        </div>
      `,
    });
    
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
    
    console.log('Appointment confirmation emails sent');
    return true;
  } catch (error) {
    console.error('Failed to send appointment confirmation:', error);
    return false;
  }
}
