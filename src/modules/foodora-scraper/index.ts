/**
 * Foodora Scraper Module
 * Public API exports for the Foodora scraper module
 */

// Product Services
export { scrapeProduct, scrapeProductFull, scrapeAndSaveProduct, saveToFile } from "./foodora-scraper.service.ts";
export { fetchProductDetails } from "./foodora-api.service.ts";
export { simplifyProduct } from "./foodora-transformer.service.ts";

// Category Services
export {
  scrapeCategoryProducts,
  scrapeMultipleCategories,
  scrapeCategoryTree,
  saveCategoryProducts,
  saveAllCategories,
  saveAllCategoriesToSingleFile,
} from "./foodora-category-scraper.service.ts";
export { fetchCategoryProducts } from "./foodora-category-api.service.ts";

// Database Integration Services
export {
  scrapeAllFoodoraCategories,
  scrapeFoodoraCategories,
  scrapeFoodoraCategory,
} from "./foodora-scraper-db.service.ts";
export {
  mapFoodoraProductToDb,
  saveFoodoraProduct,
  saveFoodoraCategoryProducts,
  saveFoodoraCategory,
} from "./foodora-db.service.ts";

// Product Types
export type {
  Product,
  ProductDetailsResponse,
  SimplifiedProduct,
  ProductAttribute,
  ActiveCampaign,
  FoodLabelling,
  WeightableAttributes,
} from "./foodora.types.ts";

// Category Types
export type {
  CategoryDefinition,
  CategoryProductItem,
  CategoryProductGroup,
  CategoryProductListResponse,
  CategoryProductsVariables,
} from "./foodora-category.types.ts";

// Schemas (for validation)
export {
  productSchema,
  productDetailsResponseSchema,
  activeCampaignSchema,
  foodLabellingSchema,
} from "./foodora.schemas.ts";

export {
  categoryProductItemSchema,
  categoryProductGroupSchema,
  categoryProductListResponseSchema,
} from "./foodora-category.schemas.ts";

// Constants
export {
  FOODORA_API_URL,
  DEFAULT_VENDOR_CODE,
  DEFAULT_USER_CODE,
} from "./foodora.constants.ts";
