# Foodora GraphQL Scraper

A Bun-based web scraper for Foodora products using GraphQL API with full TypeScript support and Zod validation.

## 🚀 Features

- ✅ **Product Scraping** - Scrape individual products with full details
- ⚠️ **Category Scraping** - Scrape entire categories (debugging in progress)
- ✅ **Batch Processing** - Scrape multiple categories efficiently
- ✅ **Type Safety** - Full TypeScript + Zod validation
- ✅ **Progress Tracking** - Real-time progress callbacks
- ✅ **Rate Limiting** - Built-in delays to avoid throttling
- ✅ **Flexible Output** - Save to JSON files (single or multiple)
- ✅ **Modular Architecture** - Clean separation of concerns

## 📦 Tech Stack

- **Runtime:** Bun (not Node.js)
- **Language:** TypeScript (strict mode)
- **Validation:** Zod
- **API:** GraphQL (Foodora API)
- **Architecture:** Functional (no classes)

## 🎯 Quick Start

### 1. Install Bun

```bash
# macOS/Linux
curl -fsSL https://bun.sh/install | bash

# Or via Homebrew
brew install oven-sh/bun/bun
```

### 2. Install Dependencies

```bash
bun install
```

### 3. Test Product Scraper (Working ✅)

```bash
bun src/foodora-scraper-cli.ts
```

This will:
- Scrape product #119547085 (Vanička pšeničná s višní)
- Save full details to `output/product-119547085-full.json`
- Save simplified version to `output/product-119547085-simple.json`

### 4. Debug Category Scraper (In Progress ⚠️)

```bash
# Test 4 different API variations
bun src/debug-category-variations.ts

# Simple test
bun src/debug-category-api.ts
```

## 📚 Documentation

| File | Description |
|------|-------------|
| **[QUICK-REFERENCE.md](./QUICK-REFERENCE.md)** | 🎯 **START HERE** - Quick commands and workflow |
| **[SESSION-SUMMARY.md](./SESSION-SUMMARY.md)** | What we built, current status, next steps |
| **[TROUBLESHOOTING.md](./TROUBLESHOOTING.md)** | How to fix category API returning null |
| **[CAPTURE-BROWSER-REQUEST.md](./CAPTURE-BROWSER-REQUEST.md)** | How to capture working GraphQL request |
| **[CATEGORY-SCRAPER.md](./CATEGORY-SCRAPER.md)** | Category scraper API reference |
| **[AGENTS.md](./AGENTS.md)** | Coding standards and guidelines |

## 🔧 Current Status

### ✅ Working
- Product scraper (individual products)
- Data transformation
- File saving
- Type safety with Zod
- Modular architecture

### ⚠️ In Progress
- Category API returning `null` for `categoryProducts`
- Need to compare with browser request to identify issue

## 🐛 Debugging Category Issue

The category API is currently returning `null` instead of products. Follow these steps:

### 1. Run Debug Script
```bash
bun src/debug-category-variations.ts
```

### 2. Capture Browser Request
1. Open https://www.foodora.cz
2. DevTools → Network
3. Navigate to a category
4. Copy GraphQL request as cURL
5. Compare with our implementation

See **[CAPTURE-BROWSER-REQUEST.md](./CAPTURE-BROWSER-REQUEST.md)** for detailed steps.

### 3. Apply Fix
Based on comparison, update:
- `src/modules/foodora-scraper/foodora-category-api.service.ts`
- `src/modules/foodora-scraper/foodora-category.queries.ts`

### 4. Test
```bash
bun src/debug-category-api.ts
```

## 📖 Usage Examples

### Scrape a Single Product (Working ✅)

```typescript
import { scrapeProduct } from "./modules/foodora-scraper/index.ts";

const product = await scrapeProduct("119547085");
console.log(product.name); // "Vanička pšeničná s višní"
console.log(product.price); // 6.9
```

### Scrape a Category (After Fix ⚠️)

```typescript
import { scrapeCategoryProducts } from "./modules/foodora-scraper/index.ts";

const products = await scrapeCategoryProducts(
  "aef9f1fe-ffe4-4754-8f27-4bb8359e2427" // Drůbež (Poultry)
);

console.log(`Found ${products.length} products`);
```

### Scrape Category Tree (After Fix ⚠️)

```typescript
import { scrapeCategoryTree } from "./modules/foodora-scraper/index.ts";

const category = {
  id: "8d101a5c-84cb-4d02-8247-a47d423d4691",
  name: "Maso a uzeniny",
  numberOfProducts: 158,
  type: "DEFAULT",
  children: [
    { id: "aef9f1fe-ffe4-4754-8f27-4bb8359e2427", name: "Drůbež", ... },
    // ... more subcategories
  ],
};

const results = await scrapeCategoryTree(
  [category],
  undefined,
  undefined,
  (current, total, name) => {
    console.log(`[${current}/${total}] Scraping: ${name}`);
  }
);
```

### Save Results

```typescript
import { 
  saveAllCategoriesToSingleFile,
  saveAllCategories 
} from "./modules/foodora-scraper/index.ts";

// Option 1: Single file
await saveAllCategoriesToSingleFile(results, "all-products.json");

// Option 2: Individual files per category
await saveAllCategories(results, "./scraped-categories");
```

## 📁 Project Structure

```
src/modules/foodora-scraper/
├── index.ts                              # Public API exports
│
├── Product Scraping (WORKING ✅)
│   ├── foodora-api.service.ts            # Product API calls
│   ├── foodora-transformer.service.ts    # Transform product data
│   └── foodora-scraper.service.ts        # Product scraping logic
│
├── Category Scraping (IN PROGRESS ⚠️)
│   ├── foodora-category-api.service.ts   # Category API calls
│   ├── foodora-category-scraper.service.ts # Category scraping logic
│   └── foodora-category.queries.ts       # Category GraphQL queries
│
├── Shared Components
│   ├── foodora.types.ts                  # TypeScript types
│   ├── foodora.schemas.ts                # Zod validation schemas
│   ├── foodora.constants.ts              # Configuration
│   ├── foodora.queries.ts                # Product GraphQL queries
│   └── foodora.utils.ts                  # Utility functions
│
└── Type Definitions
    ├── foodora-category.types.ts         # Category types
    └── foodora-category.schemas.ts       # Category schemas
```

## 🎨 Code Style

This project follows strict coding standards (see [AGENTS.md](./AGENTS.md)):

- ✅ TypeScript everywhere (no JavaScript)
- ✅ ESM only (no CommonJS)
- ✅ Use `type` not `interface`
- ✅ Use `const` not `let`/`var`
- ✅ No classes (functional programming)
- ✅ No `any` or `unknown`
- ✅ Zod validation on all external data
- ✅ No nested types

## 🧪 Testing

```bash
# Type check
bunx tsc --noEmit

# Run tests
bun test
```

## 📊 Categories Available

22 main categories with 100+ subcategories (6000+ total products):

| Category | Products | Subcategories |
|----------|----------|---------------|
| Více za méně | 33 | 0 |
| Ovoce a zelenina | 120 | 4 |
| Pečivo | 214 | 7 |
| Maso a uzeniny | 158 | 7 |
| Nápoje | 933 | 11 |
| Mléčné výrobky a vejce | 454 | 10 |
| ... | ... | ... |

## 🔑 API Details

- **GraphQL Endpoint:** `https://cz.fd-api.com/api/v5/graphql`
- **Default Vendor:** `o7b0` (Foodora CZ)
- **Default User Code:** `cz6a15cx`
- **Rate Limiting:** 500ms delay between requests

## 🤝 Contributing

When making changes:
1. Follow coding standards in [AGENTS.md](./AGENTS.md)
2. Add Zod validation for all external data
3. Use pure functions (no classes)
4. Add JSDoc comments
5. Test with `bunx tsc --noEmit`

## 📝 License

MIT

## 🆘 Need Help?

1. **Quick commands?** → [QUICK-REFERENCE.md](./QUICK-REFERENCE.md)
2. **What was done?** → [SESSION-SUMMARY.md](./SESSION-SUMMARY.md)
3. **Category API not working?** → [TROUBLESHOOTING.md](./TROUBLESHOOTING.md)
4. **How to debug?** → [CAPTURE-BROWSER-REQUEST.md](./CAPTURE-BROWSER-REQUEST.md)

---

**Current Task:** Fix category API returning `null` for `categoryProducts`  
**Next Step:** `bun src/debug-category-variations.ts`
