import type { BillaApiResponse, ProductResult, Category, CategoryInfo } from './api.types';
import type { NewProduct } from '../product/product.schema';
import type { NewCategory } from '../category/category.schema';
import * as ProductRepository from '../product/product.repository';
import * as CategoryRepository from '../category/category.repository';
import * as ProductCategoriesRepository from '../category/product-categories.repository';

const BILLA_API_BASE_URL = 'https://shop.billa.cz/api/product-discovery/categories';
const STORE_ID = '82-189';
const PAGE_SIZE = 30;

/**
 * Parses the categories file content into an array of Category objects.
 */
export const parseCategories = (fileContent: string): Category[] => {
  return fileContent
    .trim()
    .split('\n')
    .filter(line => line.trim().length > 0)
    .map(line => {
      const parts = line.split('-');
      const slug = line;
      const name = parts.slice(0, -1).join('-');
      return { name, slug };
    });
};

/**
 * Fetches products for a specific category and page.
 */
export const fetchProducts = async (
  categorySlug: string,
  page: number = 1
): Promise<BillaApiResponse> => {
  const url = `${BILLA_API_BASE_URL}/${categorySlug}/products?sortBy=relevance&storeId=${STORE_ID}&enableStatistics=true&enablePersonalization=true&page=${page}&pageSize=${PAGE_SIZE}`;
  
  console.log(`Fetching: ${url}`);
  
  const response = await fetch(url);
  
  if (!response.ok) {
    throw new Error(`HTTP error! status: ${response.status}`);
  }
  
  const data: BillaApiResponse = await response.json();
  return data;
};

/**
 * Saves categories from product's parentCategories to the database.
 */
export const saveCategories = async (categoriesArray: CategoryInfo[][]): Promise<void> => {
  for (const categoryPath of categoriesArray) {
    for (const category of categoryPath) {
      const newCategory: NewCategory = {
        key: category.key,
        name: category.name,
        slug: category.slug,
        orderHint: category.orderHint,
      };
      await CategoryRepository.upsertCategory(newCategory);
    }
  }
};

/**
 * Maps API product result to database product format.
 */
export const mapProductToDb = async (
  product: ProductResult,
  categorySlug: string
): Promise<{ product: NewProduct; categoryIds: number[] }> => {
  // Save all categories from parentCategories (array of arrays)
  const categoryIds: number[] = [];
  
  if (product.parentCategories && product.parentCategories.length > 0) {
    await saveCategories(product.parentCategories);
    
    // Flatten and get all category IDs
    const allCategories = product.parentCategories.flat();
    for (const categoryInfo of allCategories) {
      const dbCategory = await CategoryRepository.findCategoryBySlug(categoryInfo.slug);
      if (dbCategory) {
        categoryIds.push(dbCategory.id);
      }
    }
  }
  
  const newProduct: NewProduct = {
    productId: product.productId,
    sku: product.sku,
    slug: product.slug,
    name: product.name,
    descriptionShort: product.descriptionShort || null,
    descriptionLong: product.descriptionLong || null,
    regulatedProductName: product.regulatedProductName || null,
    category: product.category,
    categorySlug: categorySlug,
    brand: product.brand?.name || null,
    brandSlug: product.brand?.slug || null,
    // Map price fields correctly from API structure
    price: product.price?.regular?.value || null,
    pricePerUnit: product.price?.regular?.perStandardizedQuantity || null,
    unitPrice: product.price?.regular?.perStandardizedQuantity 
      ? parseFloat(String(product.price.regular.perStandardizedQuantity)) 
      : null,
    regularPrice: product.price?.regular?.value || null,
    discountPrice: product.price?.crossed || null,
    lowestPrice: product.price?.lowestPrice || null,
    inPromotion: product.inPromotion,
    amount: product.amount,
    weight: product.weight,
    packageLabel: product.packageLabel || null,
    packageLabelKey: product.packageLabelKey || null,
    volumeLabelKey: product.volumeLabelKey || null,
    volumeLabelShort: product.volumeLabelShort || null,
    baseUnitLong: product.price?.baseUnitLong || null,
    baseUnitShort: product.price?.baseUnitShort || null,
    images: product.images,
    productMarketing: product.productMarketing || null,
    brandMarketing: product.brandMarketing || null,
    published: product.published,
    medical: product.medical,
    weightArticle: product.weightArticle,
  };
  
  return { product: newProduct, categoryIds };
};

/**
 * Scrapes all products for a single category.
 */
export const scrapeCategoryProducts = async (category: Category): Promise<number> => {
  console.log(`\n🔍 Scraping category: ${category.name} (${category.slug})`);
  
  let page = 0;
  let totalScraped = 0;
  let hasMore = true;
  
  while (hasMore) {
    try {
      const response = await fetchProducts(category.slug, page);
      
      console.log(`  📄 Page ${page}: Found ${response.count} products (Total in category: ${response.total})`);
      
      if (response.results.length === 0) {
        hasMore = false;
        break;
      }
      
      // Map and save products with their categories
      for (const productData of response.results) {
        const { product, categoryIds } = await mapProductToDb(productData, category.slug);
        
        // Upsert the product
        const savedProduct = await ProductRepository.upsertProduct(product);
        
        // Link product to all its categories
        if (categoryIds.length > 0) {
          await ProductCategoriesRepository.linkProductToCategories(savedProduct.id, categoryIds);
        }
      }
      
      totalScraped += response.results.length;
      
      // Check if there are more pages
      if (response.offset >= response.total) {
        hasMore = false;
      } else {
        page++;
        // Add a small delay to be respectful to the API
        await new Promise(resolve => setTimeout(resolve, 500));
      }
    } catch (error) {
      console.error(`  ❌ Error scraping page ${page}:`, error);
      hasMore = false;
    }
  }
  
  console.log(`  ✅ Scraped ${totalScraped} products from ${category.name}`);
  return totalScraped;
};

/**
 * Main scraper function - scrapes all categories.
 */
export const scrapeAllCategories = async (categories: Category[]): Promise<void> => {
  console.log(`🚀 Starting scraper for ${categories.length} categories...`);
  
  let totalProducts = 0;
  
  for (const category of categories) {
    const count = await scrapeCategoryProducts(category);
    totalProducts += count;
  }
  
  console.log(`\n✨ Scraping complete! Total products scraped: ${totalProducts}`);
  
  const dbCount = await ProductRepository.getProductCount();
  console.log(`📊 Total products in database: ${dbCount}`);
  
  const categoryCount = await CategoryRepository.getCategoryCount();
  console.log(`📁 Total categories in database: ${categoryCount}`);
};
