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
 * Get all categories with product counts (filtered to important categories only)
 */
export const getCategories = async (): Promise<
  (Category & { productCount: number })[]
> => {
  const categories = await CategoryRepository.findAllCategories();
  const productsWithCategories = await ProductQueries.findAllProductsWithCategories();

  // Filter to only important categories
  const importantCategories = categories.filter((cat) =>
    IMPORTANT_CATEGORY_SLUGS.includes(cat.slug)
  );

  // Count products per category
  return importantCategories.map((category) => {
    const productCount = productsWithCategories.filter((p) =>
      p.categories.some((c) => c.id === category.id)
    ).length;

    return {
      ...category,
      productCount,
    };
  });
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
  limit: number = 30
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

  const allProducts = await ProductQueries.findAllProductsWithCategories();
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
