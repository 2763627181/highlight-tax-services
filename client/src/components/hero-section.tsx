/**
 * @fileoverview Hero Section Component
 * Sección principal de la landing page con soporte multi-idioma
 */

import { Link } from "wouter";
import { Button } from "@/components/ui/button";
import { CalendarCheck, UserCircle, ArrowRight } from "lucide-react";
import { useI18n } from "@/lib/i18n";

export function HeroSection() {
  const { t, language } = useI18n();
  
  const handleScheduleClick = () => {
    const contactSection = document.getElementById("contact");
    if (contactSection) {
      contactSection.scrollIntoView({ behavior: "smooth" });
    }
  };

  const stats = {
    en: [
      { value: "18+", label: "Years of Experience" },
      { value: "5000+", label: "Satisfied Clients" },
      { value: "98%", label: "Success Rate" },
      { value: "24h", label: "Fast Response" },
    ],
    es: [
      { value: "18+", label: "Años de Experiencia" },
      { value: "5000+", label: "Clientes Satisfechos" },
      { value: "98%", label: "Tasa de Éxito" },
      { value: "24h", label: "Respuesta Rápida" },
    ],
    fr: [
      { value: "18+", label: "Années d'Expérience" },
      { value: "5000+", label: "Clients Satisfaits" },
      { value: "98%", label: "Taux de Réussite" },
      { value: "24h", label: "Réponse Rapide" },
    ],
    pt: [
      { value: "18+", label: "Anos de Experiência" },
      { value: "5000+", label: "Clientes Satisfeitos" },
      { value: "98%", label: "Taxa de Sucesso" },
      { value: "24h", label: "Resposta Rápida" },
    ],
    zh: [
      { value: "18+", label: "年经验" },
      { value: "5000+", label: "满意客户" },
      { value: "98%", label: "成功率" },
      { value: "24h", label: "快速响应" },
    ],
    ht: [
      { value: "18+", label: "Ane Eksperyans" },
      { value: "5000+", label: "Kliyan Satisfè" },
      { value: "98%", label: "To Siksè" },
      { value: "24h", label: "Repons Rapid" },
    ],
  };

  const seasonBanner = {
    en: "Tax Season 2025 - We're Ready",
    es: "Temporada de Impuestos 2025 - Estamos Listos",
    fr: "Saison Fiscale 2025 - Nous Sommes Prêts",
    pt: "Temporada de Impostos 2025 - Estamos Prontos",
    zh: "2025税季 - 我们已准备就绪",
    ht: "Sezon Taks 2025 - Nou Pare",
  };

  const heroHeadline = {
    en: { part1: "Maximize your refund", highlight: "with tax experts", part2: "" },
    es: { part1: "Maximiza tu reembolso", highlight: "con expertos", part2: "en impuestos" },
    fr: { part1: "Maximisez votre remboursement", highlight: "avec des experts", part2: "fiscaux" },
    pt: { part1: "Maximize sua restituição", highlight: "com especialistas", part2: "em impostos" },
    zh: { part1: "最大化您的退税", highlight: "与税务专家", part2: "一起" },
    ht: { part1: "Maksimize ranbousman ou", highlight: "ak ekspè", part2: "nan taks" },
  };

  const heroDescription = {
    en: "Certified preparers with over 18 years of experience. Personalized service in English and Spanish for employees, business owners, and self-employed individuals.",
    es: "Preparadores certificados con más de 18 años de experiencia. Servicio personalizado en inglés y español para empleados, dueños de negocios y trabajadores independientes.",
    fr: "Préparateurs certifiés avec plus de 18 ans d'expérience. Service personnalisé en anglais et espagnol pour employés, propriétaires d'entreprise et travailleurs indépendants.",
    pt: "Preparadores certificados com mais de 18 anos de experiência. Serviço personalizado em inglês e espanhol para funcionários, donos de negócios e autônomos.",
    zh: "拥有超过18年经验的认证准备者。为员工、企业主和自雇人士提供英语和西班牙语的个性化服务。",
    ht: "Preparatè sètifye ak plis pase 18 ane eksperyans. Sèvis pèsonalize an Angle ak Panyòl pou anplwaye, pwopriyetè biznis ak travayè endepandan.",
  };

  const scheduleButton = {
    en: "Schedule Appointment",
    es: "Agendar Cita",
    fr: "Prendre Rendez-vous",
    pt: "Agendar Consulta",
    zh: "预约咨询",
    ht: "Pran Randevou",
  };

  const portalButton = {
    en: "Client Portal",
    es: "Portal de Clientes",
    fr: "Portail Client",
    pt: "Portal do Cliente",
    zh: "客户门户",
    ht: "Pòtay Kliyan",
  };

  const currentStats = stats[language] || stats.en;
  const headline = heroHeadline[language] || heroHeadline.en;

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
            {seasonBanner[language] || seasonBanner.en}
          </div>

          <h1 className="text-4xl sm:text-5xl md:text-6xl lg:text-7xl font-bold text-white leading-tight tracking-tight">
            {headline.part1}{" "}
            <span className="text-[#2ECC71]">{headline.highlight}</span>{" "}
            {headline.part2}
          </h1>

          <p className="text-lg sm:text-xl text-white/80 max-w-2xl mx-auto leading-relaxed">
            {heroDescription[language] || heroDescription.en}
          </p>

          <div className="flex flex-col sm:flex-row items-center justify-center gap-4 pt-4">
            <Button
              size="lg"
              onClick={handleScheduleClick}
              className="w-full sm:w-auto bg-[#2ECC71] hover:bg-[#27ae60] text-white border-[#27ae60] text-lg px-8 py-6 font-semibold gap-2"
              data-testid="button-schedule-cta"
            >
              <CalendarCheck className="h-5 w-5" />
              {scheduleButton[language] || scheduleButton.en}
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
                {portalButton[language] || portalButton.en}
              </Button>
            </Link>
          </div>

          <div className="pt-8 grid grid-cols-2 md:grid-cols-4 gap-6 max-w-3xl mx-auto">
            {currentStats.map((stat) => (
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
