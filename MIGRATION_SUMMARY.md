# Migration Summary: SQLite → PostgreSQL + Meilisearch

## ✅ Completed Migration

Successfully migrated from **SQLite + FTS5** to **PostgreSQL + Meilisearch**.

## What Changed

### 1. Database: SQLite → PostgreSQL

**Dependencies:**
- Added: `postgres` (PostgreSQL client)
- Updated: Drizzle ORM to use `drizzle-orm/postgres-js`

**Schema Changes:**
```typescript
// Before
import { sqliteTable, text, integer } from 'drizzle-orm/sqlite-core';
integer('id').primaryKey({ autoIncrement: true })
integer('in_promotion', { mode: 'boolean' })
integer('scraped_at', { mode: 'timestamp' })

// After
import { pgTable, varchar, text, serial, boolean, timestamp } from 'drizzle-orm/pg-core';
serial('id').primaryKey()
boolean('in_promotion')
timestamp('scraped_at').defaultNow()
```

**Files Updated:**
- ✅ `src/db/client.ts` - PostgreSQL connection
- ✅ `src/modules/product/product.schema.ts` - pgTable
- ✅ `src/modules/category/category.schema.ts` - pgTable
- ✅ `src/modules/category/product-categories.schema.ts` - pgTable
- ✅ `drizzle.config.ts` - PostgreSQL dialect
- ✅ `scripts/migrate-postgres.ts` - New migration script

### 2. Search: FTS5 → Meilisearch

**Dependencies:**
- Added: `meilisearch` (v0.41.0)

**New Files:**
- ✅ `src/db/meilisearch.ts` - Meilisearch client
- ✅ `src/modules/product/product.meilisearch.service.ts` - Search service
- ✅ `scripts/setup-meilisearch.ts` - Initialize indexes
- ✅ `scripts/index-products-meili.ts` - Index all products

**Files Updated:**
- ✅ `src/modules/product/product.controller.api.ts` - Use Meilisearch

**Removed:**
- ❌ `src/modules/product/product.search.repository.ts` (FTS5)
- ❌ `scripts/setup-fts.ts` (SQLite FTS)

### 3. Configuration

**New Files:**
- ✅ `.env.example` - Environment template

**Environment Variables:**
```env
DATABASE_URL=postgres://postgres:postgres@localhost:5432/shop_scraper
MEILISEARCH_HOST=http://localhost:7700
MEILISEARCH_API_KEY=your_master_key_here
```

### 4. Package Scripts

**Updated:**
```json
{
  "db:generate": "drizzle-kit generate",
  "db:migrate": "bun run scripts/migrate-postgres.ts",
  "db:push": "drizzle-kit push",
  "search:setup": "bun run scripts/setup-meilisearch.ts",
  "search:index": "bun run scripts/index-products-meili.ts"
}
```

**Removed:**
```json
{
  "db:setup": "...",           // Old SQLite setup
  "db:setup-fts": "...",       // Old FTS5 setup
  "db:backfill-units": "..."   // Old SQLite script
}
```

## Setup Instructions

### 1. Prerequisites
```bash
# Install PostgreSQL
brew install postgresql@16
brew services start postgresql@16

# Install Meilisearch
brew install meilisearch
meilisearch --master-key="your_key_here"
```

### 2. Environment
```bash
cp .env.example .env
# Edit .env with your credentials
```

### 3. Database
```bash
bun install
bun run db:generate  # Generate migrations
bun run db:migrate   # Run migrations
```

### 4. Search
```bash
bun run search:setup  # Initialize Meilisearch
```

### 5. Data
```bash
bun run dev           # Scrape products
bun run search:index  # Index in Meilisearch
```

### 6. API
```bash
bun run api           # Start API server
```

## Benefits of Migration

### PostgreSQL Advantages
- ✅ Better performance for complex queries
- ✅ ACID transactions
- ✅ Advanced indexing and constraints
- ✅ JSON/JSONB support
- ✅ Horizontal scaling with read replicas
- ✅ Production-ready with extensive tooling

### Meilisearch Advantages
- ✅ **Typo tolerance**: "mullermilk" finds "Müller Milch"
- ✅ **Better diacritics**: Smarter Czech/German character handling
- ✅ **Faceted search**: Filter by brand, category, price ranges
- ✅ **Advanced filtering**: Complex AND/OR conditions
- ✅ **Sorting**: Multiple sort criteria
- ✅ **Performance**: < 5ms search response time
- ✅ **Scalability**: Dedicated search engine, handles millions of documents

## API Examples

### Search with Filters
```bash
# Search with category filter
GET /api/products?search=mleko&category=napoje-1474

# The filter is now applied in Meilisearch
const results = await searchProducts('mleko', {
  filter: ['categorySlug = "napoje-1474"']
});
```

### Advanced Meilisearch Features (Available)
```typescript
// Faceted search
const results = await searchProducts('mleko', {
  facets: ['brand', 'categorySlug'],
});

// Price range filtering
filter: ['price > 1000 AND price < 5000']

// Multiple filters
filter: ['categorySlug = "napoje-1474" AND inPromotion = true']

// Sorting
sort: ['price:asc', 'name:desc']
```

## Migration Validation

### Database
```bash
# Check PostgreSQL connection
psql $DATABASE_URL -c "SELECT COUNT(*) FROM products"

# Open Drizzle Studio
bun run db:studio
```

### Search
```bash
# Check Meilisearch health
curl http://localhost:7700/health

# Check indexed products
curl http://localhost:7700/indexes/products/stats \
  -H "Authorization: Bearer your_key_here"
```

## Rollback Plan (If Needed)

If you need to rollback to SQLite:

1. Checkout previous commit: `git checkout <commit-before-migration>`
2. Remove PostgreSQL/Meilisearch
3. Run old setup: `bun run db:setup && bun run db:setup-fts`

## Documentation

- **Migration Guide**: See `MIGRATION_GUIDE.md` for detailed instructions
- **API Docs**: See `API_DOCS.md` for endpoints
- **Frontend Changes**: See `CHANGELOG_FRONTEND.md` for API updates

## Next Steps

1. ✅ Scrape products: `bun run dev`
2. ✅ Index in Meilisearch: `bun run search:index`
3. ✅ Test search API: `curl http://localhost:3000/api/products?search=banan`
4. ✅ Test category filter: `curl http://localhost:3000/api/products?category=ovoce-a-zelenina-1165`
5. ✅ Monitor performance and adjust Meilisearch settings as needed

---

**Migration completed successfully!** 🎉

All tests should pass and the API should work exactly the same as before, but with better performance and search capabilities.
