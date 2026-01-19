import * as CategoryRepository from './category.repository';
import * as ProductQueries from '../product/product.queries';
import type { Category } from './category.schema';
import type { Product } from '../product/product.schema';

// Important categories to display (from categories file)
const IMPORTANT_CATEGORY_SLUGS = [
  'ovoce-a-zelenina-1165',
  'pecivo-1198',
  'chlazene-mlecne-a-rostlinne-vyrobky-1207',
  'maso-a-ryby-1263',
  'uzeniny-lahudky-a-hotova-jidla-1276',
  'mrazene-1307',
  'trvanlive-potraviny-1332',
  'cukrovinky-1449',
  'napoje-1474',
  'specialni-a-rostlinna-vyziva-1576',
  'pece-o-dite-1582',
  'drogerie-a-kosmetika-2426',
  'domacnost-2427',
  'mazlicci-1630',
  'billa-vlastni-vyroba-2030',
  'farmarske-a-lokalni-produkty-1667',
];

/**
 * Determines which store a category belongs to based on its slug
 */
const getCategoryStore = (slug: string): string => {
  if (slug.startsWith('foodora-billa-prosek-')) {
    return 'FOODORA_BILLA_PROSEK';
  }
  if (slug.startsWith('foodora-albert-florenc-')) {
    return 'FOODORA_ALBERT_FLORENC';
  }
  if (slug.startsWith('foodora-dmart-')) {
    return 'FOODORA_DMART';
  }
  // Default to BILLA for categories without prefix
  return 'BILLA';
};

type CategoryWithCount = Category & { productCount: number; store: string };

type CategoriesByStore = {
  [store: string]: CategoryWithCount[];
};

/**
 * Get all categories grouped by store/market
 */
export const getCategories = async (
  store?: string
): Promise<CategoriesByStore> => {
  const categories = await CategoryRepository.findAllCategories();
  let productsWithCategories = await ProductQueries.findAllProductsWithCategories();

  // Filter products by store if specified
  if (store) {
    productsWithCategories = productsWithCategories.filter((p) => p.store === store);
  }

  // Group categories by store
  const categoriesByStore: CategoriesByStore = {};

  for (const category of categories) {
    const categoryStore = getCategoryStore(category.slug);
    
    // If store filter is applied, skip categories from other stores
    if (store && categoryStore !== store) {
      continue;
    }

    // Count products in this category (from the filtered products)
    const productCount = productsWithCategories.filter((p) =>
      p.categories.some((c) => c.id === category.id)
    ).length;

    const categoryWithCount: CategoryWithCount = {
      ...category,
      productCount,
      store: categoryStore,
    };

    if (!categoriesByStore[categoryStore]) {
      categoriesByStore[categoryStore] = [];
    }

    categoriesByStore[categoryStore].push(categoryWithCount);
  }

  return categoriesByStore;
};

/**
 * Get a single category by slug
 */
export const getCategoryBySlug = async (
  slug: string
): Promise<Category | null> => {
  return await CategoryRepository.findCategoryBySlug(slug);
};

/**
 * Get products by category slug
 */
export const getProductsByCategory = async (
  slug: string,
  page: number = 1,
  limit: number = 30,
  store?: string
): Promise<{
  category: Category | null;
  data: (Product & { categories: any[] })[];
  pagination: {
    page: number;
    limit: number;
    total: number;
    totalPages: number;
  };
}> => {
  const category = await CategoryRepository.findCategoryBySlug(slug);
  
  if (!category) {
    return {
      category: null,
      data: [],
      pagination: { page, limit, total: 0, totalPages: 0 },
    };
  }

  let allProducts = await ProductQueries.findAllProductsWithCategories();
  
  // Filter by store if specified
  if (store) {
    allProducts = allProducts.filter((p) => p.store === store);
  }
  
  const categoryProducts = allProducts.filter((p) =>
    p.categories.some((c) => c.slug === slug)
  );

  const total = categoryProducts.length;
  const totalPages = Math.ceil(total / limit);
  const offset = (page - 1) * limit;
  const paginatedProducts = categoryProducts.slice(offset, offset + limit);

  return {
    category,
    data: paginatedProducts,
    pagination: {
      page,
      limit,
      total,
      totalPages,
    },
  };
};
