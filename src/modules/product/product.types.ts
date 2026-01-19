/**
 * Store Types
 * Each Foodora vendor is treated as its own store
 */

export const STORE_TYPES = {
  BILLA: 'BILLA',
  FOODORA_BILLA_PROSEK: 'FOODORA_BILLA_PROSEK',    // mjul
  FOODORA_ALBERT_FLORENC: 'FOODORA_ALBERT_FLORENC', // obc6
  FOODORA_DMART: 'FOODORA_DMART',                    // o7b0
} as const;

export type StoreType = typeof STORE_TYPES[keyof typeof STORE_TYPES];

/**
 * Vendor codes for Foodora API calls
 */
export const FOODORA_VENDOR_CODES = {
  BILLA_PROSEK: 'mjul',
  ALBERT_FLORENC: 'obc6',
  DMART: 'o7b0',
} as const;

export type FoodoraVendorCode = typeof FOODORA_VENDOR_CODES[keyof typeof FOODORA_VENDOR_CODES];
