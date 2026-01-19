/**
 * Scrape All Foodora Stores
 * Scrapes all configured Foodora stores in sequence
 */

import { scrapeAllFoodoraCategories } from "./modules/foodora-scraper/foodora-scraper-db.service.ts";
import { STORE_TYPES, FOODORA_VENDOR_CODES } from "./modules/product/product.types.ts";
import { FOODORA_CATEGORIES_FULL } from "./foodora-categories-full.ts";
import { FOODORA_CATEGORIES_ALBERT } from "./foodora-categories-albert.ts";

const STORES_TO_SCRAPE = [
  {
    store: STORE_TYPES.FOODORA_BILLA_PROSEK,
    vendorCode: FOODORA_VENDOR_CODES.BILLA_PROSEK,
    storeCode: 'foodora-billa-prosek',
    categories: FOODORA_CATEGORIES_FULL,
    name: "BILLA Praha Prosek",
  },
  {
    store: STORE_TYPES.FOODORA_ALBERT_FLORENC,
    vendorCode: FOODORA_VENDOR_CODES.ALBERT_FLORENC,
    storeCode: 'foodora-albert-florenc',
    categories: FOODORA_CATEGORIES_ALBERT,
    name: "Albert Praha Florenc",
  },
];

const main = async (): Promise<void> => {
  console.log("\n" + "=".repeat(80));
  console.log("🛒 SCRAPE ALL FOODORA STORES - DATABASE INTEGRATION");
  console.log("=".repeat(80));
  console.log(`\nThis will scrape ${STORES_TO_SCRAPE.length} Foodora stores:`);
  
  STORES_TO_SCRAPE.forEach((config, idx) => {
    console.log(`  ${idx + 1}. ${config.name} (${config.store})`);
  });
  
  console.log("\n" + "=".repeat(80) + "\n");

  const results: { store: string; success: boolean; productCount?: number }[] = [];

  for (let i = 0; i < STORES_TO_SCRAPE.length; i++) {
    const config = STORES_TO_SCRAPE[i]!;
    
    console.log(`\n[${ i + 1 }/${ STORES_TO_SCRAPE.length }] Starting: ${config.name}`);
    console.log("─".repeat(80));

    try {
      await scrapeAllFoodoraCategories(
        config.store,
        config.vendorCode,
        config.storeCode,
        config.categories
      );
      
      results.push({
        store: config.name,
        success: true,
      });
      
      console.log(`✅ ${config.name} completed successfully!`);
      
    } catch (error) {
      console.error(`❌ ${config.name} failed:`, error);
      results.push({
        store: config.name,
        success: false,
      });
    }

    // Delay between stores to avoid rate limiting
    if (i < STORES_TO_SCRAPE.length - 1) {
      console.log("\n⏸️  Waiting 5 seconds before next store...");
      await new Promise(resolve => setTimeout(resolve, 5000));
    }
  }

  // Print summary
  console.log("\n\n" + "=".repeat(80));
  console.log("📊 SCRAPING SUMMARY");
  console.log("=".repeat(80));
  
  const successCount = results.filter(r => r.success).length;
  const failCount = results.filter(r => !r.success).length;
  
  console.log(`\nTotal stores: ${STORES_TO_SCRAPE.length}`);
  console.log(`Successful: ${successCount}`);
  console.log(`Failed: ${failCount}`);
  
  console.log("\nResults:");
  results.forEach(result => {
    const status = result.success ? "✅" : "❌";
    console.log(`  ${status} ${result.store}`);
  });

  if (successCount > 0) {
    console.log("\n✨ You can now query products via API:");
    console.log(`  GET /api/products?store=${STORE_TYPES.FOODORA_BILLA_PROSEK}`);
    console.log(`  GET /api/products?store=${STORE_TYPES.FOODORA_ALBERT_FLORENC}`);
    console.log("  GET /api/categories");
    console.log("  GET /api/products (all stores)");
  }
  
  console.log("\n" + "=".repeat(80) + "\n");

  if (failCount > 0) {
    process.exit(1);
  }
};

if (import.meta.main) {
  main();
}
