/**
 * Foodora Scraper Service
 * Main orchestration service for scraping Foodora products
 */

import { fetchProductDetails } from "./foodora-api.service.ts";
import { simplifyProduct } from "./foodora-transformer.service.ts";
import type { SimplifiedProduct, ProductDetailsResponse } from "./foodora.types.ts";

// ============================================================================
// Main Scraper Functions
// ============================================================================

/**
 * Scrapes a product from Foodora and returns simplified data
 * @param productId - The unique product identifier
 * @param vendorCode - Vendor code (optional)
 * @param userCode - User code (optional)
 * @returns Simplified product information
 */
export const scrapeProduct = async (
  productId: string,
  vendorCode?: string,
  userCode?: string
): Promise<SimplifiedProduct> => {
  const productData = await fetchProductDetails(productId, vendorCode, userCode);
  const product = productData.data.productDetails.product;
  return simplifyProduct(product);
};

/**
 * Scrapes a product and returns both full and simplified data
 * @param productId - The unique product identifier
 * @param vendorCode - Vendor code (optional)
 * @param userCode - User code (optional)
 * @returns Object containing both full and simplified product data
 */
export const scrapeProductFull = async (
  productId: string,
  vendorCode?: string,
  userCode?: string
): Promise<{
  full: ProductDetailsResponse;
  simplified: SimplifiedProduct;
}> => {
  const productData = await fetchProductDetails(productId, vendorCode, userCode);
  const product = productData.data.productDetails.product;
  const simplified = simplifyProduct(product);

  return {
    full: productData,
    simplified,
  };
};

// ============================================================================
// File Operations
// ============================================================================

/**
 * Saves data to a JSON file
 */
export const saveToFile = async (
  data: ProductDetailsResponse | SimplifiedProduct,
  filename: string
): Promise<void> => {
  await Bun.write(filename, JSON.stringify(data, null, 2));
};

/**
 * Scrapes a product and saves it to files
 * @param productId - The unique product identifier
 * @param baseFilename - Base filename without extension
 * @param vendorCode - Vendor code (optional)
 * @param userCode - User code (optional)
 */
export const scrapeAndSaveProduct = async (
  productId: string,
  baseFilename: string,
  vendorCode?: string,
  userCode?: string
): Promise<SimplifiedProduct> => {
  const { full, simplified } = await scrapeProductFull(
    productId,
    vendorCode,
    userCode
  );

  await saveToFile(full, `${baseFilename}-full.json`);
  await saveToFile(simplified, `${baseFilename}-simple.json`);

  return simplified;
};
