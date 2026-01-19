/**
 * Foodora Multi-Store Scraper CLI
 * Scrapes Foodora products from specific stores and saves to PostgreSQL database
 */

import { scrapeAllFoodoraCategories } from "./modules/foodora-scraper/foodora-scraper-db.service.ts";
import { STORE_TYPES, FOODORA_VENDOR_CODES } from "./modules/product/product.types.ts";
import { FOODORA_CATEGORIES_FULL } from "./foodora-categories-full.ts";
import { FOODORA_CATEGORIES_ALBERT } from "./foodora-categories-albert.ts";

// Store configuration
const STORE_CONFIG: Record<string, { 
  name: string; 
  vendorCode: string;
  storeCode: string;
  categories: typeof FOODORA_CATEGORIES_FULL;
}> = {
  [STORE_TYPES.FOODORA_BILLA_PROSEK]: {
    name: "BILLA - Praha Prosek",
    vendorCode: FOODORA_VENDOR_CODES.BILLA_PROSEK,
    storeCode: 'foodora-billa-prosek',
    categories: FOODORA_CATEGORIES_FULL,
  },
  [STORE_TYPES.FOODORA_ALBERT_FLORENC]: {
    name: "Albert - Praha Florenc",
    vendorCode: FOODORA_VENDOR_CODES.ALBERT_FLORENC,
    storeCode: 'foodora-albert-florenc',
    categories: FOODORA_CATEGORIES_ALBERT,
  },
  [STORE_TYPES.FOODORA_DMART]: {
    name: "D-Mart",
    vendorCode: FOODORA_VENDOR_CODES.DMART,
    storeCode: 'foodora-dmart',
    categories: FOODORA_CATEGORIES_FULL,
  },
};

const main = async (): Promise<void> => {
  console.log("\n" + "=".repeat(80));
  console.log("🛒 FOODORA MULTI-STORE SCRAPER - DATABASE INTEGRATION");
  console.log("=".repeat(80));

  // Parse command line arguments
  const args = process.argv.slice(2);
  const storeArg = args.find((arg) => arg.startsWith("--store="));
  const store = storeArg?.split("=")[1] || STORE_TYPES.FOODORA_DMART;

  // Validate store
  if (!Object.values(STORE_TYPES).includes(store as any)) {
    console.error(`\n❌ Invalid store: ${store}`);
    console.log("\nAvailable stores:");
    console.log(`  --store=${STORE_TYPES.FOODORA_BILLA_PROSEK} (${STORE_CONFIG[STORE_TYPES.FOODORA_BILLA_PROSEK]?.name})`);
    console.log(`  --store=${STORE_TYPES.FOODORA_ALBERT_FLORENC} (${STORE_CONFIG[STORE_TYPES.FOODORA_ALBERT_FLORENC]?.name})`);
    console.log(`  --store=${STORE_TYPES.FOODORA_DMART} (${STORE_CONFIG[STORE_TYPES.FOODORA_DMART]?.name})`);
    console.log("\nExample usage:");
    console.log(`  bun src/scrape-foodora-store.ts --store=${STORE_TYPES.FOODORA_BILLA_PROSEK}\n`);
    process.exit(1);
  }

  const config = STORE_CONFIG[store];
  
  if (!config) {
    console.error(`\n❌ No configuration found for store: ${store}\n`);
    process.exit(1);
  }
  
  console.log(`\nStore: ${config.name} (${store})`);
  console.log("This script will:");
  console.log("  1. Fetch all products from selected Foodora store");
  console.log("  2. Save products to PostgreSQL database");
  console.log(`  3. Mark all products with store='${store}'`);
  console.log("  4. Link products to their categories with store prefix");
  console.log("=".repeat(80) + "\n");

  try {
    await scrapeAllFoodoraCategories(
      store,
      config.vendorCode,
      config.storeCode,
      config.categories
    );
    
    console.log("\n✨ Foodora scraping complete!");
    console.log("You can now query products via API:");
    console.log(`  GET /api/products?store=${store}`);
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
