/**
 * Foodora Category Types
 * Type definitions for category-related data
 */

import { z } from "zod";
import {
  categoryProductItemSchema,
  categoryProductGroupSchema,
  categoryProductListResponseSchema,
} from "./foodora-category.schemas.ts";

// ============================================================================
// Zod-Inferred Types
// ============================================================================

export type CategoryProductItem = z.infer<typeof categoryProductItemSchema>;
export type CategoryProductGroup = z.infer<typeof categoryProductGroupSchema>;
export type CategoryProductListResponse = z.infer<typeof categoryProductListResponseSchema>;

// ============================================================================
// Category Definition Types
// ============================================================================

export type CategoryDefinition = {
  id: string;
  name: string;
  numberOfProducts: number;
  children?: CategoryDefinition[];
  productTags?: string[];
  imageUrls?: string[];
  type: string;
};

// ============================================================================
// Request Types
// ============================================================================

export type CategoryProductsVariables = {
  attributes: string[];
  categoryId: string;
  featureFlags: { key: string; value: string }[];
  filterOnSale: boolean;
  globalEntityId: string;
  isDarkstore: boolean;
  locale: string;
  sort: string;
  userCode: string;
  vendorID: string;
};
