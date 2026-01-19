/**
 * Test that parentId is preserved during product saving
 */

import { scrapeFoodoraCategory } from "./modules/foodora-scraper/foodora-scraper-db.service.ts";
import { FOODORA_CATEGORIES_FULL } from "./foodora-categories-full.ts";
import { STORE_TYPES, FOODORA_VENDOR_CODES } from "./modules/product/product.types.ts";
import * as CategoryRepository from "./modules/category/category.repository.ts";

const main = async (): Promise<void> => {
  console.log("\n🧪 Testing parentId preservation during scraping\n");
  console.log("=" .repeat(80));

  // Find a category with children
  const testCategory = FOODORA_CATEGORIES_FULL.find(
    cat => cat.children && cat.children.length > 0
  );

  if (!testCategory) {
    console.error("❌ No category with children found");
    return;
  }

  console.log(`\n📦 Test Category: ${testCategory.name}`);
  console.log(`   Children: ${testCategory.children?.length || 0}`);

  try {
    console.log("\n1️⃣  Scraping category (this will save hierarchy and products)...\n");
    
    await scrapeFoodoraCategory(
      testCategory,
      STORE_TYPES.FOODORA_BILLA_PROSEK,
      FOODORA_VENDOR_CODES.BILLA_PROSEK,
      'foodora-billa-prosek'
    );

    console.log("\n2️⃣  Checking if parentId was preserved...\n");

    // Get the parent category from database
    const parentCategory = await CategoryRepository.findCategoryByKey(
      `foodora-billa-prosek-${testCategory.id}`
    );

    if (!parentCategory) {
      console.error("❌ Parent category not found in database");
      return;
    }

    console.log(`   ✅ Parent category found: ${parentCategory.name} (ID: ${parentCategory.id})`);
    console.log(`      parentId: ${parentCategory.parentId}`);

    // Get all child categories
    const childCategories = await CategoryRepository.getChildCategories(parentCategory.id);
    
    console.log(`\n   Found ${childCategories.length} child categories:`);

    let allHaveCorrectParentId = true;

    for (const child of childCategories) {
      const hasCorrectParentId = child.parentId === parentCategory.id;
      const status = hasCorrectParentId ? "✅" : "❌";
      
      console.log(`      ${status} ${child.name}`);
      console.log(`         parentId: ${child.parentId} (expected: ${parentCategory.id})`);

      if (!hasCorrectParentId) {
        allHaveCorrectParentId = false;
      }
    }

    console.log("\n" + "=" .repeat(80));
    
    if (allHaveCorrectParentId && childCategories.length > 0) {
      console.log("✅ TEST PASSED!");
      console.log(`   All ${childCategories.length} child categories have correct parentId`);
    } else if (childCategories.length === 0) {
      console.log("⚠️  No child categories found (might be normal if API didn't return any)");
    } else {
      console.log("❌ TEST FAILED!");
      console.log("   Some child categories have incorrect parentId");
    }
    
    console.log("=" .repeat(80) + "\n");

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
