import { 
  users, 
  taxCases, 
  documents, 
  appointments, 
  messages, 
  contactSubmissions,
  activityLogs,
  authIdentities,
  type User, 
  type InsertUser,
  type TaxCase,
  type InsertTaxCase,
  type Document,
  type InsertDocument,
  type Appointment,
  type InsertAppointment,
  type Message,
  type InsertMessage,
  type ContactSubmission,
  type InsertContactSubmission,
  type ActivityLog,
  type InsertActivityLog,
  type AuthIdentity,
  type InsertAuthIdentity,
} from "@shared/schema";
import { db } from "./db";
import { eq, desc, and, sql, count, sum } from "drizzle-orm";

export interface IStorage {
  getUser(id: number): Promise<User | undefined>;
  getUserByEmail(email: string): Promise<User | undefined>;
  createUser(user: InsertUser): Promise<User>;
  updateUser(id: number, data: Partial<InsertUser>): Promise<User | undefined>;
  getAllClients(): Promise<User[]>;
  getClientsWithDetails(): Promise<(User & { documentsCount: number; casesCount: number })[]>;
  
  getAuthIdentityByProvider(provider: string, providerUserId: string): Promise<AuthIdentity | undefined>;
  createAuthIdentity(identity: InsertAuthIdentity): Promise<AuthIdentity>;
  
  getTaxCasesByClient(clientId: number): Promise<TaxCase[]>;
  getTaxCase(id: number): Promise<TaxCase | undefined>;
  getAllTaxCases(): Promise<(TaxCase & { client?: User })[]>;
  createTaxCase(taxCase: InsertTaxCase): Promise<TaxCase>;
  updateTaxCase(id: number, data: Partial<InsertTaxCase>): Promise<TaxCase | undefined>;
  
  getDocumentsByCase(caseId: number): Promise<Document[]>;
  getDocumentsByClient(clientId: number): Promise<Document[]>;
  getDocumentsByClientDirect(clientId: number): Promise<Document[]>;
  getAllDocuments(): Promise<Document[]>;
  getDocument(id: number): Promise<Document | undefined>;
  createDocument(document: InsertDocument): Promise<Document>;
  
  getAppointmentsByClient(clientId: number): Promise<Appointment[]>;
  getAllAppointments(): Promise<Appointment[]>;
  checkAppointmentConflict(appointmentDate: Date): Promise<boolean>;
  createAppointment(appointment: InsertAppointment): Promise<Appointment>;
  updateAppointment(id: number, data: Partial<InsertAppointment>): Promise<Appointment | undefined>;
  
  getMessagesByCase(caseId: number): Promise<Message[]>;
  getConversation(userId1: number, userId2: number): Promise<Message[]>;
  getConversationsForUser(userId: number): Promise<{ partnerId: number; partnerName: string; partnerRole: string; lastMessage: Message; unreadCount: number }[]>;
  createMessage(message: InsertMessage): Promise<Message>;
  markMessagesAsRead(recipientId: number, senderId: number): Promise<void>;
  getUnreadCount(userId: number): Promise<number>;
  
  createContactSubmission(contact: InsertContactSubmission): Promise<ContactSubmission>;
  getAllContactSubmissions(): Promise<ContactSubmission[]>;
  
  createActivityLog(log: InsertActivityLog): Promise<ActivityLog>;
  
  getAdminStats(): Promise<{
    totalClients: number;
    pendingCases: number;
    completedCases: number;
    totalRefunds: number;
  }>;

  getAnalyticsData(): Promise<{
    casesByMonth: { month: string; count: number; amount: number }[];
    casesByStatus: { status: string; count: number }[];
    casesByYear: { year: number; count: number; amount: number }[];
    recentActivity: { date: string; action: string; details: string }[];
  }>;
}

export class DatabaseStorage implements IStorage {
  async getUser(id: number): Promise<User | undefined> {
    const [user] = await db.select().from(users).where(eq(users.id, id));
    return user || undefined;
  }

  async getUserByEmail(email: string): Promise<User | undefined> {
    const [user] = await db.select().from(users).where(eq(users.email, email));
    return user || undefined;
  }

  async createUser(insertUser: InsertUser): Promise<User> {
    const [user] = await db
      .insert(users)
      .values(insertUser)
      .returning();
    return user;
  }

  async updateUser(id: number, data: Partial<InsertUser>): Promise<User | undefined> {
    const [user] = await db
      .update(users)
      .set({ ...data, updatedAt: new Date() })
      .where(eq(users.id, id))
      .returning();
    return user || undefined;
  }

  async getAllClients(): Promise<User[]> {
    return db.select().from(users).where(eq(users.role, "client")).orderBy(desc(users.createdAt));
  }

  async getClientsWithDetails(): Promise<(User & { documentsCount: number; casesCount: number })[]> {
    const clients = await this.getAllClients();
    const clientsWithDetails = await Promise.all(
      clients.map(async (client) => {
        const clientDocs = await db.select({ count: count() }).from(documents).where(eq(documents.clientId, client.id));
        const clientCases = await db.select({ count: count() }).from(taxCases).where(eq(taxCases.clientId, client.id));
        return {
          ...client,
          documentsCount: clientDocs[0]?.count || 0,
          casesCount: clientCases[0]?.count || 0,
        };
      })
    );
    return clientsWithDetails;
  }

  async getAuthIdentityByProvider(provider: string, providerUserId: string): Promise<AuthIdentity | undefined> {
    const [identity] = await db
      .select()
      .from(authIdentities)
      .where(and(eq(authIdentities.provider, provider as any), eq(authIdentities.providerUserId, providerUserId)));
    return identity || undefined;
  }

  async createAuthIdentity(identity: InsertAuthIdentity): Promise<AuthIdentity> {
    const [newIdentity] = await db
      .insert(authIdentities)
      .values(identity)
      .returning();
    return newIdentity;
  }

  async getTaxCasesByClient(clientId: number): Promise<TaxCase[]> {
    return db.select().from(taxCases).where(eq(taxCases.clientId, clientId)).orderBy(desc(taxCases.createdAt));
  }

  async getTaxCase(id: number): Promise<TaxCase | undefined> {
    const [taxCase] = await db.select().from(taxCases).where(eq(taxCases.id, id));
    return taxCase || undefined;
  }

  async getAllTaxCases(): Promise<(TaxCase & { client?: User })[]> {
    const cases = await db.select().from(taxCases).orderBy(desc(taxCases.createdAt));
    const casesWithClients = await Promise.all(
      cases.map(async (taxCase) => {
        const client = await this.getUser(taxCase.clientId);
        return { ...taxCase, client };
      })
    );
    return casesWithClients;
  }

  async createTaxCase(taxCase: InsertTaxCase): Promise<TaxCase> {
    const [newCase] = await db
      .insert(taxCases)
      .values(taxCase)
      .returning();
    return newCase;
  }

  async updateTaxCase(id: number, data: Partial<InsertTaxCase>): Promise<TaxCase | undefined> {
    const [updatedCase] = await db
      .update(taxCases)
      .set({ ...data, updatedAt: new Date() })
      .where(eq(taxCases.id, id))
      .returning();
    return updatedCase || undefined;
  }

  async getDocumentsByCase(caseId: number): Promise<Document[]> {
    return db.select().from(documents).where(eq(documents.caseId, caseId)).orderBy(desc(documents.createdAt));
  }

  async getDocumentsByClient(clientId: number): Promise<Document[]> {
    return db.select().from(documents).where(eq(documents.clientId, clientId)).orderBy(desc(documents.createdAt));
  }

  async getDocumentsByClientDirect(clientId: number): Promise<Document[]> {
    return db.select().from(documents).where(eq(documents.clientId, clientId)).orderBy(desc(documents.createdAt));
  }

  async getAllDocuments(): Promise<Document[]> {
    return db.select().from(documents).orderBy(desc(documents.createdAt));
  }

  async getDocument(id: number): Promise<Document | undefined> {
    const [doc] = await db.select().from(documents).where(eq(documents.id, id));
    return doc || undefined;
  }

  async createDocument(document: InsertDocument): Promise<Document> {
    const [newDoc] = await db
      .insert(documents)
      .values(document)
      .returning();
    return newDoc;
  }

  async getAppointmentsByClient(clientId: number): Promise<Appointment[]> {
    return db.select().from(appointments).where(eq(appointments.clientId, clientId)).orderBy(desc(appointments.appointmentDate));
  }

  async getAllAppointments(): Promise<Appointment[]> {
    return db.select().from(appointments).orderBy(desc(appointments.appointmentDate));
  }

  async checkAppointmentConflict(appointmentDate: Date): Promise<boolean> {
    const windowStart = new Date(appointmentDate.getTime() - 30 * 60 * 1000);
    const windowEnd = new Date(appointmentDate.getTime() + 30 * 60 * 1000);
    
    const conflicting = await db
      .select({ count: count() })
      .from(appointments)
      .where(
        and(
          sql`${appointments.appointmentDate} >= ${windowStart}`,
          sql`${appointments.appointmentDate} <= ${windowEnd}`,
          sql`${appointments.status} != 'cancelled'`
        )
      );
    
    return (conflicting[0]?.count || 0) > 0;
  }

  async createAppointment(appointment: InsertAppointment): Promise<Appointment> {
    const [newAppointment] = await db
      .insert(appointments)
      .values(appointment)
      .returning();
    return newAppointment;
  }

  async updateAppointment(id: number, data: Partial<InsertAppointment>): Promise<Appointment | undefined> {
    const [updated] = await db
      .update(appointments)
      .set(data)
      .where(eq(appointments.id, id))
      .returning();
    return updated || undefined;
  }

  async getMessagesByCase(caseId: number): Promise<Message[]> {
    return db.select().from(messages).where(eq(messages.caseId, caseId)).orderBy(messages.createdAt);
  }

  async getConversation(userId1: number, userId2: number): Promise<Message[]> {
    return db.select().from(messages).where(
      sql`(${messages.senderId} = ${userId1} AND ${messages.recipientId} = ${userId2}) OR (${messages.senderId} = ${userId2} AND ${messages.recipientId} = ${userId1})`
    ).orderBy(messages.createdAt);
  }

  async getConversationsForUser(userId: number): Promise<{ partnerId: number; partnerName: string; partnerRole: string; lastMessage: Message; unreadCount: number }[]> {
    const allMessages = await db.select().from(messages).where(
      sql`${messages.senderId} = ${userId} OR ${messages.recipientId} = ${userId}`
    ).orderBy(desc(messages.createdAt));

    const conversationMap = new Map<number, { partnerId: number; messages: Message[] }>();
    
    for (const msg of allMessages) {
      const partnerId = msg.senderId === userId ? msg.recipientId : msg.senderId;
      if (!conversationMap.has(partnerId)) {
        conversationMap.set(partnerId, { partnerId, messages: [] });
      }
      conversationMap.get(partnerId)!.messages.push(msg);
    }

    const conversations = [];
    for (const [partnerId, data] of conversationMap) {
      const partner = await this.getUser(partnerId);
      if (partner) {
        const unreadCount = data.messages.filter(m => m.recipientId === userId && !m.isRead).length;
        conversations.push({
          partnerId,
          partnerName: partner.name,
          partnerRole: partner.role,
          lastMessage: data.messages[0],
          unreadCount,
        });
      }
    }

    return conversations.sort((a, b) => 
      new Date(b.lastMessage.createdAt).getTime() - new Date(a.lastMessage.createdAt).getTime()
    );
  }

  async createMessage(message: InsertMessage): Promise<Message> {
    const [newMessage] = await db
      .insert(messages)
      .values(message)
      .returning();
    return newMessage;
  }

  async markMessagesAsRead(recipientId: number, senderId: number): Promise<void> {
    await db.update(messages)
      .set({ isRead: true })
      .where(
        and(
          eq(messages.recipientId, recipientId),
          eq(messages.senderId, senderId),
          eq(messages.isRead, false)
        )
      );
  }

  async getUnreadCount(userId: number): Promise<number> {
    const [result] = await db.select({ count: count() })
      .from(messages)
      .where(
        and(
          eq(messages.recipientId, userId),
          eq(messages.isRead, false)
        )
      );
    return result?.count || 0;
  }

  async createContactSubmission(contact: InsertContactSubmission): Promise<ContactSubmission> {
    const [newContact] = await db
      .insert(contactSubmissions)
      .values(contact)
      .returning();
    return newContact;
  }

  async getAllContactSubmissions(): Promise<ContactSubmission[]> {
    return db.select().from(contactSubmissions).orderBy(desc(contactSubmissions.createdAt));
  }

  async createActivityLog(log: InsertActivityLog): Promise<ActivityLog> {
    const [newLog] = await db
      .insert(activityLogs)
      .values(log)
      .returning();
    return newLog;
  }

  async getAdminStats(): Promise<{
    totalClients: number;
    pendingCases: number;
    completedCases: number;
    totalRefunds: number;
  }> {
    const [clientCount] = await db
      .select({ count: count() })
      .from(users)
      .where(eq(users.role, "client"));

    const [pendingCount] = await db
      .select({ count: count() })
      .from(taxCases)
      .where(eq(taxCases.status, "pending"));

    const completedStatuses = ["approved", "refund_issued"];
    const completedCases = await db
      .select({ count: count() })
      .from(taxCases)
      .where(sql`${taxCases.status} IN ('approved', 'refund_issued')`);

    const [refundsSum] = await db
      .select({ total: sum(taxCases.finalAmount) })
      .from(taxCases)
      .where(sql`${taxCases.finalAmount} IS NOT NULL`);

    return {
      totalClients: clientCount?.count || 0,
      pendingCases: pendingCount?.count || 0,
      completedCases: completedCases[0]?.count || 0,
      totalRefunds: parseFloat(refundsSum?.total || "0"),
    };
  }

  async getAnalyticsData(): Promise<{
    casesByMonth: { month: string; count: number; amount: number }[];
    casesByStatus: { status: string; count: number }[];
    casesByYear: { year: number; count: number; amount: number }[];
    recentActivity: { date: string; action: string; details: string }[];
  }> {
    const allCases = await db.select().from(taxCases).orderBy(desc(taxCases.createdAt));
    
    const casesByMonth = new Map<string, { count: number; amount: number }>();
    const months = ['Ene', 'Feb', 'Mar', 'Abr', 'May', 'Jun', 'Jul', 'Ago', 'Sep', 'Oct', 'Nov', 'Dic'];
    
    for (let i = 0; i < 12; i++) {
      const date = new Date();
      date.setMonth(date.getMonth() - i);
      const key = `${months[date.getMonth()]} ${date.getFullYear()}`;
      casesByMonth.set(key, { count: 0, amount: 0 });
    }
    
    for (const c of allCases) {
      const date = new Date(c.createdAt);
      const key = `${months[date.getMonth()]} ${date.getFullYear()}`;
      if (casesByMonth.has(key)) {
        const current = casesByMonth.get(key)!;
        current.count++;
        current.amount += parseFloat(c.finalAmount || "0");
      }
    }

    const casesByMonthArr = Array.from(casesByMonth.entries())
      .map(([month, data]) => ({ month, ...data }))
      .reverse();

    const statusCounts = await db.select({ 
      status: taxCases.status, 
      count: count() 
    })
      .from(taxCases)
      .groupBy(taxCases.status);

    const casesByStatus = statusCounts.map(s => ({
      status: s.status,
      count: Number(s.count)
    }));

    const casesByYearMap = new Map<number, { count: number; amount: number }>();
    for (const c of allCases) {
      const year = c.filingYear;
      if (!casesByYearMap.has(year)) {
        casesByYearMap.set(year, { count: 0, amount: 0 });
      }
      const current = casesByYearMap.get(year)!;
      current.count++;
      current.amount += parseFloat(c.finalAmount || "0");
    }

    const casesByYear = Array.from(casesByYearMap.entries())
      .map(([year, data]) => ({ year, ...data }))
      .sort((a, b) => b.year - a.year);

    const recentLogs = await db.select().from(activityLogs).orderBy(desc(activityLogs.createdAt)).limit(10);
    const recentActivity = recentLogs.map(log => ({
      date: log.createdAt.toISOString(),
      action: log.action,
      details: log.details || ''
    }));

    return {
      casesByMonth: casesByMonthArr,
      casesByStatus,
      casesByYear,
      recentActivity,
    };
  }
}

export const storage = new DatabaseStorage();
