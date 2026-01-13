// Product and Category types matching the database schema

export interface Category {
  id: number;
  key: string;
  name: string;
  slug: string;
  orderHint: string;
  createdAt: Date;
  updatedAt: Date;
}

export interface Product {
  id: number;
  productId: string;
  sku: string;
  slug: string;
  name: string;
  descriptionShort: string | null;
  descriptionLong: string | null;
  regulatedProductName: string | null;
  category: string;
  categorySlug: string;
  brand: string | null;
  brandSlug: string | null;
  price: number | null; // in cents
  pricePerUnit: number | null; // in cents
  unitPrice: number | null;
  regularPrice: number | null; // in cents
  discountPrice: number | null; // in cents
  lowestPrice: number | null; // in cents
  inPromotion: boolean;
  amount: string;
  weight: number | null;
  packageLabel: string | null;
  packageLabelKey: string | null;
  volumeLabelKey: string | null;
  volumeLabelShort: string | null;
  images: string[];
  productMarketing: string | null;
  brandMarketing: string | null;
  published: boolean;
  medical: boolean;
  weightArticle: boolean;
  scrapedAt: Date;
  updatedAt: Date;
}

export interface ProductWithCategories extends Product {
  categories: Category[];
}

// Helper function to format price from cents to string
export const formatPrice = (priceInCents: number | null): string => {
  if (priceInCents === null) return 'N/A';
  return `${(priceInCents / 100).toFixed(2)} Kč`;
};

// Helper to check if product is on sale
export const isOnSale = (product: Product): boolean => {
  return product.inPromotion && product.discountPrice !== null;
};

// Helper to calculate discount percentage
export const getDiscountPercentage = (product: Product): number | null => {
  if (!product.discountPrice || !product.price) return null;
  return Math.round(((product.discountPrice - product.price) / product.discountPrice) * 100);
};
