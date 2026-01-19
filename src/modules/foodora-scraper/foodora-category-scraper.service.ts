/**
 * Foodora Category Scraper Service
 * Main service for scraping all products from categories
 */

import { fetchCategoryProducts } from "./foodora-category-api.service.ts";
import type {
  CategoryDefinition,
  CategoryProductItem,
  CategoryProductListResponse,
} from "./foodora-category.types.ts";

// ============================================================================
// Helper Functions
// ============================================================================

/**
 * Flattens a category tree into a flat array of all categories (including nested children)
 */
const flattenCategories = (categories: CategoryDefinition[]): CategoryDefinition[] => {
  const result: CategoryDefinition[] = [];

  const flatten = (cat: CategoryDefinition): void => {
    result.push(cat);
    if (cat.children && cat.children.length > 0) {
      cat.children.forEach(flatten);
    }
  };

  categories.forEach(flatten);
  return result;
};

/**
 * Extracts all product items from a category response
 */
const extractProductItems = (response: CategoryProductListResponse): CategoryProductItem[] => {
  const products: CategoryProductItem[] = [];

  const categoryProducts = response.data.categoryProductList.categoryProducts;
  
  // Handle null response (empty or invalid category)
  if (!categoryProducts) {
    return products;
  }

  categoryProducts.forEach((group) => {
    products.push(...group.items);
  });

  return products;
};

// ============================================================================
// Main Scraping Functions
// ============================================================================

/**
 * Scrapes all products from a single category
 * @param categoryId - The category ID to scrape
 * @param vendorCode - Vendor code (optional)
 * @param userCode - User code (optional)
 * @returns Array of all products in the category
 */
export const scrapeCategoryProducts = async (
  categoryId: string,
  vendorCode?: string,
  userCode?: string
): Promise<CategoryProductItem[]> => {
  const response = await fetchCategoryProducts(categoryId, vendorCode, userCode);
  return extractProductItems(response);
};

/**
 * Scrapes products from multiple categories
 * @param categoryIds - Array of category IDs to scrape
 * @param vendorCode - Vendor code (optional)
 * @param userCode - User code (optional)
 * @param onProgress - Progress callback (optional)
 * @returns Map of category ID to products
 */
export const scrapeMultipleCategories = async (
  categoryIds: string[],
  vendorCode?: string,
  userCode?: string,
  onProgress?: (current: number, total: number, categoryId: string) => void
): Promise<{ [categoryId: string]: CategoryProductItem[] }> => {
  const results: { [categoryId: string]: CategoryProductItem[] } = {};

  for (const [index, categoryId] of categoryIds.entries()) {
    if (onProgress) {
      onProgress(index + 1, categoryIds.length, categoryId);
    }

    try {
      const products = await scrapeCategoryProducts(categoryId, vendorCode, userCode);
      results[categoryId] = products;

      // Add a small delay to avoid rate limiting
      await new Promise((resolve) => setTimeout(resolve, 500));
    } catch (error) {
      console.error(`Error scraping category ${categoryId}:`, error);
      results[categoryId] = [];
    }
  }

  return results;
};

/**
 * Scrapes all products from a category tree (including all nested categories)
 * @param categories - Category tree to scrape
 * @param vendorCode - Vendor code (optional)
 * @param userCode - User code (optional)
 * @param onProgress - Progress callback (optional)
 * @returns Map of category ID to products
 */
export const scrapeCategoryTree = async (
  categories: CategoryDefinition[],
  vendorCode?: string,
  userCode?: string,
  onProgress?: (current: number, total: number, categoryName: string) => void
): Promise<{ [categoryId: string]: CategoryProductItem[] }> => {
  const flatCategories = flattenCategories(categories);
  const categoryIds = flatCategories.map((cat) => cat.id);

  const progressWrapper = onProgress
    ? (current: number, total: number, categoryId: string) => {
        const category = flatCategories.find((c) => c.id === categoryId);
        onProgress(current, total, category?.name ?? categoryId);
      }
    : undefined;

  return await scrapeMultipleCategories(
    categoryIds,
    vendorCode,
    userCode,
    progressWrapper
  );
};

// ============================================================================
// File Operations
// ============================================================================

/**
 * Saves category products to a JSON file
 */
export const saveCategoryProducts = async (
  categoryId: string,
  products: CategoryProductItem[],
  filename: string
): Promise<void> => {
  const data = {
    categoryId,
    totalProducts: products.length,
    scrapedAt: new Date().toISOString(),
    products,
  };

  await Bun.write(filename, JSON.stringify(data, null, 2));
};

/**
 * Saves all scraped categories to individual JSON files
 */
export const saveAllCategories = async (
  results: { [categoryId: string]: CategoryProductItem[] },
  outputDir: string = "./scraped-categories"
): Promise<void> => {
  // Create output directory if it doesn't exist
  await Bun.write(`${outputDir}/.keep`, "");

  const savePromises = Object.entries(results).map(([categoryId, products]) =>
    saveCategoryProducts(categoryId, products, `${outputDir}/${categoryId}.json`)
  );

  await Promise.all(savePromises);
};

/**
 * Saves all scraped categories to a single JSON file
 */
export const saveAllCategoriesToSingleFile = async (
  results: { [categoryId: string]: CategoryProductItem[] },
  filename: string
): Promise<void> => {
  const totalProducts = Object.values(results).reduce(
    (sum, products) => sum + products.length,
    0
  );

  const data = {
    scrapedAt: new Date().toISOString(),
    totalCategories: Object.keys(results).length,
    totalProducts,
    categories: results,
  };

  await Bun.write(filename, JSON.stringify(data, null, 2));
};
