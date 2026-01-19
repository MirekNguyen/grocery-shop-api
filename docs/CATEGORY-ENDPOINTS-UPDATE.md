# Category Endpoints - Store Filtering Update

## What Changed

All category endpoints now support the optional `?store=` query parameter to filter results by store.

---

## Updated Endpoints

### 1. `GET /api/categories`

**Get all categories with product counts**

**Before:**
```bash
GET /api/categories
```

**Now with store filter:**
```bash
GET /api/categories                  # All stores (default)
GET /api/categories?store=BILLA      # BILLA categories only
GET /api/categories?store=FOODORA    # Foodora categories only
```

**Response:**
```json
[
  {
    "id": 1,
    "key": "foodora-aef9f1fe-ffe4-4754-8f27-4bb8359e2427",
    "name": "Drůbež",
    "slug": "foodora-drubez",
    "orderHint": null,
    "productCount": 16,  // ← Filtered by store if ?store= is provided
    "createdAt": "2026-01-19T10:00:00.000Z",
    "updatedAt": "2026-01-19T10:00:00.000Z"
  }
]
```

**Key Change:** `productCount` now reflects only products from the specified store.

---

### 2. `GET /api/categories/:slug/products`

**Get products in a specific category**

**Before:**
```bash
GET /api/categories/foodora-drubez/products?page=1&limit=30
```

**Now with store filter:**
```bash
GET /api/categories/:slug/products                         # All stores
GET /api/categories/:slug/products?store=FOODORA           # Foodora only
GET /api/categories/:slug/products?store=BILLA             # BILLA only
GET /api/categories/:slug/products?store=FOODORA&page=2    # With pagination
```

**Response:**
```json
{
  "category": {
    "id": 1,
    "key": "foodora-aef9f1fe-ffe4-4754-8f27-4bb8359e2427",
    "name": "Drůbež",
    "slug": "foodora-drubez"
  },
  "data": [
    {
      "id": 9532,
      "store": "FOODORA",  // ← Products filtered by store
      "name": "Kuřecí steak",
      "price": 7990,
      // ... other fields
    }
  ],
  "pagination": {
    "page": 1,
    "limit": 30,
    "total": 16,  // ← Total reflects filtered count
    "totalPages": 1
  }
}
```

---

### 3. `GET /api/categories/:slug`

**Get single category by slug**

**No changes** - This endpoint doesn't need store filtering.

```bash
GET /api/categories/foodora-drubez
```

---

## Frontend TypeScript Updates

### API Client

```typescript
// Add store parameter to category functions
export const getCategories = async (store?: 'BILLA' | 'FOODORA') => {
  const params = new URLSearchParams();
  if (store) params.append('store', store);
  
  const response = await fetch(`/api/categories?${params.toString()}`);
  return response.json();
}

export const getCategoryProducts = async (
  slug: string,
  options?: {
    page?: number;
    limit?: number;
    store?: 'BILLA' | 'FOODORA';
  }
) => {
  const params = new URLSearchParams();
  if (options?.page) params.append('page', options.page.toString());
  if (options?.limit) params.append('limit', options.limit.toString());
  if (options?.store) params.append('store', options.store);
  
  const response = await fetch(
    `/api/categories/${slug}/products?${params.toString()}`
  );
  return response.json();
}
```

### React Component Example

```typescript
import { useState, useEffect } from 'react';

export const CategoryList = () => {
  const [store, setStore] = useState<'ALL' | 'BILLA' | 'FOODORA'>('ALL');
  const [categories, setCategories] = useState([]);

  useEffect(() => {
    const fetchCategories = async () => {
      const data = await getCategories(
        store === 'ALL' ? undefined : store
      );
      setCategories(data);
    };
    
    fetchCategories();
  }, [store]);

  return (
    <div>
      {/* Store Filter */}
      <div className="store-filters">
        <button onClick={() => setStore('ALL')}>All Stores</button>
        <button onClick={() => setStore('BILLA')}>BILLA</button>
        <button onClick={() => setStore('FOODORA')}>Foodora</button>
      </div>

      {/* Category List */}
      <div className="categories">
        {categories.map(category => (
          <div key={category.id} className="category-card">
            <h3>{category.name}</h3>
            <p>{category.productCount} products</p>
          </div>
        ))}
      </div>
    </div>
  );
};
```

### Category Page with Store Filter

```typescript
import { useParams, useSearchParams } from 'react-router-dom';

export const CategoryPage = () => {
  const { slug } = useParams();
  const [searchParams, setSearchParams] = useSearchParams();
  const store = searchParams.get('store') as 'BILLA' | 'FOODORA' | null;
  const [products, setProducts] = useState([]);

  useEffect(() => {
    const fetchProducts = async () => {
      const data = await getCategoryProducts(slug!, {
        store: store || undefined,
        page: 1,
        limit: 30
      });
      setProducts(data.data);
    };
    
    fetchProducts();
  }, [slug, store]);

  const handleStoreChange = (newStore: string) => {
    if (newStore === 'ALL') {
      searchParams.delete('store');
    } else {
      searchParams.set('store', newStore);
    }
    setSearchParams(searchParams);
  };

  return (
    <div>
      <h1>{category.name}</h1>
      
      {/* Store Filter */}
      <div className="store-filters">
        <button onClick={() => handleStoreChange('ALL')}>
          All Stores
        </button>
        <button onClick={() => handleStoreChange('BILLA')}>
          BILLA
        </button>
        <button onClick={() => handleStoreChange('FOODORA')}>
          Foodora
        </button>
      </div>

      {/* Products */}
      <div className="products">
        {products.map(product => (
          <ProductCard key={product.id} product={product} />
        ))}
      </div>
    </div>
  );
};
```

---

## Usage Examples

### Get all categories (all stores)

```bash
curl http://localhost:3001/api/categories
```

**Response:** Categories with total product counts from all stores.

### Get categories with Foodora counts only

```bash
curl "http://localhost:3001/api/categories?store=FOODORA"
```

**Response:** Categories with product counts showing only Foodora products.

### Get Foodora products in category

```bash
curl "http://localhost:3001/api/categories/foodora-drubez/products?store=FOODORA"
```

**Response:** Only Foodora products in the "Drůbež" category.

### Get BILLA products in category

```bash
curl "http://localhost:3001/api/categories/maso-a-ryby-1263/products?store=BILLA"
```

**Response:** Only BILLA products in the meat category.

---

## Backward Compatibility

✅ **Fully backward compatible**

- All existing API calls work without changes
- `?store=` parameter is optional
- If omitted, returns data from all stores (existing behavior)

---

## Frontend Migration Checklist

- [ ] Add `store?` parameter to `getCategories()` function
- [ ] Add `store?` parameter to `getCategoryProducts()` function
- [ ] Add store filter UI to category list page
- [ ] Add store filter UI to category detail/products page
- [ ] Update category card to show product count label (e.g., "16 Foodora products")
- [ ] Test filtering categories by store
- [ ] Test filtering category products by store

---

## Notes

### Product Counts

When you filter by store, `productCount` in the category response reflects only products from that store:

```typescript
// Without filter
GET /api/categories
// Category "Drůbež": productCount = 30 (16 Foodora + 14 BILLA)

// With Foodora filter
GET /api/categories?store=FOODORA
// Category "Drůbež": productCount = 16 (Foodora only)

// With BILLA filter
GET /api/categories?store=BILLA
// Category "Drůbež": productCount = 14 (BILLA only)
```

### Category Slugs

**Foodora categories** have `foodora-` prefix:
- `foodora-drubez`
- `foodora-hovezi-maso`
- etc.

**BILLA categories** use original slugs:
- `maso-a-ryby-1263`
- `ovoce-a-zelenina-1165`
- etc.

### Mixed Category Viewing

You can view products from all stores in any category:

```bash
# View all products (BILLA + Foodora) in Foodora category
GET /api/categories/foodora-drubez/products

# View only Foodora products
GET /api/categories/foodora-drubez/products?store=FOODORA
```

---

## Summary

✅ **Categories endpoint now supports `?store=` filter**  
✅ **Category products endpoint supports `?store=` filter**  
✅ **Product counts reflect filtered store**  
✅ **Fully backward compatible**  
✅ **No breaking changes**  

All category endpoints now work seamlessly with multi-store filtering!
