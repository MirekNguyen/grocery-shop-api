/**
 * Migration: Add base unit fields to products table
 * Adds baseUnitLong and baseUnitShort to properly track pricing units
 */

import { Database } from 'bun:sqlite';

const sqlite = new Database('sqlite.db');

const migrationSQL = `
-- Add base unit fields for pricing
ALTER TABLE products ADD COLUMN base_unit_long TEXT;
ALTER TABLE products ADD COLUMN base_unit_short TEXT;
`;

try {
  console.log('🔄 Running migration: Add base unit fields...');
  sqlite.exec(migrationSQL);
  console.log('✅ Migration completed successfully!');
  console.log('   - Added base_unit_long column');
  console.log('   - Added base_unit_short column');
} catch (error) {
  console.error('❌ Migration failed:', error);
  process.exit(1);
} finally {
  sqlite.close();
}
