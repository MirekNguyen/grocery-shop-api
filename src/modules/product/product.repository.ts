import { eq, sql } from 'drizzle-orm';
import { db } from '../../db/client';
import { products, type Product, type NewProduct } from './product.schema';

/**
 * Inserts a new product into the database.
 */
export const createProduct = async (data: NewProduct): Promise<Product> => {
  const [result] = await db.insert(products).values(data).returning();
  return result;
};

/**
 * Inserts multiple products in a batch.
 */
export const createProducts = async (data: NewProduct[]): Promise<Product[]> => {
  if (data.length === 0) return [];
  return await db.insert(products).values(data).returning();
};

/**
 * Finds a product by productId.
 */
export const findProductByProductId = async (productId: string): Promise<Product | undefined> => {
  return await db.query.products.findFirst({
    where: eq(products.productId, productId),
  });
};

/**
 * Finds a product by SKU.
 */
export const findProductBySku = async (sku: string): Promise<Product | undefined> => {
  return await db.query.products.findFirst({
    where: eq(products.sku, sku),
  });
};

/**
 * Updates a product or inserts if it doesn't exist (upsert by productId).
 */
export const upsertProduct = async (data: NewProduct): Promise<Product> => {
  const existing = await findProductByProductId(data.productId as string);
  
  if (existing) {
    const [updated] = await db
      .update(products)
      .set({
        ...data,
        updatedAt: sql`(CURRENT_TIMESTAMP)`,
      })
      .where(eq(products.productId, data.productId as string))
      .returning();
    return updated;
  } else {
    return await createProduct(data);
  }
};

/**
 * Upserts multiple products in a batch.
 */
export const upsertProducts = async (data: NewProduct[]): Promise<void> => {
  for (const product of data) {
    await upsertProduct(product);
  }
};

/**
 * Gets all products from a specific category.
 */
export const getProductsByCategory = async (categorySlug: string): Promise<Product[]> => {
  return await db.select().from(products).where(eq(products.categorySlug, categorySlug));
};

/**
 * Gets total count of products in database.
 */
export const getProductCount = async (): Promise<number> => {
  const result = await db.select({ count: sql<number>`count(*)` }).from(products);
  return result[0].count;
};

/**
 * Deletes all products (use with caution).
 */
export const deleteAllProducts = async (): Promise<void> => {
  await db.delete(products);
};
