# Multi-Store Foodora Integration

## Overview

The shop-scraper supports multiple Foodora stores. Each Foodora location (BILLA Prosek, Albert Florenc, D-Mart) is treated as its own store, making it simple to query and manage products from different locations.

## Store Types

```typescript
STORE_TYPES = {
  BILLA: 'BILLA',                                      // BILLA scraper
  FOODORA_BILLA_PROSEK: 'FOODORA_BILLA_PROSEK',       // BILLA Praha Prosek (mjul)
  FOODORA_ALBERT_FLORENC: 'FOODORA_ALBERT_FLORENC',   // Albert Praha Florenc (obc6)
  FOODORA_DMART: 'FOODORA_DMART',                      // D-Mart (o7b0)
}
```

## Scraping Commands

### Default Store (D-Mart)
```bash
bun run scrape:foodora
# or
bun src/scrape-foodora-to-db.ts
```

### Specific Store
```bash
# BILLA Prosek
bun run scrape:foodora:store -- --store=FOODORA_BILLA_PROSEK

# Albert Florenc
bun run scrape:foodora:store -- --store=FOODORA_ALBERT_FLORENC

# D-Mart
bun run scrape:foodora:store -- --store=FOODORA_DMART
```

### Test
```bash
bun run scrape:foodora:test
```

## API Queries

### Filter by Store
```bash
# All BILLA products (from main BILLA scraper)
GET /api/products?store=BILLA

# All BILLA Prosek products (from Foodora)
GET /api/products?store=FOODORA_BILLA_PROSEK

# All Albert products
GET /api/products?store=FOODORA_ALBERT_FLORENC

# All D-Mart products  
GET /api/products?store=FOODORA_DMART

# All products
GET /api/products
```

### Category Queries
```bash
# Categories with BILLA Prosek product counts
GET /api/categories?store=FOODORA_BILLA_PROSEK

# Products in BILLA Prosek category
GET /api/categories/foodora-billa-prosek-napoje/products?store=FOODORA_BILLA_PROSEK
```

## Category Naming

Categories are prefixed with store code to avoid conflicts:

```
BILLA Prosek:     foodora-billa-prosek-pecivo
Albert Florenc:   foodora-albert-florenc-pecivo
D-Mart:           foodora-dmart-pecivo
```

## Database Structure

```sql
products:
├── store: 'BILLA' | 'FOODORA_BILLA_PROSEK' | 'FOODORA_ALBERT_FLORENC' | 'FOODORA_DMART'
├── productId: unique identifier
└── ... other fields

categories:
├── slug: '{storeCode}-{categorySlug}'
└── ... other fields
```

## Example Queries

```sql
-- Products by store
SELECT store, COUNT(*) as count
FROM products
GROUP BY store;

-- BILLA Prosek products
SELECT * FROM products 
WHERE store = 'FOODORA_BILLA_PROSEK'
LIMIT 10;

-- Compare stores
SELECT name, price, store
FROM products
WHERE name ILIKE '%mleko%'
ORDER BY price;
```

## Adding New Stores

1. **Add store to types:**
```typescript
// src/modules/product/product.types.ts
STORE_TYPES = {
  // ... existing
  FOODORA_NEW_STORE: 'FOODORA_NEW_STORE',
}

FOODORA_VENDOR_CODES = {
  // ... existing
  NEW_STORE: 'abc123',
}
```

2. **Add to scraper config:**
```typescript
// src/scrape-foodora-store.ts
STORE_CONFIG[STORE_TYPES.FOODORA_NEW_STORE] = {
  name: "New Store Name",
  vendorCode: FOODORA_VENDOR_CODES.NEW_STORE,
  storeCode: 'foodora-new-store',
  categories: FOODORA_CATEGORIES_FULL,
};
```

3. **Scrape:**
```bash
bun run scrape:foodora:store -- --store=FOODORA_NEW_STORE
```

## Benefits

- ✅ Simple: Each store is just a different value in the `store` column
- ✅ Clear: Easy to query and filter by store
- ✅ Scalable: Easy to add new stores
- ✅ No complexity: No extra vendor column needed
- ✅ Frontend-friendly: Simple filtering with `?store=` parameter

## Files

**Core:**
- `src/modules/product/product.types.ts` - Store type definitions
- `src/modules/foodora-scraper/foodora-db.service.ts` - Database mapper
- `src/modules/foodora-scraper/foodora-scraper-db.service.ts` - Scraper logic

**Scripts:**
- `src/scrape-foodora-to-db.ts` - Default store scraper
- `src/scrape-foodora-store.ts` - Multi-store scraper
- `src/test-foodora-db-integration.ts` - Test script

## Quick Reference

```bash
# Scrape
bun run scrape:foodora                                              # Default (D-Mart)
bun run scrape:foodora:store -- --store=FOODORA_BILLA_PROSEK       # BILLA Prosek
bun run scrape:foodora:store -- --store=FOODORA_ALBERT_FLORENC     # Albert

# Query
GET /api/products?store=BILLA                      # BILLA scraper products
GET /api/products?store=FOODORA_BILLA_PROSEK       # BILLA Prosek
GET /api/products?store=FOODORA_ALBERT_FLORENC     # Albert
GET /api/products                                   # All stores

# Database
bun run db:check                                    # Check stats
```
