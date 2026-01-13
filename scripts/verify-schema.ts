/**
 * Verify the database schema has all required columns
 */

import { Database } from 'bun:sqlite';

const sqlite = new Database('sqlite.db');

console.log('📋 Verifying products table schema:\n');

const result = sqlite.query("PRAGMA table_info(products)").all();

const columns = result.map((row: any) => row.name);

const requiredColumns = [
  'base_unit_long',
  'base_unit_short',
  'volume_label_key',
  'volume_label_short',
];

console.log('✅ Found columns:');
columns.forEach((col: string) => console.log(`   - ${col}`));

console.log('\n🔍 Checking required columns:');
let allPresent = true;
requiredColumns.forEach(col => {
  const present = columns.includes(col);
  console.log(`   ${present ? '✅' : '❌'} ${col}`);
  if (!present) allPresent = false;
});

if (allPresent) {
  console.log('\n✅ All required columns are present!');
} else {
  console.log('\n❌ Some columns are missing!');
  process.exit(1);
}

sqlite.close();
