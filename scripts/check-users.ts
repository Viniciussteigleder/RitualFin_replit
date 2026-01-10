
import dotenv from "dotenv";
dotenv.config({ path: ".env.production.local" });
dotenv.config({ path: ".env.local" });
dotenv.config();

const { db } = await import("../src/lib/db");
import { users } from "../src/lib/db/schema";

async function main() {
    console.log("Checking users table...");
    const allUsers = await db.select().from(users);
    console.log(`Found ${allUsers.length} users:`);
    allUsers.forEach(u => console.log(`- ${u.name} (Email: ${u.email}, ID: ${u.id})`));
    process.exit(0);
}

main();
