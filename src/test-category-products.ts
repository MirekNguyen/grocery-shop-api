/**
 * Test that querying by parent category returns products from subcategories
 */

import * as ProductController from "./modules/product/product.controller.api.ts";
import * as CategoryController from "./modules/category/category.controller.api.ts";

const main = async (): Promise<void> => {
  console.log("\n🧪 Testing Category Product Query (Parent + Subcategories)\n");
  console.log("=".repeat(80));

  const store = "FOODORA_BILLA_PROSEK";
  
  // Get categories to find a parent with subcategories
  console.log("\n1️⃣  Fetching categories...");
  const categoryResponse = await CategoryController.getCategories(store);
  const categories = categoryResponse[store] || [];
  
  // Find a category with subcategories
  const parentCategory = categories.find(
    c => c.subcategories && c.subcategories.length > 0
  );
  
  if (!parentCategory) {
    console.log("❌ No parent categories with subcategories found");
    return;
  }
  
  console.log(`   ✅ Found parent category: "${parentCategory.name}"`);
  console.log(`   • Total products (including subcategories): ${parentCategory.productCount}`);
  console.log(`   • Number of subcategories: ${parentCategory.subcategories!.length}`);
  console.log(`   • Category slug: ${parentCategory.key}`);
  
  console.log("\n   Subcategories:");
  parentCategory.subcategories!.forEach((sub, idx) => {
    console.log(`   ${idx + 1}. ${sub.name} (${sub.productCount} products)`);
  });
  
  // Query products by parent category
  console.log(`\n2️⃣  Querying products for parent category "${parentCategory.name}"...`);
  
  const productResponse = await ProductController.getProducts({
    store,
    category: parentCategory.key,
    limit: 1000,
  });
  
  console.log(`   ✅ Found ${productResponse.data.length} products`);
  console.log(`   • Total in pagination: ${productResponse.pagination.total}`);
  
  // Verify the count matches the category productCount
  const expectedCount = parentCategory.productCount;
  const actualCount = productResponse.pagination.total;
  
  console.log("\n3️⃣  Verification:");
  console.log(`   Expected products: ${expectedCount} (from category API)`);
  console.log(`   Actual products: ${actualCount} (from products API)`);
  
  if (actualCount === expectedCount) {
    console.log("   ✅ Counts match perfectly!");
  } else if (actualCount === 0) {
    console.log("   ❌ NO PRODUCTS FOUND - The fix didn't work!");
  } else if (actualCount < expectedCount) {
    console.log(`   ⚠️  Found ${actualCount} products but expected ${expectedCount}`);
    console.log("   This might be due to pagination limits or data inconsistency");
  } else {
    console.log(`   ⚠️  Found MORE products than expected (${actualCount} > ${expectedCount})`);
  }
  
  // Show sample products and their categories
  console.log(`\n4️⃣  Sample products (first 5):`);
  
  const samplesToShow = Math.min(5, productResponse.data.length);
  
  for (let i = 0; i < samplesToShow; i++) {
    const product = productResponse.data[i];
    console.log(`\n   ${i + 1}. ${product.name}`);
    console.log(`      Price: ${product.price} ${product.currency || 'CZK'}`);
    console.log(`      Categories: ${product.categories.map(c => c.name).join(', ')}`);
  }
  
  // Verify products are from parent or subcategories
  console.log(`\n5️⃣  Validating products belong to correct categories...`);
  
  const parentSlug = parentCategory.key;
  const subcategorySlugs = parentCategory.subcategories!.map(sub => sub.key);
  const allAllowedSlugs = [parentSlug, ...subcategorySlugs];
  
  let validCount = 0;
  let invalidCount = 0;
  
  for (const product of productResponse.data) {
    const productCategorySlugs = product.categories.map(c => c.slug);
    const hasValidCategory = productCategorySlugs.some(slug => 
      allAllowedSlugs.includes(slug)
    );
    
    if (hasValidCategory) {
      validCount++;
    } else {
      invalidCount++;
      console.log(`   ❌ Product "${product.name}" has invalid categories:`, productCategorySlugs);
    }
  }
  
  console.log(`   ✅ ${validCount} products have valid categories`);
  if (invalidCount > 0) {
    console.log(`   ❌ ${invalidCount} products have invalid categories`);
  }
  
  console.log("\n" + "=".repeat(80));
  
  if (actualCount > 0 && actualCount === expectedCount && invalidCount === 0) {
    console.log("✅ TEST PASSED!");
    console.log("   • Products query includes subcategory products");
    console.log("   • Product counts match category API");
    console.log("   • All products belong to correct categories");
  } else if (actualCount === 0) {
    console.log("❌ TEST FAILED!");
    console.log("   • No products returned for parent category");
    console.log("   • The getAllDescendantCategorySlugs function may not be working");
  } else {
    console.log("⚠️  TEST PARTIALLY PASSED");
    console.log("   • Products are returned but counts don't match perfectly");
  }
  
  console.log("=".repeat(80) + "\n");
};

if (import.meta.main) {
  main();
}
