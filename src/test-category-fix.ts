/**
 * Quick Test - Category API Fix
 * Tests if removing $attributes fixed the validation error
 */

import { fetchCategoryProducts } from "./modules/foodora-scraper/foodora-category-api.service.ts";

const main = async (): Promise<void> => {
  console.log("\n🧪 Testing Category API Fix");
  console.log("=".repeat(80));
  console.log("Testing category: Drůbež (Poultry)");
  console.log("Category ID: aef9f1fe-ffe4-4754-8f27-4bb8359e2427");
  console.log("=".repeat(80) + "\n");

  try {
    const response = await fetchCategoryProducts(
      "aef9f1fe-ffe4-4754-8f27-4bb8359e2427"
    );

    console.log("✅ API call successful!\n");
    console.log("Response structure:");
    console.log(JSON.stringify(response, null, 2));

    const categoryProducts = response.data.categoryProductList.categoryProducts;

    if (categoryProducts === null) {
      console.log("\n⚠️  categoryProducts is still null");
      console.log("This might mean:");
      console.log("  - Category has no products");
      console.log("  - Category ID is invalid");
      console.log("  - Other query parameters need adjustment");
    } else if (Array.isArray(categoryProducts)) {
      console.log(`\n✅ SUCCESS! Got ${categoryProducts.length} category groups`);
      
      categoryProducts.forEach((group) => {
        console.log(`\n📦 Category: ${group.name} (ID: ${group.id})`);
        console.log(`   Products: ${group.items.length}`);
        
        if (group.items.length > 0) {
          console.log(`   First product: ${group.items[0]?.name}`);
          console.log(`   Price: ${group.items[0]?.price} CZK`);
        }
      });

      const totalProducts = categoryProducts.reduce(
        (sum, group) => sum + group.items.length,
        0
      );
      console.log(`\n📊 Total products across all groups: ${totalProducts}`);
    }
  } catch (error) {
    console.error("\n❌ Error:");
    
    if (error instanceof Error) {
      console.error("Message:", error.message);
      
      // If it's a Zod error, show details
      if ("issues" in error) {
        console.error("\nValidation issues:");
        // @ts-expect-error - Zod error has issues property
        error.issues?.forEach((issue: { path: string[]; message: string }) => {
          console.error(`  - ${issue.path.join(".")}: ${issue.message}`);
        });
      }
    } else {
      console.error(error);
    }
  }

  console.log("\n" + "=".repeat(80));
  console.log("Test complete!");
  console.log("=".repeat(80) + "\n");
};

if (import.meta.main) {
  main();
}
