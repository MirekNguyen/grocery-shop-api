# Quick Reference - Multi-Store Scraper

## Installation & Setup

```bash
bun install
bun run db:migrate
```

## Available Commands

### Database

```bash
# Generate database migration
bun run db:generate

# Run migrations
bun run db:migrate

# Push schema changes
bun run db:push

# Open Drizzle Studio (database GUI)
bun run db:studio

# Check database stats (products by store)
bun run db:check
```

### API Server

```bash
# Start API server (with hot reload)
bun run api

# Server runs on: http://localhost:3001
```

### Scraping

```bash
# Scrape BILLA products
bun run scrape:billa

# Scrape FOODORA products (all ~6,000)
bun run scrape:foodora

# Test FOODORA scraper (one category only)
bun run scrape:foodora:test
```

### Search (Meilisearch)

```bash
# Setup Meilisearch
bun run search:setup

# Index products in Meilisearch
bun run search:index
```

## API Endpoints

### Get Products

**All products:**
```bash
curl http://localhost:3001/api/products
```

**BILLA products only:**
```bash
curl "http://localhost:3001/api/products?store=BILLA"
```

**FOODORA products only:**
```bash
curl "http://localhost:3001/api/products?store=FOODORA"
```

**Products on promotion:**
```bash
curl "http://localhost:3001/api/products?inPromotion=true"
```

**Search products:**
```bash
curl "http://localhost:3001/api/products?search=chicken"
```

**Filter by category:**
```bash
curl "http://localhost:3001/api/products?category=foodora-drubez"
```

**Combined filters:**
```bash
curl "http://localhost:3001/api/products?store=FOODORA&category=foodora-drubez&inPromotion=true&limit=10"
```

### Get Single Product

**By ID:**
```bash
curl http://localhost:3001/api/products/123
```

**By slug:**
```bash
curl http://localhost:3001/api/products/slug/kuřecí-steak
```

### Get Categories

**All categories:**
```bash
curl http://localhost:3001/api/categories
```

**Single category:**
```bash
curl http://localhost:3001/api/categories/foodora-drubez
```

**Products in category:**
```bash
curl http://localhost:3001/api/categories/foodora-drubez/products
```

## Database Queries

### PostgreSQL

```sql
-- Count products by store
SELECT store, COUNT(*) as count 
FROM products 
GROUP BY store;

-- Get Foodora products
SELECT name, price, category 
FROM products 
WHERE store = 'FOODORA' 
LIMIT 10;

-- Compare prices between stores
SELECT 
  b.name, 
  b.price as billa_price, 
  f.price as foodora_price,
  (b.price - f.price) as diff
FROM products b
JOIN products f ON LOWER(b.name) = LOWER(f.name)
WHERE b.store = 'BILLA' AND f.store = 'FOODORA';

-- Products on promotion
SELECT name, price, regular_price, store
FROM products
WHERE in_promotion = true
ORDER BY (regular_price - price) DESC;
```

### Bun Script

```bash
# Check database stats
bun run db:check
```

## File Structure

```
src/
├── api.ts                              # API server (Elysia)
├── index.ts                            # BILLA scraper CLI
├── scrape-foodora-to-db.ts            # FOODORA scraper CLI
├── test-foodora-db-integration.ts     # Test script
├── modules/
│   ├── product/
│   │   ├── product.schema.ts          # Product database schema
│   │   ├── product.repository.ts      # Product DB operations
│   │   ├── product.controller.api.ts  # API controllers
│   │   └── product.types.ts           # Store types
│   ├── category/
│   │   ├── category.schema.ts         # Category database schema
│   │   └── category.repository.ts     # Category DB operations
│   ├── scraper/
│   │   └── scraper.service.ts         # BILLA scraper
│   └── foodora-scraper/
│       ├── foodora-api.service.ts     # Foodora API client
│       ├── foodora-db.service.ts      # Foodora → DB mapper
│       └── foodora-scraper-db.service.ts  # Main scraper
└── db/
    └── client.ts                       # Database client

scripts/
├── check-db-stats.ts                   # Check database stats
└── migrate-postgres.ts                 # Run migrations

docs/
├── FOODORA-DB-INTEGRATION.md          # Complete integration guide
└── ...                                 # Other documentation
```

## Environment Variables

Create `.env` file:

```env
DATABASE_URL=postgres://postgres:postgres@localhost:5432/shop_scraper
```

## Typical Workflow

### 1. Initial Setup

```bash
# Install dependencies
bun install

# Run database migrations
bun run db:migrate

# Start API server
bun run api
```

### 2. Scrape Products

```bash
# Scrape BILLA (in another terminal)
bun run scrape:billa

# Scrape Foodora
bun run scrape:foodora
```

### 3. Check Results

```bash
# Check database
bun run db:check

# Query API
curl "http://localhost:3001/api/products?store=FOODORA&limit=5"
```

### 4. Browse Database

```bash
# Open Drizzle Studio
bun run db:studio

# Opens: https://local.drizzle.studio
```

## Stores Supported

| Store | Code | Products | Status |
|---|---|---|---|
| BILLA | `BILLA` | ~9,500 | ✅ Working |
| Foodora | `FOODORA` | ~6,000 | ✅ Working |

## Common Issues

### Database connection failed

Check PostgreSQL is running:
```bash
# macOS
brew services start postgresql@14

# Linux
sudo systemctl start postgresql
```

### Products not showing in API

1. Check database has products:
   ```bash
   bun run db:check
   ```

2. Restart API server:
   ```bash
   bun run api
   ```

3. Clear cache (if using)

### Scraper fails

1. Check network connection
2. Foodora API might be rate limiting
3. Try with test script first:
   ```bash
   bun run scrape:foodora:test
   ```

## Performance Tips

### Scraping

- Default delay: 500ms between categories
- Total time for Foodora: ~15-20 seconds
- Run during off-peak hours for faster results

### Database

- Add indexes for frequently queried fields:
  ```sql
  CREATE INDEX idx_products_store ON products(store);
  CREATE INDEX idx_products_category ON products(category_slug);
  ```

### API

- Use pagination (`page` and `limit` params)
- Cache results on frontend
- Use Meilisearch for fast search

## Documentation

- **Full Integration Guide:** `docs/FOODORA-DB-INTEGRATION.md`
- **Architecture:** `docs/ARCHITECTURE.md`
- **Troubleshooting:** `docs/TROUBLESHOOTING.md`

## Support

For issues or questions, check the documentation in `docs/` folder.
