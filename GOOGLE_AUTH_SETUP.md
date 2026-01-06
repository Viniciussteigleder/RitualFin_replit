# Google OAuth Authentication Setup

## ✅ Implementation Complete

Google OAuth authentication has been successfully implemented for RitualFin.

## What Was Implemented

### 1. **Database Schema Changes** (`shared/schema.ts`)
Added to the `users` table:
- `email` (text, unique) - User's email from Google
- `googleId` (text, unique) - Google user ID
- `createdAt` (timestamp) - User creation date
- `updatedAt` (timestamp) - Last update date

### 2. **Passport Configuration** (`server/passport.ts`)
- Google OAuth 2.0 strategy configured
- Automatic user creation on first Google login
- Links existing users by email if they already exist
- Proper error handling and logging

### 3. **Storage Layer Updates** (`server/storage.ts`)
New methods added:
- `getUserById(id)` - Get user by ID
- `getUserByEmail(email)` - Get user by email address
- `updateUser(id, data)` - Update user data (e.g., link Google ID)

### 4. **Server Routes** (`server/routes.ts`)
New endpoints:
- `GET /api/auth/google` - Initiates Google OAuth flow
- `GET /api/auth/google/callback` - Handles OAuth callback
- `GET /api/auth/logout` - Logs out user and destroys session

### 5. **Frontend** (`client/src/pages/login.tsx`)
- Google Sign-In button now redirects to `/api/auth/google`
- On success, redirects to `/dashboard`
- On failure, redirects to `/login`

## Environment Variables Required in Render

These variables are already set in your Render backend:

```bash
GOOGLE_CLIENT_ID=533925452264-pbd6qa1fi3uqr1gem94edpk0f0tsi17n.apps.googleusercontent.com
GOOGLE_CLIENT_SECRET=<already set in Render>
```

### Additional Variable Needed:

```bash
GOOGLE_CALLBACK_URL=https://your-backend-url.onrender.com/api/auth/google/callback
```

**Replace** `your-backend-url` with your actual Render backend URL.

## Database Migration Required

After merging and deploying, run this command **once** in your Render backend:

```bash
npm run db:push
```

This will add the new `email`, `google_id`, `created_at`, and `updated_at` columns to the `users` table.

## How It Works

1. **User clicks "Continue with Google"** on the login page
2. **Redirected to Google** for authentication
3. **Google redirects back** to `/api/auth/google/callback`
4. **Passport processes the callback:**
   - If user doesn't exist → Creates new user with email and googleId
   - If user exists (by email) → Links their Google account
5. **User is logged in** and redirected to `/dashboard`

## Testing Locally

1. Set environment variables in `.env`:
   ```bash
   GOOGLE_CLIENT_ID=533925452264-pbd6qa1fi3uqr1gem94edpk0f0tsi17n.apps.googleusercontent.com
   GOOGLE_CLIENT_SECRET=<get from Render>
   GOOGLE_CALLBACK_URL=http://localhost:5001/api/auth/google/callback
   ```

2. Push database schema:
   ```bash
   npm run db:push
   ```

3. Start the dev server:
   ```bash
   npm run dev
   ```

4. Navigate to `http://localhost:5001/login` and click "Continue with Google"

## Google Cloud Console Configuration

Your Google OAuth app needs these settings:

**Authorized JavaScript origins:**
```
http://localhost:5001
https://your-frontend.vercel.app
```

**Authorized redirect URIs:**
```
http://localhost:5001/api/auth/google/callback
https://your-backend.onrender.com/api/auth/google/callback
```

## Security Notes

- ✅ Sessions stored in PostgreSQL (production) or memory (dev)
- ✅ Secure cookies in production (`sameSite: "none", secure: true`)
- ✅ Email and Google ID are unique indexes
- ✅ Password field remains for demo/email login backward compatibility
- ✅ Proper error handling and logging throughout

## Files Modified

1. `shared/schema.ts` - User schema with email/googleId
2. `server/passport.ts` - **NEW** - Passport Google strategy
3. `server/storage.ts` - Added user lookup/update methods
4. `server/index.ts` - Initialize passport middleware
5. `server/routes.ts` - Google OAuth routes
6. `client/src/pages/login.tsx` - Google button functionality
7. `package.json` - Added `passport-google-oauth20` dependency

## Commit

Branch: `claude/plan-open-ui-ux-ARikK`
Commit: `feat(auth): Implement Google OAuth authentication`

Ready to merge!
