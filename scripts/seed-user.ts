
import dotenv from "dotenv";
dotenv.config({ path: ".env.local" });

import bcrypt from "bcryptjs";
import { eq } from "drizzle-orm";

async function seedUser() {
  const { db } = await import("../src/lib/db/db.js");
  const { users } = await import("../src/lib/db/schema.js");

  const email = "vinicius.steigleder@gmail.com";
  const password = "Alemao3001";
  const username = "vinicius";

  console.log(`Checking if user ${email} exists...`);

  const existingUser = await db.query.users.findFirst({
    where: eq(users.email, email),
  });

  if (existingUser) {
    console.log("User already exists. Updating password...");
    const hashedPassword = await bcrypt.hash(password, 10);
    await db.update(users)
      .set({ passwordHash: hashedPassword, username })
      .where(eq(users.email, email));
    console.log("Password updated successfully.");
  } else {
    console.log("Creating new user...");
    const hashedPassword = await bcrypt.hash(password, 10);
    await db.insert(users).values({
      email,
      username,
      passwordHash: hashedPassword,
      name: "Vinicius Steigleder",
    });
    console.log("User created successfully.");
  }

  process.exit(0);
}

seedUser().catch((err) => {
  console.error(err);
  process.exit(1);
});
