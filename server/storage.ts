import { 
  users, 
  taxCases, 
  documents, 
  appointments, 
  messages, 
  contactSubmissions,
  activityLogs,
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
} from "@shared/schema";
import { db } from "./db";
import { eq, desc, and, sql, count, sum } from "drizzle-orm";

export interface IStorage {
  getUser(id: number): Promise<User | undefined>;
  getUserByEmail(email: string): Promise<User | undefined>;
  createUser(user: InsertUser): Promise<User>;
  getAllClients(): Promise<User[]>;
  
  getTaxCasesByClient(clientId: number): Promise<TaxCase[]>;
  getTaxCase(id: number): Promise<TaxCase | undefined>;
  getAllTaxCases(): Promise<(TaxCase & { client?: User })[]>;
  createTaxCase(taxCase: InsertTaxCase): Promise<TaxCase>;
  updateTaxCase(id: number, data: Partial<InsertTaxCase>): Promise<TaxCase | undefined>;
  
  getDocumentsByCase(caseId: number): Promise<Document[]>;
  getDocumentsByClient(clientId: number): Promise<Document[]>;
  getDocument(id: number): Promise<Document | undefined>;
  createDocument(document: InsertDocument): Promise<Document>;
  
  getAppointmentsByClient(clientId: number): Promise<Appointment[]>;
  getAllAppointments(): Promise<Appointment[]>;
  createAppointment(appointment: InsertAppointment): Promise<Appointment>;
  updateAppointment(id: number, data: Partial<InsertAppointment>): Promise<Appointment | undefined>;
  
  getMessagesByCase(caseId: number): Promise<Message[]>;
  createMessage(message: InsertMessage): Promise<Message>;
  
  createContactSubmission(contact: InsertContactSubmission): Promise<ContactSubmission>;
  getAllContactSubmissions(): Promise<ContactSubmission[]>;
  
  createActivityLog(log: InsertActivityLog): Promise<ActivityLog>;
  
  getAdminStats(): Promise<{
    totalClients: number;
    pendingCases: number;
    completedCases: number;
    totalRefunds: number;
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

  async getAllClients(): Promise<User[]> {
    return db.select().from(users).where(eq(users.role, "client")).orderBy(desc(users.createdAt));
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
    const clientCases = await this.getTaxCasesByClient(clientId);
    const caseIds = clientCases.map(c => c.id);
    
    if (caseIds.length === 0) return [];
    
    const allDocs: Document[] = [];
    for (const caseId of caseIds) {
      const docs = await db.select().from(documents).where(eq(documents.caseId, caseId));
      allDocs.push(...docs);
    }
    return allDocs.sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());
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

  async createMessage(message: InsertMessage): Promise<Message> {
    const [newMessage] = await db
      .insert(messages)
      .values(message)
      .returning();
    return newMessage;
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
}

export const storage = new DatabaseStorage();
