/**
 * Foodora Scraper CLI - Database Integration
 * Scrapes Foodora products and saves directly to PostgreSQL database
 */

import { scrapeAllFoodoraCategories } from "./modules/foodora-scraper/foodora-scraper-db.service.ts";

const main = async (): Promise<void> => {
  console.log("\n" + "=" .repeat(80));
  console.log("🛒 FOODORA SCRAPER - DATABASE INTEGRATION");
  console.log("=" .repeat(80));
  console.log("This script will:");
  console.log("  1. Fetch all products from Foodora (22 parent categories)");
  console.log("  2. Save products to PostgreSQL database");
  console.log("  3. Mark all products with store='FOODORA'");
  console.log("  4. Link products to their categories");
  console.log("=" .repeat(80) + "\n");

  try {
    await scrapeAllFoodoraCategories();
    
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
