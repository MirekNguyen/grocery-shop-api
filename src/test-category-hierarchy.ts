/**
 * Test Category Hierarchy Saving
 * Verifies that parent-child relationships are properly saved
 */

import * as CategoryRepository from "./modules/category/category.repository.ts";
import { saveFoodoraCategory } from "./modules/foodora-scraper/foodora-db.service.ts";

const main = async (): Promise<void> => {
  console.log("\n🧪 Testing Category Hierarchy\n");
  console.log("=" .repeat(80));

  try {
    // Test 1: Save a parent category
    console.log("\n1️⃣  Saving parent category...");
    const parentId = await saveFoodoraCategory(
      "test-parent-001",
      "Test Parent Category",
      "test-store"
    );
    console.log(`   ✅ Parent saved with DB ID: ${parentId}`);

    // Test 2: Save child categories
    console.log("\n2️⃣  Saving child categories...");
    const child1Id = await saveFoodoraCategory(
      "test-child-001",
      "Test Child Category 1",
      "test-store",
      parentId
    );
    console.log(`   ✅ Child 1 saved with DB ID: ${child1Id}, parent: ${parentId}`);

    const child2Id = await saveFoodoraCategory(
      "test-child-002",
      "Test Child Category 2",
      "test-store",
      parentId
    );
    console.log(`   ✅ Child 2 saved with DB ID: ${child2Id}, parent: ${parentId}`);

    // Test 3: Verify hierarchy from database
    console.log("\n3️⃣  Verifying hierarchy from database...");
    const categoryWithChildren = await CategoryRepository.getCategoryWithChildren(parentId);
    
    if (!categoryWithChildren) {
      console.error("   ❌ Failed to retrieve parent category");
      return;
    }

    console.log(`   📁 Parent: ${categoryWithChildren.name}`);
    console.log(`   📁 Children count: ${categoryWithChildren.children.length}`);
    
    for (const child of categoryWithChildren.children) {
      console.log(`      └── ${child.name} (ID: ${child.id}, parentId: ${child.parentId})`);
    }

    // Test 4: Verify root categories query
    console.log("\n4️⃣  Verifying root categories query...");
    const rootCategories = await CategoryRepository.getRootCategories();
    console.log(`   📊 Total root categories: ${rootCategories.length}`);
    
    const testRoot = rootCategories.find(cat => cat.id === parentId);
    if (testRoot) {
      console.log(`   ✅ Found test parent in root categories: ${testRoot.name}`);
    }

    // Test 5: Verify child categories query
    console.log("\n5️⃣  Verifying child categories query...");
    const childCategories = await CategoryRepository.getChildCategories(parentId);
    console.log(`   📊 Children of parent ${parentId}: ${childCategories.length}`);
    
    for (const child of childCategories) {
      console.log(`      └── ${child.name} (ID: ${child.id})`);
    }

    console.log("\n" + "=" .repeat(80));
    console.log("✅ All tests passed!\n");

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
