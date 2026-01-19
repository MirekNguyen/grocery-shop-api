/**
 * Foodora API Zod Schemas
 * Runtime validation schemas for all API responses
 */

import { z } from "zod";

// ============================================================================
// Product Schemas
// ============================================================================

export const productAttributeSchema = z.object({
  key: z.string(),
  value: z.string(),
});

export const activeCampaignSchema = z.object({
  benefitQuantity: z.number(),
  cartItemUsageLimit: z.number().nullable(),
  description: z.string(),
  discountType: z.string(),
  discountValue: z.number(),
  endTime: z.string(),
  id: z.string(),
  isAutoAddable: z.boolean(),
  isBenefit: z.boolean(),
  isTrigger: z.boolean(),
  name: z.string(),
  teaserFormat: z.string().nullable(),
  totalTriggerThresholdFloat: z.number().nullable(),
  triggerQuantity: z.number(),
  type: z.string(),
});

export const productBadgeSchema = z.object({
  text: z.string(),
  type: z.string(),
});

export const weightValueSchema = z.object({
  unit: z.string(),
  value: z.number(),
});

export const weightableAttributesSchema = z.object({
  weightedOriginalPrice: z.number(),
  weightedPrice: z.number(),
  weightValue: weightValueSchema,
});

export const foodLabellingInfoSchema = z.object({
  labelTitle: z.string(),
  labelValues: z.array(z.string()),
});

export const foodLabellingSchema = z.object({
  additives: z.array(foodLabellingInfoSchema).nullable(),
  allergens: z.array(foodLabellingInfoSchema).nullable(),
  nutritionFacts: z.array(foodLabellingInfoSchema).nullable(),
  productClaims: z.array(foodLabellingInfoSchema).nullable(),
  productInfos: z.array(foodLabellingInfoSchema).nullable(),
  warnings: z.array(foodLabellingInfoSchema).nullable(),
});

export const productSchema = z.object({
  attributes: z.array(productAttributeSchema),
  activeCampaigns: z.array(activeCampaignSchema).nullable(),
  badges: z.array(z.string()),
  description: z.string(),
  favourite: z.boolean(),
  globalCatalogID: z.string(),
  isAvailable: z.boolean(),
  name: z.string(),
  nmrAdID: z.string(),
  originalPrice: z.number(),
  packagingCharge: z.number(),
  parentID: z.string(),
  price: z.number(),
  productBadges: z.array(productBadgeSchema).nullable(),
  productID: z.string(),
  stockAmount: z.number(),
  stockPrediction: z.string(),
  tags: z.array(z.string()),
  type: z.string(),
  urls: z.array(z.string()),
  vendorID: z.string(),
  weightableAttributes: weightableAttributesSchema.nullable(),
  foodLabelling: foodLabellingSchema.optional(),
});

// ============================================================================
// Cross-Sell & Shop Items Schemas
// ============================================================================

export const shopItemSchema = z.object({
  __typename: z.string(),
}).passthrough();

export const shopItemsListSchema = z.object({
  headline: z.string(),
  localizedHeadline: z.string(),
  requestID: z.string(),
  shopItemID: z.string(),
  shopItems: z.array(shopItemSchema),
  shopItemType: z.string(),
  swimlaneFilterType: z.string(),
  trackingID: z.string(),
  swimlaneTrackingKey: z.string(),
});

export const pageInfoSchema = z.object({
  isLast: z.boolean(),
  pageNumber: z.number(),
});

export const trackingSchema = z.object({
  experimentID: z.string(),
  experimentVariation: z.string(),
});

export const crossSellProductsSchema = z.object({
  shopItemsList: z.array(shopItemsListSchema),
  pageInfo: pageInfoSchema.nullable(),
  tracking: trackingSchema,
});

// ============================================================================
// Response Schemas
// ============================================================================

export const productDetailsSchema = z.object({
  crossSellProducts: crossSellProductsSchema,
  product: productSchema,
});

export const productDetailsResponseSchema = z.object({
  data: z.object({
    productDetails: productDetailsSchema,
  }),
});
