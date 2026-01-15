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

    // NOTE: This is intentionally a no-op until a real delivery mechanism exists.
    // Never log or return reset tokens. Implement by persisting a hashed token in DB
    // and sending via a provider (e.g., Resend/SendGrid).
    //
    // We still keep the "success" response to prevent user enumeration.
    void randomBytes(32).toString("hex");

    return { success: true, message: "If email exists, reset link sent." };
}
