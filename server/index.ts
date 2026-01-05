// Force Node.js to prefer IPv4 for DNS resolution
// This fixes ENETUNREACH errors on Render when Supabase returns IPv6 addresses
import dns from "node:dns";
dns.setDefaultResultOrder("ipv4first");

import express, { type Request, Response, NextFunction } from "express";
import cors from "cors";
import session from "express-session";
import connectPgSimple from "connect-pg-simple";
import { registerRoutes } from "./routes";
import { serveStatic } from "./static";
import { createServer } from "http";
import { pool, isDatabaseConfigured } from "./db";

const app = express();
const httpServer = createServer(app);

// Configure CORS for split deployment (Vercel frontend + separate backend)
const corsOrigins = process.env.CORS_ORIGIN
  ? process.env.CORS_ORIGIN.split(",").map(origin => origin.trim())
  : ["http://localhost:5000", "http://localhost:5173"]; // Default: local development

app.use(
  cors({
    origin: corsOrigins,
    credentials: true, // Allow cookies for authentication
    methods: ["GET", "POST", "PUT", "PATCH", "DELETE", "OPTIONS"],
    allowedHeaders: ["Content-Type", "Authorization"],
  })
);

// Session configuration with PostgreSQL store (production) or MemoryStore (development)
const PgSession = connectPgSimple(session);
const sessionStore = isDatabaseConfigured && pool
  ? new PgSession({
      pool: pool,
      tableName: "session", // Will be auto-created if it doesn't exist
      createTableIfMissing: true
    })
  : undefined; // Falls back to MemoryStore in development

app.use(
  session({
    store: sessionStore,
    secret: process.env.SESSION_SECRET || "dev-secret-change-in-production",
    resave: false,
    saveUninitialized: false,
    cookie: {
      secure: process.env.NODE_ENV === "production",
      httpOnly: true,
      maxAge: 1000 * 60 * 60 * 24 * 7, // 7 days
      sameSite: process.env.NODE_ENV === "production" ? "none" : "lax",
    },
  })
);

declare module "express-session" {
  interface SessionData {
    userId?: string;
  }
}

declare module "http" {
  interface IncomingMessage {
    rawBody: unknown;
  }
}

app.use(
  express.json({
    limit: "10mb", // Increased limit for large CSV uploads
    verify: (req, _res, buf) => {
      req.rawBody = buf;
    },
  }),
);

app.use(express.urlencoded({ extended: false, limit: "10mb" }));

export function log(message: string, source = "express") {
  const formattedTime = new Date().toLocaleTimeString("en-US", {
    hour: "numeric",
    minute: "2-digit",
    second: "2-digit",
    hour12: true,
  });

  console.log(`${formattedTime} [${source}] ${message}`);
}

app.use((req, res, next) => {
  const start = Date.now();
  const path = req.path;
  let capturedJsonResponse: Record<string, any> | undefined = undefined;

  const originalResJson = res.json;
  res.json = function (bodyJson, ...args) {
    capturedJsonResponse = bodyJson;
    return originalResJson.apply(res, [bodyJson, ...args]);
  };

  res.on("finish", () => {
    const duration = Date.now() - start;
    if (path.startsWith("/api")) {
      let logLine = `${req.method} ${path} ${res.statusCode} in ${duration}ms`;
      if (capturedJsonResponse) {
        logLine += ` :: ${JSON.stringify(capturedJsonResponse)}`;
      }

      log(logLine);
    }
  });

  next();
});

(async () => {
  await registerRoutes(httpServer, app);

  // Enhanced error middleware with error codes and safe messages
  app.use((err: any, _req: Request, res: Response, _next: NextFunction) => {
    const status = err.status || err.statusCode || 500;
    let message = err.message || "Internal Server Error";

    // Strip sensitive data from message (DATABASE_URL, passwords, etc.)
    if (message && typeof message === "string") {
      // Remove DATABASE_URL connection strings
      message = message.replace(/postgresql:\/\/[^@]+@[^\s]+/g, "postgresql://***:***@***/***");
      // Remove any potential passwords
      message = message.replace(/password[=:][^\s&]+/gi, "password=***");
    }

    // Safe error response with error codes
    const errorResponse: any = {
      error: message,
      code: err.code || err.name || "UNKNOWN_ERROR",
      timestamp: new Date().toISOString()
    };

    // Include stack trace in development only
    if (process.env.NODE_ENV === "development" && err.stack) {
      errorResponse.stack = err.stack;
    }

    // Include additional context if available
    if (err.details) {
      errorResponse.details = err.details;
    }

    res.status(status).json(errorResponse);

    // Log error for debugging (without throwing)
    console.error(`[ERROR] ${status} ${errorResponse.code}: ${message}`);
  });

  // importantly only setup vite in development and after
  // setting up all the other routes so the catch-all route
  // doesn't interfere with the other routes
  if (process.env.NODE_ENV === "production") {
    serveStatic(app);
  } else {
    const { setupVite } = await import("./vite");
    await setupVite(httpServer, app);
  }

  // ALWAYS serve the app on the port specified in the environment variable PORT
  // Other ports are firewalled. Default to 5000 if not specified.
  // this serves both the API and the client.
  // It is the only port that is not firewalled.
  const port = parseInt(process.env.PORT || "5000", 10);
  const host = process.env.HOST || "0.0.0.0";
  httpServer.listen(
    {
      port,
      host,
      ...(process.env.REUSE_PORT === "true" ? { reusePort: true } : {}),
    },
    () => {
      log(`serving on port ${port}`);

      // Startup sanity check logging (no secrets)
      console.log("=== RitualFin Startup Sanity Check ===");
      console.log(`Node Version: ${process.version}`);
      console.log(`Environment: ${process.env.NODE_ENV || "development"}`);
      console.log(`DNS Resolution Order: ipv4first (forced)`);
      console.log(`DATABASE_URL configured: ${!!process.env.DATABASE_URL}`);
      console.log(`ADMIN_API_KEY configured: ${!!process.env.ADMIN_API_KEY}`);
      console.log(`Session Store: ${sessionStore ? "PostgreSQL" : "MemoryStore (dev only)"}`);
      console.log(`CORS Origins: ${corsOrigins.join(", ")}`);
      console.log("=====================================");
    },
  );
})();
