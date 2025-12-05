import { Link } from "wouter";
import { Button } from "@/components/ui/button";
import { CalendarCheck, UserCircle, ArrowRight } from "lucide-react";

export function HeroSection() {
  const handleScheduleClick = () => {
    const contactSection = document.getElementById("contact");
    if (contactSection) {
      contactSection.scrollIntoView({ behavior: "smooth" });
    }
  };

  return (
    <section 
      className="relative min-h-[90vh] flex items-center justify-center overflow-hidden"
      data-testid="section-hero"
    >
      <div 
        className="absolute inset-0 bg-cover bg-center bg-no-repeat"
        style={{
          backgroundImage: `linear-gradient(to bottom, rgba(10, 61, 98, 0.85), rgba(10, 61, 98, 0.95)), url('https://images.unsplash.com/photo-1554224155-8d04cb21cd6c?q=80&w=2070&auto=format&fit=crop')`,
        }}
      />
      
      <div className="absolute inset-0 bg-gradient-to-b from-transparent via-transparent to-background/20" />

      <div className="relative z-10 max-w-7xl mx-auto px-4 sm:px-6 py-20 text-center">
        <div className="max-w-4xl mx-auto space-y-8">
          <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-white/10 backdrop-blur-sm border border-white/20 text-white/90 text-sm font-medium">
            <span className="flex h-2 w-2 rounded-full bg-[#2ECC71] animate-pulse" />
            Temporada de Impuestos 2025 - Estamos Listos
          </div>

          <h1 className="text-4xl sm:text-5xl md:text-6xl lg:text-7xl font-bold text-white leading-tight tracking-tight">
            Maximiza tu reembolso{" "}
            <span className="text-[#2ECC71]">con expertos</span>{" "}
            en impuestos
          </h1>

          <p className="text-lg sm:text-xl text-white/80 max-w-2xl mx-auto leading-relaxed">
            Preparadores certificados con más de 10 años de experiencia. 
            Servicio personalizado en inglés y español para empleados, 
            dueños de negocios y trabajadores independientes.
          </p>

          <div className="flex flex-col sm:flex-row items-center justify-center gap-4 pt-4">
            <Button
              size="lg"
              onClick={handleScheduleClick}
              className="w-full sm:w-auto bg-[#2ECC71] hover:bg-[#27ae60] text-white border-[#27ae60] text-lg px-8 py-6 font-semibold gap-2"
              data-testid="button-schedule-cta"
            >
              <CalendarCheck className="h-5 w-5" />
              Agendar Cita
              <ArrowRight className="h-4 w-4" />
            </Button>

            <Link href="/portal">
              <Button
                size="lg"
                variant="outline"
                className="w-full sm:w-auto bg-white/10 backdrop-blur-sm border-white/30 text-white hover:bg-white/20 hover:text-white text-lg px-8 py-6 font-semibold gap-2"
                data-testid="button-portal-cta"
              >
                <UserCircle className="h-5 w-5" />
                Portal de Clientes
              </Button>
            </Link>
          </div>

          <div className="pt-8 grid grid-cols-2 md:grid-cols-4 gap-6 max-w-3xl mx-auto">
            {[
              { value: "10+", label: "Años de Experiencia" },
              { value: "5000+", label: "Clientes Satisfechos" },
              { value: "98%", label: "Tasa de Éxito" },
              { value: "24h", label: "Respuesta Rápida" },
            ].map((stat) => (
              <div key={stat.label} className="text-center">
                <div className="text-3xl sm:text-4xl font-bold text-[#2ECC71]">
                  {stat.value}
                </div>
                <div className="text-sm text-white/70 mt-1">{stat.label}</div>
              </div>
            ))}
          </div>
        </div>
      </div>

      <div className="absolute bottom-0 left-0 right-0 h-32 bg-gradient-to-t from-background to-transparent" />
    </section>
  );
}
