# Frontend API Changes - Multi-Store Support

## Summary of Changes

Your API now supports **multi-store filtering** with a new `store` query parameter. All existing endpoints still work the same way, but you can now filter products by store.

## What Changed

### 1. New Query Parameter: `store`

**Added to:** `GET /api/products`

**Values:**
- `BILLA` - Show only BILLA products
- `FOODORA` - Show only Foodora products
- *(omit parameter)* - Show all products from all stores

### 2. New Field in Product Response: `store`

**All product objects now include:**
```typescript
{
  // ... existing fields
  store: "BILLA" | "FOODORA"
}
```

---

## API Endpoint Changes

### `GET /api/products`

**NEW: Store Filter Parameter**

```typescript
// Before (still works)
GET /api/products?search=chicken&page=1&limit=30

// New - Filter by store
GET /api/products?store=FOODORA
GET /api/products?store=BILLA

// Combined filters
GET /api/products?store=FOODORA&search=chicken&inPromotion=true
```

### `GET /api/categories`

**NEW: Store Filter Parameter**

```typescript
// Get all categories with product counts (all stores)
GET /api/categories

// Get categories with product counts (Foodora only)
GET /api/categories?store=FOODORA

// Get categories with product counts (BILLA only)
GET /api/categories?store=BILLA
```

**Response Schema:**

```typescript
[
  {
    "id": number,
    "key": string,
    "name": string,
    "slug": string,
    "orderHint": string | null,
    "productCount": number,  // Counts products from specified store only
    "createdAt": string,
    "updatedAt": string
  }
]
```

**Note:** Product counts now respect the `store` filter. If you pass `?store=FOODORA`, `productCount` shows only Foodora products in that category.

### `GET /api/categories/:slug/products`

**NEW: Store Filter Parameter**

```typescript
// Get all products in category (all stores)
GET /api/categories/foodora-drubez/products

// Get Foodora products in category only
GET /api/categories/foodora-drubez/products?store=FOODORA

// Get BILLA products in category only
GET /api/categories/maso-a-ryby-1263/products?store=BILLA

// With pagination
GET /api/categories/:slug/products?store=FOODORA&page=2&limit=20
```

**Updated Response Schema:**

```typescript
{
  "data": [
    {
      "id": number,
      "store": "BILLA" | "FOODORA",  // ← NEW FIELD
      "productId": string,
      "sku": string,
      "slug": string,
      "name": string,
      "descriptionShort": string | null,
      "descriptionLong": string | null,
      "category": string,
      "categorySlug": string,
      "brand": string | null,
      "brandSlug": string | null,
      "price": number,              // in cents
      "pricePerUnit": number | null,
      "regularPrice": number,
      "discountPrice": number | null,
      "inPromotion": boolean,
      "images": string[],
      "published": boolean,
      "scrapedAt": string,
      "updatedAt": string,
      "categories": [
        {
          "id": number,
          "key": string,
          "name": string,
          "slug": string
        }
      ]
    }
  ],
  "pagination": {
    "page": number,
    "limit": number,
    "total": number,
    "totalPages": number
  }
}
```

### All Other Endpoints (Updated with Store Support)

**Categories endpoints now support store filtering:**

```typescript
GET /api/categories?store=FOODORA          // Get categories with product counts (Foodora only)
GET /api/categories?store=BILLA            // Get categories with product counts (BILLA only)
GET /api/categories                        // Get all categories (all stores)
GET /api/categories/:slug                  // Get category by slug (no change)
GET /api/categories/:slug/products?store=FOODORA  // Get products in category (Foodora only)
```

**Other endpoints (no changes):**

```typescript
GET /api/products/:id              // Get single product by ID
GET /api/products/slug/:slug       // Get single product by slug
GET /api/products/promotions       // Get products on promotion
GET /health                        // Health check
```

**Response:** All responses now include `store` field in product objects.

---

## Frontend Integration Guide

### 1. TypeScript Types to Update

**Update your Product type:**

```typescript
// Before
export type Product = {
  id: number;
  productId: string;
  sku: string;
  slug: string;
  name: string;
  // ... other fields
}

// After - Add store field
export type Product = {
  id: number;
  store: 'BILLA' | 'FOODORA';  // ← ADD THIS
  productId: string;
  sku: string;
  slug: string;
  name: string;
  // ... other fields
}

// Or use a union type
export type StoreType = 'BILLA' | 'FOODORA';

export type Product = {
  id: number;
  store: StoreType;  // ← ADD THIS
  // ... other fields
}
```

### 2. API Client Updates

**Add store parameter to your API calls:**

```typescript
// api/products.ts

export type ProductFilters = {
  search?: string;
  category?: string;
  page?: number;
  limit?: number;
  inPromotion?: boolean;
  store?: 'BILLA' | 'FOODORA';  // ← ADD THIS
}

export const getProducts = async (filters: ProductFilters) => {
  const params = new URLSearchParams();
  
  if (filters.search) params.append('search', filters.search);
  if (filters.category) params.append('category', filters.category);
  if (filters.page) params.append('page', filters.page.toString());
  if (filters.limit) params.append('limit', filters.limit.toString());
  if (filters.inPromotion) params.append('inPromotion', 'true');
  if (filters.store) params.append('store', filters.store);  // ← ADD THIS
  
  const response = await fetch(`/api/products?${params.toString()}`);
  return response.json();
}
```

### 3. React/Vue Component Examples

#### React Example - Store Filter

```typescript
import { useState } from 'react';

type StoreType = 'BILLA' | 'FOODORA' | 'ALL';

export const ProductList = () => {
  const [store, setStore] = useState<StoreType>('ALL');
  const [products, setProducts] = useState([]);

  const fetchProducts = async () => {
    const filters = {
      store: store === 'ALL' ? undefined : store,
      page: 1,
      limit: 30
    };
    
    const data = await getProducts(filters);
    setProducts(data.data);
  };

  return (
    <div>
      {/* Store Filter Buttons */}
      <div className="store-filters">
        <button 
          onClick={() => setStore('ALL')}
          className={store === 'ALL' ? 'active' : ''}
        >
          All Stores
        </button>
        <button 
          onClick={() => setStore('BILLA')}
          className={store === 'BILLA' ? 'active' : ''}
        >
          BILLA
        </button>
        <button 
          onClick={() => setStore('FOODORA')}
          className={store === 'FOODORA' ? 'active' : ''}
        >
          Foodora
        </button>
      </div>

      {/* Product List */}
      <div className="products">
        {products.map(product => (
          <div key={product.id} className="product-card">
            <h3>{product.name}</h3>
            <p>Store: {product.store}</p>  {/* ← NEW: Display store */}
            <p>Price: {(product.price / 100).toFixed(2)} CZK</p>
          </div>
        ))}
      </div>
    </div>
  );
};
```

#### Vue Example - Store Filter

```vue
<template>
  <div>
    <!-- Store Filter -->
    <div class="store-filters">
      <button 
        @click="store = 'ALL'" 
        :class="{ active: store === 'ALL' }"
      >
        All Stores
      </button>
      <button 
        @click="store = 'BILLA'" 
        :class="{ active: store === 'BILLA' }"
      >
        BILLA
      </button>
      <button 
        @click="store = 'FOODORA'" 
        :class="{ active: store === 'FOODORA' }"
      >
        Foodora
      </button>
    </div>

    <!-- Product List -->
    <div class="products">
      <div v-for="product in products" :key="product.id" class="product-card">
        <h3>{{ product.name }}</h3>
        <p>Store: {{ product.store }}</p>  <!-- ← NEW: Display store -->
        <p>Price: {{ (product.price / 100).toFixed(2) }} CZK</p>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, watch } from 'vue';

type StoreType = 'BILLA' | 'FOODORA' | 'ALL';

const store = ref<StoreType>('ALL');
const products = ref([]);

watch(store, async () => {
  const filters = {
    store: store.value === 'ALL' ? undefined : store.value,
    page: 1,
    limit: 30
  };
  
  const data = await getProducts(filters);
  products.value = data.data;
});
</script>
```

### 4. Display Store Badge/Icon

**Add visual indicator for store:**

```typescript
// React Component
const StoreBadge = ({ store }: { store: 'BILLA' | 'FOODORA' }) => {
  const config = {
    BILLA: {
      color: '#E31837',      // BILLA red
      bgColor: '#FFF5F5',
      label: 'BILLA'
    },
    FOODORA: {
      color: '#D81B60',      // Foodora pink
      bgColor: '#FCE4EC',
      label: 'Foodora'
    }
  };

  const { color, bgColor, label } = config[store];

  return (
    <span 
      style={{ 
        backgroundColor: bgColor, 
        color: color,
        padding: '4px 8px',
        borderRadius: '4px',
        fontSize: '12px',
        fontWeight: 'bold'
      }}
    >
      {label}
    </span>
  );
};

// Usage
<div className="product-card">
  <StoreBadge store={product.store} />
  <h3>{product.name}</h3>
  <p>{(product.price / 100).toFixed(2)} CZK</p>
</div>
```

### 5. URL Query Parameters (Optional)

**Sync store filter with URL:**

```typescript
// React Router example
import { useSearchParams } from 'react-router-dom';

const ProductList = () => {
  const [searchParams, setSearchParams] = useSearchParams();
  const store = searchParams.get('store') || 'ALL';

  const handleStoreChange = (newStore: string) => {
    if (newStore === 'ALL') {
      searchParams.delete('store');
    } else {
      searchParams.set('store', newStore);
    }
    setSearchParams(searchParams);
  };

  // Fetch products based on URL params
  useEffect(() => {
    fetchProducts({
      store: store === 'ALL' ? undefined : store as StoreType
    });
  }, [searchParams]);
};
```

---

## Example API Calls

### Fetch All Products
```bash
curl http://localhost:3001/api/products
```

### Fetch BILLA Products Only
```bash
curl http://localhost:3001/api/products?store=BILLA
```

### Fetch Foodora Products Only
```bash
curl http://localhost:3001/api/products?store=FOODORA
```

### Get All Categories (All Stores)
```bash
curl http://localhost:3001/api/categories
```

### Get Categories with Foodora Product Counts
```bash
curl "http://localhost:3001/api/categories?store=FOODORA"
```

### Get Products in Category (Foodora Only)
```bash
curl "http://localhost:3001/api/categories/foodora-drubez/products?store=FOODORA"
```

### Search Foodora Products
```bash
curl "http://localhost:3001/api/products?store=FOODORA&search=chicken"
```

### Get Foodora Products on Promotion
```bash
curl "http://localhost:3001/api/products?store=FOODORA&inPromotion=true"
```

### Combined Filters
```bash
curl "http://localhost:3001/api/products?store=FOODORA&category=foodora-drubez&page=1&limit=20"
```

---

## Migration Checklist

### For Existing Frontends

- [ ] Update Product TypeScript type to include `store` field
- [ ] Add `store` parameter to API client filter types
- [ ] Add store filter UI component (buttons/dropdown/tabs)
- [ ] Display store badge/label on product cards
- [ ] Update product detail pages to show store
- [ ] (Optional) Sync store filter with URL query params
- [ ] (Optional) Add store-specific styling/branding
- [ ] Test all existing API calls still work
- [ ] Test new store filtering functionality

### Backward Compatibility

✅ **All existing API calls work without changes**
- If you don't send `store` parameter, you get all products
- All existing query parameters still work
- Response format is the same (just added `store` field)

### Breaking Changes

⚠️ **None!** The API is fully backward compatible.

The only change is:
- Product objects now have a `store` field
- New optional `store` query parameter

---

## UI Design Suggestions

### 1. Store Filter Tabs

```
┌─────────────────────────────────────┐
│  [All] [BILLA] [Foodora]           │
│                                     │
│  🛒 Product 1        79.90 CZK     │
│     Store: BILLA                    │
│                                     │
│  🛒 Product 2        89.90 CZK     │
│     Store: Foodora                  │
└─────────────────────────────────────┘
```

### 2. Store Badge on Product Card

```
┌─────────────────────────────┐
│  [BILLA]  Product Name      │
│  79.90 CZK                  │
│  Category: Meat & Poultry   │
└─────────────────────────────┘
```

### 3. Store Dropdown Filter

```
Store: [All Stores ▼]
       ├─ All Stores
       ├─ BILLA
       └─ Foodora
```

### 4. Checkbox Multi-Select

```
☑ BILLA
☑ Foodora
```

---

## Testing Your Frontend

### 1. Test Store Filter

```typescript
// Test all stores
await getProducts({ store: undefined });  // Should return all

// Test BILLA only
await getProducts({ store: 'BILLA' });    // Should return only BILLA

// Test Foodora only
await getProducts({ store: 'FOODORA' });  // Should return only Foodora
```

### 2. Test Categories with Store Filter

```typescript
// All categories (all stores)
await getCategories();

// Categories with Foodora counts only
await getCategories({ store: 'FOODORA' });

// Categories with BILLA counts only
await getCategories({ store: 'BILLA' });

// Products in category (Foodora only)
await getCategoryProducts('foodora-drubez', { store: 'FOODORA' });
```

### 3. Test Combined Filters

```typescript
// Store + Search
await getProducts({ 
  store: 'FOODORA', 
  search: 'chicken' 
});

// Store + Category
await getProducts({ 
  store: 'FOODORA', 
  category: 'foodora-drubez' 
});

// Store + Promotion
await getProducts({ 
  store: 'FOODORA', 
  inPromotion: true 
});
```

### 3. Verify Product Response

```typescript
const response = await getProducts({ store: 'FOODORA' });

response.data.forEach(product => {
  console.assert(product.store === 'FOODORA', 'Store should be FOODORA');
  console.assert(product.price > 0, 'Price should be positive');
  console.assert(Array.isArray(product.categories), 'Categories should be array');
});
```

---

## Need Help?

**API Documentation:** See `docs/FOODORA-DB-INTEGRATION.md`

**Quick Reference:** See `QUICK-START.md`

**Start API Server:**
```bash
bun run api
# Server: http://localhost:3001
```

**Check Database:**
```bash
bun run db:check
```

---

## Summary

**What you need to do:**
1. Add `store: 'BILLA' | 'FOODORA'` to your Product type
2. Add optional `store?` parameter to your API filters
3. Add store filter UI (buttons/dropdown/tabs)
4. Display store badge on product cards

**That's it!** Everything else remains the same. The API is fully backward compatible.
