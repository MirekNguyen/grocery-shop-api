import { defineConfig } from 'drizzle-kit';

export default defineConfig({
  schema: './src/modules/**/*.schema.ts',
  out: './drizzle',
  dialect: 'postgresql',
  dbCredentials: {
    url: process.env.DATABASE_URL || 'postgres://postgres:postgres@localhost:5432/shop_scraper',
  },
});
