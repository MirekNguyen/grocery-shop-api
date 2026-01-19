# Foodora Store Configuration

## Available Stores

### 1. BILLA Praha Prosek
- **Store Code**: `FOODORA_BILLA_PROSEK`
- **Vendor Code**: `mjul`
- **Store Prefix**: `foodora-billa-prosek`
- **Categories**: FOODORA_CATEGORIES_FULL (22 categories)

### 2. Albert Praha Florenc  
- **Store Code**: `FOODORA_ALBERT_FLORENC`
- **Vendor Code**: `obc6`
- **Store Prefix**: `foodora-albert-florenc`
- **Categories**: FOODORA_CATEGORIES_ALBERT

### 3. D-Mart (Test/Default)
- **Store Code**: `FOODORA_DMART`
- **Vendor Code**: `o7b0`
- **Store Prefix**: `foodora-dmart`
- **Categories**: FOODORA_CATEGORIES_FULL (22 categories)

## Scraping Scripts

### Scrape Default Store (BILLA Praha Prosek)
```bash
bun src/scrape-foodora-to-db.ts
```

### Scrape Specific Store
```bash
# BILLA Praha Prosek
bun src/scrape-foodora-store.ts --store=FOODORA_BILLA_PROSEK

# Albert Praha Florenc
bun src/scrape-foodora-store.ts --store=FOODORA_ALBERT_FLORENC

# D-Mart
bun src/scrape-foodora-store.ts --store=FOODORA_DMART
```

### Scrape All Stores (Recommended)
```bash
bun src/scrape-all-foodora-stores.ts
```
This will scrape both BILLA and Albert in sequence.

## API Queries

After scraping, query products by store:

```bash
# BILLA products
GET /api/products?store=FOODORA_BILLA_PROSEK

# Albert products  
GET /api/products?store=FOODORA_ALBERT_FLORENC

# All Foodora products
GET /api/products

# Categories with hierarchy
GET /api/categories?store=FOODORA_BILLA_PROSEK
```

## Notes

- **FOODORA_BILLA_PROSEK** is the primary/recommended store for scraping
- **FOODORA_ALBERT_FLORENC** uses a different category structure (FOODORA_CATEGORIES_ALBERT)
- **FOODORA_DMART** appears to be a test vendor and may not have real products
- All stores support category hierarchy (parent → subcategories)
