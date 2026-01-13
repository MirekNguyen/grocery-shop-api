import { drizzle } from 'drizzle-orm/postgres-js';
import { migrate } from 'drizzle-orm/postgres-js/migrator';
import postgres from 'postgres';

const DATABASE_URL = process.env.DATABASE_URL || 'postgres://postgres:postgres@localhost:5432/shop_scraper';

// Create connection for migrations
const sql = postgres(DATABASE_URL, { max: 1 });
const db = drizzle(sql);

const main = async () => {
  console.log('🔄 Running PostgreSQL migrations...');
  
  try {
    await migrate(db, { migrationsFolder: './drizzle' });
    console.log('✅ Migrations completed successfully!');
  } catch (error) {
    console.error('❌ Migration failed:', error);
    process.exit(1);
  }
  
  await sql.end();
  process.exit(0);
};

main();
