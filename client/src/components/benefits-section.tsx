/**
 * @fileoverview Benefits Section Component
 * Sección de beneficios con "A quién servimos", "Confidencialidad" y "Client Portal"
 */

import { Link } from "wouter";
import { 
  Users, 
  Shield, 
  Lock, 
  Upload, 
  FileText, 
  MessageSquare, 
  Clock,
  CheckCircle2
} from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { useI18n } from "@/lib/i18n";

export function BenefitsSection() {
  const { language } = useI18n();

  const content = {
    en: {
      whoWeServe: {
        title: "Who We Specialize In",
        description: "We work with clients who value accuracy, privacy, and convenience:",
        clients: [
          "Business owners & LLCs",
          "Self-employed professionals & independent contractors",
          "High-income W-2 earners with complex returns",
          "Gig workers (Uber, Lyft, DoorDash, freelancers)",
          "ITIN filers and immigrant families",
          "Clients who prefer secure virtual tax preparation with document upload and remote access",
        ],
        footer: "Whether local or remote, our clients benefit from professional oversight with modern, secure technology.",
      },
      confidentiality: {
        title: "Total Confidentiality & Secure Access",
        description: "Your information is protected using industry-standard encryption, secure cloud storage, and a private client portal that allows you to upload documents, communicate securely, and access your tax records — anytime, anywhere.",
      },
      clientPortal: {
        title: "Secure Client Portal — File Taxes Virtually with Confidence",
        description: "Our secure client portal allows you to:",
        features: [
          "Upload tax documents safely from any device",
          "Access prior-year tax returns and IRS records on demand",
          "Communicate securely with your tax preparer",
          "Track your tax filing progress in real time",
          "Eliminate unnecessary office visits",
        ],
        cta: "Access Client Portal",
      },
    },
    es: {
      whoWeServe: {
        title: "A Quién Servimos",
        description: "Trabajamos con clientes que valoran la precisión, privacidad y conveniencia:",
        clients: [
          "Dueños de negocios y LLCs",
          "Profesionales independientes y contratistas",
          "Asalariados W-2 de altos ingresos con declaraciones complejas",
          "Trabajadores de economía gig (Uber, Lyft, DoorDash, freelancers)",
          "Solicitantes de ITIN y familias inmigrantes",
          "Clientes que prefieren preparación fiscal virtual segura con carga de documentos y acceso remoto",
        ],
        footer: "Ya sea local o remoto, nuestros clientes se benefician de supervisión profesional con tecnología moderna y segura.",
      },
      confidentiality: {
        title: "Total Confidencialidad y Acceso Seguro",
        description: "Su información está protegida mediante encriptación de estándar industrial, almacenamiento seguro en la nube y un portal privado de clientes que le permite cargar documentos, comunicarse de forma segura y acceder a sus registros fiscales — en cualquier momento y lugar.",
      },
      clientPortal: {
        title: "Portal Seguro de Clientes — Presente Impuestos Virtualmente con Confianza",
        description: "Nuestro portal seguro de clientes le permite:",
        features: [
          "Cargar documentos fiscales de forma segura desde cualquier dispositivo",
          "Acceder a declaraciones de años anteriores y registros del IRS bajo demanda",
          "Comunicarse de forma segura con su preparador de impuestos",
          "Rastrear el progreso de su declaración fiscal en tiempo real",
          "Eliminar visitas innecesarias a la oficina",
        ],
        cta: "Acceder al Portal de Clientes",
      },
    },
    fr: {
      whoWeServe: {
        title: "À Qui Nous Servons",
        description: "Nous travaillons avec des clients qui valorisent la précision, la confidentialité et la commodité:",
        clients: [
          "Propriétaires d'entreprise et LLCs",
          "Professionnels indépendants et entrepreneurs",
          "Salariés W-2 à revenus élevés avec déclarations complexes",
          "Travailleurs de l'économie des petits boulots (Uber, Lyft, DoorDash, freelancers)",
          "Déclarants ITIN et familles immigrantes",
          "Clients qui préfèrent la préparation fiscale virtuelle sécurisée avec téléchargement de documents et accès à distance",
        ],
        footer: "Que ce soit local ou à distance, nos clients bénéficient d'une supervision professionnelle avec une technologie moderne et sécurisée.",
      },
      confidentiality: {
        title: "Confidentialité Totale et Accès Sécurisé",
        description: "Vos informations sont protégées par un chiffrement de niveau industriel, un stockage cloud sécurisé et un portail client privé qui vous permet de télécharger des documents, de communiquer en toute sécurité et d'accéder à vos dossiers fiscaux — à tout moment, n'importe où.",
      },
      clientPortal: {
        title: "Portail Client Sécurisé — Déclarez vos Impôts Virtuellement en Toute Confiance",
        description: "Notre portail client sécurisé vous permet de:",
        features: [
          "Télécharger des documents fiscaux en toute sécurité depuis n'importe quel appareil",
          "Accéder aux déclarations des années précédentes et aux dossiers IRS à la demande",
          "Communiquer en toute sécurité avec votre préparateur fiscal",
          "Suivre l'avancement de votre déclaration fiscale en temps réel",
          "Éliminer les visites de bureau inutiles",
        ],
        cta: "Accéder au Portail Client",
      },
    },
    pt: {
      whoWeServe: {
        title: "Para Quem Servimos",
        description: "Trabalhamos com clientes que valorizam precisão, privacidade e conveniência:",
        clients: [
          "Proprietários de negócios e LLCs",
          "Profissionais autônomos e contratados independentes",
          "Assalariados W-2 de alta renda com declarações complexas",
          "Trabalhadores da economia gig (Uber, Lyft, DoorDash, freelancers)",
          "Solicitantes de ITIN e famílias imigrantes",
          "Clientes que preferem preparação fiscal virtual segura com upload de documentos e acesso remoto",
        ],
        footer: "Seja local ou remoto, nossos clientes se beneficiam de supervisão profissional com tecnologia moderna e segura.",
      },
      confidentiality: {
        title: "Total Confidencialidade e Acesso Seguro",
        description: "Suas informações estão protegidas usando criptografia de padrão da indústria, armazenamento seguro em nuvem e um portal privado de clientes que permite fazer upload de documentos, comunicar-se com segurança e acessar seus registros fiscais — a qualquer hora, em qualquer lugar.",
      },
      clientPortal: {
        title: "Portal Seguro do Cliente — Declare Impostos Virtualmente com Confiança",
        description: "Nosso portal seguro de clientes permite que você:",
        features: [
          "Faça upload de documentos fiscais com segurança de qualquer dispositivo",
          "Acesse declarações de anos anteriores e registros do IRS sob demanda",
          "Comunique-se com segurança com seu preparador fiscal",
          "Acompanhe o progresso de sua declaração fiscal em tempo real",
          "Elimine visitas desnecessárias ao escritório",
        ],
        cta: "Acessar Portal do Cliente",
      },
    },
    zh: {
      whoWeServe: {
        title: "我们服务的对象",
        description: "我们为重视准确性、隐私和便利的客户提供服务:",
        clients: [
          "企业主和LLC",
          "自雇专业人士和独立承包商",
          "高收入W-2收入者（复杂申报）",
          "零工经济工作者（Uber、Lyft、DoorDash、自由职业者）",
          "ITIN申请者和移民家庭",
          "偏好安全虚拟税务准备、文档上传和远程访问的客户",
        ],
        footer: "无论是本地还是远程，我们的客户都能从现代、安全技术的专业监督中受益。",
      },
      confidentiality: {
        title: "完全保密和安全访问",
        description: "您的信息通过行业标准加密、安全云存储和私人客户门户进行保护，允许您上传文档、安全通信并访问您的税务记录 — 随时随地。",
      },
      clientPortal: {
        title: "安全客户门户 — 虚拟报税，充满信心",
        description: "我们的安全客户门户允许您:",
        features: [
          "从任何设备安全上传税务文档",
          "按需访问往年税务申报和IRS记录",
          "与您的税务准备者安全通信",
          "实时跟踪您的税务申报进度",
          "消除不必要的办公室访问",
        ],
        cta: "访问客户门户",
      },
    },
    ht: {
      whoWeServe: {
        title: "Moun Nou Sèvi",
        description: "Nou travay ak kliyan ki valè presizyon, vi prive ak konvenyans:",
        clients: [
          "Pwopriyetè biznis ak LLCs",
          "Pwofesyonèl endepandan ak kontraktè",
          "Moun ki genyen W-2 ak gwo revni ak deklarasyon konplèks",
          "Travayè gig (Uber, Lyft, DoorDash, freelancers)",
          "Moun ki depoze ITIN ak fanmi imigran",
          "Kliyan ki prefere preparasyon taks virtual sekirize ak telechaje dokiman ak aksè aleka",
        ],
        footer: "Kit se lokal oswa aleka, kliyan nou yo benefisye de sipèvizyon pwofesyonèl ak teknoloji modèn ak sekirize.",
      },
      confidentiality: {
        title: "Konfidansyalite Total ak Aksè Sekirize",
        description: "Enfòmasyon ou yo pwoteje lè l sèvi avèk chifreman estanda endistri, depo nwaj sekirize, ak yon pòtay kliyan prive ki pèmèt ou telechaje dokiman, kominike an sekirite, epi aksede dosye taks ou yo — nenpòt lè, nenpòt kote.",
      },
      clientPortal: {
        title: "Pòtay Kliyan Sekirize — Depoze Taks Virtualman ak Konfyans",
        description: "Pòtay kliyan sekirize nou an pèmèt ou:",
        features: [
          "Telechaje dokiman taks an sekirite nan nenpòt aparèy",
          "Aksede deklarasyon ane anvan yo ak dosye IRS sou demann",
          "Kominike an sekirite ak preparatè taks ou a",
          "Swiv pwogrè depoze taks ou an an tan reyèl",
          "Elimine vizit biwo nesesè",
        ],
        cta: "Aksede Pòtay Kliyan",
      },
    },
  };

  const currentContent = content[language as keyof typeof content] || content.en;

  return (
    <section className="py-20 bg-muted/30" data-testid="section-benefits">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 space-y-20">
        {/* A QUIÉN SERVIMOS */}
        <div>
          <div className="text-center mb-12">
            <h2 className="text-3xl sm:text-4xl font-bold mb-4">
              {currentContent.whoWeServe.title}
            </h2>
            <p className="text-lg text-muted-foreground max-w-3xl mx-auto">
              {currentContent.whoWeServe.description}
            </p>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 max-w-5xl mx-auto">
            {currentContent.whoWeServe.clients.map((client, index) => (
              <div key={index} className="flex items-start gap-3">
                <CheckCircle2 className="h-5 w-5 text-primary shrink-0 mt-0.5" />
                <span className="text-muted-foreground">{client}</span>
              </div>
            ))}
          </div>
          <p className="text-center text-muted-foreground mt-8 max-w-3xl mx-auto">
            {currentContent.whoWeServe.footer}
          </p>
        </div>

        {/* CONFIDENCIALIDAD Y SEGURIDAD */}
        <Card className="bg-background">
          <CardHeader>
            <div className="flex items-center gap-3 mb-2">
              <div className="flex h-12 w-12 items-center justify-center rounded-lg bg-primary/10 text-primary">
                <Shield className="h-6 w-6" />
              </div>
              <CardTitle className="text-2xl">
                {currentContent.confidentiality.title}
              </CardTitle>
            </div>
          </CardHeader>
          <CardContent>
            <p className="text-muted-foreground leading-relaxed text-lg">
              {currentContent.confidentiality.description}
            </p>
          </CardContent>
        </Card>

        {/* CLIENT PORTAL */}
        <Card className="bg-gradient-to-br from-primary/5 to-primary/10 border-primary/20">
          <CardHeader>
            <div className="flex items-center gap-3 mb-2">
              <div className="flex h-12 w-12 items-center justify-center rounded-lg bg-primary text-primary-foreground">
                <Lock className="h-6 w-6" />
              </div>
              <CardTitle className="text-2xl">
                {currentContent.clientPortal.title}
              </CardTitle>
            </div>
            <p className="text-muted-foreground mt-2">
              {currentContent.clientPortal.description}
            </p>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {currentContent.clientPortal.features.map((feature, index) => (
                <div key={index} className="flex items-start gap-3">
                  <CheckCircle2 className="h-5 w-5 text-primary shrink-0 mt-0.5" />
                  <span className="text-muted-foreground">{feature}</span>
                </div>
              ))}
            </div>
            <div className="pt-4">
              <Link href="/portal">
                <Button size="lg" className="w-full sm:w-auto">
                  {currentContent.clientPortal.cta}
                </Button>
              </Link>
            </div>
          </CardContent>
        </Card>
      </div>
    </section>
  );
}
