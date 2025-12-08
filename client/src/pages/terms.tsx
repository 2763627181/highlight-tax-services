import { Link } from "wouter";
import { Header } from "@/components/header";
import { Footer } from "@/components/footer";
import { WhatsAppButton } from "@/components/whatsapp-button";
import { ArrowLeft, FileText } from "lucide-react";
import { Button } from "@/components/ui/button";

export default function Terms() {
  return (
    <div className="min-h-screen flex flex-col">
      <Header />
      <main className="flex-1 pt-24 pb-16" data-testid="page-terms">
        <div className="max-w-4xl mx-auto px-4 sm:px-6">
          <Link href="/">
            <Button variant="ghost" className="mb-6 gap-2" data-testid="button-back">
              <ArrowLeft className="h-4 w-4" />
              Volver al Inicio
            </Button>
          </Link>

          <div className="flex items-center gap-4 mb-8">
            <div className="flex h-14 w-14 items-center justify-center rounded-lg bg-primary/10 text-primary">
              <FileText className="h-7 w-7" />
            </div>
            <div>
              <h1 className="text-3xl sm:text-4xl font-bold">Terms & Conditions</h1>
              <p className="text-muted-foreground">Términos y Condiciones</p>
            </div>
          </div>

          <div className="prose prose-lg dark:prose-invert max-w-none">
            <div className="bg-muted/50 rounded-lg p-6 mb-8">
              <p className="text-lg leading-relaxed m-0">
                El cliente es responsable de proporcionar información verdadera y 
                verificable. Highlight Tax Services no asume responsabilidad por 
                errores derivados de documentos falsos, incompletos o incorrectos. 
                Este sitio no constituye asesoría legal. Al utilizar este portal, 
                aceptas nuestros términos y autorizas el procesamiento de tu 
                información para fines de preparación de impuestos.
              </p>
            </div>

            <h2>1. Aceptación de Términos</h2>
            <p>
              Al acceder y utilizar los servicios de Highlight Tax Services, usted acepta 
              estar sujeto a estos términos y condiciones. Si no está de acuerdo con 
              alguna parte de estos términos, no debe utilizar nuestros servicios.
            </p>

            <h2>2. Servicios Ofrecidos</h2>
            <p>
              Highlight Tax Services ofrece servicios de preparación de impuestos, 
              incluyendo pero no limitado a:
            </p>
            <ul>
              <li>Preparación de declaraciones de impuestos personales</li>
              <li>Preparación de impuestos para trabajadores independientes</li>
              <li>Impuestos empresariales</li>
              <li>Solicitud y renovación de ITIN</li>
              <li>Contabilidad mensual</li>
              <li>Correcciones de declaraciones (1040X)</li>
            </ul>

            <h2>3. Responsabilidades del Cliente</h2>
            <p>
              Como cliente, usted es responsable de:
            </p>
            <ul>
              <li>Proporcionar información precisa, completa y verdadera</li>
              <li>Entregar todos los documentos necesarios de manera oportuna</li>
              <li>Revisar y aprobar la declaración antes de su presentación</li>
              <li>Informar cualquier cambio en su situación fiscal</li>
              <li>Mantener copias de todos los documentos proporcionados</li>
            </ul>

            <h2>4. Limitación de Responsabilidad</h2>
            <p>
              Highlight Tax Services no será responsable por:
            </p>
            <ul>
              <li>Errores resultantes de información incorrecta o incompleta proporcionada por el cliente</li>
              <li>Penalidades del IRS derivadas de declaraciones fraudulentas</li>
              <li>Cambios en las leyes fiscales después de la presentación</li>
              <li>Decisiones del IRS sobre auditorías o rechazos</li>
            </ul>

            <h2>5. Confidencialidad</h2>
            <p>
              Mantenemos la confidencialidad de toda la información del cliente de 
              acuerdo con las regulaciones aplicables. No compartimos información 
              con terceros excepto cuando sea requerido por ley.
            </p>

            <h2>6. Tarifas y Pagos</h2>
            <p>
              Las tarifas por nuestros servicios se comunican antes de iniciar el 
              trabajo. El pago completo es requerido antes de la presentación de 
              la declaración de impuestos.
            </p>

            <h2>7. Cancelación</h2>
            <p>
              El cliente puede cancelar los servicios en cualquier momento antes de 
              la presentación de la declaración. Se pueden aplicar cargos por trabajo 
              ya realizado.
            </p>

            <h2>8. Disclaimer Legal</h2>
            <p>
              Los servicios proporcionados por Highlight Tax Services no constituyen 
              asesoría legal. Para asuntos legales relacionados con impuestos, 
              recomendamos consultar con un abogado especializado.
            </p>

            <h2>9. Modificaciones</h2>
            <p>
              Nos reservamos el derecho de modificar estos términos en cualquier momento. 
              Los cambios serán efectivos inmediatamente después de su publicación en 
              este sitio.
            </p>

            <h2>10. Contacto</h2>
            <p>
              Para preguntas sobre estos términos, contáctenos:
            </p>
            <ul>
              <li>Email: servicestaxx@gmail.com</li>
              <li>Teléfono: +1 917-257-4554</li>
              <li>Dirección: 84 West 188th Street, Apt 3C, Bronx, NY 10468</li>
            </ul>

            <p className="text-sm text-muted-foreground mt-8">
              Última actualización: Enero 2025
            </p>
          </div>
        </div>
      </main>
      <Footer />
      <WhatsAppButton />
    </div>
  );
}
