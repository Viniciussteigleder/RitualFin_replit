import { neon } from '@neondatabase/serverless';
import * as dotenv from 'dotenv';

dotenv.config({ path: '.env.local' });

const sql = neon(process.env.DATABASE_URL!);

console.log('🔍 Checking category_1 enum values in database...\n');

const enumValues = await sql`
  SELECT enumlabel
  FROM pg_enum
  JOIN pg_type ON pg_enum.enumtypid = pg_type.oid
  WHERE pg_type.typname = 'category_1'
  ORDER BY enumsortorder
`;

console.log('Current enum values:');
console.table(enumValues);

// Check if 'Mercados' exists
const hasMercados = enumValues.some((e: any) => e.enumlabel === 'Mercados');
const hasMercado = enumValues.some((e: any) => e.enumlabel === 'Mercado');

console.log(`\n✓ Has "Mercados" (plural): ${hasMercados}`);
console.log(`✓ Has "Mercado" (singular): ${hasMercado}`);
