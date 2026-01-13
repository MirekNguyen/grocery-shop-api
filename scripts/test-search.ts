/**
 * Test the FTS5 search functionality
 */

import * as ProductSearchRepository from '../src/modules/product/product.search.repository';
import * as ProductQueries from '../src/modules/product/product.queries';

const testSearches = [
  'bana',        // Should find "Banán"
  'mullermilk',  // Should find "Müller Milch" or similar
  'muller',      // Should find "Müller" products
  'chleb',       // Should find bread products
  'mleko',       // Should find milk products
];

console.log('🔍 Testing FTS5 Search\n');

for (const query of testSearches) {
  console.log(`\n📝 Search query: "${query}"`);
  console.log('─'.repeat(50));
  
  const productIds = await ProductSearchRepository.searchProducts(query, 5);
  
  if (productIds.length === 0) {
    console.log('   No results found');
  } else {
    console.log(`   Found ${productIds.length} results:\n`);
    
    // Fetch product details
    const allProducts = await ProductQueries.findAllProductsWithCategories();
    const results = allProducts.filter(p => productIds.includes(p.id));
    
    results.forEach((product, index) => {
      console.log(`   ${index + 1}. ${product.name}`);
      if (product.brand) console.log(`      Brand: ${product.brand}`);
    });
  }
}

console.log('\n✅ Search test completed!');
process.exit(0);
