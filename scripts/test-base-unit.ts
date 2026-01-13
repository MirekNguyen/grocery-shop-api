/**
 * Test the base unit fields with the soup mix product
 */

import { db } from '../src/db/client';
import { products } from '../src/modules/product/product.schema';
import { eq } from 'drizzle-orm';

const testProduct = async () => {
  const sku = '82-211350'; // Polévková zeleninová směs
  
  console.log('🔍 Fetching product from API...\n');
  
  const url = `https://shop.billa.cz/api/product-discovery/products/${sku}`;
  const response = await fetch(url);
  const apiData = await response.json();
  
  console.log('📦 API Response:');
  console.log(`Name: ${apiData.name}`);
  console.log(`Amount: ${apiData.amount} ${apiData.volumeLabelShort}`);
  console.log(`Price: ${apiData.price.regular.value} Kč`);
  console.log(`Price per unit: ${apiData.price.regular.perStandardizedQuantity} Kč`);
  console.log(`Base unit: ${apiData.price.baseUnitShort} (${apiData.price.baseUnitLong})`);
  console.log(`Volume label: ${apiData.volumeLabelShort} (${apiData.volumeLabelKey})`);
  
  console.log('\n🔄 Updating database...');
  
  await db
    .update(products)
    .set({
      baseUnitLong: apiData.price.baseUnitLong,
      baseUnitShort: apiData.price.baseUnitShort,
    })
    .where(eq(products.sku, sku));
  
  console.log('✅ Updated!\n');
  
  console.log('🗄️  Database record:');
  const dbProduct = await db.select().from(products).where(eq(products.sku, sku)).limit(1);
  
  if (dbProduct.length > 0) {
    const p = dbProduct[0];
    console.log(`Name: ${p.name}`);
    console.log(`Amount: ${p.amount} ${p.volumeLabelShort}`);
    console.log(`Price: ${p.price} Kč`);
    console.log(`Price per unit: ${p.pricePerUnit} Kč per ${p.baseUnitShort}`);
    console.log(`Base unit: ${p.baseUnitShort} (${p.baseUnitLong})`);
    console.log(`Volume label: ${p.volumeLabelShort}`);
  }
};

testProduct()
  .then(() => process.exit(0))
  .catch((error) => {
    console.error('Error:', error);
    process.exit(1);
  });
