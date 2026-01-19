/**
 * Foodora Scraper CLI - Database Integration
 * Scrapes Foodora products and saves directly to PostgreSQL database
 * Uses default store (FOODORA_DMART)
 */

import { scrapeAllFoodoraCategories } from "./modules/foodora-scraper/foodora-scraper-db.service.ts";
import { STORE_TYPES, FOODORA_VENDOR_CODES } from "./modules/product/product.types.ts";

const main = async (): Promise<void> => {
  console.log("\n" + "=" .repeat(80));
  console.log("🛒 FOODORA SCRAPER - DATABASE INTEGRATION");
  console.log("=" .repeat(80));
  console.log(`Default Store: ${STORE_TYPES.FOODORA_DMART}`);
  console.log("This script will:");
  console.log("  1. Fetch all products from Foodora (22 parent categories)");
  console.log("  2. Save products to PostgreSQL database");
  console.log(`  3. Mark all products with store='${STORE_TYPES.FOODORA_DMART}'`);
  console.log("  4. Link products to their categories");
  console.log("\nTo scrape other stores, use: bun src/scrape-foodora-store.ts --store=<code>");
  console.log("=" .repeat(80) + "\n");

  try {
    await scrapeAllFoodoraCategories(
      STORE_TYPES.FOODORA_DMART,
      FOODORA_VENDOR_CODES.DMART,
      'foodora-dmart'
    );
    
    console.log("\n✨ Foodora scraping complete!");
    console.log("You can now query products via API:");
    console.log(`  GET /api/products?store=${STORE_TYPES.FOODORA_DMART}`);
    console.log(`  GET /api/products?store=${STORE_TYPES.BILLA}`);
    console.log("  GET /api/products (all stores)\n");
  } catch (error) {
    console.error("\n❌ Fatal error:", error);
    process.exit(1);
  }
};

if (import.meta.main) {
  main();
}
