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
      { value: "5000+", label: "Clients Served Nationwide" },
      { value: "98%", label: "Client Satisfaction" },
      { value: "24/7", label: "Secure Client Portal Access" },
    ],
    es: [
      { value: "18+", label: "Años de Experiencia" },
      { value: "5000+", label: "Clientes Atendidos" },
      { value: "98%", label: "Satisfacción del Cliente" },
      { value: "24/7", label: "Acceso al Portal Seguro" },
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
    en: { part1: "Tax Preparation Services Nationwide", highlight: "for Individuals and Businesses", part2: "" },
    es: { part1: "Servicios de Preparación de Impuestos a Nivel Nacional", highlight: "para Individuos y Empresas", part2: "" },
    fr: { part1: "Services de Préparation Fiscale à l'Échelle Nationale", highlight: "pour Particuliers et Entreprises", part2: "" },
    pt: { part1: "Serviços de Preparação de Impostos em Todo o País", highlight: "para Indivíduos e Empresas", part2: "" },
    zh: { part1: "全国税务准备服务", highlight: "面向个人和企业", part2: "" },
    ht: { part1: "Sèvis Preparasyon Taks nan Tout Peyi a", highlight: "pou Moun ak Biznis", part2: "" },
  };

  const heroDescription = {
    en: "IRS-authorized tax professionals with over 18 years of experience, delivering secure, accurate, and personalized tax solutions in English and Spanish — supported by a private client portal for document upload and IRS record access.",
    es: "Profesionales de impuestos autorizados por el IRS con más de 18 años de experiencia, ofreciendo soluciones fiscales seguras, precisas y personalizadas en inglés y español — respaldadas por un portal privado de clientes para carga de documentos y acceso a registros del IRS.",
    fr: "Professionnels fiscaux autorisés par l'IRS avec plus de 18 ans d'expérience, offrant des solutions fiscales sécurisées, précises et personnalisées en anglais et espagnol — soutenues par un portail client privé pour le téléchargement de documents et l'accès aux dossiers IRS.",
    pt: "Profissionais fiscais autorizados pelo IRS com mais de 18 anos de experiência, oferecendo soluções fiscais seguras, precisas e personalizadas em inglês e espanhol — apoiadas por um portal privado de clientes para upload de documentos e acesso a registros do IRS.",
    zh: "IRS授权的税务专业人士，拥有超过18年的经验，提供安全、准确和个性化的税务解决方案（英语和西班牙语）— 支持私人客户门户，用于文档上传和IRS记录访问。",
    ht: "Pwofesyonèl taks otorize pa IRS ak plis pase 18 ane eksperyans, ofri solisyon taks sekirize, egzat ak pèsonalize an Angle ak Panyòl — sipòte pa yon pòtay kliyan prive pou telechaje dokiman ak aksè dosye IRS.",
  };

  const scheduleButton = {
    en: "Request a Private Tax Consultation",
    es: "Solicitar Consulta Fiscal Privada",
    fr: "Demander une Consultation Fiscale Privée",
    pt: "Solicitar Consulta Fiscal Privada",
    zh: "请求私人税务咨询",
    ht: "Mande Konsiltasyon Taks Prive",
  };

  const portalButton = {
    en: "Client Portal",
    es: "Portal de Clientes",
    fr: "Portail Client",
    pt: "Portal do Cliente",
    zh: "客户门户",
    ht: "Pòtay Kliyan",
  };

  const portalMicrocopy = {
    en: "Secure portal for document upload, tax history, and IRS records — available 24/7.",
    es: "Portal seguro para carga de documentos, historial fiscal y registros del IRS — disponible 24/7.",
    fr: "Portail sécurisé pour le téléchargement de documents, l'historique fiscal et les dossiers IRS — disponible 24/7.",
    pt: "Portal seguro para upload de documentos, histórico fiscal e registros do IRS — disponível 24/7.",
    zh: "安全门户，用于文档上传、税务历史和IRS记录 — 24/7可用。",
    ht: "Pòtay sekirize pou telechaje dokiman, istwa taks ak dosye IRS — disponib 24/7.",
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

            <div className="flex flex-col items-center sm:items-start gap-2">
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
              <p className="text-sm text-white/60 text-center sm:text-left max-w-xs">
                {portalMicrocopy[language] || portalMicrocopy.en}
              </p>
            </div>
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
