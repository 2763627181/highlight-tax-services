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
import { Skeleton } from "@/components/ui/skeleton";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { WhatsAppButton } from "@/components/whatsapp-button";
import { ThemeToggle } from "@/components/theme-toggle";
import type { User, TaxCase, Document, Appointment, ContactSubmission } from "@shared/schema";
import {
  FileText,
  Users,
  FolderOpen,
  CalendarDays,
  Clock,
  Download,
  Loader2,
  LogOut,
  Home,
  Settings,
  BarChart3,
  Mail,
  Eye,
  Pencil,
  Plus,
  CheckCircle,
  AlertCircle,
  DollarSign,
} from "lucide-react";
import { format } from "date-fns";
import { es } from "date-fns/locale";

const statusOptions = [
  { value: "pending", label: "Pendiente" },
  { value: "in_process", label: "En Proceso" },
  { value: "sent_to_irs", label: "Enviado al IRS" },
  { value: "approved", label: "Aprobado" },
  { value: "refund_issued", label: "Reembolso Emitido" },
];

const statusColors: Record<string, string> = {
  pending: "bg-yellow-500/10 text-yellow-600 dark:text-yellow-400",
  in_process: "bg-blue-500/10 text-blue-600 dark:text-blue-400",
  sent_to_irs: "bg-purple-500/10 text-purple-600 dark:text-purple-400",
  approved: "bg-green-500/10 text-green-600 dark:text-green-400",
  refund_issued: "bg-emerald-500/10 text-emerald-600 dark:text-emerald-400",
};

interface AdminStats {
  totalClients: number;
  pendingCases: number;
  completedCases: number;
  totalRefunds: number;
}

interface CaseWithClient extends TaxCase {
  client?: User;
}

interface ClientWithDetails extends User {
  documentsCount: number;
  casesCount: number;
}

export default function Admin() {
  const [, setLocation] = useLocation();
  const { user, logout, isLoading: authLoading } = useAuth();
  const { toast } = useToast();
  const [selectedCase, setSelectedCase] = useState<CaseWithClient | null>(null);
  const [isEditOpen, setIsEditOpen] = useState(false);
  const [isCreateCaseOpen, setIsCreateCaseOpen] = useState(false);
  const [editStatus, setEditStatus] = useState("");
  const [editNotes, setEditNotes] = useState("");
  const [editAmount, setEditAmount] = useState("");
  const [newCaseData, setNewCaseData] = useState({
    clientId: "",
    filingYear: new Date().getFullYear(),
    filingStatus: "single",
    dependents: 0,
  });

  const { data: stats, isLoading: statsLoading } = useQuery<AdminStats>({
    queryKey: ["/api/admin/stats"],
    enabled: !!user && (user.role === "admin" || user.role === "preparer"),
  });

  const { data: clients, isLoading: clientsLoading } = useQuery<ClientWithDetails[]>({
    queryKey: ["/api/admin/clients"],
    enabled: !!user && (user.role === "admin" || user.role === "preparer"),
  });

  const { data: cases, isLoading: casesLoading } = useQuery<CaseWithClient[]>({
    queryKey: ["/api/admin/cases"],
    enabled: !!user && (user.role === "admin" || user.role === "preparer"),
  });

  const { data: appointments, isLoading: appointmentsLoading } = useQuery<Appointment[]>({
    queryKey: ["/api/admin/appointments"],
    enabled: !!user && (user.role === "admin" || user.role === "preparer"),
  });

  const { data: contacts, isLoading: contactsLoading } = useQuery<ContactSubmission[]>({
    queryKey: ["/api/admin/contacts"],
    enabled: !!user && (user.role === "admin" || user.role === "preparer"),
  });

  const updateCaseMutation = useMutation({
    mutationFn: async (data: { id: number; status: string; notes: string; finalAmount?: string }) => {
      return apiRequest("PATCH", `/api/admin/cases/${data.id}`, {
        status: data.status,
        notes: data.notes,
        finalAmount: data.finalAmount,
      });
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/admin/cases"] });
      queryClient.invalidateQueries({ queryKey: ["/api/admin/stats"] });
      setIsEditOpen(false);
      setSelectedCase(null);
      toast({
        title: "Caso actualizado",
        description: "El caso ha sido actualizado exitosamente.",
      });
    },
    onError: () => {
      toast({
        title: "Error",
        description: "No se pudo actualizar el caso.",
        variant: "destructive",
      });
    },
  });

  const createCaseMutation = useMutation({
    mutationFn: async (data: typeof newCaseData) => {
      return apiRequest("POST", "/api/admin/cases", data);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/admin/cases"] });
      queryClient.invalidateQueries({ queryKey: ["/api/admin/stats"] });
      setIsCreateCaseOpen(false);
      setNewCaseData({
        clientId: "",
        filingYear: new Date().getFullYear(),
        filingStatus: "single",
        dependents: 0,
      });
      toast({
        title: "Caso creado",
        description: "El nuevo caso ha sido creado exitosamente.",
      });
    },
    onError: () => {
      toast({
        title: "Error",
        description: "No se pudo crear el caso.",
        variant: "destructive",
      });
    },
  });

  const handleLogout = async () => {
    await logout();
    setLocation("/portal");
  };

  const openEditDialog = (taxCase: CaseWithClient) => {
    setSelectedCase(taxCase);
    setEditStatus(taxCase.status);
    setEditNotes(taxCase.notes || "");
    setEditAmount(taxCase.finalAmount || "");
    setIsEditOpen(true);
  };

  if (authLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    );
  }

  if (!user || (user.role !== "admin" && user.role !== "preparer")) {
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
    <div className="min-h-screen bg-muted/30" data-testid="page-admin">
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
                <span className="font-semibold hidden sm:block">Panel Administrativo</span>
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
                <div className="hidden sm:block">
                  <span className="text-sm font-medium">{user.name}</span>
                  <Badge variant="secondary" className="ml-2 text-xs">
                    {user.role === "admin" ? "Admin" : "Preparador"}
                  </Badge>
                </div>
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
          <h1 className="text-2xl sm:text-3xl font-bold">Dashboard</h1>
          <p className="text-muted-foreground mt-1">
            Gestiona clientes, casos y citas
          </p>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
          <Card data-testid="card-stat-clients">
            <CardContent className="pt-6">
              <div className="flex items-center gap-4">
                <div className="flex h-12 w-12 items-center justify-center rounded-lg bg-primary/10 text-primary">
                  <Users className="h-6 w-6" />
                </div>
                <div>
                  {statsLoading ? (
                    <Skeleton className="h-8 w-16" />
                  ) : (
                    <p className="text-2xl font-bold">{stats?.totalClients || 0}</p>
                  )}
                  <p className="text-sm text-muted-foreground">Total Clientes</p>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card data-testid="card-stat-pending">
            <CardContent className="pt-6">
              <div className="flex items-center gap-4">
                <div className="flex h-12 w-12 items-center justify-center rounded-lg bg-yellow-500/10 text-yellow-600 dark:text-yellow-400">
                  <Clock className="h-6 w-6" />
                </div>
                <div>
                  {statsLoading ? (
                    <Skeleton className="h-8 w-16" />
                  ) : (
                    <p className="text-2xl font-bold">{stats?.pendingCases || 0}</p>
                  )}
                  <p className="text-sm text-muted-foreground">Casos Pendientes</p>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card data-testid="card-stat-completed">
            <CardContent className="pt-6">
              <div className="flex items-center gap-4">
                <div className="flex h-12 w-12 items-center justify-center rounded-lg bg-green-500/10 text-green-600 dark:text-green-400">
                  <CheckCircle className="h-6 w-6" />
                </div>
                <div>
                  {statsLoading ? (
                    <Skeleton className="h-8 w-16" />
                  ) : (
                    <p className="text-2xl font-bold">{stats?.completedCases || 0}</p>
                  )}
                  <p className="text-sm text-muted-foreground">Casos Completados</p>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card data-testid="card-stat-refunds">
            <CardContent className="pt-6">
              <div className="flex items-center gap-4">
                <div className="flex h-12 w-12 items-center justify-center rounded-lg bg-accent/20 text-accent">
                  <DollarSign className="h-6 w-6" />
                </div>
                <div>
                  {statsLoading ? (
                    <Skeleton className="h-8 w-16" />
                  ) : (
                    <p className="text-2xl font-bold">
                      ${(stats?.totalRefunds || 0).toLocaleString()}
                    </p>
                  )}
                  <p className="text-sm text-muted-foreground">Reembolsos Est.</p>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        <Tabs defaultValue="cases" className="space-y-6">
          <TabsList>
            <TabsTrigger value="cases" data-testid="tab-cases">
              <FolderOpen className="h-4 w-4 mr-2" />
              Casos
            </TabsTrigger>
            <TabsTrigger value="clients" data-testid="tab-clients">
              <Users className="h-4 w-4 mr-2" />
              Clientes
            </TabsTrigger>
            <TabsTrigger value="appointments" data-testid="tab-appointments">
              <CalendarDays className="h-4 w-4 mr-2" />
              Citas
            </TabsTrigger>
            <TabsTrigger value="contacts" data-testid="tab-contacts">
              <Mail className="h-4 w-4 mr-2" />
              Contactos
            </TabsTrigger>
          </TabsList>

          <TabsContent value="cases">
            <Card>
              <CardHeader className="flex flex-row items-center justify-between gap-4">
                <div>
                  <CardTitle>Casos de Impuestos</CardTitle>
                  <CardDescription>Gestiona todos los casos activos</CardDescription>
                </div>
                <Dialog open={isCreateCaseOpen} onOpenChange={setIsCreateCaseOpen}>
                  <DialogTrigger asChild>
                    <Button className="gap-2" data-testid="button-create-case">
                      <Plus className="h-4 w-4" />
                      Nuevo Caso
                    </Button>
                  </DialogTrigger>
                  <DialogContent>
                    <DialogHeader>
                      <DialogTitle>Crear Nuevo Caso</DialogTitle>
                      <DialogDescription>
                        Crea un nuevo caso de impuestos para un cliente
                      </DialogDescription>
                    </DialogHeader>
                    <div className="space-y-4 pt-4">
                      <div className="space-y-2">
                        <Label>Cliente</Label>
                        <Select
                          value={newCaseData.clientId}
                          onValueChange={(value) =>
                            setNewCaseData({ ...newCaseData, clientId: value })
                          }
                        >
                          <SelectTrigger data-testid="select-client">
                            <SelectValue placeholder="Selecciona un cliente" />
                          </SelectTrigger>
                          <SelectContent>
                            {clients?.map((client) => (
                              <SelectItem key={client.id} value={client.id.toString()}>
                                {client.name} ({client.email})
                              </SelectItem>
                            ))}
                          </SelectContent>
                        </Select>
                      </div>
                      <div className="grid grid-cols-2 gap-4">
                        <div className="space-y-2">
                          <Label>Año Fiscal</Label>
                          <Input
                            type="number"
                            value={newCaseData.filingYear}
                            onChange={(e) =>
                              setNewCaseData({
                                ...newCaseData,
                                filingYear: parseInt(e.target.value),
                              })
                            }
                            data-testid="input-filing-year"
                          />
                        </div>
                        <div className="space-y-2">
                          <Label>Dependientes</Label>
                          <Input
                            type="number"
                            value={newCaseData.dependents}
                            onChange={(e) =>
                              setNewCaseData({
                                ...newCaseData,
                                dependents: parseInt(e.target.value),
                              })
                            }
                            data-testid="input-dependents"
                          />
                        </div>
                      </div>
                      <div className="space-y-2">
                        <Label>Estado Civil</Label>
                        <Select
                          value={newCaseData.filingStatus}
                          onValueChange={(value) =>
                            setNewCaseData({ ...newCaseData, filingStatus: value })
                          }
                        >
                          <SelectTrigger data-testid="select-filing-status">
                            <SelectValue />
                          </SelectTrigger>
                          <SelectContent>
                            <SelectItem value="single">Soltero</SelectItem>
                            <SelectItem value="married_filing_jointly">
                              Casado (Conjunto)
                            </SelectItem>
                            <SelectItem value="married_filing_separately">
                              Casado (Separado)
                            </SelectItem>
                            <SelectItem value="head_of_household">
                              Jefe de Familia
                            </SelectItem>
                          </SelectContent>
                        </Select>
                      </div>
                      <Button
                        className="w-full"
                        disabled={!newCaseData.clientId || createCaseMutation.isPending}
                        onClick={() => createCaseMutation.mutate(newCaseData)}
                        data-testid="button-create-case-submit"
                      >
                        {createCaseMutation.isPending ? (
                          <>
                            <Loader2 className="h-4 w-4 animate-spin mr-2" />
                            Creando...
                          </>
                        ) : (
                          "Crear Caso"
                        )}
                      </Button>
                    </div>
                  </DialogContent>
                </Dialog>
              </CardHeader>
              <CardContent>
                {casesLoading ? (
                  <div className="space-y-3">
                    {[1, 2, 3].map((i) => (
                      <Skeleton key={i} className="h-16 w-full" />
                    ))}
                  </div>
                ) : cases && cases.length > 0 ? (
                  <div className="overflow-x-auto">
                    <Table>
                      <TableHeader>
                        <TableRow>
                          <TableHead>Cliente</TableHead>
                          <TableHead>Año</TableHead>
                          <TableHead>Estado</TableHead>
                          <TableHead>Monto</TableHead>
                          <TableHead>Fecha</TableHead>
                          <TableHead className="text-right">Acciones</TableHead>
                        </TableRow>
                      </TableHeader>
                      <TableBody>
                        {cases.map((taxCase) => (
                          <TableRow key={taxCase.id} data-testid={`row-case-${taxCase.id}`}>
                            <TableCell>
                              <div className="flex items-center gap-2">
                                <Avatar className="h-8 w-8">
                                  <AvatarFallback className="text-xs">
                                    {taxCase.client
                                      ? getInitials(taxCase.client.name)
                                      : "?"}
                                  </AvatarFallback>
                                </Avatar>
                                <span className="font-medium">
                                  {taxCase.client?.name || "Cliente"}
                                </span>
                              </div>
                            </TableCell>
                            <TableCell>{taxCase.filingYear}</TableCell>
                            <TableCell>
                              <Badge
                                variant="secondary"
                                className={statusColors[taxCase.status] || ""}
                              >
                                {statusOptions.find((s) => s.value === taxCase.status)?.label ||
                                  taxCase.status}
                              </Badge>
                            </TableCell>
                            <TableCell>
                              {taxCase.finalAmount
                                ? `$${parseFloat(taxCase.finalAmount).toLocaleString()}`
                                : "-"}
                            </TableCell>
                            <TableCell>
                              {format(new Date(taxCase.createdAt), "d MMM yyyy", {
                                locale: es,
                              })}
                            </TableCell>
                            <TableCell className="text-right">
                              <Button
                                variant="ghost"
                                size="icon"
                                onClick={() => openEditDialog(taxCase)}
                                data-testid={`button-edit-case-${taxCase.id}`}
                              >
                                <Pencil className="h-4 w-4" />
                              </Button>
                            </TableCell>
                          </TableRow>
                        ))}
                      </TableBody>
                    </Table>
                  </div>
                ) : (
                  <div className="text-center py-8">
                    <FolderOpen className="h-12 w-12 mx-auto text-muted-foreground/50 mb-4" />
                    <p className="text-muted-foreground">No hay casos registrados</p>
                  </div>
                )}
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="clients">
            <Card>
              <CardHeader>
                <CardTitle>Clientes</CardTitle>
                <CardDescription>Lista de todos los clientes registrados</CardDescription>
              </CardHeader>
              <CardContent>
                {clientsLoading ? (
                  <div className="space-y-3">
                    {[1, 2, 3].map((i) => (
                      <Skeleton key={i} className="h-16 w-full" />
                    ))}
                  </div>
                ) : clients && clients.length > 0 ? (
                  <div className="overflow-x-auto">
                    <Table>
                      <TableHeader>
                        <TableRow>
                          <TableHead>Nombre</TableHead>
                          <TableHead>Email</TableHead>
                          <TableHead>Teléfono</TableHead>
                          <TableHead>Casos</TableHead>
                          <TableHead>Documentos</TableHead>
                          <TableHead>Registro</TableHead>
                        </TableRow>
                      </TableHeader>
                      <TableBody>
                        {clients.map((client) => (
                          <TableRow key={client.id} data-testid={`row-client-${client.id}`}>
                            <TableCell>
                              <div className="flex items-center gap-2">
                                <Avatar className="h-8 w-8">
                                  <AvatarFallback className="text-xs">
                                    {getInitials(client.name)}
                                  </AvatarFallback>
                                </Avatar>
                                <span className="font-medium">{client.name}</span>
                              </div>
                            </TableCell>
                            <TableCell>{client.email}</TableCell>
                            <TableCell>{client.phone || "-"}</TableCell>
                            <TableCell>
                              <Badge variant="secondary" className="gap-1">
                                <FolderOpen className="h-3 w-3" />
                                {client.casesCount || 0}
                              </Badge>
                            </TableCell>
                            <TableCell>
                              <Badge variant="secondary" className="gap-1">
                                <FileText className="h-3 w-3" />
                                {client.documentsCount || 0}
                              </Badge>
                            </TableCell>
                            <TableCell>
                              {format(new Date(client.createdAt), "d MMM yyyy", {
                                locale: es,
                              })}
                            </TableCell>
                          </TableRow>
                        ))}
                      </TableBody>
                    </Table>
                  </div>
                ) : (
                  <div className="text-center py-8">
                    <Users className="h-12 w-12 mx-auto text-muted-foreground/50 mb-4" />
                    <p className="text-muted-foreground">No hay clientes registrados</p>
                  </div>
                )}
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="appointments">
            <Card>
              <CardHeader>
                <CardTitle>Citas</CardTitle>
                <CardDescription>Gestiona las citas programadas</CardDescription>
              </CardHeader>
              <CardContent>
                {appointmentsLoading ? (
                  <div className="space-y-3">
                    {[1, 2, 3].map((i) => (
                      <Skeleton key={i} className="h-16 w-full" />
                    ))}
                  </div>
                ) : appointments && appointments.length > 0 ? (
                  <div className="overflow-x-auto">
                    <Table>
                      <TableHeader>
                        <TableRow>
                          <TableHead>Fecha</TableHead>
                          <TableHead>Estado</TableHead>
                          <TableHead>Notas</TableHead>
                        </TableRow>
                      </TableHeader>
                      <TableBody>
                        {appointments.map((appointment) => (
                          <TableRow
                            key={appointment.id}
                            data-testid={`row-appointment-${appointment.id}`}
                          >
                            <TableCell>
                              {format(
                                new Date(appointment.appointmentDate),
                                "EEEE, d MMMM yyyy 'a las' h:mm a",
                                { locale: es }
                              )}
                            </TableCell>
                            <TableCell>
                              <Badge
                                variant={
                                  appointment.status === "scheduled"
                                    ? "default"
                                    : appointment.status === "completed"
                                    ? "secondary"
                                    : "destructive"
                                }
                              >
                                {appointment.status === "scheduled"
                                  ? "Programada"
                                  : appointment.status === "completed"
                                  ? "Completada"
                                  : "Cancelada"}
                              </Badge>
                            </TableCell>
                            <TableCell>
                              {appointment.notes || "-"}
                            </TableCell>
                          </TableRow>
                        ))}
                      </TableBody>
                    </Table>
                  </div>
                ) : (
                  <div className="text-center py-8">
                    <CalendarDays className="h-12 w-12 mx-auto text-muted-foreground/50 mb-4" />
                    <p className="text-muted-foreground">No hay citas programadas</p>
                  </div>
                )}
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="contacts">
            <Card>
              <CardHeader>
                <CardTitle>Mensajes de Contacto</CardTitle>
                <CardDescription>Mensajes recibidos del formulario de contacto</CardDescription>
              </CardHeader>
              <CardContent>
                {contactsLoading ? (
                  <div className="space-y-3">
                    {[1, 2, 3].map((i) => (
                      <Skeleton key={i} className="h-20 w-full" />
                    ))}
                  </div>
                ) : contacts && contacts.length > 0 ? (
                  <div className="space-y-4">
                    {contacts.map((contact) => (
                      <div
                        key={contact.id}
                        className="p-4 rounded-lg border"
                        data-testid={`card-contact-${contact.id}`}
                      >
                        <div className="flex items-start justify-between gap-4 mb-2">
                          <div>
                            <h4 className="font-medium">{contact.name}</h4>
                            <p className="text-sm text-muted-foreground">
                              {contact.email}
                              {contact.phone && ` • ${contact.phone}`}
                            </p>
                          </div>
                          <span className="text-xs text-muted-foreground">
                            {format(new Date(contact.createdAt), "d MMM yyyy", {
                              locale: es,
                            })}
                          </span>
                        </div>
                        <p className="text-sm">{contact.message}</p>
                      </div>
                    ))}
                  </div>
                ) : (
                  <div className="text-center py-8">
                    <Mail className="h-12 w-12 mx-auto text-muted-foreground/50 mb-4" />
                    <p className="text-muted-foreground">No hay mensajes de contacto</p>
                  </div>
                )}
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>

        <Dialog open={isEditOpen} onOpenChange={setIsEditOpen}>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>Editar Caso</DialogTitle>
              <DialogDescription>
                Actualiza el estado y notas del caso
              </DialogDescription>
            </DialogHeader>
            <div className="space-y-4 pt-4">
              <div className="space-y-2">
                <Label>Estado</Label>
                <Select value={editStatus} onValueChange={setEditStatus}>
                  <SelectTrigger data-testid="select-edit-status">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    {statusOptions.map((option) => (
                      <SelectItem key={option.value} value={option.value}>
                        {option.label}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              <div className="space-y-2">
                <Label>Monto Final ($)</Label>
                <Input
                  type="number"
                  step="0.01"
                  value={editAmount}
                  onChange={(e) => setEditAmount(e.target.value)}
                  placeholder="0.00"
                  data-testid="input-edit-amount"
                />
              </div>
              <div className="space-y-2">
                <Label>Notas Internas</Label>
                <Textarea
                  value={editNotes}
                  onChange={(e) => setEditNotes(e.target.value)}
                  placeholder="Notas sobre el caso..."
                  data-testid="input-edit-notes"
                />
              </div>
              <Button
                className="w-full"
                disabled={updateCaseMutation.isPending}
                onClick={() => {
                  if (selectedCase) {
                    updateCaseMutation.mutate({
                      id: selectedCase.id,
                      status: editStatus,
                      notes: editNotes,
                      finalAmount: editAmount || undefined,
                    });
                  }
                }}
                data-testid="button-edit-case-submit"
              >
                {updateCaseMutation.isPending ? (
                  <>
                    <Loader2 className="h-4 w-4 animate-spin mr-2" />
                    Guardando...
                  </>
                ) : (
                  "Guardar Cambios"
                )}
              </Button>
            </div>
          </DialogContent>
        </Dialog>
      </main>

      <WhatsAppButton />
    </div>
  );
}
