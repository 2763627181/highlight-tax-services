import { 
  CheckCircle, 
  MapPin, 
  Phone, 
  Mail,
  Clock,
  Award
} from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";

const highlights = [
  "10+ años de experiencia",
  "Servicio personalizado",
  "Confidencialidad absoluta",
  "Atención bilingüe (Inglés/Español)",
];

export function AboutSection() {
  return (
    <section id="about" className="py-20 bg-muted/30 scroll-mt-20" data-testid="section-about">
      <div className="max-w-7xl mx-auto px-4 sm:px-6">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-start">
          <div className="space-y-6">
            <div>
              <h2 className="text-3xl sm:text-4xl font-bold mb-4">
                Sobre Nosotros
              </h2>
              <div className="h-1 w-20 bg-accent rounded-full" />
            </div>

            <p className="text-lg text-muted-foreground leading-relaxed">
              Highlight Tax Services brinda servicios confiables de preparación de 
              impuestos para empleados, dueños de negocios y trabajadores independientes 
              en todo Estados Unidos. Con más de 10 años de experiencia, garantizamos 
              procesos claros, seguros y orientados a maximizar tus beneficios.
            </p>

            <div className="space-y-3 pt-4">
              {highlights.map((item) => (
                <div key={item} className="flex items-center gap-3">
                  <CheckCircle className="h-5 w-5 text-accent shrink-0" />
                  <span className="font-medium">{item}</span>
                </div>
              ))}
            </div>

            <div className="flex items-center gap-4 pt-4">
              <div className="flex h-16 w-16 items-center justify-center rounded-full bg-primary/10 text-primary">
                <Award className="h-8 w-8" />
              </div>
              <div>
                <div className="font-semibold text-lg">Preparadores Certificados</div>
                <div className="text-muted-foreground">Autorizados por el IRS</div>
              </div>
            </div>
          </div>

          <div className="space-y-6">
            <Card className="overflow-hidden" data-testid="card-contact-info">
              <CardContent className="p-0">
                <div className="bg-primary text-primary-foreground p-6">
                  <h3 className="text-xl font-semibold mb-2">Información de Contacto</h3>
                  <p className="text-primary-foreground/80 text-sm">
                    Estamos aquí para ayudarte con todas tus necesidades de impuestos
                  </p>
                </div>

                <div className="p-6 space-y-5">
                  <div className="flex items-start gap-4">
                    <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-lg bg-primary/10 text-primary">
                      <MapPin className="h-5 w-5" />
                    </div>
                    <div>
                      <div className="font-medium mb-1">Dirección</div>
                      <div className="text-muted-foreground text-sm">
                        84 West 188th Street, Apt 3C<br />
                        Bronx, NY 10468
                      </div>
                    </div>
                  </div>

                  <div className="flex items-start gap-4">
                    <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-lg bg-primary/10 text-primary">
                      <Phone className="h-5 w-5" />
                    </div>
                    <div>
                      <div className="font-medium mb-1">Teléfono</div>
                      <a 
                        href="tel:+19172574554" 
                        className="text-muted-foreground text-sm hover:text-primary transition-colors"
                        data-testid="link-phone"
                      >
                        +1 917-257-4554
                      </a>
                    </div>
                  </div>

                  <div className="flex items-start gap-4">
                    <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-lg bg-primary/10 text-primary">
                      <Mail className="h-5 w-5" />
                    </div>
                    <div>
                      <div className="font-medium mb-1">Correo Electrónico</div>
                      <a 
                        href="mailto:servicestaxx@gmail.com" 
                        className="text-muted-foreground text-sm hover:text-primary transition-colors"
                        data-testid="link-email"
                      >
                        servicestaxx@gmail.com
                      </a>
                    </div>
                  </div>

                  <div className="flex items-start gap-4">
                    <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-lg bg-primary/10 text-primary">
                      <Clock className="h-5 w-5" />
                    </div>
                    <div>
                      <div className="font-medium mb-1">Horario de Atención</div>
                      <div className="text-muted-foreground text-sm">
                        Lunes - Viernes: 9:00 AM - 7:00 PM<br />
                        Sábado: 10:00 AM - 4:00 PM
                      </div>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    </section>
  );
}
