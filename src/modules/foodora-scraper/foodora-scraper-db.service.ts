/**
 * Foodora Scraper Integration Service
 * Main scraper that fetches Foodora products and saves to database
 */

import { fetchCategoryProducts } from "./foodora-category-api.service.ts";
import { saveFoodoraCategoryProducts } from "./foodora-db.service.ts";
import { FOODORA_CATEGORIES_FULL } from "../../foodora-categories-full.ts";
import type { CategoryDefinition } from "./foodora-category.types.ts";
import { FOODORA_VENDOR_TYPES } from "../product/product.types.ts";
import * as ProductRepository from "../product/product.repository.ts";
import * as CategoryRepository from "../category/category.repository.ts";

const DELAY_MS = 500; // 500ms delay between requests (rate limiting)

const delay = (ms: number): Promise<void> =>
  new Promise((resolve) => setTimeout(resolve, ms));

/**
 * Scrapes products from a single Foodora parent category and saves to database
 */
export const scrapeFoodoraCategory = async (
  category: CategoryDefinition,
  vendor: string = FOODORA_VENDOR_TYPES.DMART
): Promise<number> => {
  console.log(`\n🔍 Scraping Foodora category: ${category.name} (${category.id}) [Vendor: ${vendor}]`);

  try {
    const response = await fetchCategoryProducts(category.id, vendor);
    const categoryProducts = response.data.categoryProductList.categoryProducts;

    if (!categoryProducts) {
      console.log(`  ⚠️  No products found for ${category.name}`);
      return 0;
    }

    let totalSaved = 0;

    // Each parent category returns multiple subcategory groups
    for (const subcategoryGroup of categoryProducts) {
      console.log(
        `  📦 Saving subcategory: ${subcategoryGroup.name} (${subcategoryGroup.items.length} products)`
      );

      const savedCount = await saveFoodoraCategoryProducts(
        subcategoryGroup.id,
        subcategoryGroup.name,
        subcategoryGroup.items,
        vendor
      );

      totalSaved += savedCount;
      console.log(`     ✅ Saved ${savedCount}/${subcategoryGroup.items.length} products`);
    }

    console.log(
      `  ✅ Total saved from ${category.name}: ${totalSaved} products`
    );
    return totalSaved;
  } catch (error) {
    console.error(`  ❌ Error scraping ${category.name}:`, error);
    return 0;
  }
};

/**
 * Scrapes all Foodora categories and saves to database
 */
export const scrapeAllFoodoraCategories = async (
  vendor: string = FOODORA_VENDOR_TYPES.DMART,
  categories: CategoryDefinition[] = FOODORA_CATEGORIES_FULL
): Promise<void> => {
  console.log("\n🛒 Starting Foodora Scraper (Database Integration)");
  console.log("=" .repeat(80));
  console.log(`Vendor: ${vendor}`);
  console.log(`Total parent categories: ${categories.length}`);
  console.log(`Delay between requests: ${DELAY_MS}ms`);
  console.log("=" .repeat(80) + "\n");

  let totalProducts = 0;

  for (let i = 0; i < categories.length; i++) {
    const category = categories[i]!;
    const progress = `[${i + 1}/${categories.length}]`;

    console.log(`${progress} Processing: ${category.name}...`);

    const count = await scrapeFoodoraCategory(category, vendor);
    totalProducts += count;

    // Rate limiting delay
    if (i < categories.length - 1) {
      await delay(DELAY_MS);
    }
  }

  console.log("\n" + "=" .repeat(80));
  console.log("📊 Scraping Complete!");
  console.log("=" .repeat(80));
  console.log(`Total Foodora products saved: ${totalProducts}`);

  // Get database stats
  const dbCount = await ProductRepository.getProductCount();
  console.log(`📊 Total products in database: ${dbCount}`);

  const categoryCount = await CategoryRepository.getCategoryCount();
  console.log(`📁 Total categories in database: ${categoryCount}`);
  console.log("=" .repeat(80) + "\n");
};

/**
 * Scrapes a specific list of Foodora categories
 */
export const scrapeFoodoraCategories = async (
  categories: CategoryDefinition[],
  vendor: string = FOODORA_VENDOR_TYPES.DMART
): Promise<number> => {
  console.log(`\n🛒 Scraping ${categories.length} Foodora categories (Vendor: ${vendor})...`);
  console.log("=" .repeat(80) + "\n");

  let totalProducts = 0;

  for (let i = 0; i < categories.length; i++) {
    const category = categories[i]!;
    const progress = `[${i + 1}/${categories.length}]`;

    console.log(`${progress} Processing: ${category.name}...`);

    const count = await scrapeFoodoraCategory(category, vendor);
    totalProducts += count;

    // Rate limiting delay
    if (i < categories.length - 1) {
      await delay(DELAY_MS);
    }
  }

  console.log("\n" + "=" .repeat(80));
  console.log(`✅ Saved ${totalProducts} Foodora products to database`);
  console.log("=" .repeat(80) + "\n");

  return totalProducts;
};
