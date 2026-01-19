/**
 * Test API with Real Foodora Categories
 * Verifies hierarchy works with actual scraped Foodora data
 */

import * as CategoryController from "./modules/category/category.controller.api.ts";

const main = async (): Promise<void> => {
  console.log("\n🧪 Testing API with Real Foodora Categories\n");
  console.log("=" .repeat(80));

  try {
    console.log("\n1️⃣  Calling API endpoint for FOODORA_DMART store...");
    const apiResponse = await CategoryController.getCategories("FOODORA_DMART");

    const foodoraCategories = apiResponse.FOODORA_DMART || [];
    
    console.log(`   ✅ Found ${foodoraCategories.length} root categories`);

    console.log("\n2️⃣  Checking for categories with subcategories...");
    
    const categoriesWithSubs = foodoraCategories.filter(
      cat => cat.subcategories && cat.subcategories.length > 0
    );

    console.log(`   ✅ Found ${categoriesWithSubs.length} categories with subcategories`);

    if (categoriesWithSubs.length === 0) {
      console.log("\n   ⚠️  No categories with subcategories found.");
      console.log("   This might be because:");
      console.log("   • The database hasn't been scraped yet");
      console.log("   • Categories were scraped before the hierarchy update");
      console.log("\n   Run: bun src/scrape-foodora-to-db.ts");
      console.log("   To scrape categories with hierarchy support\n");
      return;
    }

    console.log("\n3️⃣  Sample categories with subcategories:\n");

    // Show first 5 categories with subcategories
    const samplesToShow = Math.min(5, categoriesWithSubs.length);
    
    for (let i = 0; i < samplesToShow; i++) {
      const category = categoriesWithSubs[i];
      console.log(`   📁 ${category.name} (${category.productCount} products)`);
      console.log(`      Key: ${category.key}`);
      console.log(`      Subcategories: ${category.subcategories?.length || 0}`);
      
      if (category.subcategories) {
        category.subcategories.forEach((sub, idx) => {
          const isLast = idx === category.subcategories!.length - 1;
          const prefix = isLast ? "      └──" : "      ├──";
          console.log(`${prefix} ${sub.name} (${sub.productCount} products)`);
        });
      }
      console.log("");
    }

    // Calculate statistics
    console.log("4️⃣  Hierarchy Statistics:\n");
    
    let totalSubcategories = 0;
    let maxSubcategories = 0;
    let categoryWithMostSubs = null;

    for (const category of categoriesWithSubs) {
      const subCount = category.subcategories?.length || 0;
      totalSubcategories += subCount;
      
      if (subCount > maxSubcategories) {
        maxSubcategories = subCount;
        categoryWithMostSubs = category.name;
      }
    }

    const avgSubcategories = totalSubcategories / categoriesWithSubs.length;

    console.log(`   Total root categories: ${foodoraCategories.length}`);
    console.log(`   Categories with subcategories: ${categoriesWithSubs.length}`);
    console.log(`   Total subcategories: ${totalSubcategories}`);
    console.log(`   Average subcategories per parent: ${avgSubcategories.toFixed(2)}`);
    console.log(`   Max subcategories: ${maxSubcategories} (in "${categoryWithMostSubs}")`);

    console.log("\n5️⃣  Validating response structure...\n");
    
    let allValid = true;

    for (const category of categoriesWithSubs) {
      // Check parent structure
      if (!category.subcategories || !Array.isArray(category.subcategories)) {
        console.log(`   ❌ ${category.name}: subcategories is not an array`);
        allValid = false;
        continue;
      }

      // Check each subcategory
      for (const sub of category.subcategories) {
        if (sub.parentId !== category.id) {
          console.log(`   ❌ ${sub.name}: parentId (${sub.parentId}) doesn't match parent category id (${category.id})`);
          allValid = false;
        }

        if (!sub.productCount && sub.productCount !== 0) {
          console.log(`   ❌ ${sub.name}: missing productCount`);
          allValid = false;
        }

        if (sub.store !== category.store) {
          console.log(`   ❌ ${sub.name}: store mismatch with parent`);
          allValid = false;
        }
      }
    }

    if (allValid) {
      console.log(`   ✅ All ${categoriesWithSubs.length} parent categories have valid structure`);
      console.log(`   ✅ All ${totalSubcategories} subcategories have correct parentId`);
      console.log(`   ✅ All subcategories have productCount field`);
      console.log(`   ✅ All subcategories inherit parent store`);
    }

    console.log("\n" + "=" .repeat(80));
    
    if (allValid && categoriesWithSubs.length > 0) {
      console.log("✅ API hierarchy test PASSED!");
      console.log("\n📋 Summary:");
      console.log(`   • ${foodoraCategories.length} root categories found`);
      console.log(`   • ${categoriesWithSubs.length} categories have subcategories`);
      console.log(`   • ${totalSubcategories} total subcategories properly nested`);
      console.log(`   • All structure validations passed`);
      console.log(`   • Frontend can consume the API ✨`);
    } else if (!allValid) {
      console.log("❌ API hierarchy test FAILED!");
      console.log("   Some validation errors found");
    } else {
      console.log("⚠️  No test data available");
      console.log("   Run the scraper first to populate categories");
    }
    
    console.log("=" .repeat(80) + "\n");

  } catch (error) {
    console.error("\n❌ Test failed with error:");
    console.error(error);
    console.error("=" .repeat(80) + "\n");
    process.exit(1);
  }
};

if (import.meta.main) {
  main();
}
