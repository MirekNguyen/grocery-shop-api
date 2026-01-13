import { pgTable, varchar, text, serial, timestamp } from 'drizzle-orm/pg-core';
import { relations } from 'drizzle-orm';
import { productCategories } from './product-categories.schema';

export const categories = pgTable('categories', {
  id: serial('id').primaryKey(),
  
  // Category identifiers from API
  key: varchar('key', { length: 255 }).notNull().unique(),
  name: text('name').notNull(),
  slug: varchar('slug', { length: 255 }).notNull().unique(),
  orderHint: text('order_hint'),
  
  // Metadata
  createdAt: timestamp('created_at').notNull().defaultNow(),
  updatedAt: timestamp('updated_at').notNull().defaultNow(),
});

// Define many-to-many relations
export const categoriesRelations = relations(categories, ({ many }) => ({
  productCategories: many(productCategories),
}));

// Export types for use in Repository and other modules
export type Category = typeof categories.$inferSelect;
export type NewCategory = typeof categories.$inferInsert;
