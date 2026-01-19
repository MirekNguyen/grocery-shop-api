/**
 * Foodora Category Products Zod Schemas
 * Runtime validation schemas for category product list responses
 */

import { z } from "zod";
import { productAttributeSchema, activeCampaignSchema, productBadgeSchema, weightableAttributesSchema } from "./foodora.schemas.ts";

// ============================================================================
// Category Product Schemas
// ============================================================================

export const categoryProductItemSchema = z.object({
  attributes: z.array(productAttributeSchema).nullable(),
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
});

export const categoryProductGroupSchema = z.object({
  id: z.string(),
  name: z.string(),
  items: z.array(categoryProductItemSchema),
});

export const categoryProductListResponseSchema = z.object({
  data: z.object({
    categoryProductList: z.object({
      categoryProducts: z.array(categoryProductGroupSchema).nullable(),
    }),
  }),
});
