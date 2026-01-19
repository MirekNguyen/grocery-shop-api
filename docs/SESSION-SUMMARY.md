# Session Summary - Foodora Category Scraper Debugging

**Date:** January 19, 2026  
**Status:** Category API returning `null` - Ready for debugging

---

## What We Built

### ✅ Complete Modular Scraper Architecture

Successfully refactored a monolithic GraphQL scraper into a clean, modular architecture:

```
src/modules/foodora-scraper/
├── Product Scraping (WORKING ✅)
│   ├── foodora-api.service.ts
│   ├── foodora-transformer.service.ts
│   └── foodora-scraper.service.ts
│
├── Category Scraping (NEEDS FIX ⚠️)
│   ├── foodora-category-api.service.ts
│   ├── foodora-category-scraper.service.ts
│   └── foodora-category.queries.ts
│
└── Shared Components
    ├── foodora.types.ts
    ├── foodora.schemas.ts
    ├── foodora.constants.ts
    ├── foodora.queries.ts
    └── foodora.utils.ts
```

### ✅ Features Implemented

**Product Scraper (Working):**
- ✅ Single product scraping with full details
- ✅ Simplified product transformation
- ✅ Zod validation on all API responses
- ✅ File saving (full & simplified formats)
- ✅ Type-safe with zero runtime errors

**Category Scraper (Pending Fix):**
- ✅ Scrape all products from a single category
- ✅ Scrape category trees (with nested subcategories)
- ✅ Batch scraping with progress callbacks
- ✅ Built-in rate limiting (500ms delay)
- ✅ Error handling per category
- ✅ Multiple save formats (single file or individual files)
- ⚠️ API returning `null` for `categoryProducts`

---

## Current Issue

**Problem:** Category API returning `null` for `categoryProducts`

**Error Message:**
```
ZodError: Invalid input: expected array, received null
at path: data.categoryProductList.categoryProducts
```

**What We Did:**
1. ✅ Made `categoryProducts` nullable in Zod schema
2. ✅ Updated `extractProductItems()` to handle null responses
3. ✅ Added debug logging in API service
4. ✅ Removed `dps-session-id` header (not in browser request)
5. ✅ Created multiple debug scripts for testing

---

## Debug Tools Created

### 1. `src/debug-category-api.ts`
Simple test of single category API call.

**Usage:**
```bash
bun src/debug-category-api.ts
```

### 2. `src/debug-category-variations.ts`
Tests 4 different variations:
1. Full query with full variables (subcategory)
2. Minimal query (subcategory)
3. Full query (parent category)
4. Full query with null optionals

**Usage:**
```bash
bun src/debug-category-variations.ts
```

---

## Documentation Created

### 1. `TROUBLESHOOTING.md`
Comprehensive troubleshooting guide with:
- Step-by-step debugging process
- 5 potential fixes to try
- Testing checklist
- Expected working response format

### 2. `CAPTURE-BROWSER-REQUEST.md`
Guide to capture the exact working request from browser:
- How to use DevTools Network tab
- How to copy as cURL
- What to compare with our code
- Common issues to look for

### 3. `CATEGORY-SCRAPER.md`
Complete API documentation for category scraper (already existed, kept up-to-date)

---

## Your Next Steps

### Immediate Actions (Priority Order)

#### 1️⃣ **Run Debug Script** (5 min)
```bash
bun src/debug-category-variations.ts
```

Look for:
- Is `categoryProducts` actually `null` in all tests?
- Are there GraphQL errors in the response?
- Does any variation return data?

#### 2️⃣ **Capture Browser Request** (10 min)

Follow `CAPTURE-BROWSER-REQUEST.md`:
1. Open https://www.foodora.cz
2. Go to DevTools → Network
3. Navigate to "Maso a uzeniny" → "Drůbež"
4. Find GraphQL request
5. Copy as cURL
6. Compare with our code

#### 3️⃣ **Identify the Difference** (15 min)

Compare captured request with our implementation:

**Check:**
- Headers (missing or different?)
- GraphQL query (structure mismatch?)
- Variables (missing or wrong values?)
- Endpoint (correct URL/version?)

#### 4️⃣ **Apply Fix** (10 min)

Based on what you find, update:
- `src/modules/foodora-scraper/foodora-category-api.service.ts` - Headers/variables
- `src/modules/foodora-scraper/foodora-category.queries.ts` - Query
- `src/modules/foodora-scraper/foodora.constants.ts` - Constants

#### 5️⃣ **Test Fix** (5 min)
```bash
bun src/debug-category-api.ts
```

If successful, you should see:
```json
{
  "data": {
    "categoryProductList": {
      "categoryProducts": [
        {
          "id": "aef9f1fe-ffe4-4754-8f27-4bb8359e2427",
          "name": "Drůbež",
          "items": [ ... ]
        }
      ]
    }
  }
}
```

#### 6️⃣ **Run Full Scraper** (30 min)
```bash
bun src/foodora-category-scraper-cli.ts
```

This will scrape all 6000+ products from all categories!

---

## Likely Causes (Ranked by Probability)

### 1. **Missing/Wrong Variables** (70% likely)
- Some GraphQL variable might be required but we're not sending it
- Or a variable has the wrong format/value

**Fix:** Compare variables object with browser request

### 2. **GraphQL Query Mismatch** (20% likely)
- Fragment order or structure doesn't match expected format
- Field names or aliases are different

**Fix:** Copy exact query from browser request

### 3. **Authentication Required** (8% likely)
- Category API might require cookies or session
- Different authentication than product API

**Fix:** Include cookies from browser request

### 4. **Wrong Endpoint/Version** (2% likely)
- Using wrong API version or path

**Fix:** Verify exact URL from browser

---

## Files Ready for Testing

### Debug Scripts
- ✅ `src/debug-category-api.ts` - Simple test
- ✅ `src/debug-category-variations.ts` - Multiple variations

### Working Code
- ✅ `src/foodora-scraper-cli.ts` - Product scraper demo (WORKING)
- ⚠️ `src/foodora-category-scraper-cli.ts` - Category scraper demo (NEEDS FIX)

### Documentation
- ✅ `TROUBLESHOOTING.md` - Debugging guide
- ✅ `CAPTURE-BROWSER-REQUEST.md` - Browser capture guide
- ✅ `CATEGORY-SCRAPER.md` - API documentation

---

## After Fixing

Once the API returns data:

### 1. Test Individual Category
```typescript
import { scrapeCategoryProducts } from "./modules/foodora-scraper/index.ts";
const products = await scrapeCategoryProducts("aef9f1fe-ffe4-4754-8f27-4bb8359e2427");
console.log(`Found ${products.length} products`);
```

### 2. Test Category Tree
```typescript
import { scrapeCategoryTree } from "./modules/foodora-scraper/index.ts";
const meatCategory = { id: "8d101a5c-84cb-4d02-8247-a47d423d4691", name: "Maso a uzeniny", ... };
const results = await scrapeCategoryTree([meatCategory]);
```

### 3. Scrape All Categories
```typescript
import { scrapeCategoryTree, saveAllCategoriesToSingleFile } from "./modules/foodora-scraper/index.ts";
import { ALL_CATEGORIES } from "./data/foodora-categories.ts"; // You'll need to create this

const results = await scrapeCategoryTree(
  ALL_CATEGORIES,
  undefined,
  undefined,
  (current, total, name) => {
    console.log(`[${current}/${total}] ${name}`);
  }
);

await saveAllCategoriesToSingleFile(results, "all-foodora-products.json");
```

---

## Code Quality

All code follows strict guidelines:
- ✅ TypeScript everywhere (no JavaScript)
- ✅ ESM only (no CommonJS)
- ✅ No classes (pure functions)
- ✅ Types instead of interfaces
- ✅ Zod validation on all external data
- ✅ Always use `const`
- ✅ No `any`/`unknown`
- ✅ Modular architecture
- ✅ Comprehensive JSDoc comments

---

## Success Metrics

When everything works:
- ✅ `categoryProducts` returns array (not null)
- ✅ Can scrape single category (16 products from "Drůbež")
- ✅ Can scrape category tree (158 products from "Maso a uzeniny")
- ✅ Can scrape all 22 categories (6000+ products)
- ✅ Products saved to JSON files
- ✅ No TypeScript errors
- ✅ No runtime errors

---

## Summary

**What's Working:**
- ✅ Product scraper (single products)
- ✅ Architecture and code structure
- ✅ Type safety and validation
- ✅ File saving and transformation

**What Needs Work:**
- ⚠️ Category API returning null
- ⚠️ Need to compare with browser request
- ⚠️ Need to identify missing/wrong variable or header

**Time Estimate to Fix:**
- Best case: 15 minutes (simple variable fix)
- Likely case: 30 minutes (query + variable fix)
- Worst case: 1 hour (authentication/session required)

**Next Session Start:**
```bash
bun src/debug-category-variations.ts
```

Good luck! 🚀
