import { eq } from 'drizzle-orm';
import { db } from '../../db/client';
import { products } from './product.schema';
import { categories } from '../category/category.schema';
import { productCategories } from '../category/product-categories.schema';

/**
 * Gets all products with their categories.
 */
export const findAllProductsWithCategories = async () => {
  const productsData = await db.select().from(products);
  
  const productMap = new Map();
  
  for (const product of productsData) {
    productMap.set(product.id, {
      ...product,
      categories: [],
    });
  }
  
  const links = await db
    .select({
      productId: productCategories.productId,
      category: categories,
    })
    .from(productCategories)
    .innerJoin(categories, eq(productCategories.categoryId, categories.id));
  
  for (const link of links) {
    const product = productMap.get(link.productId);
    if (product) {
      product.categories.push(link.category);
    }
  }
  
  return Array.from(productMap.values());
};

/**
 * Gets a product by ID with its categories.
 */
export const findProductByIdWithCategories = async (productId: number) => {
  const product = await db.query.products.findFirst({
    where: eq(products.id, productId),
  });
  
  if (!product) {
    return [];
  }
  
  const categoryLinks = await db
    .select({
      category: categories,
    })
    .from(productCategories)
    .innerJoin(categories, eq(productCategories.categoryId, categories.id))
    .where(eq(productCategories.productId, productId));
  
  return [{
    ...product,
    categories: categoryLinks.map(link => link.category),
  }];
};

/**
 * Gets all products for a specific category using the junction table.
 */
export const getProductsByCategorySlug = async (categorySlug: string) => {
  // First find the category
  const category = await db.query.categories.findFirst({
    where: eq(categories.slug, categorySlug),
  });
  
  if (!category) {
    return [];
  }
  
  // Then find all products linked to this category
  return await db
    .select({
      product: products,
      category: categories,
    })
    .from(productCategories)
    .innerJoin(products, eq(productCategories.productId, products.id))
    .innerJoin(categories, eq(productCategories.categoryId, categories.id))
    .where(eq(productCategories.categoryId, category.id));
};

/**
 * Gets all products with ALL their categories.
 */
export const getProductsWithAllCategories = async () => {
  const results = await db
    .select({
      product: products,
      category: categories,
    })
    .from(products)
    .leftJoin(productCategories, eq(products.id, productCategories.productId))
    .leftJoin(categories, eq(productCategories.categoryId, categories.id));
  
  // Group by product
  const productMap = new Map();
  
  for (const row of results) {
    const productId = row.product.id;
    
    if (!productMap.has(productId)) {
      productMap.set(productId, {
        product: row.product,
        categories: [],
      });
    }
    
    if (row.category) {
      productMap.get(productId).categories.push(row.category);
    }
  }
  
  return Array.from(productMap.values());
};

/**
 * Gets all products for a category by category ID.
 */
export const getProductsByCategoryId = async (categoryId: number) => {
  return await db
    .select({
      product: products,
    })
    .from(productCategories)
    .innerJoin(products, eq(productCategories.productId, products.id))
    .where(eq(productCategories.categoryId, categoryId));
};

/**
 * Gets all categories for a specific product.
 */
export const getCategoriesForProduct = async (productId: number) => {
  return await db
    .select({
      category: categories,
    })
    .from(productCategories)
    .innerJoin(categories, eq(productCategories.categoryId, categories.id))
    .where(eq(productCategories.productId, productId));
};

/**
 * Gets products by IDs with their categories (efficient for Meilisearch results).
 */
export const findProductsByIdsWithCategories = async (productIds: number[]) => {
  if (productIds.length === 0) {
    return [];
  }
  
  // Import inArray operator
  const { inArray } = await import('drizzle-orm');
  
  // Get products
  const productsData = await db
    .select()
    .from(products)
    .where(inArray(products.id, productIds));
  
  const productMap = new Map();
  
  for (const product of productsData) {
    productMap.set(product.id, {
      ...product,
      categories: [],
    });
  }
  
  // Get categories for these products
  const links = await db
    .select({
      productId: productCategories.productId,
      category: categories,
    })
    .from(productCategories)
    .innerJoin(categories, eq(productCategories.categoryId, categories.id))
    .where(inArray(productCategories.productId, productIds));
  
  for (const link of links) {
    const product = productMap.get(link.productId);
    if (product) {
      product.categories.push(link.category);
    }
  }
  
  return Array.from(productMap.values());
};
