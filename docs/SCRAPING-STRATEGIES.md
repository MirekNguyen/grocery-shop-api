# Category Scraping Strategies

## Current Strategy: Sequential Category Scraping ✅

**How it works:**
```typescript
for (const category of categories) {
  const products = await fetchCategoryProducts(category.id);
  results[category.id] = products;
  await delay(500); // Rate limiting
}
```

**Performance:**
- 22 main categories + 100+ subcategories
- ~122 API calls × 500ms delay = ~61 seconds minimum
- Plus API response time (~500ms each) = ~2 minutes total

---

## Alternative Strategies

### Strategy 1: Concurrent Scraping (Faster)

Scrape multiple categories in parallel with controlled concurrency:

```typescript
/**
 * Scrapes multiple categories concurrently with controlled parallelism
 * @param categoryIds - Categories to scrape
 * @param concurrency - Number of parallel requests (default: 3)
 */
export const scrapeCategoriesConcurrent = async (
  categoryIds: string[],
  concurrency: number = 3,
  vendorCode?: string,
  userCode?: string,
  onProgress?: (current: number, total: number, categoryId: string) => void
): Promise<{ [categoryId: string]: CategoryProductItem[] }> => {
  const results: { [categoryId: string]: CategoryProductItem[] } = {};
  let completed = 0;

  // Process categories in batches
  for (let i = 0; i < categoryIds.length; i += concurrency) {
    const batch = categoryIds.slice(i, i + concurrency);
    
    const batchPromises = batch.map(async (categoryId) => {
      try {
        const products = await scrapeCategoryProducts(categoryId, vendorCode, userCode);
        results[categoryId] = products;
        
        completed++;
        if (onProgress) {
          onProgress(completed, categoryIds.length, categoryId);
        }
      } catch (error) {
        console.error(`Error scraping category ${categoryId}:`, error);
        results[categoryId] = [];
      }
    });

    await Promise.all(batchPromises);
    
    // Small delay between batches
    if (i + concurrency < categoryIds.length) {
      await new Promise((resolve) => setTimeout(resolve, 300));
    }
  }

  return results;
};
```

**Performance:**
- 122 categories / 3 concurrent = ~41 batches
- ~41 × 300ms delay = ~12 seconds
- Plus API response time (~500ms) = **~30 seconds total**
- **4x faster** than sequential!

**Pros:**
- ✅ Much faster (4x speedup)
- ✅ Still respects rate limits
- ✅ Controllable concurrency

**Cons:**
- ⚠️ Higher risk of rate limiting if concurrency too high
- ⚠️ More complex error handling

---

### Strategy 2: Smart Category Selection (Most Products First)

Scrape high-value categories first:

```typescript
/**
 * Scrapes categories ordered by number of products (most products first)
 */
export const scrapeCategoriesByPriority = async (
  categories: CategoryDefinition[],
  vendorCode?: string,
  userCode?: string,
  onProgress?: (current: number, total: number, categoryName: string, productsFound: number) => void
): Promise<{ [categoryId: string]: CategoryProductItem[] }> => {
  // Flatten and sort by numberOfProducts (descending)
  const flatCategories = flattenCategories(categories)
    .sort((a, b) => (b.numberOfProducts || 0) - (a.numberOfProducts || 0));

  const results: { [categoryId: string]: CategoryProductItem[] } = {};
  let totalProductsFound = 0;

  for (const [index, category] of flatCategories.entries()) {
    try {
      const products = await scrapeCategoryProducts(category.id, vendorCode, userCode);
      results[category.id] = products;
      totalProductsFound += products.length;

      if (onProgress) {
        onProgress(index + 1, flatCategories.length, category.name, totalProductsFound);
      }

      await new Promise((resolve) => setTimeout(resolve, 500));
    } catch (error) {
      console.error(`Error scraping category ${category.name}:`, error);
      results[category.id] = [];
    }
  }

  return results;
};
```

**Example order:**
```
1. Nápoje (933 products)
2. Mléčné výrobky (454 products)
3. Pečivo (214 products)
4. Maso a uzeniny (158 products)
...
22. Více za méně (33 products)
```

**Pros:**
- ✅ Get most products quickly
- ✅ Can stop early and still have lots of data
- ✅ Better progress tracking

---

### Strategy 3: Deduplication (Handle Duplicate Products)

Products can appear in multiple categories. Deduplicate by `productID`:

```typescript
/**
 * Deduplicates products across all categories
 */
export const deduplicateProducts = (
  categoryResults: { [categoryId: string]: CategoryProductItem[] }
): {
  uniqueProducts: CategoryProductItem[];
  productToCategories: { [productId: string]: string[] };
} => {
  const productMap = new Map<string, CategoryProductItem>();
  const productToCategories: { [productId: string]: string[] } = {};

  for (const [categoryId, products] of Object.entries(categoryResults)) {
    for (const product of products) {
      const productId = product.productID;

      // Store unique product
      if (!productMap.has(productId)) {
        productMap.set(productId, product);
      }

      // Track which categories contain this product
      if (!productToCategories[productId]) {
        productToCategories[productId] = [];
      }
      productToCategories[productId].push(categoryId);
    }
  }

  return {
    uniqueProducts: Array.from(productMap.values()),
    productToCategories,
  };
};
```

**Usage:**
```typescript
const categoryResults = await scrapeCategoryTree(categories);
const { uniqueProducts, productToCategories } = deduplicateProducts(categoryResults);

console.log(`Total products found: ${Object.values(categoryResults).flat().length}`);
console.log(`Unique products: ${uniqueProducts.length}`);
console.log(`Duplicates removed: ${Object.values(categoryResults).flat().length - uniqueProducts.length}`);

// Find products in multiple categories
const multiCategoryProducts = Object.entries(productToCategories)
  .filter(([_, categories]) => categories.length > 1);
  
console.log(`Products in multiple categories: ${multiCategoryProducts.length}`);
```

---

### Strategy 4: Incremental Scraping (Save Progress)

Save progress as you go to resume if interrupted:

```typescript
/**
 * Scrapes categories with progress saving
 */
export const scrapeCategoriesIncremental = async (
  categoryIds: string[],
  checkpointFile: string = "./scrape-progress.json",
  vendorCode?: string,
  userCode?: string,
  onProgress?: (current: number, total: number, categoryId: string) => void
): Promise<{ [categoryId: string]: CategoryProductItem[] }> => {
  // Load existing progress
  let results: { [categoryId: string]: CategoryProductItem[] } = {};
  try {
    const file = Bun.file(checkpointFile);
    if (await file.exists()) {
      results = await file.json();
      console.log(`Resumed from checkpoint: ${Object.keys(results).length} categories already scraped`);
    }
  } catch (error) {
    console.log("Starting fresh scrape");
  }

  const remaining = categoryIds.filter((id) => !results[id]);

  for (const [index, categoryId] of remaining.entries()) {
    try {
      const products = await scrapeCategoryProducts(categoryId, vendorCode, userCode);
      results[categoryId] = products;

      // Save progress after each category
      await Bun.write(checkpointFile, JSON.stringify(results, null, 2));

      if (onProgress) {
        onProgress(
          categoryIds.length - remaining.length + index + 1,
          categoryIds.length,
          categoryId
        );
      }

      await new Promise((resolve) => setTimeout(resolve, 500));
    } catch (error) {
      console.error(`Error scraping category ${categoryId}:`, error);
      results[categoryId] = [];
      
      // Save even on error
      await Bun.write(checkpointFile, JSON.stringify(results, null, 2));
    }
  }

  return results;
};
```

**Pros:**
- ✅ Can resume if interrupted
- ✅ Progress is never lost
- ✅ Safe for long-running scrapes

---

## Comparison

| Strategy | Speed | Safety | Complexity | Best For |
|----------|-------|--------|------------|----------|
| Sequential (Current) | ⭐⭐ | ⭐⭐⭐⭐⭐ | ⭐ | Safe, reliable scraping |
| Concurrent | ⭐⭐⭐⭐⭐ | ⭐⭐⭐ | ⭐⭐⭐ | Fast scraping (if API allows) |
| Priority-based | ⭐⭐ | ⭐⭐⭐⭐⭐ | ⭐⭐ | Getting most data quickly |
| Incremental | ⭐⭐ | ⭐⭐⭐⭐⭐ | ⭐⭐⭐ | Long scrapes, unreliable network |

---

## Recommended: Hybrid Approach

Combine the best of all strategies:

```typescript
/**
 * Complete scraping solution with all optimizations
 */
export const scrapeAllProducts = async (
  categories: CategoryDefinition[],
  options: {
    concurrency?: number;
    prioritize?: boolean;
    deduplicate?: boolean;
    saveProgress?: boolean;
    checkpointFile?: string;
  } = {}
): Promise<{
  byCategory: { [categoryId: string]: CategoryProductItem[] };
  uniqueProducts?: CategoryProductItem[];
  stats: {
    totalCategories: number;
    totalProducts: number;
    uniqueProducts: number;
    duplicates: number;
    timeElapsed: number;
  };
}> => {
  const startTime = Date.now();
  
  // Flatten categories
  let flatCategories = flattenCategories(categories);
  
  // Prioritize if requested
  if (options.prioritize) {
    flatCategories = flatCategories
      .sort((a, b) => (b.numberOfProducts || 0) - (a.numberOfProducts || 0));
  }
  
  const categoryIds = flatCategories.map((c) => c.id);
  
  // Scrape with concurrency or incrementally
  let byCategory: { [categoryId: string]: CategoryProductItem[] };
  
  if (options.saveProgress) {
    byCategory = await scrapeCategoriesIncremental(
      categoryIds,
      options.checkpointFile,
      undefined,
      undefined,
      (current, total, categoryId) => {
        const category = flatCategories.find((c) => c.id === categoryId);
        console.log(`[${current}/${total}] ${category?.name || categoryId}`);
      }
    );
  } else if (options.concurrency && options.concurrency > 1) {
    byCategory = await scrapeCategoriesConcurrent(
      categoryIds,
      options.concurrency,
      undefined,
      undefined,
      (current, total, categoryId) => {
        const category = flatCategories.find((c) => c.id === categoryId);
        console.log(`[${current}/${total}] ${category?.name || categoryId}`);
      }
    );
  } else {
    byCategory = await scrapeCategoryTree(
      categories,
      undefined,
      undefined,
      (current, total, categoryName) => {
        console.log(`[${current}/${total}] ${categoryName}`);
      }
    );
  }
  
  // Deduplicate if requested
  let uniqueProducts: CategoryProductItem[] | undefined;
  let stats = {
    totalCategories: Object.keys(byCategory).length,
    totalProducts: Object.values(byCategory).reduce((sum, p) => sum + p.length, 0),
    uniqueProducts: 0,
    duplicates: 0,
    timeElapsed: Date.now() - startTime,
  };
  
  if (options.deduplicate) {
    const deduped = deduplicateProducts(byCategory);
    uniqueProducts = deduped.uniqueProducts;
    stats.uniqueProducts = uniqueProducts.length;
    stats.duplicates = stats.totalProducts - stats.uniqueProducts;
  }
  
  return {
    byCategory,
    uniqueProducts,
    stats,
  };
};
```

**Usage:**
```typescript
// Fast scraping with all optimizations
const result = await scrapeAllProducts(categories, {
  concurrency: 3,
  prioritize: true,
  deduplicate: true,
  saveProgress: true,
});

console.log(`
  Categories: ${result.stats.totalCategories}
  Total products: ${result.stats.totalProducts}
  Unique products: ${result.stats.uniqueProducts}
  Duplicates: ${result.stats.duplicates}
  Time: ${result.stats.timeElapsed / 1000}s
`);
```

---

## Which Strategy Should You Use?

**For initial scraping:**
- Use **concurrent + priority** (get data fast)

**For production:**
- Use **incremental + sequential** (safe, resumable)

**For testing:**
- Use **sequential** (current implementation is fine)
