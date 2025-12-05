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

const WHATSAPP_URL = "https://wa.me/19172574554?text=Hola%20quiero%20información%20sobre%20sus%20servicios%20de%20taxes";

const services = [
  {
    icon: FileText,
    title: "Preparación de Taxes Personales (1040)",
    description: "Declaración de impuestos individuales para empleados W-2. Maximizamos tus deducciones y créditos para obtener el mejor reembolso posible.",
    highlight: "Popular",
  },
  {
    icon: Car,
    title: "Self-Employed / 1099",
    description: "Servicios especializados para trabajadores independientes de Uber, Lyft, DoorDash y más. Incluye deducciones por millas y gastos.",
    highlight: null,
  },
  {
    icon: Building2,
    title: "Business Taxes (LLC, Schedule C)",
    description: "Preparación completa de impuestos para pequeñas empresas, LLCs y trabajadores autónomos con Schedule C.",
    highlight: null,
  },
  {
    icon: CreditCard,
    title: "ITIN (Aplicación y Renovación)",
    description: "Asistencia completa para obtener o renovar tu número de identificación fiscal individual (ITIN) del IRS.",
    highlight: "Servicio Especial",
  },
  {
    icon: BookOpen,
    title: "Bookkeeping Mensual",
    description: "Mantenemos tus libros contables al día con servicio mensual de contabilidad para tu negocio.",
    highlight: null,
  },
  {
    icon: FileEdit,
    title: "Tax Amendments (1040X)",
    description: "Correcciones y enmiendas a declaraciones de impuestos ya presentadas. Recupera reembolsos perdidos.",
    highlight: null,
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
                  href={WHATSAPP_URL}
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
