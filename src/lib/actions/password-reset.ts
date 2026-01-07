"use server";

import { db } from "@/lib/db";
import { users } from "@/lib/db/schema";
import { eq } from "drizzle-orm";
import { randomBytes } from "crypto";

// Development Password Reset Stub
export async function requestPasswordReset(email: string) {
    // Check user existence
    const user = await db.query.users.findFirst({
        where: eq(users.email, email)
    });

    if (!user) {
        // Return success to prevent enumeration
        return { success: true, message: "If email exists, reset link sent." };
    }

    const token = randomBytes(32).toString("hex");
    
    // In strict implementation, save token to 'verification_tokens' or similar table.
    // For Release v1.0 Dev Mode: Log to console.
    
    if (process.env.NODE_ENV === "production") {
        // In production, we must never log the token. 
        // We will return success but no action will happen until an email provider (Resend) is integrated.
        return { success: true, message: "If email exists, reset link sent." };
    }
    
    console.log("------------------------------------------");
    console.log(`🔐 PASSWORD RESET REQUEST FOR: ${email}`);
    console.log(`🔗 RESET LINK: http://localhost:3000/reset-password?token=${token}`);
    console.log("------------------------------------------");

    // TODO: Send via Resend/SendGrid
    // await resend.emails.send({ ... })

    return { success: true, message: "If email exists, reset link sent." };
}
