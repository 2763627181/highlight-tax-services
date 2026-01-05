// Cargar variables de entorno desde .env
import { config } from "dotenv";
config();

import * as client from "openid-client";
import { Strategy, type VerifyFunction } from "openid-client/passport";
import passport from "passport";
import session from "express-session";
import type { Express, RequestHandler } from "express";
import memoize from "memoizee";
import connectPg from "connect-pg-simple";
import { storage } from "./storage";
import jwt from "jsonwebtoken";

const JWT_SECRET = process.env.SESSION_SECRET;

if (!JWT_SECRET) {
  throw new Error("SESSION_SECRET must be set in environment variables");
}

// Verificar si Replit OAuth está configurado
const isReplitAuthConfigured = !!(process.env.REPL_ID && process.env.REPL_ID.trim() !== '');

const getOidcConfig = memoize(
  async () => {
    if (!isReplitAuthConfigured) {
      throw new Error("Replit OAuth is not configured. REPL_ID must be set in environment variables.");
    }
    return await client.discovery(
      new URL(process.env.ISSUER_URL ?? "https://replit.com/oidc"),
      process.env.REPL_ID!
    );
  },
  { maxAge: 3600 * 1000 }
);

export function getSession() {
  const sessionTtl = 7 * 24 * 60 * 60 * 1000;
  const pgStore = connectPg(session);
  const sessionStore = new pgStore({
    conString: process.env.DATABASE_URL,
    createTableIfMissing: false,
    ttl: sessionTtl,
    tableName: "sessions",
  });
  return session({
    secret: process.env.SESSION_SECRET!,
    store: sessionStore,
    resave: false,
    saveUninitialized: false,
    cookie: {
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
      maxAge: sessionTtl,
    },
  });
}

function updateUserSession(
  user: any,
  tokens: client.TokenEndpointResponse & client.TokenEndpointResponseHelpers
) {
  user.claims = tokens.claims();
  user.access_token = tokens.access_token;
  user.refresh_token = tokens.refresh_token;
  user.expires_at = user.claims?.exp;
}

export function issueAuthToken(res: any, user: { id: number; email: string; role: string; name: string }) {
  const token = jwt.sign(
    { id: user.id, email: user.email, role: user.role, name: user.name },
    JWT_SECRET!,
    { expiresIn: "7d" }
  );

  res.cookie("token", token, {
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
    sameSite: "strict",
    maxAge: 7 * 24 * 60 * 60 * 1000,
    path: "/",
  });

  return token;
}

async function upsertOAuthUser(claims: any): Promise<{ id: number; email: string; role: string; name: string }> {
  const providerUserId = claims["sub"];
  const email = claims["email"];
  const firstName = claims["first_name"] || "";
  const lastName = claims["last_name"] || "";
  const profileImageUrl = claims["profile_image_url"];

  const existingIdentity = await storage.getAuthIdentityByProvider("replit", providerUserId);
  
  if (existingIdentity) {
    const user = await storage.getUser(existingIdentity.userId);
    if (user) {
      return { id: user.id, email: user.email, role: user.role, name: user.name };
    }
  }

  if (email) {
    const existingUser = await storage.getUserByEmail(email);
    if (existingUser) {
      await storage.createAuthIdentity({
        userId: existingUser.id,
        provider: "replit",
        providerUserId,
        email,
        firstName,
        lastName,
        avatarUrl: profileImageUrl,
      });

      if (profileImageUrl && !existingUser.profileImageUrl) {
        await storage.updateUser(existingUser.id, { profileImageUrl });
      }

      return { id: existingUser.id, email: existingUser.email, role: existingUser.role, name: existingUser.name };
    }
  }

  const name = [firstName, lastName].filter(Boolean).join(" ") || email?.split("@")[0] || "User";
  const randomPassword = Math.random().toString(36).slice(-12) + "Aa1!";
  
  const bcrypt = await import("bcrypt");
  const hashedPassword = await bcrypt.hash(randomPassword, 12);

  const newUser = await storage.createUser({
    email: email || `oauth_${providerUserId}@placeholder.local`,
    password: hashedPassword,
    name,
    role: "client",
    profileImageUrl,
  });

  await storage.createAuthIdentity({
    userId: newUser.id,
    provider: "replit",
    providerUserId,
    email,
    firstName,
    lastName,
    avatarUrl: profileImageUrl,
  });

  return { id: newUser.id, email: newUser.email, role: newUser.role, name: newUser.name };
}

export async function setupAuth(app: Express) {
  app.set("trust proxy", 1);
  app.use(getSession());
  app.use(passport.initialize());
  app.use(passport.session());

  // Si Replit OAuth no está configurado, no configurar las rutas OAuth
  if (!isReplitAuthConfigured) {
    console.warn('[ReplitAuth] Replit OAuth is not configured. OAuth routes will not be available.');
    console.warn('[ReplitAuth] To enable OAuth, set REPL_ID in your environment variables.');
    return;
  }

  const config = await getOidcConfig();

  const verify: VerifyFunction = async (
    tokens: client.TokenEndpointResponse & client.TokenEndpointResponseHelpers,
    verified: passport.AuthenticateCallback
  ) => {
    try {
      const claims = tokens.claims();
      if (!claims) {
        throw new Error("No claims found in token");
      }
      const user = await upsertOAuthUser(claims);
      const sessionUser = { ...user, claims, expires_at: claims.exp };
      updateUserSession(sessionUser, tokens);
      verified(null, sessionUser);
    } catch (error) {
      verified(error as Error);
    }
  };

  const registeredStrategies = new Set<string>();

  const ensureStrategy = (domain: string) => {
    const strategyName = `replitauth:${domain}`;
    if (!registeredStrategies.has(strategyName)) {
      const strategy = new Strategy(
        {
          name: strategyName,
          config,
          scope: "openid email profile offline_access",
          callbackURL: `https://${domain}/api/auth/oidc/callback`,
        },
        verify,
      );
      passport.use(strategy);
      registeredStrategies.add(strategyName);
    }
  };

  passport.serializeUser((user: Express.User, cb) => cb(null, user));
  passport.deserializeUser((user: Express.User, cb) => cb(null, user));

  app.get("/api/auth/oidc/login", (req, res, next) => {
    ensureStrategy(req.hostname);
    passport.authenticate(`replitauth:${req.hostname}`, {
      prompt: "login consent",
      scope: ["openid", "email", "profile", "offline_access"],
    })(req, res, next);
  });

  app.get("/api/auth/oidc/callback", (req, res, next) => {
    ensureStrategy(req.hostname);
    passport.authenticate(`replitauth:${req.hostname}`, (err: any, user: any) => {
      if (err || !user) {
        return res.redirect("/portal?error=auth_failed");
      }

      issueAuthToken(res, user);
      
      if (user.role === "admin" || user.role === "preparer") {
        return res.redirect("/admin");
      }
      return res.redirect("/dashboard");
    })(req, res, next);
  });

  app.get("/api/auth/oidc/logout", async (req, res) => {
    res.clearCookie("token");
    
    try {
      const config = await getOidcConfig();
      req.logout(() => {
        res.redirect(
          client.buildEndSessionUrl(config, {
            client_id: process.env.REPL_ID!,
            post_logout_redirect_uri: `${req.protocol}://${req.hostname}`,
          }).href
        );
      });
    } catch {
      res.redirect("/");
    }
  });
}

export const isAuthenticated: RequestHandler = async (req, res, next) => {
  const user = req.user as any;

  if (!req.isAuthenticated() || !user?.expires_at) {
    return res.status(401).json({ message: "Unauthorized" });
  }

  const now = Math.floor(Date.now() / 1000);
  if (now <= user.expires_at) {
    return next();
  }

  const refreshToken = user.refresh_token;
  if (!refreshToken) {
    return res.status(401).json({ message: "Unauthorized" });
  }

  try {
    const config = await getOidcConfig();
    const tokenResponse = await client.refreshTokenGrant(config, refreshToken);
    updateUserSession(user, tokenResponse);
    return next();
  } catch {
    return res.status(401).json({ message: "Unauthorized" });
  }
};
