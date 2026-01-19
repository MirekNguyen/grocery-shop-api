# Multi-Vendor Foodora Integration Guide

## Overview

The shop-scraper now supports multiple Foodora vendors, allowing you to scrape products from different Foodora stores (BILLA Prosek, Albert Florenc, D-Mart, etc.) and store them separately in the database.

## Database Schema Changes

### New Field: `vendor`
- **Type:** `varchar(50)`, nullable
- **Purpose:** Identifies which Foodora vendor a product belongs to
- **Values:** `'mjul'`, `'obc6'`, `'o7b0'`, etc.
- **Usage:** Combined with `store='FOODORA'` to uniquely identify product source

### Example Data Structure
```sql
store    | vendor | product_id | name
---------|--------|------------|------------------
BILLA    | NULL   | 12345      | Milk 1L
FOODORA  | mjul   | abc123     | Bread
FOODORA  | obc6   | xyz789     | Cheese
FOODORA  | o7b0   | def456     | Eggs
```

## Available Vendors

```typescript
FOODORA_VENDOR_TYPES = {
  BILLA_PROSEK: 'mjul',      // BILLA - Praha Prosek
  ALBERT_FLORENC: 'obc6',    // Albert - Praha Florenc
  DMART: 'o7b0',             // D-Mart (default)
}
```

## Scraping Commands

### Scrape Default Vendor (D-Mart)
```bash
bun run scrape:foodora
# or
bun src/scrape-foodora-to-db.ts
```

### Scrape Specific Vendor
```bash
# BILLA Prosek
bun run scrape:foodora:vendor -- --vendor=mjul

# Albert Florenc
bun run scrape:foodora:vendor -- --vendor=obc6

# D-Mart
bun run scrape:foodora:vendor -- --vendor=o7b0
```

### Test Integration
```bash
bun run scrape:foodora:test
```

## API Endpoints

### Filter by Store Only
```bash
# All Foodora products (all vendors)
GET /api/products?store=FOODORA

# All BILLA products
GET /api/products?store=BILLA
```

### Filter by Store AND Vendor
```bash
# Foodora BILLA Prosek products only
GET /api/products?store=FOODORA&vendor=mjul

# Foodora Albert Florenc products only
GET /api/products?store=FOODORA&vendor=obc6

# Foodora D-Mart products only
GET /api/products?store=FOODORA&vendor=o7b0
```

### Category Filtering
```bash
# All Foodora categories with product counts
GET /api/categories?store=FOODORA

# Categories from specific vendor
GET /api/categories?store=FOODORA&vendor=mjul

# Products in category from specific vendor
GET /api/categories/foodora-mjul-pecivo/products?store=FOODORA&vendor=mjul
```

## Category Naming Convention

Categories are prefixed with vendor code to avoid conflicts:

```typescript
// BILLA Prosek
slug: "foodora-mjul-pecivo"
key: "foodora-mjul-8d101a5c-..."

// Albert Florenc
slug: "foodora-obc6-pecivo"
key: "foodora-obc6-ded49da1-..."

// D-Mart
slug: "foodora-o7b0-pecivo"
key: "foodora-o7b0-df53bb08-..."
```

This allows the same category name (e.g., "Pečivo") to exist across different vendors without conflicts.

## Implementation Details

### Database Mapper
All Foodora products are mapped with vendor information:

```typescript
mapFoodoraProductToDb(product, categoryId, categoryName, categorySlug, vendor)
```

### Scraper Service
The scraper service accepts vendor parameter:

```typescript
scrapeFoodoraCategory(category, vendor)
scrapeAllFoodoraCategories(vendor, categories)
```

### API Controllers
Both product and category controllers support vendor filtering:

```typescript
getProducts({ store, vendor, ... })
getCategories(store, vendor)
getProductsByCategory(slug, page, limit, store, vendor)
```

## Migration

The migration adds the `vendor` field to existing products table:

```sql
ALTER TABLE "products" ADD COLUMN "vendor" varchar(50);
```

Existing products will have `vendor = NULL` (BILLA products don't use vendor field).

## Next Steps

### To Add Albert Categories
1. Get category tree JSON from Albert vendor (`obc6`)
2. Create `src/foodora-categories-albert.ts` file
3. Update `VENDOR_INFO` in `scrape-foodora-vendor.ts` to use Albert categories
4. Run scraper with `--vendor=obc6`

### Database Stats Query
```sql
SELECT 
  store,
  vendor,
  COUNT(*) as product_count
FROM products
GROUP BY store, vendor
ORDER BY store, vendor;
```

## Common Use Cases

### Scrape All Vendors
```bash
# Scrape BILLA Prosek
bun run scrape:foodora:vendor -- --vendor=mjul

# Wait for completion, then scrape Albert
bun run scrape:foodora:vendor -- --vendor=obc6

# Finally scrape D-Mart
bun run scrape:foodora:vendor -- --vendor=o7b0
```

### Query Products from Specific Store
```bash
# Frontend wants to show only Albert products
GET /api/products?store=FOODORA&vendor=obc6&limit=50

# Frontend wants to compare prices across vendors
GET /api/products?store=FOODORA&search=mleko
# Returns products from all vendors with "mleko" in name
```

### Category Management
```bash
# Show categories from BILLA Prosek with product counts
GET /api/categories?store=FOODORA&vendor=mjul

# Get products in specific vendor category
GET /api/categories/foodora-mjul-napoje/products?vendor=mjul
```

## Troubleshooting

### Products Not Showing
- Check if vendor is correctly set during scraping
- Verify category slugs include vendor prefix
- Ensure API filters include correct vendor code

### Category Conflicts
- Categories are automatically prefixed with vendor
- If conflicts occur, check category creation in `foodora-db.service.ts`

### Migration Issues
- Run `bun run db:migrate` to apply vendor field migration
- Check migration status: `bun run db:check`

## Files Modified

- `src/modules/product/product.schema.ts` - Added vendor field
- `src/modules/product/product.types.ts` - Added FOODORA_VENDOR_TYPES
- `src/modules/foodora-scraper/foodora-db.service.ts` - Updated mappers for vendor
- `src/modules/foodora-scraper/foodora-scraper-db.service.ts` - Added vendor parameter
- `src/modules/product/product.controller.api.ts` - Added vendor filtering
- `src/modules/category/category.controller.api.ts` - Added vendor filtering
- `src/api.ts` - Added vendor query parameter
- `src/scrape-foodora-vendor.ts` - New multi-vendor CLI script
- `package.json` - Added scrape:foodora:vendor script
