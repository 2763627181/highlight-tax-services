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
      title: "About Us",
      description: "Highlight Tax Services provides reliable tax preparation services for employees, business owners and self-employed individuals throughout the United States. With over 18 years of experience, we guarantee clear, secure processes focused on maximizing your benefits.",
      highlights: [
        "18+ years of experience",
        "Personalized service",
        "Absolute confidentiality",
        "Multilingual support",
      ],
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
      title: "Sobre Nosotros",
      description: "Highlight Tax Services brinda servicios confiables de preparación de impuestos para empleados, dueños de negocios y trabajadores independientes en todo Estados Unidos. Con más de 18 años de experiencia, garantizamos procesos claros, seguros y orientados a maximizar tus beneficios.",
      highlights: [
        "18+ años de experiencia",
        "Servicio personalizado",
        "Confidencialidad absoluta",
        "Atención multilingüe",
      ],
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
      title: "À Propos de Nous",
      description: "Highlight Tax Services fournit des services fiables de préparation fiscale pour les employés, propriétaires d'entreprise et travailleurs indépendants à travers les États-Unis. Avec plus de 18 ans d'expérience, nous garantissons des processus clairs et sécurisés axés sur la maximisation de vos avantages.",
      highlights: [
        "18+ ans d'expérience",
        "Service personnalisé",
        "Confidentialité absolue",
        "Support multilingue",
      ],
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
      title: "Sobre Nós",
      description: "A Highlight Tax Services oferece serviços confiáveis de preparação de impostos para funcionários, donos de negócios e autônomos em todos os Estados Unidos. Com mais de 18 anos de experiência, garantimos processos claros e seguros focados em maximizar seus benefícios.",
      highlights: [
        "18+ anos de experiência",
        "Serviço personalizado",
        "Confidencialidade absoluta",
        "Suporte multilíngue",
      ],
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
      title: "关于我们",
      description: "Highlight Tax Services为全美的员工、企业主和自雇人士提供可靠的税务准备服务。凭借超过18年的经验，我们保证清晰、安全的流程，专注于最大化您的利益。",
      highlights: [
        "18+年经验",
        "个性化服务",
        "绝对保密",
        "多语言支持",
      ],
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
      title: "Sou Nou",
      description: "Highlight Tax Services bay sèvis preparasyon taks fyab pou anplwaye, pwopriyetè biznis ak travayè endepandan nan tout Etazini. Avèk plis pase 18 ane eksperyans, nou garanti pwosesis klè, sekirize ak oryante pou maksimize benefis ou yo.",
      highlights: [
        "18+ ane eksperyans",
        "Sèvis pèsonalize",
        "Konfidansyalite absoli",
        "Sipò milti-lang",
      ],
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
      <div className="max-w-7xl mx-auto px-4 sm:px-6">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-start">
          <div className="space-y-6">
            <div>
              <h2 className="text-3xl sm:text-4xl font-bold mb-4">
                {currentContent.title}
              </h2>
              <div className="h-1 w-20 bg-accent rounded-full" />
            </div>

            <p className="text-lg text-muted-foreground leading-relaxed">
              {currentContent.description}
            </p>

            <div className="space-y-3 pt-4">
              {currentContent.highlights.map((item) => (
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
                <div className="font-semibold text-lg">{currentContent.certified}</div>
                <div className="text-muted-foreground">{currentContent.irsAuthorized}</div>
              </div>
            </div>
          </div>

          <div className="space-y-6">
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
      </div>
    </section>
  );
}
