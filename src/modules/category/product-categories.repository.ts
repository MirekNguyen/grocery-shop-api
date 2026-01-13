import { eq, and } from 'drizzle-orm';
import { db } from '../../db/client';
import { productCategories, type ProductCategory, type NewProductCategory } from './product-categories.schema';

/**
 * Links a product to a category.
 */
export const linkProductToCategory = async (productId: number, categoryId: number): Promise<void> => {
  // Check if link already exists
  const existing = await db.query.productCategories.findFirst({
    where: and(
      eq(productCategories.productId, productId),
      eq(productCategories.categoryId, categoryId)
    ),
  });

  if (!existing) {
    await db.insert(productCategories).values({
      productId,
      categoryId,
    });
  }
};

/**
 * Links a product to multiple categories.
 */
export const linkProductToCategories = async (productId: number, categoryIds: number[]): Promise<void> => {
  for (const categoryId of categoryIds) {
    await linkProductToCategory(productId, categoryId);
  }
};

/**
 * Removes all category links for a product.
 */
export const unlinkProductCategories = async (productId: number): Promise<void> => {
  await db.delete(productCategories).where(eq(productCategories.productId, productId));
};

/**
 * Gets all category IDs for a product.
 */
export const getProductCategoryIds = async (productId: number): Promise<number[]> => {
  const links = await db.select({ categoryId: productCategories.categoryId })
    .from(productCategories)
    .where(eq(productCategories.productId, productId));
  
  return links.map(link => link.categoryId);
};
