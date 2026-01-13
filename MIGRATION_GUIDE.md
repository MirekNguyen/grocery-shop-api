# PostgreSQL + Meilisearch Migration Guide

This project has been migrated from **SQLite + FTS5** to **PostgreSQL + Meilisearch** for better scalability and search capabilities.

## Prerequisites

### 1. PostgreSQL
Install and start PostgreSQL:

```bash
# macOS (Homebrew)
brew install postgresql@16
brew services start postgresql@16

# Or use Docker
docker run -d \
  --name shop-postgres \
  -e POSTGRES_USER=postgres \
  -e POSTGRES_PASSWORD=postgres \
  -e POSTGRES_DB=shop_scraper \
  -p 5432:5432 \
  postgres:16-alpine
```

### 2. Meilisearch
Install and start Meilisearch:

```bash
# macOS (Homebrew)
brew install meilisearch
meilisearch --master-key="your_master_key_here"

# Or use Docker
docker run -d \
  --name shop-meilisearch \
  -p 7700:7700 \
  -e MEILI_MASTER_KEY="your_master_key_here" \
  getmeili/meilisearch:v1.6
```

## Setup

### 1. Environment Configuration

Create a `.env` file in the project root:

```bash
cp .env.example .env
```

Edit `.env` with your configuration:

```env
# PostgreSQL Database
DATABASE_URL=postgres://postgres:postgres@localhost:5432/shop_scraper

# Meilisearch
MEILISEARCH_HOST=http://localhost:7700
MEILISEARCH_API_KEY=your_master_key_here
```

### 2. Install Dependencies

```bash
bun install
```

### 3. Database Setup

Generate and run migrations:

```bash
# Generate migration files from schema
bun run db:generate

# Run migrations
bun run db:migrate

# Or push schema directly (development only)
bun run db:push
```

### 4. Meilisearch Setup

Initialize search indexes:

```bash
# Setup Meilisearch indexes and configuration
bun run search:setup
```

### 5. Run Scraper

Scrape products from Billa API:

```bash
bun run dev
```

### 6. Index Products in Meilisearch

After scraping, index all products:

```bash
bun run search:index
```

## Key Changes from SQLite

### Database Schema

**Before (SQLite):**
```typescript
import { sqliteTable, text, integer } from 'drizzle-orm/sqlite-core';

export const products = sqliteTable('products', {
  id: integer('id').primaryKey({ autoIncrement: true }),
  name: text('name').notNull(),
  price: integer('price'),
  inPromotion: integer('in_promotion', { mode: 'boolean' }),
  scrapedAt: integer('scraped_at', { mode: 'timestamp' }),
});
```

**After (PostgreSQL):**
```typescript
import { pgTable, varchar, text, integer, serial, boolean, timestamp } from 'drizzle-orm/pg-core';

export const products = pgTable('products', {
  id: serial('id').primaryKey(),
  name: text('name').notNull(),
  price: integer('price'),
  inPromotion: boolean('in_promotion').notNull().default(false),
  scrapedAt: timestamp('scraped_at').notNull().defaultNow(),
});
```

### Search Implementation

**Before (SQLite FTS5):**
```typescript
// Used SQLite's built-in FTS5
const results = await db.all(sql`
  SELECT * FROM products_fts WHERE products_fts MATCH ${query}
`);
```

**After (Meilisearch):**
```typescript
// Uses external Meilisearch service
import { searchProducts } from './product.meilisearch.service';

const results = await searchProducts(query, {
  limit: 20,
  filter: ['categorySlug = "napoje-1474"'],
  sort: ['price:asc'],
});
```

## Meilisearch Advantages

### 1. Better Search Quality
- ✅ Typo tolerance (2 typos by default)
- ✅ Better Czech/German diacritics handling
- ✅ Phrase matching and proximity ranking
- ✅ Customizable ranking rules

### 2. Advanced Filtering
```bash
# Filter by category and price range
GET /api/products?search=mleko&filter=categorySlug:napoje-1474 AND price < 5000

# Filter by promotion
GET /api/products?search=chleb&filter=inPromotion:true

# Sort by price
GET /api/products?search=banan&sort=price:asc
```

### 3. Performance
- Faster search (< 5ms typical response time)
- Dedicated search engine
- Better scaling for large datasets

### 4. Faceted Search
```typescript
const results = await searchProducts('mleko', {
  facets: ['brand', 'categorySlug', 'inPromotion'],
});

// Returns facet distribution:
{
  hits: [...],
  facetDistribution: {
    brand: { "Tatra": 10, "Moravia": 5 },
    categorySlug: { "napoje-1474": 8, "chlazene-1207": 7 },
    inPromotion: { true: 3, false: 12 }
  }
}
```

## API Scripts

```bash
# Database
bun run db:generate      # Generate migrations from schema
bun run db:migrate       # Run migrations
bun run db:push          # Push schema directly (dev only)
bun run db:studio        # Open Drizzle Studio
bun run db:stats         # Show database statistics

# Search
bun run search:setup     # Initialize Meilisearch indexes
bun run search:index     # Index all products

# Application
bun run dev              # Run scraper
bun run api              # Start API server (watch mode)
```

## Docker Compose (Optional)

Create `docker-compose.yml`:

```yaml
version: '3.8'

services:
  postgres:
    image: postgres:16-alpine
    environment:
      POSTGRES_USER: postgres
      POSTGRES_PASSWORD: postgres
      POSTGRES_DB: shop_scraper
    ports:
      - "5432:5432"
    volumes:
      - postgres_data:/var/lib/postgresql/data

  meilisearch:
    image: getmeili/meilisearch:v1.6
    environment:
      MEILI_MASTER_KEY: your_master_key_here
    ports:
      - "7700:7700"
    volumes:
      - meilisearch_data:/meili_data

volumes:
  postgres_data:
  meilisearch_data:
```

Start services:

```bash
docker compose up -d
```

## Troubleshooting

### PostgreSQL Connection Issues

```bash
# Test connection
psql postgres://postgres:postgres@localhost:5432/shop_scraper

# Create database manually if needed
createdb shop_scraper
```

### Meilisearch Not Responding

```bash
# Check if Meilisearch is running
curl http://localhost:7700/health

# Check indexes
curl http://localhost:7700/indexes \
  -H "Authorization: Bearer your_master_key_here"
```

### Migration Errors

```bash
# Reset database (development only!)
dropdb shop_scraper && createdb shop_scraper
bun run db:push
```

## Production Considerations

### PostgreSQL
- Use connection pooling (already handled by `postgres` package)
- Set appropriate `max` connections
- Use read replicas for scaling
- Regular backups with `pg_dump`

### Meilisearch
- Set up API keys for production
- Configure dump schedules for backups
- Use Meilisearch Cloud or self-hosted with proper resources
- Monitor index size and search performance

## Migration Checklist

- [x] Install PostgreSQL and Meilisearch
- [x] Update dependencies
- [x] Convert schemas to PostgreSQL types
- [x] Update database client
- [x] Create migration scripts
- [x] Set up environment variables
- [x] Generate and run migrations
- [x] Initialize Meilisearch indexes
- [x] Update search implementation
- [x] Test scraper
- [x] Index products
- [x] Test search API
- [x] Update documentation

## Resources

- [Drizzle ORM PostgreSQL Docs](https://orm.drizzle.team/docs/get-started-postgresql)
- [Meilisearch Documentation](https://www.meilisearch.com/docs)
- [PostgreSQL Documentation](https://www.postgresql.org/docs/)
