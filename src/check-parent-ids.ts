/**
 * Quick Database Check - View categories with parent_id
 */

import { db } from "./db/client.ts";
import { categories } from "./modules/category/category.schema.ts";
import { like } from "drizzle-orm";

const main = async (): Promise<void> => {
  console.log("\n📊 Checking categories with parent_id...\n");
  
  const result = await db
    .select()
    .from(categories)
    .where(like(categories.key, 'foodora%'))
    .limit(50);

  console.log(`Found ${result.length} Foodora categories\n`);

  let rootCount = 0;
  let childCount = 0;

  console.log("Categories:");
  console.log("─".repeat(80));

  for (const row of result) {
    const parentId = row.parentId;
    
    if (parentId === null) {
      rootCount++;
      console.log(`📁 ${row.name} (ID: ${row.id})`);
      console.log(`   Key: ${row.key}`);
      console.log(`   Parent: ROOT`);
    } else {
      childCount++;
      console.log(`   └── ${row.name} (ID: ${row.id})`);
      console.log(`       Key: ${row.key}`);
      console.log(`       Parent ID: ${parentId}`);
    }
    console.log("");
  }

  console.log("─".repeat(80));
  console.log(`\nSummary:`);
  console.log(`  Root categories: ${rootCount}`);
  console.log(`  Child categories: ${childCount}`);
  
  if (childCount === 0) {
    console.log(`\n⚠️  No child categories found!`);
    console.log(`  This means all parent_id values are NULL`);
    console.log(`  The fix needs to be applied and data re-scraped\n`);
  } else {
    console.log(`\n✅ Hierarchy is working! ${childCount} categories have parents\n`);
  }
};

if (import.meta.main) {
  main();
}
