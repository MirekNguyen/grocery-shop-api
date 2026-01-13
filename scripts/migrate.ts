import { migrate } from 'drizzle-orm/bun-sqlite/migrator';
import { Database } from 'bun:sqlite';
import { drizzle } from 'drizzle-orm/bun-sqlite';

// Create database connection
const sqlite = new Database('sqlite.db');
const db = drizzle(sqlite);

// Create categories table
sqlite.run(`
  CREATE TABLE IF NOT EXISTS categories (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    key TEXT NOT NULL UNIQUE,
    name TEXT NOT NULL,
    slug TEXT NOT NULL UNIQUE,
    order_hint TEXT,
    created_at INTEGER NOT NULL DEFAULT (CURRENT_TIMESTAMP),
    updated_at INTEGER NOT NULL DEFAULT (CURRENT_TIMESTAMP)
  )
`);

// Create products table
sqlite.run(`
  CREATE TABLE IF NOT EXISTS products (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    product_id TEXT NOT NULL UNIQUE,
    sku TEXT NOT NULL,
    slug TEXT NOT NULL,
    name TEXT NOT NULL,
    description_short TEXT,
    description_long TEXT,
    regulated_product_name TEXT,
    category TEXT NOT NULL,
    category_slug TEXT NOT NULL,
    brand TEXT,
    brand_slug TEXT,
    price INTEGER,
    price_per_unit INTEGER,
    unit_price REAL,
    regular_price INTEGER,
    discount_price INTEGER,
    lowest_price INTEGER,
    in_promotion INTEGER NOT NULL DEFAULT 0,
    amount TEXT,
    weight REAL,
    package_label TEXT,
    package_label_key TEXT,
    volume_label_key TEXT,
    volume_label_short TEXT,
    base_unit_long TEXT,
    base_unit_short TEXT,
    images TEXT,
    product_marketing TEXT,
    brand_marketing TEXT,
    published INTEGER DEFAULT 1,
    medical INTEGER DEFAULT 0,
    weight_article INTEGER DEFAULT 0,
    scraped_at INTEGER NOT NULL DEFAULT (CURRENT_TIMESTAMP),
    updated_at INTEGER NOT NULL DEFAULT (CURRENT_TIMESTAMP)
  )
`);

// Create junction table for many-to-many relationship
sqlite.run(`
  CREATE TABLE IF NOT EXISTS product_categories (
    product_id INTEGER NOT NULL REFERENCES products(id) ON DELETE CASCADE,
    category_id INTEGER NOT NULL REFERENCES categories(id) ON DELETE CASCADE,
    PRIMARY KEY (product_id, category_id)
  )
`);

console.log('✅ Database tables created successfully!');

sqlite.close();
