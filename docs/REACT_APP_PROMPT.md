# React App Development Guide - Billa Shop

## Project Overview
Create a React e-commerce app that displays products from the Billa shop scraper database. Use the provided TypeScript types and mock data for initial development.

## Tech Stack Recommendations
- **Framework:** React 18+ with TypeScript
- **Styling:** Tailwind CSS
- **State Management:** React Query (TanStack Query) for data fetching
- **Routing:** React Router v6
- **Build Tool:** Vite

## Setup Command
```bash
npm create vite@latest billa-shop -- --template react-ts
cd billa-shop
npm install
npm install @tanstack/react-query react-router-dom
npm install -D tailwindcss postcss autoprefixer
npx tailwindcss init -p
```

## File Structure
```
src/
├── types/
│   └── index.ts              # Copy from react-types.ts
├── data/
│   └── mock.ts               # Copy from mock-data.ts
├── hooks/
│   ├── useProducts.ts        # Product fetching logic
│   └── useCategories.ts      # Category fetching logic
├── components/
│   ├── ProductCard.tsx       # Individual product display
│   ├── ProductList.tsx       # Product grid/list
│   ├── CategoryFilter.tsx    # Category sidebar/filter
│   ├── SearchBar.tsx         # Search functionality
│   ├── PriceTag.tsx          # Price display with promotions
│   └── Header.tsx            # App header
├── pages/
│   ├── Home.tsx              # Main product listing
│   ├── ProductDetail.tsx     # Single product view
│   └── Category.tsx          # Category-specific view
└── utils/
    └── helpers.ts            # formatPrice, etc.
```

## Key Features to Implement

### 1. Product Listing Page
- Display products in a responsive grid (3-4 columns desktop, 1-2 mobile)
- Show product image, name, brand, price
- Highlight promotions with badges and strikethrough prices
- Show "In Promotion" badge for discounted items

### 2. Category Filter Sidebar
- List all categories from mockCategories
- Show product count per category
- Active category highlighting
- Mobile: collapsible/drawer

### 3. Product Card Component
```tsx
interface ProductCardProps {
  product: ProductWithCategories;
}

// Display:
// - Product image with fallback
// - Product name (truncated if too long)
// - Brand name
// - Price with promotion badge
// - Category tags
// - Add to cart button (placeholder)
```

### 4. Search Functionality
- Real-time search across product names and brands
- Debounced input (300ms)
- Clear button
- Display result count

### 5. Price Display Component
```tsx
interface PriceTagProps {
  product: Product;
}

// Show:
// - Regular price (strikethrough if on sale)
// - Discount price (highlighted in red/green)
// - Discount percentage badge
// - Price per unit (small text below)
```

### 6. Product Detail Page
- Full product information
- All images in a gallery
- All categories the product belongs to
- Full description
- Product marketing text
- "Related products" section (same category)

### 7. Responsive Design
- Mobile-first approach
- Breakpoints: sm (640px), md (768px), lg (1024px), xl (1280px)
- Touch-friendly buttons (min 44px)
- Optimized images

## Component Examples

### ProductCard.tsx
```tsx
import { ProductWithCategories, formatPrice, isOnSale, getDiscountPercentage } from '../types';

export const ProductCard = ({ product }: { product: ProductWithCategories }) => {
  const onSale = isOnSale(product);
  const discount = getDiscountPercentage(product);

  return (
    <div className="border rounded-lg p-4 hover:shadow-lg transition-shadow">
      {/* Image */}
      <div className="relative aspect-square mb-4">
        <img 
          src={product.images[0] || '/placeholder.jpg'} 
          alt={product.name}
          className="w-full h-full object-cover rounded"
        />
        {onSale && (
          <span className="absolute top-2 right-2 bg-red-500 text-white px-2 py-1 rounded text-sm">
            {discount}% OFF
          </span>
        )}
      </div>

      {/* Brand */}
      {product.brand && (
        <p className="text-sm text-gray-500 mb-1">{product.brand}</p>
      )}

      {/* Name */}
      <h3 className="font-semibold mb-2 line-clamp-2">{product.name}</h3>

      {/* Categories */}
      <div className="flex flex-wrap gap-1 mb-3">
        {product.categories.slice(0, 2).map(cat => (
          <span key={cat.id} className="text-xs bg-gray-100 px-2 py-1 rounded">
            {cat.name}
          </span>
        ))}
      </div>

      {/* Price */}
      <div className="mb-3">
        {onSale ? (
          <div className="flex items-center gap-2">
            <span className="text-lg font-bold text-red-600">
              {formatPrice(product.price)}
            </span>
            <span className="text-sm text-gray-400 line-through">
              {formatPrice(product.discountPrice)}
            </span>
          </div>
        ) : (
          <span className="text-lg font-bold">
            {formatPrice(product.price)}
          </span>
        )}
        {product.pricePerUnit && (
          <p className="text-xs text-gray-500">
            {formatPrice(product.pricePerUnit)}/kg
          </p>
        )}
      </div>

      {/* Actions */}
      <button className="w-full bg-blue-600 text-white py-2 rounded hover:bg-blue-700">
        View Details
      </button>
    </div>
  );
};
```

### CategoryFilter.tsx
```tsx
import { Category } from '../types';
import { getProductsByCategory } from '../data/mock';

export const CategoryFilter = ({ 
  categories, 
  activeCategory, 
  onCategoryChange 
}: {
  categories: Category[];
  activeCategory: string | null;
  onCategoryChange: (slug: string | null) => void;
}) => {
  return (
    <div className="bg-white p-4 rounded-lg shadow">
      <h2 className="font-bold text-lg mb-4">Categories</h2>
      
      <button
        onClick={() => onCategoryChange(null)}
        className={`w-full text-left px-3 py-2 rounded mb-1 ${
          !activeCategory ? 'bg-blue-100 text-blue-700' : 'hover:bg-gray-100'
        }`}
      >
        All Products
      </button>

      {categories.map(category => {
        const count = getProductsByCategory(category.slug).length;
        return (
          <button
            key={category.id}
            onClick={() => onCategoryChange(category.slug)}
            className={`w-full text-left px-3 py-2 rounded mb-1 flex justify-between ${
              activeCategory === category.slug 
                ? 'bg-blue-100 text-blue-700' 
                : 'hover:bg-gray-100'
            }`}
          >
            <span>{category.name}</span>
            <span className="text-gray-500 text-sm">{count}</span>
          </button>
        );
      })}
    </div>
  );
};
```

## Future Backend Integration

### API Endpoints (to implement later)
```typescript
// GET /api/products?page=1&limit=30&category=ovoce-1166&search=apple
// GET /api/products/:id
// GET /api/categories
// GET /api/categories/:slug/products
```

### Replace mock data with API calls
```typescript
// hooks/useProducts.ts
import { useQuery } from '@tanstack/react-query';

export const useProducts = (filters?: {
  category?: string;
  search?: string;
  page?: number;
}) => {
  return useQuery({
    queryKey: ['products', filters],
    queryFn: async () => {
      // Replace with actual API call
      // const response = await fetch(`/api/products?${params}`);
      // return response.json();
      
      // For now, use mock data
      return mockProducts;
    },
  });
};
```

## Styling Guidelines
- Use Tailwind's color palette (blue for primary, red for promotions)
- Card shadows: `shadow-md` on hover, `shadow-sm` default
- Rounded corners: `rounded-lg` for cards, `rounded` for buttons
- Spacing: consistent 4px scale (p-4, mb-4, gap-4)
- Typography: font-semibold for headings, font-normal for body

## Performance Optimizations
- Lazy load images with loading="lazy"
- Virtual scrolling for large product lists (react-window)
- Pagination or infinite scroll
- Image optimization (next/image or similar)
- Memoize expensive computations (useMemo)

## Accessibility
- Alt text for all images
- ARIA labels for buttons and links
- Keyboard navigation support
- Focus states on interactive elements
- Semantic HTML (nav, main, article, etc.)

## Next Steps After Mock Data
1. Build the UI with mock data
2. Create API endpoints using the existing scraper database
3. Replace mock data hooks with real API calls
4. Add authentication (if needed)
5. Implement shopping cart functionality
6. Add checkout flow
