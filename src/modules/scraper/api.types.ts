/**
 * API Response Types - maps the Billa API response structure
 */

export interface BillaApiResponse {
  facets: Facet[];
  count: number;
  offset: number;
  total: number;
  results: ProductResult[];
  isTotalTruncated: boolean;
}

export interface Facet {
  type: string;
  key: string;
  label: string;
  [key: string]: any;
}

export interface ProductResult {
  amount: string;
  brand?: Brand;
  bundleInfo: string;
  category: string;
  conversionFactor: number;
  descriptionLong: string;
  descriptionShort: string;
  inPromotion: boolean;
  images: string[];
  name: string;
  packageLabel: string;
  packageLabelKey?: string;
  parentCategories: CategoryInfo[][];
  price: Price;
  productId: string;
  medical: boolean;
  sku: string;
  slug: string;
  upsellSku: string;
  published: boolean;
  purchased: boolean;
  volumeLabelKey: string;
  volumeLabelLong?: string;
  volumeLabelShort: string;
  weight: number;
  weightArticle: boolean;
  weightPieceArticle: boolean;
  weightPerPiece: number;
  brandMarketing: string;
  productMarketing: string;
  regulatedProductName: string;
  badges?: string[];
}

export interface Brand {
  name: string;
  slug: string;
}

export interface Price {
  baseUnitLong?: string;
  baseUnitShort?: string;
  basePriceFactor?: string;
  regular?: {
    value: number;
    perStandardizedQuantity: number;
    promotionValue?: number;
    tags?: string[];
  };
  crossed?: number;
  discountPercentage?: number;
  lowestPrice?: number;
}

export interface PriceUnit {
  price: number;
  unit: string;
}

/**
 * Category information from API
 */
export interface CategoryInfo {
  key: string;
  name: string;
  slug: string;
  orderHint: string;
}

/**
 * Category mapping type (for file-based categories)
 */
export interface Category {
  name: string;
  slug: string;
}
