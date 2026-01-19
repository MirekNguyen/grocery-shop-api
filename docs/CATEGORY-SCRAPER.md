# Foodora Category Scraper

Complete solution for scraping all products from Foodora categories.

## Features

- ✅ **Scrape single categories** - Get all products from one category
- ✅ **Scrape category trees** - Automatically handle nested categories
- ✅ **Batch scraping** - Scrape multiple categories efficiently
- ✅ **Progress tracking** - Real-time progress callbacks
- ✅ **Type-safe** - Full TypeScript + Zod validation
- ✅ **Rate limiting** - Built-in delays to avoid API throttling
- ✅ **Flexible output** - Save to single file or multiple files

## Quick Start

### Scrape a Single Category

```typescript
import { scrapeCategoryProducts } from "./modules/foodora-scraper/index.ts";

// Scrape all products from "Drůbež" (Poultry) category
const products = await scrapeCategoryProducts("aef9f1fe-ffe4-4754-8f27-4bb8359e2427");

console.log(`Found ${products.length} products`);
```

### Scrape an Entire Category Tree

```typescript
import { scrapeCategoryTree } from "./modules/foodora-scraper/index.ts";
import type { CategoryDefinition } from "./modules/foodora-scraper/index.ts";

const meatCategory: CategoryDefinition = {
  id: "8d101a5c-84cb-4d02-8247-a47d423d4691",
  name: "Maso a uzeniny",
  numberOfProducts: 158,
  type: "DEFAULT",
  children: [
    { id: "aef9f1fe-ffe4-4754-8f27-4bb8359e2427", name: "Drůbež", numberOfProducts: 16, type: "DEFAULT" },
    { id: "7771d1cb-bff9-414c-b535-2d11ae1ae617", name: "Uzeniny", numberOfProducts: 92, type: "DEFAULT" },
    // ... more subcategories
  ],
};

// Scrape all products from category and all subcategories
const results = await scrapeCategoryTree([meatCategory]);

// results = { "category-id-1": [products...], "category-id-2": [products...], ... }
```

### With Progress Tracking

```typescript
import { scrapeCategoryTree } from "./modules/foodora-scraper/index.ts";

const results = await scrapeCategoryTree(
  categories,
  undefined, // vendorCode
  undefined, // userCode
  (current, total, categoryName) => {
    console.log(`[${current}/${total}] Scraping: ${categoryName}`);
  }
);
```

### Save Results

```typescript
import {
  scrapeCategoryTree,
  saveAllCategoriesToSingleFile,
  saveAllCategories,
} from "./modules/foodora-scraper/index.ts";

const results = await scrapeCategoryTree(categories);

// Option 1: Save everything to a single JSON file
await saveAllCategoriesToSingleFile(results, "all-products.json");

// Option 2: Save each category to a separate file
await saveAllCategories(results, "./scraped-categories");
// Creates: ./scraped-categories/category-id-1.json, category-id-2.json, etc.
```

## API Reference

### `scrapeCategoryProducts(categoryId, vendorCode?, userCode?)`

Scrapes all products from a single category.

**Parameters:**
- `categoryId: string` - Category ID to scrape
- `vendorCode?: string` - Vendor code (default: "o7b0")
- `userCode?: string` - User code (default: "cz6a15cx")

**Returns:** `Promise<CategoryProductItem[]>`

### `scrapeMultipleCategories(categoryIds, vendorCode?, userCode?, onProgress?)`

Scrapes products from multiple categories.

**Parameters:**
- `categoryIds: string[]` - Array of category IDs
- `vendorCode?: string` - Vendor code
- `userCode?: string` - User code
- `onProgress?: (current: number, total: number, categoryId: string) => void` - Progress callback

**Returns:** `Promise<{ [categoryId: string]: CategoryProductItem[] }>`

### `scrapeCategoryTree(categories, vendorCode?, userCode?, onProgress?)`

Scrapes all products from a category tree (includes nested categories).

**Parameters:**
- `categories: CategoryDefinition[]` - Category tree
- `vendorCode?: string` - Vendor code
- `userCode?: string` - User code
- `onProgress?: (current: number, total: number, categoryName: string) => void` - Progress callback

**Returns:** `Promise<{ [categoryId: string]: CategoryProductItem[] }>`

### `fetchCategoryProducts(categoryId, vendorCode?, userCode?)`

Low-level API function to fetch raw category data.

**Returns:** `Promise<CategoryProductListResponse>`

### Save Functions

#### `saveCategoryProducts(categoryId, products, filename)`

Saves products from a single category to a JSON file.

#### `saveAllCategoriesToSingleFile(results, filename)`

Saves all scraped categories to a single JSON file with metadata.

#### `saveAllCategories(results, outputDir)`

Saves each category to a separate JSON file in the specified directory.

## Types

### CategoryProductItem

```typescript
type CategoryProductItem = {
  activeCampaigns: ActiveCampaign[] | null;
  badges: string[];
  description: string;
  favourite: boolean;
  globalCatalogID: string;
  isAvailable: boolean;
  name: string;
  nmrAdID: string;
  originalPrice: number;
  packagingCharge: number;
  parentID: string;
  price: number;
  productBadges: ProductBadge[] | null;
  productID: string;
  stockAmount: number;
  stockPrediction: string;
  tags: string[];
  type: string;
  urls: string[];
  vendorID: string;
  weightableAttributes: WeightableAttributes | null;
};
```

### CategoryDefinition

```typescript
type CategoryDefinition = {
  id: string;
  name: string;
  numberOfProducts: number;
  children?: CategoryDefinition[];
  productTags?: string[];
  imageUrls?: string[];
  type: string;
};
```

## Running the Example

```bash
bun src/foodora-category-scraper-cli.ts
```

This will:
1. Scrape a single category (Drůbež)
2. Scrape an entire category tree (Maso a uzeniny) with progress
3. Save results to JSON files

## Output Format

### Single File Output

```json
{
  "scrapedAt": "2026-01-19T12:00:00.000Z",
  "totalCategories": 8,
  "totalProducts": 158,
  "categories": {
    "category-id-1": [
      {
        "productID": "119528257",
        "name": "DZ Klatovy Kuřecí steak...",
        "price": 79.9,
        "originalPrice": 89.9,
        "isAvailable": true,
        ...
      }
    ]
  }
}
```

### Individual File Output

```json
{
  "categoryId": "aef9f1fe-ffe4-4754-8f27-4bb8359e2427",
  "totalProducts": 16,
  "scrapedAt": "2026-01-19T12:00:00.000Z",
  "products": [...]
}
```

## Rate Limiting

The scraper automatically adds a 500ms delay between category requests to avoid rate limiting. Adjust in `foodora-category-scraper.service.ts` if needed:

```typescript
await new Promise((resolve) => setTimeout(resolve, 500)); // Adjust delay here
```

## Error Handling

The scraper catches errors per category and continues scraping:

```typescript
const results = await scrapeMultipleCategories(categoryIds);

// If category fails, it will have an empty array
if (results["category-id"].length === 0) {
  console.log("Category failed to scrape or has no products");
}
```

## Complete Example

See `src/foodora-category-scraper-cli.ts` for a complete working example with all features demonstrated.
