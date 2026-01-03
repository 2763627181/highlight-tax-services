import { Award, Zap, Languages, Shield } from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";

const benefits = [
  {
    icon: Award,
    title: "Preparadores Certificados",
    description: "Expertos con certificación IRS y años de experiencia comprobada",
  },
  {
    icon: Zap,
    title: "Reembolsos Rápidos",
    description: "Procesamiento eficiente para obtener tu dinero lo antes posible",
  },
  {
    icon: Languages,
    title: "Servicio Bilingüe",
    description: "Atención personalizada en inglés y español para tu comodidad",
  },
  {
    icon: Shield,
    title: "Total Confidencialidad",
    description: "Tu información protegida con los más altos estándares de seguridad",
  },
];

export function BenefitsSection() {
  return (
    <section className="py-16 bg-muted/30" data-testid="section-benefits">
      <div className="max-w-7xl mx-auto px-4 sm:px-6">
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
          {benefits.map((benefit, index) => (
            <Card 
              key={benefit.title} 
              className="bg-background border-0 shadow-sm hover-elevate transition-all duration-300"
              data-testid={`card-benefit-${index}`}
            >
              <CardContent className="p-6 text-center">
                <div className="inline-flex items-center justify-center h-14 w-14 rounded-full bg-primary/10 text-primary mb-4">
                  <benefit.icon className="h-7 w-7" />
                </div>
                <h3 className="font-semibold text-lg mb-2">{benefit.title}</h3>
                <p className="text-sm text-muted-foreground leading-relaxed">
                  {benefit.description}
                </p>
              </CardContent>
            </Card>
          ))}
        </div>
      </div>
    </section>
  );
}
