/**
 * Seed script with idempotency
 * Uses upsert to prevent duplicate data
 */

import { db } from '../src/lib/db';
import { users, settings } from '../src/lib/db/schema';
import { eq } from 'drizzle-orm';
import bcrypt from 'bcryptjs';

async function seed() {
  console.log('🌱 Seeding database...\n');

  try {
    // Create test user (idempotent)
    const testEmail = 'test@example.com';
    const existingUser = await db.query.users.findFirst({
      where: eq(users.email, testEmail),
    });

    let userId: string;

    if (existingUser) {
      console.log('✅ Test user already exists');
      userId = existingUser.id;
    } else {
      const passwordHash = await bcrypt.hash('Test123!@#', 10);
      const [newUser] = await db.insert(users).values({
        email: testEmail,
        name: 'Test User',
        passwordHash,
      }).returning();

      userId = newUser.id;
      console.log('✅ Created test user');
    }

    // Create settings (idempotent)
    const existingSettings = await db.query.settings.findFirst({
      where: eq(settings.userId, userId),
    });

    if (existingSettings) {
      console.log('✅ Settings already exist');
    } else {
      await db.insert(settings).values({
        userId,
      });
      console.log('✅ Created settings');
    }

    console.log('\n✨ Seed complete!');
  } catch (error) {
    console.error('❌ Seed failed:', error);
    process.exit(1);
  }
}

seed();
