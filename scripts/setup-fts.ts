/**
 * Setup Full-Text Search (FTS5) for products
 * Run this script once to create the FTS virtual table and triggers
 */

import { Database } from 'bun:sqlite';

const sqlite = new Database('sqlite.db');

// Enable FTS5 and create virtual table for full-text search
const setupSQL = `
-- Create FTS5 virtual table for product search
CREATE VIRTUAL TABLE IF NOT EXISTS products_fts USING fts5(
  product_id UNINDEXED,
  name,
  brand,
  description_short,
  description_long,
  content=products,
  content_rowid=id,
  tokenize='unicode61 remove_diacritics 2'
);

-- Trigger to keep FTS index in sync when products are inserted
CREATE TRIGGER IF NOT EXISTS products_ai AFTER INSERT ON products BEGIN
  INSERT INTO products_fts(rowid, product_id, name, brand, description_short, description_long)
  VALUES (new.id, new.product_id, new.name, new.brand, new.description_short, new.description_long);
END;

-- Trigger to keep FTS index in sync when products are updated
CREATE TRIGGER IF NOT EXISTS products_au AFTER UPDATE ON products BEGIN
  UPDATE products_fts 
  SET product_id = new.product_id,
      name = new.name,
      brand = new.brand,
      description_short = new.description_short,
      description_long = new.description_long
  WHERE rowid = new.id;
END;

-- Trigger to keep FTS index in sync when products are deleted
CREATE TRIGGER IF NOT EXISTS products_ad AFTER DELETE ON products BEGIN
  DELETE FROM products_fts WHERE rowid = old.id;
END;

-- Initial population of FTS table from existing products
INSERT OR REPLACE INTO products_fts(rowid, product_id, name, brand, description_short, description_long)
SELECT id, product_id, name, brand, description_short, description_long FROM products;
`;

try {
  // Execute all statements
  sqlite.exec(setupSQL);
  console.log('✅ FTS5 setup completed successfully!');
  console.log('   - Created products_fts virtual table');
  console.log('   - Created sync triggers');
  console.log('   - Populated initial FTS data');
} catch (error) {
  console.error('❌ Error setting up FTS:', error);
  process.exit(1);
} finally {
  sqlite.close();
}
