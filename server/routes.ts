import type { Express, Request, Response, NextFunction } from "express";
import { createServer, type Server } from "http";
import { storage } from "./storage";
import { insertContactSubmissionSchema, insertAppointmentSchema, insertTaxCaseSchema } from "@shared/schema";
import bcrypt from "bcrypt";
import jwt from "jsonwebtoken";
import multer from "multer";
import path from "path";
import fs from "fs";
import { z } from "zod";
import { setupAuth } from "./replitAuth";

const registerSchema = z.object({
  email: z.string().email("Invalid email address"),
  password: z.string()
    .min(8, "Password must be at least 8 characters")
    .regex(/[A-Z]/, "Password must contain at least one uppercase letter")
    .regex(/[a-z]/, "Password must contain at least one lowercase letter")
    .regex(/[0-9]/, "Password must contain at least one number"),
  name: z.string().min(2, "Name must be at least 2 characters"),
  phone: z.string().optional(),
});

const loginSchema = z.object({
  email: z.string().email("Invalid email address"),
  password: z.string().min(1, "Password is required"),
});

const appointmentSchema = z.object({
  appointmentDate: z.string().datetime({ message: "Invalid date format" }),
  notes: z.string().optional(),
});

const JWT_SECRET = process.env.SESSION_SECRET;

if (!JWT_SECRET) {
  throw new Error("SESSION_SECRET must be set in environment variables");
}

const uploadDir = path.join(process.cwd(), "uploads");
if (!fs.existsSync(uploadDir)) {
  fs.mkdirSync(uploadDir, { recursive: true });
}

const multerStorage = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, uploadDir);
  },
  filename: (req, file, cb) => {
    const uniqueSuffix = Date.now() + "-" + Math.round(Math.random() * 1e9);
    cb(null, uniqueSuffix + "-" + file.originalname);
  },
});

const upload = multer({
  storage: multerStorage,
  limits: { fileSize: 10 * 1024 * 1024 },
  fileFilter: (req, file, cb) => {
    const allowedTypes = [
      "application/pdf",
      "image/jpeg",
      "image/png",
      "image/jpg",
      "application/msword",
      "application/vnd.openxmlformats-officedocument.wordprocessingml.document",
    ];
    if (allowedTypes.includes(file.mimetype)) {
      cb(null, true);
    } else {
      cb(new Error("Invalid file type"));
    }
  },
});

interface AuthRequest extends Request {
  user?: {
    id: number;
    email: string;
    role: string;
    name: string;
  };
}

function authenticateToken(req: AuthRequest, res: Response, next: NextFunction) {
  const token = req.cookies?.token || req.headers.authorization?.split(" ")[1];

  if (!token) {
    return res.status(401).json({ message: "Authentication required" });
  }

  try {
    const decoded = jwt.verify(token, JWT_SECRET) as {
      id: number;
      email: string;
      role: string;
      name: string;
    };
    req.user = decoded;
    next();
  } catch (error) {
    return res.status(403).json({ message: "Invalid token" });
  }
}

function requireAdmin(req: AuthRequest, res: Response, next: NextFunction) {
  if (req.user?.role !== "admin" && req.user?.role !== "preparer") {
    return res.status(403).json({ message: "Admin access required" });
  }
  next();
}

export async function registerRoutes(
  httpServer: Server,
  app: Express
): Promise<Server> {
  
  await setupAuth(app);

  app.post("/api/auth/register", async (req: Request, res: Response) => {
    try {
      const result = registerSchema.safeParse(req.body);
      if (!result.success) {
        return res.status(400).json({ 
          message: "Validation failed", 
          errors: result.error.errors.map(e => e.message)
        });
      }

      const { email, password, name, phone } = result.data;

      const existingUser = await storage.getUserByEmail(email);
      if (existingUser) {
        return res.status(400).json({ message: "Email already registered" });
      }

      const hashedPassword = await bcrypt.hash(password, 12);

      const user = await storage.createUser({
        email,
        password: hashedPassword,
        name,
        phone: phone || null,
        role: "client",
      });

      await storage.createActivityLog({
        userId: user.id,
        action: "user_registered",
        details: `New user registered: ${email}`,
      });

      const token = jwt.sign(
        { id: user.id, email: user.email, role: user.role, name: user.name },
        JWT_SECRET,
        { expiresIn: "7d" }
      );

      res.cookie("token", token, {
        httpOnly: true,
        secure: process.env.NODE_ENV === "production",
        sameSite: "strict",
        maxAge: 7 * 24 * 60 * 60 * 1000,
        path: "/",
      });

      res.json({
        user: { id: user.id, email: user.email, role: user.role, name: user.name },
      });
    } catch (error) {
      console.error("Registration error:", error);
      res.status(500).json({ message: "Registration failed" });
    }
  });

  app.post("/api/auth/login", async (req: Request, res: Response) => {
    try {
      const result = loginSchema.safeParse(req.body);
      if (!result.success) {
        return res.status(400).json({ 
          message: "Validation failed", 
          errors: result.error.errors.map(e => e.message)
        });
      }

      const { email, password } = result.data;

      const user = await storage.getUserByEmail(email);
      if (!user) {
        return res.status(401).json({ message: "Invalid credentials" });
      }

      const validPassword = await bcrypt.compare(password, user.password);
      if (!validPassword) {
        return res.status(401).json({ message: "Invalid credentials" });
      }

      await storage.createActivityLog({
        userId: user.id,
        action: "user_login",
        details: `User logged in: ${email}`,
      });

      const token = jwt.sign(
        { id: user.id, email: user.email, role: user.role, name: user.name },
        JWT_SECRET,
        { expiresIn: "7d" }
      );

      res.cookie("token", token, {
        httpOnly: true,
        secure: process.env.NODE_ENV === "production",
        sameSite: "strict",
        maxAge: 7 * 24 * 60 * 60 * 1000,
        path: "/",
      });

      res.json({
        user: { id: user.id, email: user.email, role: user.role, name: user.name },
      });
    } catch (error) {
      console.error("Login error:", error);
      res.status(500).json({ message: "Login failed" });
    }
  });

  app.get("/api/auth/me", authenticateToken, async (req: AuthRequest, res: Response) => {
    res.json({ user: req.user });
  });

  app.post("/api/auth/logout", (req: Request, res: Response) => {
    res.clearCookie("token");
    res.json({ message: "Logged out successfully" });
  });

  app.post("/api/contact", async (req: Request, res: Response) => {
    try {
      const result = insertContactSubmissionSchema.safeParse(req.body);
      if (!result.success) {
        return res.status(400).json({ message: "Invalid data", errors: result.error.errors });
      }

      const contact = await storage.createContactSubmission(result.data);
      res.json({ success: true, contact });
    } catch (error) {
      console.error("Contact submission error:", error);
      res.status(500).json({ message: "Failed to submit contact form" });
    }
  });

  app.get("/api/cases", authenticateToken, async (req: AuthRequest, res: Response) => {
    try {
      const cases = await storage.getTaxCasesByClient(req.user!.id);
      res.json(cases);
    } catch (error) {
      console.error("Get cases error:", error);
      res.status(500).json({ message: "Failed to get cases" });
    }
  });

  app.get("/api/documents", authenticateToken, async (req: AuthRequest, res: Response) => {
    try {
      const documents = await storage.getDocumentsByClient(req.user!.id);
      res.json(documents);
    } catch (error) {
      console.error("Get documents error:", error);
      res.status(500).json({ message: "Failed to get documents" });
    }
  });

  app.post("/api/documents/upload", authenticateToken, upload.single("file"), async (req: AuthRequest, res: Response) => {
    try {
      if (!req.file) {
        return res.status(400).json({ message: "No file uploaded" });
      }

      const { caseId, category, description } = req.body;
      let validCaseId: number | null = null;

      if (caseId) {
        validCaseId = parseInt(caseId);
        if (!isNaN(validCaseId)) {
          const taxCase = await storage.getTaxCase(validCaseId);
          if (!taxCase || taxCase.clientId !== req.user!.id) {
            return res.status(403).json({ message: "Access denied" });
          }
        }
      }

      const validCategories = ["id_document", "w2", "form_1099", "bank_statement", "receipt", "previous_return", "social_security", "proof_of_address", "other"];
      const docCategory = validCategories.includes(category) ? category : "other";

      const document = await storage.createDocument({
        caseId: validCaseId,
        clientId: req.user!.id,
        fileName: req.file.originalname,
        filePath: req.file.path,
        fileType: req.file.mimetype,
        fileSize: req.file.size,
        category: docCategory,
        description: description || null,
        uploadedById: req.user!.id,
        isFromPreparer: false,
      });

      await storage.createActivityLog({
        userId: req.user!.id,
        action: "document_uploaded",
        details: `Document uploaded: ${req.file.originalname} (${docCategory})`,
      });

      res.json(document);
    } catch (error) {
      console.error("Upload error:", error);
      res.status(500).json({ message: "Failed to upload document" });
    }
  });

  app.get("/api/documents/:id/download", authenticateToken, async (req: AuthRequest, res: Response) => {
    try {
      const documentId = parseInt(req.params.id);
      const document = await storage.getDocument(documentId);

      if (!document) {
        return res.status(404).json({ message: "Document not found" });
      }

      const isAdmin = req.user!.role === "admin" || req.user!.role === "preparer";
      const isOwner = document.clientId === req.user!.id;

      if (!isAdmin && !isOwner) {
        return res.status(403).json({ message: "Access denied" });
      }

      if (!fs.existsSync(document.filePath)) {
        return res.status(404).json({ message: "File not found" });
      }

      res.download(document.filePath, document.fileName);
    } catch (error) {
      console.error("Download error:", error);
      res.status(500).json({ message: "Failed to download document" });
    }
  });

  app.get("/api/appointments", authenticateToken, async (req: AuthRequest, res: Response) => {
    try {
      const appointments = await storage.getAppointmentsByClient(req.user!.id);
      res.json(appointments);
    } catch (error) {
      console.error("Get appointments error:", error);
      res.status(500).json({ message: "Failed to get appointments" });
    }
  });

  app.post("/api/appointments", authenticateToken, async (req: AuthRequest, res: Response) => {
    try {
      const { appointmentDate, notes } = req.body;

      if (!appointmentDate) {
        return res.status(400).json({ message: "Appointment date is required" });
      }

      const appointment = await storage.createAppointment({
        clientId: req.user!.id,
        appointmentDate: new Date(appointmentDate),
        notes: notes || null,
        status: "scheduled",
      });

      await storage.createActivityLog({
        userId: req.user!.id,
        action: "appointment_scheduled",
        details: `Appointment scheduled for ${appointmentDate}`,
      });

      res.json(appointment);
    } catch (error) {
      console.error("Create appointment error:", error);
      res.status(500).json({ message: "Failed to create appointment" });
    }
  });

  app.get("/api/admin/stats", authenticateToken, requireAdmin, async (req: AuthRequest, res: Response) => {
    try {
      const stats = await storage.getAdminStats();
      res.json(stats);
    } catch (error) {
      console.error("Get stats error:", error);
      res.status(500).json({ message: "Failed to get stats" });
    }
  });

  app.get("/api/admin/clients", authenticateToken, requireAdmin, async (req: AuthRequest, res: Response) => {
    try {
      const clients = await storage.getClientsWithDetails();
      res.json(clients);
    } catch (error) {
      console.error("Get clients error:", error);
      res.status(500).json({ message: "Failed to get clients" });
    }
  });

  app.get("/api/admin/clients/:id", authenticateToken, requireAdmin, async (req: AuthRequest, res: Response) => {
    try {
      const clientId = parseInt(req.params.id);
      const client = await storage.getUser(clientId);
      if (!client) {
        return res.status(404).json({ message: "Client not found" });
      }
      const documents = await storage.getDocumentsByClient(clientId);
      const cases = await storage.getTaxCasesByClient(clientId);
      const appointments = await storage.getAppointmentsByClient(clientId);
      res.json({ client, documents, cases, appointments });
    } catch (error) {
      console.error("Get client details error:", error);
      res.status(500).json({ message: "Failed to get client details" });
    }
  });

  app.get("/api/admin/documents", authenticateToken, requireAdmin, async (req: AuthRequest, res: Response) => {
    try {
      const documents = await storage.getAllDocuments();
      res.json(documents);
    } catch (error) {
      console.error("Get documents error:", error);
      res.status(500).json({ message: "Failed to get documents" });
    }
  });

  app.get("/api/admin/cases", authenticateToken, requireAdmin, async (req: AuthRequest, res: Response) => {
    try {
      const cases = await storage.getAllTaxCases();
      res.json(cases);
    } catch (error) {
      console.error("Get cases error:", error);
      res.status(500).json({ message: "Failed to get cases" });
    }
  });

  app.post("/api/admin/cases", authenticateToken, requireAdmin, async (req: AuthRequest, res: Response) => {
    try {
      const { clientId, filingYear, filingStatus, dependents } = req.body;

      if (!clientId || !filingYear) {
        return res.status(400).json({ message: "Client ID and filing year are required" });
      }

      const taxCase = await storage.createTaxCase({
        clientId: parseInt(clientId),
        filingYear,
        filingStatus: filingStatus || null,
        dependents: dependents || 0,
        status: "pending",
      });

      await storage.createActivityLog({
        userId: req.user!.id,
        action: "case_created",
        details: `Case created for client ${clientId}, year ${filingYear}`,
      });

      res.json(taxCase);
    } catch (error) {
      console.error("Create case error:", error);
      res.status(500).json({ message: "Failed to create case" });
    }
  });

  app.patch("/api/admin/cases/:id", authenticateToken, requireAdmin, async (req: AuthRequest, res: Response) => {
    try {
      const caseId = parseInt(req.params.id);
      const { status, notes, finalAmount } = req.body;

      const updatedCase = await storage.updateTaxCase(caseId, {
        status,
        notes,
        finalAmount: finalAmount || null,
      });

      if (!updatedCase) {
        return res.status(404).json({ message: "Case not found" });
      }

      await storage.createActivityLog({
        userId: req.user!.id,
        action: "case_updated",
        details: `Case ${caseId} updated: status=${status}`,
      });

      res.json(updatedCase);
    } catch (error) {
      console.error("Update case error:", error);
      res.status(500).json({ message: "Failed to update case" });
    }
  });

  app.get("/api/admin/appointments", authenticateToken, requireAdmin, async (req: AuthRequest, res: Response) => {
    try {
      const appointments = await storage.getAllAppointments();
      res.json(appointments);
    } catch (error) {
      console.error("Get appointments error:", error);
      res.status(500).json({ message: "Failed to get appointments" });
    }
  });

  app.get("/api/admin/contacts", authenticateToken, requireAdmin, async (req: AuthRequest, res: Response) => {
    try {
      const contacts = await storage.getAllContactSubmissions();
      res.json(contacts);
    } catch (error) {
      console.error("Get contacts error:", error);
      res.status(500).json({ message: "Failed to get contacts" });
    }
  });

  return httpServer;
}
