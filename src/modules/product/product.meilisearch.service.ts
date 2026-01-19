/**
 * Meilisearch service for product indexing and searching
 */

import { meiliClient, PRODUCTS_INDEX } from '../../db/meilisearch';
import type { Product } from './product.schema';

/**
 * Initialize Meilisearch index for products
 */
export const initializeProductIndex = async () => {
  try {
    const index = meiliClient.index(PRODUCTS_INDEX);
    
    // Configure searchable attributes
    await index.updateSearchableAttributes([
      'name',
      'brand',
      'descriptionShort',
      'descriptionLong',
      'category',
    ]);
    
    // Configure filterable attributes
    await index.updateFilterableAttributes([
      'store',
      'categorySlug',
      'categoryKeys',
      'brand',
      'inPromotion',
      'published',
      'price',
    ]);
    
    // Configure sortable attributes
    await index.updateSortableAttributes([
      'price',
      'name',
      'scrapedAt',
    ]);
    
    // Configure ranking rules
    await index.updateRankingRules([
      'words',
      'typo',
      'proximity',
      'attribute',
      'sort',
      'exactness',
    ]);
    
    console.log('✅ Meilisearch product index initialized');
  } catch (error) {
    console.error('❌ Error initializing Meilisearch index:', error);
    throw error;
  }
};

/**
 * Index a single product
 */
export const indexProduct = async (product: Product & { categories?: any[] }) => {
  try {
    const index = meiliClient.index(PRODUCTS_INDEX);
    
    // Extract category keys for hierarchical filtering
    const categoryKeys = product.categories?.map(c => c.key) || [];
    
    // Prepare document for indexing
    const document = {
      id: product.id,
      store: product.store,
      productId: product.productId,
      sku: product.sku,
      slug: product.slug,
      name: product.name,
      brand: product.brand,
      descriptionShort: product.descriptionShort,
      descriptionLong: product.descriptionLong,
      category: product.category,
      categorySlug: product.categorySlug,
      categoryKeys: categoryKeys,
      price: product.price,
      pricePerUnit: product.pricePerUnit,
      inPromotion: product.inPromotion,
      published: product.published,
      amount: product.amount,
      volumeLabelShort: product.volumeLabelShort,
      baseUnitShort: product.baseUnitShort,
      images: product.images,
      scrapedAt: product.scrapedAt,
    };
    
    await index.addDocuments([document]);
  } catch (error) {
    console.error(`❌ Error indexing product ${product.sku}:`, error);
  }
};

/**
 * Index multiple products
 */
export const indexProducts = async (products: (Product & { categories?: any[] })[]) => {
  try {
    const index = meiliClient.index(PRODUCTS_INDEX);
    
    const documents = products.map(product => {
      // Extract category keys for hierarchical filtering
      const categoryKeys = product.categories?.map(c => c.key) || [];
      
      return {
        id: product.id,
        store: product.store,
        productId: product.productId,
        sku: product.sku,
        slug: product.slug,
        name: product.name,
        brand: product.brand,
        descriptionShort: product.descriptionShort,
        descriptionLong: product.descriptionLong,
        category: product.category,
        categorySlug: product.categorySlug,
        categoryKeys: categoryKeys,
        price: product.price,
        pricePerUnit: product.pricePerUnit,
        inPromotion: product.inPromotion,
        published: product.published,
        amount: product.amount,
        volumeLabelShort: product.volumeLabelShort,
        baseUnitShort: product.baseUnitShort,
        images: product.images,
        scrapedAt: product.scrapedAt,
      };
    });
    
    const task = await index.addDocuments(documents, { primaryKey: 'id' });
    console.log(`✅ Indexed ${documents.length} products (task: ${task.taskUid})`);
    return task;
  } catch (error) {
    console.error('❌ Error indexing products:', error);
    throw error;
  }
};

/**
 * Search products using Meilisearch
 */
export const searchProducts = async (
  query: string,
  options: {
    limit?: number;
    offset?: number;
    filter?: string[];
    sort?: string[];
  } = {}
) => {
  try {
    const index = meiliClient.index(PRODUCTS_INDEX);
    
    const results = await index.search(query, {
      limit: options.limit || 20,
      offset: options.offset || 0,
      filter: options.filter,
      sort: options.sort,
    });
    
    return results;
  } catch (error) {
    console.error('❌ Error searching products:', error);
    return { hits: [], estimatedTotalHits: 0, limit: 0, offset: 0, processingTimeMs: 0, query: '' };
  }
};

/**
 * Delete product from index
 */
export const deleteProductFromIndex = async (productId: number) => {
  try {
    const index = meiliClient.index(PRODUCTS_INDEX);
    await index.deleteDocument(productId);
  } catch (error) {
    console.error(`❌ Error deleting product ${productId} from index:`, error);
  }
};

/**
 * Clear all products from index
 */
export const clearProductIndex = async () => {
  try {
    const index = meiliClient.index(PRODUCTS_INDEX);
    await index.deleteAllDocuments();
    console.log('✅ Cleared product index');
  } catch (error) {
    console.error('❌ Error clearing product index:', error);
  }
};
