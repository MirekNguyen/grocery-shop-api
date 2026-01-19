/**
 * Test API Category Hierarchy Response
 * Verifies that the API returns categories with subcategories properly nested
 */

import * as CategoryController from "./modules/category/category.controller.api.ts";
import { saveFoodoraCategory } from "./modules/foodora-scraper/foodora-db.service.ts";
import * as ProductRepository from "./modules/product/product.repository.ts";
import * as ProductCategoriesRepository from "./modules/category/product-categories.repository.ts";
import type { NewProduct } from "./modules/product/product.schema.ts";

const main = async (): Promise<void> => {
  console.log("\n🧪 Testing API Category Hierarchy Response\n");
  console.log("=" .repeat(80));

  try {
    // Step 1: Create test category hierarchy
    console.log("\n1️⃣  Creating test category hierarchy...");
    
    const parentId = await saveFoodoraCategory(
      "test-api-parent-001",
      "Test Parent Category API",
      "test-api-store"
    );
    console.log(`   ✅ Parent created (DB ID: ${parentId})`);

    const child1Id = await saveFoodoraCategory(
      "test-api-child-001",
      "Test Child 1 API",
      "test-api-store",
      parentId
    );
    console.log(`   ✅ Child 1 created (DB ID: ${child1Id})`);

    const child2Id = await saveFoodoraCategory(
      "test-api-child-002",
      "Test Child 2 API",
      "test-api-store",
      parentId
    );
    console.log(`   ✅ Child 2 created (DB ID: ${child2Id})`);

    const child3Id = await saveFoodoraCategory(
      "test-api-child-003",
      "Test Child 3 API",
      "test-api-store",
      parentId
    );
    console.log(`   ✅ Child 3 created (DB ID: ${child3Id})`);

    // Step 2: Add some test products to categories
    console.log("\n2️⃣  Adding test products to categories...");
    
    const parentProduct: NewProduct = {
      store: "TEST_API_STORE",
      productId: "test-parent-product-001",
      sku: "test-parent-sku-001",
      slug: "test-parent-product",
      name: "Test Parent Product",
      descriptionShort: "Test product in parent category",
      descriptionLong: null,
      regulatedProductName: null,
      category: "Test Parent Category API",
      categorySlug: "test-api-store-test-parent-category-api",
      brand: null,
      brandSlug: null,
      price: 10000,
      pricePerUnit: null,
      unitPrice: null,
      regularPrice: 10000,
      discountPrice: null,
      lowestPrice: null,
      inPromotion: false,
      amount: null,
      weight: null,
      packageLabel: null,
      packageLabelKey: null,
      volumeLabelKey: null,
      volumeLabelShort: null,
      baseUnitLong: null,
      baseUnitShort: null,
      images: [],
      productMarketing: null,
      brandMarketing: null,
      published: true,
      medical: false,
      weightArticle: false,
    };

    const savedParentProduct = await ProductRepository.upsertProduct(parentProduct);
    await ProductCategoriesRepository.linkProductToCategories(savedParentProduct.id, [parentId]);
    console.log(`   ✅ Added 1 product to parent category`);

    // Add 2 products to child 1
    for (let i = 1; i <= 2; i++) {
      const childProduct: NewProduct = {
        ...parentProduct,
        productId: `test-child1-product-${i}`,
        sku: `test-child1-sku-${i}`,
        name: `Test Child 1 Product ${i}`,
        category: "Test Child 1 API",
        categorySlug: "test-api-store-test-child-1-api",
      };
      const saved = await ProductRepository.upsertProduct(childProduct);
      await ProductCategoriesRepository.linkProductToCategories(saved.id, [child1Id]);
    }
    console.log(`   ✅ Added 2 products to child 1`);

    // Add 3 products to child 2
    for (let i = 1; i <= 3; i++) {
      const childProduct: NewProduct = {
        ...parentProduct,
        productId: `test-child2-product-${i}`,
        sku: `test-child2-sku-${i}`,
        name: `Test Child 2 Product ${i}`,
        category: "Test Child 2 API",
        categorySlug: "test-api-store-test-child-2-api",
      };
      const saved = await ProductRepository.upsertProduct(childProduct);
      await ProductCategoriesRepository.linkProductToCategories(saved.id, [child2Id]);
    }
    console.log(`   ✅ Added 3 products to child 2`);

    // Add 1 product to child 3
    const child3Product: NewProduct = {
      ...parentProduct,
      productId: `test-child3-product-1`,
      sku: `test-child3-sku-1`,
      name: `Test Child 3 Product 1`,
      category: "Test Child 3 API",
      categorySlug: "test-api-store-test-child-3-api",
    };
    const savedChild3 = await ProductRepository.upsertProduct(child3Product);
    await ProductCategoriesRepository.linkProductToCategories(savedChild3.id, [child3Id]);
    console.log(`   ✅ Added 1 product to child 3`);

    // Step 3: Call API endpoint and verify response
    console.log("\n3️⃣  Calling API endpoint (getCategories)...");
    const apiResponse = await CategoryController.getCategories();

    // Step 4: Find our test category in response
    console.log("\n4️⃣  Verifying API response structure...");
    
    const allStores = Object.keys(apiResponse);
    console.log(`   📊 Found ${allStores.length} stores in response`);

    let foundTestCategory = false;
    let testCategoryData = null;

    for (const store of allStores) {
      const categories = apiResponse[store];
      
      for (const category of categories) {
        if (category.name === "Test Parent Category API") {
          foundTestCategory = true;
          testCategoryData = category;
          break;
        }
      }
      
      if (foundTestCategory) break;
    }

    if (!foundTestCategory || !testCategoryData) {
      console.error("   ❌ Test category not found in API response");
      return;
    }

    console.log(`   ✅ Found test category in API response`);

    // Step 5: Verify the hierarchy structure
    console.log("\n5️⃣  Verifying category hierarchy in API response...");
    console.log(`\n   📁 ${testCategoryData.name}`);
    console.log(`      Store: ${testCategoryData.store}`);
    console.log(`      Product Count: ${testCategoryData.productCount}`);
    console.log(`      Has subcategories: ${testCategoryData.subcategories ? 'YES' : 'NO'}`);

    if (!testCategoryData.subcategories) {
      console.error("   ❌ Subcategories missing from API response!");
      return;
    }

    console.log(`      Subcategories count: ${testCategoryData.subcategories.length}`);
    
    if (testCategoryData.subcategories.length !== 3) {
      console.error(`   ❌ Expected 3 subcategories, got ${testCategoryData.subcategories.length}`);
      return;
    }

    console.log(`\n   Subcategories:`);
    for (const subcategory of testCategoryData.subcategories) {
      console.log(`      └── ${subcategory.name}`);
      console.log(`          Product Count: ${subcategory.productCount}`);
      console.log(`          Parent ID: ${subcategory.parentId}`);
      console.log(`          Store: ${subcategory.store}`);
    }

    // Step 6: Verify product counts
    console.log("\n6️⃣  Verifying product counts...");
    
    const expectedCounts = {
      "Test Parent Category API": 1,
      "Test Child 1 API": 2,
      "Test Child 2 API": 3,
      "Test Child 3 API": 1,
    };

    const parentCountMatch = testCategoryData.productCount === expectedCounts["Test Parent Category API"];
    console.log(`   Parent count: ${testCategoryData.productCount} ${parentCountMatch ? '✅' : '❌'}`);

    let allCountsMatch = parentCountMatch;

    for (const subcategory of testCategoryData.subcategories) {
      const expectedCount = expectedCounts[subcategory.name];
      const matches = subcategory.productCount === expectedCount;
      allCountsMatch = allCountsMatch && matches;
      console.log(`   ${subcategory.name}: ${subcategory.productCount} ${matches ? '✅' : '❌ (expected ' + expectedCount + ')'}`);
    }

    // Step 7: Verify TypeScript type structure
    console.log("\n7️⃣  Verifying TypeScript type structure...");
    
    const typeChecks = {
      "Parent has id": typeof testCategoryData.id === "number",
      "Parent has name": typeof testCategoryData.name === "string",
      "Parent has productCount": typeof testCategoryData.productCount === "number",
      "Parent has store": typeof testCategoryData.store === "string",
      "Parent has subcategories array": Array.isArray(testCategoryData.subcategories),
      "Child has parentId": typeof testCategoryData.subcategories[0].parentId === "number",
    };

    for (const [check, passed] of Object.entries(typeChecks)) {
      console.log(`   ${check}: ${passed ? '✅' : '❌'}`);
    }

    const allTypeChecksPassed = Object.values(typeChecks).every(v => v === true);

    // Final result
    console.log("\n" + "=" .repeat(80));
    
    if (foundTestCategory && testCategoryData.subcategories.length === 3 && allCountsMatch && allTypeChecksPassed) {
      console.log("✅ All tests PASSED!");
      console.log("\n📋 Summary:");
      console.log(`   • Parent category returned with correct structure`);
      console.log(`   • 3 subcategories properly nested`);
      console.log(`   • Product counts accurate for all categories`);
      console.log(`   • TypeScript types match expected structure`);
      console.log(`   • API ready for frontend consumption`);
    } else {
      console.log("❌ Some tests FAILED!");
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
