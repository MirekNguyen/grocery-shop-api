/**
 * Test Foodora Category Hierarchy Scraping
 * Tests one category with children to verify hierarchy is saved
 */

import { scrapeFoodoraCategory } from "./modules/foodora-scraper/foodora-scraper-db.service.ts";
import { FOODORA_CATEGORIES_FULL } from "./foodora-categories-full.ts";
import { STORE_TYPES, FOODORA_VENDOR_CODES } from "./modules/product/product.types.ts";
import * as CategoryRepository from "./modules/category/category.repository.ts";

const main = async (): Promise<void> => {
  console.log("\n🧪 Testing Foodora Category Hierarchy Scraping\n");
  console.log("=" .repeat(80));

  // Find a category with children (e.g., "Ovoce a zelenina")
  const testCategory = FOODORA_CATEGORIES_FULL.find(
    cat => cat.id === "971c4780-14f9-4df1-87c5-6386e0e0bc02"
  );

  if (!testCategory) {
    console.error("❌ Test category not found");
    return;
  }

  console.log(`\n📦 Test Category: ${testCategory.name}`);
  console.log(`   ID: ${testCategory.id}`);
  console.log(`   Predefined children: ${testCategory.children?.length || 0}`);
  
  if (testCategory.children) {
    for (const child of testCategory.children) {
      console.log(`      └── ${child.name} (${child.id})`);
    }
  }

  console.log("\n" + "=" .repeat(80));
  console.log("Starting scrape...\n");

  try {
    // Scrape the category (this will save hierarchy and products)
    const productCount = await scrapeFoodoraCategory(
      testCategory,
      STORE_TYPES.FOODORA_DMART,
      FOODORA_VENDOR_CODES.DMART,
      'foodora-dmart'
    );

    console.log("\n" + "=" .repeat(80));
    console.log(`✅ Scraping complete! Saved ${productCount} products`);

    // Verify the hierarchy was saved
    console.log("\n🔍 Verifying saved hierarchy...");
    
    const savedCategories = await CategoryRepository.findAllCategories();
    const parentCategory = savedCategories.find(
      cat => cat.key === `foodora-dmart-${testCategory.id}`
    );

    if (!parentCategory) {
      console.error("❌ Parent category not found in database");
      return;
    }

    console.log(`\n📁 Parent Category (DB): ${parentCategory.name} (ID: ${parentCategory.id})`);

    const children = await CategoryRepository.getChildCategories(parentCategory.id);
    console.log(`   Children in database: ${children.length}`);
    
    for (const child of children) {
      console.log(`      └── ${child.name} (DB ID: ${child.id}, parentId: ${child.parentId})`);
    }

    console.log("\n" + "=" .repeat(80));
    console.log("✅ Test completed successfully!\n");

  } catch (error) {
    console.error("\n❌ Test failed:");
    console.error(error);
    console.error("=" .repeat(80) + "\n");
    process.exit(1);
  }
};

if (import.meta.main) {
  main();
}
