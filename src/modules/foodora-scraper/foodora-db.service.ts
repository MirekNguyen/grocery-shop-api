/**
 * Foodora Database Integration Service
 * Maps Foodora products to database format and handles storage
 */

import type { NewProduct } from "../product/product.schema.ts";
import type { NewCategory } from "../category/category.schema.ts";
import type { CategoryProductItem } from "./foodora-category.types.ts";
import * as ProductRepository from "../product/product.repository.ts";
import * as CategoryRepository from "../category/category.repository.ts";
import * as ProductCategoriesRepository from "../category/product-categories.repository.ts";

/**
 * Maps Foodora product to database product format
 */
export const mapFoodoraProductToDb = (
  product: CategoryProductItem,
  categoryId: string,
  categoryName: string,
  categorySlug: string,
  store: string
): NewProduct => {
  // Extract base unit from attributes
  const baseUnitAttr = product.attributes?.find((attr) => attr.key === "baseUnit");
  const skuAttr = product.attributes?.find((attr) => attr.key === "sku");
  const pricePerBaseUnitAttr = product.attributes?.find(
    (attr) => attr.key === "pricePerBaseUnit"
  );

  return {
    store,
    
    // Product identifiers
    productId: product.productID,
    sku: skuAttr?.value || product.productID,
    slug: product.name
      .toLowerCase()
      .replace(/\s+/g, "-")
      .replace(/[^a-z0-9-]/g, ""),
    
    // Basic information
    name: product.name,
    descriptionShort: product.description || null,
    descriptionLong: product.description || null,
    regulatedProductName: null,
    
    // Category information
    category: categoryName,
    categorySlug,
    
    // Brand (Foodora doesn't have brand info in product data)
    brand: null,
    brandSlug: null,
    
    // Pricing (Foodora prices are in CZK as floats, convert to cents)
    price: Math.round(product.price * 100),
    pricePerUnit: pricePerBaseUnitAttr?.value
      ? Math.round(parseFloat(pricePerBaseUnitAttr.value) * 100)
      : null,
    unitPrice: pricePerBaseUnitAttr?.value
      ? parseFloat(pricePerBaseUnitAttr.value)
      : null,
    regularPrice: Math.round(product.originalPrice * 100),
    discountPrice:
      product.price < product.originalPrice
        ? Math.round(product.price * 100)
        : null,
    lowestPrice: null,
    
    // Promotion
    inPromotion: product.price < product.originalPrice,
    
    // Weight and packaging
    amount: null,
    weight: product.weightableAttributes?.weightValue?.value || null,
    packageLabel: null,
    packageLabelKey: null,
    volumeLabelKey: null,
    volumeLabelShort: null,
    
    // Base unit for pricing
    baseUnitLong: baseUnitAttr?.value || null,
    baseUnitShort: baseUnitAttr?.value || null,
    
    // Images
    images: product.urls || [],
    
    // Marketing
    productMarketing: null,
    brandMarketing: null,
    
    // Additional flags
    published: product.isAvailable,
    medical: false,
    weightArticle: product.weightableAttributes !== null,
  };
};

/**
 * Saves a Foodora category to the database
 */
export const saveFoodoraCategory = async (
  categoryId: string,
  categoryName: string,
  storeCode: string
): Promise<number> => {
  const categorySlug = categoryName
    .toLowerCase()
    .replace(/\s+/g, "-")
    .replace(/[^a-z0-9-]/g, "");

  const newCategory: NewCategory = {
    key: `${storeCode}-${categoryId}`,
    name: categoryName,
    slug: `${storeCode}-${categorySlug}`,
    orderHint: null,
  };

  const savedCategory = await CategoryRepository.upsertCategory(newCategory);
  return savedCategory.id;
};

/**
 * Saves a Foodora product and links it to its category
 */
export const saveFoodoraProduct = async (
  product: CategoryProductItem,
  categoryId: string,
  categoryName: string,
  store: string,
  storeCode: string
): Promise<void> => {
  const categorySlug = categoryName
    .toLowerCase()
    .replace(/\s+/g, "-")
    .replace(/[^a-z0-9-]/g, "");

  // Save category first
  const dbCategoryId = await saveFoodoraCategory(categoryId, categoryName, storeCode);

  // Map and save product
  const dbProduct = mapFoodoraProductToDb(
    product,
    categoryId,
    categoryName,
    `${storeCode}-${categorySlug}`,
    store
  );

  const savedProduct = await ProductRepository.upsertProduct(dbProduct);

  // Link product to category
  await ProductCategoriesRepository.linkProductToCategories(savedProduct.id, [
    dbCategoryId,
  ]);
};

/**
 * Batch saves multiple Foodora products from a category group
 */
export const saveFoodoraCategoryProducts = async (
  categoryId: string,
  categoryName: string,
  products: CategoryProductItem[],
  store: string,
  storeCode: string
): Promise<number> => {
  let savedCount = 0;

  for (const product of products) {
    try {
      await saveFoodoraProduct(product, categoryId, categoryName, store, storeCode);
      savedCount++;
    } catch (error) {
      console.error(
        `Error saving product ${product.productID} (${product.name}):`,
        error
      );
    }
  }

  return savedCount;
};
