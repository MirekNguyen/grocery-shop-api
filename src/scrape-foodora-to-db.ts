/**
 * Foodora Scraper CLI - Database Integration
 * Scrapes Foodora products and saves directly to PostgreSQL database
 * Uses default vendor (DMART - o7b0)
 */

import { scrapeAllFoodoraCategories } from "./modules/foodora-scraper/foodora-scraper-db.service.ts";
import { FOODORA_VENDOR_TYPES } from "./modules/product/product.types.ts";

const main = async (): Promise<void> => {
  console.log("\n" + "=" .repeat(80));
  console.log("🛒 FOODORA SCRAPER - DATABASE INTEGRATION");
  console.log("=" .repeat(80));
  console.log(`Default Vendor: D-Mart (${FOODORA_VENDOR_TYPES.DMART})`);
  console.log("This script will:");
  console.log("  1. Fetch all products from Foodora (22 parent categories)");
  console.log("  2. Save products to PostgreSQL database");
  console.log("  3. Mark all products with store='FOODORA' and vendor='o7b0'");
  console.log("  4. Link products to their categories");
  console.log("\nTo scrape other vendors, use: bun src/scrape-foodora-vendor.ts --vendor=<code>");
  console.log("=" .repeat(80) + "\n");

  try {
    await scrapeAllFoodoraCategories(FOODORA_VENDOR_TYPES.DMART);
    
    console.log("\n✨ Foodora scraping complete!");
    console.log("You can now query products via API:");
    console.log("  GET /api/products?store=FOODORA");
    console.log("  GET /api/products?store=BILLA");
    console.log("  GET /api/products (all stores)\n");
  } catch (error) {
    console.error("\n❌ Fatal error:", error);
    process.exit(1);
  }
};

if (import.meta.main) {
  main();
}
