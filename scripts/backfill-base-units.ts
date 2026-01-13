/**
 * Backfill base unit data for existing products
 * Fetches product details from API and updates base unit fields
 */

import { db } from '../src/db/client';
import { products } from '../src/modules/product/product.schema';
import { eq } from 'drizzle-orm';

interface ApiProductPrice {
  baseUnitLong?: string;
  baseUnitShort?: string;
  basePriceFactor?: string;
  regular?: {
    value: number;
    perStandardizedQuantity: number;
  };
}

interface ApiProduct {
  price: ApiProductPrice;
}

const fetchProductDetails = async (sku: string): Promise<ApiProduct | null> => {
  try {
    const url = `https://shop.billa.cz/api/product-discovery/products/${sku}`;
    const response = await fetch(url);
    
    if (!response.ok) {
      return null;
    }
    
    return await response.json();
  } catch (error) {
    console.error(`Error fetching ${sku}:`, error);
    return null;
  }
};

const backfillBaseUnits = async () => {
  console.log('🔄 Starting base unit backfill...\n');
  
  // Get all products
  const allProducts = await db.select().from(products);
  console.log(`Found ${allProducts.length} products to update\n`);
  
  let updated = 0;
  let failed = 0;
  
  for (const product of allProducts) {
    process.stdout.write(`Processing ${product.sku}...`);
    
    const apiProduct = await fetchProductDetails(product.sku);
    
    if (apiProduct && apiProduct.price) {
      const baseUnitLong = apiProduct.price.baseUnitLong || null;
      const baseUnitShort = apiProduct.price.baseUnitShort || null;
      
      await db
        .update(products)
        .set({
          baseUnitLong,
          baseUnitShort,
        })
        .where(eq(products.id, product.id));
      
      console.log(` ✅ ${baseUnitShort || 'no unit'}`);
      updated++;
    } else {
      console.log(` ❌ failed`);
      failed++;
    }
    
    // Rate limiting - wait 100ms between requests
    await new Promise(resolve => setTimeout(resolve, 100));
  }
  
  console.log(`\n📊 Results:`);
  console.log(`   Updated: ${updated}`);
  console.log(`   Failed: ${failed}`);
  console.log(`   Total: ${allProducts.length}`);
};

backfillBaseUnits()
  .then(() => {
    console.log('\n✅ Backfill completed!');
    process.exit(0);
  })
  .catch((error) => {
    console.error('\n❌ Backfill failed:', error);
    process.exit(1);
  });
