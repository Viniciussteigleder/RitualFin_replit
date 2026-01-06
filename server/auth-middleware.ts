/**
 * Authentication middleware for protecting API routes
 */

import type { Request, Response, NextFunction } from "express";
import { storage } from "./storage";
import { logger } from "./logger";

/**
 * Middleware to require authentication
 * Checks req.user (from Passport) or req.session.userId
 * Attaches user object to req.user for downstream handlers
 */
export async function requireAuth(req: Request, res: Response, next: NextFunction) {
  try {
    // Check if user is already authenticated via Passport (Google OAuth)
    if (req.user && typeof req.user === 'object' && 'id' in req.user) {
      return next();
    }

    // Check session for userId (traditional login)
    if (req.session?.userId) {
      const user = await storage.getUserById(req.session.userId);
      if (user) {
        req.user = user;
        return next();
      }
    }

    // No valid authentication found
    logger.warn("auth_required", {
      path: req.path,
      method: req.method,
      hasSession: !!req.session,
      hasUserId: !!req.session?.userId
    });

    return res.status(401).json({
      error: "Authentication required",
      code: "UNAUTHORIZED"
    });
  } catch (error: any) {
    logger.error("auth_middleware_error", { error: error.message });
    return res.status(500).json({
      error: "Authentication check failed",
      code: "AUTH_ERROR"
    });
  }
}

/**
 * Optional auth middleware - doesn't block requests but attaches user if available
 * Useful for endpoints that work with or without auth
 */
export async function optionalAuth(req: Request, res: Response, next: NextFunction) {
  try {
    // Check if user is already authenticated via Passport
    if (req.user && typeof req.user === 'object' && 'id' in req.user) {
      return next();
    }

    // Check session for userId
    if (req.session?.userId) {
      const user = await storage.getUserById(req.session.userId);
      if (user) {
        req.user = user;
      }
    }

    // Continue regardless of auth status
    next();
  } catch (error: any) {
    logger.error("optional_auth_error", { error: error.message });
    next(); // Continue even if there's an error
  }
}
