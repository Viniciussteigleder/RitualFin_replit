import { neon } from '@neondatabase/serverless';
import * as dotenv from 'dotenv';

dotenv.config({ path: '.env.local' });

const sql = neon(process.env.DATABASE_URL!);

console.log('🔍 Checking app_category table structure...\n');

// Check if app_category_leaf table exists
const tables = await sql`
  SELECT table_name 
  FROM information_schema.tables 
  WHERE table_schema = 'public' 
  AND table_name LIKE '%app_category%'
  ORDER BY table_name
`;

console.log('App category related tables:');
console.table(tables);

// Check app_category table structure
if (tables.some((t: any) => t.table_name === 'app_category')) {
  console.log('\n📋 app_category table structure:');
  const appCatCols = await sql`
    SELECT column_name, data_type 
    FROM information_schema.columns 
    WHERE table_name = 'app_category'
    ORDER BY ordinal_position
  `;
  console.table(appCatCols);
}

// Check app_category_leaf table structure
if (tables.some((t: any) => t.table_name === 'app_category_leaf')) {
  console.log('\n📋 app_category_leaf table structure:');
  const appCatLeafCols = await sql`
    SELECT column_name, data_type 
    FROM information_schema.columns 
    WHERE table_name = 'app_category_leaf'
    ORDER BY ordinal_position
  `;
  console.table(appCatLeafCols);
  
  // Sample data
  console.log('\n📊 Sample data from app_category_leaf:');
  const sample = await sql`
    SELECT * FROM app_category_leaf LIMIT 5
  `;
  console.table(sample);
}

// Check taxonomy_leaf structure
console.log('\n📋 taxonomy_leaf columns:');
const taxLeafCols = await sql`
  SELECT column_name, data_type 
  FROM information_schema.columns 
  WHERE table_name = 'taxonomy_leaf'
  ORDER BY ordinal_position
`;
console.table(taxLeafCols);

// Check if there's a direct relationship
console.log('\n🔗 Checking for app_category reference in taxonomy_leaf:');
const hasAppCat = taxLeafCols.some((c: any) => c.column_name.includes('app_category'));
console.log(hasAppCat ? '✓ Found app_category reference' : '✗ No app_category reference found');
