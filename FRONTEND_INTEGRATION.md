# Frontend Integration Guide

This guide shows how to consume the nested categories API in your frontend application.

## API Endpoint

```
GET /api/categories?store=FOODORA_BILLA_PROSEK
```

## Response Structure

The API returns categories grouped by store with a **hierarchical structure**:

```typescript
type CategoryWithCount = {
  id: number;
  key: string;
  name: string;
  productCount: number;        // Includes all descendant products
  store: string;
  parentId: number | null;
  subcategories?: CategoryWithCount[];  // Nested children
};

type Response = {
  [storeName: string]: CategoryWithCount[];
};
```

### Example Response

```json
{
  "FOODORA_BILLA_PROSEK": [
    {
      "id": 1281,
      "key": "foodora-billa-prosek-52e7a3c6-ca60-41b1-b691-7b8a5660794b",
      "name": "Pivo",
      "productCount": 450,
      "store": "FOODORA_BILLA_PROSEK",
      "parentId": null,
      "subcategories": [
        {
          "id": 1282,
          "name": "Ležáky do 12°",
          "productCount": 120,
          "store": "FOODORA_BILLA_PROSEK",
          "parentId": 1281
        },
        {
          "id": 1283,
          "name": "Výčepní piva do 10°",
          "productCount": 90,
          "store": "FOODORA_BILLA_PROSEK",
          "parentId": 1281
        }
      ]
    }
  ]
}
```

## Key Features

### 1. **Recursive Product Counting**
Parent categories automatically include products from all descendant categories:

```
Pivo (450 products total)
├── Ležáky do 12° (120 products)
├── Výčepní piva do 10° (90 products)
├── Tmavá piva (80 products)
└── ... (160 more products)
```

The parent "Pivo" shows `productCount: 450`, which is the sum of all its subcategories.

### 2. **Only Root Categories at Top Level**
Categories with `parentId: null` appear at the top level. All children are nested under `subcategories`.

### 3. **Preserved Store Context**
All categories and subcategories include the `store` field for filtering.

## Frontend Examples

### React Example

```tsx
import { useState, useEffect } from 'react';

type CategoryWithCount = {
  id: number;
  name: string;
  productCount: number;
  subcategories?: CategoryWithCount[];
};

const CategoryTree = ({ store }: { store: string }) => {
  const [categories, setCategories] = useState<CategoryWithCount[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchCategories = async () => {
      const response = await fetch(`/api/categories?store=${store}`);
      const data = await response.json();
      setCategories(data[store] || []);
      setLoading(false);
    };

    fetchCategories();
  }, [store]);

  if (loading) return <div>Loading...</div>;

  return (
    <div className="category-tree">
      {categories.map(category => (
        <Category key={category.id} category={category} />
      ))}
    </div>
  );
};

const Category = ({ category }: { category: CategoryWithCount }) => {
  const [expanded, setExpanded] = useState(false);
  const hasChildren = category.subcategories && category.subcategories.length > 0;

  return (
    <div className="category">
      <div 
        className="category-header"
        onClick={() => hasChildren && setExpanded(!expanded)}
      >
        {hasChildren && (
          <span className="expand-icon">
            {expanded ? '▼' : '▶'}
          </span>
        )}
        <span className="category-name">{category.name}</span>
        <span className="product-count">({category.productCount} products)</span>
      </div>

      {expanded && hasChildren && (
        <div className="subcategories">
          {category.subcategories!.map(sub => (
            <Category key={sub.id} category={sub} />
          ))}
        </div>
      )}
    </div>
  );
};

export default CategoryTree;
```

### Vue Example

```vue
<template>
  <div class="category-tree">
    <CategoryItem 
      v-for="category in categories" 
      :key="category.id" 
      :category="category" 
    />
  </div>
</template>

<script setup lang="ts">
import { ref, onMounted } from 'vue';
import CategoryItem from './CategoryItem.vue';

type CategoryWithCount = {
  id: number;
  name: string;
  productCount: number;
  subcategories?: CategoryWithCount[];
};

const props = defineProps<{ store: string }>();
const categories = ref<CategoryWithCount[]>([]);

onMounted(async () => {
  const response = await fetch(`/api/categories?store=${props.store}`);
  const data = await response.json();
  categories.value = data[props.store] || [];
});
</script>
```

```vue
<!-- CategoryItem.vue -->
<template>
  <div class="category">
    <div 
      class="category-header" 
      @click="hasChildren && (expanded = !expanded)"
    >
      <span v-if="hasChildren" class="expand-icon">
        {{ expanded ? '▼' : '▶' }}
      </span>
      <span class="category-name">{{ category.name }}</span>
      <span class="product-count">({{ category.productCount }} products)</span>
    </div>

    <div v-if="expanded && hasChildren" class="subcategories">
      <CategoryItem 
        v-for="sub in category.subcategories" 
        :key="sub.id" 
        :category="sub" 
      />
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, computed } from 'vue';

type CategoryWithCount = {
  id: number;
  name: string;
  productCount: number;
  subcategories?: CategoryWithCount[];
};

const props = defineProps<{ category: CategoryWithCount }>();
const expanded = ref(false);
const hasChildren = computed(() => 
  props.category.subcategories && props.category.subcategories.length > 0
);
</script>
```

### Vanilla JavaScript Example

```javascript
const renderCategories = async (store) => {
  const response = await fetch(`/api/categories?store=${store}`);
  const data = await response.json();
  const categories = data[store] || [];

  const container = document.getElementById('category-tree');
  container.innerHTML = '';

  categories.forEach(category => {
    container.appendChild(renderCategory(category, 0));
  });
};

const renderCategory = (category, depth) => {
  const div = document.createElement('div');
  div.className = 'category';
  div.style.marginLeft = `${depth * 20}px`;

  const header = document.createElement('div');
  header.className = 'category-header';
  
  const hasChildren = category.subcategories && category.subcategories.length > 0;
  
  if (hasChildren) {
    const expandIcon = document.createElement('span');
    expandIcon.className = 'expand-icon';
    expandIcon.textContent = '▶';
    header.appendChild(expandIcon);

    header.style.cursor = 'pointer';
    header.onclick = () => {
      const subcategories = div.querySelector('.subcategories');
      const isExpanded = subcategories.style.display !== 'none';
      
      subcategories.style.display = isExpanded ? 'none' : 'block';
      expandIcon.textContent = isExpanded ? '▶' : '▼';
    };
  }

  const name = document.createElement('span');
  name.className = 'category-name';
  name.textContent = category.name;
  header.appendChild(name);

  const count = document.createElement('span');
  count.className = 'product-count';
  count.textContent = `(${category.productCount} products)`;
  header.appendChild(count);

  div.appendChild(header);

  if (hasChildren) {
    const subcategories = document.createElement('div');
    subcategories.className = 'subcategories';
    subcategories.style.display = 'none';

    category.subcategories.forEach(sub => {
      subcategories.appendChild(renderCategory(sub, depth + 1));
    });

    div.appendChild(subcategories);
  }

  return div;
};

// Usage
renderCategories('FOODORA_BILLA_PROSEK');
```

## Common Use Cases

### 1. Flat List (All Categories)

```typescript
const flattenCategories = (categories: CategoryWithCount[]): CategoryWithCount[] => {
  const result: CategoryWithCount[] = [];
  
  const flatten = (cats: CategoryWithCount[]) => {
    cats.forEach(cat => {
      result.push(cat);
      if (cat.subcategories) {
        flatten(cat.subcategories);
      }
    });
  };
  
  flatten(categories);
  return result;
};
```

### 2. Find Category by ID

```typescript
const findCategoryById = (
  categories: CategoryWithCount[], 
  id: number
): CategoryWithCount | null => {
  for (const cat of categories) {
    if (cat.id === id) return cat;
    
    if (cat.subcategories) {
      const found = findCategoryById(cat.subcategories, id);
      if (found) return found;
    }
  }
  
  return null;
};
```

### 3. Get Breadcrumb Path

```typescript
const getCategoryPath = (
  categories: CategoryWithCount[], 
  targetId: number,
  path: string[] = []
): string[] | null => {
  for (const cat of categories) {
    const currentPath = [...path, cat.name];
    
    if (cat.id === targetId) {
      return currentPath;
    }
    
    if (cat.subcategories) {
      const found = getCategoryPath(cat.subcategories, targetId, currentPath);
      if (found) return found;
    }
  }
  
  return null;
};

// Usage:
// getCategoryPath(categories, 1282) 
// => ["Pivo", "Ležáky do 12°"]
```

### 4. Filter by Product Count

```typescript
const getCategoriesWithMinProducts = (
  categories: CategoryWithCount[], 
  minProducts: number
): CategoryWithCount[] => {
  return categories
    .filter(cat => cat.productCount >= minProducts)
    .map(cat => ({
      ...cat,
      subcategories: cat.subcategories 
        ? getCategoriesWithMinProducts(cat.subcategories, minProducts)
        : undefined
    }));
};
```

## Database Schema Reference

The categories are stored with the following structure:

```sql
CREATE TABLE categories (
  id INTEGER PRIMARY KEY,
  key TEXT NOT NULL UNIQUE,
  name TEXT NOT NULL,
  store TEXT NOT NULL,
  parent_id INTEGER,
  FOREIGN KEY (parent_id) REFERENCES categories(id)
);
```

## Statistics (Current Data)

Based on the latest scrape of **FOODORA_BILLA_PROSEK**:

- **22** root categories
- **19** categories with subcategories
- **124** total subcategories
- **6.53** average subcategories per parent
- **12** max subcategories (in "Privátní značky")

## Available Stores

- `FOODORA_BILLA_PROSEK` - BILLA Praha Prosek (main grocery store)
- `FOODORA_ALBERT_FLORENC` - Albert Praha Florenc
- `FOODORA_DMART` - Test/demo vendor

See `FOODORA_STORES.md` for more details.

## Need to Re-scrape?

If categories are missing or hierarchy looks incorrect:

```bash
# Scrape all stores
bun src/scrape-all-foodora-stores.ts

# Or scrape specific store
bun src/scrape-foodora-store.ts --store=FOODORA_BILLA_PROSEK
```

## Troubleshooting

### All categories show 0 products
- Re-scrape the store to populate products
- Check that products are being linked to categories correctly

### No subcategories appearing
- Verify `parent_id` is set in database: `bun src/check-parent-ids.ts`
- Re-scrape to ensure hierarchy is saved properly

### Parent productCount doesn't include children
- This should be automatically calculated by the API
- File a bug if recursive counting isn't working
