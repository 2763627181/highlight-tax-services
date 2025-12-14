/**
 * @fileoverview About Section Component
 * Sección sobre nosotros con soporte multi-idioma
 */

import { 
  CheckCircle, 
  MapPin, 
  Phone, 
  Mail,
  Clock,
  Award
} from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";
import { useI18n } from "@/lib/i18n";

export function AboutSection() {
  const { language } = useI18n();

  const content = {
    en: {
      title: "Why Clients Trust Highlight Tax Services",
      description: "Highlight Tax Services provides professional tax preparation services for individuals, business owners, and self-employed clients throughout the United States. With over 18 years of experience, we focus on accuracy, compliance, and long-term protection — supported by a secure client portal that allows clients to manage documents and access IRS records on demand.",
      highlights: [
        "IRS-Authorized Preparers",
        "Over 18 Years of Professional Experience",
        "Secure Client Portal for Documents & IRS Records",
        "Personalized Service — No Automated Guesswork",
        "Support Beyond Filing Season",
      ],
      aboutTitle: "About Highlight Tax Services",
      aboutDescription: "Highlight Tax Services provides professional tax preparation services for individuals, business owners, and self-employed clients throughout the United States. With over 18 years of experience, we focus on accuracy, compliance, and long-term protection — supported by a secure client portal that allows clients to manage documents and access IRS records on demand.",
      aboutHighlights: [
        "18+ years of experience",
        "Personalized service",
        "Absolute confidentiality",
        "Multilingual support (English & Spanish)",
        "Secure virtual filing available",
      ],
      localSEO: {
        title: "Tax Experts Nationwide",
        description: "Highlight Tax Services proudly serves individuals and businesses nationwide through secure virtual tax preparation. Whether you prefer in-person service or remote filing via our secure client portal, we provide accurate, confidential, and professional tax solutions.",
      },
      certified: "Certified Preparers",
      irsAuthorized: "IRS Authorized",
      contactTitle: "Contact Information",
      contactSubtitle: "We're here to help you with all your tax needs",
      addressLabel: "Address",
      phoneLabel: "Phone",
      emailLabel: "Email",
      hoursLabel: "Business Hours",
      weekdayHours: "Monday - Friday: 9:00 AM - 7:00 PM",
      weekendHours: "Saturday: 10:00 AM - 4:00 PM",
    },
    es: {
      title: "Por Qué los Clientes Confían en Highlight Tax Services",
      description: "Highlight Tax Services brinda servicios profesionales de preparación de impuestos para individuos, dueños de negocios y clientes autónomos en todo Estados Unidos. Con más de 18 años de experiencia, nos enfocamos en precisión, cumplimiento y protección a largo plazo — respaldados por un portal seguro de clientes que permite gestionar documentos y acceder a registros del IRS bajo demanda.",
      highlights: [
        "Preparadores Autorizados por el IRS",
        "Más de 18 Años de Experiencia Profesional",
        "Portal Seguro de Clientes para Documentos y Registros del IRS",
        "Servicio Personalizado — Sin Conjeturas Automatizadas",
        "Soporte Más Allá de la Temporada de Declaración",
      ],
      aboutTitle: "Sobre Highlight Tax Services",
      aboutDescription: "Highlight Tax Services brinda servicios profesionales de preparación de impuestos para individuos, dueños de negocios y clientes autónomos en todo Estados Unidos. Con más de 18 años de experiencia, nos enfocamos en precisión, cumplimiento y protección a largo plazo — respaldados por un portal seguro de clientes que permite gestionar documentos y acceder a registros del IRS bajo demanda.",
      aboutHighlights: [
        "18+ años de experiencia",
        "Servicio personalizado",
        "Confidencialidad absoluta",
        "Atención multilingüe (Inglés y Español)",
        "Presentación virtual segura disponible",
      ],
      localSEO: {
        title: "Expertos Fiscales a Nivel Nacional",
        description: "Highlight Tax Services atiende con orgullo a individuos y empresas a nivel nacional a través de preparación fiscal virtual segura. Ya sea que prefiera servicio en persona o presentación remota a través de nuestro portal seguro de clientes, brindamos soluciones fiscales precisas, confidenciales y profesionales.",
      },
      certified: "Preparadores Certificados",
      irsAuthorized: "Autorizados por el IRS",
      contactTitle: "Información de Contacto",
      contactSubtitle: "Estamos aquí para ayudarte con todas tus necesidades de impuestos",
      addressLabel: "Dirección",
      phoneLabel: "Teléfono",
      emailLabel: "Correo Electrónico",
      hoursLabel: "Horario de Atención",
      weekdayHours: "Lunes - Viernes: 9:00 AM - 7:00 PM",
      weekendHours: "Sábado: 10:00 AM - 4:00 PM",
    },
    fr: {
      title: "Pourquoi les Clients Font Confiance à Highlight Tax Services",
      description: "Highlight Tax Services fournit des services professionnels de préparation fiscale pour les particuliers, propriétaires d'entreprise et clients indépendants à travers les États-Unis. Avec plus de 18 ans d'expérience, nous nous concentrons sur la précision, la conformité et la protection à long terme — soutenus par un portail client sécurisé qui permet aux clients de gérer les documents et d'accéder aux dossiers IRS à la demande.",
      highlights: [
        "Préparateurs Autorisés par l'IRS",
        "Plus de 18 Ans d'Expérience Professionnelle",
        "Portail Client Sécurisé pour Documents et Dossiers IRS",
        "Service Personnalisé — Pas de Conjectures Automatisées",
        "Support au-delà de la Saison de Déclaration",
      ],
      aboutTitle: "À Propos de Highlight Tax Services",
      aboutDescription: "Highlight Tax Services fournit des services professionnels de préparation fiscale pour les particuliers, propriétaires d'entreprise et clients indépendants à travers les États-Unis. Avec plus de 18 ans d'expérience, nous nous concentrons sur la précision, la conformité et la protection à long terme — soutenus par un portail client sécurisé qui permet aux clients de gérer les documents et d'accéder aux dossiers IRS à la demande.",
      aboutHighlights: [
        "18+ ans d'expérience",
        "Service personnalisé",
        "Confidentialité absolue",
        "Support multilingue (Anglais et Espagnol)",
        "Déclaration virtuelle sécurisée disponible",
      ],
      localSEO: {
        title: "Experts Fiscaux à l'Échelle Nationale",
        description: "Highlight Tax Services sert fièrement les particuliers et les entreprises à l'échelle nationale grâce à une préparation fiscale virtuelle sécurisée. Que vous préfériez un service en personne ou une déclaration à distance via notre portail client sécurisé, nous fournissons des solutions fiscales précises, confidentielles et professionnelles.",
      },
      certified: "Préparateurs Certifiés",
      irsAuthorized: "Autorisés par l'IRS",
      contactTitle: "Informations de Contact",
      contactSubtitle: "Nous sommes là pour vous aider avec tous vos besoins fiscaux",
      addressLabel: "Adresse",
      phoneLabel: "Téléphone",
      emailLabel: "Email",
      hoursLabel: "Heures d'Ouverture",
      weekdayHours: "Lundi - Vendredi: 9h00 - 19h00",
      weekendHours: "Samedi: 10h00 - 16h00",
    },
    pt: {
      title: "Por Que os Clientes Confiam na Highlight Tax Services",
      description: "A Highlight Tax Services oferece serviços profissionais de preparação de impostos para indivíduos, donos de negócios e clientes autônomos em todos os Estados Unidos. Com mais de 18 anos de experiência, nos concentramos em precisão, conformidade e proteção a longo prazo — apoiados por um portal seguro de clientes que permite gerenciar documentos e acessar registros do IRS sob demanda.",
      highlights: [
        "Preparadores Autorizados pelo IRS",
        "Mais de 18 Anos de Experiência Profissional",
        "Portal Seguro de Clientes para Documentos e Registros do IRS",
        "Serviço Personalizado — Sem Conjecturas Automatizadas",
        "Suporte Além da Temporada de Declaração",
      ],
      aboutTitle: "Sobre a Highlight Tax Services",
      aboutDescription: "A Highlight Tax Services oferece serviços profissionais de preparação de impostos para indivíduos, donos de negócios e clientes autônomos em todos os Estados Unidos. Com mais de 18 anos de experiência, nos concentramos em precisão, conformidade e proteção a longo prazo — apoiados por um portal seguro de clientes que permite gerenciar documentos e acessar registros do IRS sob demanda.",
      aboutHighlights: [
        "18+ anos de experiência",
        "Serviço personalizado",
        "Confidencialidade absoluta",
        "Suporte multilíngue (Inglês e Espanhol)",
        "Declaração virtual segura disponível",
      ],
      localSEO: {
        title: "Especialistas Fiscais em Todo o País",
        description: "A Highlight Tax Services orgulhosamente atende indivíduos e empresas em todo o país através de preparação fiscal virtual segura. Se você prefere serviço presencial ou declaração remota via nosso portal seguro de clientes, fornecemos soluções fiscais precisas, confidenciais e profissionais.",
      },
      certified: "Preparadores Certificados",
      irsAuthorized: "Autorizados pelo IRS",
      contactTitle: "Informações de Contato",
      contactSubtitle: "Estamos aqui para ajudá-lo com todas as suas necessidades fiscais",
      addressLabel: "Endereço",
      phoneLabel: "Telefone",
      emailLabel: "Email",
      hoursLabel: "Horário de Funcionamento",
      weekdayHours: "Segunda - Sexta: 9:00 - 19:00",
      weekendHours: "Sábado: 10:00 - 16:00",
    },
    zh: {
      title: "为什么客户信任Highlight Tax Services",
      description: "Highlight Tax Services为全美的个人、企业主和自雇客户提供专业的税务准备服务。凭借超过18年的经验，我们专注于准确性、合规性和长期保护 — 由安全的客户门户支持，允许客户管理文档并按需访问IRS记录。",
      highlights: [
        "IRS授权的准备者",
        "超过18年的专业经验",
        "安全的客户门户（文档和IRS记录）",
        "个性化服务 — 无自动化猜测",
        "申报季节之外的支持",
      ],
      aboutTitle: "关于Highlight Tax Services",
      aboutDescription: "Highlight Tax Services为全美的个人、企业主和自雇客户提供专业的税务准备服务。凭借超过18年的经验，我们专注于准确性、合规性和长期保护 — 由安全的客户门户支持，允许客户管理文档并按需访问IRS记录。",
      aboutHighlights: [
        "18+年经验",
        "个性化服务",
        "绝对保密",
        "多语言支持（英语和西班牙语）",
        "提供安全的虚拟申报",
      ],
      localSEO: {
        title: "全国税务专家",
        description: "Highlight Tax Services自豪地为全国客户通过安全的虚拟税务准备提供服务。无论您喜欢面对面服务还是通过我们安全的客户门户进行远程申报，我们都提供准确、保密和专业的税务解决方案。",
      },
      certified: "认证准备者",
      irsAuthorized: "IRS授权",
      contactTitle: "联系信息",
      contactSubtitle: "我们随时为您的所有税务需求提供帮助",
      addressLabel: "地址",
      phoneLabel: "电话",
      emailLabel: "电子邮件",
      hoursLabel: "营业时间",
      weekdayHours: "周一至周五: 上午9点 - 下午7点",
      weekendHours: "周六: 上午10点 - 下午4点",
    },
    ht: {
      title: "Poukisa Kliyan Fè Konfyans nan Highlight Tax Services",
      description: "Highlight Tax Services bay sèvis preparasyon taks pwofesyonèl pou moun, pwopriyetè biznis ak kliyan endepandan nan tout Etazini. Avèk plis pase 18 ane eksperyans, nou konsantre sou presizyon, konfòmite ak pwoteksyon alontèm — sipòte pa yon pòtay kliyan sekirize ki pèmèt kliyan jere dokiman ak aksede dosye IRS sou demann.",
      highlights: [
        "Preparatè Otorize pa IRS",
        "Plis pase 18 Ane Eksperyans Pwofesyonèl",
        "Pòtay Kliyan Sekirize pou Dokiman ak Dosye IRS",
        "Sèvis Pèsonalize — Pa Gen Devine Otomatik",
        "Sipò Depase Sezon Depoze",
      ],
      aboutTitle: "Sou Highlight Tax Services",
      aboutDescription: "Highlight Tax Services bay sèvis preparasyon taks pwofesyonèl pou moun, pwopriyetè biznis ak kliyan endepandan nan tout Etazini. Avèk plis pase 18 ane eksperyans, nou konsantre sou presizyon, konfòmite ak pwoteksyon alontèm — sipòte pa yon pòtay kliyan sekirize ki pèmèt kliyan jere dokiman ak aksede dosye IRS sou demann.",
      aboutHighlights: [
        "18+ ane eksperyans",
        "Sèvis pèsonalize",
        "Konfidansyalite absoli",
        "Sipò milti-lang (Angle ak Panyòl)",
        "Depoze virtual sekirize disponib",
      ],
      localSEO: {
        title: "Ekspè Taks nan Tout Peyi a",
        description: "Highlight Tax Services avèk fyète sèvi moun ak biznis nan tout peyi a atravè preparasyon taks virtual sekirize. Kit ou prefere sèvis an pèsòn oswa depoze aleka atravè pòtay kliyan sekirize nou an, nou bay solisyon taks egzat, konfidansyèl ak pwofesyonèl.",
      },
      certified: "Preparatè Sètifye",
      irsAuthorized: "Otorize pa IRS",
      contactTitle: "Enfòmasyon Kontak",
      contactSubtitle: "Nou la pou ede w ak tout bezwen taks ou yo",
      addressLabel: "Adrès",
      phoneLabel: "Telefòn",
      emailLabel: "Imèl",
      hoursLabel: "Lè Travay",
      weekdayHours: "Lendi - Vandredi: 9:00 AM - 7:00 PM",
      weekendHours: "Samdi: 10:00 AM - 4:00 PM",
    },
  };

  const currentContent = content[language as keyof typeof content] || content.en;

  return (
    <section id="about" className="py-20 bg-muted/30 scroll-mt-20" data-testid="section-about">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 space-y-16">
        {/* Por qué confían */}
        <div>
          <div className="text-center mb-12">
            <h2 className="text-3xl sm:text-4xl font-bold mb-4">
              {currentContent.title}
            </h2>
            <div className="h-1 w-20 bg-accent rounded-full mx-auto" />
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 max-w-5xl mx-auto">
            {currentContent.highlights.map((item) => (
              <div key={item} className="flex items-start gap-3">
                <CheckCircle className="h-5 w-5 text-primary shrink-0 mt-0.5" />
                <span className="font-medium text-muted-foreground">{item}</span>
              </div>
            ))}
          </div>
        </div>

        {/* Sobre Highlight Tax Services */}
        {currentContent.aboutTitle && (
          <div>
            <div className="text-center mb-8">
              <h2 className="text-3xl sm:text-4xl font-bold mb-4">
                {currentContent.aboutTitle}
              </h2>
              <div className="h-1 w-20 bg-accent rounded-full mx-auto" />
            </div>
            <p className="text-lg text-muted-foreground leading-relaxed max-w-3xl mx-auto text-center mb-8">
              {currentContent.aboutDescription || currentContent.description}
            </p>
            {currentContent.aboutHighlights && (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 max-w-4xl mx-auto">
                {currentContent.aboutHighlights.map((item) => (
                  <div key={item} className="flex items-center gap-3">
                    <CheckCircle className="h-5 w-5 text-primary shrink-0" />
                    <span className="text-muted-foreground">{item}</span>
                  </div>
                ))}
              </div>
            )}
          </div>
        )}

        {/* SEO Local - Nationwide */}
        {currentContent.localSEO && (
          <Card className="bg-gradient-to-br from-primary/5 to-primary/10">
            <CardContent className="p-8 text-center">
              <h3 className="text-2xl sm:text-3xl font-bold mb-4">
                {currentContent.localSEO.title}
              </h3>
              <p className="text-lg text-muted-foreground leading-relaxed max-w-3xl mx-auto">
                {currentContent.localSEO.description}
              </p>
            </CardContent>
          </Card>
        )}

        {/* Contact Information */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-start">
          <div className="space-y-6">
            <div className="flex items-center gap-4">
              <div className="flex h-16 w-16 items-center justify-center rounded-full bg-primary/10 text-primary">
                <Award className="h-8 w-8" />
              </div>
              <div>
                <div className="font-semibold text-lg">{currentContent.certified}</div>
                <div className="text-muted-foreground">{currentContent.irsAuthorized}</div>
              </div>
            </div>
          </div>

          <Card className="overflow-hidden" data-testid="card-contact-info">
            <CardContent className="p-0">
              <div className="bg-primary text-primary-foreground p-6">
                <h3 className="text-xl font-semibold mb-2">{currentContent.contactTitle}</h3>
                <p className="text-primary-foreground/80 text-sm">
                  {currentContent.contactSubtitle}
                </p>
              </div>

              <div className="p-6 space-y-5">
                <div className="flex items-start gap-4">
                  <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-lg bg-primary/10 text-primary">
                    <MapPin className="h-5 w-5" />
                  </div>
                  <div>
                    <div className="font-medium mb-1">{currentContent.addressLabel}</div>
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
                    <div className="font-medium mb-1">{currentContent.phoneLabel}</div>
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
                    <div className="font-medium mb-1">{currentContent.emailLabel}</div>
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
                    <div className="font-medium mb-1">{currentContent.hoursLabel}</div>
                    <div className="text-muted-foreground text-sm">
                      {currentContent.weekdayHours}<br />
                      {currentContent.weekendHours}
                    </div>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </section>
  );
}
