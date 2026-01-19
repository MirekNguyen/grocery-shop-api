/**
 * Test Foodora Database Integration
 * Tests scraping one category and saving to database
 */

import { scrapeFoodoraCategory } from "./modules/foodora-scraper/foodora-scraper-db.service.ts";
import { FOODORA_VENDOR_TYPES } from "./modules/product/product.types.ts";
import * as ProductRepository from "./modules/product/product.repository.ts";

const main = async (): Promise<void> => {
  console.log("\n🧪 Testing Foodora Database Integration");
  console.log("=" .repeat(80));
  console.log("This will scrape ONE category and save to database");
  console.log(`Vendor: D-Mart (${FOODORA_VENDOR_TYPES.DMART})`);
  console.log("=" .repeat(80) + "\n");

  // Test category: "Maso a uzeniny" (Meat and Sausages)
  const testCategory = {
    id: "8d101a5c-84cb-4d02-8247-a47d423d4691",
    name: "Maso a uzeniny",
    numberOfProducts: 158,
    type: "DEFAULT" as const,
  };

  try {
    console.log("Before scraping:");
    const countBefore = await ProductRepository.getProductCount();
    console.log(`  Total products in DB: ${countBefore}\n`);

    // Scrape the category with default vendor
    const savedCount = await scrapeFoodoraCategory(testCategory, FOODORA_VENDOR_TYPES.DMART);

    console.log("\nAfter scraping:");
    const countAfter = await ProductRepository.getProductCount();
    console.log(`  Total products in DB: ${countAfter}`);
    console.log(`  New products added: ${countAfter - countBefore}`);
    console.log(`  Expected: ${savedCount}`);

    if (countAfter - countBefore === savedCount) {
      console.log("\n✅ Test PASSED! Products saved correctly.\n");
    } else {
      console.log("\n⚠️  Warning: Product count mismatch.\n");
    }

    // Show sample Foodora products
    console.log("Sample Foodora products from database:");
    console.log("(Run this query to see them)");
    console.log(`  SELECT name, price, store, vendor FROM products WHERE store = 'FOODORA' AND vendor = '${FOODORA_VENDOR_TYPES.DMART}' LIMIT 5;\n`);

  } catch (error) {
    console.error("\n❌ Test FAILED:", error);
    process.exit(1);
  }
};

if (import.meta.main) {
  main();
}
