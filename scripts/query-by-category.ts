import * as CategoryRepository from '../src/modules/category/category.repository';
import * as ProductQueries from '../src/modules/product/product.queries';

async function main() {
  const args = process.argv.slice(2);
  
  if (args.length === 0) {
    console.log('Usage: bun run scripts/query-by-category.ts <category-slug>');
    console.log('\nAvailable categories:');
    
    const categories = await CategoryRepository.getAllCategories();
    categories.forEach(cat => {
      console.log(`  - ${cat.name} (${cat.slug})`);
    });
    
    process.exit(0);
  }
  
  const categorySlug = args[0];
  
  console.log(`\n🔍 Searching for products in category: ${categorySlug}\n`);
  
  const results = await ProductQueries.getProductsByCategorySlug(categorySlug);
  
  if (results.length === 0) {
    console.log('No products found for this category.');
    process.exit(0);
  }
  
  console.log(`Found ${results.length} products:\n`);
  
  results.forEach((result, index) => {
    const product = result.product;
    const category = result.category;
    
    const price = product.price ? (product.price / 100).toFixed(2) : 'N/A';
    const promotion = product.inPromotion ? '🎁 ' : '';
    
    console.log(`${index + 1}. ${promotion}${product.name}`);
    console.log(`   Price: ${price} Kč`);
    console.log(`   Primary Category: ${category?.name || product.category}`);
    console.log(`   SKU: ${product.sku}`);
    if (product.brand) {
      console.log(`   Brand: ${product.brand}`);
    }
    if (product.images && product.images.length > 0) {
      console.log(`   Images: ${product.images.length} image(s)`);
    }
    console.log('');
  });
  
  // Show example of products with multiple categories
  console.log('\n📋 Note: Products can belong to multiple categories.');
  console.log('Use the query functions to see all categories for a product.');
}

main();
