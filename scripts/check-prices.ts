import { db } from '../src/db/client';
import { products } from '../src/modules/product/product.schema';
import { sql } from 'drizzle-orm';

async function checkPrices() {
  console.log('🔍 Checking price data...\n');
  
  // Get sample products with prices
  const sampleProducts = await db
    .select({
      name: products.name,
      brand: products.brand,
      price: products.price,
      pricePerUnit: products.pricePerUnit,
      regularPrice: products.regularPrice,
      discountPrice: products.discountPrice,
      lowestPrice: products.lowestPrice,
      inPromotion: products.inPromotion,
    })
    .from(products)
    .limit(10);
  
  console.log('Sample of 10 products with pricing data:\n');
  sampleProducts.forEach((p, i) => {
    console.log(`${i + 1}. ${p.name}`);
    console.log(`   Brand: ${p.brand || 'N/A'}`);
    console.log(`   Price: ${p.price ? (p.price / 100).toFixed(2) : 'N/A'} Kč`);
    console.log(`   Price per unit: ${p.pricePerUnit ? (p.pricePerUnit / 100).toFixed(2) : 'N/A'} Kč`);
    console.log(`   Regular price: ${p.regularPrice ? (p.regularPrice / 100).toFixed(2) : 'N/A'} Kč`);
    console.log(`   Discount price: ${p.discountPrice ? (p.discountPrice / 100).toFixed(2) : 'N/A'} Kč`);
    console.log(`   Lowest price: ${p.lowestPrice ? (p.lowestPrice / 100).toFixed(2) : 'N/A'} Kč`);
    console.log(`   In promotion: ${p.inPromotion ? 'Yes' : 'No'}`);
    console.log('');
  });
  
  // Count non-null values
  const stats = await db.execute(sql`
    SELECT 
      COUNT(CASE WHEN price IS NOT NULL THEN 1 END) as with_price,
      COUNT(CASE WHEN price_per_unit IS NOT NULL THEN 1 END) as with_price_per_unit,
      COUNT(CASE WHEN brand IS NOT NULL THEN 1 END) as with_brand,
      COUNT(CASE WHEN discount_price IS NOT NULL THEN 1 END) as with_discount,
      COUNT(CASE WHEN lowest_price IS NOT NULL THEN 1 END) as with_lowest_price,
      COUNT(*) as total
    FROM products
  `);
  
  console.log('\n📊 Data completeness:');
  const row = stats.rows[0] as any;
  console.log(`Products with price: ${row.with_price}/${row.total}`);
  console.log(`Products with price per unit: ${row.with_price_per_unit}/${row.total}`);
  console.log(`Products with brand: ${row.with_brand}/${row.total}`);
  console.log(`Products with discount price: ${row.with_discount}/${row.total}`);
  console.log(`Products with lowest price: ${row.with_lowest_price}/${row.total}`);
}

checkPrices();
