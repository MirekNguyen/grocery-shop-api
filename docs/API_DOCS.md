# Elysia API Server

RESTful API server built with Elysia to serve scraped product data to the React frontend.

## Quick Start

### 1. Start the API server
```bash
bun run api
```

The server will run at `http://localhost:3001` with auto-reload enabled.

### 2. Test the API
```bash
# Health check
curl http://localhost:3001/health

# Get all products
curl http://localhost:3001/api/products

# Get products with filters
curl "http://localhost:3001/api/products?category=ovoce-1166&page=1&limit=10"

# Get categories
curl http://localhost:3001/api/categories
```

## API Endpoints

### Products

#### `GET /api/products`
Get all products with optional filters and pagination.

**Query Parameters:**
- `category` (string): Filter by category slug
- `search` (string): Search in product name, brand, description
- `page` (number): Page number (default: 1)
- `limit` (number): Items per page (default: 30)
- `inPromotion` (boolean): Filter by promotion status

**Example:**
```bash
curl "http://localhost:3001/api/products?search=jablko&page=1&limit=10"
```

**Response:**
```json
{
  "data": [
    {
      "id": 1,
      "productId": "...",
      "name": "Product name",
      "price": 1490,
      "categories": [...]
    }
  ],
  "pagination": {
    "page": 1,
    "limit": 10,
    "total": 182,
    "totalPages": 19
  }
}
```

#### `GET /api/products/promotions`
Get products currently on promotion.

**Query Parameters:**
- `limit` (number): Max number of results (default: 20)

**Example:**
```bash
curl "http://localhost:3001/api/products/promotions?limit=5"
```

#### `GET /api/products/:id`
Get a single product by ID.

**Example:**
```bash
curl http://localhost:3001/api/products/1
```

#### `GET /api/products/slug/:slug`
Get a single product by slug.

**Example:**
```bash
curl http://localhost:3001/api/products/slug/ceska-farma-jablko-cervene-volne-82123456
```

### Categories

#### `GET /api/categories`
Get all categories with product counts.

**Example:**
```bash
curl http://localhost:3001/api/categories
```

**Response:**
```json
[
  {
    "id": 1,
    "key": "1165",
    "name": "Ovoce a zelenina",
    "slug": "ovoce-a-zelenina-1165",
    "productCount": 182
  }
]
```

#### `GET /api/categories/:slug`
Get a single category by slug.

**Example:**
```bash
curl http://localhost:3001/api/categories/ovoce-1166
```

#### `GET /api/categories/:slug/products`
Get all products in a category with pagination.

**Query Parameters:**
- `page` (number): Page number (default: 1)
- `limit` (number): Items per page (default: 30)

**Example:**
```bash
curl "http://localhost:3001/api/categories/ovoce-1166/products?page=1&limit=10"
```

**Response:**
```json
{
  "category": {
    "id": 2,
    "name": "Ovoce",
    "slug": "ovoce-1166"
  },
  "data": [...],
  "pagination": {
    "page": 1,
    "limit": 10,
    "total": 45,
    "totalPages": 5
  }
}
```

## Frontend Integration

### Update your React app to use the API

Replace mock data imports with API calls:

```typescript
// hooks/useProducts.ts
import { useQuery } from '@tanstack/react-query';

const API_URL = 'http://localhost:3000';

export const useProducts = (filters?: {
  category?: string;
  search?: string;
  page?: number;
  limit?: number;
}) => {
  const params = new URLSearchParams();
  if (filters?.category) params.set('category', filters.category);
  if (filters?.search) params.set('search', filters.search);
  if (filters?.page) params.set('page', filters.page.toString());
  if (filters?.limit) params.set('limit', filters.limit.toString());

  return useQuery({
    queryKey: ['products', filters],
    queryFn: async () => {
      const response = await fetch(`${API_URL}/api/products?${params}`);
      return response.json();
    },
  });
};

export const usePromotions = (limit = 20) => {
  return useQuery({
    queryKey: ['promotions', limit],
    queryFn: async () => {
      const response = await fetch(`${API_URL}/api/products/promotions?limit=${limit}`);
      return response.json();
    },
  });
};

export const useProduct = (id: number) => {
  return useQuery({
    queryKey: ['product', id],
    queryFn: async () => {
      const response = await fetch(`${API_URL}/api/products/${id}`);
      return response.json();
    },
  });
};
```

```typescript
// hooks/useCategories.ts
import { useQuery } from '@tanstack/react-query';

const API_URL = 'http://localhost:3000';

export const useCategories = () => {
  return useQuery({
    queryKey: ['categories'],
    queryFn: async () => {
      const response = await fetch(`${API_URL}/api/categories`);
      return response.json();
    },
  });
};

export const useCategoryProducts = (
  slug: string, 
  page = 1, 
  limit = 30
) => {
  return useQuery({
    queryKey: ['category', slug, page, limit],
    queryFn: async () => {
      const response = await fetch(
        `${API_URL}/api/categories/${slug}/products?page=${page}&limit=${limit}`
      );
      return response.json();
    },
  });
};
```

## CORS Configuration

CORS is enabled for all origins in development. For production, update [src/api.ts](src/api.ts):

```typescript
.use(
  cors({
    origin: 'https://your-frontend-domain.com', // Specific domain
    methods: ['GET'],
    credentials: false,
  })
)
```

## Architecture

- **API Controllers** ([product.controller.api.ts](src/modules/product/product.controller.api.ts), [category.controller.api.ts](src/modules/category/category.controller.api.ts))
  - Business logic for API endpoints
  - Pagination, filtering, search
  - Uses Repository layer for data access

- **Repositories** (existing)
  - Direct database operations
  - Already implemented in the scraper

- **API Server** ([src/api.ts](src/api.ts))
  - Elysia routing
  - Request validation
  - Error handling

## Development Tips

### Watch mode
The API runs with `--watch` flag, so it auto-reloads on file changes.

### Testing with curl
```bash
# Pretty print JSON with jq
curl -s http://localhost:3001/api/products | jq '.'

# Search products
curl -s "http://localhost:3001/api/products?search=jablko" | jq '.data[].name'

# Get promotions
curl -s http://localhost:3001/api/products/promotions | jq '.[].name'

# Get category with products
curl -s http://localhost:3001/api/categories/ovoce-1166/products | jq '.data[].name'
```

### Common Issues

**CORS errors in browser:**
- Make sure the API server is running
- Check browser console for specific error
- Verify CORS configuration in [src/api.ts](src/api.ts)

**Empty data:**
- Run `bun run db:stats` to verify database has data
- If empty, run `bun run dev` to scrape products first

**Port already in use:**
- Change port in [src/api.ts](src/api.ts): `.listen(3001)`
