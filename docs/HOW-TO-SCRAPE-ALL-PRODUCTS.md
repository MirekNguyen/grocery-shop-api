# How to Scrape All Products

## Current Status

You just ran the **product scraper** which scrapes **one product at a time**:
```bash
bun src/foodora-scraper-cli.ts
# Result: 1 product (ID: 119547085)
```

To get **all products**, you need to use the **category scraper**.

---

## ⚠️ First: Test Category API

The category scraper had an issue (returning `null`). We fixed it, but you need to test it first:

```bash
bun src/test-category-fix.ts
```

### Expected Results

**✅ If it works:**
```
✅ SUCCESS! Got 1 category groups
📦 Category: Drůbež (ID: aef9f1fe-...)
   Products: 16
   First product: DZ Klatovy Kuřecí steak...
```

**❌ If still broken:**
```
⚠️ categoryProducts is still null
```

→ If still null, follow [docs/CAPTURE-BROWSER-REQUEST.md](../docs/CAPTURE-BROWSER-REQUEST.md)

---

## Option 1: Scrape All Categories (Full Catalog)

Once the category API works, you can scrape all 6000+ products.

### Step 1: Get Category List

You need the full category tree. Create a file with all Foodora categories:

**`src/foodora-categories-full.ts`:**
```typescript
export const FOODORA_CATEGORIES = [
  {
    id: "8d101a5c-84cb-4d02-8247-a47d423d4691",
    name: "Maso a uzeniny",
    numberOfProducts: 158,
    type: "DEFAULT",
    children: [
      { id: "aef9f1fe-ffe4-4754-8f27-4bb8359e2427", name: "Drůbež", numberOfProducts: 16, type: "DEFAULT" },
      { id: "7771d1cb-bff9-414c-b535-2d11ae1ae617", name: "Uzeniny", numberOfProducts: 92, type: "DEFAULT" },
      { id: "cf0b00fc-ab28-495f-b4d6-6dd16e1e7bda", name: "Hovězí a vepřové", numberOfProducts: 50, type: "DEFAULT" },
      // ... more subcategories
    ],
  },
  {
    id: "some-category-id",
    name: "Nápoje",
    numberOfProducts: 933,
    type: "DEFAULT",
    children: [
      // ... subcategories
    ],
  },
  // Add all 22 main categories here...
];
```

**Where to get category IDs?**
1. Browse https://www.foodora.cz
2. Open DevTools → Network
3. Navigate categories
4. Find GraphQL request with category data
5. Copy category tree from response

### Step 2: Create Scraper Script

**`src/scrape-all-foodora.ts`:**
```typescript
import { scrapeCategoryTree, saveAllCategoriesToSingleFile } from "./modules/foodora-scraper/index.ts";
import { FOODORA_CATEGORIES } from "./foodora-categories-full.ts";

const main = async (): Promise<void> => {
  console.log("🛒 Scraping ALL Foodora products...\n");
  console.log(`Categories to scrape: ${FOODORA_CATEGORIES.length}`);
  
  const startTime = Date.now();
  
  try {
    // Scrape all categories with progress tracking
    const results = await scrapeCategoryTree(
      FOODORA_CATEGORIES,
      undefined, // vendorCode
      undefined, // userCode
      (current, total, categoryName) => {
        const elapsed = ((Date.now() - startTime) / 1000).toFixed(1);
        console.log(`[${current}/${total}] [${elapsed}s] ${categoryName}`);
      }
    );

    // Calculate stats
    const totalProducts = Object.values(results).reduce(
      (sum, products) => sum + products.length,
      0
    );
    
    const elapsed = ((Date.now() - startTime) / 1000).toFixed(1);

    console.log(`\n✅ Scraping complete!`);
    console.log(`   Categories: ${Object.keys(results).length}`);
    console.log(`   Products: ${totalProducts}`);
    console.log(`   Time: ${elapsed}s`);

    // Save to file
    console.log(`\n💾 Saving to file...`);
    await saveAllCategoriesToSingleFile(results, "output/all-foodora-products.json");
    console.log(`✅ Saved to: output/all-foodora-products.json`);

    // Show sample products
    console.log(`\n📦 Sample products:`);
    const firstCategory = Object.values(results)[0];
    if (firstCategory && firstCategory.length > 0) {
      firstCategory.slice(0, 3).forEach((p, i) => {
        console.log(`   ${i + 1}. ${p.name} - ${p.price} Kč`);
      });
    }

  } catch (error) {
    console.error("\n❌ Error:", error);
    throw error;
  }
};

if (import.meta.main) {
  main();
}
```

### Step 3: Run Full Scraper

```bash
bun src/scrape-all-foodora.ts
```

**Expected output:**
```
🛒 Scraping ALL Foodora products...

Categories to scrape: 22
[1/122] [0.5s] Maso a uzeniny
[2/122] [1.2s] Drůbež
[3/122] [1.9s] Uzeniny
...
[122/122] [61.5s] Last category

✅ Scraping complete!
   Categories: 122
   Products: 6247
   Time: 61.5s

💾 Saving to file...
✅ Saved to: output/all-foodora-products.json
```

**Time estimate:**
- ~122 categories (including subcategories)
- ~500ms delay per category
- ~1-2 minutes total

---

## Option 2: Scrape Specific Categories

If you don't want everything, scrape specific categories:

**`src/scrape-specific-categories.ts`:**
```typescript
import { scrapeMultipleCategories, saveAllCategoriesToSingleFile } from "./modules/foodora-scraper/index.ts";

const main = async (): Promise<void> => {
  console.log("🛒 Scraping specific categories...\n");
  
  // Define which categories you want
  const categoryIds = [
    "aef9f1fe-ffe4-4754-8f27-4bb8359e2427", // Drůbež (16 products)
    "7771d1cb-bff9-414c-b535-2d11ae1ae617", // Uzeniny (92 products)
    // Add more category IDs as needed
  ];

  const results = await scrapeMultipleCategories(
    categoryIds,
    undefined,
    undefined,
    (current, total, categoryId) => {
      console.log(`[${current}/${total}] ${categoryId}`);
    }
  );

  const totalProducts = Object.values(results).reduce(
    (sum, products) => sum + products.length,
    0
  );

  console.log(`\n✅ Found ${totalProducts} products across ${categoryIds.length} categories`);

  await saveAllCategoriesToSingleFile(results, "output/selected-categories.json");
  console.log(`💾 Saved to: output/selected-categories.json`);
};

if (import.meta.main) {
  main();
}
```

---

## Option 3: Use Existing Category Scraper Demo

The category scraper demo already exists but is commented out:

**Edit `src/foodora-category-scraper-cli.ts`:**

Uncomment lines 137-162 (the "Example 3" section):

```typescript
// Example 3: Scrape ALL categories (commented out by default)
// UNCOMMENT THIS SECTION:
console.log("\n📦 Example 3: Scraping ALL categories...\n");
const allResults = await scrapeCategoryTree(
  FOODORA_CATEGORIES,
  undefined,
  undefined,
  (current, total, categoryName) => {
    console.log(`   [${current}/${total}] ${categoryName}`);
  }
);

const grandTotal = Object.values(allResults).reduce(
  (sum, products) => sum + products.length,
  0
);

console.log(`\n✅ Scraped ${grandTotal} total products from ${Object.keys(allResults).length} categories`);

// Save all to single file
await saveAllCategoriesToSingleFile(allResults, "output/all-foodora-products.json");
console.log("💾 Saved all products to: output/all-foodora-products.json");

// Or save to individual files per category
await saveAllCategories(allResults, "output/scraped-categories");
console.log("💾 Saved individual category files to: output/scraped-categories/");
```

Then run:
```bash
bun src/foodora-category-scraper-cli.ts
```

---

## Comparison: Product Scraper vs Category Scraper

| Feature | Product Scraper | Category Scraper |
|---------|----------------|------------------|
| **Input** | Product ID | Category ID(s) |
| **Output** | 1 product | Many products |
| **Detail Level** | Full details | Basic details (no nutrition) |
| **Speed** | ~500ms per product | ~500ms per category (~16 products) |
| **Use Case** | Detailed single product | Bulk scraping |
| **File** | `foodora-scraper-cli.ts` | `foodora-category-scraper-cli.ts` |

---

## Performance Estimates

| Task | Categories | Products | Time |
|------|-----------|----------|------|
| Single category | 1 | ~16 | ~1 second |
| Category tree (Maso) | 7 | ~158 | ~5 seconds |
| Top 5 categories | ~30 | ~2000 | ~30 seconds |
| **All categories** | **~122** | **~6000** | **~2 minutes** |

---

## ⚠️ Important Notes

### Rate Limiting
- Current delay: 500ms between categories
- Don't reduce below 300ms to avoid rate limiting
- If you get errors, increase delay

### Duplicates
Products may appear in multiple categories. To deduplicate:

```typescript
import { scrapeCategoryTree } from "./modules/foodora-scraper/index.ts";

const results = await scrapeCategoryTree(categories);

// Deduplicate by productID
const allProducts = Object.values(results).flat();
const uniqueProducts = Array.from(
  new Map(allProducts.map(p => [p.productID, p])).values()
);

console.log(`Total: ${allProducts.length}`);
console.log(`Unique: ${uniqueProducts.length}`);
console.log(`Duplicates: ${allProducts.length - uniqueProducts.length}`);
```

### Memory Usage
- 6000 products = ~50-100MB in memory
- Should be fine for most systems
- Outputs to JSON file (10-50MB)

---

## 🚀 Recommended Workflow

1. **Test category API first:**
   ```bash
   bun src/test-category-fix.ts
   ```

2. **If working, scrape one category:**
   ```bash
   bun src/foodora-category-scraper-cli.ts
   # (runs Example 1 & 2, ~158 products)
   ```

3. **If successful, scrape all:**
   - Uncomment Example 3 in `foodora-category-scraper-cli.ts`
   - Run: `bun src/foodora-category-scraper-cli.ts`
   - Wait ~2 minutes
   - Check: `output/all-foodora-products.json`

4. **Process the data:**
   ```bash
   # Count products
   cat output/all-foodora-products.json | jq '.totalProducts'
   
   # Show categories
   cat output/all-foodora-products.json | jq '.totalCategories'
   
   # Get product names
   cat output/all-foodora-products.json | jq '.categories[].[] | .name' | head -20
   ```

---

## 📁 Output Structure

After scraping all products:

```
output/
├── all-foodora-products.json    # All products (single file)
├── scraped-categories/           # Or individual files
│   ├── category-id-1.json
│   ├── category-id-2.json
│   └── ...
└── README.md
```

---

## 🆘 Troubleshooting

| Issue | Solution |
|-------|----------|
| Category API returns null | Follow [docs/TROUBLESHOOTING.md](../docs/TROUBLESHOOTING.md) |
| Rate limiting (429 errors) | Increase delay in scraper service |
| Memory issues | Scrape in batches, save incrementally |
| Missing categories | Capture full category tree from browser |

---

## Next Steps

1. ✅ Test category API: `bun src/test-category-fix.ts`
2. ⏳ If working, scrape all: uncomment Example 3
3. 🎉 Process 6000+ products!

For detailed strategies (concurrent, priority-based, incremental), see:
**[docs/SCRAPING-STRATEGIES.md](../docs/SCRAPING-STRATEGIES.md)**
