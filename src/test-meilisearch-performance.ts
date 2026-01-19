/**
 * Test Meilisearch-based product querying performance
 */

import * as ProductController from "./modules/product/product.controller.api.ts";

const main = async (): Promise<void> => {
  console.log("\n⚡ Testing Meilisearch Performance\n");
  console.log("=".repeat(80));

  const tests = [
    {
      name: "Query by store only",
      filters: {
        store: "FOODORA_BILLA_PROSEK",
        limit: 30,
        page: 1,
      },
    },
    {
      name: "Query by store + category (parent with subcategories)",
      filters: {
        store: "FOODORA_BILLA_PROSEK",
        category: "foodora-billa-prosek-dd421337-cf5c-4104-b529-a188feb1c632", // Alkohol
        limit: 30,
        page: 1,
      },
    },
    {
      name: "Query by store + search term",
      filters: {
        store: "FOODORA_BILLA_PROSEK",
        search: "vodka",
        limit: 30,
        page: 1,
      },
    },
    {
      name: "Query by store + category + search",
      filters: {
        store: "FOODORA_BILLA_PROSEK",
        category: "foodora-billa-prosek-dd421337-cf5c-4104-b529-a188feb1c632",
        search: "gin",
        limit: 30,
        page: 1,
      },
    },
    {
      name: "Query by store + promotion filter",
      filters: {
        store: "FOODORA_ALBERT_FLORENC",
        inPromotion: true,
        limit: 30,
        page: 1,
      },
    },
  ];

  for (const test of tests) {
    console.log(`\n📊 Test: ${test.name}`);
    console.log("-".repeat(80));

    const startTime = performance.now();

    try {
      const result = await ProductController.getProducts(test.filters);
      
      const endTime = performance.now();
      const duration = (endTime - startTime).toFixed(2);

      console.log(`   ✅ Query completed in ${duration}ms`);
      console.log(`   • Total results: ${result.pagination.total}`);
      console.log(`   • Returned: ${result.data.length} products`);
      console.log(`   • Pages: ${result.pagination.totalPages}`);

      if (result.data.length > 0) {
        console.log(`   • First product: ${result.data[0].name}`);
        console.log(`   • Categories: ${result.data[0].categories.map(c => c.name).join(', ')}`);
      }

      // Performance check
      if (parseFloat(duration) > 1000) {
        console.log(`   ⚠️  Query took longer than 1 second!`);
      } else if (parseFloat(duration) > 500) {
        console.log(`   ⚠️  Query took longer than 500ms`);
      } else if (parseFloat(duration) < 100) {
        console.log(`   🚀 Very fast query!`);
      }
    } catch (error) {
      console.log(`   ❌ Query failed:`, error);
    }
  }

  console.log("\n" + "=".repeat(80));
  console.log("✅ Performance testing complete!\n");
};

if (import.meta.main) {
  main();
}
