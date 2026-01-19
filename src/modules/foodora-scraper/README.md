# Foodora Scraper Module

A modular, type-safe scraper for the Foodora GraphQL API built with Bun, TypeScript, and Zod.

## Features

- ✅ **Type-safe** - Full TypeScript support with Zod validation
- ✅ **Modular** - Clean separation of concerns
- ✅ **Functional** - Pure functions, no classes
- ✅ **Validated** - Runtime validation of all API responses
- ✅ **Easy to use** - Simple API with sensible defaults

## Module Structure

```
src/modules/foodora-scraper/
├── index.ts                        # Public API exports
├── foodora-api.service.ts          # API communication
├── foodora-scraper.service.ts      # Main orchestration
├── foodora-transformer.service.ts  # Data transformation
├── foodora.constants.ts            # Configuration constants
├── foodora.queries.ts              # GraphQL queries
├── foodora.schemas.ts              # Zod validation schemas
├── foodora.types.ts                # TypeScript types
└── foodora.utils.ts                # Utility functions
```

## Usage

### Basic Usage

```typescript
import { scrapeProduct } from "./modules/foodora-scraper/index.ts";

// Scrape a product and get simplified data
const product = await scrapeProduct("119547085");

console.log(product.name);
console.log(product.price);
console.log(product.isAvailable);
```

### Get Full API Response

```typescript
import { scrapeProductFull } from "./modules/foodora-scraper/index.ts";

// Get both full API response and simplified data
const { full, simplified } = await scrapeProductFull("119547085");

console.log(full.data.productDetails.product); // Full API data
console.log(simplified); // Simplified data
```

### Save to Files

```typescript
import { scrapeAndSaveProduct } from "./modules/foodora-scraper/index.ts";

// Scrape and automatically save to files
const product = await scrapeAndSaveProduct(
  "119547085",
  "product-119547085"
);
// Creates: product-119547085-full.json and product-119547085-simple.json
```

### Direct API Access

```typescript
import { fetchProductDetails } from "./modules/foodora-scraper/index.ts";

// Fetch raw API data with validation
const data = await fetchProductDetails("119547085");
const product = data.data.productDetails.product;
```

### Transform Product Data

```typescript
import { fetchProductDetails, simplifyProduct } from "./modules/foodora-scraper/index.ts";

const data = await fetchProductDetails("119547085");
const product = data.data.productDetails.product;

// Transform to simplified format
const simplified = simplifyProduct(product);
```

## API Reference

### `scrapeProduct(productId, vendorCode?, userCode?)`

Scrapes a product and returns simplified data.

**Parameters:**
- `productId: string` - Product ID to scrape
- `vendorCode?: string` - Vendor code (default: "o7b0")
- `userCode?: string` - User code (default: "cz6a15cx")

**Returns:** `Promise<SimplifiedProduct>`

### `scrapeProductFull(productId, vendorCode?, userCode?)`

Scrapes a product and returns both full and simplified data.

**Returns:** `Promise<{ full: ProductDetailsResponse, simplified: SimplifiedProduct }>`

### `scrapeAndSaveProduct(productId, baseFilename, vendorCode?, userCode?)`

Scrapes a product and saves to JSON files.

**Returns:** `Promise<SimplifiedProduct>`

### `fetchProductDetails(productId, vendorCode?, userCode?)`

Fetches raw product details from API with Zod validation.

**Returns:** `Promise<ProductDetailsResponse>`

### `simplifyProduct(product)`

Transforms full product data to simplified format.

**Returns:** `SimplifiedProduct`

### `saveToFile(data, filename)`

Saves data to JSON file.

**Returns:** `Promise<void>`

## Types

### SimplifiedProduct

```typescript
type SimplifiedProduct = {
  id: string;
  name: string;
  description: string;
  price: number;
  originalPrice: number;
  discount: number | null;
  discountPercentage: number | null;
  isAvailable: boolean;
  type: string;
  imageUrl: string | null;
  sku: string | null;
  brand: string | null;
  pricePerUnit: string | null;
  stock: string;
  campaigns: {
    name: string;
    discountValue: number;
    discountType: string;
    endTime: string;
  }[];
  allergens: string[];
  nutritionFacts: { [key: string]: string };
  weight: {
    value: number;
    unit: string;
  } | null;
};
```

## Running the CLI Example

```bash
bun src/foodora-scraper-cli.ts
```

This will scrape a sample product and display detailed information in the console.

## Error Handling

All API responses are validated with Zod. If the API response doesn't match the expected schema, a `ZodError` will be thrown with details about the validation failure.

```typescript
try {
  const product = await scrapeProduct("invalid-id");
} catch (error) {
  if (error instanceof ZodError) {
    console.error("Validation error:", error.errors);
  } else {
    console.error("API error:", error);
  }
}
```

## Constants

Default values can be imported from the constants file:

```typescript
import {
  FOODORA_API_URL,
  DEFAULT_VENDOR_CODE,
  DEFAULT_USER_CODE,
} from "./modules/foodora-scraper/index.ts";
```
