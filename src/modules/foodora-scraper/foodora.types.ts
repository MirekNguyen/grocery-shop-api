/**
 * Foodora API Type Definitions
 * All types inferred from Zod schemas for type safety
 */

import { z } from "zod";
import {
  productAttributeSchema,
  activeCampaignSchema,
  productBadgeSchema,
  weightValueSchema,
  weightableAttributesSchema,
  foodLabellingInfoSchema,
  foodLabellingSchema,
  productSchema,
  shopItemSchema,
  shopItemsListSchema,
  pageInfoSchema,
  trackingSchema,
  crossSellProductsSchema,
  productDetailsSchema,
  productDetailsResponseSchema,
} from "./foodora.schemas.ts";

// ============================================================================
// Zod-Inferred Types
// ============================================================================

export type ProductAttribute = z.infer<typeof productAttributeSchema>;
export type ActiveCampaign = z.infer<typeof activeCampaignSchema>;
export type ProductBadge = z.infer<typeof productBadgeSchema>;
export type WeightValue = z.infer<typeof weightValueSchema>;
export type WeightableAttributes = z.infer<typeof weightableAttributesSchema>;
export type FoodLabellingInfo = z.infer<typeof foodLabellingInfoSchema>;
export type FoodLabelling = z.infer<typeof foodLabellingSchema>;
export type Product = z.infer<typeof productSchema>;
export type ShopItem = z.infer<typeof shopItemSchema>;
export type ShopItemsList = z.infer<typeof shopItemsListSchema>;
export type PageInfo = z.infer<typeof pageInfoSchema>;
export type Tracking = z.infer<typeof trackingSchema>;
export type CrossSellProducts = z.infer<typeof crossSellProductsSchema>;
export type ProductDetails = z.infer<typeof productDetailsSchema>;
export type ProductDetailsResponse = z.infer<typeof productDetailsResponseSchema>;

// ============================================================================
// Request Types
// ============================================================================

export type ProductIdentifier = {
  type: "ID";
  value: string;
};

export type FeatureFlag = {
  key: string;
  value: string;
};

export type GraphQLVariables = {
  featureFlags: FeatureFlag[];
  globalEntityId: string;
  locale: string;
  userCode: string;
  vendorCode: string;
  productIdentifier: ProductIdentifier;
  crossSellProductsComplianceLevel: number;
  crossSellProductsIsDarkstore: boolean;
  includeCrossSell: boolean;
  attributes?: string[];
};

export type ScraperHeaders = {
  [key: string]: string;
};

export type ScraperConfig = {
  apiUrl: string;
  headers: ScraperHeaders;
  query: string;
};

// ============================================================================
// Simplified Product Type
// ============================================================================

export type SimplifiedProduct = {
  id: string;
  name: string;
  description: string;
  price: number;
  originalPrice: number;
  discount: number | null;
  discountPercentage: number | null;
  isAvailable: boolean;
  type: string;
  imageUrl: string | null;
  sku: string | null;
  brand: string | null;
  pricePerUnit: string | null;
  stock: string;
  campaigns: {
    name: string;
    discountValue: number;
    discountType: string;
    endTime: string;
  }[];
  allergens: string[];
  nutritionFacts: { [key: string]: string };
  weight: {
    value: number;
    unit: string;
  } | null;
};
