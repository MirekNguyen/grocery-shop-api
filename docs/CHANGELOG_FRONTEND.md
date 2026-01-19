# API Changelog - Frontend Integration

## [2026-01-13] - Major Updates

### 🆕 Added: Base Unit Fields for Pricing

Added new fields to properly display price comparison units (e.g., "1 kg 59,80 Kč").

#### New Product Fields

```typescript
interface Product {
  // ... existing fields
  
  // NEW: Base unit for price comparison
  baseUnitShort: string | null;     // "kg", "l", "ks"
  baseUnitLong: string | null;      // "Kilogram", "Liter", "Kus"
  
  // Existing fields (for reference)
  volumeLabelShort: string | null;  // "g", "ml", "ks" - product packaging unit
  amount: string;                   // "500", "1.5" - product quantity
  pricePerUnit: number;             // Price in cents per base unit
}
```

#### Migration Guide

**Before:**
```typescript
// ❌ Incorrect - showed "1 g 59,80 Kč" instead of "1 kg 59,80 Kč"
<div>{product.volumeLabelShort} {formatPrice(product.pricePerUnit)}</div>
```

**After:**
```typescript
// ✅ Correct - shows "1 kg 59,80 Kč"
{product.baseUnitShort && product.pricePerUnit && (
  <div>1 {product.baseUnitShort} {formatPrice(product.pricePerUnit)}</div>
)}
```

#### Complete Example

```typescript
// Product: Polévková zeleninová směs, 500g
const product = {
  name: "Polévková zeleninová směs, 500g",
  amount: "500",
  volumeLabelShort: "g",        // Product is sold in grams
  baseUnitShort: "kg",          // Price comparison is per kilogram
  baseUnitLong: "Kilogram",
  price: 2990,                  // 29,90 Kč
  pricePerUnit: 5980,           // 59,80 Kč per kg
};

// Display:
<div className="product">
  <h3>{product.name}</h3>
  
  {/* Product size */}
  <span className="size">
    {product.amount} {product.volumeLabelShort}
  </span>
  
  {/* Main price */}
  <span className="price">
    {formatPrice(product.price)}
  </span>
  
  {/* Price per unit - USE baseUnitShort! */}
  {product.baseUnitShort && product.pricePerUnit && (
    <span className="unit-price">
      1 {product.baseUnitShort} {formatPrice(product.pricePerUnit)}
    </span>
  )}
</div>

// Output:
// "500 g"
// "29,90 Kč"
// "1 kg 59,80 Kč"
```

---

### 🔍 Enhanced: Full-Text Search

Upgraded search to use SQLite FTS5 for better results.

#### Improvements

- ✅ **Czech diacritics support**: Search "bana" finds "Banán"
- ✅ **German umlauts support**: Search "muller" finds "Müller"
- ✅ **Prefix matching**: Search "ban" finds "Banán", "Banana"
- ✅ **Multi-language**: Works with Czech, German, English
- ✅ **Relevance ranking**: Results sorted by match quality
- ✅ **Performance**: Fast search even with 10,000+ products

#### API Usage (No Changes)

```bash
# Search still works the same way
GET /api/products?search=banan&limit=20
GET /api/products?search=müller&category=napoje-1474
```

#### Search Behavior Examples

```typescript
// All these searches now work better:
"bana"        → finds "Banán" ✅
"mullermilk"  → finds "Müller Milch" ✅ (if product exists)
"muller"      → finds all "Müller" products ✅
"chleb"       → finds all bread products ✅
"mleko"       → finds all milk products ✅
```

---

### 📋 Filtered: Important Categories Only

Category list now returns only the 16 most important categories.

#### Changed Endpoint

```bash
GET /api/categories
```

**Before:** Returned ~50+ categories including sub-categories

**After:** Returns only 16 main categories:
- Ovoce a zelenina
- Pečivo
- Chlazené, mléčné a rostlinné výrobky
- Maso a ryby
- Uzeniny, lahůdky a hotová jídla
- Mražené
- Trvanlivé potraviny
- Cukrovinky
- Nápoje
- Speciální a rostlinná výživa
- Péče o dítě
- Drogerie a kosmetika
- Domácnost
- Mazlíčci
- BILLA vlastní výroba
- Farmářské a lokální produkty

---

## Summary of Breaking Changes

### ⚠️ Action Required

1. **Update unit price display**: Use `baseUnitShort` instead of `volumeLabelShort` for price comparison
2. **Handle null values**: `baseUnitShort` and `baseUnitLong` can be `null`

### ✅ No Action Required

- Search API remains the same
- Categories API remains the same (just returns fewer items)
- All other product fields unchanged

---

## TypeScript Types

```typescript
export interface Product {
  id: number;
  productId: string;
  sku: string;
  slug: string;
  name: string;
  descriptionShort: string | null;
  descriptionLong: string | null;
  regulatedProductName: string | null;
  category: string;
  categorySlug: string;
  brand: string | null;
  brandSlug: string | null;
  
  // Pricing
  price: number | null;              // in cents
  pricePerUnit: number | null;       // in cents per base unit
  unitPrice: number | null;
  regularPrice: number | null;
  discountPrice: number | null;
  lowestPrice: number | null;
  inPromotion: boolean;
  
  // Packaging
  amount: string;
  weight: number;
  packageLabel: string | null;
  packageLabelKey: string | null;
  volumeLabelKey: string | null;
  volumeLabelShort: string | null;   // Product unit: "g", "ml", "ks"
  
  // NEW: Base unit for pricing
  baseUnitLong: string | null;       // "Kilogram", "Liter"
  baseUnitShort: string | null;      // "kg", "l", "ks"
  
  // Other
  images: string[];
  productMarketing: string | null;
  brandMarketing: string | null;
  published: boolean;
  medical: boolean;
  weightArticle: boolean;
  scrapedAt: string | null;
  updatedAt: string | null;
  
  // Relations
  categories: Category[];
}

export interface Category {
  id: number;
  key: string;
  name: string;
  slug: string;
  orderHint: string | null;
  createdAt: string | null;
  updatedAt: string | null;
  productCount?: number;  // Only in /api/categories endpoint
}
```

---

## Questions?

Contact the backend team or check:
- API Documentation: `/API_DOCS.md`
- Full-Text Search Details: `/FTS_SEARCH.md`
