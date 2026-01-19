# Category API Fix - Applied Changes

## ✅ Issue Identified

Running `bun src/debug-category-variations.ts` revealed:

```
❌ GraphQL Errors:
  - Variable "$attributes" is never used.
```

**Root Cause:** The `$attributes` variable was declared in the query but not actually used in the GraphQL query body. The fragment had `attributes(keys: $attributes)` but this field wasn't being properly expanded/used.

## 🛠️ Changes Applied

### 1. Updated GraphQL Query (`foodora-category.queries.ts`)

**Removed:**
- `$attributes` parameter from query declaration
- `attributes(keys: $attributes)` field from ProductFields fragment

**Before:**
```graphql
fragment ProductFields on Product {
  attributes(keys: $attributes) {
    key
    value
  }
  activeCampaigns {
    ...
  }
}

query getProductsByCategoryList(
  $attributes: [String!]
  $categoryId: String!
  ...
) {
  ...
}
```

**After:**
```graphql
fragment ProductFields on Product {
  activeCampaigns {
    ...
  }
}

query getProductsByCategoryList(
  $categoryId: String!
  ...
) {
  ...
}
```

### 2. Updated API Service (`foodora-category-api.service.ts`)

**Removed** `attributes` from variables object:

**Before:**
```typescript
return {
  categoryId,
  attributes: DEFAULT_ATTRIBUTES,  // ❌ Removed
  featureFlags: DEFAULT_FEATURE_FLAGS,
  ...
};
```

**After:**
```typescript
return {
  categoryId,
  featureFlags: DEFAULT_FEATURE_FLAGS,
  ...
};
```

### 3. Updated TypeScript Types (`foodora-category.types.ts`)

**Removed** `attributes` from `CategoryProductsVariables`:

**Before:**
```typescript
export type CategoryProductsVariables = {
  categoryId: string;
  attributes: string[];  // ❌ Removed
  featureFlags: { key: string; value: string }[];
  ...
};
```

**After:**
```typescript
export type CategoryProductsVariables = {
  categoryId: string;
  featureFlags: { key: string; value: string }[];
  ...
};
```

### 4. Updated Zod Schema (`foodora-category.schemas.ts`)

**Removed** `attributes` from product schema since we're not fetching it:

**Before:**
```typescript
export const categoryProductItemSchema = z.object({
  attributes: z.array(productAttributeSchema),  // ❌ Removed
  activeCampaigns: z.array(activeCampaignSchema).nullable(),
  ...
});
```

**After:**
```typescript
export const categoryProductItemSchema = z.object({
  activeCampaigns: z.array(activeCampaignSchema).nullable(),
  ...
});
```

### 5. Updated Documentation (`CATEGORY-SCRAPER.md`)

**Removed** `attributes` field from type documentation.

## 🧪 Testing

### Test the Fix

```bash
# Quick test
bun src/test-category-fix.ts

# Or run debug variations again
bun src/debug-category-variations.ts

# Or test the category scraper CLI
bun src/foodora-category-scraper-cli.ts
```

### Expected Result

**Before Fix:**
```json
{
  "errors": [
    {
      "message": "Variable \"$attributes\" is never used."
    }
  ]
}
```

**After Fix:**
```json
{
  "data": {
    "categoryProductList": {
      "categoryProducts": [
        {
          "id": "aef9f1fe-ffe4-4754-8f27-4bb8359e2427",
          "name": "Drůbež",
          "items": [
            {
              "productID": "119528257",
              "name": "DZ Klatovy Kuřecí steak...",
              "price": 79.9,
              ...
            }
          ]
        }
      ]
    }
  }
}
```

## 📝 Notes

### Why Remove Attributes?

The `attributes` field is optional product metadata (SKU, nutritional info, etc.). Since it was causing validation errors and isn't strictly necessary for basic product scraping, we removed it to fix the immediate issue.

### If You Need Attributes Later

If you need product attributes in the future, you can add them back **without** the `keys` parameter:

```graphql
fragment ProductFields on Product {
  attributes {
    key
    value
  }
  activeCampaigns {
    ...
  }
}
```

Or query all products first, then fetch individual products with full details (including attributes) using the product scraper.

## ✅ Files Modified

1. ✅ `src/modules/foodora-scraper/foodora-category.queries.ts` - Removed $attributes
2. ✅ `src/modules/foodora-scraper/foodora-category-api.service.ts` - Removed from variables
3. ✅ `src/modules/foodora-scraper/foodora-category.types.ts` - Removed from type
4. ✅ `src/modules/foodora-scraper/foodora-category.schemas.ts` - Removed from schema
5. ✅ `CATEGORY-SCRAPER.md` - Updated docs

## 🚀 Next Steps

1. **Test the fix:**
   ```bash
   bun src/test-category-fix.ts
   ```

2. **If successful, run full scraper:**
   ```bash
   bun src/foodora-category-scraper-cli.ts
   ```

3. **If still returning null:**
   - Follow [CAPTURE-BROWSER-REQUEST.md](./CAPTURE-BROWSER-REQUEST.md)
   - Compare with exact browser request
   - Check if other variables/headers are wrong

4. **Once working, scrape all categories:**
   ```typescript
   import { scrapeCategoryTree } from "./modules/foodora-scraper/index.ts";
   // Scrape all 6000+ products!
   ```

## 🎉 Expected Outcome

After this fix:
- ✅ No more GraphQL validation errors
- ✅ API should return category products (if not null for other reasons)
- ✅ Can proceed with full category scraping

---

**Status:** Fix applied, ready for testing  
**Test Command:** `bun src/test-category-fix.ts`
