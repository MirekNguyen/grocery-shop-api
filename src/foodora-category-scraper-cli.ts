/**
 * Foodora Category Scraper CLI
 * Example usage for scraping all products from categories
 */

import {
  scrapeCategoryProducts,
  scrapeCategoryTree,
  saveAllCategoriesToSingleFile,
  saveAllCategories,
} from "./modules/foodora-scraper/foodora-category-scraper.service.ts";
import type { CategoryDefinition } from "./modules/foodora-scraper/foodora-category.types.ts";

// ============================================================================
// Category Definitions (from your data)
// ============================================================================

const FOODORA_CATEGORIES: CategoryDefinition[] = [
  {
    id: "bfb333d8-9828-485e-a91d-513b1832c2d5",
    name: "Více za méně",
    numberOfProducts: 33,
    type: "DEFAULT",
  },
  {
    id: "971c4780-14f9-4df1-87c5-6386e0e0bc02",
    name: "Ovoce a zelenina",
    numberOfProducts: 120,
    type: "DEFAULT",
    children: [
      { id: "12f0aeb7-55d3-4c81-92f7-00babe0d1532", name: "Ovoce", numberOfProducts: 39, type: "DEFAULT" },
      { id: "2a65c386-468e-4db8-941e-7552d9b581ad", name: "Zelenina", numberOfProducts: 68, type: "DEFAULT" },
      { id: "8dff2a81-169f-48fb-b574-e186dc7636bd", name: "Sušené ovoce", numberOfProducts: 4, type: "DEFAULT" },
      { id: "d3d7a881-1fdc-458f-8d66-82d31e72f4ce", name: "Bylinky", numberOfProducts: 9, type: "DEFAULT" },
    ],
  },
  {
    id: "df53bb08-ddd6-4ff4-9284-edaef4ebe4c2",
    name: "Pečivo",
    numberOfProducts: 214,
    type: "DEFAULT",
    children: [
      { id: "fb5f7206-b4cc-4b93-a719-71447fa29fdc", name: "Slané pečivo", numberOfProducts: 40, type: "DEFAULT" },
      { id: "bbb93207-23f9-4c94-b43f-52874b09aef4", name: "Sladké pečivo", numberOfProducts: 24, type: "DEFAULT" },
      { id: "984ba667-4528-4dff-b789-9e06ecb789c1", name: "Balené slané pečivo", numberOfProducts: 37, type: "DEFAULT" },
      { id: "a0762cca-a669-4293-8cfd-85bfeb33224a", name: "Balené sladké pečivo", numberOfProducts: 75, type: "DEFAULT" },
      { id: "cc8ebfbd-e831-4b9a-a131-f9a764bc1e8c", name: "Tortily", numberOfProducts: 8, type: "DEFAULT" },
      { id: "473c87b5-b8c8-49f3-b609-42ca66a98e2d", name: "Bezlepkové pečivo", numberOfProducts: 3, type: "DEFAULT" },
      { id: "6a5db074-ce22-4a4c-b6aa-4ebd3e322524", name: "Racio a knackebrot", numberOfProducts: 27, type: "DEFAULT" },
    ],
  },
  {
    id: "8d101a5c-84cb-4d02-8247-a47d423d4691",
    name: "Maso a uzeniny",
    numberOfProducts: 158,
    type: "DEFAULT",
    children: [
      { id: "aef9f1fe-ffe4-4754-8f27-4bb8359e2427", name: "Drůbež", numberOfProducts: 16, type: "DEFAULT" },
      { id: "e6766cce-fcf8-4413-8b10-86709c20ab40", name: "Hovězí maso", numberOfProducts: 2, type: "DEFAULT" },
      { id: "06eb14b2-4c7a-4f58-9ee4-ecfa23dae3a8", name: "Vepřové maso", numberOfProducts: 8, type: "DEFAULT" },
      { id: "da1c17cd-b4f9-4dff-8b4e-a6f1b4bda241", name: "Ryby", numberOfProducts: 5, type: "DEFAULT" },
      { id: "61cae41c-8f52-49a1-8485-b0f1e1faac43", name: "Tofu", numberOfProducts: 4, type: "DEFAULT" },
      { id: "7771d1cb-bff9-414c-b535-2d11ae1ae617", name: "Uzeniny", numberOfProducts: 92, type: "DEFAULT" },
      { id: "80a27e69-8f7e-491c-8b2d-76bdeeb6d1cb", name: "Šunky", numberOfProducts: 31, type: "DEFAULT" },
    ],
  },
  {
    id: "0c57d66b-a727-4094-887f-390e24957b2b",
    name: "Nápoje",
    numberOfProducts: 933,
    type: "DEFAULT",
    children: [
      { id: "0c116049-80bb-406d-bfc3-8311c54f810c", name: "Vody a minerálky", numberOfProducts: 47, type: "DEFAULT" },
      { id: "bbcf2097-bf7f-4df0-8b7a-260094fc1b54", name: "Ochucené vody a minerálky", numberOfProducts: 88, type: "DEFAULT" },
      { id: "30686a28-60ab-49e2-a837-83b93b3077d9", name: "Kolové nápoje a limonády", numberOfProducts: 100, type: "DEFAULT" },
      { id: "1ad2f840-6492-4f69-bb36-8c3ff0122ccc", name: "Energetické i iontové nápoje", numberOfProducts: 94, type: "DEFAULT" },
      { id: "6839d410-2dfa-41f1-8296-d3466f983e40", name: "Džusy a ovocné nápoje", numberOfProducts: 185, type: "DEFAULT" },
      { id: "61f6dc10-4b28-466d-976e-9559255e2b08", name: "Ledové čaje a kombuchy", numberOfProducts: 41, type: "DEFAULT" },
      { id: "c835234a-cdde-444e-9efc-8c8cc70f617b", name: "Sirupy a šťávy", numberOfProducts: 59, type: "DEFAULT" },
      { id: "7e272665-d511-4a89-8e07-cea03407688a", name: "Ledové kávy", numberOfProducts: 7, type: "DEFAULT" },
      { id: "941237bc-db20-4144-b39a-fd0a9b530397", name: "Káva", numberOfProducts: 183, type: "DEFAULT" },
      { id: "48a47035-5282-42a2-81c7-9d26ef83d919", name: "Čaj a kakao", numberOfProducts: 126, type: "DEFAULT" },
      { id: "f720ecc7-e39e-4942-8796-6257a02013c0", name: "Nealkoholické šampaňské", numberOfProducts: 3, type: "DEFAULT" },
    ],
  },
  // Add more categories as needed...
];

// ============================================================================
// Main Function
// ============================================================================

const main = async (): Promise<void> => {
  try {
    console.log("=".repeat(80));
    console.log("🛒 Foodora Category Scraper");
    console.log("=".repeat(80));

    // Example 1: Scrape a single category
    console.log("\n📦 Example 1: Scraping single category (Drůbež)...\n");
    const poultryProducts = await scrapeCategoryProducts(
      "aef9f1fe-ffe4-4754-8f27-4bb8359e2427"
    );
    console.log(`✅ Found ${poultryProducts.length} products in Drůbež category`);
    console.log(`   First product: ${poultryProducts[0]?.name ?? "N/A"}`);

    // Example 2: Scrape entire category tree with progress
    console.log("\n📦 Example 2: Scraping category tree (Maso a uzeniny)...\n");
    
    const meatCategory = FOODORA_CATEGORIES.find(
      (cat) => cat.id === "8d101a5c-84cb-4d02-8247-a47d423d4691"
    );

    if (meatCategory) {
      const results = await scrapeCategoryTree(
        [meatCategory],
        undefined,
        undefined,
        (current, total, categoryName) => {
          console.log(`   [${current}/${total}] Scraping: ${categoryName}`);
        }
      );

      const totalProducts = Object.values(results).reduce(
        (sum, products) => sum + products.length,
        0
      );

      console.log(`\n✅ Scraped ${totalProducts} total products from ${Object.keys(results).length} categories`);

      // Save to file
      await saveAllCategoriesToSingleFile(results, "output/maso-uzeniny-products.json");
      console.log("💾 Saved to: output/maso-uzeniny-products.json");
    }

    // Example 3: Scrape ALL categories (commented out by default)
    /*
    console.log("\n📦 Example 3: Scraping ALL categories...\n");
    const allResults = await scrapeCategoryTree(
      FOODORA_CATEGORIES,
      undefined,
      undefined,
      (current, total, categoryName) => {
        console.log(`   [${current}/${total}] ${categoryName}`);
      }
    );

    const grandTotal = Object.values(allResults).reduce(
      (sum, products) => sum + products.length,
      0
    );

    console.log(`\n✅ Scraped ${grandTotal} total products from ${Object.keys(allResults).length} categories`);

    // Save all to single file
    await saveAllCategoriesToSingleFile(allResults, "output/all-foodora-products.json");
    console.log("💾 Saved all products to: output/all-foodora-products.json");

    // Or save to individual files per category
    await saveAllCategories(allResults, "output/scraped-categories");
    console.log("💾 Saved individual category files to: output/scraped-categories/");
    */

    console.log("\n" + "=".repeat(80));
    console.log("✨ Scraping completed successfully!");
    console.log("=".repeat(80) + "\n");
  } catch (error) {
    console.error("\n❌ Error scraping categories:");
    console.error("-".repeat(80));
    console.error(error);
    console.error("-".repeat(80) + "\n");
    throw error;
  }
};

// Run if this file is executed directly
if (import.meta.main) {
  main();
}
