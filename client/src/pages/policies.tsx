import { Link } from "wouter";
import { Header } from "@/components/header";
import { Footer } from "@/components/footer";
import { WhatsAppButton } from "@/components/whatsapp-button";
import { ArrowLeft, Shield, FileText, ArrowRight } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

export default function Policies() {
  return (
    <div className="min-h-screen flex flex-col">
      <Header />
      <main className="flex-1 pt-24 pb-16" data-testid="page-policies">
        <div className="max-w-4xl mx-auto px-4 sm:px-6">
          <Link href="/">
            <Button variant="ghost" className="mb-6 gap-2" data-testid="button-back">
              <ArrowLeft className="h-4 w-4" />
              Volver al Inicio
            </Button>
          </Link>

          <div className="text-center mb-12">
            <h1 className="text-3xl sm:text-4xl font-bold mb-4">Políticas y Términos</h1>
            <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
              Revise nuestras políticas de privacidad y términos de servicio para 
              entender cómo protegemos su información y las condiciones de uso.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <Card className="hover-elevate transition-all duration-300" data-testid="card-privacy-link">
              <CardHeader>
                <div className="flex items-center gap-4">
                  <div className="flex h-12 w-12 items-center justify-center rounded-lg bg-primary/10 text-primary">
                    <Shield className="h-6 w-6" />
                  </div>
                  <CardTitle>Privacy Policy</CardTitle>
                </div>
              </CardHeader>
              <CardContent className="space-y-4">
                <p className="text-muted-foreground">
                  Conozca cómo protegemos y manejamos su información personal y 
                  fiscal con los más altos estándares de seguridad.
                </p>
                <Link href="/privacy-policy">
                  <Button variant="outline" className="w-full gap-2" data-testid="button-view-privacy">
                    Ver Política de Privacidad
                    <ArrowRight className="h-4 w-4" />
                  </Button>
                </Link>
              </CardContent>
            </Card>

            <Card className="hover-elevate transition-all duration-300" data-testid="card-terms-link">
              <CardHeader>
                <div className="flex items-center gap-4">
                  <div className="flex h-12 w-12 items-center justify-center rounded-lg bg-primary/10 text-primary">
                    <FileText className="h-6 w-6" />
                  </div>
                  <CardTitle>Terms & Conditions</CardTitle>
                </div>
              </CardHeader>
              <CardContent className="space-y-4">
                <p className="text-muted-foreground">
                  Revise los términos y condiciones que rigen el uso de nuestros 
                  servicios de preparación de impuestos.
                </p>
                <Link href="/terms">
                  <Button variant="outline" className="w-full gap-2" data-testid="button-view-terms">
                    Ver Términos y Condiciones
                    <ArrowRight className="h-4 w-4" />
                  </Button>
                </Link>
              </CardContent>
            </Card>
          </div>

          <div className="mt-12 bg-muted/50 rounded-lg p-6 text-center">
            <p className="text-muted-foreground">
              Si tiene preguntas sobre nuestras políticas, no dude en contactarnos 
              a <a href="mailto:servicestaxx@gmail.com" className="text-primary hover:underline">servicestaxx@gmail.com</a> o 
              llámenos al <a href="tel:+19172574554" className="text-primary hover:underline">+1 917-257-4554</a>.
            </p>
          </div>
        </div>
      </main>
      <Footer />
      <WhatsAppButton />
    </div>
  );
}
