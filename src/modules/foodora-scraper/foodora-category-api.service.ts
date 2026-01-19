/**
 * Foodora Category API Service
 * Handles API communication for fetching products by category
 */

import { categoryProductListResponseSchema } from "./foodora-category.schemas.ts";
import type {
  CategoryProductListResponse,
  CategoryProductsVariables,
} from "./foodora-category.types.ts";
import {
  FOODORA_API_URL,
  DEFAULT_VENDOR_CODE,
  DEFAULT_USER_CODE,
  DEFAULT_GLOBAL_ENTITY_ID,
  DEFAULT_LOCALE,
  DEFAULT_FEATURE_FLAGS,
} from "./foodora.constants.ts";
import { CATEGORY_PRODUCTS_QUERY } from "./foodora-category.queries.ts";
import {
  generatePerseusClientId,
  generatePerseusSessionId,
  generateDpsSessionId,
  createScraperHeaders,
} from "./foodora.utils.ts";

// ============================================================================
// Constants
// ============================================================================

const DEFAULT_ATTRIBUTES = [
  "baseContentValue",
  "baseUnit",
  "freshnessGuaranteeInDays",
  "maximumSalesQuantity",
  "minPriceLastMonth",
  "pricePerBaseUnit",
  "sku",
  "nutri_grade",
  "sugar_level",
];

const DEFAULT_SORT = "Recommended";
const DEFAULT_FILTER_ON_SALE = false;
const DEFAULT_IS_DARKSTORE = false;

// ============================================================================
// Variables Creation
// ============================================================================

/**
 * Creates GraphQL variables for category products query
 */
const createCategoryProductsVariables = (
  categoryId: string,
  vendorCode: string,
  userCode: string
): CategoryProductsVariables => {
  return {
    attributes: DEFAULT_ATTRIBUTES,
    categoryId,
    featureFlags: DEFAULT_FEATURE_FLAGS,
    filterOnSale: DEFAULT_FILTER_ON_SALE,
    globalEntityId: DEFAULT_GLOBAL_ENTITY_ID,
    isDarkstore: DEFAULT_IS_DARKSTORE,
    locale: DEFAULT_LOCALE,
    sort: DEFAULT_SORT,
    userCode,
    vendorID: vendorCode,
  };
};

// ============================================================================
// API Functions
// ============================================================================

/**
 * Fetches all products for a specific category from Foodora GraphQL API
 * @param categoryId - The category ID to fetch products from
 * @param vendorCode - Vendor code (default: "o7b0")
 * @param userCode - User code (default: "cz6a15cx")
 * @returns Validated category product list with all products
 */
export const fetchCategoryProducts = async (
  categoryId: string,
  vendorCode: string = DEFAULT_VENDOR_CODE,
  userCode: string = DEFAULT_USER_CODE
): Promise<CategoryProductListResponse> => {
  const perseusClientId = generatePerseusClientId();
  const perseusSessionId = generatePerseusSessionId();

  // Category API doesn't need dps-session-id
  const headers = {
    "User-Agent":
      "Mozilla/5.0 (Macintosh; Intel Mac OS X 10.15; rv:146.0) Gecko/20100101 Firefox/146.0",
    "Accept": "application/json",
    "Accept-Language": "en-US,en;q=0.5",
    "Accept-Encoding": "gzip, deflate, br, zstd",
    "Referer": "https://www.foodora.cz/",
    "Content-Type": "application/json;charset=utf-8",
    "perseus-client-id": perseusClientId,
    "perseus-session-id": perseusSessionId,
    "X-PD-Language-ID": "3",
    "X-Requested-With": "XMLHttpRequest",
    "apollographql-client-name": "web",
    "apollographql-client-version": "GROCERIES-MENU-MICROFRONTEND.26.03.0016",
    "platform": "web",
    "Origin": "https://www.foodora.cz",
    "Sec-GPC": "1",
    "Connection": "keep-alive",
    "Sec-Fetch-Dest": "empty",
    "Sec-Fetch-Mode": "cors",
    "Sec-Fetch-Site": "cross-site",
  };

  const variables = createCategoryProductsVariables(
    categoryId,
    vendorCode,
    userCode
  );

  const response = await fetch(FOODORA_API_URL, {
    method: "POST",
    headers,
    body: JSON.stringify({
      query: CATEGORY_PRODUCTS_QUERY,
      variables,
    }),
  });

  if (!response.ok) {
    throw new Error(`HTTP error! status: ${response.status}`);
  }

  const data = await response.json();

  // Debug: Log the response to see what we're getting
  if (!data?.data?.categoryProductList?.categoryProducts) {
    console.error("API Response:", JSON.stringify(data, null, 2));
    console.error("Category ID:", categoryId);
    console.error("Variables:", JSON.stringify(variables, null, 2));
  }

  // Validate response with Zod
  return categoryProductListResponseSchema.parse(data);
};
