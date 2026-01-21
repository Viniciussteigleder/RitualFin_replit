/**
 * Audit log table schema
 * Tracks all changes to critical entities
 */

import { pgTable, varchar, text, timestamp, jsonb } from 'drizzle-orm/pg-core';
import { sql } from 'drizzle-orm';
import { users } from './schema';

export const auditLogs = pgTable('audit_logs', {
  id: varchar('id').primaryKey().default(sql`gen_random_uuid()`),
  userId: varchar('user_id').notNull().references(() => users.id),
  
  // What was changed
  entityType: text('entity_type').notNull(), // 'rule', 'transaction', 'taxonomy', etc.
  entityId: varchar('entity_id').notNull(),
  action: text('action').notNull(), // 'create', 'update', 'delete'
  
  // Change details
  changesBefore: jsonb('changes_before'), // Previous state
  changesAfter: jsonb('changes_after'), // New state
  
  // Context
  ipAddress: text('ip_address'),
  userAgent: text('user_agent'),
  
  // Metadata
  createdAt: timestamp('created_at').notNull().defaultNow(),
});

/**
 * Helper function to log audit events
 */
export async function logAudit(params: {
  userId: string;
  entityType: string;
  entityId: string;
  action: 'create' | 'update' | 'delete';
  before?: any;
  after?: any;
  ipAddress?: string;
  userAgent?: string;
}) {
  const { db } = await import('./index');
  
  await db.insert(auditLogs).values({
    userId: params.userId,
    entityType: params.entityType,
    entityId: params.entityId,
    action: params.action,
    changesBefore: params.before,
    changesAfter: params.after,
    ipAddress: params.ipAddress,
    userAgent: params.userAgent,
  });
}
