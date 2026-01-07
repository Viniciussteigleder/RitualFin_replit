import passport from "passport";
import { Strategy as GoogleStrategy } from "passport-google-oauth20";
import { storage } from "./storage";
import { logger } from "./logger";

const GOOGLE_CLIENT_ID = process.env.GOOGLE_CLIENT_ID;
const GOOGLE_CLIENT_SECRET = process.env.GOOGLE_CLIENT_SECRET;
const GOOGLE_CALLBACK_URL = process.env.GOOGLE_CALLBACK_URL || 
  (process.env.RENDER_EXTERNAL_URL ? `${process.env.RENDER_EXTERNAL_URL}/api/auth/google/callback` : "http://localhost:5001/api/auth/google/callback");

if (!GOOGLE_CLIENT_ID || !GOOGLE_CLIENT_SECRET) {
  logger.warn("google_oauth_not_configured", {
    message: "GOOGLE_CLIENT_ID or GOOGLE_CLIENT_SECRET not set. Google OAuth will not work."
  });
}

// Serialize user to session
passport.serializeUser((user: any, done) => {
  done(null, user.id);
});

// Deserialize user from session
passport.deserializeUser(async (id: string, done) => {
  try {
    const user = await storage.getUserById(id);
    done(null, user);
  } catch (error: any) {
    logger.error("deserialize_user_error", { error: error.message });
    done(error, null);
  }
});

// Google OAuth Strategy
if (GOOGLE_CLIENT_ID && GOOGLE_CLIENT_SECRET) {
  passport.use(
    new GoogleStrategy(
      {
        clientID: GOOGLE_CLIENT_ID,
        clientSecret: GOOGLE_CLIENT_SECRET,
        callbackURL: GOOGLE_CALLBACK_URL,
        scope: ["profile", "email"],
      },
      async (accessToken, refreshToken, profile, done) => {
        try {
          // Extract email from Google profile
          const email = profile.emails?.[0]?.value;
          if (!email) {
            return done(new Error("No email found in Google profile"), undefined);
          }

          // Check if user exists
          let user = await storage.getUserByEmail(email);

          if (!user) {
            // Create new user
            const displayName = profile.displayName || email.split("@")[0];
            user = await storage.createUser({
              email,
              username: displayName,
              googleId: profile.id,
            });
            logger.info("user_created_via_google", { userId: user.id, email });
          } else {
            // Update existing user with Google ID if not set
            if (!user.googleId) {
              await storage.updateUser(user.id, { googleId: profile.id });
              logger.info("user_linked_to_google", { userId: user.id, email });
            }
          }

          return done(null, user);
        } catch (error: any) {
          logger.error("google_oauth_error", { error: error.message });
          return done(error, undefined);
        }
      }
    )
  );
}

export { passport };
