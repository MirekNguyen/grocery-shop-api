# Full-Text Search (FTS5) Integration

This project uses SQLite's built-in FTS5 (Full-Text Search) for powerful, efficient product search.

## Features

- **Diacritics Support**: Automatically handles Czech, German, and other special characters
  - Search "bana" finds "Banán"
  - Search "muller" finds "Müller"
- **Prefix Matching**: Partial word matching
  - Search "ban" finds "Banán", "Banana", etc.
- **Multi-language**: Works with Czech, German, English text
- **Relevance Ranking**: Results sorted by relevance
- **High Performance**: SQLite FTS5 indexes for fast search even with large datasets

## Setup

The FTS5 virtual table and triggers are created automatically. To set up or reset:

```bash
bun run db:setup-fts
```

This creates:
- `products_fts` virtual FTS5 table
- Automatic triggers to keep FTS index in sync with products table
- Initial population of search index

## How It Works

### 1. FTS5 Virtual Table
Creates a search index on:
- Product name
- Brand
- Short description
- Long description

### 2. Automatic Sync
Triggers automatically update the FTS index when:
- New products are inserted
- Products are updated
- Products are deleted

### 3. Search Query Processing
```typescript
// User searches for: "mullermilk"
// System converts to FTS query: "mullermilk*"
// FTS5 removes diacritics: "mullermilk" matches "Müllermilch"
```

## Usage

### Basic Search
```typescript
import * as ProductSearchRepository from './modules/product/product.search.repository';

// Search for products
const productIds = await ProductSearchRepository.searchProducts('banan', 10);
// Returns: [123, 456, ...] - IDs sorted by relevance
```

### Search with Snippets
```typescript
const results = await ProductSearchRepository.searchProductsWithSnippets('müller', 10);
// Returns: [{ id: 123, snippet: '...Müller Mix...', rank: -2.5 }, ...]
```

### Via API
```bash
# Search products
GET /api/products?search=bana&limit=20

# Search with category filter
GET /api/products?search=mleko&category=chlazene-mlecne-a-rostlinne-vyrobky-1207
```

## Testing

Test the search functionality:

```bash
bun run scripts/test-search.ts
```

## Technical Details

### FTS5 Configuration
```sql
CREATE VIRTUAL TABLE products_fts USING fts5(
  name,
  brand,
  description_short,
  description_long,
  tokenize='unicode61 remove_diacritics 2'
)
```

- `unicode61`: Unicode-aware tokenizer
- `remove_diacritics 2`: Automatically removes diacritics for matching

### Performance
- FTS5 is indexed, searches are O(log n)
- Suitable for millions of products
- In-memory caching by SQLite
- Typically < 10ms query time

## Troubleshooting

### Rebuild FTS Index
If search results seem outdated:

```bash
bun run db:setup-fts
```

### Check FTS Table
```bash
bun run db:studio
```

Then query:
```sql
SELECT * FROM products_fts WHERE products_fts MATCH 'your search';
```

## References

- [SQLite FTS5 Documentation](https://www.sqlite.org/fts5.html)
- [Unicode61 Tokenizer](https://www.sqlite.org/fts5.html#unicode61_tokenizer)
