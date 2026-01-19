/**
 * Store Types
 * Supported stores for product scraping
 */

export const STORE_TYPES = {
  BILLA: 'BILLA',
  FOODORA: 'FOODORA',
} as const;

export type StoreType = typeof STORE_TYPES[keyof typeof STORE_TYPES];

/**
 * Vendor Types for Foodora Stores
 * Different Foodora vendors have different product inventories
 */

export const FOODORA_VENDOR_TYPES = {
  BILLA_PROSEK: 'mjul',
  ALBERT_FLORENC: 'obc6',
  DMART: 'o7b0',
} as const;

export type FoodoraVendorType = typeof FOODORA_VENDOR_TYPES[keyof typeof FOODORA_VENDOR_TYPES];
