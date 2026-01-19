# API Changes Summary - Category Endpoints

## ✅ Categories Endpoints Updated

All category endpoints now support the `?store=` query parameter.

---

## Quick Reference

### 1. Get Categories with Store Filter

```bash
# All stores (default)
GET /api/categories

# Foodora categories with Foodora product counts
GET /api/categories?store=FOODORA

# BILLA categories with BILLA product counts
GET /api/categories?store=BILLA
```

**Response includes:**
- `productCount` - Number of products in category (filtered by store if specified)

---

### 2. Get Category Products with Store Filter

```bash
# All products in category (all stores)
GET /api/categories/:slug/products

# Foodora products only
GET /api/categories/foodora-drubez/products?store=FOODORA

# BILLA products only
GET /api/categories/maso-a-ryby-1263/products?store=BILLA

# With pagination
GET /api/categories/:slug/products?store=FOODORA&page=2&limit=20
```

**Response includes:**
- Products filtered by store
- Pagination totals reflect filtered count

---

## TypeScript Updates

### Update API Client

```typescript
// Add store parameter to category functions
export const getCategories = async (store?: 'BILLA' | 'FOODORA') => {
  const params = new URLSearchParams();
  if (store) params.append('store', store);
  return fetch(`/api/categories?${params}`).then(r => r.json());
}

export const getCategoryProducts = async (
  slug: string,
  options?: { page?: number; limit?: number; store?: 'BILLA' | 'FOODORA' }
) => {
  const params = new URLSearchParams();
  if (options?.page) params.append('page', options.page.toString());
  if (options?.limit) params.append('limit', options.limit.toString());
  if (options?.store) params.append('store', options.store);
  return fetch(`/api/categories/${slug}/products?${params}`).then(r => r.json());
}
```

---

## UI Components

### Store Filter for Categories

```tsx
<div className="store-filters">
  <button onClick={() => setStore('ALL')}>All Stores</button>
  <button onClick={() => setStore('BILLA')}>BILLA</button>
  <button onClick={() => setStore('FOODORA')}>Foodora</button>
</div>

{/* Category cards show filtered product count */}
{categories.map(cat => (
  <div key={cat.id}>
    <h3>{cat.name}</h3>
    <p>{cat.productCount} products</p>
  </div>
))}
```

---

## Backward Compatibility

✅ **No breaking changes**
- All existing calls work without modification
- `?store=` parameter is optional
- Omitting it returns all stores (existing behavior)

---

## Files Changed

**Backend:**
- ✅ `src/modules/category/category.controller.api.ts` - Added store filtering
- ✅ `src/api.ts` - Added store query parameter

**Documentation:**
- ✅ `docs/FRONTEND-API-CHANGES.md` - Updated with category endpoints
- ✅ `docs/CATEGORY-ENDPOINTS-UPDATE.md` - Detailed category docs

---

## Complete Endpoint List

### Products
- `GET /api/products?store=FOODORA` ✅
- `GET /api/products/promotions` (no filter needed)
- `GET /api/products/:id`
- `GET /api/products/slug/:slug`

### Categories (NEW)
- `GET /api/categories?store=FOODORA` ✅ **NEW**
- `GET /api/categories/:slug`
- `GET /api/categories/:slug/products?store=FOODORA` ✅ **NEW**

### Health
- `GET /health`

---

## Full Documentation

See:
- **`docs/FRONTEND-API-CHANGES.md`** - Complete frontend integration guide
- **`docs/CATEGORY-ENDPOINTS-UPDATE.md`** - Category endpoints details
- **`docs/FOODORA-DB-INTEGRATION.md`** - Database integration guide
- **`QUICK-START.md`** - Quick command reference
