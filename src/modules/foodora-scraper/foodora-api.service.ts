/**
 * Foodora API Service
 * Handles all API communication with Foodora GraphQL endpoint
 */

import { productDetailsResponseSchema } from "./foodora.schemas.ts";
import type {
  GraphQLVariables,
  ScraperConfig,
  ProductDetailsResponse,
} from "./foodora.types.ts";
import {
  FOODORA_API_URL,
  DEFAULT_VENDOR_CODE,
  DEFAULT_USER_CODE,
  DEFAULT_GLOBAL_ENTITY_ID,
  DEFAULT_LOCALE,
  DEFAULT_FEATURE_FLAGS,
  DEFAULT_CROSS_SELL_COMPLIANCE_LEVEL,
  DEFAULT_CROSS_SELL_IS_DARKSTORE,
  DEFAULT_INCLUDE_CROSS_SELL,
} from "./foodora.constants.ts";
import { PRODUCT_DETAILS_QUERY } from "./foodora.queries.ts";
import {
  generatePerseusClientId,
  generatePerseusSessionId,
  generateDpsSessionId,
  createScraperHeaders,
} from "./foodora.utils.ts";

// ============================================================================
// Configuration
// ============================================================================

/**
 * Creates a complete scraper configuration with headers and query
 */
const createScraperConfig = (): ScraperConfig => {
  const perseusClientId = generatePerseusClientId();
  const perseusSessionId = generatePerseusSessionId();
  const dpsSessionId = generateDpsSessionId(perseusClientId);

  return {
    apiUrl: FOODORA_API_URL,
    headers: createScraperHeaders(perseusClientId, perseusSessionId, dpsSessionId),
    query: PRODUCT_DETAILS_QUERY,
  };
};

// ============================================================================
// Variables Creation
// ============================================================================

/**
 * Creates GraphQL variables for product details query
 */
const createProductDetailsVariables = (
  productId: string,
  vendorCode: string,
  userCode: string
): GraphQLVariables => {
  return {
    featureFlags: DEFAULT_FEATURE_FLAGS,
    globalEntityId: DEFAULT_GLOBAL_ENTITY_ID,
    locale: DEFAULT_LOCALE,
    userCode: userCode,
    vendorCode: vendorCode,
    productIdentifier: {
      type: "ID",
      value: productId,
    },
    crossSellProductsComplianceLevel: DEFAULT_CROSS_SELL_COMPLIANCE_LEVEL,
    crossSellProductsIsDarkstore: DEFAULT_CROSS_SELL_IS_DARKSTORE,
    includeCrossSell: DEFAULT_INCLUDE_CROSS_SELL,
  };
};

// ============================================================================
// API Functions
// ============================================================================

/**
 * Fetches product details from Foodora GraphQL API
 * @param productId - The unique product identifier
 * @param vendorCode - Vendor code (default: "o7b0")
 * @param userCode - User code (default: "cz6a15cx")
 * @returns Validated product details with pricing and availability
 */
export const fetchProductDetails = async (
  productId: string,
  vendorCode: string = DEFAULT_VENDOR_CODE,
  userCode: string = DEFAULT_USER_CODE
): Promise<ProductDetailsResponse> => {
  const config = createScraperConfig();
  const variables = createProductDetailsVariables(productId, vendorCode, userCode);

  const response = await fetch(config.apiUrl, {
    method: "POST",
    headers: config.headers,
    body: JSON.stringify({
      query: config.query,
      variables: variables,
    }),
  });

  if (!response.ok) {
    throw new Error(`HTTP error! status: ${response.status}`);
  }

  const data = await response.json();

  // Validate response with Zod
  return productDetailsResponseSchema.parse(data);
};
