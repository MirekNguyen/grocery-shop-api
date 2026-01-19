/**
 * Scrape ALL Products from Foodora
 * Uses parent category IDs to fetch all ~6000+ products
 */

import { fetchCategoryProducts } from "./modules/foodora-scraper/foodora-category-api.service.ts";
import { FOODORA_CATEGORIES_FULL } from "./foodora-categories-full.ts";
import type { CategoryProductGroup } from "./modules/foodora-scraper/foodora-category.types.ts";

const DELAY_MS = 500; // 500ms delay between requests (rate limiting)

const delay = (ms: number): Promise<void> =>
  new Promise((resolve) => setTimeout(resolve, ms));

const main = async (): Promise<void> => {
  console.log("\n🛒 Scraping ALL Foodora Products");
  console.log("=" .repeat(80));
  console.log(`Total parent categories: ${FOODORA_CATEGORIES_FULL.length}`);
  console.log(`Delay between requests: ${DELAY_MS}ms`);
  console.log("=" .repeat(80) + "\n");

  const allProducts: CategoryProductGroup[] = [];
  let totalProducts = 0;

  for (let i = 0; i < FOODORA_CATEGORIES_FULL.length; i++) {
    const category = FOODORA_CATEGORIES_FULL[i]!;
    const progress = `[${i + 1}/${FOODORA_CATEGORIES_FULL.length}]`;

    console.log(`${progress} Fetching: ${category.name}...`);

    try {
      const response = await fetchCategoryProducts(category.id);
      const categoryProducts =
        response.data.categoryProductList.categoryProducts;

      if (!categoryProducts) {
        console.log(`  ⚠️  No products found for ${category.name}`);
        continue;
      }

      // Each parent category returns multiple subcategories
      const productsInCategory = categoryProducts.reduce(
        (sum, group) => sum + group.items.length,
        0
      );

      console.log(
        `  ✅ ${categoryProducts.length} subcategories, ${productsInCategory} products`
      );

      // Add all subcategory groups to results
      allProducts.push(...categoryProducts);
      totalProducts += productsInCategory;

      // Rate limiting delay
      if (i < FOODORA_CATEGORIES_FULL.length - 1) {
        await delay(DELAY_MS);
      }
    } catch (error) {
      console.error(`  ❌ Error fetching ${category.name}:`, error);
    }
  }

  console.log("\n" + "=" .repeat(80));
  console.log("📊 Scraping Complete!");
  console.log("=" .repeat(80));
  console.log(`Total category groups: ${allProducts.length}`);
  console.log(`Total products: ${totalProducts}`);
  console.log("=" .repeat(80));

  // Save to JSON file
  const outputPath = "output/all-foodora-products.json";
  await Bun.write(
    outputPath,
    JSON.stringify(allProducts, null, 2)
  );

  console.log(`\n💾 Saved to: ${outputPath}`);
  console.log(`File size: ${((await Bun.file(outputPath).size) / 1024 / 1024).toFixed(2)} MB`);
  console.log("");
};

if (import.meta.main) {
  main();
}
