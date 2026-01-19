/**
 * Test Category API with PARENT category ID
 * Based on browser request analysis
 */

import { fetchCategoryProducts } from "./modules/foodora-scraper/foodora-category-api.service.ts";

const main = async (): Promise<void> => {
  console.log("\n🧪 Testing Category API with PARENT Category ID");
  console.log("=".repeat(80));
  
  // From browser request: This is the PARENT category "Maso a uzeniny"
  const parentCategoryId = "8d101a5c-84cb-4d02-8247-a47d423d4691";
  const categoryName = "Maso a uzeniny (Meat and Sausages)";
  
  console.log(`Testing category: ${categoryName}`);
  console.log(`Category ID: ${parentCategoryId}`);
  console.log("=".repeat(80));
  console.log("");

  try {
    const response = await fetchCategoryProducts(parentCategoryId);

    console.log("✅ API call successful!\n");
    
    const categoryProducts = response.data.categoryProductList.categoryProducts;
    
    if (!categoryProducts) {
      console.log("⚠️  categoryProducts is still null");
      console.log("Response:", JSON.stringify(response, null, 2));
    } else {
      console.log(`✅ SUCCESS! Got ${categoryProducts.length} category groups\n`);
      
      // Show all subcategories returned
      categoryProducts.forEach((group, index) => {
        console.log(`${index + 1}. ${group.name} (ID: ${group.id})`);
        console.log(`   Products: ${group.items.length}`);
      });
      
      console.log(`\n📊 Total category groups: ${categoryProducts.length}`);
      const totalProducts = categoryProducts.reduce(
        (sum, group) => sum + group.items.length,
        0
      );
      console.log(`📦 Total products: ${totalProducts}`);
    }
  } catch (error) {
    console.error("\n❌ Error:", error);
    if (error instanceof Error) {
      console.error("Message:", error.message);
    }
  }

  console.log("\n" + "=".repeat(80));
  console.log("Test complete!");
  console.log("=".repeat(80) + "\n");
};

if (import.meta.main) {
  main();
}
