import { relations } from 'drizzle-orm';
import { productCategories } from './product-categories.schema';
import { products } from '../product/product.schema';
import { categories } from './category.schema';

// Define relations for the junction table
export const productCategoriesRelations = relations(productCategories, ({ one }) => ({
  product: one(products, {
    fields: [productCategories.productId],
    references: [products.id],
  }),
  category: one(categories, {
    fields: [productCategories.categoryId],
    references: [categories.id],
  }),
}));
