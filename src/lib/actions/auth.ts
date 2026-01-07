"use server";

import { db } from "@/lib/db";
import { users } from "@/lib/db/schema";
import { eq } from "drizzle-orm";
import bcrypt from "bcryptjs";
import { z } from "zod";
import { signIn } from "@/auth";
import { AuthError } from "next-auth";

const signupSchema = z.object({
  username: z.string().min(3, "Username must be at least 3 characters"),
  email: z.string().email("Invalid email address"),
  password: z.string().min(6, "Password must be at least 6 characters"),
});

export async function registerUser(prevState: string | undefined, formData: FormData) {
  const data = Object.fromEntries(formData.entries());
  
  const parsed = signupSchema.safeParse(data);
  if (!parsed.success) {
    return "Invalid input data";
  }

  const { username, email, password } = parsed.data;

  try {
    // Check if user exists
    const existingUser = await db.query.users.findFirst({
      where: (users, { or, eq }) => or(eq(users.email, email), eq(users.username, username)),
    });

    if (existingUser) {
      return "User already exists (email or username)";
    }

    const hashedPassword = await bcrypt.hash(password, 10);

    const [newUser] = await db.insert(users).values({
      username,
      email,
      passwordHash: hashedPassword,
    }).returning();

    // Attempt sign in immediately after registration
    await signIn("credentials", {
      email,
      password,
      redirectTo: "/",
    });
    
  } catch (error: any) {
    if (error?.digest?.startsWith("NEXT_REDIRECT")) throw error;
    if (error instanceof AuthError) {
      switch (error.type) {
        case "CredentialsSignin":
          return "Invalid credentials.";
        default:
          return "Authentication failed.";
      }
    }
    console.error("Registration error:", error);
    return "Failed to register user.";
  }
}
