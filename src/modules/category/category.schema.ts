import { pgTable, varchar, text, serial, timestamp, integer } from 'drizzle-orm/pg-core';
import { relations } from 'drizzle-orm';
import { productCategories } from './product-categories.schema';

export const categories = pgTable('categories', {
  id: serial('id').primaryKey(),
  
  // Category identifiers from API
  key: varchar('key', { length: 255 }).notNull().unique(),
  name: text('name').notNull(),
  slug: varchar('slug', { length: 255 }).notNull().unique(),
  orderHint: text('order_hint'),
  
  // Parent-child hierarchy
  parentId: integer('parent_id'),
  
  // Metadata
  createdAt: timestamp('created_at').notNull().defaultNow(),
  updatedAt: timestamp('updated_at').notNull().defaultNow(),
});

// Define many-to-many relations and self-referential parent-child relation
export const categoriesRelations = relations(categories, ({ many, one }) => ({
  productCategories: many(productCategories),
  parent: one(categories, {
    fields: [categories.parentId],
    references: [categories.id],
  }),
  children: many(categories),
}));

// Export types for use in Repository and other modules
export type Category = typeof categories.$inferSelect;
export type NewCategory = typeof categories.$inferInsert;
