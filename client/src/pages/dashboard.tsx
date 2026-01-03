/**
 * @fileoverview Client Dashboard Page
 * Panel de control del cliente con soporte multi-idioma
 */

import { useState, useEffect } from "react";
import { useLocation, Link } from "wouter";
import { useQuery, useMutation } from "@tanstack/react-query";
import { useAuth } from "@/lib/auth-context";
import { useI18n } from "@/lib/i18n";
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
import { LanguageSelector } from "@/components/language-selector";
import { MessagingPanel } from "@/components/messaging";
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
import { enUS, es, fr, pt, zhCN } from "date-fns/locale";

const getDateLocale = (lang: string) => {
  switch (lang) {
    case "es": return es;
    case "fr": return fr;
    case "pt": return pt;
    case "zh": return zhCN;
    default: return enUS;
  }
};

export default function Dashboard() {
  const [, setLocation] = useLocation();
  const { user, logout, isLoading: authLoading } = useAuth();

  // Proteger ruta: redirigir si no está autenticado
  useEffect(() => {
    if (!authLoading && !user) {
      setLocation("/portal");
    }
  }, [user, authLoading, setLocation]);
  const { toast } = useToast();
  const { language } = useI18n();
  const [isUploadOpen, setIsUploadOpen] = useState(false);
  const [isAppointmentOpen, setIsAppointmentOpen] = useState(false);
  const [selectedDate, setSelectedDate] = useState<Date | undefined>(undefined);
  const [appointmentNotes, setAppointmentNotes] = useState("");
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [selectedCaseId, setSelectedCaseId] = useState<number | null>(null);
  const [selectedCategory, setSelectedCategory] = useState<string>("other");
  const [documentDescription, setDocumentDescription] = useState<string>("");

  const content = {
    en: {
      welcome: "Welcome",
      manageDocuments: "Manage your documents and review case status",
      activeCases: "Active Cases",
      documents: "Documents",
      pendingAppointments: "Pending Appointments",
      myCases: "My Cases",
      casesDesc: "Status of your tax returns",
      declaration: "Tax Return",
      dependents: "dependent(s)",
      progress: "Progress",
      estimatedAmount: "Estimated amount",
      noCases: "No active cases",
      noContactUs: "Contact us to start your tax return",
      myDocuments: "My Documents",
      documentsDesc: "Uploaded and received documents",
      upload: "Upload",
      uploadDocument: "Upload Document",
      uploadDesc: "Upload your tax documents (W-2, 1099, receipts, etc.)",
      documentType: "Document Type",
      caseOptional: "Case (Optional)",
      noneGeneral: "None (general document)",
      file: "File",
      acceptedFormats: "Accepted formats: PDF, JPG, PNG, DOC",
      descriptionOptional: "Description (Optional)",
      descriptionPlaceholder: "Brief description of the document...",
      uploadSubmit: "Upload Document",
      uploading: "Uploading...",
      documentUploaded: "Document uploaded",
      documentUploadedDesc: "Your document has been uploaded successfully.",
      uploadError: "Could not upload document. Please try again.",
      noDocuments: "No documents",
      uploadDocsHere: "Upload your tax documents here",
      fromPreparer: "From preparer",
      appointments: "Appointments",
      appointmentsDesc: "Your upcoming appointments",
      schedule: "Schedule",
      scheduleAppointment: "Schedule Appointment",
      selectDate: "Select a date for your appointment",
      notes: "Notes (Optional)",
      notesPlaceholder: "What would you like to discuss?",
      confirmAppointment: "Confirm Appointment",
      scheduling: "Scheduling...",
      appointmentScheduled: "Appointment scheduled",
      appointmentScheduledDesc: "Your appointment has been scheduled successfully.",
      appointmentError: "Could not schedule appointment. Please try again.",
      noAppointments: "No appointments",
      scheduleAppointmentCTA: "Schedule an appointment with our team",
      scheduled: "Scheduled",
      completed: "Completed",
      cancelled: "Cancelled",
      messages: "Messages",
      messagesDesc: "Chat with our team",
      statusPending: "Pending",
      statusInProcess: "In Process",
      statusSentToIRS: "Sent to IRS",
      statusApproved: "Approved",
      statusRefundIssued: "Refund Issued",
      catId: "ID",
      catW2: "W-2",
      cat1099: "1099",
      catBank: "Bank",
      catReceipt: "Receipt",
      catPrevious: "Previous Return",
      catSSN: "SSN",
      catAddress: "Address",
      catOther: "Other",
      optIdDoc: "ID / Identification",
      optW2: "Form W-2",
      opt1099: "Form 1099",
      optBank: "Bank Statement",
      optReceipt: "Receipt / Voucher",
      optPrevious: "Previous Tax Return",
      optSSN: "Social Security Card",
      optAddress: "Proof of Address",
      optOther: "Other Document",
    },
    es: {
      welcome: "Bienvenido",
      manageDocuments: "Gestiona tus documentos y revisa el estado de tus casos",
      activeCases: "Casos Activos",
      documents: "Documentos",
      pendingAppointments: "Citas Pendientes",
      myCases: "Mis Casos",
      casesDesc: "Estado de tus declaraciones de impuestos",
      declaration: "Declaración",
      dependents: "dependiente(s)",
      progress: "Progreso",
      estimatedAmount: "Monto estimado",
      noCases: "No tienes casos activos",
      noContactUs: "Contáctanos para iniciar tu declaración",
      myDocuments: "Mis Documentos",
      documentsDesc: "Documentos subidos y recibidos",
      upload: "Subir",
      uploadDocument: "Subir Documento",
      uploadDesc: "Sube tus documentos fiscales (W-2, 1099, recibos, etc.)",
      documentType: "Tipo de Documento",
      caseOptional: "Caso (Opcional)",
      noneGeneral: "Ninguno (documento general)",
      file: "Archivo",
      acceptedFormats: "Formatos aceptados: PDF, JPG, PNG, DOC",
      descriptionOptional: "Descripción (Opcional)",
      descriptionPlaceholder: "Descripción breve del documento...",
      uploadSubmit: "Subir Documento",
      uploading: "Subiendo...",
      documentUploaded: "Documento subido",
      documentUploadedDesc: "Tu documento ha sido subido exitosamente.",
      uploadError: "No se pudo subir el documento. Inténtalo de nuevo.",
      noDocuments: "No hay documentos",
      uploadDocsHere: "Sube tus documentos fiscales aquí",
      fromPreparer: "Del preparador",
      appointments: "Citas",
      appointmentsDesc: "Tus próximas citas",
      schedule: "Agendar",
      scheduleAppointment: "Agendar Cita",
      selectDate: "Selecciona una fecha para tu cita",
      notes: "Notas (Opcional)",
      notesPlaceholder: "¿Qué te gustaría discutir?",
      confirmAppointment: "Confirmar Cita",
      scheduling: "Agendando...",
      appointmentScheduled: "Cita agendada",
      appointmentScheduledDesc: "Tu cita ha sido agendada exitosamente.",
      appointmentError: "No se pudo agendar la cita. Inténtalo de nuevo.",
      noAppointments: "No hay citas",
      scheduleAppointmentCTA: "Agenda una cita con nuestro equipo",
      scheduled: "Programada",
      completed: "Completada",
      cancelled: "Cancelada",
      messages: "Mensajes",
      messagesDesc: "Chatea con nuestro equipo",
      statusPending: "Pendiente",
      statusInProcess: "En Proceso",
      statusSentToIRS: "Enviado al IRS",
      statusApproved: "Aprobado",
      statusRefundIssued: "Reembolso Emitido",
      catId: "ID",
      catW2: "W-2",
      cat1099: "1099",
      catBank: "Banco",
      catReceipt: "Recibo",
      catPrevious: "Declaración",
      catSSN: "SSN",
      catAddress: "Domicilio",
      catOther: "Otro",
      optIdDoc: "ID / Identificación",
      optW2: "Formulario W-2",
      opt1099: "Formulario 1099",
      optBank: "Estado de Cuenta Bancario",
      optReceipt: "Recibo / Comprobante",
      optPrevious: "Declaración Anterior",
      optSSN: "Tarjeta de Seguro Social",
      optAddress: "Comprobante de Domicilio",
      optOther: "Otro Documento",
    },
    fr: {
      welcome: "Bienvenue",
      manageDocuments: "Gérez vos documents et consultez l'état de vos dossiers",
      activeCases: "Dossiers Actifs",
      documents: "Documents",
      pendingAppointments: "Rendez-vous en Attente",
      myCases: "Mes Dossiers",
      casesDesc: "État de vos déclarations fiscales",
      declaration: "Déclaration",
      dependents: "personne(s) à charge",
      progress: "Progression",
      estimatedAmount: "Montant estimé",
      noCases: "Aucun dossier actif",
      noContactUs: "Contactez-nous pour commencer votre déclaration",
      myDocuments: "Mes Documents",
      documentsDesc: "Documents téléchargés et reçus",
      upload: "Télécharger",
      uploadDocument: "Télécharger un Document",
      uploadDesc: "Téléchargez vos documents fiscaux (W-2, 1099, reçus, etc.)",
      documentType: "Type de Document",
      caseOptional: "Dossier (Optionnel)",
      noneGeneral: "Aucun (document général)",
      file: "Fichier",
      acceptedFormats: "Formats acceptés: PDF, JPG, PNG, DOC",
      descriptionOptional: "Description (Optionnel)",
      descriptionPlaceholder: "Brève description du document...",
      uploadSubmit: "Télécharger le Document",
      uploading: "Téléchargement...",
      documentUploaded: "Document téléchargé",
      documentUploadedDesc: "Votre document a été téléchargé avec succès.",
      uploadError: "Impossible de télécharger le document. Veuillez réessayer.",
      noDocuments: "Aucun document",
      uploadDocsHere: "Téléchargez vos documents fiscaux ici",
      fromPreparer: "Du préparateur",
      appointments: "Rendez-vous",
      appointmentsDesc: "Vos prochains rendez-vous",
      schedule: "Planifier",
      scheduleAppointment: "Planifier un Rendez-vous",
      selectDate: "Sélectionnez une date pour votre rendez-vous",
      notes: "Notes (Optionnel)",
      notesPlaceholder: "De quoi aimeriez-vous discuter?",
      confirmAppointment: "Confirmer le Rendez-vous",
      scheduling: "Planification...",
      appointmentScheduled: "Rendez-vous planifié",
      appointmentScheduledDesc: "Votre rendez-vous a été planifié avec succès.",
      appointmentError: "Impossible de planifier le rendez-vous. Veuillez réessayer.",
      noAppointments: "Aucun rendez-vous",
      scheduleAppointmentCTA: "Planifiez un rendez-vous avec notre équipe",
      scheduled: "Programmé",
      completed: "Terminé",
      cancelled: "Annulé",
      messages: "Messages",
      messagesDesc: "Discutez avec notre équipe",
      statusPending: "En attente",
      statusInProcess: "En cours",
      statusSentToIRS: "Envoyé à l'IRS",
      statusApproved: "Approuvé",
      statusRefundIssued: "Remboursement Émis",
      catId: "ID",
      catW2: "W-2",
      cat1099: "1099",
      catBank: "Banque",
      catReceipt: "Reçu",
      catPrevious: "Déclaration",
      catSSN: "SSN",
      catAddress: "Adresse",
      catOther: "Autre",
      optIdDoc: "ID / Identification",
      optW2: "Formulaire W-2",
      opt1099: "Formulaire 1099",
      optBank: "Relevé Bancaire",
      optReceipt: "Reçu / Justificatif",
      optPrevious: "Déclaration Précédente",
      optSSN: "Carte de Sécurité Sociale",
      optAddress: "Justificatif de Domicile",
      optOther: "Autre Document",
    },
    pt: {
      welcome: "Bem-vindo",
      manageDocuments: "Gerencie seus documentos e acompanhe o status dos seus casos",
      activeCases: "Casos Ativos",
      documents: "Documentos",
      pendingAppointments: "Consultas Pendentes",
      myCases: "Meus Casos",
      casesDesc: "Status das suas declarações de impostos",
      declaration: "Declaração",
      dependents: "dependente(s)",
      progress: "Progresso",
      estimatedAmount: "Valor estimado",
      noCases: "Nenhum caso ativo",
      noContactUs: "Entre em contato para iniciar sua declaração",
      myDocuments: "Meus Documentos",
      documentsDesc: "Documentos enviados e recebidos",
      upload: "Enviar",
      uploadDocument: "Enviar Documento",
      uploadDesc: "Envie seus documentos fiscais (W-2, 1099, recibos, etc.)",
      documentType: "Tipo de Documento",
      caseOptional: "Caso (Opcional)",
      noneGeneral: "Nenhum (documento geral)",
      file: "Arquivo",
      acceptedFormats: "Formatos aceitos: PDF, JPG, PNG, DOC",
      descriptionOptional: "Descrição (Opcional)",
      descriptionPlaceholder: "Breve descrição do documento...",
      uploadSubmit: "Enviar Documento",
      uploading: "Enviando...",
      documentUploaded: "Documento enviado",
      documentUploadedDesc: "Seu documento foi enviado com sucesso.",
      uploadError: "Não foi possível enviar o documento. Tente novamente.",
      noDocuments: "Nenhum documento",
      uploadDocsHere: "Envie seus documentos fiscais aqui",
      fromPreparer: "Do preparador",
      appointments: "Consultas",
      appointmentsDesc: "Suas próximas consultas",
      schedule: "Agendar",
      scheduleAppointment: "Agendar Consulta",
      selectDate: "Selecione uma data para sua consulta",
      notes: "Notas (Opcional)",
      notesPlaceholder: "O que você gostaria de discutir?",
      confirmAppointment: "Confirmar Consulta",
      scheduling: "Agendando...",
      appointmentScheduled: "Consulta agendada",
      appointmentScheduledDesc: "Sua consulta foi agendada com sucesso.",
      appointmentError: "Não foi possível agendar a consulta. Tente novamente.",
      noAppointments: "Nenhuma consulta",
      scheduleAppointmentCTA: "Agende uma consulta com nossa equipe",
      scheduled: "Agendada",
      completed: "Concluída",
      cancelled: "Cancelada",
      messages: "Mensagens",
      messagesDesc: "Converse com nossa equipe",
      statusPending: "Pendente",
      statusInProcess: "Em Processo",
      statusSentToIRS: "Enviado ao IRS",
      statusApproved: "Aprovado",
      statusRefundIssued: "Reembolso Emitido",
      catId: "ID",
      catW2: "W-2",
      cat1099: "1099",
      catBank: "Banco",
      catReceipt: "Recibo",
      catPrevious: "Declaração",
      catSSN: "SSN",
      catAddress: "Endereço",
      catOther: "Outro",
      optIdDoc: "ID / Identificação",
      optW2: "Formulário W-2",
      opt1099: "Formulário 1099",
      optBank: "Extrato Bancário",
      optReceipt: "Recibo / Comprovante",
      optPrevious: "Declaração Anterior",
      optSSN: "Cartão de Seguro Social",
      optAddress: "Comprovante de Endereço",
      optOther: "Outro Documento",
    },
    zh: {
      welcome: "欢迎",
      manageDocuments: "管理您的文件并查看案例状态",
      activeCases: "活跃案例",
      documents: "文件",
      pendingAppointments: "待处理预约",
      myCases: "我的案例",
      casesDesc: "您的纳税申报状态",
      declaration: "纳税申报",
      dependents: "个受抚养人",
      progress: "进度",
      estimatedAmount: "预估金额",
      noCases: "没有活跃案例",
      noContactUs: "联系我们开始您的纳税申报",
      myDocuments: "我的文件",
      documentsDesc: "已上传和已接收的文件",
      upload: "上传",
      uploadDocument: "上传文件",
      uploadDesc: "上传您的税务文件（W-2、1099、收据等）",
      documentType: "文件类型",
      caseOptional: "案例（可选）",
      noneGeneral: "无（通用文件）",
      file: "文件",
      acceptedFormats: "接受格式：PDF、JPG、PNG、DOC",
      descriptionOptional: "描述（可选）",
      descriptionPlaceholder: "文件的简要描述...",
      uploadSubmit: "上传文件",
      uploading: "上传中...",
      documentUploaded: "文件已上传",
      documentUploadedDesc: "您的文件已成功上传。",
      uploadError: "无法上传文件。请重试。",
      noDocuments: "没有文件",
      uploadDocsHere: "在此上传您的税务文件",
      fromPreparer: "来自准备者",
      appointments: "预约",
      appointmentsDesc: "您即将到来的预约",
      schedule: "安排",
      scheduleAppointment: "安排预约",
      selectDate: "选择预约日期",
      notes: "备注（可选）",
      notesPlaceholder: "您想讨论什么？",
      confirmAppointment: "确认预约",
      scheduling: "安排中...",
      appointmentScheduled: "预约已安排",
      appointmentScheduledDesc: "您的预约已成功安排。",
      appointmentError: "无法安排预约。请重试。",
      noAppointments: "没有预约",
      scheduleAppointmentCTA: "与我们的团队安排预约",
      scheduled: "已安排",
      completed: "已完成",
      cancelled: "已取消",
      messages: "消息",
      messagesDesc: "与我们的团队聊天",
      statusPending: "待处理",
      statusInProcess: "处理中",
      statusSentToIRS: "已发送至IRS",
      statusApproved: "已批准",
      statusRefundIssued: "退款已发放",
      catId: "ID",
      catW2: "W-2",
      cat1099: "1099",
      catBank: "银行",
      catReceipt: "收据",
      catPrevious: "申报表",
      catSSN: "SSN",
      catAddress: "地址",
      catOther: "其他",
      optIdDoc: "ID/身份证明",
      optW2: "W-2表格",
      opt1099: "1099表格",
      optBank: "银行对账单",
      optReceipt: "收据/凭证",
      optPrevious: "上一年申报表",
      optSSN: "社会安全卡",
      optAddress: "地址证明",
      optOther: "其他文件",
    },
    ht: {
      welcome: "Byenveni",
      manageDocuments: "Jere dokiman ou yo epi revize eta dosye ou yo",
      activeCases: "Dosye Aktif",
      documents: "Dokiman",
      pendingAppointments: "Randevou an Atant",
      myCases: "Dosye Mwen",
      casesDesc: "Eta deklarasyon taks ou yo",
      declaration: "Deklarasyon",
      dependents: "depandan",
      progress: "Pwogrè",
      estimatedAmount: "Montan estime",
      noCases: "Pa gen dosye aktif",
      noContactUs: "Kontakte nou pou kòmanse deklarasyon ou",
      myDocuments: "Dokiman Mwen",
      documentsDesc: "Dokiman ki telechaje ak ki resevwa",
      upload: "Telechaje",
      uploadDocument: "Telechaje Dokiman",
      uploadDesc: "Telechaje dokiman taks ou yo (W-2, 1099, resi, elatriye)",
      documentType: "Tip Dokiman",
      caseOptional: "Dosye (Opsyonèl)",
      noneGeneral: "Okenn (dokiman jeneral)",
      file: "Fichye",
      acceptedFormats: "Fòma aksepte: PDF, JPG, PNG, DOC",
      descriptionOptional: "Deskripsyon (Opsyonèl)",
      descriptionPlaceholder: "Deskripsyon kout dokiman an...",
      uploadSubmit: "Telechaje Dokiman",
      uploading: "Ap telechaje...",
      documentUploaded: "Dokiman telechaje",
      documentUploadedDesc: "Dokiman ou a telechaje avèk siksè.",
      uploadError: "Pa kapab telechaje dokiman an. Tanpri eseye ankò.",
      noDocuments: "Pa gen dokiman",
      uploadDocsHere: "Telechaje dokiman taks ou yo isit la",
      fromPreparer: "Nan men preparatè a",
      appointments: "Randevou",
      appointmentsDesc: "Randevou ou yo ki ap vini",
      schedule: "Pwograme",
      scheduleAppointment: "Pwograme Randevou",
      selectDate: "Chwazi yon dat pou randevou ou",
      notes: "Nòt (Opsyonèl)",
      notesPlaceholder: "Kisa ou ta renmen diskite?",
      confirmAppointment: "Konfime Randevou",
      scheduling: "Ap pwograme...",
      appointmentScheduled: "Randevou pwograme",
      appointmentScheduledDesc: "Randevou ou a pwograme avèk siksè.",
      appointmentError: "Pa kapab pwograme randevou a. Tanpri eseye ankò.",
      noAppointments: "Pa gen randevou",
      scheduleAppointmentCTA: "Pwograme yon randevou ak ekip nou an",
      scheduled: "Pwograme",
      completed: "Fini",
      cancelled: "Anile",
      messages: "Mesaj",
      messagesDesc: "Pale ak ekip nou an",
      statusPending: "An Atant",
      statusInProcess: "An Pwosesis",
      statusSentToIRS: "Voye bay IRS",
      statusApproved: "Apwouve",
      statusRefundIssued: "Ranbousman Emèt",
      catId: "ID",
      catW2: "W-2",
      cat1099: "1099",
      catBank: "Bank",
      catReceipt: "Resi",
      catPrevious: "Deklarasyon",
      catSSN: "SSN",
      catAddress: "Adrès",
      catOther: "Lòt",
      optIdDoc: "ID / Idantifikasyon",
      optW2: "Fòmilè W-2",
      opt1099: "Fòmilè 1099",
      optBank: "Deklarasyon Bank",
      optReceipt: "Resi / Prèv",
      optPrevious: "Deklarasyon Anvan",
      optSSN: "Kat Sekirite Sosyal",
      optAddress: "Prèv Adrès",
      optOther: "Lòt Dokiman",
    },
  };

  const t = content[language as keyof typeof content] || content.en;

  const statusConfig: Record<string, { label: string; color: string; progress: number }> = {
    pending: { label: t.statusPending, color: "bg-yellow-500", progress: 20 },
    in_process: { label: t.statusInProcess, color: "bg-blue-500", progress: 50 },
    sent_to_irs: { label: t.statusSentToIRS, color: "bg-purple-500", progress: 75 },
    approved: { label: t.statusApproved, color: "bg-green-500", progress: 90 },
    refund_issued: { label: t.statusRefundIssued, color: "bg-emerald-500", progress: 100 },
  };

  const categoryLabels: Record<string, string> = {
    id_document: t.catId,
    w2: t.catW2,
    form_1099: t.cat1099,
    bank_statement: t.catBank,
    receipt: t.catReceipt,
    previous_return: t.catPrevious,
    social_security: t.catSSN,
    proof_of_address: t.catAddress,
    other: t.catOther,
  };

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
    mutationFn: async ({ file, caseId, category, description }: { file: File; caseId?: number; category: string; description?: string }) => {
      const formData = new FormData();
      formData.append("file", file);
      formData.append("category", category);
      if (caseId) {
        formData.append("caseId", caseId.toString());
      }
      if (description) {
        formData.append("description", description);
      }
      
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
      setSelectedCategory("other");
      setDocumentDescription("");
      toast({
        title: t.documentUploaded,
        description: t.documentUploadedDesc,
      });
    },
    onError: () => {
      toast({
        title: "Error",
        description: t.uploadError,
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
        title: t.appointmentScheduled,
        description: t.appointmentScheduledDesc,
      });
    },
    onError: () => {
      toast({
        title: "Error",
        description: t.appointmentError,
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

  // Si no hay usuario, mostrar loading mientras se redirige
  if (!user) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    );
  }

  const getInitials = (name: string) => {
    return name
      .split(" ")
      .map((n) => n[0])
      .join("")
      .toUpperCase()
      .slice(0, 2);
  };

  const appointmentStatusLabels: Record<string, string> = {
    scheduled: t.scheduled,
    completed: t.completed,
    cancelled: t.cancelled,
  };

  return (
    <div className="min-h-screen bg-muted/30" data-testid="page-dashboard">
      <header className="sticky top-0 z-40 bg-background border-b">
        <div className="max-w-7xl mx-auto px-4 sm:px-6">
          <div className="flex items-center justify-between gap-4 h-16">
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
              <LanguageSelector variant="compact" />
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
            {t.welcome}, {user.name.split(" ")[0]}
          </h1>
          <p className="text-muted-foreground mt-1">
            {t.manageDocuments}
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
                  <p className="text-sm text-muted-foreground">{t.activeCases}</p>
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
                  <p className="text-sm text-muted-foreground">{t.documents}</p>
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
                  <p className="text-sm text-muted-foreground">{t.pendingAppointments}</p>
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
                  <CardTitle>{t.myCases}</CardTitle>
                  <CardDescription>{t.casesDesc}</CardDescription>
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
                                {t.declaration} {taxCase.filingYear}
                              </h4>
                              <p className="text-sm text-muted-foreground">
                                {taxCase.filingStatus?.replace(/_/g, " ")}
                                {taxCase.dependents ? ` • ${taxCase.dependents} ${t.dependents}` : ""}
                              </p>
                            </div>
                            <Badge variant="secondary" className="shrink-0">
                              {status.label}
                            </Badge>
                          </div>
                          <div className="space-y-2">
                            <div className="flex items-center justify-between text-sm">
                              <span className="text-muted-foreground">{t.progress}</span>
                              <span className="font-medium">{status.progress}%</span>
                            </div>
                            <Progress value={status.progress} className="h-2" />
                          </div>
                          {taxCase.finalAmount && (
                            <div className="mt-3 pt-3 border-t">
                              <p className="text-sm text-muted-foreground">
                                {t.estimatedAmount}:{" "}
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
                    <p className="text-muted-foreground">{t.noCases}</p>
                    <p className="text-sm text-muted-foreground mt-1">
                      {t.noContactUs}
                    </p>
                  </div>
                )}
              </CardContent>
            </Card>

            <Card data-testid="card-documents">
              <CardHeader className="flex flex-row items-center justify-between gap-4">
                <div>
                  <CardTitle>{t.myDocuments}</CardTitle>
                  <CardDescription>{t.documentsDesc}</CardDescription>
                </div>
                <Dialog open={isUploadOpen} onOpenChange={setIsUploadOpen}>
                  <DialogTrigger asChild>
                    <Button size="sm" className="gap-2" data-testid="button-upload">
                      <Upload className="h-4 w-4" />
                      {t.upload}
                    </Button>
                  </DialogTrigger>
                  <DialogContent>
                    <DialogHeader>
                      <DialogTitle>{t.uploadDocument}</DialogTitle>
                      <DialogDescription>
                        {t.uploadDesc}
                      </DialogDescription>
                    </DialogHeader>
                    <div className="space-y-4 pt-4">
                      <div className="space-y-2">
                        <Label>{t.documentType}</Label>
                        <select
                          className="w-full rounded-md border border-input bg-background px-3 py-2 text-sm"
                          value={selectedCategory}
                          onChange={(e) => setSelectedCategory(e.target.value)}
                          data-testid="select-category"
                        >
                          <option value="id_document">{t.optIdDoc}</option>
                          <option value="w2">{t.optW2}</option>
                          <option value="form_1099">{t.opt1099}</option>
                          <option value="bank_statement">{t.optBank}</option>
                          <option value="receipt">{t.optReceipt}</option>
                          <option value="previous_return">{t.optPrevious}</option>
                          <option value="social_security">{t.optSSN}</option>
                          <option value="proof_of_address">{t.optAddress}</option>
                          <option value="other">{t.optOther}</option>
                        </select>
                      </div>
                      {cases && cases.length > 0 && (
                        <div className="space-y-2">
                          <Label>{t.caseOptional}</Label>
                          <select
                            className="w-full rounded-md border border-input bg-background px-3 py-2 text-sm"
                            value={selectedCaseId || ""}
                            onChange={(e) => setSelectedCaseId(e.target.value ? Number(e.target.value) : null)}
                            data-testid="select-case"
                          >
                            <option value="">{t.noneGeneral}</option>
                            {cases.map((c) => (
                              <option key={c.id} value={c.id}>
                                {t.declaration} {c.filingYear}
                              </option>
                            ))}
                          </select>
                        </div>
                      )}
                      <div className="space-y-2">
                        <Label>{t.file}</Label>
                        <Input
                          type="file"
                          accept=".pdf,.jpg,.jpeg,.png,.doc,.docx"
                          onChange={(e) => setSelectedFile(e.target.files?.[0] || null)}
                          data-testid="input-file"
                        />
                        <p className="text-xs text-muted-foreground">
                          {t.acceptedFormats}
                        </p>
                      </div>
                      <div className="space-y-2">
                        <Label>{t.descriptionOptional}</Label>
                        <Textarea
                          placeholder={t.descriptionPlaceholder}
                          value={documentDescription}
                          onChange={(e) => setDocumentDescription(e.target.value)}
                          data-testid="input-document-description"
                        />
                      </div>
                      <Button
                        className="w-full"
                        disabled={!selectedFile || uploadMutation.isPending}
                        onClick={() => {
                          if (selectedFile) {
                            uploadMutation.mutate({ 
                              file: selectedFile, 
                              caseId: selectedCaseId || undefined, 
                              category: selectedCategory,
                              description: documentDescription || undefined
                            });
                          }
                        }}
                        data-testid="button-upload-submit"
                      >
                        {uploadMutation.isPending ? (
                          <>
                            <Loader2 className="h-4 w-4 animate-spin mr-2" />
                            {t.uploading}
                          </>
                        ) : (
                          t.uploadSubmit
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
                            <div className="flex items-center gap-2 flex-wrap">
                              <p className="font-medium text-sm">{doc.fileName}</p>
                              <Badge variant="secondary" className="text-xs">
                                {categoryLabels[doc.category] || t.catOther}
                              </Badge>
                            </div>
                            <p className="text-xs text-muted-foreground">
                              {format(new Date(doc.createdAt), "d MMM yyyy", { locale: getDateLocale(language) })}
                              {doc.isFromPreparer && ` • ${t.fromPreparer}`}
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
                    <p className="text-muted-foreground">{t.noDocuments}</p>
                    <p className="text-sm text-muted-foreground mt-1">
                      {t.uploadDocsHere}
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
                  <CardTitle>{t.appointments}</CardTitle>
                  <CardDescription>{t.appointmentsDesc}</CardDescription>
                </div>
                <Dialog open={isAppointmentOpen} onOpenChange={setIsAppointmentOpen}>
                  <DialogTrigger asChild>
                    <Button size="sm" variant="outline" className="gap-2" data-testid="button-schedule">
                      <Plus className="h-4 w-4" />
                      {t.schedule}
                    </Button>
                  </DialogTrigger>
                  <DialogContent>
                    <DialogHeader>
                      <DialogTitle>{t.scheduleAppointment}</DialogTitle>
                      <DialogDescription>
                        {t.selectDate}
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
                        <Label>{t.notes}</Label>
                        <Textarea
                          placeholder={t.notesPlaceholder}
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
                            {t.scheduling}
                          </>
                        ) : (
                          t.confirmAppointment
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
                    {appointments.map((apt) => (
                      <div
                        key={apt.id}
                        className="p-3 rounded-lg border"
                        data-testid={`appointment-item-${apt.id}`}
                      >
                        <div className="flex items-center justify-between gap-2 mb-1">
                          <div className="flex items-center gap-2">
                            <CalendarDays className="h-4 w-4 text-muted-foreground" />
                            <span className="font-medium text-sm">
                              {format(new Date(apt.appointmentDate), "d MMM yyyy", { locale: getDateLocale(language) })}
                            </span>
                          </div>
                          <Badge
                            variant={apt.status === "scheduled" ? "default" : "secondary"}
                            className="text-xs"
                          >
                            {appointmentStatusLabels[apt.status] || apt.status}
                          </Badge>
                        </div>
                        {apt.notes && (
                          <p className="text-xs text-muted-foreground mt-1">{apt.notes}</p>
                        )}
                      </div>
                    ))}
                  </div>
                ) : (
                  <div className="text-center py-6">
                    <CalendarDays className="h-10 w-10 mx-auto text-muted-foreground/50 mb-3" />
                    <p className="text-muted-foreground text-sm">{t.noAppointments}</p>
                    <p className="text-xs text-muted-foreground mt-1">
                      {t.scheduleAppointmentCTA}
                    </p>
                  </div>
                )}
              </CardContent>
            </Card>

            <Card data-testid="card-messages">
              <CardHeader>
                <CardTitle>{t.messages}</CardTitle>
                <CardDescription>{t.messagesDesc}</CardDescription>
              </CardHeader>
              <CardContent>
                <MessagingPanel />
              </CardContent>
            </Card>
          </div>
        </div>
      </main>

      <WhatsAppButton />
    </div>
  );
}
