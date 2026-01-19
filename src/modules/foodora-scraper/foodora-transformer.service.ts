/**
 * Foodora Product Transformation Service
 * Transforms raw API data into simplified product format
 */

import type {
  Product,
  ProductAttribute,
  ActiveCampaign,
  WeightableAttributes,
  FoodLabelling,
  SimplifiedProduct,
} from "./foodora.types.ts";

// ============================================================================
// Attribute Extraction
// ============================================================================

/**
 * Finds an attribute value from product attributes array
 */
const findAttributeValue = (
  attributes: ProductAttribute[],
  key: string
): string | null => {
  const attr = attributes.find((a) => a.key === key);
  return attr?.value ?? null;
};

// ============================================================================
// Price Calculations
// ============================================================================

/**
 * Calculates discount amount from original and current price
 */
const calculateDiscount = (
  originalPrice: number,
  price: number
): number | null => {
  return originalPrice > price ? originalPrice - price : null;
};

/**
 * Calculates discount percentage
 */
const calculateDiscountPercentage = (
  discount: number | null,
  originalPrice: number
): number | null => {
  return discount ? Math.round((discount / originalPrice) * 100) : null;
};

// ============================================================================
// Campaign Extraction
// ============================================================================

/**
 * Extracts simplified campaign information
 */
const extractCampaigns = (
  activeCampaigns: ActiveCampaign[] | null
): SimplifiedProduct["campaigns"] => {
  if (!activeCampaigns) {
    return [];
  }

  return activeCampaigns.map((campaign) => ({
    name: campaign.name,
    discountValue: campaign.discountValue,
    discountType: campaign.discountType,
    endTime: campaign.endTime,
  }));
};

// ============================================================================
// Food Labelling Extraction
// ============================================================================

/**
 * Extracts allergen information from food labelling
 */
const extractAllergens = (foodLabelling: FoodLabelling | undefined): string[] => {
  if (!foodLabelling?.allergens) {
    return [];
  }

  return foodLabelling.allergens.flatMap((a) => a.labelValues);
};

/**
 * Extracts nutrition facts as key-value pairs
 */
const extractNutritionFacts = (
  foodLabelling: FoodLabelling | undefined
): { [key: string]: string } => {
  const nutritionFacts: { [key: string]: string } = {};

  if (!foodLabelling?.nutritionFacts) {
    return nutritionFacts;
  }

  foodLabelling.nutritionFacts.forEach((fact) => {
    nutritionFacts[fact.labelTitle] = fact.labelValues.join(", ");
  });

  return nutritionFacts;
};

// ============================================================================
// Weight Extraction
// ============================================================================

/**
 * Extracts weight information
 */
const extractWeight = (
  weightableAttributes: WeightableAttributes | null
): SimplifiedProduct["weight"] => {
  if (!weightableAttributes) {
    return null;
  }

  return {
    value: weightableAttributes.weightValue.value,
    unit: weightableAttributes.weightValue.unit,
  };
};

// ============================================================================
// Stock Status
// ============================================================================

/**
 * Determines stock status from product availability
 */
const determineStockStatus = (
  isAvailable: boolean,
  stockAmount: number
): string => {
  if (!isAvailable) {
    return "Out of Stock";
  }

  return stockAmount > 0 ? `${stockAmount} units` : "In Stock";
};

// ============================================================================
// Main Transformation Function
// ============================================================================

/**
 * Transforms full product data into simplified format
 * Extracts essential information for easier consumption
 */
export const simplifyProduct = (product: Product): SimplifiedProduct => {
  const sku = findAttributeValue(product.attributes, "sku");
  const brand = findAttributeValue(product.attributes, "brand");
  const pricePerUnitValue = findAttributeValue(product.attributes, "pricePerBaseUnit");
  const baseUnit = findAttributeValue(product.attributes, "baseUnit");

  const discount = calculateDiscount(product.originalPrice, product.price);
  const discountPercentage = calculateDiscountPercentage(discount, product.originalPrice);

  const pricePerUnit =
    pricePerUnitValue && baseUnit
      ? `${pricePerUnitValue} Kč/${baseUnit}`
      : null;

  return {
    id: product.productID,
    name: product.name,
    description: product.description,
    price: product.price,
    originalPrice: product.originalPrice,
    discount,
    discountPercentage,
    isAvailable: product.isAvailable,
    type: product.type,
    imageUrl: product.urls[0] ?? null,
    sku,
    brand,
    pricePerUnit,
    stock: determineStockStatus(product.isAvailable, product.stockAmount),
    campaigns: extractCampaigns(product.activeCampaigns),
    allergens: extractAllergens(product.foodLabelling),
    nutritionFacts: extractNutritionFacts(product.foodLabelling),
    weight: extractWeight(product.weightableAttributes),
  };
};
