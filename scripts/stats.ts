import { db } from '../src/db/client';
import { products } from '../src/modules/product/product.schema';
import { categories } from '../src/modules/category/category.schema';
import { productCategories } from '../src/modules/category/product-categories.schema';
import { sql, eq } from 'drizzle-orm';

async function showStats() {
  console.log('📊 Database Statistics\n');
  
  // Total products
  const totalResult = await db.select({ count: sql<number>`count(*)` }).from(products);
  console.log(`Total products: ${totalResult[0].count}`);
  
  // Total categories
  const totalCategories = await db.select({ count: sql<number>`count(*)` }).from(categories);
  console.log(`Total categories: ${totalCategories[0].count}`);
  
  // Total category links
  const totalLinks = await db.select({ count: sql<number>`count(*)` }).from(productCategories);
  console.log(`Total product-category links: ${totalLinks[0].count}`);
  
  // Products by category (using junction table)
  console.log('\n📂 Products by Category (with relationships):');
  const categoriesWithCounts = await db
    .select({
      key: categories.key,
      name: categories.name,
      slug: categories.slug,
      productCount: sql<number>`count(DISTINCT ${productCategories.productId})`,
    })
    .from(categories)
    .leftJoin(productCategories, eq(productCategories.categoryId, categories.id))
    .groupBy(categories.id, categories.key, categories.name, categories.slug)
    .orderBy(sql`count(DISTINCT ${productCategories.productId}) DESC`);
  
  categoriesWithCounts.forEach(cat => {
    if (cat.productCount > 0) {
      console.log(`  ${cat.name} (${cat.key}): ${cat.productCount} products`);
    }
  });
  
  // Products in promotion
  const promotionResult = await db
    .select({ count: sql<number>`count(*)` })
    .from(products)
    .where(sql`in_promotion = 1`);
  console.log(`\n🎁 Products in promotion: ${promotionResult[0].count}`);
  
  // Top 5 most expensive products
  const expensiveProducts = await db
    .select({
      name: products.name,
      price: products.price,
      category: products.category,
    })
    .from(products)
    .where(sql`price IS NOT NULL`)
    .orderBy(sql`price DESC`)
    .limit(5);
  
  console.log('\n💰 Top 5 Most Expensive Products:');
  expensiveProducts.forEach((p, i) => {
    const priceFormatted = p.price ? (p.price / 100).toFixed(2) : 'N/A';
    console.log(`  ${i + 1}. ${p.name} - ${priceFormatted} Kč (${p.category})`);
  });
  
  // Products by brand (top 10)
  const brandStats = await db
    .select({
      brand: products.brand,
      count: sql<number>`count(*)`,
    })
    .from(products)
    .where(sql`brand IS NOT NULL`)
    .groupBy(products.brand)
    .orderBy(sql`count(*) DESC`)
    .limit(10);
  
  console.log('\n🏷️  Top 10 Brands:');
  brandStats.forEach(stat => {
    console.log(`  ${stat.brand}: ${stat.count} products`);
  });
}

showStats();
