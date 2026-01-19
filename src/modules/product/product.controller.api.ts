import * as ProductRepository from './product.repository';
import * as ProductQueries from './product.queries';
import * as ProductMeiliService from './product.meilisearch.service';
import * as CategoryRepository from '../category/category.repository';
import type { Product } from './product.schema';

export interface ProductFilters {
  category?: string;
  search?: string;
  page?: number;
  limit?: number;
  inPromotion?: boolean;
  store?: string;
}

export interface PaginatedResponse<T> {
  data: T[];
  pagination: {
    page: number;
    limit: number;
    total: number;
    totalPages: number;
  };
}

/**
 * Get all products with optional filters and pagination
 * ALWAYS uses Meilisearch for fast querying
 */
export const getProducts = async (
  filters: ProductFilters = {}
): Promise<PaginatedResponse<Product & { categories: any[] }>> => {
  const {
    category,
    search,
    page = 1,
    limit = 30,
    inPromotion,
    store,
  } = filters;

  // Build Meilisearch filters
  const meiliFilters: string[] = [];
  
  // Filter by store
  if (store) {
    meiliFilters.push(`store = "${store}"`);
  }
  
  // Filter by category (including all subcategories)
  if (category) {
    // Get all descendant category keys (includes parent + all subcategories)
    const categoryKeys = await CategoryRepository.getAllDescendantCategoryKeys(category);
    
    if (categoryKeys.length > 0) {
      // Use OR filter to match any of the category keys
      const categoryFilter = categoryKeys.map(key => `categoryKeys = "${key}"`).join(' OR ');
      meiliFilters.push(`(${categoryFilter})`);
    }
  }
  
  // Filter by promotion status
  if (inPromotion !== undefined) {
    meiliFilters.push(`inPromotion = ${inPromotion}`);
  }

  // Search using Meilisearch
  const searchQuery = search || ''; // Empty string returns all results
  const offset = (page - 1) * limit;
  
  const searchResults = await ProductMeiliService.searchProducts(searchQuery, {
    limit: limit,
    offset: offset,
    filter: meiliFilters.length > 0 ? meiliFilters : undefined,
  });
  
  // If no results, return empty response
  if (searchResults.hits.length === 0) {
    return {
      data: [],
      pagination: {
        page,
        limit,
        total: searchResults.estimatedTotalHits || 0,
        totalPages: 0,
      },
    };
  }
  
  // Get full product details with categories from database (only for search results)
  const productIds = searchResults.hits.map((hit: any) => hit.id);
  const productsWithCategories = await ProductQueries.findProductsByIdsWithCategories(productIds);
  
  // Maintain Meilisearch ranking order
  const idOrder = new Map(productIds.map((id, index) => [id, index]));
  const products = productsWithCategories
    .sort((a, b) => (idOrder.get(a.id) ?? 999999) - (idOrder.get(b.id) ?? 999999));

  return {
    data: products,
    pagination: {
      page,
      limit,
      total: searchResults.estimatedTotalHits || 0,
      totalPages: Math.ceil((searchResults.estimatedTotalHits || 0) / limit),
    },
  };
};

/**
 * Get a single product by ID with its categories
 */
export const getProductById = async (
  id: number
): Promise<(Product & { categories: any[] }) | null> => {
  const products = await ProductQueries.findProductByIdWithCategories(id);
  return products.length > 0 ? products[0] : null;
};

/**
 * Get a single product by slug with its categories
 */
export const getProductBySlug = async (
  slug: string
): Promise<(Product & { categories: any[] }) | null> => {
  const products = await ProductQueries.findAllProductsWithCategories();
  const product = products.find((p) => p.slug === slug);
  return product || null;
};

/**
 * Get products on promotion
 */
export const getPromotionProducts = async (
  limit: number = 20
): Promise<(Product & { categories: any[] })[]> => {
  const products = await ProductQueries.findAllProductsWithCategories();
  return products.filter((p) => p.inPromotion).slice(0, limit);
};

/**
 * Get available stores with product counts
 */
export const getAvailableStores = async (): Promise<Array<{ store: string; count: number }>> => {
  return await ProductRepository.getAvailableStores();
};
