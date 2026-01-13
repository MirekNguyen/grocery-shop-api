/**
 * Index all products in Meilisearch
 */

import * as ProductQueries from '../src/modules/product/product.queries';
import { indexProducts } from '../src/modules/product/product.meilisearch.service';

const main = async () => {
  console.log('🔍 Indexing all products in Meilisearch...\n');
  
  try {
    // Fetch all products with categories
    const products = await ProductQueries.findAllProductsWithCategories();
    console.log(`Found ${products.length} products to index\n`);
    
    if (products.length === 0) {
      console.log('⚠️  No products found in database');
      process.exit(0);
    }
    
    // Index in batches of 100
    const batchSize = 100;
    let indexed = 0;
    
    for (let i = 0; i < products.length; i += batchSize) {
      const batch = products.slice(i, i + batchSize);
      await indexProducts(batch);
      indexed += batch.length;
      console.log(`Progress: ${indexed}/${products.length} products indexed`);
    }
    
    console.log('\n✅ All products indexed successfully!');
  } catch (error) {
    console.error('\n❌ Indexing failed:', error);
    process.exit(1);
  }
};

main();
