import { neon } from '@neondatabase/serverless';
import * as dotenv from 'dotenv';
import * as fs from 'fs';

dotenv.config({ path: '.env.local' });

const sql = neon(process.env.DATABASE_URL!);

const migrationContent = fs.readFileSync('migrations/0001_add_display_column.sql', 'utf-8');

console.log('Running migration...');
console.log(migrationContent);

// Split by semicolon and filter out empty statements
const statements = migrationContent
  .split(';')
  .map(s => s.trim())
  .filter(s => s && !s.startsWith('--'));

for (const statement of statements) {
  if (statement) {
    console.log(`Executing: ${statement}`);
    await sql.query(statement);
  }
}

console.log('✅ Migration completed successfully');
