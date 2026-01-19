# Database Cleanup - Invalid Stores Removed

## Summary

Removed all invalid stores and orphaned data from the database that were created when the scraping code was incorrect.

## What Was Deleted

### Invalid Stores & Products
- **BILLA**: 9,531 products ❌ (old data before proper store names)
- **FOODORA**: 5,502 products ❌ (generic name from incorrect scraping)
- **TEST_API_STORE**: 7 products ❌ (test data)
- **FOODORA_DMART**: 44 products ❌ (test vendor)

**Total products deleted**: 15,084 products

### Orphaned Categories
- **1,044 categories** deleted (categories from old/invalid stores)

## What Remains

### Valid Stores
- ✅ **FOODORA_BILLA_PROSEK**: 5,803 products
- ✅ **FOODORA_ALBERT_FLORENC**: 5,141 products

**Total valid products**: 10,944 products

### Valid Categories
- **311 categories** remain (all properly formatted with hierarchy)

## Cleanup Process

### 1. Deleted Products from Invalid Stores
```sql
DELETE FROM product_categories WHERE product_id IN (SELECT id FROM products WHERE store IN ('BILLA', 'FOODORA', 'TEST_API_STORE', 'FOODORA_DMART'));
DELETE FROM products WHERE store IN ('BILLA', 'FOODORA', 'TEST_API_STORE', 'FOODORA_DMART');
```

### 2. Deleted Orphaned Categories
```sql
DELETE FROM product_categories WHERE category_id IN (
  SELECT id FROM categories 
  WHERE key NOT LIKE 'foodora-billa-prosek-%' 
  AND key NOT LIKE 'foodora-albert-florenc-%'
);

DELETE FROM categories 
WHERE key NOT LIKE 'foodora-billa-prosek-%' 
AND key NOT LIKE 'foodora-albert-florenc-%';
```

### 3. Re-indexed Meilisearch
- Cleared old index
- Re-indexed 10,944 valid products
- Index now only contains products from valid stores

## Verification

### Products by Store
```
FOODORA_BILLA_PROSEK: 5,803 products
FOODORA_ALBERT_FLORENC: 5,141 products
```

### Categories
All 311 categories follow the correct naming pattern:
- `foodora-billa-prosek-{uuid}` or `foodora-billa-prosek-{slug}`
- `foodora-albert-florenc-{uuid}` or `foodora-albert-florenc-{slug}`

### Meilisearch Index
- Documents: 10,944 (matches database count)
- All products properly indexed with correct store field

## Impact on Frontend

The store selector will now only show:
- ✅ FOODORA BILLA PROSEK (5,803 products)
- ✅ FOODORA ALBERT FLORENC (5,141 products)

Invalid stores no longer appear:
- ❌ BILLA
- ❌ FOODORA
- ❌ TEST_API_STORE
- ❌ FOODORA_DMART

## Database Statistics

### Before Cleanup
- Products: 26,028
- Categories: 1,355
- Stores: 6

### After Cleanup
- Products: 10,944 (↓ 58%)
- Categories: 311 (↓ 77%)
- Stores: 2 (↓ 67%)

## Benefits

1. **Cleaner UI**: Only valid stores shown to users
2. **Better Performance**: Smaller index, faster queries
3. **No Confusion**: No duplicate/test stores
4. **Accurate Data**: All products belong to real, active stores
5. **Proper Hierarchy**: All categories follow the correct structure

## Files Changed

No code changes - this was a pure data cleanup operation.

## Rollback (if needed)

If you need the old data back, you would need to re-scrape those stores. However, the old `BILLA` and `FOODORA` stores were from incorrect scraping code, so they should not be restored.

The current state is the **correct** state with only properly scraped data.
