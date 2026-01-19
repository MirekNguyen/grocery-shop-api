# Frontend Changes for Multi-Store Support

## Do You HAVE to Change the Frontend?

**No, but you probably want to.**

### ✅ What Still Works (No Changes Needed)
- All existing API calls work exactly as before
- If you don't filter by store, you get ALL products
- Response format is the same

### 🎨 What You'll Want to Add
- Store filter dropdown/buttons (so users can choose which store)
- Store badges on products (so users know which store a product is from)
- Updated TypeScript types

---

## Minimal Required Changes

### 1. Update Product Type (Add `store` field)

```typescript
// Before
type Product = {
  id: number;
  name: string;
  price: number;
  // ... other fields
}

// After - Just add one field
type Product = {
  id: number;
  store: string;  // ← ADD THIS
  name: string;
  price: number;
  // ... other fields
}
```

**That's the only required change!** Everything else is optional.

---

## Optional Improvements

### 2. Add Store Filter UI

```typescript
// React Example
const [store, setStore] = useState<string | undefined>(undefined);

// Fetch products
const filters = {
  search: searchQuery,
  store: store,  // ← Add this
  page: 1,
  limit: 30
};

// UI
<div>
  <button onClick={() => setStore(undefined)}>All Stores</button>
  <button onClick={() => setStore('BILLA')}>BILLA</button>
  <button onClick={() => setStore('FOODORA_BILLA_PROSEK')}>BILLA Prosek</button>
  <button onClick={() => setStore('FOODORA_ALBERT_FLORENC')}>Albert</button>
  <button onClick={() => setStore('FOODORA_DMART')}>D-Mart</button>
</div>
```

### 3. Display Store Badge

```typescript
// Show which store the product is from
<div className="product-card">
  <span className="store-badge">{product.store}</span>
  <h3>{product.name}</h3>
  <p>{product.price} CZK</p>
</div>
```

---

## Available Store Values

```typescript
type StoreType = 
  | 'BILLA'                      // Main BILLA scraper
  | 'FOODORA_BILLA_PROSEK'       // BILLA Praha Prosek
  | 'FOODORA_ALBERT_FLORENC'     // Albert Praha Florenc
  | 'FOODORA_DMART';             // D-Mart
```

---

## API Examples

### Get All Products (No Filter)
```bash
GET /api/products
# Returns products from ALL stores
```

### Get Products from Specific Store
```bash
GET /api/products?store=BILLA
GET /api/products?store=FOODORA_BILLA_PROSEK
GET /api/products?store=FOODORA_ALBERT_FLORENC
GET /api/products?store=FOODORA_DMART
```

### Get Categories with Store Filter
```bash
GET /api/categories?store=FOODORA_BILLA_PROSEK
# Returns categories with product counts from BILLA Prosek only
```

---

## Migration Steps

### If You Want Store Filtering:

1. **Add `store` to Product type** (required)
2. **Add store filter UI** (optional but recommended)
3. **Pass `store` parameter to API calls** (when user selects a store)
4. **Display store badge** (so users know which store)

### If You Don't Care About Filtering:

1. **Just add `store` to Product type** 
2. Done! Everything keeps working.

---

## User-Friendly Store Names

```typescript
const STORE_LABELS = {
  BILLA: 'BILLA',
  FOODORA_BILLA_PROSEK: 'BILLA Prosek',
  FOODORA_ALBERT_FLORENC: 'Albert Florenc',
  FOODORA_DMART: 'D-Mart',
};

// Usage
<span>{STORE_LABELS[product.store]}</span>
```

---

## Complete React Example

```typescript
import { useState, useEffect } from 'react';

const STORES = {
  ALL: undefined,
  BILLA: 'BILLA',
  BILLA_PROSEK: 'FOODORA_BILLA_PROSEK',
  ALBERT: 'FOODORA_ALBERT_FLORENC',
  DMART: 'FOODORA_DMART',
};

export const ProductList = () => {
  const [store, setStore] = useState(STORES.ALL);
  const [products, setProducts] = useState([]);

  useEffect(() => {
    const fetchProducts = async () => {
      const params = new URLSearchParams();
      if (store) params.append('store', store);
      
      const res = await fetch(`/api/products?${params}`);
      const data = await res.json();
      setProducts(data.data);
    };
    
    fetchProducts();
  }, [store]);

  return (
    <div>
      {/* Store Filter */}
      <div className="filters">
        <button onClick={() => setStore(STORES.ALL)}>
          All Stores
        </button>
        <button onClick={() => setStore(STORES.BILLA)}>
          BILLA
        </button>
        <button onClick={() => setStore(STORES.BILLA_PROSEK)}>
          BILLA Prosek
        </button>
        <button onClick={() => setStore(STORES.ALBERT)}>
          Albert
        </button>
        <button onClick={() => setStore(STORES.DMART)}>
          D-Mart
        </button>
      </div>

      {/* Products */}
      <div className="products">
        {products.map(product => (
          <div key={product.id}>
            <span className="badge">{product.store}</span>
            <h3>{product.name}</h3>
            <p>{(product.price / 100).toFixed(2)} CZK</p>
          </div>
        ))}
      </div>
    </div>
  );
};
```

---

## Summary

### Required:
- ✅ Add `store` field to Product type

### Optional (but recommended):
- 🎨 Add store filter UI
- 🏷️ Display store badges
- 📊 Show store in product details

### Not Required:
- ❌ No breaking changes
- ❌ Existing API calls still work
- ❌ No migration needed if you don't want filtering

**The simplest approach:** Just add the `store` field to your Product type and you're done. Everything else is optional enhancements for better UX.
