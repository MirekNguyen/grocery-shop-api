/**
 * Check Database Stats
 * Shows product counts by store and sample products
 */

import { db } from "../src/db/client.ts";
import { products } from "../src/modules/product/product.schema.ts";
import { sql, eq } from "drizzle-orm";

const main = async (): Promise<void> => {
  console.log("\n📊 Database Statistics");
  console.log("=" .repeat(80) + "\n");

  // Count products by store
  const storeCounts = await db
    .select({
      store: products.store,
      count: sql<number>`count(*)`,
    })
    .from(products)
    .groupBy(products.store);

  console.log("Products by store:");
  storeCounts.forEach((row) => {
    console.log(`  ${row.store}: ${row.count} products`);
  });

  console.log("\n" + "=" .repeat(80));
  console.log("Sample Foodora Products:");
  console.log("=" .repeat(80) + "\n");

  const foodoraProducts = await db
    .select({
      name: products.name,
      price: products.price,
      category: products.category,
      store: products.store,
    })
    .from(products)
    .where(eq(products.store, "FOODORA"))
    .limit(10);

  foodoraProducts.forEach((product) => {
    const priceInCzk = ((product.price || 0) / 100).toFixed(2);
    console.log(`${product.name}`);
    console.log(`  Price: ${priceInCzk} CZK | Category: ${product.category}`);
    console.log("");
  });

  console.log("=" .repeat(80) + "\n");
};

if (import.meta.main) {
  main();
}
