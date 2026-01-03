/**
 * @fileoverview Services Section Component
 * Sección de servicios con soporte multi-idioma
 */

import { 
  FileText, 
  Car, 
  Building2, 
  CreditCard, 
  BookOpen, 
  FileEdit
} from "lucide-react";
import { Card, CardContent, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { SiWhatsapp } from "react-icons/si";
import { useI18n } from "@/lib/i18n";

const WHATSAPP_NUMBER = "19172574554";

const whatsappMessages = {
  en: {
    personal: "Hello, I'm interested in Personal Tax Preparation (1040). Could you give me more information about prices and requirements?",
    "self-employed": "Hello, I'm self-employed and need help with my 1099 taxes. What documents do I need and what is the cost?",
    business: "Hello, I have a business and need help with Business Taxes (LLC/Schedule C). Could you advise me on this service?",
    itin: "Hello, I need information about the ITIN (Application/Renewal) service. What are the requirements and process?",
    bookkeeping: "Hello, I'm interested in Monthly Bookkeeping service for my business. What is the cost and what does it include?",
    amendments: "Hello, I need to make a correction to my previous tax return (1040X). Can you help me with this?",
  },
  es: {
    personal: "Hola, estoy interesado en el servicio de Preparación de Taxes Personales (1040). ¿Podrían darme más información sobre precios y requisitos?",
    "self-employed": "Hola, soy trabajador independiente y necesito ayuda con mis impuestos 1099. ¿Qué documentos necesito y cuál es el costo del servicio?",
    business: "Hola, tengo un negocio y necesito ayuda con Business Taxes (LLC/Schedule C). ¿Podrían asesorarme sobre este servicio?",
    itin: "Hola, necesito información sobre el servicio de ITIN (Aplicación/Renovación). ¿Cuáles son los requisitos y el proceso?",
    bookkeeping: "Hola, me interesa el servicio de Bookkeeping Mensual para mi negocio. ¿Cuál es el costo y qué incluye?",
    amendments: "Hola, necesito hacer una corrección a mi declaración de impuestos anterior (1040X). ¿Pueden ayudarme con esto?",
  },
  fr: {
    personal: "Bonjour, je suis intéressé par la préparation des impôts personnels (1040). Pourriez-vous me donner plus d'informations sur les prix et les exigences?",
    "self-employed": "Bonjour, je suis travailleur indépendant et j'ai besoin d'aide avec mes impôts 1099. De quels documents ai-je besoin et quel est le coût?",
    business: "Bonjour, j'ai une entreprise et j'ai besoin d'aide avec les impôts d'entreprise (LLC/Schedule C). Pourriez-vous me conseiller?",
    itin: "Bonjour, j'ai besoin d'informations sur le service ITIN (Demande/Renouvellement). Quelles sont les exigences et le processus?",
    bookkeeping: "Bonjour, je suis intéressé par le service de comptabilité mensuelle pour mon entreprise. Quel est le coût et qu'est-ce qui est inclus?",
    amendments: "Bonjour, j'ai besoin de faire une correction à ma déclaration de revenus précédente (1040X). Pouvez-vous m'aider?",
  },
  pt: {
    personal: "Olá, estou interessado na Preparação de Impostos Pessoais (1040). Vocês podem me dar mais informações sobre preços e requisitos?",
    "self-employed": "Olá, sou autônomo e preciso de ajuda com meus impostos 1099. Quais documentos preciso e qual é o custo?",
    business: "Olá, tenho um negócio e preciso de ajuda com Impostos Empresariais (LLC/Schedule C). Podem me orientar sobre este serviço?",
    itin: "Olá, preciso de informações sobre o serviço ITIN (Aplicação/Renovação). Quais são os requisitos e o processo?",
    bookkeeping: "Olá, estou interessado no serviço de Contabilidade Mensal para meu negócio. Qual é o custo e o que inclui?",
    amendments: "Olá, preciso fazer uma correção na minha declaração de impostos anterior (1040X). Vocês podem me ajudar?",
  },
  zh: {
    personal: "您好，我对个人税务准备（1040）感兴趣。您能给我更多关于价格和要求的信息吗？",
    "self-employed": "您好，我是自雇人士，需要帮助处理1099税务。我需要什么文件，费用是多少？",
    business: "您好，我有一家企业，需要帮助处理企业税务（LLC/Schedule C）。您能为我提供这项服务的建议吗？",
    itin: "您好，我需要关于ITIN（申请/续期）服务的信息。有什么要求和流程？",
    bookkeeping: "您好，我对我企业的月度记账服务感兴趣。费用是多少，包括什么？",
    amendments: "您好，我需要对我之前的税务申报（1040X）进行更正。你们能帮我吗？",
  },
  ht: {
    personal: "Bonjou, mwen enterese nan Preparasyon Taks Pèsonèl (1040). Èske ou ka ban m plis enfòmasyon sou pri ak egzijans?",
    "self-employed": "Bonjou, mwen se travayè endepandan e mwen bezwen èd ak taks 1099 mwen. Ki dokiman mwen bezwen e ki pri a?",
    business: "Bonjou, mwen gen yon biznis e mwen bezwen èd ak Taks Biznis (LLC/Schedule C). Èske ou ka konseye m sou sèvis sa a?",
    itin: "Bonjou, mwen bezwen enfòmasyon sou sèvis ITIN (Aplikasyon/Renouvèlman). Ki egzijans ak pwosesis yo?",
    bookkeeping: "Bonjou, mwen enterese nan sèvis Kontabilite Chak Mwa pou biznis mwen. Ki pri a e ki sa li enkli?",
    amendments: "Bonjou, mwen bezwen fè yon koreksyon nan deklarasyon taks anvan mwen (1040X). Èske ou ka ede m?",
  },
};

function getWhatsAppUrl(serviceKey: string, language: string): string {
  const messages = whatsappMessages[language as keyof typeof whatsappMessages] || whatsappMessages.en;
  const message = messages[serviceKey as keyof typeof messages] || messages.personal;
  const encodedMessage = encodeURIComponent(message);
  return `https://wa.me/${WHATSAPP_NUMBER}?text=${encodedMessage}`;
}

export function ServicesSection() {
  const { t, language } = useI18n();

  const services = {
    en: [
      {
        icon: FileText,
        title: "Personal Tax Preparation (1040)",
        description: "Individual tax returns for W-2 employees. We maximize your deductions and credits to get the best possible refund.",
        highlight: "Popular",
        serviceKey: "personal",
      },
      {
        icon: Car,
        title: "Self-Employed / 1099",
        description: "Specialized services for independent workers from Uber, Lyft, DoorDash and more. Includes mileage and expense deductions.",
        highlight: null,
        serviceKey: "self-employed",
      },
      {
        icon: Building2,
        title: "Business Taxes (LLC, Schedule C)",
        description: "Complete tax preparation for small businesses, LLCs and self-employed individuals with Schedule C.",
        highlight: null,
        serviceKey: "business",
      },
      {
        icon: CreditCard,
        title: "ITIN (Application and Renewal)",
        description: "Complete assistance to obtain or renew your Individual Taxpayer Identification Number (ITIN) from the IRS.",
        highlight: "Special Service",
        serviceKey: "itin",
      },
      {
        icon: BookOpen,
        title: "Monthly Bookkeeping",
        description: "We keep your accounting books up to date with monthly bookkeeping service for your business.",
        highlight: null,
        serviceKey: "bookkeeping",
      },
      {
        icon: FileEdit,
        title: "Tax Amendments (1040X)",
        description: "Corrections and amendments to previously filed tax returns. Recover lost refunds.",
        highlight: null,
        serviceKey: "amendments",
      },
    ],
    es: [
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
    ],
    fr: [
      {
        icon: FileText,
        title: "Préparation Fiscale Personnelle (1040)",
        description: "Déclarations d'impôts individuelles pour les employés W-2. Nous maximisons vos déductions et crédits pour obtenir le meilleur remboursement possible.",
        highlight: "Populaire",
        serviceKey: "personal",
      },
      {
        icon: Car,
        title: "Travailleur Indépendant / 1099",
        description: "Services spécialisés pour les travailleurs indépendants d'Uber, Lyft, DoorDash et plus. Inclut les déductions de kilométrage et de dépenses.",
        highlight: null,
        serviceKey: "self-employed",
      },
      {
        icon: Building2,
        title: "Impôts d'Entreprise (LLC, Schedule C)",
        description: "Préparation fiscale complète pour les petites entreprises, LLCs et travailleurs indépendants avec Schedule C.",
        highlight: null,
        serviceKey: "business",
      },
      {
        icon: CreditCard,
        title: "ITIN (Demande et Renouvellement)",
        description: "Assistance complète pour obtenir ou renouveler votre numéro d'identification fiscale individuel (ITIN) de l'IRS.",
        highlight: "Service Spécial",
        serviceKey: "itin",
      },
      {
        icon: BookOpen,
        title: "Comptabilité Mensuelle",
        description: "Nous gardons vos livres comptables à jour avec un service de comptabilité mensuelle pour votre entreprise.",
        highlight: null,
        serviceKey: "bookkeeping",
      },
      {
        icon: FileEdit,
        title: "Modifications Fiscales (1040X)",
        description: "Corrections et modifications aux déclarations de revenus précédemment déposées. Récupérez les remboursements perdus.",
        highlight: null,
        serviceKey: "amendments",
      },
    ],
    pt: [
      {
        icon: FileText,
        title: "Preparação de Impostos Pessoais (1040)",
        description: "Declarações de impostos individuais para funcionários W-2. Maximizamos suas deduções e créditos para obter a melhor restituição possível.",
        highlight: "Popular",
        serviceKey: "personal",
      },
      {
        icon: Car,
        title: "Autônomo / 1099",
        description: "Serviços especializados para trabalhadores independentes de Uber, Lyft, DoorDash e mais. Inclui deduções de quilometragem e despesas.",
        highlight: null,
        serviceKey: "self-employed",
      },
      {
        icon: Building2,
        title: "Impostos Empresariais (LLC, Schedule C)",
        description: "Preparação fiscal completa para pequenas empresas, LLCs e autônomos com Schedule C.",
        highlight: null,
        serviceKey: "business",
      },
      {
        icon: CreditCard,
        title: "ITIN (Aplicação e Renovação)",
        description: "Assistência completa para obter ou renovar seu Número de Identificação Fiscal Individual (ITIN) do IRS.",
        highlight: "Serviço Especial",
        serviceKey: "itin",
      },
      {
        icon: BookOpen,
        title: "Contabilidade Mensal",
        description: "Mantemos seus livros contábeis atualizados com serviço de contabilidade mensal para seu negócio.",
        highlight: null,
        serviceKey: "bookkeeping",
      },
      {
        icon: FileEdit,
        title: "Retificação de Impostos (1040X)",
        description: "Correções e alterações em declarações de impostos anteriormente enviadas. Recupere restituições perdidas.",
        highlight: null,
        serviceKey: "amendments",
      },
    ],
    zh: [
      {
        icon: FileText,
        title: "个人税务准备 (1040)",
        description: "W-2员工的个人税务申报。我们最大化您的扣除额和抵免额，以获得最佳退税。",
        highlight: "热门",
        serviceKey: "personal",
      },
      {
        icon: Car,
        title: "自雇 / 1099",
        description: "为Uber、Lyft、DoorDash等平台的独立工作者提供专业服务。包括里程和费用扣除。",
        highlight: null,
        serviceKey: "self-employed",
      },
      {
        icon: Building2,
        title: "企业税务 (LLC, Schedule C)",
        description: "为小型企业、LLC和Schedule C自雇人士提供完整的税务准备。",
        highlight: null,
        serviceKey: "business",
      },
      {
        icon: CreditCard,
        title: "ITIN (申请和续期)",
        description: "完整协助从IRS获取或续期您的个人纳税识别号（ITIN）。",
        highlight: "特别服务",
        serviceKey: "itin",
      },
      {
        icon: BookOpen,
        title: "月度记账",
        description: "我们通过月度记账服务为您的企业保持账簿更新。",
        highlight: null,
        serviceKey: "bookkeeping",
      },
      {
        icon: FileEdit,
        title: "税务修正 (1040X)",
        description: "对先前提交的税务申报进行更正和修改。找回丢失的退税。",
        highlight: null,
        serviceKey: "amendments",
      },
    ],
    ht: [
      {
        icon: FileText,
        title: "Preparasyon Taks Pèsonèl (1040)",
        description: "Deklarasyon taks endividyèl pou anplwaye W-2. Nou maksimize dediksyon ak kredi ou yo pou jwenn pi bon ranbousman posib.",
        highlight: "Popilè",
        serviceKey: "personal",
      },
      {
        icon: Car,
        title: "Travayè Endepandan / 1099",
        description: "Sèvis espesyalize pou travayè endepandan nan Uber, Lyft, DoorDash ak plis. Enkli dediksyon pou kilomèt ak depans.",
        highlight: null,
        serviceKey: "self-employed",
      },
      {
        icon: Building2,
        title: "Taks Biznis (LLC, Schedule C)",
        description: "Preparasyon taks konplè pou ti biznis, LLC ak travayè endepandan ak Schedule C.",
        highlight: null,
        serviceKey: "business",
      },
      {
        icon: CreditCard,
        title: "ITIN (Aplikasyon ak Renouvèlman)",
        description: "Asistans konplè pou jwenn oswa renouvle Nimewo Idantifikasyon Kontribyab Endividyèl (ITIN) ou nan IRS.",
        highlight: "Sèvis Espesyal",
        serviceKey: "itin",
      },
      {
        icon: BookOpen,
        title: "Kontabilite Chak Mwa",
        description: "Nou kenbe liv kontabilite ou yo ajou ak sèvis kontabilite chak mwa pou biznis ou.",
        highlight: null,
        serviceKey: "bookkeeping",
      },
      {
        icon: FileEdit,
        title: "Koreksyon Taks (1040X)",
        description: "Koreksyon ak modifikasyon nan deklarasyon taks ki te deja depoze. Rekipere ranbousman pèdi.",
        highlight: null,
        serviceKey: "amendments",
      },
    ],
  };

  const sectionTitle = {
    en: "Our Services",
    es: "Nuestros Servicios",
    fr: "Nos Services",
    pt: "Nossos Serviços",
    zh: "我们的服务",
    ht: "Sèvis Nou Yo",
  };

  const sectionSubtitle = {
    en: "We offer a complete range of tax preparation services for individuals and businesses throughout the United States.",
    es: "Ofrecemos una gama completa de servicios de preparación de impuestos para individuos y empresas en todo Estados Unidos.",
    fr: "Nous offrons une gamme complète de services de préparation fiscale pour les particuliers et les entreprises à travers les États-Unis.",
    pt: "Oferecemos uma gama completa de serviços de preparação de impostos para indivíduos e empresas em todos os Estados Unidos.",
    zh: "我们为全美的个人和企业提供完整的税务准备服务。",
    ht: "Nou ofri yon seri konplè sèvis preparasyon taks pou moun ak biznis nan tout Etazini.",
  };

  const requestInfoButton = {
    en: "Request Information",
    es: "Solicitar Información",
    fr: "Demander des Informations",
    pt: "Solicitar Informações",
    zh: "请求信息",
    ht: "Mande Enfòmasyon",
  };

  const currentServices = services[language as keyof typeof services] || services.en;

  return (
    <section id="services" className="py-20 scroll-mt-20" data-testid="section-services">
      <div className="max-w-7xl mx-auto px-4 sm:px-6">
        <div className="text-center mb-16">
          <h2 className="text-3xl sm:text-4xl font-bold mb-4">
            {sectionTitle[language as keyof typeof sectionTitle] || sectionTitle.en}
          </h2>
          <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
            {sectionSubtitle[language as keyof typeof sectionSubtitle] || sectionSubtitle.en}
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {currentServices.map((service, index) => (
            <Card 
              key={service.serviceKey} 
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
                  href={getWhatsAppUrl(service.serviceKey, language)}
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
                    {requestInfoButton[language as keyof typeof requestInfoButton] || requestInfoButton.en}
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
