import { Link } from "wouter";
import { Header } from "@/components/header";
import { Footer } from "@/components/footer";
import { WhatsAppButton } from "@/components/whatsapp-button";
import { ArrowLeft, Shield } from "lucide-react";
import { Button } from "@/components/ui/button";

export default function PrivacyPolicy() {
  return (
    <div className="min-h-screen flex flex-col">
      <Header />
      <main className="flex-1 pt-24 pb-16" data-testid="page-privacy-policy">
        <div className="max-w-4xl mx-auto px-4 sm:px-6">
          <Link href="/">
            <Button variant="ghost" className="mb-6 gap-2" data-testid="button-back">
              <ArrowLeft className="h-4 w-4" />
              Volver al Inicio
            </Button>
          </Link>

          <div className="flex items-center gap-4 mb-8">
            <div className="flex h-14 w-14 items-center justify-center rounded-lg bg-primary/10 text-primary">
              <Shield className="h-7 w-7" />
            </div>
            <div>
              <h1 className="text-3xl sm:text-4xl font-bold">Privacy Policy</h1>
              <p className="text-muted-foreground">Política de Privacidad</p>
            </div>
          </div>

          <div className="prose prose-lg dark:prose-invert max-w-none">
            <div className="bg-muted/50 rounded-lg p-6 mb-8">
              <p className="text-lg leading-relaxed m-0">
                Highlight Tax Services protege la información personal y fiscal de todos 
                sus clientes. Toda data recibida se utiliza únicamente para preparación 
                de impuestos, comunicación y cumplimiento legal. No compartimos información 
                con terceros. Toda documentación es almacenada de forma cifrada y bajo 
                estrictos estándares de seguridad.
              </p>
            </div>

            <h2>1. Información que Recopilamos</h2>
            <p>
              Recopilamos información que usted nos proporciona directamente, incluyendo:
            </p>
            <ul>
              <li>Nombre completo y datos de contacto</li>
              <li>Número de Seguro Social o ITIN</li>
              <li>Información fiscal (W-2, 1099, recibos, etc.)</li>
              <li>Información bancaria para depósito directo</li>
              <li>Información de dependientes</li>
            </ul>

            <h2>2. Uso de la Información</h2>
            <p>
              Utilizamos su información exclusivamente para:
            </p>
            <ul>
              <li>Preparar y presentar sus declaraciones de impuestos</li>
              <li>Comunicarnos con usted sobre el estado de su caso</li>
              <li>Cumplir con requisitos legales y regulatorios</li>
              <li>Mejorar nuestros servicios</li>
            </ul>

            <h2>3. Protección de Datos</h2>
            <p>
              Implementamos medidas de seguridad técnicas y organizativas para proteger 
              su información, incluyendo:
            </p>
            <ul>
              <li>Cifrado de datos en tránsito y en reposo</li>
              <li>Acceso restringido basado en roles</li>
              <li>Monitoreo continuo de seguridad</li>
              <li>Copias de seguridad regulares</li>
            </ul>

            <h2>4. Retención de Datos</h2>
            <p>
              Mantenemos sus registros fiscales por un período mínimo de 7 años, 
              según lo requerido por las regulaciones del IRS. Después de este período, 
              los datos se eliminan de forma segura.
            </p>

            <h2>5. Sus Derechos</h2>
            <p>
              Usted tiene derecho a:
            </p>
            <ul>
              <li>Acceder a su información personal</li>
              <li>Solicitar correcciones a su información</li>
              <li>Solicitar la eliminación de sus datos (sujeto a requisitos legales)</li>
              <li>Recibir una copia de sus documentos</li>
            </ul>

            <h2>6. Contacto</h2>
            <p>
              Para preguntas sobre esta política de privacidad, contáctenos:
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
