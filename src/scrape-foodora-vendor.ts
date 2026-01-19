/**
 * Foodora Multi-Vendor Scraper CLI
 * Scrapes Foodora products from specific vendors and saves to PostgreSQL database
 */

import { scrapeAllFoodoraCategories } from "./modules/foodora-scraper/foodora-scraper-db.service.ts";
import { FOODORA_VENDOR_TYPES } from "./modules/product/product.types.ts";
import { FOODORA_CATEGORIES_FULL } from "./foodora-categories-full.ts";

// Vendor information
const VENDOR_INFO: Record<string, { name: string; categories: typeof FOODORA_CATEGORIES_FULL }> = {
  [FOODORA_VENDOR_TYPES.BILLA_PROSEK]: {
    name: "BILLA - Praha Prosek",
    categories: FOODORA_CATEGORIES_FULL,
  },
  [FOODORA_VENDOR_TYPES.ALBERT_FLORENC]: {
    name: "Albert - Praha Florenc",
    categories: FOODORA_CATEGORIES_FULL, // Will update when Albert categories are available
  },
  [FOODORA_VENDOR_TYPES.DMART]: {
    name: "D-Mart",
    categories: FOODORA_CATEGORIES_FULL,
  },
};

const main = async (): Promise<void> => {
  console.log("\n" + "=".repeat(80));
  console.log("🛒 FOODORA MULTI-VENDOR SCRAPER - DATABASE INTEGRATION");
  console.log("=".repeat(80));

  // Parse command line arguments
  const args = process.argv.slice(2);
  const vendorArg = args.find((arg) => arg.startsWith("--vendor="));
  const vendor = vendorArg?.split("=")[1] || FOODORA_VENDOR_TYPES.DMART;

  // Validate vendor
  if (!Object.values(FOODORA_VENDOR_TYPES).includes(vendor as any)) {
    console.error(`\n❌ Invalid vendor: ${vendor}`);
    console.log("\nAvailable vendors:");
    console.log(`  --vendor=${FOODORA_VENDOR_TYPES.BILLA_PROSEK} (${VENDOR_INFO[FOODORA_VENDOR_TYPES.BILLA_PROSEK]?.name})`);
    console.log(`  --vendor=${FOODORA_VENDOR_TYPES.ALBERT_FLORENC} (${VENDOR_INFO[FOODORA_VENDOR_TYPES.ALBERT_FLORENC]?.name})`);
    console.log(`  --vendor=${FOODORA_VENDOR_TYPES.DMART} (${VENDOR_INFO[FOODORA_VENDOR_TYPES.DMART]?.name})`);
    console.log("\nExample usage:");
    console.log(`  bun src/scrape-foodora-vendor.ts --vendor=${FOODORA_VENDOR_TYPES.BILLA_PROSEK}\n`);
    process.exit(1);
  }

  const vendorInfo = VENDOR_INFO[vendor];
  
  console.log(`\nVendor: ${vendorInfo?.name || vendor} (${vendor})`);
  console.log("This script will:");
  console.log("  1. Fetch all products from selected Foodora vendor");
  console.log("  2. Save products to PostgreSQL database");
  console.log("  3. Mark all products with store='FOODORA' and vendor='${vendor}'");
  console.log("  4. Link products to their categories with vendor prefix");
  console.log("=".repeat(80) + "\n");

  try {
    await scrapeAllFoodoraCategories(vendor, vendorInfo?.categories);
    
    console.log("\n✨ Foodora scraping complete!");
    console.log("You can now query products via API:");
    console.log(`  GET /api/products?store=FOODORA&vendor=${vendor}`);
    console.log("  GET /api/products?store=FOODORA (all vendors)");
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
