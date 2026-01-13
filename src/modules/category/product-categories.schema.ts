import { pgTable, integer, primaryKey } from 'drizzle-orm/pg-core';
import { products } from '../product/product.schema';
import { categories } from './category.schema';

/**
 * Junction table for many-to-many relationship between products and categories
 */
export const productCategories = pgTable('product_categories', {
  productId: integer('product_id')
    .notNull()
    .references(() => products.id, { onDelete: 'cascade' }),
  categoryId: integer('category_id')
    .notNull()
    .references(() => categories.id, { onDelete: 'cascade' }),
}, (table) => ({
  pk: primaryKey({ columns: [table.productId, table.categoryId] }),
}));

export type ProductCategory = typeof productCategories.$inferSelect;
export type NewProductCategory = typeof productCategories.$inferInsert;
