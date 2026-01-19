import { Elysia } from 'elysia';
import { cors } from '@elysiajs/cors';
import * as ProductController from './modules/product/product.controller.api';
import * as CategoryController from './modules/category/category.controller.api';

const app = new Elysia()
  // Enable CORS for all origins
  .use(
    cors({
      origin: '*', // Allow all origins
      methods: ['GET', 'POST', 'PUT', 'DELETE', 'PATCH', 'OPTIONS'],
      allowedHeaders: ['Content-Type', 'Authorization'],
      credentials: false,
    })
  )
  // Health check
  .get('/health', () => ({ status: 'ok', timestamp: new Date().toISOString() }))

  // Products endpoints
  .get('/api/products', async ({ query }) => {
    const filters = {
      category: query.category as string | undefined,
      search: query.search as string | undefined,
      page: query.page ? parseInt(query.page as string) : 1,
      limit: query.limit ? parseInt(query.limit as string) : 30,
      inPromotion: query.inPromotion === 'true' ? true : undefined,
      store: query.store as string | undefined,
    };

    return await ProductController.getProducts(filters);
  })

  .get('/api/products/promotions', async ({ query }) => {
    const limit = query.limit ? parseInt(query.limit as string) : 20;
    return await ProductController.getPromotionProducts(limit);
  })

  .get('/api/products/:id', async ({ params, error }) => {
    const id = parseInt(params.id);
    
    if (isNaN(id)) {
      return error(400, { message: 'Invalid product ID' });
    }

    const product = await ProductController.getProductById(id);
    
    if (!product) {
      return error(404, { message: 'Product not found' });
    }

    return product;
  })

  .get('/api/products/slug/:slug', async ({ params, error }) => {
    const product = await ProductController.getProductBySlug(params.slug);
    
    if (!product) {
      return error(404, { message: 'Product not found' });
    }

    return product;
  })

  // Categories endpoints
  .get('/api/categories', async () => {
    return await CategoryController.getCategories();
  })

  .get('/api/categories/:slug', async ({ params, error }) => {
    const category = await CategoryController.getCategoryBySlug(params.slug);
    
    if (!category) {
      return error(404, { message: 'Category not found' });
    }

    return category;
  })

  .get('/api/categories/:slug/products', async ({ params, query, error }) => {
    const page = query.page ? parseInt(query.page as string) : 1;
    const limit = query.limit ? parseInt(query.limit as string) : 30;

    const result = await CategoryController.getProductsByCategory(
      params.slug,
      page,
      limit
    );

    if (!result.category) {
      return error(404, { message: 'Category not found' });
    }

    return result;
  })

  .listen(3001);

console.log(
  `🦊 Elysia API server is running at http://${app.server?.hostname}:${app.server?.port}`
);
console.log('');
console.log('Available endpoints:');
console.log('  GET  /health');
console.log('  GET  /api/products');
console.log('  GET  /api/products/promotions');
console.log('  GET  /api/products/:id');
console.log('  GET  /api/products/slug/:slug');
console.log('  GET  /api/categories');
console.log('  GET  /api/categories/:slug');
console.log('  GET  /api/categories/:slug/products');

export default app;
