/**
 * Debug Category API
 * Test file to debug category API responses
 */

import { fetchCategoryProducts } from "./modules/foodora-scraper/foodora-category-api.service.ts";

const main = async (): Promise<void> => {
  try {
    console.log("Testing category API with ID: aef9f1fe-ffe4-4754-8f27-4bb8359e2427");
    console.log("=".repeat(80));
    
    const response = await fetchCategoryProducts("aef9f1fe-ffe4-4754-8f27-4bb8359e2427");
    
    console.log("\n✅ Success!");
    console.log("Response:", JSON.stringify(response, null, 2));
    
  } catch (error) {
    console.error("\n❌ Error:");
    console.error(error);
  }
};

if (import.meta.main) {
  main();
}
