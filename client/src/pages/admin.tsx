/**
 * @fileoverview Admin Dashboard Page
 * Panel de administración con soporte multi-idioma
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
import { LanguageSelector } from "@/components/language-selector";
import { MessagingPanel } from "@/components/messaging";
import { AnalyticsDashboard } from "@/components/analytics-dashboard";
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

const translations = {
  en: {
    adminPanel: "Admin Panel",
    dashboard: "Dashboard",
    dashboardDesc: "Manage clients, cases, and appointments",
    totalClients: "Total Clients",
    pendingCases: "Pending Cases",
    completedCases: "Completed Cases",
    estRefunds: "Est. Refunds",
    cases: "Cases",
    clients: "Clients",
    appointments: "Appointments",
    contacts: "Contacts",
    messages: "Messages",
    analytics: "Analytics",
    taxCases: "Tax Cases",
    manageActiveCases: "Manage all active cases",
    newCase: "New Case",
    createNewCase: "Create New Case",
    createCaseDesc: "Create a new tax case for a client",
    client: "Client",
    selectClient: "Select a client",
    fiscalYear: "Fiscal Year",
    dependents: "Dependents",
    filingStatus: "Filing Status",
    single: "Single",
    marriedJoint: "Married (Joint)",
    marriedSeparate: "Married (Separate)",
    headHousehold: "Head of Household",
    creating: "Creating...",
    createCase: "Create Case",
    year: "Year",
    status: "Status",
    amount: "Amount",
    date: "Date",
    actions: "Actions",
    noCases: "No cases registered",
    clientsList: "List of all registered clients",
    name: "Name",
    email: "Email",
    phone: "Phone",
    registration: "Registration",
    noClients: "No clients registered",
    appointmentsList: "Manage scheduled appointments",
    scheduled: "Scheduled",
    completed: "Completed",
    cancelled: "Cancelled",
    notes: "Notes",
    noAppointments: "No appointments scheduled",
    contactMessages: "Contact Messages",
    contactMessagesDesc: "Messages received from contact form",
    noContacts: "No contact messages",
    editCase: "Edit Case",
    editCaseDesc: "Update case status and notes",
    finalAmount: "Final Amount ($)",
    internalNotes: "Internal Notes",
    notesPlaceholder: "Notes about the case...",
    saving: "Saving...",
    saveChanges: "Save Changes",
    caseUpdated: "Case updated",
    caseUpdatedDesc: "The case has been updated successfully.",
    caseCreated: "Case created",
    caseCreatedDesc: "The new case has been created successfully.",
    error: "Error",
    updateError: "Could not update the case.",
    createError: "Could not create the case.",
    statusPending: "Pending",
    statusInProcess: "In Process",
    statusSentToIRS: "Sent to IRS",
    statusApproved: "Approved",
    statusRefundIssued: "Refund Issued",
    admin: "Admin",
    preparer: "Preparer",
    users: "Users",
    userManagement: "User Management",
    userManagementDesc: "View and manage all registered users",
    role: "Role",
    active: "Active",
    inactive: "Inactive",
    lastLogin: "Last Login",
    activate: "Activate",
    deactivate: "Deactivate",
    resetPassword: "Reset Password",
    sendResetEmail: "Send Reset Email",
    resetEmailSent: "Password reset email sent successfully",
    noUsers: "No users registered",
    userUpdated: "User updated successfully",
    confirmDeactivate: "Deactivate User",
    confirmDeactivateDesc: "Are you sure you want to deactivate this user? They will not be able to log in.",
    confirmActivate: "Activate User",
    confirmActivateDesc: "Are you sure you want to activate this user?",
    cannotDeactivateSelf: "You cannot deactivate your own account",
    cannotChangeOwnRole: "You cannot change your own role",
    changeRole: "Change Role",
    never: "Never",
    viewDocuments: "View Documents",
    clientDocuments: "Client Documents",
    clientDocumentsDesc: "Documents uploaded by this client",
    noDocuments: "No documents uploaded",
    documentName: "Document Name",
    category: "Category",
    uploadedAt: "Uploaded At",
    size: "Size",
    download: "Download",
  },
  es: {
    adminPanel: "Panel Administrativo",
    dashboard: "Dashboard",
    dashboardDesc: "Gestiona clientes, casos y citas",
    totalClients: "Total Clientes",
    pendingCases: "Casos Pendientes",
    completedCases: "Casos Completados",
    estRefunds: "Reembolsos Est.",
    cases: "Casos",
    clients: "Clientes",
    appointments: "Citas",
    contacts: "Contactos",
    messages: "Mensajes",
    analytics: "Análisis",
    taxCases: "Casos de Impuestos",
    manageActiveCases: "Gestiona todos los casos activos",
    newCase: "Nuevo Caso",
    createNewCase: "Crear Nuevo Caso",
    createCaseDesc: "Crea un nuevo caso de impuestos para un cliente",
    client: "Cliente",
    selectClient: "Selecciona un cliente",
    fiscalYear: "Año Fiscal",
    dependents: "Dependientes",
    filingStatus: "Estado Civil",
    single: "Soltero",
    marriedJoint: "Casado (Conjunto)",
    marriedSeparate: "Casado (Separado)",
    headHousehold: "Jefe de Familia",
    creating: "Creando...",
    createCase: "Crear Caso",
    year: "Año",
    status: "Estado",
    amount: "Monto",
    date: "Fecha",
    actions: "Acciones",
    noCases: "No hay casos registrados",
    clientsList: "Lista de todos los clientes registrados",
    name: "Nombre",
    email: "Email",
    phone: "Teléfono",
    registration: "Registro",
    noClients: "No hay clientes registrados",
    appointmentsList: "Gestiona las citas programadas",
    scheduled: "Programada",
    completed: "Completada",
    cancelled: "Cancelada",
    notes: "Notas",
    noAppointments: "No hay citas programadas",
    contactMessages: "Mensajes de Contacto",
    contactMessagesDesc: "Mensajes recibidos del formulario de contacto",
    noContacts: "No hay mensajes de contacto",
    editCase: "Editar Caso",
    editCaseDesc: "Actualiza el estado y notas del caso",
    finalAmount: "Monto Final ($)",
    internalNotes: "Notas Internas",
    notesPlaceholder: "Notas sobre el caso...",
    saving: "Guardando...",
    saveChanges: "Guardar Cambios",
    caseUpdated: "Caso actualizado",
    caseUpdatedDesc: "El caso ha sido actualizado exitosamente.",
    caseCreated: "Caso creado",
    caseCreatedDesc: "El nuevo caso ha sido creado exitosamente.",
    error: "Error",
    updateError: "No se pudo actualizar el caso.",
    createError: "No se pudo crear el caso.",
    statusPending: "Pendiente",
    statusInProcess: "En Proceso",
    statusSentToIRS: "Enviado al IRS",
    statusApproved: "Aprobado",
    statusRefundIssued: "Reembolso Emitido",
    admin: "Admin",
    preparer: "Preparador",
    users: "Usuarios",
    userManagement: "Gestión de Usuarios",
    userManagementDesc: "Ver y gestionar todos los usuarios registrados",
    role: "Rol",
    active: "Activo",
    inactive: "Inactivo",
    lastLogin: "Último Acceso",
    activate: "Activar",
    deactivate: "Desactivar",
    resetPassword: "Restablecer Contraseña",
    sendResetEmail: "Enviar Email de Restablecimiento",
    resetEmailSent: "Email de restablecimiento enviado exitosamente",
    noUsers: "No hay usuarios registrados",
    userUpdated: "Usuario actualizado exitosamente",
    confirmDeactivate: "Desactivar Usuario",
    confirmDeactivateDesc: "¿Estás seguro de que deseas desactivar este usuario? No podrá iniciar sesión.",
    confirmActivate: "Activar Usuario",
    confirmActivateDesc: "¿Estás seguro de que deseas activar este usuario?",
    cannotDeactivateSelf: "No puedes desactivar tu propia cuenta",
    cannotChangeOwnRole: "No puedes cambiar tu propio rol",
    changeRole: "Cambiar Rol",
    never: "Nunca",
    viewDocuments: "Ver Documentos",
    clientDocuments: "Documentos del Cliente",
    clientDocumentsDesc: "Documentos subidos por este cliente",
    noDocuments: "No hay documentos subidos",
    documentName: "Nombre del Documento",
    category: "Categoría",
    uploadedAt: "Subido el",
    size: "Tamaño",
    download: "Descargar",
  },
  fr: {
    adminPanel: "Panneau d'Administration",
    dashboard: "Tableau de Bord",
    dashboardDesc: "Gérez les clients, dossiers et rendez-vous",
    totalClients: "Total Clients",
    pendingCases: "Dossiers en Attente",
    completedCases: "Dossiers Terminés",
    estRefunds: "Remboursements Est.",
    cases: "Dossiers",
    clients: "Clients",
    appointments: "Rendez-vous",
    contacts: "Contacts",
    messages: "Messages",
    analytics: "Analytique",
    taxCases: "Dossiers Fiscaux",
    manageActiveCases: "Gérez tous les dossiers actifs",
    newCase: "Nouveau Dossier",
    createNewCase: "Créer un Nouveau Dossier",
    createCaseDesc: "Créez un nouveau dossier fiscal pour un client",
    client: "Client",
    selectClient: "Sélectionnez un client",
    fiscalYear: "Année Fiscale",
    dependents: "Personnes à Charge",
    filingStatus: "Situation Familiale",
    single: "Célibataire",
    marriedJoint: "Marié (Conjoint)",
    marriedSeparate: "Marié (Séparé)",
    headHousehold: "Chef de Famille",
    creating: "Création...",
    createCase: "Créer Dossier",
    year: "Année",
    status: "Statut",
    amount: "Montant",
    date: "Date",
    actions: "Actions",
    noCases: "Aucun dossier enregistré",
    clientsList: "Liste de tous les clients enregistrés",
    name: "Nom",
    email: "Email",
    phone: "Téléphone",
    registration: "Inscription",
    noClients: "Aucun client enregistré",
    appointmentsList: "Gérez les rendez-vous programmés",
    scheduled: "Programmé",
    completed: "Terminé",
    cancelled: "Annulé",
    notes: "Notes",
    noAppointments: "Aucun rendez-vous programmé",
    contactMessages: "Messages de Contact",
    contactMessagesDesc: "Messages reçus du formulaire de contact",
    noContacts: "Aucun message de contact",
    editCase: "Modifier Dossier",
    editCaseDesc: "Mettez à jour le statut et les notes du dossier",
    finalAmount: "Montant Final ($)",
    internalNotes: "Notes Internes",
    notesPlaceholder: "Notes sur le dossier...",
    saving: "Enregistrement...",
    saveChanges: "Enregistrer les Modifications",
    caseUpdated: "Dossier mis à jour",
    caseUpdatedDesc: "Le dossier a été mis à jour avec succès.",
    caseCreated: "Dossier créé",
    caseCreatedDesc: "Le nouveau dossier a été créé avec succès.",
    error: "Erreur",
    updateError: "Impossible de mettre à jour le dossier.",
    createError: "Impossible de créer le dossier.",
    statusPending: "En attente",
    statusInProcess: "En cours",
    statusSentToIRS: "Envoyé à l'IRS",
    statusApproved: "Approuvé",
    statusRefundIssued: "Remboursement Émis",
    admin: "Admin",
    preparer: "Préparateur",
    users: "Utilisateurs",
    userManagement: "Gestion des Utilisateurs",
    userManagementDesc: "Voir et gérer tous les utilisateurs inscrits",
    role: "Rôle",
    active: "Actif",
    inactive: "Inactif",
    lastLogin: "Dernière Connexion",
    activate: "Activer",
    deactivate: "Désactiver",
    resetPassword: "Réinitialiser le Mot de Passe",
    sendResetEmail: "Envoyer Email de Réinitialisation",
    resetEmailSent: "Email de réinitialisation envoyé avec succès",
    noUsers: "Aucun utilisateur inscrit",
    userUpdated: "Utilisateur mis à jour avec succès",
    confirmDeactivate: "Désactiver l'Utilisateur",
    confirmDeactivateDesc: "Êtes-vous sûr de vouloir désactiver cet utilisateur? Il ne pourra pas se connecter.",
    confirmActivate: "Activer l'Utilisateur",
    confirmActivateDesc: "Êtes-vous sûr de vouloir activer cet utilisateur?",
    cannotDeactivateSelf: "Vous ne pouvez pas désactiver votre propre compte",
    cannotChangeOwnRole: "Vous ne pouvez pas modifier votre propre rôle",
    changeRole: "Modifier le Rôle",
    never: "Jamais",
  },
  pt: {
    adminPanel: "Painel Administrativo",
    dashboard: "Dashboard",
    dashboardDesc: "Gerencie clientes, casos e consultas",
    totalClients: "Total de Clientes",
    pendingCases: "Casos Pendentes",
    completedCases: "Casos Concluídos",
    estRefunds: "Reembolsos Est.",
    cases: "Casos",
    clients: "Clientes",
    appointments: "Consultas",
    contacts: "Contatos",
    messages: "Mensagens",
    analytics: "Análise",
    taxCases: "Casos Fiscais",
    manageActiveCases: "Gerencie todos os casos ativos",
    newCase: "Novo Caso",
    createNewCase: "Criar Novo Caso",
    createCaseDesc: "Crie um novo caso fiscal para um cliente",
    client: "Cliente",
    selectClient: "Selecione um cliente",
    fiscalYear: "Ano Fiscal",
    dependents: "Dependentes",
    filingStatus: "Estado Civil",
    single: "Solteiro",
    marriedJoint: "Casado (Conjunto)",
    marriedSeparate: "Casado (Separado)",
    headHousehold: "Chefe de Família",
    creating: "Criando...",
    createCase: "Criar Caso",
    year: "Ano",
    status: "Status",
    amount: "Valor",
    date: "Data",
    actions: "Ações",
    noCases: "Nenhum caso registrado",
    clientsList: "Lista de todos os clientes registrados",
    name: "Nome",
    email: "Email",
    phone: "Telefone",
    registration: "Registro",
    noClients: "Nenhum cliente registrado",
    appointmentsList: "Gerencie as consultas agendadas",
    scheduled: "Agendada",
    completed: "Concluída",
    cancelled: "Cancelada",
    notes: "Notas",
    noAppointments: "Nenhuma consulta agendada",
    contactMessages: "Mensagens de Contato",
    contactMessagesDesc: "Mensagens recebidas do formulário de contato",
    noContacts: "Nenhuma mensagem de contato",
    editCase: "Editar Caso",
    editCaseDesc: "Atualize o status e notas do caso",
    finalAmount: "Valor Final ($)",
    internalNotes: "Notas Internas",
    notesPlaceholder: "Notas sobre o caso...",
    saving: "Salvando...",
    saveChanges: "Salvar Alterações",
    caseUpdated: "Caso atualizado",
    caseUpdatedDesc: "O caso foi atualizado com sucesso.",
    caseCreated: "Caso criado",
    caseCreatedDesc: "O novo caso foi criado com sucesso.",
    error: "Erro",
    updateError: "Não foi possível atualizar o caso.",
    createError: "Não foi possível criar o caso.",
    statusPending: "Pendente",
    statusInProcess: "Em Processo",
    statusSentToIRS: "Enviado ao IRS",
    statusApproved: "Aprovado",
    statusRefundIssued: "Reembolso Emitido",
    admin: "Admin",
    preparer: "Preparador",
    users: "Usuários",
    userManagement: "Gestão de Usuários",
    userManagementDesc: "Ver e gerenciar todos os usuários registrados",
    role: "Função",
    active: "Ativo",
    inactive: "Inativo",
    lastLogin: "Último Acesso",
    activate: "Ativar",
    deactivate: "Desativar",
    resetPassword: "Redefinir Senha",
    sendResetEmail: "Enviar Email de Redefinição",
    resetEmailSent: "Email de redefinição enviado com sucesso",
    noUsers: "Nenhum usuário registrado",
    userUpdated: "Usuário atualizado com sucesso",
    confirmDeactivate: "Desativar Usuário",
    confirmDeactivateDesc: "Tem certeza de que deseja desativar este usuário? Ele não poderá fazer login.",
    confirmActivate: "Ativar Usuário",
    confirmActivateDesc: "Tem certeza de que deseja ativar este usuário?",
    cannotDeactivateSelf: "Você não pode desativar sua própria conta",
    cannotChangeOwnRole: "Você não pode alterar sua própria função",
    changeRole: "Alterar Função",
    never: "Nunca",
  },
  zh: {
    adminPanel: "管理面板",
    dashboard: "控制台",
    dashboardDesc: "管理客户、案例和预约",
    totalClients: "总客户数",
    pendingCases: "待处理案例",
    completedCases: "已完成案例",
    estRefunds: "预计退款",
    cases: "案例",
    clients: "客户",
    appointments: "预约",
    contacts: "联系人",
    messages: "消息",
    analytics: "分析",
    taxCases: "税务案例",
    manageActiveCases: "管理所有活跃案例",
    newCase: "新案例",
    createNewCase: "创建新案例",
    createCaseDesc: "为客户创建新的税务案例",
    client: "客户",
    selectClient: "选择客户",
    fiscalYear: "财年",
    dependents: "受抚养人",
    filingStatus: "申报状态",
    single: "单身",
    marriedJoint: "已婚（联合）",
    marriedSeparate: "已婚（分开）",
    headHousehold: "户主",
    creating: "创建中...",
    createCase: "创建案例",
    year: "年份",
    status: "状态",
    amount: "金额",
    date: "日期",
    actions: "操作",
    noCases: "没有注册案例",
    clientsList: "所有注册客户列表",
    name: "姓名",
    email: "电子邮件",
    phone: "电话",
    registration: "注册",
    noClients: "没有注册客户",
    appointmentsList: "管理预定的预约",
    scheduled: "已安排",
    completed: "已完成",
    cancelled: "已取消",
    notes: "备注",
    noAppointments: "没有预定的预约",
    contactMessages: "联系消息",
    contactMessagesDesc: "从联系表单收到的消息",
    noContacts: "没有联系消息",
    editCase: "编辑案例",
    editCaseDesc: "更新案例状态和备注",
    finalAmount: "最终金额 ($)",
    internalNotes: "内部备注",
    notesPlaceholder: "关于案例的备注...",
    saving: "保存中...",
    saveChanges: "保存更改",
    caseUpdated: "案例已更新",
    caseUpdatedDesc: "案例已成功更新。",
    caseCreated: "案例已创建",
    caseCreatedDesc: "新案例已成功创建。",
    error: "错误",
    updateError: "无法更新案例。",
    createError: "无法创建案例。",
    statusPending: "待处理",
    statusInProcess: "处理中",
    statusSentToIRS: "已发送至IRS",
    statusApproved: "已批准",
    statusRefundIssued: "退款已发放",
    admin: "管理员",
    preparer: "准备者",
    users: "用户",
    userManagement: "用户管理",
    userManagementDesc: "查看和管理所有注册用户",
    role: "角色",
    active: "活跃",
    inactive: "停用",
    lastLogin: "上次登录",
    activate: "激活",
    deactivate: "停用",
    resetPassword: "重置密码",
    sendResetEmail: "发送重置邮件",
    resetEmailSent: "密码重置邮件已成功发送",
    noUsers: "没有注册用户",
    userUpdated: "用户更新成功",
    confirmDeactivate: "停用用户",
    confirmDeactivateDesc: "确定要停用此用户吗？他们将无法登录。",
    confirmActivate: "激活用户",
    confirmActivateDesc: "确定要激活此用户吗？",
    cannotDeactivateSelf: "您不能停用自己的账户",
    cannotChangeOwnRole: "您不能更改自己的角色",
    changeRole: "更改角色",
    never: "从未",
  },
  ht: {
    adminPanel: "Panèl Administrasyon",
    dashboard: "Tablo Kontwòl",
    dashboardDesc: "Jere kliyan, dosye ak randevou",
    totalClients: "Total Kliyan",
    pendingCases: "Dosye an Atant",
    completedCases: "Dosye Fini",
    estRefunds: "Ranbousman Est.",
    cases: "Dosye",
    clients: "Kliyan",
    appointments: "Randevou",
    contacts: "Kontak",
    messages: "Mesaj",
    analytics: "Analitik",
    taxCases: "Dosye Taks",
    manageActiveCases: "Jere tout dosye aktif",
    newCase: "Nouvo Dosye",
    createNewCase: "Kreye Nouvo Dosye",
    createCaseDesc: "Kreye yon nouvo dosye taks pou yon kliyan",
    client: "Kliyan",
    selectClient: "Chwazi yon kliyan",
    fiscalYear: "Ane Fiskal",
    dependents: "Depandan",
    filingStatus: "Estati Sivil",
    single: "Selibatè",
    marriedJoint: "Marye (Ansanm)",
    marriedSeparate: "Marye (Separe)",
    headHousehold: "Chèf Kay",
    creating: "Ap kreye...",
    createCase: "Kreye Dosye",
    year: "Ane",
    status: "Estati",
    amount: "Montan",
    date: "Dat",
    actions: "Aksyon",
    noCases: "Pa gen dosye anrejistre",
    clientsList: "Lis tout kliyan anrejistre",
    name: "Non",
    email: "Imèl",
    phone: "Telefòn",
    registration: "Enskripsyon",
    noClients: "Pa gen kliyan anrejistre",
    appointmentsList: "Jere randevou pwograme",
    scheduled: "Pwograme",
    completed: "Fini",
    cancelled: "Anile",
    notes: "Nòt",
    noAppointments: "Pa gen randevou pwograme",
    contactMessages: "Mesaj Kontak",
    contactMessagesDesc: "Mesaj ki resevwa nan fòm kontak",
    noContacts: "Pa gen mesaj kontak",
    editCase: "Modifye Dosye",
    editCaseDesc: "Mete ajou estati ak nòt dosye a",
    finalAmount: "Montan Final ($)",
    internalNotes: "Nòt Entèn",
    notesPlaceholder: "Nòt sou dosye a...",
    saving: "Ap anrejistre...",
    saveChanges: "Anrejistre Chanjman",
    caseUpdated: "Dosye mete ajou",
    caseUpdatedDesc: "Dosye a mete ajou avèk siksè.",
    caseCreated: "Dosye kreye",
    caseCreatedDesc: "Nouvo dosye a kreye avèk siksè.",
    error: "Erè",
    updateError: "Pa kapab mete dosye a ajou.",
    createError: "Pa kapab kreye dosye a.",
    statusPending: "An Atant",
    statusInProcess: "An Pwosesis",
    statusSentToIRS: "Voye bay IRS",
    statusApproved: "Apwouve",
    statusRefundIssued: "Ranbousman Emèt",
    admin: "Admin",
    preparer: "Preparatè",
    users: "Itilizatè",
    userManagement: "Jesyon Itilizatè",
    userManagementDesc: "Gade epi jere tout itilizatè ki enskri",
    role: "Wòl",
    active: "Aktif",
    inactive: "Inaktif",
    lastLogin: "Dènye Koneksyon",
    activate: "Aktive",
    deactivate: "Dezaktive",
    resetPassword: "Reyinisyalize Modpas",
    sendResetEmail: "Voye Imèl Reyinisyalizasyon",
    resetEmailSent: "Imèl reyinisyalizasyon modpas voye avèk siksè",
    noUsers: "Pa gen itilizatè enskri",
    userUpdated: "Itilizatè mete ajou avèk siksè",
    confirmDeactivate: "Dezaktive Itilizatè",
    confirmDeactivateDesc: "Èske ou sèten ou vle dezaktive itilizatè sa? Li pap kapab konekte.",
    confirmActivate: "Aktive Itilizatè",
    confirmActivateDesc: "Èske ou sèten ou vle aktive itilizatè sa?",
    cannotDeactivateSelf: "Ou pa kapab dezaktive pwòp kont ou",
    cannotChangeOwnRole: "Ou pa kapab chanje pwòp wòl ou",
    changeRole: "Chanje Wòl",
    never: "Jamè",
  },
};

export default function Admin() {
  const [, setLocation] = useLocation();
  const { user, logout, isLoading: authLoading } = useAuth();
  const { toast } = useToast();
  const { language } = useI18n();

  // Proteger ruta: solo admins y preparadores pueden acceder
  useEffect(() => {
    if (!authLoading) {
      if (!user) {
        // No autenticado - redirigir al portal
        setLocation("/portal");
      } else if (user.role !== "admin" && user.role !== "preparer") {
        // Usuario es cliente - redirigir al dashboard
        setLocation("/dashboard");
      }
    }
  }, [user, authLoading, setLocation]);
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
  const [selectedClient, setSelectedClient] = useState<ClientWithDetails | null>(null);
  const [isDocumentsDialogOpen, setIsDocumentsDialogOpen] = useState(false);

  const t = translations[language as keyof typeof translations] || translations.en;

  const statusOptions = [
    { value: "pending", label: t.statusPending },
    { value: "in_process", label: t.statusInProcess },
    { value: "sent_to_irs", label: t.statusSentToIRS },
    { value: "approved", label: t.statusApproved },
    { value: "refund_issued", label: t.statusRefundIssued },
  ];

  const { data: stats, isLoading: statsLoading } = useQuery<AdminStats>({
    queryKey: ["/api/admin/stats"],
    enabled: !!user && (user.role === "admin" || user.role === "preparer"),
  });

  const { data: clients, isLoading: clientsLoading } = useQuery<ClientWithDetails[]>({
    queryKey: ["/api/admin/clients"],
    enabled: !!user && (user.role === "admin" || user.role === "preparer"),
  });

  const { data: clientDocuments, isLoading: documentsLoading } = useQuery<{
    client: User;
    documents: Document[];
    cases: TaxCase[];
    appointments: Appointment[];
  }>({
    queryKey: ["/api/admin/clients", selectedClient?.id],
    enabled: !!selectedClient && !!user && (user.role === "admin" || user.role === "preparer"),
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

  const { data: allUsers, isLoading: usersLoading } = useQuery<User[]>({
    queryKey: ["/api/admin/users"],
    enabled: !!user && user.role === "admin",
  });

  const updateUserStatusMutation = useMutation({
    mutationFn: async (data: { userId: number; isActive: boolean }) => {
      return apiRequest("PATCH", `/api/admin/users/${data.userId}/status`, {
        isActive: data.isActive,
      });
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/admin/users"] });
      toast({
        title: t.userUpdated,
      });
    },
    onError: (error: Error) => {
      toast({
        title: t.error,
        description: error.message,
        variant: "destructive",
      });
    },
  });

  const updateUserRoleMutation = useMutation({
    mutationFn: async (data: { userId: number; role: string }) => {
      return apiRequest("PATCH", `/api/admin/users/${data.userId}/role`, {
        role: data.role,
      });
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/admin/users"] });
      toast({
        title: t.userUpdated,
      });
    },
    onError: (error: Error) => {
      toast({
        title: t.error,
        description: error.message,
        variant: "destructive",
      });
    },
  });

  const sendResetEmailMutation = useMutation({
    mutationFn: async (userId: number) => {
      return apiRequest("POST", `/api/admin/users/${userId}/reset-password`, {});
    },
    onSuccess: () => {
      toast({
        title: t.resetEmailSent,
      });
    },
    onError: (error: Error) => {
      toast({
        title: t.error,
        description: error.message,
        variant: "destructive",
      });
    },
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
        title: t.caseUpdated,
        description: t.caseUpdatedDesc,
      });
    },
    onError: () => {
      toast({
        title: t.error,
        description: t.updateError,
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
        title: t.caseCreated,
        description: t.caseCreatedDesc,
      });
    },
    onError: () => {
      toast({
        title: t.error,
        description: t.createError,
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

  // Si no hay usuario o no tiene permisos, mostrar loading mientras se redirige
  if (!user || (user.role !== "admin" && user.role !== "preparer")) {
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
    <div className="min-h-screen bg-muted/30" data-testid="page-admin">
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
                <span className="font-semibold hidden sm:block">{t.adminPanel}</span>
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
                <div className="hidden sm:block">
                  <span className="text-sm font-medium">{user.name}</span>
                  <Badge variant="secondary" className="ml-2 text-xs">
                    {user.role === "admin" ? t.admin : t.preparer}
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
          <h1 className="text-2xl sm:text-3xl font-bold">{t.dashboard}</h1>
          <p className="text-muted-foreground mt-1">
            {t.dashboardDesc}
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
                  <p className="text-sm text-muted-foreground">{t.totalClients}</p>
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
                  <p className="text-sm text-muted-foreground">{t.pendingCases}</p>
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
                  <p className="text-sm text-muted-foreground">{t.completedCases}</p>
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
                  <p className="text-sm text-muted-foreground">{t.estRefunds}</p>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        <Tabs defaultValue="cases" className="space-y-6">
          <TabsList>
            <TabsTrigger value="cases" data-testid="tab-cases">
              <FolderOpen className="h-4 w-4 mr-2" />
              {t.cases}
            </TabsTrigger>
            <TabsTrigger value="clients" data-testid="tab-clients">
              <Users className="h-4 w-4 mr-2" />
              {t.clients}
            </TabsTrigger>
            <TabsTrigger value="appointments" data-testid="tab-appointments">
              <CalendarDays className="h-4 w-4 mr-2" />
              {t.appointments}
            </TabsTrigger>
            <TabsTrigger value="contacts" data-testid="tab-contacts">
              <Mail className="h-4 w-4 mr-2" />
              {t.contacts}
            </TabsTrigger>
            <TabsTrigger value="messages" data-testid="tab-messages">
              <FileText className="h-4 w-4 mr-2" />
              {t.messages}
            </TabsTrigger>
            <TabsTrigger value="analytics" data-testid="tab-analytics">
              <BarChart3 className="h-4 w-4 mr-2" />
              {t.analytics}
            </TabsTrigger>
            <TabsTrigger value="users" data-testid="tab-users">
              <Settings className="h-4 w-4 mr-2" />
              {t.users}
            </TabsTrigger>
          </TabsList>

          <TabsContent value="cases">
            <Card>
              <CardHeader className="flex flex-row items-center justify-between gap-4">
                <div>
                  <CardTitle>{t.taxCases}</CardTitle>
                  <CardDescription>{t.manageActiveCases}</CardDescription>
                </div>
                <Dialog open={isCreateCaseOpen} onOpenChange={setIsCreateCaseOpen}>
                  <DialogTrigger asChild>
                    <Button className="gap-2" data-testid="button-create-case">
                      <Plus className="h-4 w-4" />
                      {t.newCase}
                    </Button>
                  </DialogTrigger>
                  <DialogContent>
                    <DialogHeader>
                      <DialogTitle>{t.createNewCase}</DialogTitle>
                      <DialogDescription>
                        {t.createCaseDesc}
                      </DialogDescription>
                    </DialogHeader>
                    <div className="space-y-4 pt-4">
                      <div className="space-y-2">
                        <Label>{t.client}</Label>
                        <Select
                          value={newCaseData.clientId}
                          onValueChange={(value) =>
                            setNewCaseData({ ...newCaseData, clientId: value })
                          }
                        >
                          <SelectTrigger data-testid="select-client">
                            <SelectValue placeholder={t.selectClient} />
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
                          <Label>{t.fiscalYear}</Label>
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
                          <Label>{t.dependents}</Label>
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
                        <Label>{t.filingStatus}</Label>
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
                            <SelectItem value="single">{t.single}</SelectItem>
                            <SelectItem value="married_filing_jointly">
                              {t.marriedJoint}
                            </SelectItem>
                            <SelectItem value="married_filing_separately">
                              {t.marriedSeparate}
                            </SelectItem>
                            <SelectItem value="head_of_household">
                              {t.headHousehold}
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
                            {t.creating}
                          </>
                        ) : (
                          t.createCase
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
                          <TableHead>{t.client}</TableHead>
                          <TableHead>{t.year}</TableHead>
                          <TableHead>{t.status}</TableHead>
                          <TableHead>{t.amount}</TableHead>
                          <TableHead>{t.date}</TableHead>
                          <TableHead className="text-right">{t.actions}</TableHead>
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
                                  {taxCase.client?.name || t.client}
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
                                locale: getDateLocale(language),
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
                    <p className="text-muted-foreground">{t.noCases}</p>
                  </div>
                )}
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="clients">
            <Card>
              <CardHeader>
                <CardTitle>{t.clients}</CardTitle>
                <CardDescription>{t.clientsList}</CardDescription>
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
                          <TableHead>{t.name}</TableHead>
                          <TableHead>{t.email}</TableHead>
                          <TableHead>{t.phone}</TableHead>
                          <TableHead>{t.cases}</TableHead>
                          <TableHead>Docs</TableHead>
                          <TableHead>{t.registration}</TableHead>
                          <TableHead>{t.actions}</TableHead>
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
                                locale: getDateLocale(language),
                              })}
                            </TableCell>
                            <TableCell>
                              <Button
                                variant="outline"
                                size="sm"
                                onClick={() => {
                                  setSelectedClient(client);
                                  setIsDocumentsDialogOpen(true);
                                }}
                              >
                                <Eye className="h-4 w-4 mr-2" />
                                {t.viewDocuments}
                              </Button>
                            </TableCell>
                          </TableRow>
                        ))}
                      </TableBody>
                    </Table>
                  </div>
                ) : (
                  <div className="text-center py-8">
                    <Users className="h-12 w-12 mx-auto text-muted-foreground/50 mb-4" />
                    <p className="text-muted-foreground">{t.noClients}</p>
                  </div>
                )}
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="appointments">
            <Card>
              <CardHeader>
                <CardTitle>{t.appointments}</CardTitle>
                <CardDescription>{t.appointmentsList}</CardDescription>
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
                          <TableHead>{t.date}</TableHead>
                          <TableHead>{t.status}</TableHead>
                          <TableHead>{t.notes}</TableHead>
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
                                "EEEE, d MMMM yyyy",
                                { locale: getDateLocale(language) }
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
                                {appointmentStatusLabels[appointment.status] || appointment.status}
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
                    <p className="text-muted-foreground">{t.noAppointments}</p>
                  </div>
                )}
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="contacts">
            <Card>
              <CardHeader>
                <CardTitle>{t.contactMessages}</CardTitle>
                <CardDescription>{t.contactMessagesDesc}</CardDescription>
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
                              locale: getDateLocale(language),
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
                    <p className="text-muted-foreground">{t.noContacts}</p>
                  </div>
                )}
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="messages">
            <div className="h-[600px]">
              <MessagingPanel />
            </div>
          </TabsContent>

          <TabsContent value="analytics">
            <AnalyticsDashboard />
          </TabsContent>

          <TabsContent value="users">
            <Card>
              <CardHeader>
                <CardTitle>{t.userManagement}</CardTitle>
                <CardDescription>{t.userManagementDesc}</CardDescription>
              </CardHeader>
              <CardContent>
                {usersLoading ? (
                  <div className="space-y-4">
                    {[...Array(5)].map((_, i) => (
                      <Skeleton key={i} className="h-16 w-full" />
                    ))}
                  </div>
                ) : allUsers && allUsers.length > 0 ? (
                  <div className="rounded-md border">
                    <Table>
                      <TableHeader>
                        <TableRow>
                          <TableHead>{t.name}</TableHead>
                          <TableHead>{t.email}</TableHead>
                          <TableHead>{t.role}</TableHead>
                          <TableHead>{t.status}</TableHead>
                          <TableHead>{t.lastLogin}</TableHead>
                          <TableHead>{t.actions}</TableHead>
                        </TableRow>
                      </TableHeader>
                      <TableBody>
                        {allUsers.map((u) => (
                          <TableRow key={u.id} data-testid={`row-user-${u.id}`}>
                            <TableCell>
                              <div className="flex items-center gap-3">
                                <Avatar className="h-8 w-8">
                                  <AvatarFallback>
                                    {u.name?.charAt(0).toUpperCase() || "U"}
                                  </AvatarFallback>
                                </Avatar>
                                <span className="font-medium">{u.name || "-"}</span>
                              </div>
                            </TableCell>
                            <TableCell className="text-muted-foreground">
                              {u.email || "-"}
                            </TableCell>
                            <TableCell>
                              <Select
                                value={u.role}
                                onValueChange={(newRole) => {
                                  if (user?.id === u.id) {
                                    toast({
                                      title: t.error,
                                      description: t.cannotChangeOwnRole,
                                      variant: "destructive",
                                    });
                                    return;
                                  }
                                  updateUserRoleMutation.mutate({ userId: u.id, role: newRole });
                                }}
                                disabled={user?.id === u.id}
                              >
                                <SelectTrigger className="w-[120px]" data-testid={`select-role-${u.id}`}>
                                  <SelectValue />
                                </SelectTrigger>
                                <SelectContent>
                                  <SelectItem value="client">{t.clients}</SelectItem>
                                  <SelectItem value="preparer">{t.preparer}</SelectItem>
                                  <SelectItem value="admin">{t.admin}</SelectItem>
                                </SelectContent>
                              </Select>
                            </TableCell>
                            <TableCell>
                              <Badge
                                className={
                                  u.isActive !== false
                                    ? "bg-green-500/10 text-green-600 dark:text-green-400"
                                    : "bg-red-500/10 text-red-600 dark:text-red-400"
                                }
                              >
                                {u.isActive !== false ? t.active : t.inactive}
                              </Badge>
                            </TableCell>
                            <TableCell className="text-muted-foreground">
                              {u.lastLoginAt
                                ? format(new Date(u.lastLoginAt), "d MMM yyyy HH:mm", {
                                    locale: getDateLocale(language),
                                  })
                                : t.never}
                            </TableCell>
                            <TableCell>
                              <div className="flex items-center gap-2">
                                <Button
                                  size="sm"
                                  variant={u.isActive !== false ? "outline" : "default"}
                                  onClick={() => {
                                    if (user?.id === u.id) {
                                      toast({
                                        title: t.error,
                                        description: t.cannotDeactivateSelf,
                                        variant: "destructive",
                                      });
                                      return;
                                    }
                                    updateUserStatusMutation.mutate({
                                      userId: u.id,
                                      isActive: u.isActive === false,
                                    });
                                  }}
                                  disabled={user?.id === u.id || updateUserStatusMutation.isPending}
                                  data-testid={`button-toggle-status-${u.id}`}
                                >
                                  {u.isActive !== false ? t.deactivate : t.activate}
                                </Button>
                                <Button
                                  size="sm"
                                  variant="ghost"
                                  onClick={() => sendResetEmailMutation.mutate(u.id)}
                                  disabled={!u.email || sendResetEmailMutation.isPending}
                                  data-testid={`button-reset-password-${u.id}`}
                                >
                                  {t.resetPassword}
                                </Button>
                              </div>
                            </TableCell>
                          </TableRow>
                        ))}
                      </TableBody>
                    </Table>
                  </div>
                ) : (
                  <div className="text-center py-8">
                    <Users className="h-12 w-12 mx-auto text-muted-foreground/50 mb-4" />
                    <p className="text-muted-foreground">{t.noUsers}</p>
                  </div>
                )}
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>

        <Dialog open={isEditOpen} onOpenChange={setIsEditOpen}>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>{t.editCase}</DialogTitle>
              <DialogDescription>
                {t.editCaseDesc}
              </DialogDescription>
            </DialogHeader>
            <div className="space-y-4 pt-4">
              <div className="space-y-2">
                <Label>{t.status}</Label>
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
                <Label>{t.finalAmount}</Label>
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
                <Label>{t.internalNotes}</Label>
                <Textarea
                  value={editNotes}
                  onChange={(e) => setEditNotes(e.target.value)}
                  placeholder={t.notesPlaceholder}
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
                    {t.saving}
                  </>
                ) : (
                  t.saveChanges
                )}
              </Button>
            </div>
          </DialogContent>
        </Dialog>

        {/* Dialogo de Documentos del Cliente */}
        <Dialog open={isDocumentsDialogOpen} onOpenChange={setIsDocumentsDialogOpen}>
          <DialogContent className="max-w-4xl max-h-[80vh] overflow-y-auto">
            <DialogHeader>
              <DialogTitle>
                {t.clientDocuments} - {selectedClient?.name}
              </DialogTitle>
              <DialogDescription>
                {t.clientDocumentsDesc}
              </DialogDescription>
            </DialogHeader>
            <div className="space-y-4 pt-4">
              {documentsLoading ? (
                <div className="space-y-3">
                  {[1, 2, 3].map((i) => (
                    <Skeleton key={i} className="h-20 w-full" />
                  ))}
                </div>
              ) : clientDocuments?.documents && clientDocuments.documents.length > 0 ? (
                <div className="space-y-3">
                  <Table>
                    <TableHeader>
                      <TableRow>
                        <TableHead>{t.documentName}</TableHead>
                        <TableHead>{t.category}</TableHead>
                        <TableHead>{t.uploadedAt}</TableHead>
                        <TableHead>{t.size}</TableHead>
                        <TableHead>{t.actions}</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {clientDocuments.documents.map((doc) => (
                        <TableRow key={doc.id}>
                          <TableCell className="font-medium">{doc.fileName}</TableCell>
                          <TableCell>
                            <Badge variant="secondary">{doc.category || "-"}</Badge>
                          </TableCell>
                          <TableCell>
                            {format(new Date(doc.createdAt), "d MMM yyyy HH:mm", {
                              locale: getDateLocale(language),
                            })}
                          </TableCell>
                          <TableCell>
                            {doc.fileSize ? `${(doc.fileSize / 1024).toFixed(2)} KB` : "-"}
                          </TableCell>
                          <TableCell>
                            <Button
                              variant="outline"
                              size="sm"
                              onClick={() => {
                                if (doc.filePath) {
                                  window.open(`/api/documents/${doc.id}/download`, "_blank");
                                }
                              }}
                            >
                              <Download className="h-4 w-4 mr-2" />
                              {t.download}
                            </Button>
                          </TableCell>
                        </TableRow>
                      ))}
                    </TableBody>
                  </Table>
                </div>
              ) : (
                <div className="text-center py-8">
                  <FileText className="h-12 w-12 mx-auto text-muted-foreground/50 mb-4" />
                  <p className="text-muted-foreground">{t.noDocuments}</p>
                </div>
              )}
            </div>
          </DialogContent>
        </Dialog>
      </main>

      <WhatsAppButton />
    </div>
  );
}
