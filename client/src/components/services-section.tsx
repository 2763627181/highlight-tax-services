import { 
  FileText, 
  Car, 
  Building2, 
  CreditCard, 
  BookOpen, 
  FileEdit,
  MessageCircle
} from "lucide-react";
import { Card, CardContent, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { SiWhatsapp } from "react-icons/si";

const WHATSAPP_NUMBER = "19172574554";

function getWhatsAppUrl(service: string): string {
  const messages: Record<string, string> = {
    "personal": "Hola, estoy interesado en el servicio de Preparación de Taxes Personales (1040). ¿Podrían darme más información sobre precios y requisitos?",
    "self-employed": "Hola, soy trabajador independiente y necesito ayuda con mis impuestos 1099. ¿Qué documentos necesito y cuál es el costo del servicio?",
    "business": "Hola, tengo un negocio y necesito ayuda con Business Taxes (LLC/Schedule C). ¿Podrían asesorarme sobre este servicio?",
    "itin": "Hola, necesito información sobre el servicio de ITIN (Aplicación/Renovación). ¿Cuáles son los requisitos y el proceso?",
    "bookkeeping": "Hola, me interesa el servicio de Bookkeeping Mensual para mi negocio. ¿Cuál es el costo y qué incluye?",
    "amendments": "Hola, necesito hacer una corrección a mi declaración de impuestos anterior (1040X). ¿Pueden ayudarme con esto?",
  };
  const encodedMessage = encodeURIComponent(messages[service] || messages["personal"]);
  return `https://wa.me/${WHATSAPP_NUMBER}?text=${encodedMessage}`;
}

const services = [
  {
    icon: FileText,
    title: "Preparación de Taxes Personales (1040)",
    description: "Declaración de impuestos individuales para empleados W-2. Maximizamos tus deducciones y créditos para obtener el mejor reembolso posible.",
    highlight: "Popular",
    serviceKey: "personal",
  },
  {
    icon: Car,
    title: "Self-Employed / 1099",
    description: "Servicios especializados para trabajadores independientes de Uber, Lyft, DoorDash y más. Incluye deducciones por millas y gastos.",
    highlight: null,
    serviceKey: "self-employed",
  },
  {
    icon: Building2,
    title: "Business Taxes (LLC, Schedule C)",
    description: "Preparación completa de impuestos para pequeñas empresas, LLCs y trabajadores autónomos con Schedule C.",
    highlight: null,
    serviceKey: "business",
  },
  {
    icon: CreditCard,
    title: "ITIN (Aplicación y Renovación)",
    description: "Asistencia completa para obtener o renovar tu número de identificación fiscal individual (ITIN) del IRS.",
    highlight: "Servicio Especial",
    serviceKey: "itin",
  },
  {
    icon: BookOpen,
    title: "Bookkeeping Mensual",
    description: "Mantenemos tus libros contables al día con servicio mensual de contabilidad para tu negocio.",
    highlight: null,
    serviceKey: "bookkeeping",
  },
  {
    icon: FileEdit,
    title: "Tax Amendments (1040X)",
    description: "Correcciones y enmiendas a declaraciones de impuestos ya presentadas. Recupera reembolsos perdidos.",
    highlight: null,
    serviceKey: "amendments",
  },
];

export function ServicesSection() {
  return (
    <section id="services" className="py-20 scroll-mt-20" data-testid="section-services">
      <div className="max-w-7xl mx-auto px-4 sm:px-6">
        <div className="text-center mb-16">
          <h2 className="text-3xl sm:text-4xl font-bold mb-4">
            Nuestros Servicios
          </h2>
          <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
            Ofrecemos una gama completa de servicios de preparación de impuestos 
            para individuos y empresas en todo Estados Unidos.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {services.map((service, index) => (
            <Card 
              key={service.title} 
              className="relative overflow-visible flex flex-col hover-elevate transition-all duration-300"
              data-testid={`card-service-${index}`}
            >
              {service.highlight && (
                <div className="absolute -top-3 left-4">
                  <span className="inline-block px-3 py-1 text-xs font-semibold rounded-full bg-accent text-accent-foreground">
                    {service.highlight}
                  </span>
                </div>
              )}
              <CardHeader className="pb-4">
                <div className="flex items-start gap-4">
                  <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-lg bg-primary/10 text-primary">
                    <service.icon className="h-6 w-6" />
                  </div>
                  <CardTitle className="text-xl leading-tight">{service.title}</CardTitle>
                </div>
              </CardHeader>
              <CardContent className="flex-1">
                <p className="text-muted-foreground leading-relaxed">
                  {service.description}
                </p>
              </CardContent>
              <CardFooter className="pt-4">
                <a
                  href={getWhatsAppUrl(service.serviceKey)}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="w-full"
                >
                  <Button 
                    variant="outline" 
                    className="w-full gap-2"
                    data-testid={`button-whatsapp-service-${index}`}
                  >
                    <SiWhatsapp className="h-4 w-4 text-[#25D366]" />
                    Solicitar Información
                  </Button>
                </a>
              </CardFooter>
            </Card>
          ))}
        </div>
      </div>
    </section>
  );
}
