import { pgTable, varchar, text, integer, real, boolean, timestamp, serial, jsonb } from 'drizzle-orm/pg-core';
import { relations } from 'drizzle-orm';
import { categories } from '../category/category.schema';
import { productCategories } from '../category/product-categories.schema';

export const products = pgTable('products', {
  id: serial('id').primaryKey(),
  
  // Product identifiers
  productId: varchar('product_id', { length: 255 }).notNull().unique(),
  sku: varchar('sku', { length: 255 }).notNull(),
  slug: varchar('slug', { length: 255 }).notNull(),
  
  // Basic information
  name: text('name').notNull(),
  descriptionShort: text('description_short'),
  descriptionLong: text('description_long'),
  regulatedProductName: text('regulated_product_name'),
  
  // Category information (stored for reference, relationships via junction table)
  category: text('category').notNull(),
  categorySlug: varchar('category_slug', { length: 255 }).notNull(),
  
  // Brand
  brand: text('brand'),
  brandSlug: varchar('brand_slug', { length: 255 }),
  
  // Pricing
  price: integer('price'), // stored in cents
  pricePerUnit: integer('price_per_unit'),
  unitPrice: real('unit_price'),
  regularPrice: integer('regular_price'),
  discountPrice: integer('discount_price'),
  lowestPrice: integer('lowest_price'),
  
  // Promotion
  inPromotion: boolean('in_promotion').notNull().default(false),
  
  // Weight and packaging
  amount: text('amount'),
  weight: real('weight'),
  packageLabel: text('package_label'),
  packageLabelKey: text('package_label_key'),
  volumeLabelKey: text('volume_label_key'),
  volumeLabelShort: text('volume_label_short'),
  
  // Base unit for pricing (e.g., "kg" when price is per kilogram)
  baseUnitLong: text('base_unit_long'),
  baseUnitShort: text('base_unit_short'),
  
  // Images (stored as JSON array)
  images: jsonb('images').$type<string[]>(),
  
  // Marketing
  productMarketing: text('product_marketing'),
  brandMarketing: text('brand_marketing'),
  
  // Additional flags
  published: boolean('published').default(true),
  medical: boolean('medical').default(false),
  weightArticle: boolean('weight_article').default(false),
  
  // Metadata
  scrapedAt: timestamp('scraped_at').notNull().defaultNow(),
  updatedAt: timestamp('updated_at').notNull().defaultNow(),
});

// Define many-to-many relations
export const productsRelations = relations(products, ({ many }) => ({
  productCategories: many(productCategories),
}));

// Export types for use in Repository and other modules
export type Product = typeof products.$inferSelect;
export type NewProduct = typeof products.$inferInsert;
