import * as ProductRepository from './product.repository';
import * as ProductQueries from './product.queries';
import * as ProductMeiliService from './product.meilisearch.service';
import type { Product } from './product.schema';

export interface ProductFilters {
  category?: string;
  search?: string;
  page?: number;
  limit?: number;
  inPromotion?: boolean;
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
  } = filters;

  // Get products with categories
  let products = await ProductQueries.findAllProductsWithCategories();

  // Apply search filter using Meilisearch
  if (search) {
    const searchResults = await ProductMeiliService.searchProducts(search, {
      limit: 1000,
      filter: category ? [`categorySlug = "${category}"`] : undefined,
    });
    
    if (searchResults.hits.length > 0) {
      const productIds = new Set(searchResults.hits.map((hit: any) => hit.id));
      products = products.filter((p) => productIds.has(p.id));
      // Sort by Meilisearch ranking
      const idOrder = new Map(searchResults.hits.map((hit: any, index: number) => [hit.id, index]));
      products.sort((a, b) => (idOrder.get(a.id) ?? 999999) - (idOrder.get(b.id) ?? 999999));
    } else {
      products = [];
    }
  } else if (category) {
    // Apply category filter without search
    products = products.filter((p) =>
      p.categories.some((c) => c.slug === category)
    );
  }

  // Apply promotion filter
  if (inPromotion !== undefined) {
    products = products.filter((p) => p.inPromotion === inPromotion);
  }

  // Calculate pagination
  const total = products.length;
  const totalPages = Math.ceil(total / limit);
  const offset = (page - 1) * limit;

  // Apply pagination
  const paginatedProducts = products.slice(offset, offset + limit);

  return {
    data: paginatedProducts,
    pagination: {
      page,
      limit,
      total,
      totalPages,
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
