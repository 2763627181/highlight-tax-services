import { useState } from "react";
import { useLocation, Link } from "wouter";
import { useQuery, useMutation } from "@tanstack/react-query";
import { useAuth } from "@/lib/auth-context";
import { queryClient, apiRequest } from "@/lib/queryClient";
import { useToast } from "@/hooks/use-toast";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { Progress } from "@/components/ui/progress";
import { Skeleton } from "@/components/ui/skeleton";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Calendar } from "@/components/ui/calendar";
import { WhatsAppButton } from "@/components/whatsapp-button";
import { ThemeToggle } from "@/components/theme-toggle";
import type { TaxCase, Document, Appointment } from "@shared/schema";
import {
  FileText,
  Upload,
  CalendarDays,
  Clock,
  CheckCircle,
  AlertCircle,
  Loader2,
  LogOut,
  Home,
  FolderOpen,
  Download,
  Plus,
  User,
  FileUp,
} from "lucide-react";
import { format } from "date-fns";
import { es } from "date-fns/locale";

const statusConfig: Record<string, { label: string; color: string; progress: number }> = {
  pending: { label: "Pendiente", color: "bg-yellow-500", progress: 20 },
  in_process: { label: "En Proceso", color: "bg-blue-500", progress: 50 },
  sent_to_irs: { label: "Enviado al IRS", color: "bg-purple-500", progress: 75 },
  approved: { label: "Aprobado", color: "bg-green-500", progress: 90 },
  refund_issued: { label: "Reembolso Emitido", color: "bg-emerald-500", progress: 100 },
};

export default function Dashboard() {
  const [, setLocation] = useLocation();
  const { user, logout, isLoading: authLoading } = useAuth();
  const { toast } = useToast();
  const [isUploadOpen, setIsUploadOpen] = useState(false);
  const [isAppointmentOpen, setIsAppointmentOpen] = useState(false);
  const [selectedDate, setSelectedDate] = useState<Date | undefined>(undefined);
  const [appointmentNotes, setAppointmentNotes] = useState("");
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [selectedCaseId, setSelectedCaseId] = useState<number | null>(null);

  const { data: cases, isLoading: casesLoading } = useQuery<TaxCase[]>({
    queryKey: ["/api/cases"],
    enabled: !!user,
  });

  const { data: documents, isLoading: documentsLoading } = useQuery<Document[]>({
    queryKey: ["/api/documents"],
    enabled: !!user,
  });

  const { data: appointments, isLoading: appointmentsLoading } = useQuery<Appointment[]>({
    queryKey: ["/api/appointments"],
    enabled: !!user,
  });

  const uploadMutation = useMutation({
    mutationFn: async ({ file, caseId }: { file: File; caseId: number }) => {
      const formData = new FormData();
      formData.append("file", file);
      formData.append("caseId", caseId.toString());
      
      const response = await fetch("/api/documents/upload", {
        method: "POST",
        body: formData,
        credentials: "include",
      });
      
      if (!response.ok) {
        throw new Error("Error uploading file");
      }
      
      return response.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/documents"] });
      setIsUploadOpen(false);
      setSelectedFile(null);
      setSelectedCaseId(null);
      toast({
        title: "Documento subido",
        description: "Tu documento ha sido subido exitosamente.",
      });
    },
    onError: () => {
      toast({
        title: "Error",
        description: "No se pudo subir el documento. Inténtalo de nuevo.",
        variant: "destructive",
      });
    },
  });

  const appointmentMutation = useMutation({
    mutationFn: async (data: { appointmentDate: Date; notes: string }) => {
      return apiRequest("POST", "/api/appointments", data);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/appointments"] });
      setIsAppointmentOpen(false);
      setSelectedDate(undefined);
      setAppointmentNotes("");
      toast({
        title: "Cita agendada",
        description: "Tu cita ha sido agendada exitosamente.",
      });
    },
    onError: () => {
      toast({
        title: "Error",
        description: "No se pudo agendar la cita. Inténtalo de nuevo.",
        variant: "destructive",
      });
    },
  });

  const handleLogout = async () => {
    await logout();
    setLocation("/portal");
  };

  if (authLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    );
  }

  if (!user) {
    setLocation("/portal");
    return null;
  }

  const getInitials = (name: string) => {
    return name
      .split(" ")
      .map((n) => n[0])
      .join("")
      .toUpperCase()
      .slice(0, 2);
  };

  return (
    <div className="min-h-screen bg-muted/30" data-testid="page-dashboard">
      <header className="sticky top-0 z-40 bg-background border-b">
        <div className="max-w-7xl mx-auto px-4 sm:px-6">
          <div className="flex items-center justify-between h-16">
            <div className="flex items-center gap-4">
              <Link href="/">
                <Button variant="ghost" size="icon" data-testid="button-home">
                  <Home className="h-5 w-5" />
                </Button>
              </Link>
              <div className="flex items-center gap-2">
                <FileText className="h-6 w-6 text-primary" />
                <span className="font-semibold hidden sm:block">Highlight Tax Services</span>
              </div>
            </div>
            
            <div className="flex items-center gap-3">
              <ThemeToggle />
              <div className="flex items-center gap-2">
                <Avatar className="h-8 w-8">
                  <AvatarFallback className="bg-primary text-primary-foreground text-xs">
                    {getInitials(user.name)}
                  </AvatarFallback>
                </Avatar>
                <span className="text-sm font-medium hidden sm:block">{user.name}</span>
              </div>
              <Button 
                variant="ghost" 
                size="icon" 
                onClick={handleLogout}
                data-testid="button-logout"
              >
                <LogOut className="h-5 w-5" />
              </Button>
            </div>
          </div>
        </div>
      </header>

      <main className="max-w-7xl mx-auto px-4 sm:px-6 py-8">
        <div className="mb-8">
          <h1 className="text-2xl sm:text-3xl font-bold">
            Bienvenido, {user.name.split(" ")[0]}
          </h1>
          <p className="text-muted-foreground mt-1">
            Gestiona tus documentos y revisa el estado de tus casos
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-8">
          <Card data-testid="card-stats-cases">
            <CardContent className="pt-6">
              <div className="flex items-center gap-4">
                <div className="flex h-12 w-12 items-center justify-center rounded-lg bg-primary/10 text-primary">
                  <FolderOpen className="h-6 w-6" />
                </div>
                <div>
                  <p className="text-2xl font-bold">{cases?.length || 0}</p>
                  <p className="text-sm text-muted-foreground">Casos Activos</p>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card data-testid="card-stats-documents">
            <CardContent className="pt-6">
              <div className="flex items-center gap-4">
                <div className="flex h-12 w-12 items-center justify-center rounded-lg bg-accent/20 text-accent">
                  <FileUp className="h-6 w-6" />
                </div>
                <div>
                  <p className="text-2xl font-bold">{documents?.length || 0}</p>
                  <p className="text-sm text-muted-foreground">Documentos</p>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card data-testid="card-stats-appointments">
            <CardContent className="pt-6">
              <div className="flex items-center gap-4">
                <div className="flex h-12 w-12 items-center justify-center rounded-lg bg-blue-500/10 text-blue-500">
                  <CalendarDays className="h-6 w-6" />
                </div>
                <div>
                  <p className="text-2xl font-bold">
                    {appointments?.filter((a) => a.status === "scheduled").length || 0}
                  </p>
                  <p className="text-sm text-muted-foreground">Citas Pendientes</p>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          <div className="lg:col-span-2 space-y-6">
            <Card data-testid="card-cases">
              <CardHeader className="flex flex-row items-center justify-between gap-4">
                <div>
                  <CardTitle>Mis Casos</CardTitle>
                  <CardDescription>Estado de tus declaraciones de impuestos</CardDescription>
                </div>
              </CardHeader>
              <CardContent>
                {casesLoading ? (
                  <div className="space-y-4">
                    {[1, 2].map((i) => (
                      <Skeleton key={i} className="h-24 w-full" />
                    ))}
                  </div>
                ) : cases && cases.length > 0 ? (
                  <div className="space-y-4">
                    {cases.map((taxCase) => {
                      const status = statusConfig[taxCase.status] || statusConfig.pending;
                      return (
                        <div
                          key={taxCase.id}
                          className="p-4 rounded-lg border bg-card"
                          data-testid={`case-item-${taxCase.id}`}
                        >
                          <div className="flex items-start justify-between gap-4 mb-3">
                            <div>
                              <h4 className="font-semibold">
                                Declaración {taxCase.filingYear}
                              </h4>
                              <p className="text-sm text-muted-foreground">
                                {taxCase.filingStatus?.replace(/_/g, " ")}
                                {taxCase.dependents ? ` • ${taxCase.dependents} dependiente(s)` : ""}
                              </p>
                            </div>
                            <Badge variant="secondary" className="shrink-0">
                              {status.label}
                            </Badge>
                          </div>
                          <div className="space-y-2">
                            <div className="flex items-center justify-between text-sm">
                              <span className="text-muted-foreground">Progreso</span>
                              <span className="font-medium">{status.progress}%</span>
                            </div>
                            <Progress value={status.progress} className="h-2" />
                          </div>
                          {taxCase.finalAmount && (
                            <div className="mt-3 pt-3 border-t">
                              <p className="text-sm text-muted-foreground">
                                Monto estimado:{" "}
                                <span className="font-semibold text-accent">
                                  ${parseFloat(taxCase.finalAmount).toLocaleString()}
                                </span>
                              </p>
                            </div>
                          )}
                        </div>
                      );
                    })}
                  </div>
                ) : (
                  <div className="text-center py-8">
                    <FolderOpen className="h-12 w-12 mx-auto text-muted-foreground/50 mb-4" />
                    <p className="text-muted-foreground">No tienes casos activos</p>
                    <p className="text-sm text-muted-foreground mt-1">
                      Contáctanos para iniciar tu declaración
                    </p>
                  </div>
                )}
              </CardContent>
            </Card>

            <Card data-testid="card-documents">
              <CardHeader className="flex flex-row items-center justify-between gap-4">
                <div>
                  <CardTitle>Mis Documentos</CardTitle>
                  <CardDescription>Documentos subidos y recibidos</CardDescription>
                </div>
                <Dialog open={isUploadOpen} onOpenChange={setIsUploadOpen}>
                  <DialogTrigger asChild>
                    <Button size="sm" className="gap-2" data-testid="button-upload">
                      <Upload className="h-4 w-4" />
                      Subir
                    </Button>
                  </DialogTrigger>
                  <DialogContent>
                    <DialogHeader>
                      <DialogTitle>Subir Documento</DialogTitle>
                      <DialogDescription>
                        Sube tus documentos fiscales (W-2, 1099, recibos, etc.)
                      </DialogDescription>
                    </DialogHeader>
                    <div className="space-y-4 pt-4">
                      {cases && cases.length > 0 && (
                        <div className="space-y-2">
                          <Label>Caso</Label>
                          <select
                            className="w-full rounded-md border border-input bg-background px-3 py-2 text-sm"
                            value={selectedCaseId || ""}
                            onChange={(e) => setSelectedCaseId(Number(e.target.value))}
                            data-testid="select-case"
                          >
                            <option value="">Selecciona un caso</option>
                            {cases.map((c) => (
                              <option key={c.id} value={c.id}>
                                Declaración {c.filingYear}
                              </option>
                            ))}
                          </select>
                        </div>
                      )}
                      <div className="space-y-2">
                        <Label>Archivo</Label>
                        <Input
                          type="file"
                          accept=".pdf,.jpg,.jpeg,.png,.doc,.docx"
                          onChange={(e) => setSelectedFile(e.target.files?.[0] || null)}
                          data-testid="input-file"
                        />
                        <p className="text-xs text-muted-foreground">
                          Formatos aceptados: PDF, JPG, PNG, DOC
                        </p>
                      </div>
                      <Button
                        className="w-full"
                        disabled={!selectedFile || !selectedCaseId || uploadMutation.isPending}
                        onClick={() => {
                          if (selectedFile && selectedCaseId) {
                            uploadMutation.mutate({ file: selectedFile, caseId: selectedCaseId });
                          }
                        }}
                        data-testid="button-upload-submit"
                      >
                        {uploadMutation.isPending ? (
                          <>
                            <Loader2 className="h-4 w-4 animate-spin mr-2" />
                            Subiendo...
                          </>
                        ) : (
                          "Subir Documento"
                        )}
                      </Button>
                    </div>
                  </DialogContent>
                </Dialog>
              </CardHeader>
              <CardContent>
                {documentsLoading ? (
                  <div className="space-y-3">
                    {[1, 2, 3].map((i) => (
                      <Skeleton key={i} className="h-14 w-full" />
                    ))}
                  </div>
                ) : documents && documents.length > 0 ? (
                  <div className="space-y-2">
                    {documents.map((doc) => (
                      <div
                        key={doc.id}
                        className="flex items-center justify-between p-3 rounded-lg border hover-elevate"
                        data-testid={`document-item-${doc.id}`}
                      >
                        <div className="flex items-center gap-3">
                          <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-muted">
                            <FileText className="h-5 w-5 text-muted-foreground" />
                          </div>
                          <div>
                            <p className="font-medium text-sm">{doc.fileName}</p>
                            <p className="text-xs text-muted-foreground">
                              {format(new Date(doc.createdAt), "d MMM yyyy", { locale: es })}
                              {doc.isFromPreparer && " • Del preparador"}
                            </p>
                          </div>
                        </div>
                        <Button
                          variant="ghost"
                          size="icon"
                          asChild
                          data-testid={`button-download-${doc.id}`}
                        >
                          <a href={`/api/documents/${doc.id}/download`} download>
                            <Download className="h-4 w-4" />
                          </a>
                        </Button>
                      </div>
                    ))}
                  </div>
                ) : (
                  <div className="text-center py-8">
                    <FileUp className="h-12 w-12 mx-auto text-muted-foreground/50 mb-4" />
                    <p className="text-muted-foreground">No hay documentos</p>
                    <p className="text-sm text-muted-foreground mt-1">
                      Sube tus documentos fiscales aquí
                    </p>
                  </div>
                )}
              </CardContent>
            </Card>
          </div>

          <div className="space-y-6">
            <Card data-testid="card-appointments">
              <CardHeader className="flex flex-row items-center justify-between gap-4">
                <div>
                  <CardTitle>Citas</CardTitle>
                  <CardDescription>Tus próximas citas</CardDescription>
                </div>
                <Dialog open={isAppointmentOpen} onOpenChange={setIsAppointmentOpen}>
                  <DialogTrigger asChild>
                    <Button size="sm" variant="outline" className="gap-2" data-testid="button-schedule">
                      <Plus className="h-4 w-4" />
                      Agendar
                    </Button>
                  </DialogTrigger>
                  <DialogContent>
                    <DialogHeader>
                      <DialogTitle>Agendar Cita</DialogTitle>
                      <DialogDescription>
                        Selecciona una fecha para tu cita
                      </DialogDescription>
                    </DialogHeader>
                    <div className="space-y-4 pt-4">
                      <Calendar
                        mode="single"
                        selected={selectedDate}
                        onSelect={setSelectedDate}
                        disabled={(date) => date < new Date() || date.getDay() === 0}
                        className="rounded-md border mx-auto"
                        data-testid="calendar-appointment"
                      />
                      <div className="space-y-2">
                        <Label>Notas (opcional)</Label>
                        <Textarea
                          placeholder="¿Algo que debamos saber?"
                          value={appointmentNotes}
                          onChange={(e) => setAppointmentNotes(e.target.value)}
                          data-testid="input-appointment-notes"
                        />
                      </div>
                      <Button
                        className="w-full"
                        disabled={!selectedDate || appointmentMutation.isPending}
                        onClick={() => {
                          if (selectedDate) {
                            appointmentMutation.mutate({
                              appointmentDate: selectedDate,
                              notes: appointmentNotes,
                            });
                          }
                        }}
                        data-testid="button-appointment-submit"
                      >
                        {appointmentMutation.isPending ? (
                          <>
                            <Loader2 className="h-4 w-4 animate-spin mr-2" />
                            Agendando...
                          </>
                        ) : (
                          "Confirmar Cita"
                        )}
                      </Button>
                    </div>
                  </DialogContent>
                </Dialog>
              </CardHeader>
              <CardContent>
                {appointmentsLoading ? (
                  <div className="space-y-3">
                    {[1, 2].map((i) => (
                      <Skeleton key={i} className="h-16 w-full" />
                    ))}
                  </div>
                ) : appointments && appointments.length > 0 ? (
                  <div className="space-y-3">
                    {appointments
                      .filter((a) => a.status === "scheduled")
                      .map((appointment) => (
                        <div
                          key={appointment.id}
                          className="p-3 rounded-lg border"
                          data-testid={`appointment-item-${appointment.id}`}
                        >
                          <div className="flex items-center gap-3">
                            <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-blue-500/10 text-blue-500">
                              <CalendarDays className="h-5 w-5" />
                            </div>
                            <div>
                              <p className="font-medium text-sm">
                                {format(new Date(appointment.appointmentDate), "EEEE, d MMMM", {
                                  locale: es,
                                })}
                              </p>
                              <p className="text-xs text-muted-foreground">
                                {format(new Date(appointment.appointmentDate), "h:mm a")}
                              </p>
                            </div>
                          </div>
                          {appointment.notes && (
                            <p className="text-xs text-muted-foreground mt-2 pl-13">
                              {appointment.notes}
                            </p>
                          )}
                        </div>
                      ))}
                  </div>
                ) : (
                  <div className="text-center py-6">
                    <CalendarDays className="h-10 w-10 mx-auto text-muted-foreground/50 mb-3" />
                    <p className="text-sm text-muted-foreground">No hay citas programadas</p>
                  </div>
                )}
              </CardContent>
            </Card>

            <Card data-testid="card-contact">
              <CardHeader>
                <CardTitle className="text-base">¿Necesitas ayuda?</CardTitle>
              </CardHeader>
              <CardContent className="space-y-3">
                <p className="text-sm text-muted-foreground">
                  Contáctanos por WhatsApp o llámanos directamente
                </p>
                <div className="flex flex-col gap-2">
                  <a
                    href="https://wa.me/19172574554?text=Hola%20quiero%20información%20sobre%20mis%20taxes"
                    target="_blank"
                    rel="noopener noreferrer"
                    className="w-full"
                  >
                    <Button variant="outline" className="w-full gap-2" data-testid="button-contact-whatsapp">
                      WhatsApp
                    </Button>
                  </a>
                  <a href="tel:+19172574554" className="w-full">
                    <Button variant="outline" className="w-full gap-2" data-testid="button-contact-phone">
                      +1 917-257-4554
                    </Button>
                  </a>
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
      </main>

      <WhatsAppButton />
    </div>
  );
}
