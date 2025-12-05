import { MessageCircle } from "lucide-react";
import { SiWhatsapp } from "react-icons/si";

const WHATSAPP_URL = "https://wa.me/19172574554?text=Hola%20quiero%20información%20sobre%20sus%20servicios%20de%20taxes";

export function WhatsAppButton() {
  return (
    <a
      href={WHATSAPP_URL}
      target="_blank"
      rel="noopener noreferrer"
      className="fixed bottom-6 right-6 z-50 flex h-14 w-14 items-center justify-center rounded-full bg-[#25D366] text-white shadow-lg transition-transform hover:scale-110 active:scale-95"
      aria-label="Contact us on WhatsApp"
      data-testid="button-whatsapp"
    >
      <SiWhatsapp className="h-7 w-7" />
    </a>
  );
}

export function WhatsAppLink({ children, className }: { children: React.ReactNode; className?: string }) {
  return (
    <a
      href={WHATSAPP_URL}
      target="_blank"
      rel="noopener noreferrer"
      className={className}
      data-testid="link-whatsapp"
    >
      {children}
    </a>
  );
}
