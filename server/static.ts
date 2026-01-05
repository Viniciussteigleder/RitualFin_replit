import express, { type Express } from "express";
import fs from "fs";
import path from "path";

export function serveStatic(app: Express) {
  const distPath = path.resolve(__dirname, "public");
  if (!fs.existsSync(distPath)) {
    throw new Error(
      `Could not find the build directory: ${distPath}, make sure to build the client first`,
    );
  }

  app.use(express.static(distPath));

  // SPA fallback: serve index.html for all non-API routes
  // CRITICAL: Must NOT catch /api/* routes - they should return 404 if not found
  app.use("*", (req, res, next) => {
    // Skip /api routes - let them fall through to 404
    if (req.originalUrl.startsWith("/api")) {
      return next();
    }
    res.sendFile(path.resolve(distPath, "index.html"));
  });
}
