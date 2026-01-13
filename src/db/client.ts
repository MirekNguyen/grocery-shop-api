import { drizzle } from 'drizzle-orm/postgres-js';
import postgres from 'postgres';
import * as productSchema from '../modules/product/product.schema';
import * as categorySchema from '../modules/category/category.schema';
import * as productCategoriesSchema from '../modules/category/product-categories.schema';
import * as productCategoriesRelations from '../modules/category/product-categories.relations';

// Get database URL from environment or use default
const DATABASE_URL = process.env.DATABASE_URL || 'postgres://postgres:postgres@localhost:5432/shop_scraper';

// Create PostgreSQL connection
const client = postgres(DATABASE_URL);

export const db = drizzle(client, { 
  schema: { 
    ...productSchema, 
    ...categorySchema,
    ...productCategoriesSchema,
    ...productCategoriesRelations,
  } 
});
