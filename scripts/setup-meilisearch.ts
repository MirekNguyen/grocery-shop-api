/**
 * Initialize Meilisearch indexes
 */

import { initializeProductIndex } from '../src/modules/product/product.meilisearch.service';

const main = async () => {
  console.log('🔍 Initializing Meilisearch indexes...\n');
  
  try {
    await initializeProductIndex();
    console.log('\n✅ Meilisearch initialization complete!');
  } catch (error) {
    console.error('\n❌ Initialization failed:', error);
    process.exit(1);
  }
};

main();
